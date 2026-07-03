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
  /**
   * Real per-hit damage where it differs from the linear hp/quantity
   * estimate. Needed for the cheapest-mix solver: a rocket deals ~220
   * to a sheet metal door (2 are needed only because 220 < 250), so
   * the true remainder after one rocket is 30 HP — 8 explosive ammo —
   * not the 125 HP the destroy count alone would suggest.
   */
  damage?: Partial<Record<ExplosiveId, number>>;
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
  propaneBomb: 2,
};

const STONE_BLOCK: QuantityTable = {
  c4: 2,
  rocket: 4,
  satchel: 10,
  beancan: 46,
  explosiveAmmo: 185,
  propaneBomb: 4,
};

const SHEET_BLOCK: QuantityTable = {
  c4: 4,
  rocket: 8,
  satchel: 23,
  beancan: 112,
  explosiveAmmo: 400,
  propaneBomb: 8,
};

const ARMORED_BLOCK: QuantityTable = {
  c4: 8,
  rocket: 15,
  satchel: 46,
  beancan: 223,
  explosiveAmmo: 799,
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
  propaneBomb: 2,
};

const SHEET_DOOR: QuantityTable = {
  c4: 1,
  rocket: 2,
  satchel: 4,
  beancan: 18,
  explosiveAmmo: 63,
  propaneBomb: 2,
};

const GARAGE_DOOR: QuantityTable = {
  c4: 2,
  rocket: 3,
  satchel: 9,
  beancan: 42,
  explosiveAmmo: 150,
  propaneBomb: 5,
};

const ARMORED_DOOR: QuantityTable = {
  c4: 3,
  rocket: 5,
  satchel: 15,
  beancan: 69,
  explosiveAmmo: 250,
  propaneBomb: 8,
};

/**
 * Real per-hit damage vs. doors (rustlabs attack tables). A rocket
 * deals ~220 to any door and C4 ~334; explosive 5.56 deals 4 to metal
 * doors and 12.5 to wooden ones. These drive the remainder math in the
 * cheapest-mix solver — e.g. sheet metal door = 1 rocket (220) leaves
 * 30 HP = 8 explosive ammo.
 */
const METAL_DOOR_DAMAGE = { rocket: 220, c4: 334, explosiveAmmo: 4 } as const;
const WOODEN_DOOR_DAMAGE = { rocket: 220, c4: 334, explosiveAmmo: 12.5 } as const;

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
    damage: WOODEN_DOOR_DAMAGE,
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
    damage: METAL_DOOR_DAMAGE,
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
    damage: METAL_DOOR_DAMAGE,
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
    damage: METAL_DOOR_DAMAGE,
  },
];

export const STRUCTURES: readonly StructureDef[] = [...buildingBlocks, ...doors];

export const STRUCTURE_BY_ID: Record<string, StructureDef> = Object.fromEntries(
  STRUCTURES.map((s) => [s.id, s]),
);
