"use client";

import ItemIcon from "./ItemIcon";

interface ItemInputProps {
  icon: string;
  label: string;
  sublabel?: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

/**
 * Reusable labelled number input with an item sprite.
 * Recalculation is live — parent state updates on every keystroke.
 */
export default function ItemInput({ icon, label, sublabel, value, onChange, max = 999999 }: ItemInputProps) {
  return (
    <label className="flex items-center gap-3 panel px-3 py-2 hover:border-rust/50 transition-colors cursor-text">
      <ItemIcon icon={icon} alt={label} size={36} className="shrink-0 drop-shadow" />
      <span className="flex-1 min-w-0">
        <span className="block font-display text-sm uppercase tracking-wider truncate">{label}</span>
        {sublabel && <span className="block text-xs text-ash truncate">{sublabel}</span>}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        value={value === 0 ? "" : value}
        placeholder="0"
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          onChange(Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(max, parsed)));
        }}
        className="input-field w-24 shrink-0"
      />
    </label>
  );
}
