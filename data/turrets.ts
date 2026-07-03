/**
 * Anti-turret reference data.
 *
 * DATA SOURCE: rustlabs.com Auto Turret durability table, transcribed
 * 2026-07-03. The compound-bow arrow counts assume shots landed from
 * OUTSIDE the turret's 30 m engagement range or from a blind angle —
 * the whole point of the method is that the turret never returns fire.
 */

export interface TurretMethod {
  id: string;
  name: string;
  icon: string;
  /** Units required to destroy one Auto Turret (1000 HP). */
  quantity: number;
  /** Total sulfur cost of those units (0 for sulfur-free methods). */
  sulfurCost: number;
  notes: string;
}

export const AUTO_TURRET_HP = 1000;

export const TURRET_METHODS: readonly TurretMethod[] = [
  {
    id: "compound-wooden-arrow",
    name: "Compound Bow + Wooden Arrows",
    icon: "compound-bow",
    quantity: 112,
    sulfurCost: 0,
    notes:
      "Fire fully-charged shots from beyond 30 m or from a soft angle the turret cannot see. Slow but costs only wood and stone.",
  },
  {
    id: "compound-hv-arrow",
    name: "Compound Bow + HV Arrows",
    icon: "hv-arrow",
    quantity: 100,
    sulfurCost: 0,
    notes: "Flatter trajectory makes long-range turret sniping easier.",
  },
  {
    id: "explosive-ammo-turret",
    name: "Explosive 5.56 Ammo",
    icon: "explosive-ammo",
    quantity: 45,
    sulfurCost: 45 * 25,
    notes: "Fast and safe from range; ~1,125 sulfur per turret.",
  },
  {
    id: "rocket-turret",
    name: "Rocket",
    icon: "rocket",
    quantity: 2,
    sulfurCost: 2 * 1400,
    notes: "Overkill unless the turret protects a raid path anyway.",
  },
  {
    id: "c4-turret",
    name: "Timed Explosive Charge",
    icon: "c4",
    quantity: 1,
    sulfurCost: 2200,
    notes: "One charge destroys the turret — expensive but instant.",
  },
  {
    id: "beancan-turret",
    name: "Beancan Grenade",
    icon: "beancan",
    quantity: 12,
    sulfurCost: 12 * 120,
    notes: "Risky: you must get inside throwing range.",
  },
] as const;
