import { createCn } from "cn/config";

/**
 * Class merging (clsx + tailwind-merge semantics) taught about Pleed's custom
 * tokens, so e.g. cn("type-h2 text-fg", "type-h3") keeps the colour and
 * replaces the type style instead of silently dropping one of them.
 */
export const cn = createCn({
  extend: {
    theme: {
      spacing: ["gutter", "section", "section-sm", "header", "page", "sidebar", "sidebar-rail"],
      container: ["measure", "narrow", "content", "wide"],
      shadow: ["glow", "glow-lg", "thumb", "thumb-hover", "thumb-active"],
      "inset-shadow": ["highlight", "highlight-strong", "mark"],
      radius: ["4xl"],
    },
    classGroups: {
      "type-style": [
        {
          type: [
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "lead",
            "body",
            "small",
            "caption",
            "label",
            "eyebrow",
            "code",
            "code-sm",
            "metric",
            "metric-lg",
            "wordmark",
          ],
        },
      ],
      z: [
        {
          z: [
            "base",
            "raised",
            "sticky",
            "header",
            "savebar",
            "overlay",
            "modal",
            "popover",
            "toast",
            "tooltip",
            "skip",
          ],
        },
      ],
      "page-container": ["container-content", "container-wide", "container-narrow"],
    },
  },
});

/**
 * Merge base classes with a Base UI `className`, which may be a string or a
 * function of component state.
 */
export function mergeClassName<State>(
  base: string,
  className: string | ((state: State) => string | undefined) | undefined,
): string | ((state: State) => string) {
  if (typeof className === "function") {
    return (state: State) => cn(base, className(state));
  }
  return cn(base, className);
}
