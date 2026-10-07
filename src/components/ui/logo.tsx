import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The Pleed "P" glyph, drawn as a single stroke on a 32×32 grid and optically
 * centred inside the tile. Exported so icon/OG generators can reuse it.
 */
export const LOGO_P_PATH = "M11.25 23.5V8.75h5.5a4.6 4.6 0 0 1 0 9.2h-5.5";
/** Brand gradient stops for the mark (violet → indigo, 135°). */
export const LOGO_GRADIENT = { from: "#9a46f0", to: "#4550ea" } as const;

/** Tile sizes; the radius stays ~30% of the edge using the radius scale. */
const markSizes = {
  xs: "size-5 rounded-sm",
  sm: "size-6 rounded-md",
  md: "size-8 rounded-lg",
  lg: "size-10 rounded-xl",
  xl: "size-14 rounded-2xl",
} as const;

const wordSizes = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-3xl",
} as const;

export type LogoSize = keyof typeof markSizes;

/** The brand mark: gradient tile + P glyph. Decorative by default. */
export function LogoMark({
  size = "md",
  className,
  title,
}: {
  size?: LogoSize;
  className?: string;
  /** Accessible name; omit when a visible "Pleed" wordmark sits next to it. */
  title?: string;
}) {
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-linear-135 from-brand-violet to-brand-indigo inset-shadow-mark",
        markSizes[size],
        className,
      )}
    >
      {/* soft top light */}
      <span className="pointer-events-none absolute inset-0 bg-sheen" />
      <svg viewBox="0 0 32 32" fill="none" className="relative size-full text-fg-on-brand">
        <path
          d={LOGO_P_PATH}
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export type LogoProps = {
  size?: LogoSize;
  /** Hide the "Pleed" wordmark (mark only — then pass `title`). */
  markOnly?: boolean;
  /** Wrap in a link (usually "/"). */
  href?: string;
  className?: string;
  /** Accessible name for mark-only usage. */
  title?: string;
};

/** Mark + wordmark lockup. With `href` it becomes the home link. */
export function Logo({ size = "md", markOnly = false, href, className, title = "Pleed" }: LogoProps) {
  const content = (
    <>
      <LogoMark size={size} title={markOnly ? title : undefined} />
      {markOnly ? null : (
        <span
          // Size first: cn drops a leading-* that comes before a text-* size.
          className={cn(wordSizes[size], "type-wordmark leading-none text-fg")}
        >
          Pleed
        </span>
      )}
    </>
  );
  const classes = cn("inline-flex shrink-0 items-center gap-2.5", className);
  if (!href) return <span className={classes}>{content}</span>;
  return (
    <Link
      href={href}
      aria-label={markOnly ? `${title} home` : undefined}
      className={cn(classes, "-m-1.5 rounded-lg p-1.5 focus-visible:focus-ring pointer-coarse:min-h-11 pointer-coarse:min-w-11")}
    >
      {content}
    </Link>
  );
}
