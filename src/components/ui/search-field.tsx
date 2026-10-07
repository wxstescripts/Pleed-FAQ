"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";

export type SearchFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name, e.g. "Search commands" (the field has no visible label). */
  label: string;
  placeholder?: string;
  /**
   * Number of matches for the current query. Announced politely to screen
   * readers (debounced) while a query is typed; render a visible count
   * yourself if the design needs one.
   */
  resultCount?: number | null;
  /** Formats the announcement. Default: "1 result" / "12 results". */
  formatResultCount?: (count: number) => string;
  /** Global key that focuses the field (default "/"; false to disable). Ignored while typing in another field. */
  shortcut?: string | false;
  size?: "sm" | "md";
  id?: string;
  name?: string;
  autoFocus?: boolean;
  className?: string;
};

const defaultFormat = (count: number) => (count === 1 ? "1 result" : `${count} results`);

/**
 * Search input for Commands and Docs: search icon, clear button, "/" to
 * focus (Kbd hint on mouse devices), Escape clears, and an aria-live result
 * count. Wrap it in <search> when it is the page's main search.
 */
export function SearchField({
  value,
  onValueChange,
  label,
  placeholder = "Search…",
  resultCount,
  formatResultCount = defaultFormat,
  shortcut = "/",
  size = "md",
  id,
  name,
  autoFocus,
  className,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== shortcut || event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  // Debounced announcement so fast typing doesn't queue a dozen messages.
  const message = value.trim() && resultCount != null ? formatResultCount(resultCount) : "";
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(message), 450);
    return () => window.clearTimeout(timer);
  }, [message]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && value) {
      // Clear first; a second Escape can then close a surrounding sheet/dialog.
      event.preventDefault();
      event.stopPropagation();
      onValueChange("");
    }
  };

  const clear = () => {
    onValueChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("w-full min-w-0", className)}>
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        aria-label={label}
        aria-keyshortcuts={shortcut || undefined}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        onKeyDown={onKeyDown}
        inputSize={size}
        wrapperClassName="group/search"
        className="pr-10 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        startAdornment={<Search />}
        endAdornment={
          value ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="relative inline-flex size-6 items-center justify-center rounded-sm text-fg-tertiary touch-target transition-colors duration-150 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring"
            >
              <X aria-hidden="true" />
            </button>
          ) : shortcut ? (
            <Kbd aria-hidden="true" className="pointer-events-none group-focus-within/search:hidden pointer-coarse:hidden">
              {shortcut}
            </Kbd>
          ) : null
        }
      />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
