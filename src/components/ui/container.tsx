import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

const widths = {
  /** 1216 px — marketing pages (default). */
  content: "container-content",
  /** 1440 px — dashboard overview and list pages, wide grids. */
  wide: "container-wide",
  /**
   * 768 px — dashboard settings pages (security, join gates, automod,
   * settings): rows of label … control stay readable as rows, and the SaveBar
   * shares the cards' edges.
   */
  settings: "container-settings",
  /** 768 px — legal pages, forms, centred copy. */
  narrow: "container-narrow",
} as const;

export type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  size?: keyof typeof widths;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Horizontal layout primitive: centred, fluid gutters (16 → 40 px, no jumps),
 * max content width from the token scale. Never nest Containers.
 */
export function Container<T extends ElementType = "div">({
  as,
  size = "content",
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn(widths[size], className)} {...props} />;
}
