import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
 * Pleed design-system guard (DESIGN.md §1 + §7). Flags string literals and
 * template parts (className, cn(), cva() variants…) that bypass the tokens:
 * - raw Tailwind palette colours: text-gray-400, bg-white/5, from-purple-600…
 * - colour literals in arbitrary values: bg-[#0a0a0a], shadow-[…rgba(…)]…
 * - arbitrary type values: text-[13px], font-[650], tracking-[…], leading-[…],
 *   [font-stretch:…], [letter-spacing:…]
 * - arbitrary shadows, radii and z-indexes: shadow-[…], rounded-[…], z-[…]
 * - durations off the 150/200/300/500 scale: duration-250, duration-700
 * Use the Pleed utilities instead (text-fg-secondary, type-*, shadow-*,
 * rounded-*, z-*, duration-*). Missing a token? Ask the design-system owner.
 */
const PALETTE =
  "white|black|gray|zinc|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
  "text|bg|border|border-[xytrblse]|from|via|to|ring|ring-offset|inset-ring|outline|decoration|divide|fill|stroke|shadow|inset-shadow|placeholder|caret|accent";
const RAW_STYLE = new RegExp(
  [
    `(^|[\\s:!])-?(${COLOR_UTILITIES})-(${PALETTE})(\\b|$)`,
    `-\\[(#|rgba?\\(|hsla?\\(|oklch\\(|oklab\\(|lab\\(|lch\\(|color-mix\\()`,
    `(^|[\\s:!])(text|font|tracking|leading|shadow|inset-shadow|drop-shadow|rounded(-[a-z]{1,2})?|z)-\\[`,
    `\\[(font-size|font-weight|font-stretch|letter-spacing|line-height|color|background-color|box-shadow|z-index):`,
    `(^|[\\s:!])duration-(?!(0|150|200|300|500)(\\b|$))\\d+`,
  ].join("|"),
);
const rawStyleMessage =
  "Pleed tokens only (DESIGN.md §1/§7): no raw palette colours (gray-*, white/5), colour literals, arbitrary type/shadow/radius/z values, or durations off 150/200/300/500.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=/${RAW_STYLE.source}/]`, message: rawStyleMessage },
        { selector: `TemplateElement[value.raw=/${RAW_STYLE.source}/]`, message: rawStyleMessage },
      ],
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
