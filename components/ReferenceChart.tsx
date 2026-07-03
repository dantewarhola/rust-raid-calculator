"use client";

import { EXPLOSIVES } from "@/data/explosives";
import { STRUCTURES } from "@/data/structures";
import ItemIcon from "./ItemIcon";

const formatter = new Intl.NumberFormat("en-US");

/**
 * Static raid chart mirroring the rustlabs raiding tables:
 * every structure × every explosive, quantity to destroy.
 */
export default function ReferenceChart() {
  return (
    <div className="panel p-4">
      <h2 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-1 border-b border-seam pb-2">
        Raid Chart Reference
      </h2>
      <p className="text-sm text-ash my-3">
        Quantity of each explosive required to destroy one unit (hard side). Data mirrors the
        rustlabs.com raiding tables — see <code className="text-bone">data/structures.ts</code> for the source of truth.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr>
              <th className="th-industrial">Structure</th>
              <th className="th-industrial text-right">HP</th>
              {EXPLOSIVES.map((e) => (
                <th key={e.id} className="th-industrial text-center">
                  <span className="inline-flex flex-col items-center gap-1">
                    <ItemIcon icon={e.icon} alt={e.name} size={26} />
                    {e.shortName}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STRUCTURES.map((s) => (
              <tr key={s.id} className="hover:bg-rust/5 transition-colors">
                <td className="td-industrial">
                  <span className="inline-flex items-center gap-2">
                    <ItemIcon icon={s.icon} alt={s.name} size={24} />
                    {s.name}
                  </span>
                </td>
                <td className="td-industrial text-right font-display">{formatter.format(s.hp)}</td>
                {EXPLOSIVES.map((e) => {
                  const qty = s.toDestroy[e.id];
                  return (
                    <td key={e.id} className={`td-industrial text-center font-display ${qty === null ? "text-ash/40" : ""}`}>
                      {qty === null ? "—" : formatter.format(qty)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
