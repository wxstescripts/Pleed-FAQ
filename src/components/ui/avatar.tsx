"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

const sizes = {
  xs: { box: "size-6 text-xs tracking-tight", px: 24 },
  sm: { box: "size-8 text-xs", px: 32 },
  md: { box: "size-10 text-sm", px: 40 },
  lg: { box: "size-12 text-base", px: 48 },
  xl: { box: "size-16 text-lg", px: 64 },
} as const;

export type AvatarProps = {
  /** Image URL (e.g. a Discord CDN avatar). Falls back to initials on error/absence. */
  src?: string | null;
  /** Used for initials and as the accessible name. */
  name?: string | null;
  /** Set when the avatar sits next to the visible name (default true → alt=""). */
  decorative?: boolean;
  size?: keyof typeof sizes;
  shape?: "circle" | "rounded";
  className?: string;
};

function initialsOf(name?: string | null) {
  const clean = (name ?? "").trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : clean.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Avatar with next/image and an initials fallback (never crashes on a null
 * name). Never squashes: fixed square + shrink-0.
 */
export function Avatar({ src, name, decorative = true, size = "md", shape = "circle", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const { box, px } = sizes[size];
  const label = name?.trim() || "Unknown";
  const showImage = Boolean(src) && !failed;

  return (
    <span
      role={!decorative && !showImage ? "img" : undefined}
      aria-label={!decorative && !showImage ? label : undefined}
      aria-hidden={decorative && !showImage ? true : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line-strong bg-surface-3 font-medium text-fg-secondary select-none",
        shape === "circle" ? "rounded-full" : "rounded-lg",
        box,
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={decorative ? "" : label}
          width={px}
          height={px}
          sizes={`${px}px`}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
