import { cn } from "@/lib/utils";

const sizes = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
} as const;

export type SpinnerProps = {
  size?: keyof typeof sizes;
  className?: string;
  /** Accessible label. Omit when the spinner is decorative (e.g. inside a busy button). */
  label?: string;
};

/**
 * Crisp SVG ring spinner (currentColor). Under reduced motion it keeps
 * turning, slower (2.4 s — globals.css): a frozen arc reads as a broken icon
 * and hides that work is in progress, and a small rotating indicator is not a
 * vestibular trigger (Apple and Material keep activity indicators spinning).
 */
export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0 animate-spin-slow", sizes[size], className)}
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.5" />
      <path d="M21.25 12A9.25 9.25 0 0 0 12 2.75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
