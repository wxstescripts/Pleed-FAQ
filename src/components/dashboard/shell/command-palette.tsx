"use client";

import { ArrowUpRight, CornerDownLeft, LogOut, Plus, Search, type LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { useLeaveGuard } from "@/components/ui/save-bar";
import { INVITE_URL } from "@/lib/site";
import { cn, isExternalHref } from "@/lib/utils";

import { DASHBOARD_PAGES, HELP_LINKS, SITE_LINKS } from "./nav";

/* ------------------------------------------------------------------ */
/* Context: any trigger (sidebar, app bar, rail) opens the one palette */
/* ------------------------------------------------------------------ */

const PaletteContext = createContext<{ openPalette: () => void } | null>(null);

export function usePalette() {
  const value = use(PaletteContext);
  if (!value) throw new Error("usePalette must be used inside <PaletteProvider>.");
  return value;
}

/**
 * Ctrl/⌘ + K anywhere in the dashboard opens the search palette (and closes
 * it again). Renders the palette once for the whole shell.
 */
export function PaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ openPalette }), [openPalette]);

  return (
    <PaletteContext value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </PaletteContext>
  );
}

/* ------------------------------------------------------------------ */
/* Items and matching                                                  */
/* ------------------------------------------------------------------ */

type PaletteAction = { kind: "link"; href: string } | { kind: "logout" };

type PaletteItem = {
  id: string;
  group: "Pages" | "Help" | "Account";
  label: string;
  description: string;
  icon: LucideIcon;
  keywords: readonly string[];
  action: PaletteAction;
};

const ITEMS: readonly PaletteItem[] = [
  ...DASHBOARD_PAGES.map<PaletteItem>((page) => ({
    id: `page-${page.href}`,
    group: "Pages",
    label: page.label,
    description: page.description,
    icon: page.icon,
    keywords: page.keywords,
    action: { kind: "link", href: page.href },
  })),
  {
    id: "invite",
    group: "Help",
    label: "Add Pleed to another server",
    description: "Opens Discord's authorisation page",
    icon: Plus,
    keywords: ["invite", "add bot", "add to discord", "new server"],
    action: { kind: "link", href: INVITE_URL },
  },
  ...[...HELP_LINKS, ...SITE_LINKS].map<PaletteItem>((link) => ({
    id: `help-${link.href}`,
    group: "Help",
    label: link.label,
    description: link.description,
    icon: link.icon,
    keywords: link.href === "/docs" ? ["docs", "guide", "help", "setup"] : link.href === "/" ? ["website", "landing"] : ["help", "discord"],
    action: { kind: "link", href: link.href },
  })),
  {
    id: "logout",
    group: "Account",
    label: "Log out",
    description: "Sign out of the dashboard",
    icon: LogOut,
    keywords: ["sign out", "logout", "log off"],
    action: { kind: "logout" },
  },
];

const GROUP_ORDER: readonly PaletteItem["group"][] = ["Pages", "Help", "Account"];

type Match = { item: PaletteItem; score: number; hint: string | null };

function matchItem(item: PaletteItem, query: string): Match | null {
  if (!query) return { item, score: 0, hint: null };
  const label = item.label.toLowerCase();
  if (label.startsWith(query)) return { item, score: 4, hint: null };
  if (label.split(/[\s&-]+/).some((word) => word.startsWith(query))) return { item, score: 3, hint: null };
  if (label.includes(query)) return { item, score: 2.5, hint: null };
  const keyword =
    item.keywords.find((word) => word.startsWith(query)) ?? item.keywords.find((word) => word.includes(query));
  if (keyword) return { item, score: 2, hint: keyword };
  // Several words ("ban kick"): every word must hit the label or a keyword.
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const haystack = [label, ...item.keywords].join(" ");
    if (words.every((word) => haystack.includes(word))) return { item, score: 1.5, hint: null };
  }
  if (item.description.toLowerCase().includes(query)) return { item, score: 1, hint: null };
  return null;
}

/* ------------------------------------------------------------------ */
/* The palette                                                         */
/* ------------------------------------------------------------------ */

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { confirmLeave } = useLeaveGuard();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const normalised = query.trim().toLowerCase();
  const { groups, flat } = useMemo(() => {
    const matches = ITEMS.map((item) => matchItem(item, normalised)).filter((match): match is Match => match !== null);
    const grouped = GROUP_ORDER.map((group) => ({
      group,
      matches: matches.filter((match) => match.item.group === group).sort((a, b) => b.score - a.score),
    })).filter((entry) => entry.matches.length > 0);
    // Options are numbered in display order (groups, then score) for the arrow keys.
    let position = 0;
    const numbered = grouped.map((entry) => ({
      group: entry.group,
      matches: entry.matches.map((match) => ({ ...match, position: position++ })),
    }));
    return { groups: numbered, flat: numbered.flatMap((entry) => entry.matches) };
  }, [normalised]);
  const active = flat.length ? Math.min(activeIndex, flat.length - 1) : -1;
  const optionId = (position: number) => `${baseId}-option-${position}`;

  // Keep the active option visible while arrowing through a scrolled list.
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${baseId}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, baseId]);

  const reset = () => {
    setQuery("");
    setActiveIndex(0);
  };

  const run = async (item: PaletteItem) => {
    onOpenChange(false);
    if (item.action.kind === "logout") {
      if (await confirmLeave()) void signOut();
      return;
    }
    const { href } = item.action;
    if (isExternalHref(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (await confirmLeave()) router.push(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!flat.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((active + step + flat.length) % flat.length);
    } else if (event.key === "Home" && flat.length) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && flat.length) {
      event.preventDefault();
      setActiveIndex(flat.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0) void run(flat[active].item);
    } else if (event.key === "Escape" && query) {
      // First Escape clears the query; the next one closes the palette.
      event.preventDefault();
      event.stopPropagation();
      reset();
    }
  };

  const resultLabel = flat.length === 1 ? "1 result" : `${flat.length} results`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) reset();
      }}
    >
      <DialogContent
        title="Search the dashboard"
        size="lg"
        // Phones: drop down from the top (the on-screen keyboard covers the bottom half).
        className="max-sm:top-0 max-sm:bottom-auto max-sm:rounded-t-none max-sm:rounded-b-2xl max-sm:pt-[env(safe-area-inset-top)] max-sm:pb-0 max-sm:data-ending-style:-translate-y-8 max-sm:data-starting-style:-translate-y-8"
      >
        <div className="flex flex-col gap-3">
          <Input
            role="combobox"
            aria-label="Search pages, settings and help"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            type="search"
            enterKeyHint="go"
            autoComplete="off"
            spellCheck={false}
            placeholder="Try “prefix”, “ban threshold” or “verification”"
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            startAdornment={<Search />}
            className="[&::-webkit-search-cancel-button]:appearance-none"
          />

          <div
            id={listId}
            role="listbox"
            aria-label="Results"
            className="-mx-2 max-h-[min(24rem,55dvh)] overflow-y-auto overscroll-contain px-2"
          >
            {groups.map(({ group, matches }) => {
              const groupLabelId = `${baseId}-${group}`;
              return (
                <div key={group} role="group" aria-labelledby={groupLabelId} className="flex flex-col gap-0.5 pb-2">
                  <div id={groupLabelId} role="presentation" className="px-3 pt-2 pb-1.5 type-eyebrow text-fg-tertiary">
                    {group}
                  </div>
                  {matches.map(({ item, hint, position }) => {
                    const selected = position === active;
                    const external = item.action.kind === "link" && isExternalHref(item.action.href);
                    return (
                      <div
                        key={item.id}
                        id={optionId(position)}
                        role="option"
                        aria-selected={selected}
                        onClick={() => void run(item)}
                        onMouseMove={() => {
                          if (!selected) setActiveIndex(position);
                        }}
                        className={cn(
                          "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-fg-secondary select-none",
                          "transition-colors duration-150 ease-standard aria-selected:bg-selected aria-selected:text-fg",
                          "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-focus before:opacity-0 aria-selected:before:opacity-100",
                        )}
                      >
                        <IconTile
                          icon={item.icon}
                          size="sm"
                          tone={selected ? (item.action.kind === "logout" ? "danger" : "brand") : "neutral"}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate type-label">{item.label}</span>
                          <span className="truncate type-caption text-fg-tertiary">
                            {hint ? (
                              <>
                                Matches <span className="text-fg-secondary">“{hint}”</span>
                              </>
                            ) : (
                              item.description
                            )}
                          </span>
                        </span>
                        {external ? (
                          <>
                            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-fg-tertiary" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </>
                        ) : (
                          <CornerDownLeft
                            aria-hidden="true"
                            className={cn(
                              "size-4 shrink-0 text-fg-tertiary opacity-0 transition-opacity duration-150 pointer-coarse:hidden",
                              selected && "opacity-100",
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {flat.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
              <p className="type-label text-fg">No matches for “{query.trim()}”</p>
              <p className="type-caption text-fg-tertiary">
                Search covers dashboard pages, the settings on them and help links.
              </p>
            </div>
          ) : null}

          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {normalised ? resultLabel : ""}
          </p>

          <div
            aria-hidden="true"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-subtle pt-3 type-caption text-fg-tertiary pointer-coarse:hidden"
          >
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              to move
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              to open
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              to close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
