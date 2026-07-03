"use client";

import { useMemo, useState } from "react";
import { EXPLOSIVES } from "@/data/explosives";
import { STRUCTURES } from "@/data/structures";
import { calculateRaid, type RaidSelection, type RaidTool } from "@/lib/calc";
import { cheapestMix } from "@/lib/optimalRaid";
import ItemIcon from "./ItemIcon";
import ResultTable, { type ResultRow } from "./ResultTable";
import ResourceSummary from "./ResourceSummary";

const formatter = new Intl.NumberFormat("en-US");

interface RowState {
  count: number;
  tool: RaidTool;
}

/**
 * Feature 1 — Raid Cost Calculator.
 * Live recalculation: state flows straight into calculateRaid via useMemo.
 */
export default function RaidCalculator() {
  // Default every structure to the cheapest-sulfur mix — raiding is
  // won on sulfur economy, not convenience.
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(STRUCTURES.map((s) => [s.id, { count: 0, tool: "optimal" as const }])),
  );

  const selections: RaidSelection[] = useMemo(
    () =>
      Object.entries(rows)
        .filter(([, r]) => r.count > 0)
        .map(([structureId, r]) => ({ structureId, tool: r.tool, count: r.count })),
    [rows],
  );

  const result = useMemo(() => calculateRaid(selections), [selections]);

  const groups = useMemo(() => {
    const buildings = STRUCTURES.filter((s) => s.category === "building");
    const doors = STRUCTURES.filter((s) => s.category === "door");
    return [
      { label: "Building Blocks", items: buildings },
      { label: "Doors", items: doors },
    ];
  }, []);

  const breakdownRows: ResultRow[] = result.lines.map((line) => ({
    id: `${line.structureId}-${line.tool}`,
    cells: {
      structure: { value: `${line.count}× ${line.structureName}`, icon: STRUCTURES.find((s) => s.id === line.structureId)?.icon },
      tool: { value: line.tool === "optimal" ? `${line.toolLabel} each` : line.toolLabel },
      sulfur: { value: formatter.format(line.sulfur), highlight: true },
    },
  }));

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      {/* Inputs */}
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="font-display uppercase tracking-[0.3em] text-ash text-xs mb-3">{group.label}</h2>
            <div className="space-y-2">
              {group.items.map((s) => {
                const row = rows[s.id];
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex items-center gap-3 panel px-3 py-2 hover:border-rust/50 transition-colors">
                      <ItemIcon icon={s.icon} alt={s.name} size={36} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-display text-sm uppercase tracking-wider truncate">{s.name}</span>
                        <span className="block text-xs text-ash">{formatter.format(s.hp)} HP</span>
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={row.count === 0 ? "" : row.count}
                        placeholder="0"
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          const count = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
                          setRows((prev) => ({ ...prev, [s.id]: { ...prev[s.id], count } }));
                        }}
                        className="input-field w-20 shrink-0"
                        aria-label={`Quantity of ${s.name}`}
                      />
                    </div>
                    <select
                      value={row.tool}
                      onChange={(e) =>
                        setRows((prev) => ({ ...prev, [s.id]: { ...prev[s.id], tool: e.target.value as RaidTool } }))
                      }
                      className="panel px-2 py-2 bg-slab font-display text-sm uppercase tracking-wide text-bone
                        focus:outline-none focus:border-rust sm:w-52"
                      aria-label={`Raid tool for ${s.name}`}
                    >
                      <option value="optimal">★ Cheapest — {cheapestMix(s).label}</option>
                      {EXPLOSIVES.filter((e) => s.toDestroy[e.id] !== null).map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.shortName} × {s.toDestroy[e.id]}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Results panel — sticky so totals stay visible while scrolling inputs */}
      <div className="space-y-4 lg:sticky lg:top-4 self-start">
        <div className="panel p-4">
          <h3 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-3 border-b border-seam pb-2">
            Explosives Required
          </h3>
          {Object.keys(result.explosiveTotals).length === 0 ? (
            <p className="text-ash text-sm italic">Enter structure counts to price the raid.</p>
          ) : (
            <ul className="space-y-1.5">
              {EXPLOSIVES.filter((e) => (result.explosiveTotals[e.id] ?? 0) > 0).map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-sm">
                  <ItemIcon icon={e.icon} alt={e.name} size={26} />
                  <span className="flex-1">{e.name}</span>
                  <span className="font-display text-lg text-rust-glow">
                    ×{formatter.format(result.explosiveTotals[e.id] ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ResourceSummary title="Raw Material Shopping List" totals={result.rawTotals} />

        <div className="panel p-4">
          <h3 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-3 border-b border-seam pb-2">
            Per-Structure Breakdown
          </h3>
          <ResultTable
            columns={[
              { key: "structure", header: "Target" },
              { key: "tool", header: "Method" },
              { key: "sulfur", header: "Sulfur", align: "right" },
            ]}
            rows={breakdownRows}
            emptyMessage="Breakdown appears here."
          />
        </div>
      </div>
    </div>
  );
}
