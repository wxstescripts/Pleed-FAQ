import {
  Activity,
  BookOpen,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  Lock,
  Rocket,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";

import { FOOTER_GROUPS, INVITE_URL, NAV_LINKS, SUPPORT_URL, type NavLink } from "@/lib/site";
import { isExternalHref } from "@/lib/utils";

/**
 * Site-chrome view of the links in `@/lib/site` (the single source of
 * truth). Nothing here invents a destination: it only splits, filters and
 * decorates NAV_LINKS / FOOTER_GROUPS.
 */

/** The dashboard is the "log in" of a bot site: it sits beside the CTA on desktop, not among the page links. */
export const DASHBOARD_HREF = "/dashboard";

/** Page links in the centred desktop nav (everything but the dashboard). */
export const PAGE_LINKS: readonly NavLink[] = NAV_LINKS.filter((link) => link.href !== DASHBOARD_HREF);

/** The dashboard link as declared in NAV_LINKS (falls back to a plain entry if it is ever renamed). */
export const DASHBOARD_LINK: NavLink =
  NAV_LINKS.find((link) => link.href === DASHBOARD_HREF) ?? { label: "Dashboard", href: DASHBOARD_HREF };

/** Icons for the mobile menu rows, keyed by href. Rows without an entry simply render without one. */
export const LINK_ICONS: Readonly<Record<string, LucideIcon>> = {
  "/#features": LayoutGrid,
  "/commands": SquareTerminal,
  "/docs": BookOpen,
  "/status": Activity,
  [DASHBOARD_HREF]: LayoutDashboard,
  "/docs/getting-started": Rocket,
  [SUPPORT_URL]: LifeBuoy,
  "/privacy": Lock,
  "/terms": FileText,
};

/**
 * Secondary links for the mobile menu: every footer link that the primary
 * nav doesn't already cover (the docs index is "Docs", the invite is the
 * sheet's CTA) — today: Getting started, Support server, Privacy, Terms.
 */
export const SECONDARY_LINKS: readonly NavLink[] = (() => {
  const covered = new Set<string>([...NAV_LINKS.map((link) => link.href), INVITE_URL]);
  const seen = new Set<string>();
  return FOOTER_GROUPS.flatMap((group) => group.links).filter((link) => {
    if (covered.has(link.href) || seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
})();

/**
 * Whether a nav link is the current page. In-page anchors ("/#features")
 * are never "the page"; a section index is active on its sub-pages too
 * (/docs/getting-started → Docs).
 */
export function isActiveLink(href: string, pathname: string | null): boolean {
  if (!pathname || href.includes("#") || isExternalHref(href)) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Splits "/#features" into its path and fragment id ("/" + "features"); null without a fragment. */
export function splitHash(href: string): { path: string; id: string } | null {
  const index = href.indexOf("#");
  if (index === -1 || index === href.length - 1) return null;
  return { path: href.slice(0, index) || "/", id: href.slice(index + 1) };
}
