"use client";

import { BookOpen, ChevronDown, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { NavItem } from "@/components/ui/nav-item";
import { SearchField } from "@/components/ui/search-field";
import { Sheet, SheetContent, SheetNavItem, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { useRevealSelected, useScrollOverflow } from "@/components/ui/use-scroll-overflow";

import { ALL_ICON, categoryDocsHref, categoryMeta } from "./categories";
import { CommandCard } from "./command-card";
import { SyntaxLegend } from "./command-text";
import { buildIndex, buildMatcher, rank, suggestNames, tokenize } from "./search";
import type { CatalogCategory, CatalogCommand, CommandCatalog } from "./types";

/** Cards rendered on the server and on first paint; more follow as the list nears the viewport. */
const INITIAL_CARDS = 24;
const MORE_CARDS = 36;
/** Real command names offered when a search finds nothing and no close spelling exists. */
const FALLBACK_SUGGESTIONS = ["ban", "warn", "lockdown", "snipe", "setupticket"];
const PATH = "/commands";

function hrefFor(category: string | null, query: string): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category) params.set("category", category);
  const search = params.toString();
  return search ? `${PATH}?${search}` : PATH;
}

/** A plain left click we may handle in place (new-tab and modified clicks keep the browser default). */
function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * NavItem/SheetNavItem render next/link; every category link points at this
 * same dynamic route, so prefetching them would only fetch this page again.
 * (NavItem's props don't list `prefetch`; it is forwarded to next/link.)
 */
const NO_PREFETCH = { prefetch: false } as Record<string, unknown>;

type Group = { category: CatalogCategory; commands: CatalogCommand[]; total: number };

export type CommandExplorerProps = {
  catalog: CommandCatalog;
};

/**
 * The /commands explorer: search (debounced, highlighted, "/" to focus),
 * category filter (sidebar ≥ lg, chip row on tablets, a sheet on phones),
 * URL state (?q=&category=, Back/Forward aware) and a progressively rendered
 * card list. Server-rendered with the URL's state, then hydrated.
 */
export function CommandExplorer({ catalog }: CommandExplorerProps) {
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") ?? "").slice(0, 100);
  const categoryParam = searchParams.get("category")?.toLowerCase() ?? null;
  const category = catalog.categories.find((item) => item.slug === categoryParam) ?? null;

  /* ---------------------------------------------------------------- */
  /* Query state: input (instant) → query (debounced) → URL            */
  /* ---------------------------------------------------------------- */
  const [input, setInput] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
  if (urlQuery !== syncedUrlQuery) {
    // The URL changed under us (Back/Forward, or our own write landing): adopt it.
    setSyncedUrlQuery(urlQuery);
    if (urlQuery.trim() !== query.trim()) {
      setInput(urlQuery);
      setQuery(urlQuery);
    }
  }

  useEffect(() => {
    if (input === query) return;
    const timer = window.setTimeout(() => setQuery(input), input.trim() ? 160 : 0);
    return () => window.clearTimeout(timer);
  }, [input, query]);

  useEffect(() => {
    const next = query.trim();
    const params = new URLSearchParams(window.location.search);
    const current = (params.get("q") ?? "").trim();
    if (next === current) return;
    if (next) params.set("q", next);
    else params.delete("q");
    const search = params.toString();
    const url = search ? `${PATH}?${search}` : PATH;
    // A new search gets its own history entry; refining it replaces that entry.
    if (current) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }, [query]);

  /* ---------------------------------------------------------------- */
  /* Filtering                                                         */
  /* ---------------------------------------------------------------- */
  const index = useMemo(() => buildIndex(catalog.commands), [catalog.commands]);
  const names = useMemo(
    () => new Map(catalog.categories.map((item) => [item.slug, item.name] as const)),
    [catalog.categories],
  );
  const deferredQuery = useDeferredValue(query);
  const tokens = useMemo(() => tokenize(deferredQuery), [deferredQuery]);
  const matcher = useMemo(() => buildMatcher(tokens), [tokens]);
  const searching = tokens.length > 0;

  const pool = useMemo(
    () => (category ? index.filter((entry) => entry.command.category === category.slug) : index),
    [index, category],
  );
  const results = useMemo(
    () => (searching ? rank(pool, tokens) : pool.map((entry) => entry.command)),
    [pool, searching, tokens],
  );

  /* ---------------------------------------------------------------- */
  /* Progressive rendering                                             */
  /* ---------------------------------------------------------------- */
  const listKey = `${category?.slug ?? "all"}\u0000${tokens.join(" ")}`;
  const [paging, setPaging] = useState({ key: listKey, limit: INITIAL_CARDS });
  const limit = paging.key === listKey ? paging.limit : INITIAL_CARDS;
  const visible = results.length > limit ? results.slice(0, limit) : results;
  const hasMore = results.length > visible.length;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        startTransition(() =>
          setPaging((state) => ({
            key: listKey,
            limit: (state.key === listKey ? state.limit : INITIAL_CARDS) + MORE_CARDS,
          })),
        );
      },
      { rootMargin: "0px 0px 900px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, listKey, limit]);

  const groups = useMemo<Group[]>(() => {
    if (searching) return [];
    const byCategory = new Map<string, CatalogCommand[]>();
    for (const command of visible) {
      const list = byCategory.get(command.category) ?? [];
      list.push(command);
      byCategory.set(command.category, list);
    }
    return catalog.categories
      .filter((item) => byCategory.has(item.slug))
      .map((item) => ({ category: item, commands: byCategory.get(item.slug) ?? [], total: item.count }));
  }, [catalog.categories, searching, visible]);

  /* ---------------------------------------------------------------- */
  /* Sticky toolbar + category navigation                              */
  /* ---------------------------------------------------------------- */
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarSentinelRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = toolbarSentinelRef.current;
    const toolbar = toolbarRef.current;
    if (!sentinel || !toolbar) return;
    // The header is 4rem (root font grows on wide screens); the toolbar is stuck once the sentinel passes under it.
    const header = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4;
    const observer = new IntersectionObserver(
      ([entry]) => toolbar.toggleAttribute("data-stuck", !entry.isIntersecting && entry.boundingClientRect.top < header),
      { rootMargin: `-${Math.round(header) + 1}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  /** Brings the top of the results under the sticky toolbar when the reader is further down. */
  const revealResults = useCallback(() => {
    const results = resultsRef.current;
    const toolbar = toolbarRef.current;
    if (!results || !toolbar) return;
    const offset = toolbar.getBoundingClientRect().bottom + 16;
    const top = results.getBoundingClientRect().top;
    if (top >= offset) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: window.scrollY + top - offset, behavior: reduce ? "instant" : "smooth" });
  }, []);

  const [sheetOpen, setSheetOpen] = useState(false);

  const selectCategory = useCallback(
    (slug: string | null) => {
      setQuery(input);
      window.history.pushState(null, "", hrefFor(slug, input));
      setSheetOpen(false);
      requestAnimationFrame(revealResults);
    },
    [input, revealResults],
  );

  const onCategoryClick = (slug: string | null) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    selectCategory(slug);
  };

  const onInputChange = (value: string) => {
    setInput(value);
    if (!value.trim()) setQuery(value);
  };

  // Typing while scrolled deep into the list: keep the start of the new results in view.
  const lastTokens = useRef(tokens.join(" "));
  useEffect(() => {
    const key = tokens.join(" ");
    if (key === lastTokens.current) return;
    lastTokens.current = key;
    revealResults();
  }, [tokens, revealResults]);

  const applySuggestion = (value: string) => {
    setInput(value);
    setQuery(value);
  };

  const categoryItems: { slug: string | null; name: string; count: number }[] = [
    { slug: null, name: "All commands", count: catalog.uniqueCommands },
    ...catalog.categories.map((item) => ({ slug: item.slug, name: item.name, count: item.count })),
  ];
  const currentSlug = category?.slug ?? null;
  const CurrentIcon = category ? categoryMeta(category.slug).icon : ALL_ICON;

  /* ---------------------------------------------------------------- */
  /* Copy                                                              */
  /* ---------------------------------------------------------------- */
  const summary = searching
    ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${deferredQuery.trim()}”${category ? ` in ${category.name}` : ""}`
    : category
      ? `${category.count} ${category.count === 1 ? "command" : "commands"}`
      : `${catalog.uniqueCommands} commands in ${catalog.categories.length} modules`;

  const suggestions = !results.length && searching ? suggestNames(index, tokens) : [];

  return (
    <div className="flex flex-col">
      <div ref={toolbarSentinelRef} aria-hidden="true" />
      <div
        ref={toolbarRef}
        className={cn(
          "sticky top-header z-sticky -mx-gutter border-b border-transparent px-gutter py-2 md:py-3",
          "transition-[background-color,border-color] duration-200 ease-standard",
          "data-stuck:border-line-subtle data-stuck:bg-canvas/85 data-stuck:backdrop-blur-md",
        )}
      >
        <search className="flex items-center gap-2 md:gap-3">
          <SearchField
            value={input}
            onValueChange={onInputChange}
            label="Search commands"
            placeholder={`Search ${catalog.uniqueCommands} commands…`}
            resultCount={results.length}
            className="flex-1 md:max-w-xs lg:max-w-xl"
          />

          {/* Phones: the module filter lives in a bottom sheet. */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={<Button variant="outline" className="max-w-40 min-w-0 shrink-0 px-3 md:hidden" />}
            >
              <CurrentIcon aria-hidden="true" />
              <span className="sr-only">Module: </span>
              <span className="truncate">{category ? category.name : "All"}</span>
              <ChevronDown aria-hidden="true" className="-mr-0.5 text-fg-tertiary" />
            </SheetTrigger>
            <SheetContent side="bottom" title="Filter by module">
              <nav aria-label="Command modules">
                <ul className="flex flex-col gap-0.5">
                  {categoryItems.map((item) => {
                    const Icon = item.slug ? categoryMeta(item.slug).icon : ALL_ICON;
                    return (
                      <li key={item.slug ?? "all"}>
                        <SheetNavItem
                          href={hrefFor(item.slug, input)}
                          icon={Icon}
                          active={item.slug === currentSlug}
                          onClick={onCategoryClick(item.slug)}
                          badge={<Count value={item.count} />}
                          {...NO_PREFETCH}
                        >
                          {item.name}
                        </SheetNavItem>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <CountNote total={catalog.uniqueCommands} className="px-3 pt-3 pb-1" />
            </SheetContent>
          </Sheet>

          {/* Tablet portrait: one scrollable row of module chips beside the search. */}
          <ChipRow
            items={categoryItems}
            current={currentSlug}
            input={input}
            onCategoryClick={onCategoryClick}
            className="hidden md:flex lg:hidden"
          />
        </search>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-8 md:mt-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-12">
        {/* Desktop and tablet landscape: sticky module sidebar. */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--spacing-header)+5.5rem)] flex max-h-[calc(100dvh-var(--spacing-header)-7rem)] flex-col gap-5 overflow-y-auto overscroll-contain pb-2">
            <nav aria-label="Command modules">
              <p className="mb-2 px-2.5 type-eyebrow text-fg-tertiary">Modules</p>
              <ul className="flex flex-col gap-0.5">
                {categoryItems.map((item) => {
                  const Icon = item.slug ? categoryMeta(item.slug).icon : ALL_ICON;
                  return (
                    <li key={item.slug ?? "all"}>
                      <NavItem
                        variant="sidebar"
                        href={hrefFor(item.slug, input)}
                        icon={Icon}
                        active={item.slug === currentSlug}
                        onClick={onCategoryClick(item.slug)}
                        badge={<Count value={item.count} />}
                        {...NO_PREFETCH}
                      >
                        {item.name}
                      </NavItem>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <CountNote total={catalog.uniqueCommands} className="px-2.5" />
          </div>
        </aside>

        <div ref={resultsRef} className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-x-6 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-label text-fg-secondary tabular-nums">{summary}</p>
            <SyntaxLegend />
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              headingAs="h2"
              title={`No commands match “${deferredQuery.trim()}”`}
              description={
                category
                  ? `Nothing in ${category.name} matches. Search every module, or try a shorter word.`
                  : "Search looks at command names, usage and descriptions. Check the spelling or try a shorter word."
              }
              actions={
                <>
                  {category ? (
                    <Button variant="secondary" onClick={() => selectCategory(null)}>
                      Search all modules
                    </Button>
                  ) : null}
                  <Button variant={category ? "ghost" : "secondary"} onClick={() => applySuggestion("")}>
                    Clear search
                  </Button>
                </>
              }
            >
              <div className="flex flex-col items-center gap-2.5">
                <p className="type-caption text-fg-tertiary">{suggestions.length ? "Did you mean" : "Try"}</p>
                <ul className="flex flex-wrap justify-center gap-2">
                  {(suggestions.length ? suggestions : FALLBACK_SUGGESTIONS).map((name) => (
                    <li key={name}>
                      <Button variant="outline" size="sm" className="font-mono" onClick={() => applySuggestion(name)}>
                        {name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </EmptyState>
          ) : searching ? (
            <section aria-label="Search results">
              <h2 className="sr-only">Search results</h2>
              <CardGrid commands={visible} names={names} matcher={matcher} />
            </section>
          ) : (
            <div className="flex flex-col gap-12 md:gap-14">
              {groups.map((group) => (
                <CategoryGroup
                  key={group.category.slug}
                  group={group}
                  names={names}
                  standalone={Boolean(category)}
                />
              ))}
            </div>
          )}

          {hasMore ? (
            <div ref={sentinelRef} aria-hidden="true" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="hidden h-40 rounded-xl md:block" />
              <Skeleton className="hidden h-40 rounded-xl xl:block" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Count({ value }: { value: number }) {
  return <span className="type-micro text-fg-tertiary tabular-nums">{value}</span>;
}

function CountNote({ total, className }: { total: number; className?: string }) {
  return (
    <p className={cn("type-caption text-fg-tertiary", className)}>
      Some names, like <code className="type-code">enable</code>, exist in more than one module, so module counts add up
      to more than {total}.
    </p>
  );
}

function ChipRow({
  items,
  current,
  input,
  onCategoryClick,
  className,
}: {
  items: { slug: string | null; name: string; count: number }[];
  current: string | null;
  input: string;
  onCategoryClick: (slug: string | null) => (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useScrollOverflow(scrollerRef);
  useRevealSelected(scrollerRef, '[aria-current="page"]');
  return (
    <nav
      aria-label="Command modules"
      ref={scrollerRef}
      className={cn("min-w-0 flex-1 overflow-x-auto overflow-fade-x overscroll-x-contain scrollbar-none", className)}
    >
      <ul className="flex w-max items-center gap-1">
        {items.map((item) => {
          const active = item.slug === current;
          return (
            <li key={item.slug ?? "all"}>
              <Button
                href={hrefFor(item.slug, input)}
                prefetch={false}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                aria-current={active ? "page" : undefined}
                onClick={onCategoryClick(item.slug)}
                className={cn("gap-2", !active && "text-fg-secondary")}
              >
                {item.slug ? item.name : "All"}
                <Count value={item.count} />
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CategoryGroup({
  group,
  names,
  standalone,
}: {
  group: Group;
  names: Map<string, string>;
  standalone: boolean;
}) {
  const { category, commands, total } = group;
  const meta = categoryMeta(category.slug);
  const headingId = `module-${category.slug}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 border-b border-line-subtle pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={meta.icon} size={standalone ? "md" : "sm"} tone="neutral" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id={headingId} className="flex items-baseline gap-2 type-h4 text-fg">
              {category.name}
              <span className="type-label font-normal text-fg-tertiary tabular-nums">
                {total} <span className="sr-only">commands</span>
              </span>
            </h2>
            {meta.summary ? <p className="type-caption text-fg-tertiary">{meta.summary}</p> : null}
          </div>
        </div>
        <Button
          href={categoryDocsHref(category.slug)}
          variant="ghost"
          size="sm"
          className="-ml-3 self-start sm:ml-0 sm:self-center"
        >
          <BookOpen aria-hidden="true" />
          Guide
          <span className="sr-only">: {category.name} commands in the docs</span>
        </Button>
      </div>
      <CardGrid commands={commands} names={names} matcher={null} />
    </section>
  );
}

function CardGrid({
  commands,
  names,
  matcher,
}: {
  commands: CatalogCommand[];
  names: Map<string, string>;
  matcher: RegExp | null;
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {commands.map((command) => (
        <li key={`${command.category}/${command.name}`} className="min-w-0">
          <CommandCard command={command} categoryName={names.get(command.category) ?? command.category} matcher={matcher} />
        </li>
      ))}
    </ul>
  );
}
