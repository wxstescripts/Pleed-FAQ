"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Logo } from "@/components/ui/logo";
import { NavItem } from "@/components/ui/nav-item";
import { Sheet, SheetContent, SheetNavItem, SheetTrigger } from "@/components/ui/sheet";
import { INVITE_URL, NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

import { isActiveLink, LINK_ICONS, SECONDARY_LINKS, splitHash } from "./nav-config";

/** Same breakpoint as Tailwind's `lg`, where the desktop nav takes over. */
const DESKTOP_QUERY = "(min-width: 64rem)";

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * The phone/tablet site menu: a labelled trigger (≥ 44 px, aria-expanded /
 * aria-controls from Base UI) that opens the shared Sheet — focus trap,
 * Escape, backdrop, scroll lock, inert page and focus return come with it.
 *
 * Closes on any link click, on route change (Back/Forward included) and when
 * the window grows into the desktop layout. A same-page anchor ("/#features"
 * on the home page) waits until the sheet has closed and released its
 * scroll lock, then navigates — otherwise the lock's cleanup could restore
 * the old scroll position over the jump.
 */
export function MobileMenu({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const firstLinkId = useId();
  const moreLabelId = useId();
  const descriptionIdPrefix = useId();

  // Route changed (link, Back/Forward, redirect) → close. Adjusting state during
  // render is React's recommended way to reset state on a prop change.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Rotating a tablet or widening the window into the desktop layout hides the trigger: close.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const onLinkClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return;
    const hash = splitHash(href);
    if (hash && hash.path === window.location.pathname) {
      event.preventDefault();
      pendingHref.current = href;
    }
    setOpen(false);
  };

  const onOpenChangeComplete = (isOpen: boolean) => {
    if (isOpen || !pendingHref.current) return;
    const href = pendingHref.current;
    pendingHref.current = null;
    router.push(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} onOpenChangeComplete={onOpenChangeComplete}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className={cn("size-11 text-fg data-popup-open:bg-selected", className)}
          />
        }
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        title="Menu"
        hideTitle
        headerStart={<Logo size="sm" />}
        // Keyboard and mouse: start on the first link. Touch: the sheet itself (Base UI default).
        initialFocus={(type) => (type === "touch" ? true : document.getElementById(firstLinkId))}
        bodyClassName="flex flex-col gap-6 py-4"
        footer={
          <Button variant="discord" size="lg" fullWidth href={INVITE_URL} onClick={() => setOpen(false)}>
            <DiscordIcon className="size-5" />
            Add to Discord
          </Button>
        }
      >
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link, index) => {
              const descriptionId = `${descriptionIdPrefix}-${index}`;
              return (
                <li key={link.href}>
                  <SheetNavItem
                    id={index === 0 ? firstLinkId : undefined}
                    href={link.href}
                    icon={LINK_ICONS[link.href]}
                    external={link.external}
                    active={isActiveLink(link.href, pathname)}
                    aria-describedby={link.description ? descriptionId : undefined}
                    onClick={onLinkClick(link.href)}
                    className="py-2"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{link.label}</span>
                      {link.description ? (
                        // Shown under the label; announced as the link's description, not its name.
                        <span id={descriptionId} aria-hidden="true" className="truncate type-caption text-fg-tertiary">
                          {link.description}
                        </span>
                      ) : null}
                    </span>
                  </SheetNavItem>
                </li>
              );
            })}
          </ul>
        </nav>

        {SECONDARY_LINKS.length > 0 ? (
          <nav aria-labelledby={moreLabelId} className="flex flex-col gap-2 border-t border-line-subtle pt-5">
            <p id={moreLabelId} className="px-3 type-eyebrow text-fg-tertiary">
              More
            </p>
            <ul className="flex flex-col gap-0.5">
              {SECONDARY_LINKS.map((link) => (
                <li key={link.href}>
                  <NavItem
                    variant="sidebar"
                    href={link.href}
                    icon={LINK_ICONS[link.href]}
                    external={link.external}
                    active={isActiveLink(link.href, pathname)}
                    onClick={onLinkClick(link.href)}
                    className="px-3"
                  >
                    {link.label}
                  </NavItem>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
