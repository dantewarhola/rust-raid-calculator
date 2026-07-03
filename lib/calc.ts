/**
 * Raid-cost calculation logic (Feature 1).
 *
 * Pure functions — no React. Everything runs client-side.
 */

import { EXPLOSIVE_BY_ID, type ExplosiveId } from "@/data/explosives";
import { STRUCTURE_BY_ID } from "@/data/structures";
import { addBag, emptyBag, type ResourceId } from "@/data/resources";
import { cheapestMix, type MixComponent } from "./optimalRaid";

/**
 * A raid tool selection: a specific explosive, or "optimal" — the
 * cheapest-sulfur mix of explosives computed by lib/optimalRaid.
 */
export type RaidTool = ExplosiveId | "optimal";

/** One row of user input: destroy `count` of structure using `tool`. */
export interface RaidSelection {
  structureId: string;
  tool: RaidTool;
  count: number;
}

export interface RaidLineResult {
  structureId: string;
  structureName: string;
  tool: RaidTool;
  /** Display label: explosive short name, or the mix label. */
  toolLabel: string;
  count: number;
  /** Explosives used for the whole line, per explosive type. */
  components: MixComponent[];
  /** Raw materials to craft those explosives. */
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
    if (!structure) continue;

    // Resolve the selection into per-explosive counts for ONE structure.
    let perUnit: MixComponent[];
    let toolLabel: string;
    if (sel.tool === "optimal") {
      const mix = cheapestMix(structure);
      perUnit = mix.components;
      toolLabel = mix.label;
    } else {
      const qty = structure.toDestroy[sel.tool];
      if (qty === null) continue; // tool can't damage this target
      perUnit = [{ tool: sel.tool, count: qty }];
      toolLabel = EXPLOSIVE_BY_ID[sel.tool].shortName;
    }

    const components: MixComponent[] = perUnit.map((c) => ({
      tool: c.tool,
      count: c.count * sel.count,
    }));

    const rawCost = emptyBag();
    for (const c of components) {
      addBag(rawCost, EXPLOSIVE_BY_ID[c.tool].rawCost, c.count);
    }
    // Round fractional material costs up per line.
    for (const key of Object.keys(rawCost) as ResourceId[]) {
      rawCost[key] = Math.ceil(rawCost[key]);
    }

    lines.push({
      structureId: structure.id,
      structureName: structure.name,
      tool: sel.tool,
      toolLabel,
      count: sel.count,
      components,
      rawCost,
      sulfur: rawCost.sulfur,
    });

    for (const c of components) {
      explosiveTotals[c.tool] = (explosiveTotals[c.tool] ?? 0) + c.count;
    }
    addBag(rawTotals, rawCost);
  }

  return { lines, explosiveTotals, rawTotals, totalSulfur: rawTotals.sulfur };
}
