"use client";

import { usePathname } from "next/navigation";
import { useId, type ReactNode } from "react";

import { NavItem } from "@/components/ui/nav-item";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { DASHBOARD_NAV, HELP_LINKS, isActivePage } from "./nav";

type NavVariant = "sidebar" | "rail" | "sheet";

/**
 * The grouped dashboard navigation (Overview · Protection · Engagement ·
 * Server), one list for the sidebar, the icon rail and the phone drawer so
 * labels, order and the active state never drift between them.
 */
export function DashboardNavList({
  variant,
  onNavigate,
  firstLinkId,
}: {
  variant: NavVariant;
  /** Called on a link click (the drawer closes itself). */
  onNavigate?: () => void;
  /** id for the first link (the drawer focuses it when opened by keyboard). */
  firstLinkId?: string;
}) {
  const pathname = usePathname();
  const baseId = useId();
  const rail = variant === "rail";

  return (
    <nav aria-label="Dashboard" className={cn("flex flex-col", variant === "sheet" ? "gap-5" : "gap-4")}>
      {DASHBOARD_NAV.map((group, groupIndex) => {
        const labelId = `${baseId}-${group.id}`;
        return (
          <div key={group.id} className="flex flex-col">
            {group.label ? (
              rail ? (
                <>
                  <span aria-hidden="true" className="mx-auto mb-3 h-px w-6 bg-line" />
                  <span id={labelId} className="sr-only">
                    {group.label}
                  </span>
                </>
              ) : (
                <p id={labelId} className={cn("pb-1.5 type-eyebrow text-fg-tertiary", variant === "sheet" ? "px-3" : "px-2.5")}>
                  {group.label}
                </p>
              )
            ) : null}
            <ul aria-labelledby={group.label ? labelId : undefined} className="flex flex-col gap-0.5">
              {group.items.map((page, itemIndex) => (
                <li key={page.href}>
                  <WithTooltip label={page.label} enabled={rail}>
                    <NavItem
                      id={groupIndex === 0 && itemIndex === 0 ? firstLinkId : undefined}
                      variant={variant === "sheet" ? "sheet" : "sidebar"}
                      collapsed={rail}
                      href={page.href}
                      icon={page.icon}
                      active={isActivePage(pathname, page.href)}
                      onClick={onNavigate}
                    >
                      {page.label}
                    </NavItem>
                  </WithTooltip>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

/** Documentation + support server, under the main navigation. */
export function HelpNavList({ variant, onNavigate }: { variant: NavVariant; onNavigate?: () => void }) {
  const labelId = useId();
  const rail = variant === "rail";
  return (
    <nav aria-labelledby={labelId} className="flex flex-col">
      <p id={labelId} className={cn("pb-1.5 type-eyebrow text-fg-tertiary", rail && "sr-only", variant === "sheet" ? "px-3" : "px-2.5")}>
        Help
      </p>
      <ul className="flex flex-col gap-0.5">
        {HELP_LINKS.map((link) => (
          <li key={link.href}>
            <WithTooltip label={link.label} enabled={rail}>
              <NavItem
                variant={variant === "sheet" ? "sheet" : "sidebar"}
                collapsed={rail}
                href={link.href}
                icon={link.icon}
                onClick={onNavigate}
                // Icon rail: the label is sr-only; drop the ↗ so the icon stays centred
                // (the sr-only "opens in a new tab" hint remains).
                className={rail ? "[&>span+svg]:hidden" : undefined}
              >
                {link.label}
              </NavItem>
            </WithTooltip>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function WithTooltip({ label, enabled, children }: { label: string; enabled: boolean; children: React.ReactElement }): ReactNode {
  if (!enabled) return children;
  return (
    <Tooltip content={label} side="right">
      {children}
    </Tooltip>
  );
}
