# Pleed design system

The contract every page builder follows. Live reference: **`/design-system`** (dev only — every token and component in every state). Tokens live in `src/app/globals.css`, components in `src/components/ui/**`, motion in `src/components/motion/**`, site constants in `src/lib/site.ts`. Only the design-system owner edits those files — request changes instead of forking a component.

Art direction: dark-first, premium, calm. Depth comes from layered surfaces, hairline borders, a top-edge light catch and great type — not from glow or gradients. One accent (violet/indigo brand) used with restraint; Discord blurple only for Discord actions. Real product UI is built from these components, never screenshots.

---

## 1. Tokens

Use tokens through Tailwind utilities. **No hex values, no `bg-[#…]`, no `text-[13px]`, no raw palette colours (`gray-400`, `indigo-600`, `white/5`).** If something is missing, ask for a token.

### Colour

| Role | Utility | Notes |
|---|---|---|
| App background | `bg-canvas` | `#0b0c10`, faint cool tint. `<body>` already has it — don't repaint pages. |
| Recessed well | `bg-inset` | inputs, code, previews inside cards |
| Surface 1 | `bg-surface-1` | cards, sections, sidebars |
| Surface 2 | `bg-surface-2` | raised cards, popovers, menus, dialogs |
| Surface 3 | `bg-surface-3` | hover / selected rows, active tab pill |
| Surface 4 | `bg-surface-4` | pressed, slider/switch tracks |
| Scrim | `bg-scrim` | modal backdrop (components handle it) |
| Hairlines | `border-line-subtle` (6%) · `border-line` (9%, default) · `border-line-strong` (15%, controls/raised) · `border-line-hover` (24%) · `border-line-control` (40%, checkbox/radio ≥3:1) | white-alpha, read on every surface |
| Text | `text-fg` · `text-fg-secondary` · `text-fg-tertiary` · `text-fg-disabled` | contrast on inset…surface-3: 14.7–18.4 · 9.5–11.8 · 6.3–7.9 · 4.6–5.3 (inset…surface-2) |
| Brand | `bg-brand` (solid primary, white text 5.3:1) · `hover:bg-brand-hover` · `text-brand-fg` (brand text/icons on dark, 8–10:1) · `bg-brand-subtle` + `border-brand-border` (tints) · scale `brand-50…950` | violet→indigo, hue 283 |
| Mark gradient | `from-brand-violet to-brand-indigo` | Logo and `GradientText` only |
| Semantic | `{success,warning,danger,info}-fg` (text/icons) · `-subtle` (tinted bg) · `-border` · `-strong` + `-strong-fg` (solid fill) | colour never carries meaning alone — pair with icon/text |
| Discord | `bg-discord hover:bg-discord-hover` | "Add to Discord", "Log in with Discord" only |
| Focus | `outline-focus` / `focus-visible:focus-ring` | brand-400, 7.4:1 on canvas |

shadcn variable names (`bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-destructive`, `sidebar-*`, `chart-1…5`) are mapped onto these tokens, so shadcn CLI components inherit the theme. Prefer the Pleed names in new code.

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
| `type-caption` | 13 / 1.45 | helper text, meta, timestamps (minimum readable size — never smaller for sentences) |
| `type-eyebrow` | 12 mono uppercase | labels above titles, table headers in mono contexts |
| `type-code` | 0.875em mono | inline code |

Override weight/colour after the type class (`type-h3 font-medium text-fg-secondary`) — `cn()` knows these classes. Use `tabular-nums` for changing numbers. `h1–h3` default to the display family and `text-wrap: balance`; paragraphs get `text-wrap: pretty`.

**At ≥1920 px the root font grows to 17 px, at ≥2400 px to 19 px**, so every rem-based size, spacing and container scales up — 2560 looks designed, not miniature. Media queries are unaffected.

### Spacing & layout

- Spacing uses Tailwind's 4 px scale (`p-4`, `gap-6`…) plus fluid tokens: `px-gutter` (16 → 40 px page gutter), `py-section` (64 → 128 px), `py-section-sm` (48 → 80 px), `h-header` / `pt-header` / `scroll-mt-header` (64 px sticky header).
- Containers: `container-content` (1216 px, marketing), `container-wide` (1440 px, dashboard content / wide grids), `container-narrow` (768 px, legal/forms), `max-w-measure` (68ch prose). Each includes the fluid gutter and centring — use `<Container size=…>` or the utility, never `container mx-auto px-4 sm:px-6 lg:px-8`. Never nest containers.
- Grids that contain scrollers (Tabs, SegmentedControl, code) need `grid-cols-1` / `minmax(0,1fr)` tracks or `min-w-0` items so they can't widen the page.

### Radii

`rounded-xs 4` · `sm 6` (kbd, small chips) · `md 8` (small buttons, menu items) · **`lg 10` (controls: buttons, inputs, selects)** · **`xl 14` (cards, toasts)** · `2xl 18` (panels, dialogs) · `3xl 24` (hero product frames) · `full` (pills, avatars, switches). Nested radius = outer − padding.

### Elevation

Dark UIs separate layers with borders first. Shadows: `shadow-xs/sm/md/lg/xl` (md for raised cards, lg for popovers/toasts, xl for dialogs/sheets). `inset-shadow-highlight` adds the 1 px top light catch on raised surfaces (`-strong` on solid buttons). Glow: `shadow-glow` (primary CTA hover only) and `shadow-glow-lg` (one hero product frame per page). Decorative backgrounds: `bg-spotlight` (soft brand light from the top), `bg-grid` (faint 48 px grid) — at most one per section, never behind body text without a surface. `mask-fade-b`, `mask-fade-x` fade edges.

### Z-index

`z-raised 10` · `z-sticky 20` · `z-header 40` · `z-savebar 45` · `z-overlay 50` · `z-modal 60` · `z-popover 70` · `z-toast 80` · `z-tooltip 90` · `z-skip 100`. Never use raw `z-[999]`.

### Motion

Durations: `duration-150` (hover, toggles) · `duration-200` (controls, popovers) · `duration-300` (sheets, accordions) · `duration-500` (reveals). Easing: `ease-standard` (UI), `ease-out-expo` (entrances), `ease-exit`. framer tokens in `@/components/motion/tokens` (`duration`, `ease`, `spring`, `fadeRise`, `fade`, `scaleIn`, `staggerChildren`). CSS vars `--duration-*` exist for custom CSS.

---

## 2. Breakpoints & layout rules

Tailwind breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` · **`3xl 1920`** (custom). Touch devices are targeted with `pointer-coarse:` (not width).

| Range | Rules |
|---|---|
| **Phones < 768** | single column; gutter 16–20 px; mobile nav in a `Sheet`; tables → `ResponsiveList` cards; header actions stack (`PageHeader` does this); sticky elements must not cover more than ~15% of the screen; every target ≥ 44×44 (components do this on `pointer-coarse`); inputs use 16 px text (no iOS zoom). |
| **Tablet portrait 768–1023** | deliberate 2-column grids (features, stats 2×2), stacked hero (copy then product preview), still the mobile/sheet navigation for the site header; dashboard: content gets the full width (sidebar is a drawer or icon rail — never a 256 px column eating 33%). |
| **Tablet landscape / small laptop 1024–1279** | desktop site nav appears at `lg`; 2–3 columns; hero two-column; dashboard sidebar may be a compact rail or full; avoid `min-h-screen` heroes (short viewports, 800 px). |
| **Desktop ≥ 1280** | full layouts; marketing content at `container-content`; dashboard content max `container-wide`, centred next to the sidebar. |
| **Wide ≥ 1920 (`3xl`)** | root font scales (17/19 px), so layouts grow proportionally; optionally add a 4th column (`3xl:grid-cols-4`) for card grids; never let content hug the left edge — centre the column. |

Heroes: content-driven padding (`pt-header` + `py-section`), never `min-h-screen`/`100vh`; if you need a viewport-relative height use `svh` with a cap.

---

## 3. Components

Import from `@/components/ui/<file>`. Client components are marked; everything else works in Server Components. All components accept `className` (merged with `cn` from `@/lib/utils`).

### Layout & content

| Component | File | Key props |
|---|---|---|
| `Container` | `container` | `size: "content" \| "wide" \| "narrow"`, `as` |
| `Section`, `SectionHeader` | `section` | `id`, `eyebrow`, `title`, `description`, `titleAs` (h2 default), `align: start \| center`, `actions`, `spacing: default \| compact \| none`, `container`, `tone: default \| raised` |
| `PageHeader` | `page-header` | `title` (renders the page's single `<h1>`), `description`, `meta` (badge), `actions`, `breadcrumbs`, `eyebrow` |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `card` | `variant: default \| raised \| inset \| outline \| brand`, `padding: none \| sm \| md \| lg`, `href` (whole card is a link → interactive), `interactive`; `CardTitle as="h2"\|"h3"\|"h4"\|"p"` |
| `Prose` | `prose` | wraps long-form HTML (legal, docs); 68ch measure, anchor-friendly h2/h3 |
| `Separator` | `separator` | `orientation`, `label` ("or"), `decorative` |
| `GradientText` | `gradient-text` | one short phrase per page, never body copy |
| `TextLink` | `text-link` | `href`, `external` (auto for http), `tone: brand \| subtle` |
| `Breadcrumbs` | `breadcrumbs` | `items: {label, href?}[]` (last = current page) |

### Brand

| Component | File | Key props |
|---|---|---|
| `Logo` | `logo` | `size: xs…xl`, `href` (home link), `markOnly` + `title` |
| `LogoMark` | `logo` | `size`, `title` (omit when the wordmark is visible). `LOGO_P_PATH`, `LOGO_GRADIENT` exported for icon/OG generators |
| `DiscordIcon` | `discord-icon` | the only non-lucide icon; Discord actions only |
| `IconTile` | `icon-tile` | `icon` (lucide component), `tone: brand \| neutral \| success \| warning \| danger \| info`, `size: sm \| md \| lg` |

### Actions

| Component | File | Key props |
|---|---|---|
| `Button` | `button` | `variant: primary \| secondary \| outline \| ghost \| destructive \| destructive-ghost \| discord \| link`, `size: sm \| md \| lg \| icon-sm \| icon \| icon-lg`, `fullWidth`, `loading`, `href` (Link; http URLs open in a new tab with rel + sr-only hint), `external` |
| `IconButton` | `button` | `label` (required — becomes `aria-label`), `size: icon-sm \| icon \| icon-lg`, `variant` (ghost default), `href` |
| `buttonVariants` | `button` | class generator for rare custom elements (e.g. Base UI `render` triggers) |

Base UI triggers take our buttons via `render`: `<DialogTrigger render={<Button variant="secondary" />}>Open</DialogTrigger>`.

### Forms (client)

| Component | File | Key props |
|---|---|---|
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError` | `field` | Base UI field wiring — controls inside are labelled/described automatically. `FieldLabel optional`, `FieldError match={true}` (always show) |
| `FormField` | `field` | `label`, `description`, `error` (string → invalid + message), `optional`, `disabled`, `name` |
| `Fieldset`, `FieldsetLegend` | `field` | `disabled` really disables every control inside |
| `Input` | `input` | Base UI input; `startAdornment` (icon or 1–2 chars like `#`, `!`), `endAdornment`, `inputSize: sm \| md` |
| `Textarea` | `input` | auto-grows (`autoGrow`) |
| `NumberField` | `input` | `min`, `max`, `step`, `unit` (visual — include the unit in the label too), `value`/`onValueChange` |
| `Select` | `select` | `items: {value,label,description?,disabled?}[]`, `label` (visible) or `aria-label`, `value`/`onValueChange`, `placeholder`, `size` |
| `NativeSelect` | `select` | styled `<select>` with chevron; label via `Field` |
| `Switch` | `switch` | `checked`/`onCheckedChange`, `size: sm \| md`, needs a label (SettingRow, FieldLabel or `aria-label`) |
| `Slider` | `slider` | `label` (or `aria-label`), `value`/`onValueChange`, `min`, `max`, `step`, `unit`, `description`, `showValue`, `showRange`, `formatValue` |
| `Checkbox` | `checkbox` | `checked`, `indeterminate`, `onCheckedChange`; wrap in `<label>` with text |
| `RadioGroup`, `RadioOption`, `Radio` | `radio-group` | `RadioOption label description card` |
| `SegmentedControl` | `radio-group` | `options: {value,label,icon?}[]`, `aria-label`, `value`/`onValueChange`, `size`, `fullWidth` |

Validation: show errors under the field (`FormField error`), never only in a toast. Discord IDs: validate 17–20 digits inline.

### Navigation & disclosure (client)

| Component | File | Key props |
|---|---|---|
| `Tabs`, `TabsList`, `TabsTab`, `TabsPanel` | `tabs` | `TabsList variant: pill \| line` (+ required `aria-label`), sliding indicator, scrolls on phones |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel` | `accordion` | closed panels stay findable (`hidden="until-found"`); `AccordionTrigger headingLevel={2\|3\|4}` |
| `FaqList` | `accordion` | `items: {question, answer, id?}[]`, `headingLevel` |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` (`destructive`), `DropdownMenuLinkItem`, `DropdownMenuCheckboxItem`, `DropdownMenuLabel`, `DropdownMenuGroup` + `DropdownMenuGroupLabel`, `DropdownMenuSeparator` | `dropdown-menu` | `DropdownMenuContent side align sideOffset` |
| `Tooltip`, `TooltipProvider` | `tooltip` | `content`, `side`, `align`; supplementary only (touch users can't hover). Provider is already in the root layout |

### Overlays & feedback (client unless noted)

| Component | File | Key props |
|---|---|---|
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogClose`, `DialogCloseButton` | `dialog` | `DialogContent title description footer size hideClose` — bottom sheet on phones, centred ≥ sm |
| `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogClose` | `dialog` | confirmations for destructive actions; `footer` required |
| `Sheet`, `SheetTrigger`, `SheetContent`, `SheetClose`, `SheetNavItem` | `sheet` | `SheetContent side: right \| left \| bottom \| top`, `title` (+ `hideTitle`), `headerStart` (logo), `footer` (CTA); `SheetNavItem href active external` 48 px rows. Focus trap, Escape, scroll lock, inert page — use for the mobile site menu and dashboard drawer |
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
| `StatCard` (server) | `stat-card` | `label`, `value` (`null` → "—"), `hint`, `icon`, `placeholder` (shows **Placeholder** tag), `loading`, `size` |
| `ResponsiveList` | `responsive-list` | `rows`, `columns: {key, header, cell(row), primary?, actions?, hideOnMobile?, className?}[]`, `getRowKey`, `caption`, `empty` — `<table>` ≥ md, cards on phones, long values wrap |
| `SettingsSection` | `settings-section` | `title`, `description`, `icon`, `action` (e.g. master `Switch aria-label`), `disabled` (real fieldset disable), `disabledHint`, `tone: default \| danger`, `headingAs` |
| `SettingRow` | `settings-section` | `label`, `description`, `control`, `layout: inline \| stacked`, `error`, `hideLabel` (when the control has its own label, e.g. Slider/Select) |
| `SaveBar` | `save-bar` | `dirty`, `saving`, `onSave`, `onReset`, `error`, `message`, `saveLabel`, `warnOnLeave`. Place as the **last child** of the page content (sticky — no `overflow-hidden` on ancestors). Ctrl/⌘+S saves; toasts move above it |
| `CodeBlock`, `CommandChip`, `CopyButton` | `code-block` | `CodeBlock code title prompt copyable`; `CommandChip command size` (copies on click); `CopyButton value label` |

**Dashboard page recipe**

```tsx
<Container size="wide" className="py-8">
  <PageHeader title="Anti-nuke" description="…" meta={<Badge tone="success" dot>On</Badge>} />
  {state === "loading" && <LoadingRegion label="Loading anti-nuke settings">…Skeletons…</LoadingRegion>}
  {state === "error" && <ErrorState onRetry={load} />}        {/* never render defaults as if real */}
  {state === "ready" && (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Thresholds" action={<Switch aria-label="Enable anti-nuke" …/>} disabled={!enabled}>
        <SettingRow label="Ban threshold" hideLabel layout="stacked" control={<Slider label="Ban threshold" unit="per minute" …/>} />
      </SettingsSection>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </div>
  )}
</Container>
```

Save feedback: `toast.success("Changes saved")`; failures: keep the SaveBar visible with `error` and `toast.error(…, {action: {label: "Retry", onClick: save}})`.

**Marketing page recipe**

```tsx
// src/app/(marketing)/x/page.tsx — the layout already renders header, <main id="main"> and footer.
export const metadata: Metadata = { title: "Commands", description: "…", alternates: { canonical: "/commands" } };
export default function Page() {
  return (
    <>
      <Section titleAs="h1" … className="pt-header" />  {/* exactly one h1 */}
      <Section id="faq" eyebrow="FAQ" title="Questions" />
    </>
  );
}
```

Metadata: the root layout sets `title.template` (`%s · Pleed`), `metadataBase`, default description, Open Graph and Twitter defaults. Pages export `title`, `description`, `alternates.canonical`. If a page sets `openGraph`, it **replaces** the parent object — spread what you need (`siteName: SITE_NAME`, `type: "website"`).

---

## 4. Site constants (`@/lib/site`)

`SITE_NAME`, `SITE_TAGLINE`, `SITE_DESCRIPTION`, `SITE_URL` (from `NEXT_PUBLIC_SITE_URL` — **placeholder**, no production domain exists yet), `INVITE_URL` (exact OAuth URL — use for every "Add to Discord"), `SUPPORT_URL` (discord.gg/AfCCQt2VHP), `DISCORD_TERMS_URL`, `DISCORD_GUIDELINES_URL`, `DEFAULT_PREFIX` (`!`), `NAV_LINKS`, `FOOTER_GROUPS`, `SOCIAL_LINKS` (Discord only — there are no other real accounts), `COPYRIGHT_HOLDER` ("Pleed Development").

Honest numbers: `await getCommandFacts()` (server) → `{ uniqueCommands: 403, categories: 11, publicEntries: 586, categoryNames, uniqueCommandsLabel: "400+" }`, derived from `src/data/commands.json` after hiding owner-only Core commands (`isPublicCommand`, `PUBLIC_CORE_COMMANDS`). Never type these numbers by hand. `SITE_STATS` (servers, users, uptime) are `null` — render them as `StatCard placeholder` / `PlaceholderBadge` with a `// PLACEHOLDER: replace with real data` comment. Never invent counts, uptime or testimonials.

---

## 5. Motion rules

- `MotionProvider` (root layout) = `LazyMotion` (lazy `domAnimation`) + `MotionConfig reducedMotion="user"`. In client components import `m` (not `motion`) from `framer-motion`: `<m.div variants={fadeRise} …>`. `motion.*` defeats lazy loading.
- `Reveal` / `Stagger` (`@/components/motion/reveal`) for in-view entrances. They are tiny client islands usable from Server Components; children stay server-rendered. They only animate content that is still below the fold after hydration, so SSR HTML is fully visible (LCP, no-JS, crawlers). `Stagger step={60}` (≤ 80 ms) so rows settle together.
- **Never** ship the LCP element (hero h1/lead/CTA) with `initial={{opacity: 0}}`. Hero entrances, if any, use transform only or start after paint.
- Animate `transform` and `opacity` only (no `layout` animations on lists, no width/height except Base UI's measured accordion/collapsible). 150–500 ms. No infinite animations except spinners/skeleton shimmer/`StatusDot pulse` (all stop under reduced motion).
- No hover-scale on static cards. Interactive cards may lift 1 px (`active:translate-y-px`) — `Card href` does it.
- `prefers-reduced-motion: reduce` is honoured globally in CSS (transitions/animations ≈ 0) and by framer (`reducedMotion="user"`).

## 6. Accessibility rules

- One `<h1>` per page; headings in order (use `titleAs` / `headingAs` / `headingLevel` props). Marketing pages render no `<main>` (the layout does); dashboard shell owns its own landmarks.
- Every interactive element: visible `focus-visible` ring (global, brand), hover and active states, ≥ 44×44 on touch (components grow on `pointer-coarse`). Icon-only buttons → `IconButton label`.
- Every control labelled: `FormField`/`Field`, `SettingRow`, `Slider label`, `Select label`, or `aria-label`. Groups of radios/checkboxes get a legend or `aria-labelledby`. Toggles are `Switch` (`role="switch"`), never styled buttons.
- Disabled sections use `SettingsSection disabled` / `Fieldset disabled` (real disabling), not `opacity-50 pointer-events-none`.
- Text contrast: `fg-tertiary` is the lowest tier for readable text; `fg-disabled` only for disabled labels/values. Never put text on `brand-500` (use `bg-brand` = brand-600) or on semantic `-fg` colours.
- External links: `TextLink`/`Button href` add `target=_blank rel="noopener noreferrer"`, the ↗ affordance and an sr-only "(opens in a new tab)".
- Overlays: use `Dialog`/`AlertDialog`/`Sheet` (focus trap, Escape, scroll lock, inert page, focus return). Never hand-roll a drawer with `translate-x-full` (it stays in the tab order).
- Live updates: result counts and async status in `aria-live="polite"`; errors `role="alert"` (`ErrorState` does this).
- Images: `next/image` with real `alt` (or `alt=""` when decorative). Decorative icons `aria-hidden`.

## 7. Do / Don't

| Do | Don't |
|---|---|
| `bg-surface-1 border-line` cards on the canvas | `bg-black`, `bg-[#0a0a0a]`, `bg-white/5` wrappers |
| `type-h2 text-fg` | `text-4xl md:text-6xl font-extrabold text-white` |
| `Container` / `container-content` | `container mx-auto px-4 sm:px-6 lg:px-8` |
| One brand accent; semantic colours only for meaning | a different hue per feature card / dashboard module |
| `IconTile` with lucide icons, `strokeWidth` 1.75 | emoji, image icons, duplicated decorative watermark icons |
| `Button variant="discord" href={INVITE_URL}` with `DiscordIcon` | `/invite`, hard-coded OAuth URLs, `href="#"` |
| `Switch`, `Slider`, `Select` from the kit | `<button className="w-14 h-7 rounded-full">` toggles, unlabelled `<input type=range>` |
| Honest placeholders (`PlaceholderBadge`, `SITE_STATS`) | invented server/user counts, uptime %, "Pleed 2.0" |
| `ErrorState` with retry when a load fails | rendering default config as if it were real data |
| `SaveBar` + toast feedback | a Save button that scrolls away with no feedback |
| `Reveal`/`Stagger`, `m.*` + tokens | `motion.*` everywhere, `initial={{opacity:0}}` on the hero, `layout` on long lists |
| `next/image` | raw `<img>` |
| `min-w-0` / `grid-cols-1` around scrollers and long text | `overflow-x-hidden` to hide overflow bugs |

## 8. Dev mocks

See `src/lib/dev/README.md` (owned by the data agent): mock Discord session and mock API in development only, plus `?mock=` switches (`empty`, `error`, `savefail`, `slow`, `loading`, `signedout`, `sessionloading`, `off`) to review every dashboard state.

## 9. QA notes

- `/design-system` is the visual reference — check your page against it at 390, 820, 1440 and 2560.
- `shoot.mjs` lists Base UI's visually hidden native inputs (`aria-hidden`, `tabindex=-1`, 1×1 px — used for form submission by Switch/Checkbox/Radio/Select/NumberField/Slider) as "small touch targets" and sr-only text as "clipped". Those are expected; the visible controls are ≥ 44 px on touch.
