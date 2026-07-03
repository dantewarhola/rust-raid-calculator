"use client";

import { useMemo, useState } from "react";
import { RESOURCES, type ResourceId } from "@/data/resources";
import { optimizeCrafting, EFFICIENCY_RANKING } from "@/lib/optimizer";
import ItemIcon from "./ItemIcon";
import ItemInput from "./ItemInput";
import ResultTable, { type ResultRow } from "./ResultTable";
import ResourceSummary from "./ResourceSummary";

const formatter = new Intl.NumberFormat("en-US");

/**
 * Feature 2 — Optimal Explosive Crafting Calculator.
 * User enters raw materials; optimizer returns the greedy
 * damage-per-sulfur loadout plus all-in alternatives.
 */
export default function CraftOptimizer() {
  const [inventory, setInventory] = useState<Record<ResourceId, number>>({
    sulfur: 0,
    charcoal: 0,
    metalFragments: 0,
    lowGradeFuel: 0,
    cloth: 0,
    techTrash: 0,
    metalPipe: 0,
    rope: 0,
    emptyPropaneTank: 0,
  });
  const [showAlternatives, setShowAlternatives] = useState(false);

  const result = useMemo(() => optimizeCrafting(inventory), [inventory]);

  const loadoutRows: ResultRow[] = result.loadout.map((line) => ({
    id: line.explosive.id,
    cells: {
      explosive: { value: line.explosive.name, icon: line.explosive.icon },
      quantity: { value: `×${formatter.format(line.quantity)}` },
      sulfur: { value: formatter.format(line.sulfurSpent), highlight: true },
      damage: { value: formatter.format(Math.round(line.damage)) },
    },
  }));

  const alternativeRows: ResultRow[] = result.alternatives.map((line) => ({
    id: line.explosive.id,
    cells: {
      explosive: { value: line.explosive.name, icon: line.explosive.icon },
      quantity: { value: `×${formatter.format(line.quantity)}` },
      damage: { value: formatter.format(Math.round(line.damage)) },
      efficiency: {
        value: (line.explosive.structureDamage / line.explosive.sulfurCost).toFixed(3),
        muted: true,
      },
    },
  }));

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      {/* Inventory inputs */}
      <section>
        <h2 className="font-display uppercase tracking-[0.3em] text-ash text-xs mb-3">Your Raw Materials</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {RESOURCES.filter((r) => r.optimizerInput).map((res) => (
            <ItemInput
              key={res.id}
              icon={res.icon}
              label={res.name}
              value={inventory[res.id]}
              onChange={(value) => setInventory((prev) => ({ ...prev, [res.id]: value }))}
            />
          ))}
        </div>

        <div className="panel p-4 mt-6">
          <h3 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-3 border-b border-seam pb-2">
            Sulfur Efficiency Ranking
          </h3>
          <ol className="space-y-1.5">
            {EFFICIENCY_RANKING.map((e, i) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <span className="font-display text-ash w-5">{i + 1}.</span>
                <ItemIcon icon={e.icon} alt={e.name} size={24} />
                <span className="flex-1">{e.shortName}</span>
                <span className="text-ash text-xs">
                  {(e.structureDamage / e.sulfurCost).toFixed(3)} dmg/sulfur
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Results */}
      <div className="space-y-4 lg:sticky lg:top-4 self-start">
        <div className="panel p-4">
          <h3 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-3 border-b border-seam pb-2">
            Optimal Loadout
          </h3>
          <ResultTable
            columns={[
              { key: "explosive", header: "Craft" },
              { key: "quantity", header: "Qty", align: "right" },
              { key: "sulfur", header: "Sulfur", align: "right" },
              { key: "damage", header: "Raid Dmg", align: "right" },
            ]}
            rows={loadoutRows}
            emptyMessage="Enter materials to see what you can craft."
          />
          {result.loadout.length > 0 && (
            <p className="mt-3 text-sm text-ash border-t border-seam pt-2">
              Total effective raid damage:{" "}
              <span className="text-rust-glow font-display text-lg">
                {formatter.format(Math.round(result.totalDamage))}
              </span>{" "}
              (≈ {Math.floor(result.totalDamage / 500)} stone walls)
            </p>
          )}
        </div>

        <ResourceSummary title="Leftover Materials" totals={result.leftovers} />

        <div className="panel p-4">
          <button
            onClick={() => setShowAlternatives((v) => !v)}
            className="w-full font-display uppercase tracking-[0.25em] text-sm text-left text-bone
              hover:text-rust-glow transition-colors"
          >
            {showAlternatives ? "▾" : "▸"} Alternatives — all-in on one explosive
          </button>
          {showAlternatives && (
            <div className="mt-3">
              <ResultTable
                columns={[
                  { key: "explosive", header: "Explosive" },
                  { key: "quantity", header: "Max Qty", align: "right" },
                  { key: "damage", header: "Raid Dmg", align: "right" },
                  { key: "efficiency", header: "Dmg/Sulfur", align: "right" },
                ]}
                rows={alternativeRows}
                emptyMessage="Nothing craftable with current materials."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
