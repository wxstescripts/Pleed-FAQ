"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Hash, Search, SearchX, SquareTerminal } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { Button, IconButton } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { SearchField } from "@/components/ui/search-field";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/ui/states";
import { DOCS_HOME, docsHref, docsPages } from "@/content/docs/index";
import {
  highlightParts,
  searchDocs,
  type DocsSearchEntry,
  type DocsSearchIndex,
} from "@/content/docs/search";
import { docsPageIcon, DOCS_HOME_ICON } from "@/components/docs/page-icons";

const INDEX_URL = "/docs/search-index.json";
const INPUT_ID = "docs-search-input";

type IndexState =
  | { status: "idle" | "loading" }
  | { status: "ready"; entries: DocsSearchEntry[] }
  | { status: "error"; detail: string };

type DocsSearchContextValue = {
  openSearch: () => void;
  /** Start loading the index early (hover / focus on a trigger). */
  prefetch: () => void;
};

const DocsSearchContext = createContext<DocsSearchContextValue | null>(null);

function useDocsSearch(): DocsSearchContextValue {
  const value = useContext(DocsSearchContext);
  if (!value) throw new Error("DocsSearch triggers must be inside <DocsSearchProvider>");
  return value;
}

/** True when a key press should stay with the element that has focus (typing in a field). */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)));
}

/**
 * Docs search: one dialog for the whole docs section, opened by any
 * <DocsSearchButton>, by "/" and by Ctrl/⌘ K. The index (pages, headings and
 * every documented command) is fetched the first time it's needed.
 */
export function DocsSearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<IndexState>({ status: "idle" });
  const loading = useRef(false);

  const load = useCallback(() => {
    if (loading.current) return;
    loading.current = true;
    setIndex({ status: "loading" });
    fetch(INDEX_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`GET ${INDEX_URL} → ${response.status}`);
        return response.json() as Promise<DocsSearchIndex>;
      })
      .then((data) => setIndex({ status: "ready", entries: data.entries }))
      .catch((error: unknown) => {
        loading.current = false;
        setIndex({ status: "error", detail: error instanceof Error ? error.message : String(error) });
      });
  }, []);

  const openSearch = useCallback(() => {
    load();
    setOpen(true);
  }, [load]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return;
      const modK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !isTypingTarget(event.target);
      if (!modK && !slash) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const context = useMemo(() => ({ openSearch, prefetch: load }), [openSearch, load]);

  return (
    <DocsSearchContext.Provider value={context}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <SearchDialog index={index} onRetry={load} onNavigate={() => setOpen(false)} />
      </Dialog>
    </DocsSearchContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Triggers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Opens docs search. "field": looks like a search box (sidebar, docs home);
 * "icon": an IconButton (the phone docs bar).
 */
export function DocsSearchButton({
  variant = "field",
  size = "md",
  className,
}: {
  variant?: "field" | "icon";
  size?: "md" | "lg";
  className?: string;
}) {
  const { openSearch, prefetch } = useDocsSearch();
  if (variant === "icon") {
    return (
      <IconButton
        label="Search docs"
        aria-haspopup="dialog"
        aria-keyshortcuts="/ Control+K Meta+K"
        onClick={openSearch}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        className={className}
      >
        <Search />
      </IconButton>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearch}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      aria-haspopup="dialog"
      aria-keyshortcuts="/ Control+K Meta+K"
      className={cn(
        "group/trigger flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-line-control bg-inset text-left text-fg-tertiary shadow-xs",
        "transition-[border-color,color,background-color] duration-150 ease-standard hover:border-line-control-hover hover:text-fg-secondary active:bg-pressed focus-visible:focus-ring",
        size === "lg" ? "h-12 px-4 type-body pointer-coarse:h-13" : "h-9 px-3 type-small pointer-coarse:h-11",
        className,
      )}
    >
      <Search aria-hidden="true" className={cn("shrink-0", size === "lg" ? "size-4.5" : "size-4")} />
      <span className="min-w-0 flex-1 truncate">
        Search docs<span className="max-sm:hidden"> and commands</span>…
      </span>
      <Kbd aria-hidden="true" className="pointer-coarse:hidden">
        /
      </Kbd>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

const KIND_ICON = { section: Hash, command: SquareTerminal } as const;

function resultIcon(result: Pick<DocsSearchEntry, "kind" | "slug">) {
  if (result.kind === "page") return result.slug ? docsPageIcon(result.slug) : DOCS_HOME_ICON;
  return KIND_ICON[result.kind];
}

const SUGGESTIONS: Pick<DocsSearchEntry, "kind" | "slug" | "title" | "href" | "detail">[] = [
  { kind: "page", slug: "", title: DOCS_HOME.title, href: DOCS_HOME.href, detail: "Overview and quick start" },
  ...docsPages.map((page) => ({
    kind: "page" as const,
    slug: page.slug,
    title: page.title,
    href: docsHref(page.slug),
    detail: page.section,
  })),
];

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-xs bg-brand-subtle text-brand-fg">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

function SearchDialog({
  index,
  onRetry,
  onNavigate,
}: {
  index: IndexState;
  onRetry: () => void;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const trimmed = query.trim();

  const groups = useMemo(
    () => (index.status === "ready" && trimmed ? searchDocs(index.entries, trimmed) : []),
    [index, trimmed],
  );
  const flat = useMemo(() => groups.flatMap((group) => group.results), [groups]);
  const resultCount = index.status === "ready" && trimmed ? flat.length : null;

  const results = () => Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>("[data-search-result]") ?? []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = results();
    const input = document.getElementById(INPUT_ID);
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "ArrowDown") {
      if (items.length === 0) return;
      event.preventDefault();
      items[Math.min(current + 1, items.length - 1)]?.focus();
    } else if (event.key === "ArrowUp") {
      if (current === -1) return;
      event.preventDefault();
      if (current === 0) input?.focus();
      else items[current - 1]?.focus();
    } else if (event.key === "Enter" && document.activeElement === input) {
      const first = items[0];
      if (!first) return;
      event.preventDefault();
      onNavigate();
      router.push(first.getAttribute("href") ?? "/docs");
    } else if (current !== -1 && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      // Typing while a result is focused goes back to the field.
      input?.focus();
    }
  };

  const renderItem = (
    item: Pick<DocsSearchEntry, "kind" | "slug" | "title" | "href">,
    detail: string | undefined,
    key: string,
  ) => {
    const Icon = resultIcon(item);
    return (
      <li key={key}>
        <Link
          href={item.href}
          data-search-result=""
          onClick={onNavigate}
          className="group/result flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-hover active:bg-pressed focus-visible:bg-selected focus-visible:focus-ring-inset"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-1 text-fg-tertiary group-hover/result:text-fg-secondary group-focus-visible/result:text-brand-fg"
          >
            <Icon className="size-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className={cn("truncate text-fg", item.kind === "command" ? "type-code-sm" : "type-label")}>
              <Highlighted text={item.title} query={trimmed} />
            </span>
            {detail ? <span className="truncate type-caption text-fg-tertiary">{detail}</span> : null}
          </span>
        </Link>
      </li>
    );
  };

  let body: ReactNode;
  if (!trimmed) {
    body = (
      <section aria-labelledby="docs-search-suggestions">
        <h3 id="docs-search-suggestions" className="px-3 pb-2 type-eyebrow text-fg-tertiary">
          Pages
        </h3>
        <ul className="flex flex-col gap-0.5">
          {SUGGESTIONS.map((item) => renderItem(item, item.detail, item.href))}
        </ul>
      </section>
    );
  } else if (index.status === "error") {
    body = (
      <ErrorState
        variant="inline"
        title="Search isn't available right now"
        description="The search index didn't load. Check your connection and try again — or browse the pages in the menu."
        detail={index.detail}
        onRetry={onRetry}
      />
    );
  } else if (index.status !== "ready") {
    body = (
      <LoadingRegion label="Loading search">
        <div className="flex flex-col gap-2 px-3 pt-1">
          <Skeleton className="h-3 w-24" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </LoadingRegion>
    );
  } else if (flat.length === 0) {
    body = (
      <EmptyState
        variant="plain"
        icon={SearchX}
        title={`No results for “${trimmed}”`}
        description="Try a module (“anti-nuke”, “jail”, “tickets”) or a command name. The command explorer also lists every public command."
        actions={
          <Button variant="secondary" href={`/commands?q=${encodeURIComponent(trimmed)}`} onClick={onNavigate}>
            Search the command explorer
          </Button>
        }
        className="py-8"
      />
    );
  } else {
    body = (
      <div className="flex flex-col gap-4">
        {groups.map((group) => {
          const headingId = `docs-search-group-${group.slug || "home"}`;
          return (
            <section key={group.slug} aria-labelledby={headingId}>
              <h3 id={headingId} className="flex items-center gap-2 px-3 pb-1.5 type-eyebrow text-fg-tertiary">
                {group.page}
              </h3>
              <ul className="flex flex-col gap-0.5">
                {group.results.map((result) => renderItem(result, result.detail, result.href + result.kind))}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <DialogContent
      title="Search the docs"
      size="lg"
      initialFocus={() => document.getElementById(INPUT_ID)}
      className="max-sm:top-0 max-sm:max-h-dvh max-sm:rounded-none max-sm:pt-[env(safe-area-inset-top)] sm:top-[12dvh] sm:h-[min(36rem,80dvh)] sm:translate-y-0 sm:data-ending-style:translate-y-2 sm:data-starting-style:translate-y-2"
    >
      <div onKeyDown={onKeyDown} className="flex min-h-full flex-col">
        <div className="sticky -top-5 z-raised -mx-5 -mt-5 bg-surface-2 px-5 pt-5 pb-3 sm:-mx-6 sm:px-6">
          <SearchField
            id={INPUT_ID}
            value={query}
            onValueChange={setQuery}
            label="Search the docs"
            placeholder="Search guides and commands…"
            resultCount={resultCount}
            shortcut={false}
          />
        </div>
        <div ref={listRef} className="-mx-2 flex-1 pt-2">
          {body}
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-subtle pt-3 type-caption text-fg-tertiary pointer-coarse:hidden">
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>↵</Kbd> to open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd>Esc</Kbd> to close
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 max-sm:hidden">
            <FileText aria-hidden="true" className="size-3.5" />
            Pages, sections and commands
          </span>
        </p>
      </div>
    </DialogContent>
  );
}
