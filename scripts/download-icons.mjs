/**
 * Icon fetcher — run with `npm run icons` (or `node scripts/download-icons.mjs`).
 *
 * Downloads official Rust item sprites into /public/icons by item
 * shortname, trying a list of community CDN mirrors in order
 * (rustlabs / rustclash item-icon set, rusthelp icon set).
 *
 * Building blocks (walls, doorways, floors, window frames) are not
 * inventory items and have no shortname sprites, so themed SVG
 * placeholders are generated for them — and for any item whose
 * download fails, ensuring the app never shows a broken image.
 *
 * The <ItemIcon> component tries `{name}.png` first and falls back to
 * `{name}.svg`, so downloaded sprites always win over placeholders.
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

async function download(shortname) {
  for (const base of CDN_BASES) {
    const url = base(shortname);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok && (res.headers.get("content-type") ?? "").includes("image")) {
        return Buffer.from(await res.arrayBuffer());
      }
    } catch {
      // try next mirror
    }
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

  // 2. Building-block placeholders (no official sprite exists for these).
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
