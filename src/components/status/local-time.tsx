"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};

// Server render and hydration share one fixed format (UTC, en-US) so they
// match byte for byte; right after hydration the visitor's own clock and
// locale take over.
const utcTime = new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone: "UTC" });
const localTime = new Intl.DateTimeFormat(undefined, { timeStyle: "medium" });
const localDateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  );
}

/**
 * A moment in the visitor's local time ("2:03:12 PM"; with the date when it
 * isn't today) inside a machine-readable <time>. Tabular digits, so a ticking
 * value never shifts its neighbours.
 */
export function LocalTime({ value, className }: { value: string | number; className?: string }) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const text = hydrated
    ? isToday(date)
      ? localTime.format(date)
      : localDateTime.format(date)
    : `${utcTime.format(date)} UTC`;

  return (
    <time dateTime={date.toISOString()} className={cn("tabular-nums", className)}>
      {text}
    </time>
  );
}
