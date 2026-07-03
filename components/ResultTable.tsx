"use client";

import ItemIcon from "./ItemIcon";

export interface ResultColumn {
  key: string;
  header: string;
  align?: "left" | "right";
}

export interface ResultCell {
  value: string | number;
  icon?: string;
  muted?: boolean;
  highlight?: boolean;
}

export interface ResultRow {
  id: string;
  cells: Record<string, ResultCell>;
}

interface ResultTableProps {
  columns: ResultColumn[];
  rows: ResultRow[];
  emptyMessage?: string;
}

/**
 * Reusable rust-themed results table. Horizontal scroll on small screens.
 */
export default function ResultTable({ columns, rows, emptyMessage = "Nothing to show yet." }: ResultTableProps) {
  if (rows.length === 0) {
    return <p className="text-ash text-sm italic px-1 py-3">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[480px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`th-industrial ${col.align === "right" ? "text-right" : ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-rust/5 transition-colors">
              {columns.map((col) => {
                const cell = row.cells[col.key];
                if (!cell) return <td key={col.key} className="td-industrial text-ash">—</td>;
                return (
                  <td
                    key={col.key}
                    className={`td-industrial ${col.align === "right" ? "text-right font-display tracking-wide" : ""} ${
                      cell.muted ? "text-ash" : ""
                    } ${cell.highlight ? "text-sulfur font-semibold" : ""}`}
                  >
                    {cell.icon ? (
                      <span className="inline-flex items-center gap-2">
                        <ItemIcon icon={cell.icon} alt="" size={22} />
                        {cell.value}
                      </span>
                    ) : (
                      cell.value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
