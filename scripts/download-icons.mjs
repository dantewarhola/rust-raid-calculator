/**
 * Icon fetcher — run with `npm run icons` (or `node scripts/download-icons.mjs`).
 *
 * Downloads official Rust item sprites into /public/icons by item
 * shortname, trying a list of community CDN mirrors in order
 * (rustlabs / rustclash item-icon set, rusthelp icon set).
 *
 * Building blocks (walls, doorways, floors, window frames) are not
 * inventory items and have no shortname sprites; their renders are
 * fetched as WEBP from the rusthelp.com CDN by building slug. Themed
 * SVG placeholders are still generated as a fallback for any icon
 * whose download fails, ensuring the app never shows a broken image.
 *
 * The <ItemIcon> component tries the real sprite extension first
 * (.png for items, .webp for blocks) and falls back to `{name}.svg`.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

/** CDN mirrors that host item sprites by shortname, tried in order. */
const CDN_BASES = [
  (s) => `https://wiki.rustclash.com/img/items180/${s}.png`,
  (s) => `https://rustlabs.com/img/items180/${s}.png`,
  (s) => `https://cdn.rusthelp.com/images/public/128/${s}.png`,
];

/** Some CDNs reject requests without browser-like headers. */
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Referer: "https://rusthelp.com/",
};

/** icon file name (matches data/*.ts `icon` fields) → Rust item shortname */
const ITEM_ICONS = {
  c4: "explosive.timed",
  rocket: "ammo.rocket.basic",
  satchel: "explosive.satchel",
  beancan: "grenade.beancan",
  "explosive-ammo": "ammo.rifle.explosive",
  "hv-rocket": "ammo.rocket.hv",
  "incendiary-rocket": "ammo.rocket.fire",
  sulfur: "sulfur",
  charcoal: "charcoal",
  "metal-fragments": "metal.fragments",
  "low-grade-fuel": "lowgradefuel",
  cloth: "cloth",
  "tech-trash": "techparts",
  "metal-pipe": "metalpipe",
  rope: "rope",
  "door-wood": "door.hinged.wood",
  "door-metal": "door.hinged.metal",
  "door-garage": "wall.frame.garagedoor",
  "door-armored": "door.hinged.toptier",
  jackhammer: "jackhammer",
  pickaxe: "pickaxe",
  "salvaged-icepick": "icepick.salvaged",
  "salvaged-axe": "axe.salvaged",
  "compound-bow": "bow.compound",
  "hv-arrow": "arrow.hv",
  autoturret: "autoturret",
  "propane-bomb": "catapult.ammo.explosive",
  "propane-tank": "propanetank",
};

/**
 * Building-block renders hosted on the rusthelp.com CDN, keyed by our
 * icon file name → rusthelp building slug. Served as WEBP.
 */
const BLOCK_ICON_BASE = (slug) => `https://cdn.rusthelp.com/images/256/${slug}.webp`;

const BLOCK_ICONS = {
  "wall-wood": "wood-wall",
  "wall-stone": "stone-wall",
  "wall-metal": "metal-wall",
  "wall-armored": "armored-wall",
  "floor-wood": "wood-floor",
  "floor-stone": "stone-floor",
  "floor-metal": "metal-floor",
  "floor-armored": "armored-floor",
  "doorway-wood": "wood-wall-doorway",
  "doorway-stone": "stone-wall-doorway",
  "doorway-metal": "metal-wall-doorway",
  "doorway-armored": "armored-wall-doorway",
  "window-wood": "wood-wall-window",
  "window-stone": "stone-wall-window",
  "window-metal": "metal-wall-window",
  "window-armored": "armored-wall-window",
};

/** Building-block placeholder definitions: tier color + kind glyph. */
const TIER_COLORS = {
  wood: "#a8743d",
  stone: "#9a9a94",
  metal: "#6d7a86",
  armored: "#a03a2a",
};

const KIND_GLYPHS = {
  wall: '<rect x="14" y="14" width="36" height="36" rx="2"/>',
  doorway: '<path d="M14 50 V14 H50 V50 H40 V26 H24 V50 Z"/>',
  floor: '<path d="M8 32 L32 18 L56 32 L32 46 Z"/>',
  window: '<path d="M14 50 V14 H50 V50 H40 V38 H24 V50 Z M24 22 H40 V30 H24 Z" fill-rule="evenodd"/>',
};

function blockSvg(kind, tier) {
  const color = TIER_COLORS[tier];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="6" fill="#1a1a1a"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="5" fill="none" stroke="${color}" stroke-width="3"/>
  <g fill="${color}">${KIND_GLYPHS[kind]}</g>
</svg>`;
}

function fallbackSvg(name) {
  const label = name.replace(/-/g, " ").split(" ").map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="6" fill="#1a1a1a"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="5" fill="none" stroke="#ce422b" stroke-width="3"/>
  <text x="32" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#d9d2c5">${label}</text>
</svg>`;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/** PNG magic, or RIFF....WEBP container. Some CDNs serve octet-stream. */
function looksLikeImage(buffer) {
  if (buffer.length < 16) return false;
  if (buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return true;
  return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
}

async function fetchImage(url) {
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (looksLikeImage(buffer)) return buffer;
    }
  } catch {
    // caller decides fallback
  }
  return null;
}

async function download(shortname) {
  for (const base of CDN_BASES) {
    const buffer = await fetchImage(base(shortname));
    if (buffer) return buffer;
  }
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let downloaded = 0;
  let placeholders = 0;
  let skipped = 0;

  // 1. Item sprites from CDN mirrors.
  for (const [name, shortname] of Object.entries(ITEM_ICONS)) {
    const pngPath = path.join(OUT_DIR, `${name}.png`);
    if (await exists(pngPath)) {
      skipped++;
      continue;
    }
    const buffer = await download(shortname);
    if (buffer) {
      await writeFile(pngPath, buffer);
      console.log(`✓ ${name}.png  (${shortname})`);
      downloaded++;
    } else {
      await writeFile(path.join(OUT_DIR, `${name}.svg`), fallbackSvg(name));
      console.warn(`! ${name}: all mirrors failed — wrote SVG placeholder`);
      placeholders++;
    }
  }

  // 2. Building-block renders from the rusthelp CDN (WEBP).
  for (const [name, slug] of Object.entries(BLOCK_ICONS)) {
    const webpPath = path.join(OUT_DIR, `${name}.webp`);
    if (await exists(webpPath)) {
      skipped++;
      continue;
    }
    const buffer = await fetchImage(BLOCK_ICON_BASE(slug));
    if (buffer) {
      await writeFile(webpPath, buffer);
      console.log(`✓ ${name}.webp  (${slug})`);
      downloaded++;
    } else {
      console.warn(`! ${name}: CDN failed — SVG placeholder will be used`);
    }
  }

  // 3. Themed SVG placeholders as a safety net for every block icon.
  for (const kind of Object.keys(KIND_GLYPHS)) {
    for (const tier of Object.keys(TIER_COLORS)) {
      const file = path.join(OUT_DIR, `${kind}-${tier}.svg`);
      if (!(await exists(file))) {
        await writeFile(file, blockSvg(kind, tier));
        placeholders++;
      }
    }
  }

  console.log(`\nDone: ${downloaded} downloaded, ${placeholders} placeholders, ${skipped} already present.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
