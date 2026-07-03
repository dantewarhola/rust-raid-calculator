"use client";

import { useState, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Sectioned single-page layout. Tab panels stay mounted (hidden with CSS)
 * so calculator state survives switching tabs.
 */
export default function Tabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Calculator sections"
        className="flex overflow-x-auto border-b border-seam mb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 px-4 py-3 font-display text-sm uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px
              ${
                active === tab.id
                  ? "text-rust-glow border-rust"
                  : "text-ash border-transparent hover:text-bone hover:border-seam"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={active !== tab.id}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
