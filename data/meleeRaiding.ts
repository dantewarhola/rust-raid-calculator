/**
 * Soft-side / melee raiding reference data.
 *
 * DATA SOURCE: rustlabs.com "Attack" tables per tool, transcribed
 * 2026-07-03. Hit counts target the SOFT side of each structure (the
 * side that shows higher damage numbers — usually the inside face of
 * walls and the outside face of floors). Tool counts are hit count ÷
 * effective durability, rounded up; treat them as planning estimates
 * since durability loss varies slightly with server settings.
 */

export interface MeleeToolDef {
  id: string;
  name: string;
  icon: string;
  /** Approximate number of hits the tool survives before breaking. */
  durabilityHits: number;
  notes?: string;
}

export const MELEE_TOOLS: readonly MeleeToolDef[] = [
  {
    id: "jackhammer",
    name: "Jackhammer",
    icon: "jackhammer",
    durabilityHits: 300,
    notes: "Fastest soft-side tool. Found/bought, not craftable by default.",
  },
  {
    id: "metal-pickaxe",
    name: "Pickaxe",
    icon: "pickaxe",
    durabilityHits: 180,
    notes: "Best craftable option vs. stone soft-side.",
  },
  {
    id: "salvaged-icepick",
    name: "Salvaged Icepick",
    icon: "salvaged-icepick",
    durabilityHits: 200,
    notes: "Slightly better than a pickaxe per hit.",
  },
  {
    id: "salvaged-axe",
    name: "Salvaged Axe",
    icon: "salvaged-axe",
    durabilityHits: 200,
    notes: "Strong vs. wooden structures only.",
  },
] as const;

export interface SoftSideTarget {
  id: string;
  name: string;
  icon: string;
  hp: number;
  /**
   * Hits required on the SOFT side, per tool id.
   * `null` = tool does negligible damage to this target.
   */
  hits: Record<string, number | null>;
}

export const SOFT_SIDE_TARGETS: readonly SoftSideTarget[] = [
  {
    id: "stone-wall-soft",
    name: "Stone Wall (soft side)",
    icon: "wall-stone",
    hp: 500,
    hits: {
      jackhammer: 63,
      "metal-pickaxe": 168,
      "salvaged-icepick": 139,
      "salvaged-axe": null,
    },
  },
  {
    id: "sheet-wall-soft",
    name: "Sheet Metal Wall (soft side)",
    icon: "wall-metal",
    hp: 1000,
    hits: {
      jackhammer: 134,
      "metal-pickaxe": 400,
      "salvaged-icepick": 334,
      "salvaged-axe": null,
    },
  },
  {
    id: "wood-wall-soft",
    name: "Wooden Wall (soft side)",
    icon: "wall-wood",
    hp: 250,
    hits: {
      jackhammer: 56,
      "metal-pickaxe": 63,
      "salvaged-icepick": 63,
      "salvaged-axe": 46,
    },
  },
  {
    id: "wooden-door-melee",
    name: "Wooden Door",
    icon: "door-wood",
    hp: 200,
    hits: {
      jackhammer: 50,
      "metal-pickaxe": 56,
      "salvaged-icepick": 56,
      "salvaged-axe": 40,
    },
  },
] as const;
