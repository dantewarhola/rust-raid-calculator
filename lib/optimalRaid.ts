/**
 * Cheapest-mix raid solver.
 *
 * "2 C4" is rarely the cheapest way through a structure — mixing tools
 * often beats a single explosive, and sometimes the cheapest option is
 * simply a different tool (150 explosive ammo beats 2 C4 on a garage
 * door; 2 incendiary rockets beat everything on a wooden wall).
 *
 * ALGORITHM — exact enumeration of single tools and ordered pairs:
 *   The destroy tables say tool T needs qty_T units to destroy a
 *   structure, so one unit removes 1/qty_T of its HP (damage is linear).
 *   A mix of n_A of tool A and n_B of tool B destroys the structure when
 *       n_A/qty_A + n_B/qty_B >= 1
 *   For every pair (A, B) and every useful n_A in [0, qty_A], the
 *   cheapest finisher count is n_B = ceil((1 - n_A/qty_A) × qty_B).
 *   Minimize total sulfur over all of it. Working directly off the
 *   verified table counts keeps the result exact — no damage rounding —
 *   and with ≤8 tools and qty ≤ 799 this is at most ~50k cheap
 *   iterations, memoized per structure.
 *
 *   Mixes of 3+ tool types are not considered: a third component only
 *   helps when two different finishers beat one, which the sulfur-linear
 *   cost structure of Rust explosives never rewards in practice.
 *
 * Only sulfur is minimized — it is the bottleneck resource. The UI shows
 * the full raw-material bill for the mix so other costs stay visible.
 */

import { EXPLOSIVE_BY_ID, type ExplosiveId } from "@/data/explosives";
import type { StructureDef } from "@/data/structures";

export interface MixComponent {
  tool: ExplosiveId;
  count: number;
}

export interface OptimalMix {
  components: MixComponent[];
  totalSulfur: number;
  /** Short human label, e.g. "1× Rocket + 32× Expl. 5.56". */
  label: string;
}

const cache = new Map<string, OptimalMix>();

const EPSILON = 1e-9;

export function cheapestMix(structure: StructureDef): OptimalMix {
  const cached = cache.get(structure.id);
  if (cached) return cached;

  const tools = (Object.keys(structure.toDestroy) as ExplosiveId[]).filter(
    (t) => structure.toDestroy[t] !== null,
  );

  let bestCost = Infinity;
  let best: MixComponent[] = [];

  const consider = (components: MixComponent[]) => {
    const cost = components.reduce(
      (sum, c) => sum + EXPLOSIVE_BY_ID[c.tool].sulfurCost * c.count,
      0,
    );
    if (cost < bestCost) {
      bestCost = cost;
      best = components;
    }
  };

  for (const a of tools) {
    const qtyA = structure.toDestroy[a]!;

    // Single tool: exactly the table count.
    consider([{ tool: a, count: qtyA }]);

    // Pairs: n_A units of A, remainder finished with B.
    for (const b of tools) {
      if (b === a) continue;
      const qtyB = structure.toDestroy[b]!;
      for (let nA = 1; nA < qtyA; nA++) {
        const remainder = 1 - nA / qtyA;
        const nB = Math.ceil(remainder * qtyB - EPSILON);
        if (nB <= 0) continue;
        consider([
          { tool: a, count: nA },
          { tool: b, count: nB },
        ]);
      }
    }
  }

  // Most expensive component first reads naturally ("1× Rocket + 8× Expl. 5.56").
  const components = [...best].sort(
    (x, y) => EXPLOSIVE_BY_ID[y.tool].sulfurCost - EXPLOSIVE_BY_ID[x.tool].sulfurCost,
  );

  const mix: OptimalMix = {
    components,
    totalSulfur: bestCost,
    label: components
      .map((c) => `${c.count}× ${EXPLOSIVE_BY_ID[c.tool].shortName}`)
      .join(" + "),
  };

  cache.set(structure.id, mix);
  return mix;
}
