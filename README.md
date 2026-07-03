# Rust Raid Calculator

A raid-planning tool for the game [Rust](https://rust.facepunch.com/): calculate raid costs, optimize
explosive crafting for sulfur efficiency, and look up soft-side / anti-turret raiding methods.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. All calculation logic runs
client-side — no backend, no database. Deployable to Vercel with zero configuration.

## Features

- **Raid Calculator** — enter how many walls, floors, doorways, windows, and doors (per tier) you
  need to destroy, pick a raid tool per structure, and get the explosive counts plus a raw-material
  shopping list (sulfur, charcoal, metal fragments, low grade fuel, cloth, tech trash, pipes, rope).
- **Explosive Optimizer** — enter the raw materials you have; a greedy damage-per-sulfur algorithm
  (see `lib/optimizer.ts`) returns the most raid damage you can craft, leftovers, and all-in
  alternatives per explosive.
- **Soft-Side & Turrets** — melee tool hit counts for soft-siding stone/sheet-metal structures
  (with durability math), plus every way to kill an Auto Turret including the sulfur-free
  compound-bow method.
- **Raid Chart Reference** — a static structure × explosive quantity chart mirroring the
  rustlabs raiding tables.

## Run locally

```bash
npm install
npm run icons   # one-time: download item sprites into public/icons (see below)
npm run dev     # http://localhost:3000
```

`npm run build` produces the production build.

## Deploy to Vercel

Push the repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new) — the defaults
work as-is (framework preset: Next.js). Or from the CLI:

```bash
npx vercel
```

No environment variables or `vercel.json` needed.

## Item icons

Official item sprites are **not** committed blindly from the repo owner's machine — they are fetched
by `scripts/download-icons.mjs` (`npm run icons`), which:

1. Downloads each item sprite by its Rust item shortname from community CDN mirrors
   (rustlabs / rustclash item-icon set, rusthelp icon set), trying each mirror in order.
2. Generates themed SVG placeholders for building blocks (walls, doorways, floors, window frames),
   which are not inventory items and have no official sprite.
3. Generates an SVG placeholder for any item whose download fails, so the UI never shows a broken
   image. The `<ItemIcon>` component tries `{name}.png` first and falls back to `{name}.svg`.

The downloaded icons in `public/icons/` are committed so Vercel deploys don't depend on the mirrors.
Re-run `npm run icons` after adding new items to `data/`.

## Updating game data

Every game number lives in typed constants under [`data/`](data/):

| File | Contents |
| --- | --- |
| `data/structures.ts` | Structure HP + explosives-to-destroy per structure per tool |
| `data/explosives.ts` | Crafting recipes broken down to raw materials, sulfur costs, damage values |
| `data/meleeRaiding.ts` | Soft-side hit counts and melee tool durability |
| `data/turrets.ts` | Auto Turret destruction methods |
| `data/resources.ts` | Raw resource definitions |

**Data source:** rustlabs.com raiding/crafting tables (mirrored at wiki.rustclash.com), transcribed
2026-07-03. Rust is patched monthly — when Facepunch rebalances, update the constants in `data/`
and everything else (calculators, optimizer, reference chart) recomputes automatically. Beancan
counts are averages (random fuses), and melee tool counts are planning estimates.

## Project structure

```
app/            App Router entry (layout, page, global styles)
components/     ItemIcon, ItemInput, ResultTable, ResourceSummary,
                RaidCalculator, CraftOptimizer, SoftSide, ReferenceChart, Tabs, Header
data/           All game data as typed TypeScript constants
lib/            Pure calculation logic (raid costs, crafting optimizer)
scripts/        Icon download script
public/icons/   Item sprites (downloaded) + generated block placeholders
```

## Disclaimer

Not affiliated with Facepunch Studios. Item art belongs to Facepunch; sprites are used for
non-commercial, informational purposes.
