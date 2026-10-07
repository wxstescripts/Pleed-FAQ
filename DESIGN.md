# Pleed design system

The contract every page builder follows. Live reference: **`/design-system`** (dev only — every token and component in every state). Tokens live in `src/app/globals.css`, components in `src/components/ui/**`, motion in `src/components/motion/**`, site constants in `src/lib/site.ts`. Only the design-system owner edits those files — request changes instead of forking a component.

Art direction: dark-first, premium, calm. Depth comes from layered surfaces, hairline borders, a top-edge light catch and great type — not from glow or gradients. One accent (violet/indigo brand) used with restraint; Discord blurple only for Discord actions. Real product UI is built from these components, never screenshots.

---

## 1. Tokens

Use tokens through Tailwind utilities. **No hex values, no `bg-[#…]`, no `text-[13px]`, no raw palette colours (`gray-400`, `indigo-600`, `white/5`).** If something is missing, ask for a token.

**Enforced:** `npx eslint <your files>` fails (`no-restricted-syntax`, "Pleed tokens only") on raw palette colours, colour literals in arbitrary values (`bg-[#…]`, `shadow-[…rgba(…)]`), arbitrary type values (`text-[…]`, `font-[…]`, `tracking-[…]`, `leading-[…]`, `[font-stretch:…]`), arbitrary `shadow-[…]` / `rounded-[…]` / `z-[…]`, and durations other than 150/200/300/500. Layout arithmetic is fine (`max-h-[calc(100dvh-2rem)]`, `grid-cols-[minmax(0,1fr)_15rem]`). Once no file trips the rule, Tailwind's default palette is switched off in `globals.css` (`--color-*: initial`), so raw colours will simply stop existing.

### Colour

| Role | Utility | Notes |
|---|---|---|
| App background | `bg-canvas` | `#0b0c10`, faint cool tint. `<body>` already has it — don't repaint pages. |
| Recessed well | `bg-inset` | inputs, code, previews inside cards, segmented/tab tracks |
| Surface 1 | `bg-surface-1` | cards, sections, sidebars |
| Surface 2 | `bg-surface-2` | raised cards, popovers, menus, dialogs |
| Surface 3 | `bg-surface-3` | badges, tooltips, save bar |
| Surface 4 | `bg-surface-4` | selected pill / segment, switch track |
| Scrim | `bg-scrim` | modal backdrop (components handle it) |
| Hairlines | `border-line-subtle` (6%) · `border-line` (9%, default) · `border-line-strong` (15%, buttons/raised) · `border-line-hover` (24%) | white-alpha, decorative separation |
| Control boundary | `border-line-control` (40%) · `hover:border-line-control-hover` (55%) | **every form control** (Input, Textarea, NumberField, Select, NativeSelect, Checkbox, Radio, Switch off): 3.3–3.75:1 on inset…surface-2 (WCAG 1.4.11). The kit applies it — use it for any custom control. |
| Interaction overlays | `hover:bg-hover` (6%) · `bg-selected` (9%) · `active:bg-pressed` (10%) | white alpha, so a hover is visible on **any** surface. Use for transparent things (ghost buttons, rows, nav items, menu items). Never hover with an opaque surface step — it vanishes on that same surface. |
| Control parts | `bg-track` (slider rail, 3.3:1) · `bg-thumb` (white thumbs) · `shadow-thumb(-hover/-active)` | |
| Text | `text-fg` · `text-fg-secondary` · `text-fg-tertiary` · `text-fg-disabled` | contrast on inset…surface-3: 14.7–18.4 · 9.5–11.8 · 6.3–7.9 · 4.6–5.3 (inset…surface-2) |
| Brand | `bg-brand` (solid primary, `text-fg-on-brand` 5.3:1) · `hover:bg-brand-hover` · `text-brand-fg` (brand text/icons on dark, 8–10:1) · `bg-brand-subtle` + `border-brand-border` (tints) · scale `brand-50…950` | violet→indigo, hue 283 |
| Mark gradient | `from-brand-violet to-brand-indigo` | Logo and `GradientText` only |
| Semantic | `{success,warning,danger,info}-fg` (text/icons) · `-subtle` (tinted bg) · `-border` · `-strong` + `-strong-fg` (solid fill) | colour never carries meaning alone — pair with icon/text |
| Discord | `bg-discord hover:bg-discord-hover text-discord-fg` | "Add to Discord", "Log in with Discord" only |
| Focus | `outline-focus` / `focus-visible:focus-ring` / `bg-focus` (indicator bars) | brand-400, 7.4:1 on canvas |

shadcn variable names (`bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-destructive`, `sidebar-*`, `chart-1…5`) are mapped onto these tokens (`accent` = `selected`, `input` = `line-control`), so shadcn CLI components inherit the theme. Prefer the Pleed names in new code.

### Typography

Families (next/font, self-hosted, size-adjusted fallbacks — no serif anywhere):

- `font-display` — **Mona Sans** (variable weight + width). Headings use 104–112% width.
- `font-sans` — **Geist**. UI and body. Default on `<html>`.
- `font-mono` — **Geist Mono**. Commands, code, keys, eyebrows.

Type styles set family, fluid size, line-height, tracking and weight in one class. Use them instead of `text-4xl md:text-6xl` chains:

| Class | Size (360 → 1440 px) | Use |
|---|---|---|
| `type-display` | 40 → 76 (88 max) | landing hero h1 only |
| `type-h1` | 34 → 60 | page h1 on marketing pages |
| `type-h2` | 28 → 44 | section titles (also the dashboard page h1 via `PageHeader`) |
| `type-h3` | 21 → 28 | sub-sections, large card titles |
| `type-h4` | 17 → 19 (Geist 600) | card titles, settings section titles, dialog titles |
| `type-lead` | 17 → 20 | intro paragraphs under h1/h2 |
| `type-body` | 16 / 1.65 | body copy |
| `type-small` | 14 / 1.55 | secondary UI copy, descriptions |
| `type-label` | 14 / 1.375, Geist 500 | control labels, nav items, toast titles, list item titles |
| `type-caption` | 13 / 1.45 | helper text, meta, timestamps (minimum readable size — never smaller for sentences) |
| `type-eyebrow` | 12 mono uppercase | labels above titles, table headers in mono contexts |
| `type-code` | 0.875em mono | inline code inside text |
| `type-code-sm` | 13 mono / 1.6 | code blocks, command chips, monospace table cells |
| `type-metric` | 28 → 32, Mona Sans, tabular | StatCard values, dashboard counters |
| `type-metric-lg` | 36 → 48, Mona Sans, tabular | hero/landing stat numbers, status uptime |
| `type-wordmark` | (size from `text-*`) | the Logo only |

Override weight/colour after the type class (`type-h3 font-medium text-fg-secondary`) — `cn()` knows these classes. Don't combine a type class with another `font-sans`/`font-mono`/`text-*` size; pick the right type class instead. Use `tabular-nums` for changing numbers. `h1–h3` default to the display family and `text-wrap: balance`; paragraphs get `text-wrap: pretty`.

**At ≥1920 px the root font grows to 17 px, at ≥2400 px to 19 px**, so every rem-based size, spacing and container scales up — 2560 looks designed, not miniature. Media queries are unaffected.

### Spacing & layout

- Spacing uses Tailwind's 4 px scale (`p-4`, `gap-6`…) plus fluid tokens: `px-gutter` (16 → 40 px page gutter), `py-section` (64 → 128 px), `py-section-sm` (48 → 80 px), `h-header` (64 px), dashboard `py-page` (24 → 40 px), `w-sidebar` (240 px), `w-sidebar-rail` (64 px).
- Containers: `container-content` (1216 px, marketing), `container-wide` (1440 px, dashboard content / wide grids), `container-narrow` (768 px, legal/forms), `max-w-measure` (68ch prose). Each includes the fluid gutter and centring — use `<Container size=…>` or the utility, never `container mx-auto px-4 sm:px-6 lg:px-8`. Never nest containers.
- Grids that contain scrollers (Tabs, SegmentedControl, code) need `grid-cols-1` / `minmax(0,1fr)` tracks or `min-w-0` items so they can't widen the page.
- **Anchors:** the only offset is `html { scroll-padding-top: header + 16px }`. Never add `scroll-mt-*` / `scroll-margin` (they add up). `<Section id>` lands its content 32 px under the header by itself.

**Spacing recipes** (use these instead of inventing values):

| What | Value |
|---|---|
| Between two marketing sections | automatic — adjacent `<Section>`s share one gap: 64 px @390 · ~120 px @1440 · 152 px @2560 (`compact`: 48 → 80) |
| Section header → its content | automatic (`Section`): 40 → 56 px (`mb-10 md:mb-14` when using `SectionHeader` alone) |
| Card grids (features, stats, docs tiles) | `gap-4 lg:gap-6` (16 → 24 px); 1 col → `md:grid-cols-2` → `xl:grid-cols-3` (`3xl:grid-cols-4` optional) |
| Stacks of settings sections / dashboard cards | `flex flex-col gap-6` |
| Inside a component: title ↔ description | `gap-1.5` (6 px) · label ↔ control `gap-2` · icon tile ↔ text `gap-4` |
| Form fields in a column | `grid gap-5` |
| Card padding | `md` default (20 → 24 px) · `lg` for hero/feature panels (24 → 32) · `sm` for dense grids (16) |
| Dashboard page | `<Container size="wide" className="py-page">`; sidebar `w-sidebar`, icon rail `w-sidebar-rail` |

### Icons

lucide-react only (plus `DiscordIcon` for Discord actions). Decorative icons get `aria-hidden="true"`.

| Context | Size | Stroke |
|---|---|---|
| Inside controls: buttons, inputs, menu items, nav items, badges-lg | 16 px (`size-4`, set by the component) | 2 (lucide default) |
| Inline with small text: links, badges, chips | 14 px (`size-3.5`) | 2 |
| Sheet rows, toast icons, icon buttons md | 18–20 px (`size-4.5` / `size-5`) | 2 |
| Illustrative: `IconTile` / `FeatureCard` / empty states | 16 · 20 · 24 px (tile sm · md · lg) | 1.75 (IconTile sets it) |

Never mix strokes within one row; never use an icon as the only label of a control (use `IconButton label`).

### Radii

`rounded-xs 4` · `sm 6` (kbd, small chips) · `md 8` (small buttons, menu items, nav items) · **`lg 10` (controls: buttons, inputs, selects)** · **`xl 14` (cards, toasts)** · `2xl 18` (panels, dialogs) · `3xl 24` (hero product frames) · `full` (pills, avatars, switches). Nested radius = outer − padding.

### Elevation

Dark UIs separate layers with borders first. Shadows: `shadow-xs/sm/md/lg/xl` (md for raised cards, lg for popovers/toasts, xl for dialogs/sheets). `inset-shadow-highlight` adds the 1 px top light catch on raised surfaces (`-strong` on solid buttons). Glow: `shadow-glow` (primary CTA hover only) and `shadow-glow-lg` (one hero product frame per page). Decorative backgrounds: `bg-spotlight` (soft brand light from the top), `bg-grid` (faint 48 px grid), `bg-sheen` (top light on a brand tile) — at most one per section, never behind body text without a surface. `mask-fade-b`, `mask-fade-x` fade edges.

### Z-index

`z-raised 10` · `z-sticky 20` · `z-header 40` · `z-savebar 45` · `z-overlay 50` · `z-modal 60` · `z-popover 70` · `z-toast 80` · `z-tooltip 90` · `z-skip 100`. Never use raw `z-[999]`.

### Motion

Durations: `duration-150` (hover, toggles) · `duration-200` (controls, popovers) · `duration-300` (sheets, dialogs, accordions) · `duration-500` (large surfaces). **Reveals are 600 ms** and only come from `Reveal`/`Stagger` and framer `fadeRise` — never hand-roll them. Easing: `ease-standard` (UI), `ease-out-expo` (entrances), `ease-exit`. framer tokens in `@/components/motion/tokens` (`duration`, `ease`, `spring`, `fadeRise`, `fade`, `scaleIn`, `staggerChildren`). CSS vars `--duration-fast|base|slow|slower|reveal` exist for custom CSS.

---

## 2. Breakpoints & layout rules

Tailwind breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` · **`3xl 1920`** (custom). Touch devices are targeted with `pointer-coarse:` (not width).

| Range | Rules |
|---|---|
| **Phones < 768** | single column; gutter 16–20 px; mobile nav in a `Sheet`; tables → `ResponsiveList` cards; header actions stack (`PageHeader` does this); sticky elements must not cover more than ~15% of the screen; every target ≥ 44×44 (components do this on `pointer-coarse`); inputs use 16 px text (no iOS zoom). Switches/checkboxes stay beside their label (`SettingRow` does this). |
| **Tablet portrait 768–1023** | deliberate 2-column grids (features, stats 2×2), stacked hero (copy then product preview), still the mobile/sheet navigation for the site header; dashboard: content gets the full width (sidebar is a drawer or `w-sidebar-rail` icon rail — never a 240 px column eating 30%). |
| **Tablet landscape / small laptop 1024–1279** | desktop site nav appears at `lg`; 2–3 columns; hero two-column; dashboard sidebar may be the rail or full `w-sidebar`; avoid `min-h-screen` heroes (short viewports, 800 px). |
| **Desktop ≥ 1280** | full layouts; marketing content at `container-content`; dashboard content max `container-wide`, centred next to the sidebar. |
| **Wide ≥ 1920 (`3xl`)** | root font scales (17/19 px), so layouts grow proportionally; optionally add a 4th column (`3xl:grid-cols-4`) for card grids; never let content hug the left edge — centre the column. |

**Header model (one model, no guessing):** the site header is `position: sticky; top: 0`, **in flow**, `h-header` (64 px), `z-header`. Pages add **no** offset — the first `<Section>` uses its normal `py-section`, nothing else. The header may be transparent at scroll 0 and `bg-canvas/80 backdrop-blur border-b border-line-subtle` once scrolled (site-chrome owns this).

Heroes: content-driven padding (the Section's own `py-section`), never `min-h-screen`/`100vh`; if you need a viewport-relative height use `svh` with a cap. If the hero's decorative background (`bg-spotlight`, `bg-grid`) must start at the very top of the page, behind the header, use **`<Section behindHeader>`** — it pulls the section up by the header height and adds that height to its top padding. That is the only sanctioned header offset: never hand-write `pt-header` / `-mt-header`.

---

## 3. Components

Import from `@/components/ui/<file>`. Client components are marked; everything else works in Server Components. All components accept `className` (merged with `cn` from `@/lib/utils`).

### Layout & content

| Component | File | Key props |
|---|---|---|
| `Container` | `container` | `size: "content" \| "wide" \| "narrow"`, `as` |
| `Section`, `SectionHeader` | `section` | `id`, `eyebrow`, `title`, `description`, `titleAs` (h2 default), `align`, `actions`, `spacing: default \| compact \| none`, `container`, `tone: default \| raised`, `behindHeader` |
| `PageHeader` | `page-header` | `title` (renders the page's single `<h1>`), `description`, `meta` (badge), `actions`, `breadcrumbs`, `eyebrow` |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `card` | `variant: default \| raised \| inset \| outline \| brand`, `padding: none \| sm \| md \| lg`, `href` (whole card is a link → interactive), `interactive`; `CardTitle as="h2"\|"h3"\|"h4"\|"p"` |
| `FeatureCard` | `card` | `icon` (lucide), `title`, `description`, `titleAs`, `href`, `variant: default \| raised \| outline`, `children` (extra content). **The** feature-card pattern — don't rebuild it from `Card` + `IconTile` |
| `Prose` | `prose` | wraps long-form HTML (legal, docs); 68ch measure. Components inside it (`CodeBlock`, cards) are excluded via `not-prose` |
| `Separator` | `separator` | `orientation`, `label` ("or"), `decorative` |
| `GradientText` | `gradient-text` | one short phrase per page, never body copy |
| `TextLink` | `text-link` | `href`, `external` (auto for http), `tone: brand \| subtle`, `underline: always (default) \| hover` — `hover` only for standalone link lists (footer columns), never inside sentences |
| `Breadcrumbs` | `breadcrumbs` | `items: {label, href?}[]` (last = current page) |

**Section alignment:** `align="start"` (default) for content sections and any header with `actions`; `align="center"` for single-message sections (CTA band, a short intro above a symmetric grid). Never centre more than ~3 lines of text. Wrap a section's **content** in `Reveal`, never the `<Section>` itself (adjacent-section rhythm needs sibling sections).

### Brand

| Component | File | Key props |
|---|---|---|
| `Logo` | `logo` | `size: xs…xl`, `href` (home link), `markOnly` + `title` |
| `LogoMark` | `logo` | `size`, `title` (omit when the wordmark is visible). `LOGO_P_PATH`, `LOGO_GRADIENT` exported for icon/OG generators |
| `DiscordIcon` | `discord-icon` | the only non-lucide icon; Discord actions only |
| `IconTile` | `icon-tile` | `icon` (lucide component), `tone: brand \| neutral \| success \| warning \| danger \| info`, `size: sm \| md \| lg` |

### Navigation

| Component | File | Key props |
|---|---|---|
| `NavItem` | `nav-item` | `href`, `active` (→ `aria-current="page"` + 2 px brand indicator), `variant: header \| sidebar \| sheet`, `icon` (lucide), `badge`, `external`, `collapsed` (icon rail: label → sr-only; wrap in `Tooltip`). Server-safe; compute `active` with `usePathname()` in a small client parent. Put items in `<nav aria-label=…>`. **Use it for the site header, the dashboard sidebar and drawers** — one hover/active/focus model everywhere |
| `SheetNavItem` | `sheet` | = `NavItem variant="sheet"` (48 px rows) |

### Actions

| Component | File | Key props |
|---|---|---|
| `Button` | `button` | `variant: primary \| secondary \| outline \| ghost \| destructive \| destructive-ghost \| discord \| link`, `size: sm \| md \| lg \| icon-sm \| icon \| icon-lg`, `fullWidth`, `loading`, `href` (Link; http URLs open in a new tab with rel + sr-only hint), `external` |
| `IconButton` | `button` | `label` (required — becomes `aria-label`), `size: icon-sm \| icon \| icon-lg`, `variant` (ghost default), `href` |
| `buttonVariants` | `button` | class generator for rare custom elements (e.g. Base UI `render` triggers) |

Base UI triggers take our buttons via `render`: `<DialogTrigger render={<Button variant="secondary" />}>Open</DialogTrigger>`.

### Forms (client)

Control heights line up: **sm 32 · md 40 px on mouse, every size 44 px on touch** — Input, Select, NativeSelect, NumberField and Button share them, so a filter row never misaligns.

| Component | File | Key props |
|---|---|---|
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError` | `field` | Base UI field wiring — controls inside are labelled/described automatically. `FieldLabel optional`, `FieldError match={true}` (always show) |
| `FormField` | `field` | `label`, `description`, `error` (string → invalid + message), `optional`, `disabled`, `name` |
| `Fieldset`, `FieldsetLegend` | `field` | `disabled` really disables every control inside |
| `Input` | `input` | Base UI input; `startAdornment` (icon or 1–2 chars like `#`, `!`), `endAdornment`, `inputSize: sm \| md` |
| `Textarea` | `input` | auto-grows (`autoGrow`) |
| `NumberField` | `input` | `min`, `max`, `step`, `unit` (visual — include the unit in the label too), `size: sm \| md`, `value`/`onValueChange` |
| `IdInput` (+ `isSnowflake`, `parseSnowflake`, `snowflakeHelp`) | `snowflake-input` | **Every Discord channel/role/user ID field.** `kind: channel \| role \| user`, `value` (string, `""` = none), `onValueChange`, `required`. `#`/`@` adornment, numeric keyboard, pasted `<#…>` / `<@&…>` / `<@…>` mentions and channel links become the bare ID, 17–20 digit error after the first blur. Label/description come from `FormField`/`SettingRow` (`description={snowflakeHelp("role")}`); re-check with `isSnowflake()` before saving. IDs are strings — they exceed `Number.MAX_SAFE_INTEGER` |
| `SearchField` | `search-field` | **Every search box** (commands, docs). `value`, `onValueChange`, `label` (aria-label), `placeholder`, `resultCount` (announced politely, debounced), `formatResultCount`, `shortcut` ("/" default, `false` off), `size`. Clear button, Escape clears, Kbd hint on mouse devices. Wrap in `<search>` when it's the page's main search |
| `Select` | `select` | `items: {value,label,description?,disabled?}[]`, `label` (visible) or `aria-label`, `value`/`onValueChange`, `placeholder`, `size` |
| `NativeSelect` | `select` | styled `<select>` with chevron; label via `Field` |
| `Switch` | `switch` | `checked`/`onCheckedChange`, `size: sm \| md`, needs a label (SettingRow, FieldLabel or `aria-label`) |
| `Slider` | `slider` | `label` (or `aria-label`), `value`/`onValueChange`, `min`, `max`, `step`, `unit`, `description`, `showValue`, `showRange`, `formatValue` |
| `Checkbox` | `checkbox` | `checked`, `indeterminate`, `onCheckedChange`; wrap in `<label>` with text |
| `RadioGroup`, `RadioOption`, `Radio` | `radio-group` | `RadioOption label description card` |
| `SegmentedControl` | `radio-group` | `options: {value,label,icon?}[]`, `aria-label`, `value`/`onValueChange`, `size`, `fullWidth` |

Validation: show errors under the field (`FormField error`), never only in a toast. Discord IDs: `IdInput`.

### Disclosure (client)

| Component | File | Key props |
|---|---|---|
| `Tabs`, `TabsList`, `TabsTab`, `TabsPanel` | `tabs` | `TabsList variant: pill \| line` (+ required `aria-label`), sliding indicator, scrolls on phones |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel` | `accordion` | closed panels stay findable (`hidden="until-found"`); `AccordionTrigger headingLevel={2\|3\|4}` |
| `FaqList` | `accordion` | `items: {question, answer, id?}[]`, `headingLevel` |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` (`destructive`), `DropdownMenuLinkItem`, `DropdownMenuCheckboxItem`, `DropdownMenuLabel`, `DropdownMenuGroup` + `DropdownMenuGroupLabel`, `DropdownMenuSeparator` | `dropdown-menu` | `DropdownMenuContent side align sideOffset`; `menuItemClasses` for custom items |
| `Tooltip`, `TooltipProvider` | `tooltip` | `content`, `side`, `align`; supplementary only (touch users can't hover). Provider is already in the root layout |

### Overlays & feedback (client unless noted)

| Component | File | Key props |
|---|---|---|
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogClose`, `DialogCloseButton` | `dialog` | `DialogContent title description footer size hideClose` — bottom sheet on phones, centred ≥ sm |
| `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogClose` | `dialog` | confirmations for destructive actions; `footer` required |
| `Sheet`, `SheetTrigger`, `SheetContent`, `SheetClose`, `SheetNavItem` | `sheet` | `SheetContent side: right \| left \| bottom \| top`, `title` (+ `hideTitle`), `headerStart` (logo), `footer` (CTA). Focus trap, Escape, scroll lock, inert page — use for the mobile site menu and dashboard drawer |
| `toast` + `Toaster` | `toast` | `toast.success/error/warning/info/loading(title, {description, action:{label,onClick}, timeout})`, `toast.promise(p, {loading, success, error})`, `toast.dismiss(id)`. `Toaster` is already mounted in the root layout |
| `Spinner` (server) | `spinner` | `size: xs \| sm \| md \| lg`, `label` (omit when decorative) |
| `Skeleton`, `SkeletonText`, `LoadingRegion` (server) | `skeleton` | match the final layout's size; wrap in `LoadingRegion label` for one SR announcement |
| `EmptyState`, `ErrorState` (server-safe) | `states` | `EmptyState icon title description actions headingAs variant`; `ErrorState title description detail onRetry retrying actions variant: card \| plain \| inline` |
| `Badge`, `Pill`, `PlaceholderBadge`, `StatusDot` (server) | `badge` | `Badge tone size dot`; `Pill leading href`; `StatusDot tone pulse` (pulse stops under reduced motion) |
| `Kbd`, `KbdGroup` (server) | `kbd` | |
| `Avatar` | `avatar` | `src`, `name` (initials fallback, null-safe), `decorative`, `size`, `shape`; uses next/image (Discord CDN needs `remotePatterns`, configured in `next.config.ts`) |

### Data & dashboard patterns

| Component | File | Key props |
|---|---|---|
| `StatCard` (server) | `stat-card` | `label`, `value` (`null` → "—"), `hint`, `icon`, `placeholder` (shows **Placeholder** tag), `loading`, `size: md \| lg` (type-metric / type-metric-lg) |
| `ResponsiveList` | `responsive-list` | `rows`, `columns: {key, header, cell(row), primary?, actions?, hideOnMobile?, width?, className?}[]`, `getRowKey`, `caption`, `empty` — `<table>` ≥ md, cards on phones. Long values (URLs, regexes) wrap anywhere, the actions column is shrink-wrapped, and the table sits in a labelled keyboard-scrollable region as a last resort. No `max-w-*` crutches needed |
| `SettingsSection` | `settings-section` | `title`, `description`, `icon`, `action` (compact: master `Switch aria-label`, optionally with a status `Badge` — stays in the title row on phones), `disabled` (real fieldset disable), `disabledHint`, `tone: default \| danger`, `headingAs` |
| `SettingRow` | `settings-section` | `label`, `description`, `control`, `layout`, `error`, `children`, `hideLabel` |
| `SaveBar` | `save-bar` | `dirty`, `saving`, `onSave`, `onReset`, `error`, `message`, `saveLabel`, `warnOnLeave`. Place it as the **last child of the page content, after (not inside) the `gap-*` stack**. Sticky; 0 px tall while hidden, reserves its own height while visible (no `overflow-hidden` on ancestors). Ctrl/⌘+S saves; toasts move above it |
| `CodeBlock`, `CommandChip`, `CopyButton` | `code-block` | `CodeBlock code title prompt copyable`; wraps between tokens (`--do` never splits), hanging indent after the prompt, safe inside `Prose`. `CommandChip command size` (copies on click); `CopyButton value label` |

**SettingRow layout:**

- `layout="auto"` (default) — compact controls (`Switch`, `Checkbox`, or anything marked `data-compact-control`) stay **beside** the label at every width, top-aligned on phones like Discord/iOS; any other control (Input, IdInput, NumberField, Select, buttons) sits beside it from 640 px and **below** it on phones.
- `layout="inline"` — always beside (custom compact controls, e.g. a Badge + Switch group).
- `layout="stacked"` — always below (textareas, lists, previews).
- `hideLabel` — the control renders its own visible label (`Slider label`, `Select label`); the row stacks control → description → children → error, and the description stays linked via `aria-describedby`.

**Dashboard page recipe**

```tsx
<Container size="wide" className="py-page">
  <PageHeader title="Anti-nuke" description="…" meta={<Badge tone="success" dot>On</Badge>} />
  {state === "loading" && <LoadingRegion label="Loading anti-nuke settings">…Skeletons…</LoadingRegion>}
  {state === "error" && <ErrorState onRetry={load} />}        {/* never render defaults as if real */}
  {state === "ready" && (
    <>
      <div className="flex flex-col gap-6">
        <SettingsSection title="Thresholds" action={<Switch aria-label="Enable anti-nuke" …/>} disabled={!enabled}>
          <SettingRow label="Ban threshold" hideLabel description="…" control={<Slider label="Ban threshold" unit="per minute" …/>} />
          <SettingRow label="Log channel" description={snowflakeHelp("channel")} control={<IdInput kind="channel" …/>} />
          <SettingRow label="DM on join" description="…" control={<Switch …/>} />
        </SettingsSection>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />   {/* after the stack */}
    </>
  )}
</Container>
```

Save feedback: `toast.success("Changes saved")`; failures: keep the SaveBar visible with `error` and `toast.error(…, {action: {label: "Retry", onClick: save}})`.

**Marketing page recipe**

```tsx
// src/app/(marketing)/x/page.tsx — the layout already renders the sticky header, <main id="main"> and footer.
export const metadata: Metadata = { title: "Commands", description: "…", alternates: { canonical: "/commands" } };
export default function Page() {
  return (
    <>
      <Section titleAs="h1" eyebrow="…" title="…" description="…" />   {/* exactly one h1; no header offset */}
      <Section id="features" eyebrow="Features" title="…">
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          <FeatureCard icon={ShieldCheck} title="Anti-nuke" description="…" />
        </div>
      </Section>
      <Section id="faq" eyebrow="FAQ" title="Questions"><FaqList items={…} /></Section>
    </>
  );
}
// Landing hero with a glow that should start behind the header: <Section behindHeader className="bg-spotlight" …>
```

Metadata: the root layout sets `title.template` (`%s · Pleed`), `metadataBase`, default description, Open Graph and Twitter defaults. Pages export `title`, `description`, `alternates.canonical`. If a page sets `openGraph`, it **replaces** the parent object — spread what you need (`siteName: SITE_NAME`, `type: "website"`).

---

## 4. Site constants (`@/lib/site`)

`SITE_NAME`, `SITE_TAGLINE`, `SITE_DESCRIPTION`, `SITE_URL` (from `NEXT_PUBLIC_SITE_URL` — **placeholder**, no production domain exists yet), `INVITE_URL` (exact OAuth URL — use for every "Add to Discord"), `SUPPORT_URL` (discord.gg/AfCCQt2VHP), `DISCORD_TERMS_URL`, `DISCORD_GUIDELINES_URL`, `DEFAULT_PREFIX` (`!`), `NAV_LINKS`, `FOOTER_GROUPS`, `SOCIAL_LINKS` (Discord only — there are no other real accounts), `COPYRIGHT_HOLDER` ("Pleed Development").

Honest numbers: `await getCommandFacts()` (server) → `{ uniqueCommands: 403, categories: 11, publicEntries: 586, categoryNames, uniqueCommandsLabel: "400+" }`, derived from `src/data/commands.json` after hiding owner-only Core commands (`isPublicCommand`, `PUBLIC_CORE_COMMANDS`). Never type these numbers by hand. `SITE_STATS` (servers, users, uptime) are `null` — render them as `StatCard placeholder` / `PlaceholderBadge` with a `// PLACEHOLDER: replace with real data` comment. Never invent counts, uptime or testimonials.

---

## 5. Motion rules

- `MotionProvider` (root layout) = `LazyMotion` (lazy `domAnimation`) + `MotionConfig reducedMotion="user"`. In client components import `m` (not `motion`) from `framer-motion`: `<m.div variants={fadeRise} …>`. `motion.*` defeats lazy loading.
- `Reveal` / `Stagger` (`@/components/motion/reveal`) for in-view entrances (600 ms, ease-out-expo, 12 px rise). They are tiny client islands usable from Server Components; children stay server-rendered. They only animate content that is still below the fold after hydration, so SSR HTML is fully visible (LCP, no-JS, crawlers). `Stagger step={60}` (≤ 80 ms) so rows settle together.
- **Never** ship the LCP element (hero h1/lead/CTA) with `initial={{opacity: 0}}`. Hero entrances, if any, use transform only or start after paint.
- Animate `transform` and `opacity` only (no `layout` animations on lists, no width/height except Base UI's measured accordion/collapsible). 150–500 ms for UI, 600 ms for reveals. No infinite animations except spinners/skeleton shimmer/`StatusDot pulse` (all stop under reduced motion).
- No hover-scale on static cards. Interactive cards may lift 1 px (`active:translate-y-px`) — `Card href` does it.
- `prefers-reduced-motion: reduce` is honoured globally in CSS (transitions/animations ≈ 0) and by framer (`reducedMotion="user"`).

## 6. Accessibility rules

- One `<h1>` per page; headings in order (use `titleAs` / `headingAs` / `headingLevel` props). Marketing pages render no `<main>` (the layout does); dashboard shell owns its own landmarks.
- Every interactive element: visible `focus-visible` ring (global, brand), hover and active states, ≥ 44×44 on touch (components grow on `pointer-coarse`). Icon-only buttons → `IconButton label`.
- Control boundaries ≥ 3:1 (`line-control`), selected state ≥ 3:1 against its track (the kit does both). Hover/selected on transparent elements use the overlay tokens, never an opaque surface step.
- Every control labelled: `FormField`/`Field`, `SettingRow`, `Slider label`, `Select label`, `SearchField label` or `aria-label`. Groups of radios/checkboxes get a legend or `aria-labelledby`. Toggles are `Switch` (`role="switch"`), never styled buttons.
- Disabled sections use `SettingsSection disabled` / `Fieldset disabled` (real disabling), not `opacity-50 pointer-events-none`.
- Text contrast: `fg-tertiary` is the lowest tier for readable text; `fg-disabled` only for disabled labels/values. Never put text on `brand-500` (use `bg-brand` = brand-600) or on semantic `-fg` colours.
- Links inside sentences are underlined (`TextLink` does it in both tones); colour alone never marks a link.
- External links: `TextLink`/`Button href`/`NavItem` add `target=_blank rel="noopener noreferrer"`, the ↗ affordance and an sr-only "(opens in a new tab)".
- Overlays: use `Dialog`/`AlertDialog`/`Sheet` (focus trap, Escape, scroll lock, inert page, focus return). Never hand-roll a drawer with `translate-x-full` (it stays in the tab order).
- Live updates: result counts and async status in `aria-live="polite"` (`SearchField resultCount` does it); errors `role="alert"` (`ErrorState` does this).
- Images: `next/image` with real `alt` (or `alt=""` when decorative). Decorative icons `aria-hidden`.

## 7. Do / Don't

| Do | Don't |
|---|---|
| `bg-surface-1 border-line` cards on the canvas | `bg-black`, `bg-[#0a0a0a]`, `bg-white/5` wrappers |
| `type-h2 text-fg` | `text-4xl md:text-6xl font-extrabold text-white` |
| `Container` / `container-content` | `container mx-auto px-4 sm:px-6 lg:px-8` |
| `hover:bg-hover` on transparent rows/buttons | `hover:bg-surface-3` (invisible on surface-3) |
| One brand accent; semantic colours only for meaning | a different hue per feature card / dashboard module |
| `FeatureCard` / `IconTile` with lucide icons | emoji, image icons, `IconTile className="mb-2"` stacks, duplicated decorative watermark icons |
| `NavItem`, `SearchField`, `IdInput` | a hand-rolled active nav link, search box or `<Input>` + regex for Discord IDs |
| `Button variant="discord" href={INVITE_URL}` with `DiscordIcon` | `/invite`, hard-coded OAuth URLs, `href="#"` |
| `Switch`, `Slider`, `Select` from the kit | `<button className="w-14 h-7 rounded-full">` toggles, unlabelled `<input type=range>` |
| Honest placeholders (`PlaceholderBadge`, `SITE_STATS`) | invented server/user counts, uptime %, "Pleed 2.0" |
| `ErrorState` with retry when a load fails | rendering default config as if it were real data |
| `SaveBar` after the section stack + toast feedback | a Save button that scrolls away with no feedback |
| Sticky in-flow header, no offsets; `Section behindHeader` for a hero glow | `pt-header`, `-mt-header`, `scroll-mt-*` sprinkled on sections |
| `Reveal`/`Stagger`, `m.*` + tokens | `motion.*` everywhere, `initial={{opacity:0}}` on the hero, `layout` on long lists |
| `next/image` | raw `<img>` |
| `min-w-0` / `grid-cols-1` around scrollers and long text | `overflow-x-hidden` to hide overflow bugs |

## 8. Dev mocks

See `src/lib/dev/README.md` (owned by the data agent): mock Discord session and mock API in development only, plus `?mock=` switches (`empty`, `error`, `savefail`, `slow`, `loading`, `signedout`, `sessionloading`, `off`) to review every dashboard state.

## 9. QA notes

- `/design-system` is the visual reference — check your page against it at 390, 820, 1440 and 2560.
- Run `npx eslint <your files>` — the "Pleed tokens only" rule must pass.
- `shoot.mjs` lists Base UI's visually hidden native inputs (`aria-hidden`, `tabindex=-1`, 1×1 px — used for form submission by Switch/Checkbox/Radio/Select/NumberField/Slider) as "small touch targets" and sr-only text / `sr-only` labels as "clipped". Those are expected; the visible controls are ≥ 44 px on touch.
