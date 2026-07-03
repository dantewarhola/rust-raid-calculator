/**
 * Explosive / raid-tool definitions: crafting recipes broken down to raw
 * materials, plus a nominal "structure damage" figure used by the
 * Explosive Optimizer to rank sulfur efficiency.
 *
 * DATA SOURCE: rustlabs.com raiding + crafting tables (mirrored at
 * wiki.rustclash.com). Values transcribed 2026-07-03. If Facepunch
 * rebalances explosives, update ONLY this file — everything else derives
 * from it.
 *
 * Raw-cost derivations (kept here so future edits can be sanity-checked):
 *   Gunpowder x10        = 30 charcoal + 20 sulfur          → 1 GP = 2 sulfur, 3 charcoal
 *   Explosives x1        = 50 GP + 3 LGF + 10 sulfur + 10 frags
 *                          → 110 sulfur, 150 charcoal, 3 LGF, 10 frags
 *   Rocket               = 2 pipes + 150 GP + 10 Explosives
 *                          → 1400 sulfur, 1950 charcoal, 30 LGF, 100 frags, 2 pipes
 *   Timed Explosive (C4) = 20 Explosives + 5 cloth + 2 tech trash
 *                          → 2200 sulfur, 3000 charcoal, 60 LGF, 200 frags, 5 cloth, 2 tech trash
 *   Beancan Grenade      = 60 GP + 20 frags → 120 sulfur, 180 charcoal, 20 frags
 *   Satchel Charge       = 4 Beancans + 1 Small Stash (10 cloth) + 1 rope
 *                          → 480 sulfur, 720 charcoal, 80 frags, 10 cloth, 1 rope
 *   Explosive 5.56 x2    = 20 GP + 10 sulfur + 5 frags
 *                          → per round: 25 sulfur, 30 charcoal, 2.5 frags
 *   HV Rocket            = 1 pipe + 100 GP → 200 sulfur, 300 charcoal, 1 pipe
 *   Incendiary Rocket    = 2 pipes + 250 LGF + 100 GP
 *                          → 200 sulfur, 300 charcoal, 250 LGF, 2 pipes
 *   Propane Explosive    = 1 empty propane tank + 450 GP + 20 LGF
 *   Bomb                   → 900 sulfur, 1350 charcoal, 20 LGF, 1 tank
 *                          (Primitive update, Feb 2025; deployed by hand
 *                           or launched from a catapult)
 */

import type { ResourceBag } from "./resources";

export type ExplosiveId =
  | "c4"
  | "rocket"
  | "satchel"
  | "beancan"
  | "explosiveAmmo"
  | "hvRocket"
  | "incendiaryRocket"
  | "propaneBomb";

export interface ExplosiveDef {
  id: ExplosiveId;
  name: string;
  shortName: string;
  /** Icon file name inside /public/icons (without extension). */
  icon: string;
  /** Full raw-material cost to craft ONE unit (fractions allowed; totals are ceiled). */
  rawCost: ResourceBag;
  /**
   * Nominal damage dealt to a standard (stone-tier) building block.
   * Used by the optimizer to rank damage-per-sulfur. Derived from
   * rustlabs "quantity to destroy" tables: damage ≈ HP / quantity.
   */
  structureDamage: number;
  /** Total sulfur baked into one unit (precomputed for the optimizer). */
  sulfurCost: number;
  /** Workbench level required to craft. Display only. */
  workbench: 1 | 2 | 3;
  notes?: string;
}

export const EXPLOSIVES: readonly ExplosiveDef[] = [
  {
    id: "c4",
    name: "Timed Explosive Charge (C4)",
    shortName: "C4",
    icon: "c4",
    rawCost: { sulfur: 2200, charcoal: 3000, lowGradeFuel: 60, metalFragments: 200, cloth: 5, techTrash: 2 },
    structureDamage: 275,
    sulfurCost: 2200,
    workbench: 3,
    notes: "Fastest hard-side option; propane bombs beat it on pure sulfur cost.",
  },
  {
    id: "rocket",
    name: "Rocket",
    shortName: "Rocket",
    icon: "rocket",
    rawCost: { sulfur: 1400, charcoal: 1950, lowGradeFuel: 30, metalFragments: 100, metalPipe: 2 },
    structureDamage: 137.5,
    sulfurCost: 1400,
    workbench: 3,
    notes: "Splash hits up to 4 adjacent building blocks.",
  },
  {
    id: "satchel",
    name: "Satchel Charge",
    shortName: "Satchel",
    icon: "satchel",
    rawCost: { sulfur: 480, charcoal: 720, metalFragments: 80, cloth: 10, rope: 1 },
    structureDamage: 51.75,
    sulfurCost: 480,
    workbench: 1,
    notes: "Unreliable fuse — can dud and be re-lit.",
  },
  {
    id: "beancan",
    name: "Beancan Grenade",
    shortName: "Beancan",
    icon: "beancan",
    rawCost: { sulfur: 120, charcoal: 180, metalFragments: 20 },
    structureDamage: 10.9,
    sulfurCost: 120,
    workbench: 1,
    notes: "Cheap but very inefficient vs. structures. Can dud.",
  },
  {
    id: "explosiveAmmo",
    name: "Explosive 5.56 Rifle Ammo",
    shortName: "Expl. 5.56",
    icon: "explosive-ammo",
    rawCost: { sulfur: 25, charcoal: 30, metalFragments: 2.5 },
    structureDamage: 2.7,
    sulfurCost: 25,
    workbench: 3,
    notes: "Top-tier sulfur efficiency vs. sheet metal doors. Wears gun barrels.",
  },
  {
    id: "hvRocket",
    name: "High Velocity Rocket",
    shortName: "HV Rocket",
    icon: "hv-rocket",
    rawCost: { sulfur: 200, charcoal: 300, metalPipe: 1 },
    structureDamage: 22,
    sulfurCost: 200,
    workbench: 2,
    notes: "Cheap rocket; weak vs. hard-side structures. Decent vs. doors.",
  },
  {
    id: "propaneBomb",
    name: "Propane Explosive Bomb",
    shortName: "Propane",
    icon: "propane-bomb",
    rawCost: { sulfur: 900, charcoal: 1350, lowGradeFuel: 20, emptyPropaneTank: 1 },
    structureDamage: 125,
    sulfurCost: 900,
    workbench: 2,
    notes: "Best damage per sulfur vs. walls. Deploy by hand or catapult; tanks are looted, not crafted.",
  },
  {
    id: "incendiaryRocket",
    name: "Incendiary Rocket",
    shortName: "Fire Rocket",
    icon: "incendiary-rocket",
    rawCost: { sulfur: 200, charcoal: 300, lowGradeFuel: 250, metalPipe: 2 },
    structureDamage: 15,
    sulfurCost: 200,
    workbench: 3,
    notes: "Fire damage — only practical vs. wooden structures.",
  },
] as const;

export const EXPLOSIVE_BY_ID: Record<ExplosiveId, ExplosiveDef> = Object.fromEntries(
  EXPLOSIVES.map((e) => [e.id, e]),
) as Record<ExplosiveId, ExplosiveDef>;
