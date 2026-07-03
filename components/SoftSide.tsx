"use client";

import { MELEE_TOOLS, SOFT_SIDE_TARGETS } from "@/data/meleeRaiding";
import { AUTO_TURRET_HP, TURRET_METHODS } from "@/data/turrets";
import ItemIcon from "./ItemIcon";
import ResultTable, { type ResultRow } from "./ResultTable";

const formatter = new Intl.NumberFormat("en-US");

/**
 * Feature 3 — Soft-side melee raiding + anti-turret reference tables.
 */
export default function SoftSide() {
  const softSideRows: ResultRow[] = SOFT_SIDE_TARGETS.map((target) => ({
    id: target.id,
    cells: {
      target: { value: `${target.name} (${formatter.format(target.hp)} HP)`, icon: target.icon },
      ...Object.fromEntries(
        MELEE_TOOLS.map((tool) => {
          const hits = target.hits[tool.id];
          if (hits === null || hits === undefined) {
            return [tool.id, { value: "—", muted: true }];
          }
          const toolsNeeded = Math.ceil(hits / tool.durabilityHits);
          return [tool.id, { value: `${hits} hits (${toolsNeeded} tool${toolsNeeded > 1 ? "s" : ""})` }];
        }),
      ),
    },
  }));

  const turretRows: ResultRow[] = TURRET_METHODS.map((m) => ({
    id: m.id,
    cells: {
      method: { value: m.name, icon: m.icon },
      quantity: { value: `×${formatter.format(m.quantity)}` },
      sulfur: m.sulfurCost === 0
        ? { value: "FREE", highlight: true }
        : { value: formatter.format(m.sulfurCost), highlight: false },
      notes: { value: m.notes, muted: true },
    },
  }));

  return (
    <div className="space-y-8">
      <section className="panel p-4">
        <h2 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-1 border-b border-seam pb-2">
          Soft-Side Melee Raiding
        </h2>
        <p className="text-sm text-ash my-3 max-w-3xl">
          Every building block has a hard side and a soft side. Melee tools deal real damage only to the
          soft side — the inside face of walls, the upper face of floors. Hit counts below assume clean
          soft-side hits; tool counts account for durability.
        </p>
        <ResultTable
          columns={[
            { key: "target", header: "Target" },
            ...MELEE_TOOLS.map((t) => ({ key: t.id, header: t.name, align: "right" as const })),
          ]}
          rows={softSideRows}
        />
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {MELEE_TOOLS.map((tool) => (
            <div key={tool.id} className="flex items-start gap-2 bg-pit/60 border border-seam rounded-sm px-3 py-2">
              <ItemIcon icon={tool.icon} alt={tool.name} size={28} />
              <p className="text-xs text-ash">
                <span className="text-bone font-display uppercase tracking-wider">{tool.name}</span>
                {" — ~"}{tool.durabilityHits} hits per tool. {tool.notes}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h2 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-1 border-b border-seam pb-2">
          Auto Turret Destruction ({formatter.format(AUTO_TURRET_HP)} HP)
        </h2>
        <p className="text-sm text-ash my-3 max-w-3xl">
          The classic sulfur-free method: a Compound Bow fired from beyond the turret&apos;s 30&nbsp;m engagement
          range, or from an angle it cannot see. The turret never shoots back — it just costs arrows and patience.
        </p>
        <ResultTable
          columns={[
            { key: "method", header: "Method" },
            { key: "quantity", header: "Qty", align: "right" },
            { key: "sulfur", header: "Sulfur Cost", align: "right" },
            { key: "notes", header: "Notes" },
          ]}
          rows={turretRows}
        />
      </section>
    </div>
  );
}
