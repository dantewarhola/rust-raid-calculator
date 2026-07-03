"use client";

import { RESOURCES, type ResourceId } from "@/data/resources";
import ItemIcon from "./ItemIcon";

interface ResourceSummaryProps {
  title: string;
  totals: Partial<Record<ResourceId, number>>;
}

const formatter = new Intl.NumberFormat("en-US");

/**
 * "Shopping list" panel: total raw materials, sprite per resource.
 * Sulfur gets highlight treatment — it is the raid bottleneck.
 */
export default function ResourceSummary({ title, totals }: ResourceSummaryProps) {
  const entries = RESOURCES.filter((r) => (totals[r.id] ?? 0) > 0);

  return (
    <div className="panel p-4">
      <h3 className="font-display uppercase tracking-[0.25em] text-rust text-sm mb-3 border-b border-seam pb-2">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-ash text-sm italic">Nothing needed yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {entries.map((res) => (
            <li
              key={res.id}
              className={`flex items-center gap-2 bg-pit/60 border border-seam rounded-sm px-2 py-1.5 ${
                res.id === "sulfur" ? "border-sulfur/60" : ""
              }`}
            >
              <ItemIcon icon={res.icon} alt={res.name} size={28} />
              <span className="min-w-0">
                <span
                  className={`block font-display text-base leading-tight ${
                    res.id === "sulfur" ? "text-sulfur" : ""
                  }`}
                >
                  {formatter.format(totals[res.id] ?? 0)}
                </span>
                <span className="block text-[11px] text-ash uppercase tracking-wider truncate">{res.name}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
