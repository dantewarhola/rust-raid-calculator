/**
 * Raid-cost calculation logic (Feature 1).
 *
 * Pure functions — no React. Everything runs client-side.
 */

import { EXPLOSIVE_BY_ID, type ExplosiveId } from "@/data/explosives";
import { STRUCTURE_BY_ID } from "@/data/structures";
import { addBag, emptyBag, type ResourceId } from "@/data/resources";

/** One row of user input: destroy `count` of structure using `tool`. */
export interface RaidSelection {
  structureId: string;
  tool: ExplosiveId;
  count: number;
}

export interface RaidLineResult {
  structureId: string;
  structureName: string;
  tool: ExplosiveId;
  toolName: string;
  count: number;
  /** Explosives needed for ONE unit of the structure. */
  perUnit: number;
  /** Explosives needed for the whole line (perUnit × count). */
  explosivesNeeded: number;
  /** Raw materials to craft that many explosives. */
  rawCost: Record<ResourceId, number>;
  sulfur: number;
}

export interface RaidTotals {
  lines: RaidLineResult[];
  /** Total explosives, grouped by explosive type. */
  explosiveTotals: Partial<Record<ExplosiveId, number>>;
  /** Grand-total raw material shopping list. */
  rawTotals: Record<ResourceId, number>;
  totalSulfur: number;
}

/**
 * Compute the full raid cost for a set of selections.
 *
 * Rounding rules:
 *  - Explosive counts are whole units per structure (already integers in
 *    the data tables), multiplied by structure count.
 *  - Raw materials may be fractional per unit (explosive 5.56 ammo costs
 *    2.5 frags/round); totals are rounded UP at the line level, since
 *    you cannot farm half a metal fragment.
 */
export function calculateRaid(selections: RaidSelection[]): RaidTotals {
  const lines: RaidLineResult[] = [];
  const explosiveTotals: Partial<Record<ExplosiveId, number>> = {};
  const rawTotals = emptyBag();

  for (const sel of selections) {
    if (sel.count <= 0) continue;
    const structure = STRUCTURE_BY_ID[sel.structureId];
    const explosive = EXPLOSIVE_BY_ID[sel.tool];
    if (!structure || !explosive) continue;

    const perUnit = structure.toDestroy[sel.tool];
    if (perUnit === null) continue; // tool can't damage this target

    const needed = perUnit * sel.count;
    const rawCost = emptyBag();
    addBag(rawCost, explosive.rawCost, needed);

    // Round fractional material costs up per line.
    for (const key of Object.keys(rawCost) as ResourceId[]) {
      rawCost[key] = Math.ceil(rawCost[key]);
    }

    lines.push({
      structureId: structure.id,
      structureName: structure.name,
      tool: sel.tool,
      toolName: explosive.shortName,
      count: sel.count,
      perUnit,
      explosivesNeeded: needed,
      rawCost,
      sulfur: rawCost.sulfur,
    });

    explosiveTotals[sel.tool] = (explosiveTotals[sel.tool] ?? 0) + needed;
    addBag(rawTotals, rawCost);
  }

  return { lines, explosiveTotals, rawTotals, totalSulfur: rawTotals.sulfur };
}
