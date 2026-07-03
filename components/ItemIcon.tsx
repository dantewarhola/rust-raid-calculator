"use client";

import Image from "next/image";
import { useState } from "react";

interface ItemIconProps {
  /** Icon file name inside /public/icons (without extension). */
  icon: string;
  alt: string;
  size?: number;
  className?: string;
}

/**
 * Building-block icons are always generated SVGs (walls, doorways, floors,
 * window frames are not inventory items — no official sprite exists), so
 * skip the PNG attempt for them and avoid pointless 404s.
 */
const SVG_ONLY_PREFIXES = ["wall-", "doorway-", "floor-", "window-"];

/**
 * Renders an item sprite from /public/icons.
 *
 * Icons are downloaded by `npm run icons` (see scripts/download-icons.mjs).
 * The script writes PNGs when the CDN delivers them and generates themed
 * SVG placeholders otherwise, so BOTH extensions can exist. We try .png
 * first and fall back to .svg on error.
 */
export default function ItemIcon({ icon, alt, size = 32, className }: ItemIconProps) {
  const [ext, setExt] = useState<"png" | "svg">(() =>
    SVG_ONLY_PREFIXES.some((p) => icon.startsWith(p)) ? "svg" : "png",
  );

  return (
    <Image
      src={`/icons/${icon}.${ext}`}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={className}
      onError={() => {
        if (ext === "png") setExt("svg");
      }}
    />
  );
}
