"use client";

import { usePathname } from "next/navigation";

import { NavItem } from "@/components/ui/nav-item";
import { cn } from "@/lib/utils";

import { isActiveLink, PAGE_LINKS } from "./nav-config";

/**
 * Centred page links of the desktop header (≥ lg). A client island only to
 * read the pathname for `aria-current` + the brand underline.
 */
export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={cn("hidden lg:block", className)}>
      <ul className="flex items-center gap-1">
        {PAGE_LINKS.map((link) => (
          <li key={link.href}>
            <NavItem href={link.href} active={isActiveLink(link.href, pathname)} external={link.external}>
              {link.label}
            </NavItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}
