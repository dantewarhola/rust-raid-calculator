/**
 * Explosive crafting optimizer (Feature 2).
 *
 * ALGORITHM — greedy by damage-per-sulfur:
 *  1. Sort explosives by structureDamage / sulfurCost, best first.
 *     (Sulfur is the bottleneck resource in virtually every raid, so
 *     "damage per sulfur" is the community-standard efficiency metric.)
 *  2. For the best explosive, craft as many as the CURRENT inventory
 *     allows (limited by whichever ingredient runs out first).
 *  3. Subtract the consumed materials, move to the next explosive, and
 *     repeat. Later explosives soak up leftovers the better ones could
 *     not use (e.g. leftover charcoal + pipes → HV rockets).
 *
 * Greedy is optimal here in the practical sense: the ranking metric is
 * one-dimensional (sulfur) and every recipe consumes sulfur, so filling
 * up on the highest damage-per-sulfur item first maximizes total damage
 * from the sulfur pool. Secondary materials only ever *cap* a craft,
 * and the cascade lets cheaper recipes consume what remains.
 *
 * The module also exposes single-explosive "alternatives" so the UI can
 * show what an all-in loadout on each explosive type would yield.
 */

import { EXPLOSIVES, type ExplosiveDef, type ExplosiveId } from "@/data/explosives";
import { emptyBag, type ResourceBag, type ResourceId } from "@/data/resources";

export interface CraftLine {
  explosive: ExplosiveDef;
  quantity: number;
  sulfurSpent: number;
  damage: number;
}

export interface OptimizerResult {
  /** Recommended loadout, best damage-per-sulfur first. */
  loadout: CraftLine[];
  /** Materials remaining after crafting the loadout. */
  leftovers: Record<ResourceId, number>;
  totalDamage: number;
  totalSulfurSpent: number;
  /** "All-in on one explosive" comparison rows. */
  alternatives: CraftLine[];
}

/** How many of `explosive` can be crafted from `inventory`? */
function maxCraftable(explosive: ExplosiveDef, inventory: Record<ResourceId, number>): number {
  let max = Infinity;
  for (const [res, perUnit] of Object.entries(explosive.rawCost) as [ResourceId, number][]) {
    if (perUnit <= 0) continue;
    max = Math.min(max, Math.floor(inventory[res] / perUnit));
  }
  return Number.isFinite(max) ? max : 0;
}

function consume(explosive: ExplosiveDef, quantity: number, inventory: Record<ResourceId, number>): void {
  for (const [res, perUnit] of Object.entries(explosive.rawCost) as [ResourceId, number][]) {
    // Fractional per-unit costs (explosive ammo frags) are ceiled on the
    // total so the inventory never goes negative in whole-item terms.
    inventory[res] -= Math.ceil(perUnit * quantity);
  }
}

/** Explosives ranked by structural damage per unit of sulfur, best first. */
export const EFFICIENCY_RANKING: readonly ExplosiveDef[] = [...EXPLOSIVES].sort(
  (a, b) => b.structureDamage / b.sulfurCost - a.structureDamage / a.sulfurCost,
);

export function optimizeCrafting(input: ResourceBag): OptimizerResult {
  const inventory = { ...emptyBag(), ...input };

  const loadout: CraftLine[] = [];
  for (const explosive of EFFICIENCY_RANKING) {
    const quantity = maxCraftable(explosive, inventory);
    if (quantity <= 0) continue;
    consume(explosive, quantity, inventory);
    loadout.push({
      explosive,
      quantity,
      sulfurSpent: explosive.sulfurCost * quantity,
      damage: explosive.structureDamage * quantity,
    });
  }

  // Alternatives: what if the ENTIRE inventory went into one explosive?
  const alternatives: CraftLine[] = EFFICIENCY_RANKING.map((explosive) => {
    const fresh = { ...emptyBag(), ...input };
    const quantity = maxCraftable(explosive, fresh);
    return {
      explosive,
      quantity,
      sulfurSpent: explosive.sulfurCost * quantity,
      damage: explosive.structureDamage * quantity,
    };
  }).filter((line) => line.quantity > 0);

  return {
    loadout,
    leftovers: inventory,
    totalDamage: loadout.reduce((sum, l) => sum + l.damage, 0),
    totalSulfurSpent: loadout.reduce((sum, l) => sum + l.sulfurSpent, 0),
    alternatives,
  };
}
