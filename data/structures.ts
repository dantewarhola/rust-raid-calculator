/**
 * Structure definitions: HP and "quantity of explosive X required to
 * destroy" for every raidable target the calculator supports.
 *
 * DATA SOURCE: rusthelp.com destroy tables (cross-checked against the
 * rustlabs.com tables mirrored at wiki.rustclash.com). Verified
 * 2026-07-03 — including Propane Explosive Bomb (deployed) counts and
 * the current Armored Door stats (1000 HP / 3 C4 / 5 rockets).
 * Beancan counts are averages (beancans have a random fuse and can
 * dud, so real-world counts vary). A `null` quantity means the tool
 * is impractical or deals no meaningful damage to that target and the UI
 * renders it as "—".
 *
 * All standard building blocks of a tier (wall, foundation, floor, roof,
 * doorway, window frame, wall frame) share the same HP and explosive
 * requirements, which is why quantities are stored once per tier and
 * reused across structure kinds.
 */

import type { ExplosiveId } from "./explosives";

export type StructureCategory = "building" | "door";

export type QuantityTable = Record<ExplosiveId, number | null>;

export interface StructureDef {
  id: string;
  name: string;
  /** Building tier or door type — used for grouping in the UI. */
  tier: "Wood" | "Stone" | "Sheet Metal" | "Armored";
  kind: string;
  category: StructureCategory;
  hp: number;
  icon: string;
  /** Explosives required to destroy one unit (hard side). */
  toDestroy: QuantityTable;
}

/* ------------------------------------------------------------------ */
/* Per-tier explosive requirements for standard building blocks        */
/* ------------------------------------------------------------------ */

const WOOD_BLOCK: QuantityTable = {
  c4: 1,
  rocket: 2,
  satchel: 3,
  beancan: 13,
  explosiveAmmo: 49,
  hvRocket: 6,
  incendiaryRocket: 2,
  propaneBomb: 2,
};

const STONE_BLOCK: QuantityTable = {
  c4: 2,
  rocket: 4,
  satchel: 10,
  beancan: 46,
  explosiveAmmo: 185,
  hvRocket: null, // negligible damage — not a real option
  incendiaryRocket: null,
  propaneBomb: 4,
};

const SHEET_BLOCK: QuantityTable = {
  c4: 4,
  rocket: 8,
  satchel: 23,
  beancan: 112,
  explosiveAmmo: 400,
  hvRocket: null,
  incendiaryRocket: null,
  propaneBomb: 8,
};

const ARMORED_BLOCK: QuantityTable = {
  c4: 8,
  rocket: 15,
  satchel: 46,
  beancan: 223,
  explosiveAmmo: 799,
  hvRocket: null,
  incendiaryRocket: null,
  propaneBomb: 15,
};

/* ------------------------------------------------------------------ */
/* Doors                                                               */
/* ------------------------------------------------------------------ */

const WOODEN_DOOR: QuantityTable = {
  c4: 1,
  rocket: 1,
  satchel: 2,
  beancan: 6,
  explosiveAmmo: 16,
  hvRocket: 9,
  incendiaryRocket: 1,
  propaneBomb: 2,
};

const SHEET_DOOR: QuantityTable = {
  c4: 1,
  rocket: 2,
  satchel: 4,
  beancan: 18,
  explosiveAmmo: 63,
  hvRocket: 11,
  incendiaryRocket: null,
  propaneBomb: 2,
};

const GARAGE_DOOR: QuantityTable = {
  c4: 2,
  rocket: 3,
  satchel: 9,
  beancan: 42,
  explosiveAmmo: 150,
  hvRocket: 25,
  incendiaryRocket: null,
  propaneBomb: 5,
};

const ARMORED_DOOR: QuantityTable = {
  c4: 3,
  rocket: 5,
  satchel: 15,
  beancan: 69,
  explosiveAmmo: 250,
  hvRocket: 42,
  incendiaryRocket: null,
  propaneBomb: 8,
};

/* ------------------------------------------------------------------ */
/* Structure catalog                                                   */
/* ------------------------------------------------------------------ */

const TIERS = [
  { tier: "Wood", hp: 250, table: WOOD_BLOCK, iconSuffix: "wood" },
  { tier: "Stone", hp: 500, table: STONE_BLOCK, iconSuffix: "stone" },
  { tier: "Sheet Metal", hp: 1000, table: SHEET_BLOCK, iconSuffix: "metal" },
  { tier: "Armored", hp: 2000, table: ARMORED_BLOCK, iconSuffix: "armored" },
] as const;

const BLOCK_KINDS = [
  { kind: "Wall", slug: "wall" },
  { kind: "Doorway", slug: "doorway" },
  { kind: "Floor / Roof", slug: "floor" },
  { kind: "Window Frame", slug: "window" },
] as const;

const buildingBlocks: StructureDef[] = TIERS.flatMap((t) =>
  BLOCK_KINDS.map((k) => ({
    id: `${t.iconSuffix}-${k.slug}`,
    name: `${t.tier} ${k.kind}`,
    tier: t.tier,
    kind: k.kind,
    category: "building" as const,
    hp: t.hp,
    icon: `${k.slug}-${t.iconSuffix}`,
    toDestroy: t.table,
  })),
);

const doors: StructureDef[] = [
  {
    id: "door-wood",
    name: "Wooden Door",
    tier: "Wood",
    kind: "Door",
    category: "door",
    hp: 200,
    icon: "door-wood",
    toDestroy: WOODEN_DOOR,
  },
  {
    id: "door-metal",
    name: "Sheet Metal Door",
    tier: "Sheet Metal",
    kind: "Door",
    category: "door",
    hp: 250,
    icon: "door-metal",
    toDestroy: SHEET_DOOR,
  },
  {
    id: "door-garage",
    name: "Garage Door",
    tier: "Sheet Metal",
    kind: "Door",
    category: "door",
    hp: 600,
    icon: "door-garage",
    toDestroy: GARAGE_DOOR,
  },
  {
    id: "door-armored",
    name: "Armored Door",
    tier: "Armored",
    kind: "Door",
    category: "door",
    hp: 1000,
    icon: "door-armored",
    toDestroy: ARMORED_DOOR,
  },
];

export const STRUCTURES: readonly StructureDef[] = [...buildingBlocks, ...doors];

export const STRUCTURE_BY_ID: Record<string, StructureDef> = Object.fromEntries(
  STRUCTURES.map((s) => [s.id, s]),
);
