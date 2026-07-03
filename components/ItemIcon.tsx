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
 * Building-block renders (walls, doorways, floors, window frames) are
 * downloaded as WEBP from the rusthelp CDN — they are not inventory items
 * and have no PNG shortname sprite. Try .webp for them, .png for items,
 * with generated .svg placeholders as the shared fallback.
 */
const WEBP_PREFIXES = ["wall-", "doorway-", "floor-", "window-"];

/**
 * Renders an item sprite from /public/icons.
 *
 * Icons are downloaded by `npm run icons` (see scripts/download-icons.mjs).
 * The script writes PNGs when the CDN delivers them and generates themed
 * SVG placeholders otherwise, so BOTH extensions can exist. We try .png
 * first and fall back to .svg on error.
 */
export default function ItemIcon({ icon, alt, size = 32, className }: ItemIconProps) {
  const [ext, setExt] = useState<"png" | "webp" | "svg">(() =>
    WEBP_PREFIXES.some((p) => icon.startsWith(p)) ? "webp" : "png",
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
        if (ext !== "svg") setExt("svg");
      }}
    />
  );
}
