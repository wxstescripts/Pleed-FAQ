import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type NavItemVariant = "header" | "sidebar" | "sheet";

export type NavItemProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  /** Current page → aria-current="page" + the 2 px brand indicator. Compute it with usePathname() in the parent. */
  active?: boolean;
  /**
   * - "header": horizontal site/dashboard top-bar link (36 px, 44 px on touch), underline indicator.
   * - "sidebar": full-width dashboard sidebar row (36 px, 44 px on touch), left indicator.
   * - "sheet": large drawer row for Sheet navigation (48 px), left indicator.
   */
  variant?: NavItemVariant;
  /** Leading lucide icon (16 px; 20 px in sheets). Stroke stays the lucide default (2). */
  icon?: LucideIcon;
  /** Trailing element: a count Badge, "New" badge, PlaceholderBadge… (sidebar/sheet). */
  badge?: ReactNode;
  /** Force external behaviour (auto-detected for http(s) URLs): new tab, ↗, sr-only hint. */
  external?: boolean;
  /** Sidebar icon rail: the label becomes screen-reader only. Wrap in <Tooltip content={label}>. */
  collapsed?: boolean;
};

const variants: Record<NavItemVariant, string> = {
  header: cn(
    "h-9 shrink-0 gap-2 rounded-md px-3 text-sm pointer-coarse:h-11 [&_svg]:size-4",
    // Active: 2 px brand underline under the label.
    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-400 after:opacity-0 after:transition-opacity after:duration-150 aria-[current=page]:after:opacity-100",
  ),
  sidebar: cn(
    "min-h-9 w-full gap-3 rounded-md px-2.5 text-sm pointer-coarse:min-h-11 [&_svg]:size-4",
    "aria-[current=page]:bg-selected",
    // Active: 2 px brand bar on the left edge.
    "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-400 before:opacity-0 before:transition-opacity before:duration-150 aria-[current=page]:before:opacity-100",
  ),
  sheet: cn(
    "min-h-12 w-full gap-3 rounded-lg px-3 text-base [&_svg]:size-5",
    "aria-[current=page]:bg-selected",
    "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-400 before:opacity-0 before:transition-opacity before:duration-150 aria-[current=page]:before:opacity-100",
  ),
};

/**
 * One navigation link with consistent hover / active / focus states for the
 * site header, the dashboard sidebar and drawer (Sheet) navigation.
 * Server-component safe. Put a list of them inside <nav aria-label=…>.
 *
 *   <NavItem href="/commands" active={pathname === "/commands"}>Commands</NavItem>
 *   <NavItem variant="sidebar" href="/dashboard/security" icon={ShieldAlert} active>Security</NavItem>
 */
export function NavItem({
  href,
  active = false,
  variant = "header",
  icon: Icon,
  badge,
  external,
  collapsed = false,
  className,
  children,
  ...props
}: NavItemProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const classes = cn(
    "group/nav relative flex items-center font-medium whitespace-nowrap text-fg-secondary select-none",
    "transition-[background-color,color] duration-150 ease-standard",
    "hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring",
    "aria-[current=page]:text-fg",
    "[&_svg]:shrink-0 [&_svg]:text-fg-tertiary [&_svg]:transition-colors hover:[&_svg]:text-fg-secondary aria-[current=page]:[&_svg]:text-brand-fg",
    variants[variant],
    collapsed && variant === "sidebar" && "justify-center px-0",
    className,
  );
  const content = (
    <>
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span className={cn("min-w-0 truncate", collapsed && "sr-only", variant !== "header" && "flex-1")}>{children}</span>
      {badge && !collapsed ? <span className="ml-auto flex shrink-0 items-center">{badge}</span> : null}
      {isExternal ? <ArrowUpRight aria-hidden="true" className="size-3.5! opacity-70" /> : null}
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={classes} {...props}>
      {content}
    </Link>
  );
}
