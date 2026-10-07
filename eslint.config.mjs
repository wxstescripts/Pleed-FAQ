import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
 * Pleed design-system guard (DESIGN.md §1 + §7). Flags string literals and
 * template parts (className, cn(), cva() variants…) that bypass the tokens.
 *
 * Everywhere (pages, sections, the kit):
 * - raw Tailwind palette colours: text-gray-400, bg-white/5, from-purple-600…
 * - colour literals in arbitrary values: bg-[#0a0a0a], shadow-[…rgba(…)]…
 * - arbitrary type values: text-[13px], font-[650], tracking-[…], leading-[…],
 *   [font-stretch:…], [letter-spacing:…]
 * - arbitrary shadows, radii and z-indexes: shadow-[…], rounded-[…], z-[…]
 * - magic spacing: mt-[13px], gap-[6px], p-[1.1rem] (calc() arithmetic is fine)
 * - numeric z-indexes (z-50, -z-10) — use z-raised … z-skip
 * - Tailwind's own shadows outside the scale: shadow-2xs, shadow-2xl, shadow-inner
 * - durations off the 150/200/300/500 scale: duration-250, duration-700
 * - text-xs (a 12 px label is type-micro / type-code-xs; a sentence ≥ type-caption),
 *   heavy/light weights (font-bold, font-semibold, font-light…), tracking-tight/wide…
 *
 * Pages and feature components only (the kit in src/components/ui may use them):
 * - Tailwind type sizes text-sm, text-base, text-lg … text-9xl and leading-*:
 *   pages set type with type-* classes only (text-sm's 20 px leading drifts
 *   from type-small's 21.7 px rhythm)
 * - hover:bg-surface-N (an opaque hover step vanishes on that same surface)
 *
 * Plus: `motion` from framer-motion is banned — use `m` (LazyMotion).
 * Missing a token? Ask the design-system owner.
 */
const PALETTE =
  "white|black|gray|zinc|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
  "text|bg|border|border-[xytrblse]|from|via|to|ring|ring-offset|inset-ring|outline|decoration|divide|fill|stroke|shadow|inset-shadow|placeholder|caret|accent";
/** Start of a class: string start, whitespace, a variant's `:` or the `!` important flag. */
const AT = "(^|[\\s:!])";

const RULES = {
  tokens: {
    pattern: [
      `${AT}-?(${COLOR_UTILITIES})-(${PALETTE})(\\b|$)`,
      `-\\[(#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|lab\\(|lch\\(|color-mix\\()`,
      `${AT}(text|font|tracking|leading|shadow|inset-shadow|drop-shadow|rounded(-[a-z]{1,2})?|z)-\\[`,
      `\\[(font-size|font-weight|font-stretch|letter-spacing|line-height|color|background-color|box-shadow|z-index):`,
      `${AT}duration-(?!(0|150|200|300|500)(\\b|$))\\d+`,
    ],
    message:
      "Pleed tokens only (DESIGN.md §1/§7): no raw palette colours (gray-*, white/5), colour literals, arbitrary type/shadow/radius/z values, or durations off 150/200/300/500.",
  },
  spacing: {
    pattern: [`${AT}-?((m|p)[xytrblse]?|gap(-[xy])?|space-[xy])-\\[-?\\d*\\.?\\d+(px|rem)\\]`],
    message:
      "Spacing uses the 4 px scale (mt-3, gap-5) or the fluid tokens (px-gutter, py-section, py-page) — no magic px/rem values (DESIGN.md §1 Spacing). calc() arithmetic is fine.",
  },
  layers: {
    pattern: [`${AT}-?z-\\d+(\\b|$)`, `${AT}shadow-(2xs|2xl|inner)(\\b|$)`],
    message:
      "Use the z-index tokens (z-raised, z-sticky, z-header, z-savebar, z-overlay, z-modal, z-popover, z-toast, z-tooltip, z-skip) and shadow-xs…xl / shadow-glow (DESIGN.md §1).",
  },
  type: {
    pattern: [
      `${AT}text-xs(\\b|$)`,
      `${AT}font-(thin|extralight|light|semibold|bold|extrabold|black)(\\b|$)`,
      `${AT}tracking-(tighter|tight|wide|wider|widest)(\\b|$)`,
    ],
    message:
      "Set type with a type-* class (DESIGN.md §1 Typography): 12 px labels are type-micro / type-code-xs, sentences type-caption or larger; weights come from the type class (override with font-medium / font-normal only) and tracking is built in.",
  },
  pageType: {
    pattern: [`${AT}text-(sm|base|lg|xl|[2-9]xl)(\\b|$)`, `${AT}leading-(tight|snug|normal|relaxed|loose|\\d+)(\\b|$)`],
    message:
      "Pages use type-* classes only, never Tailwind sizes or leading (DESIGN.md §1): text-sm → type-small / type-label, text-base → type-body, text-lg+ → type-h4…type-display.",
  },
  pageHover: {
    pattern: [`${AT}hover:bg-surface-\\d(\\b|$)`],
    message:
      "Hover transparent things with hover:bg-hover / active:bg-pressed (white alpha, visible on every surface) — an opaque surface step vanishes on that surface (DESIGN.md §7).",
  },
};

/** no-restricted-syntax entries for string literals and template parts. */
const selectors = (...keys) =>
  keys.flatMap((key) => {
    const { pattern, message } = RULES[key];
    const source = new RegExp(pattern.join("|")).source;
    return [
      { selector: `Literal[value=/${source}/]`, message },
      { selector: `TemplateElement[value.raw=/${source}/]`, message },
    ];
  });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...selectors("tokens", "spacing", "layers", "type", "pageType", "pageHover")],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              importNames: ["motion"],
              message:
                "Import `m` (not `motion`) from framer-motion: MotionProvider's LazyMotion loads features for m.* only, motion.* ships the whole bundle (DESIGN.md §5). Prefer <Reveal>/<Stagger> for entrances.",
            },
          ],
        },
      ],
    },
  },
  {
    // The kit defines the type styles' building blocks: it may use Tailwind sizes
    // (text-sm controls, the Logo wordmark), leading-* and opaque hover steps on
    // filled controls. Everything else still applies.
    files: ["src/components/ui/**/*.{ts,tsx}", "src/components/motion/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...selectors("tokens", "spacing", "layers", "type")],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
