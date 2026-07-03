/**
 * Cheapest-mix raid solver.
 *
 * "Optimal" here means the most cost-effective raid: minimum sulfur,
 * computed with real damage remainders — and when a compact mix costs
 * nearly the same as a bulk option, the compact mix wins (1 rocket +
 * 8 explosive ammo beats 63 explosive ammo on a sheet metal door for a
 * ~1.5% sulfur difference).
 *
 * ALGORITHM
 *  1. Damage model: real per-hit damage from `structure.damage`
 *     overrides where the linear estimate is wrong (a rocket deals ~220
 *     to a door even though two are needed for 250 HP), otherwise
 *     hp / quantityToDestroy from the verified tables.
 *  2. Candidates:
 *       - every single tool at its verified table count, and
 *       - every "main tool × n + explosive ammo finisher" mix:
 *             ammo = ceil((hp − n × dmg_main) / dmg_ammo)
 *     Explosive ammo is the only finisher considered — it is how real
 *     raids top off remainders (same gun, fired instantly); finishing a
 *     rocket job with a propane keg or a satchel is never practical.
 *  3. Pick minimum sulfur. A costlier candidate (within SPEED_TOLERANCE
 *     of the minimum) only displaces it when it needs at most HALF the
 *     explosives — a real speed/safety win, not a degenerate shuffle
 *     like adding a beancan to a wood wall to save two bullets.
 *
 * Only sulfur is compared — it is the bottleneck resource. The UI shows
 * the full raw-material bill for the mix so other costs stay visible.
 *
 * Resulting optima (verify after data changes):
 *   walls/blocks → propane bombs (stone+) or bulk ammo (wood),
 *   sheet door   → 1× Rocket + 8× Expl. 5.56,
 *   garage door  → 2× Rocket + 40× Expl. 5.56,
 *   armored door → 4× Rocket + 30× Expl. 5.56.
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
  /** Short human label, e.g. "1× Rocket + 8× Expl. 5.56". */
  label: string;
}

/** Candidates within 5% of the cheapest sulfur compete on unit count. */
const SPEED_TOLERANCE = 1.05;

/** The only finisher used to top off partial damage. */
const FINISHER: ExplosiveId = "explosiveAmmo";

const EPSILON = 1e-9;

const cache = new Map<string, OptimalMix>();

/** Per-hit damage of `tool` vs. `structure` (override, else linear). */
export function damageAgainst(structure: StructureDef, tool: ExplosiveId): number {
  const override = structure.damage?.[tool];
  if (override !== undefined) return override;
  const qty = structure.toDestroy[tool];
  if (qty === null || qty <= 0) return 0;
  return structure.hp / qty;
}

interface Candidate {
  components: MixComponent[];
  sulfur: number;
  units: number;
}

export function cheapestMix(structure: StructureDef): OptimalMix {
  const cached = cache.get(structure.id);
  if (cached) return cached;

  const tools = (Object.keys(structure.toDestroy) as ExplosiveId[]).filter(
    (t) => structure.toDestroy[t] !== null,
  );

  const candidates: Candidate[] = [];
  const add = (components: MixComponent[]) => {
    candidates.push({
      components,
      sulfur: components.reduce((s, c) => s + EXPLOSIVE_BY_ID[c.tool].sulfurCost * c.count, 0),
      units: components.reduce((s, c) => s + c.count, 0),
    });
  };

  const ammoDamage = tools.includes(FINISHER) ? damageAgainst(structure, FINISHER) : 0;

  for (const tool of tools) {
    const qty = structure.toDestroy[tool]!;

    // Single tool: exactly the verified table count.
    add([{ tool, count: qty }]);

    // Main tool × n, true HP remainder finished with explosive ammo.
    if (tool === FINISHER || ammoDamage <= 0) continue;
    const dmg = damageAgainst(structure, tool);
    for (let n = 1; n < qty; n++) {
      const remainder = structure.hp - n * dmg;
      if (remainder <= 0) break;
      const ammo = Math.ceil(remainder / ammoDamage - EPSILON);
      if (ammo <= 0) continue;
      add([
        { tool, count: n },
        { tool: FINISHER, count: ammo },
      ]);
    }
  }

  // Baseline: cheapest sulfur (ties → fewest explosives).
  const baseline = candidates.reduce((a, b) =>
    b.sulfur < a.sulfur || (b.sulfur === a.sulfur && b.units < a.units) ? b : a,
  );

  // A near-tie (within SPEED_TOLERANCE) displaces the baseline only if
  // it uses at most half the explosives — faster and safer to execute.
  const best = candidates
    .filter((c) => c.sulfur <= baseline.sulfur * SPEED_TOLERANCE && c.units <= baseline.units / 2)
    .reduce(
      (a, b) => (b.units < a.units || (b.units === a.units && b.sulfur < a.sulfur) ? b : a),
      baseline,
    );

  // Most expensive component first reads naturally ("1× Rocket + 8× Expl. 5.56").
  const components = [...best.components].sort(
    (x, y) => EXPLOSIVE_BY_ID[y.tool].sulfurCost - EXPLOSIVE_BY_ID[x.tool].sulfurCost,
  );

  const mix: OptimalMix = {
    components,
    totalSulfur: best.sulfur,
    label: components
      .map((c) => `${c.count}× ${EXPLOSIVE_BY_ID[c.tool].shortName}`)
      .join(" + "),
  };

  cache.set(structure.id, mix);
  return mix;
}
