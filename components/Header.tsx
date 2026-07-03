/**
 * Rust-style header: display-font wordmark, hammer + explosive glyphs,
 * riveted divider. Server component — no interactivity.
 */
export default function Header() {
  return (
    <header className="relative border-b-2 border-rust/70 bg-slab/80">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
        {/* Explosive glyph */}
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden className="shrink-0">
          <circle cx="20" cy="26" r="12" fill="#ce422b" />
          <circle cx="20" cy="26" r="12" fill="none" stroke="#9c2f1e" strokeWidth="2" />
          <rect x="17" y="10" width="6" height="6" fill="#3a3530" />
          <path d="M23 11 Q30 4 36 8" stroke="#e8c33c" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="37" cy="7" r="2.5" fill="#ff6a3d" />
          {/* hammer */}
          <rect x="26" y="24" width="14" height="5" rx="1" transform="rotate(45 26 24)" fill="#8c857a" />
          <rect x="30" y="18" width="8" height="7" rx="1" transform="rotate(45 30 18)" fill="#d9d2c5" />
        </svg>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-700 text-2xl sm:text-3xl uppercase tracking-[0.15em] leading-none">
            <span className="text-rust">Rust</span> Raid Calculator
          </h1>
          <p className="text-ash text-xs sm:text-sm tracking-wider mt-1">
            Raid costs · sulfur efficiency · soft-side reference
          </p>
        </div>
        <span className="hidden sm:block font-display text-xs uppercase tracking-[0.3em] text-ash border border-seam px-3 py-2">
          Wipe-ready
        </span>
      </div>
      {/* riveted divider */}
      <div className="h-1.5 bg-gradient-to-r from-rust-deep via-rust to-rust-deep opacity-80" />
    </header>
  );
}
