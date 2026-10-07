import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bot,
  ExternalLink,
  LayoutDashboard,
  MessageSquareReply,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Zap,
} from "lucide-react";

import { Badge, Pill, PlaceholderBadge, StatusDot } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, IconButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, FeatureCard } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Container } from "@/components/ui/container";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { GradientText } from "@/components/ui/gradient-text";
import { IconTile } from "@/components/ui/icon-tile";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Logo, LogoMark } from "@/components/ui/logo";
import { PageHeader } from "@/components/ui/page-header";
import { Prose, ProseTable } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { Separator } from "@/components/ui/separator";
import { Skeleton, SkeletonText, LoadingRegion } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { DISCORD_GUIDELINES_URL, getCommandFacts, INVITE_URL, SITE_STATS, SUPPORT_URL } from "@/lib/site";

import { DsBlock, DsNav, DsSection, Swatch } from "./_components/ds-layout";
import {
  CodeDemos,
  FormDemos,
  NavigationDemos,
  OverlayDemos,
  ListDemos,
  SettingsDemo,
  StateDemos,
} from "./_components/demos";

export const metadata: Metadata = {
  title: "Design system",
  description: "Pleed tokens and components in every state (development only).",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { id: "colour", label: "Colour" },
  { id: "type", label: "Typography" },
  { id: "layout", label: "Layout & elevation" },
  { id: "brand", label: "Brand" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges & keys" },
  { id: "cards", label: "Cards" },
  { id: "forms", label: "Form controls" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays & toasts" },
  { id: "feedback", label: "Feedback states" },
  { id: "data", label: "Data display" },
  { id: "code", label: "Code & commands" },
  { id: "prose", label: "Prose" },
  { id: "motion", label: "Motion" },
  { id: "settings", label: "Settings & save bar" },
];

const surfaces = [
  ["inset", "bg-inset", "Wells, code, inputs"],
  ["canvas", "bg-canvas", "App background"],
  ["surface-1", "bg-surface-1", "Cards, sections"],
  ["surface-2", "bg-surface-2", "Raised, popovers"],
  ["surface-3", "bg-surface-3", "Badges, tooltips, save bar"],
  ["surface-4", "bg-surface-4", "Selected pill, switch track"],
] as const;

const textTiers = [
  ["fg", "text-fg", "14.7–18.4:1", "Headings, primary text"],
  ["fg-secondary", "text-fg-secondary", "9.5–11.8:1", "Body copy, descriptions"],
  ["fg-tertiary", "text-fg-tertiary", "6.3–7.9:1", "Meta, captions, placeholders"],
  ["fg-disabled", "text-fg-disabled", "4.6–5.3:1", "Disabled labels and values"],
] as const;

const brandScale = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
const brandBg: Record<(typeof brandScale)[number], string> = {
  "50": "bg-brand-50",
  "100": "bg-brand-100",
  "200": "bg-brand-200",
  "300": "bg-brand-300",
  "400": "bg-brand-400",
  "500": "bg-brand-500",
  "600": "bg-brand-600",
  "700": "bg-brand-700",
  "800": "bg-brand-800",
  "900": "bg-brand-900",
  "950": "bg-brand-950",
};

const semantic = [
  { name: "success", fg: "text-success-fg", subtle: "bg-success-subtle border-success-border", strong: "bg-success-strong text-success-strong-fg" },
  { name: "warning", fg: "text-warning-fg", subtle: "bg-warning-subtle border-warning-border", strong: "bg-warning-strong text-warning-strong-fg" },
  { name: "danger", fg: "text-danger-fg", subtle: "bg-danger-subtle border-danger-border", strong: "bg-danger-strong text-danger-strong-fg" },
  { name: "info", fg: "text-info-fg", subtle: "bg-info-subtle border-info-border", strong: "bg-info-strong text-info-strong-fg" },
] as const;

const typeStyles = [
  ["type-display", "Display", "40 → 88 px · Mona Sans 640 · 112% width · -0.035em"],
  ["type-h1", "Heading 1", "34 → 60 px · Mona Sans 640 · 110% width"],
  ["type-h2", "Heading 2", "28 → 44 px · Mona Sans 620 · 108% width"],
  ["type-h3", "Heading 3", "21 → 28 px · Mona Sans 600 · 104% width"],
  ["type-h4", "Heading 4", "17 → 19 px · Geist 600"],
  ["type-lead", "Lead paragraph for intros and hero copy.", "17 → 20 px · Geist 400 · 1.6"],
  ["type-body", "Body text is set in Geist at 16 px with a 1.65 line-height for comfortable reading.", "16 px · 1.65"],
  ["type-small", "Small text for secondary UI copy and dense lists.", "14 px · 1.55"],
  ["type-caption", "Caption — helper text, timestamps, tooltips.", "13 px · 1.45 · the smallest size for any sentence"],
  ["type-label", "Control label — DM members on join", "14 px · Geist 500 · 1.375 (FieldLabel, SettingRow, nav)"],
  ["type-micro", "Badge · 3 new", "12 px · Geist 500 · badges, counters, small segments — never sentences"],
  ["type-eyebrow", "Eyebrow label", "12 px mono · uppercase · 0.08em"],
  ["type-code-sm", "!antinuke ban on --threshold 3", "13 px mono · code blocks, chips, mono cells"],
  ["type-code-xs", "Ctrl  !help", "12 px mono · Kbd keys, small command chips"],
  ["type-metric", "403", "28 → 32 px · Mona Sans 620 · tabular (StatCard)"],
  ["type-metric-lg", "11 modules", "36 → 48 px · Mona Sans 640 · tabular (hero stats)"],
] as const;

const radii = [
  ["xs", "rounded-xs", "4"],
  ["sm", "rounded-sm", "6"],
  ["md", "rounded-md", "8"],
  ["lg", "rounded-lg", "10 · controls"],
  ["xl", "rounded-xl", "14 · cards"],
  ["2xl", "rounded-2xl", "18 · panels"],
  ["3xl", "rounded-3xl", "24 · hero frames"],
  ["full", "rounded-full", "pills"],
] as const;

const shadows = [
  ["shadow-xs", "xs"],
  ["shadow-sm", "sm"],
  ["shadow-md", "md"],
  ["shadow-lg", "lg"],
  ["shadow-xl", "xl"],
  ["shadow-glow", "glow (CTA hover)"],
] as const;

const zScale = [
  ["z-raised", "10"],
  ["z-sticky", "20"],
  ["z-header", "40"],
  ["z-savebar", "45"],
  ["z-overlay", "50"],
  ["z-modal", "60"],
  ["z-popover", "70"],
  ["z-toast", "80"],
  ["z-tooltip", "90"],
  ["z-skip", "100"],
] as const;

export default async function DesignSystemPage() {
  // Dev-only review page — never shipped.
  if (process.env.NODE_ENV === "production") notFound();

  const facts = await getCommandFacts();

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-header border-b border-line-subtle bg-canvas/85 backdrop-blur-md">
        <Container size="wide" className="flex h-header items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" />
            <Badge tone="brand" size="sm" className="max-sm:hidden">
              Design system
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="warning" size="sm" dot>
              Dev only
            </Badge>
            <Button href="/" variant="ghost" size="sm" className="max-sm:px-2">
              Back to site
            </Button>
          </div>
        </Container>
      </header>

      <Container size="wide" className="grid grid-cols-[minmax(0,1fr)] gap-10 py-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
        <DsNav sections={SECTIONS} />

        <main id="main" className="flex min-w-0 flex-col gap-20">
          <PageHeader
            eyebrow="Foundation"
            title="Pleed design system"
            description="Every token and component, in every state. Dark-first, AA contrast, keyboard and touch ready. Import paths and rules live in DESIGN.md."
            meta={<Badge tone="neutral">v1</Badge>}
          />

          {/* ------------------------------------------------------------ */}
          <DsSection id="colour" title="Colour" description="Cool-tinted surfaces, hairlines, text tiers, one brand hue, semantic states.">
            <DsBlock title="Surfaces (ascending elevation)">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {surfaces.map(([name, cls, use]) => (
                  <Swatch key={name} className={cls} name={name} note={use} bordered />
                ))}
              </div>
            </DsBlock>
            <DsBlock title="Hairlines">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {[
                  ["line-subtle", "border-line-subtle", "6% · dividers in lists"],
                  ["line", "border-line", "9% · default borders"],
                  ["line-strong", "border-line-strong", "15% · buttons, raised"],
                  ["line-hover", "border-line-hover", "24% · hover, selected pill ring"],
                  ["line-control", "border-line-control", "40% · every form control ≥3:1"],
                  ["line-control-hover", "border-line-control-hover", "55% · control hover"],
                ].map(([name, cls, note]) => (
                  <div key={name} className={`rounded-lg border bg-surface-1 p-4 ${cls}`}>
                    <p className="type-code-xs text-fg">{name}</p>
                    <p className="type-caption text-fg-tertiary">{note}</p>
                  </div>
                ))}
              </div>
            </DsBlock>
            <DsBlock title="Interaction overlays (white alpha — read on every surface)">
              <div className="grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["bg-surface-1", "surface-1"],
                    ["bg-surface-2", "surface-2 (menus)"],
                    ["bg-surface-3", "surface-3 (save bar)"],
                  ] as const
                ).map(([surface, name]) => (
                  <div key={surface} className={`flex flex-col gap-1 rounded-xl border border-line p-2 ${surface}`}>
                    <p className="px-2 pt-1 type-code-xs text-fg-tertiary">{name}</p>
                    {(
                      [
                        ["", "rest"],
                        ["bg-hover", "bg-hover · 6%"],
                        ["bg-selected", "bg-selected · 9% (active nav, highlighted item)"],
                        ["bg-pressed", "bg-pressed · 10%"],
                      ] as const
                    ).map(([cls, label]) => (
                      <div key={label} className={`rounded-md px-2.5 py-2 text-sm text-fg-secondary ${cls}`}>
                        {label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-line bg-surface-1 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-1.5 w-32 rounded-full bg-track">
                    <div className="h-full w-1/2 rounded-full bg-brand-400" />
                  </div>
                  <p className="type-code-xs text-fg-tertiary">bg-track rail · brand-400 fill 3.3:1 vs rail</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-5 rounded-full border-2 border-brand-400 bg-thumb shadow-thumb" />
                  <p className="type-code-xs text-fg-tertiary">bg-thumb · shadow-thumb (18.7:1)</p>
                </div>
              </div>
            </DsBlock>
            <DsBlock title="Text (contrast measured on every surface)">
              <div className="divide-y divide-line-subtle rounded-xl border border-line bg-surface-1">
                {textTiers.map(([name, cls, ratio, use]) => (
                  <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5">
                    <p className={`${cls} type-body font-medium`}>The quick brown fox — {use}</p>
                    <p className="type-code-xs text-fg-tertiary">
                      {name} · {ratio}
                    </p>
                  </div>
                ))}
              </div>
            </DsBlock>
            <DsBlock title="Brand scale (violet → indigo, hue 283)">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
                {brandScale.map((step) => (
                  <div key={step} className="flex flex-col gap-1.5">
                    <div className={`h-14 rounded-lg ${brandBg[step]} ${step === "600" ? "ring-2 ring-fg/60 ring-offset-2 ring-offset-canvas" : ""}`} />
                    <p className="type-code-xs text-fg-tertiary">
                      {step}
                      {step === "600" ? " ★" : ""}
                    </p>
                  </div>
                ))}
              </div>
              <p className="type-caption text-fg-tertiary">
                ★ brand-600 is the solid primary (white text 5.3:1). Text on dark uses brand-fg (brand-300, 8–10:1). Tints: bg-brand-subtle + border-brand-border.
              </p>
            </DsBlock>
            <DsBlock title="Semantic">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {semantic.map((s) => (
                  <div key={s.name} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-1 p-4">
                    <p className={`font-mono text-sm font-medium ${s.fg}`}>{s.name}-fg</p>
                    <div className={`rounded-md border px-3 py-2 text-sm ${s.subtle} ${s.fg}`}>{s.name}-subtle + border</div>
                    <div className={`rounded-md px-3 py-2 text-sm font-medium ${s.strong}`}>{s.name}-strong</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-discord px-3 py-2 text-sm font-medium text-discord-fg">
                  <DiscordIcon className="size-4" /> discord #5865F2
                </div>
                <p className="type-caption text-fg-tertiary">Blurple is reserved for Discord-specific actions (invite, log in).</p>
              </div>
            </DsBlock>
          </DsSection>

          {/* ------------------------------------------------------------ */}
          <DsSection id="type" title="Typography" description="Mona Sans (display, expanded width) · Geist (UI) · Geist Mono (code). Fluid clamp() sizes — resize the window.">
            <div className="flex flex-col divide-y divide-line-subtle rounded-xl border border-line bg-surface-1">
              {typeStyles.map(([cls, sample, spec]) => (
                <div key={cls} className="flex flex-col gap-2 px-5 py-5 md:px-6">
                  <p className="type-code-xs text-brand-fg">
                    .{cls} <span className="text-fg-tertiary">— {spec}</span>
                  </p>
                  <p className={`${cls} ${cls === "type-eyebrow" ? "text-brand-fg" : "text-fg"}`}>{sample}</p>
                </div>
              ))}
            </div>
            <DsBlock title="Families & numerals">
              <div className="grid gap-3 md:grid-cols-3">
                <Card padding="sm">
                  <p className="type-eyebrow text-fg-tertiary">font-display · Mona Sans</p>
                  <p className="mt-2 type-h2 text-fg">Aa Pleed 403</p>
                </Card>
                <Card padding="sm">
                  <p className="type-eyebrow text-fg-tertiary">font-sans · Geist</p>
                  <p className="mt-2 type-h4 text-fg">Aa Pleed 403</p>
                </Card>
                <Card padding="sm">
                  <p className="type-eyebrow text-fg-tertiary">font-mono · Geist Mono</p>
                  <p className="mt-2 type-lead text-fg">
                    <code className="type-code">!antinuke 403</code>
                  </p>
                </Card>
              </div>
              <p className="type-small text-fg-secondary">
                Highlight one phrase at most: <GradientText>restrained gradient text</GradientText>. Use{" "}
                <code className="rounded-sm bg-surface-3 px-1 type-code">tabular-nums</code> for changing numbers.
              </p>
            </DsBlock>
          </DsSection>

          {/* ------------------------------------------------------------ */}
          <DsSection id="layout" title="Layout & elevation" description="Containers, fluid spacing, radii, shadows, z-index and motion tokens.">
            <DsBlock title="Containers & spacing">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["container-content", "1216 px", "Marketing pages"],
                  ["container-wide", "1440 px", "Dashboard, wide grids"],
                  ["container-narrow", "768 px", "Legal, forms"],
                  ["max-w-measure", "68ch", "Prose line length"],
                  ["px-gutter", "16 → 40 px", "Page gutters (fluid)"],
                  ["py-section", "64 → 128 px", "Section rhythm"],
                  ["py-section-sm", "48 → 80 px", "Compact sections"],
                  ["h-header", "64 px", "Sticky header (in flow)"],
                  ["py-page", "24 → 40 px", "Dashboard page top/bottom"],
                  ["w-sidebar", "240 px", "Dashboard sidebar"],
                  ["w-sidebar-rail", "64 px", "Collapsed icon rail"],
                  ["w-setting-control", "256 px", "Inline SettingRow text/ID/select (set by SettingRow)"],
                  ["gap-4 lg:gap-6", "16 → 24 px", "Card grids"],
                ].map(([token, value, use]) => (
                  <div key={token} className="rounded-lg border border-line bg-surface-1 p-4">
                    <p className="type-code-xs text-brand-fg">{token}</p>
                    <p className="mt-1 text-sm font-medium text-fg">{value}</p>
                    <p className="type-caption text-fg-tertiary">{use}</p>
                  </div>
                ))}
              </div>
            </DsBlock>
            <DsBlock title="Radii">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
                {radii.map(([name, cls, px]) => (
                  <div key={name} className="flex flex-col gap-2">
                    <div className={`h-16 border border-line-strong bg-surface-2 ${cls}`} />
                    <p className="type-code-xs text-fg-tertiary">
                      {name} · {px}
                    </p>
                  </div>
                ))}
              </div>
            </DsBlock>
            <DsBlock title="Elevation">
              <div className="grid grid-cols-2 gap-5 rounded-xl bg-canvas p-2 sm:grid-cols-3 xl:grid-cols-6">
                {shadows.map(([cls, name]) => (
                  <div key={cls} className={`flex h-24 items-end rounded-xl border border-line bg-surface-2 p-3 ${cls}`}>
                    <p className="type-code-xs text-fg-tertiary">{name}</p>
                  </div>
                ))}
              </div>
            </DsBlock>
            <DsBlock title="Section (eyebrow · title · description · actions)">
              <div className="overflow-hidden rounded-xl border border-line">
                <Section
                  id="ds-section-demo"
                  eyebrow="How it works"
                  title="Three steps to a safer server"
                  titleAs="h3"
                  description="Invite Pleed, run the setup wizard, then fine-tune everything from the dashboard."
                  spacing="compact"
                  tone="raised"
                  container={false}
                  className="px-6"
                  actions={
                    <Button variant="secondary" href="/docs">
                      Read the docs
                    </Button>
                  }
                />
              </div>
            </DsBlock>
            <DsBlock title="Adjacent sections share one gap (not two paddings)">
              <div className="overflow-hidden rounded-xl border border-line bg-canvas">
                <Section spacing="compact" container={false} className="px-6" eyebrow="Section A" title="First section" titleAs="h3">
                  <div className="h-12 rounded-lg border border-dashed border-line-strong" />
                </Section>
                <Section spacing="compact" container={false} className="px-6" eyebrow="Section B" title="Second section" titleAs="h3">
                  <div className="h-12 rounded-lg border border-dashed border-line-strong" />
                </Section>
              </div>
              <p className="type-caption text-fg-tertiary">
                A&apos;s bottom padding collapses, so the space between A&apos;s content and B&apos;s eyebrow is one
                py-section-sm. Raised sections keep both paddings.
              </p>
            </DsBlock>
            <DsBlock title="Z-index & motion">
              <div className="grid gap-3 md:grid-cols-2">
                <Card padding="sm">
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 type-code-xs">
                    {zScale.map(([cls, z]) => (
                      <li key={cls} className="flex justify-between text-fg-secondary">
                        <span>{cls}</span>
                        <span className="text-fg-tertiary">{z}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card padding="sm">
                  <ul className="flex flex-col gap-1.5 type-code-xs text-fg-secondary">
                    <li>duration-150 · fast — hovers, toggles</li>
                    <li>duration-200 · base — controls, popovers</li>
                    <li>duration-300 · slow — sheets, accordions</li>
                    <li>duration-500 · slower — large surfaces</li>
                    <li>600 ms · reveals (Reveal/Stagger, fadeRise only)</li>
                    <li>ease-standard · cubic-bezier(.2,0,0,1)</li>
                    <li>ease-out-expo · cubic-bezier(.16,1,.3,1)</li>
                  </ul>
                </Card>
              </div>
            </DsBlock>
          </DsSection>

          {/* ------------------------------------------------------------ */}
          <DsSection id="brand" title="Brand" description="Logo lockups, mark sizes, icon tiles, Discord glyph.">
            <DsBlock title="Logo">
              <div className="flex flex-wrap items-end gap-8 rounded-xl border border-line bg-surface-1 p-6">
                <Logo size="xl" />
                <Logo size="lg" />
                <Logo size="md" />
                <Logo size="sm" />
                <Logo size="xs" />
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface-1 p-6">
                <LogoMark size="xl" title="Pleed" />
                <LogoMark size="lg" />
                <LogoMark size="md" />
                <LogoMark size="sm" />
                <LogoMark size="xs" />
                <Separator orientation="vertical" className="mx-2 h-10" />
                <Logo size="md" href="/" />
                <span className="type-caption text-fg-tertiary">← as home link (Tab to see focus)</span>
              </div>
            </DsBlock>
            <DsBlock title="IconTile">
              <div className="flex flex-wrap items-center gap-3">
                <IconTile icon={ShieldCheck} tone="brand" size="lg" />
                <IconTile icon={UserCheck} tone="brand" />
                <IconTile icon={Bot} tone="brand" size="sm" />
                <IconTile icon={Settings2} tone="neutral" />
                <IconTile icon={ShieldCheck} tone="success" />
                <IconTile icon={Zap} tone="warning" />
                <IconTile icon={Trash2} tone="danger" />
                <IconTile icon={Sparkles} tone="info" />
              </div>
            </DsBlock>
          </DsSection>

          {/* ------------------------------------------------------------ */}
          <DsSection id="buttons" title="Buttons" description="Hover, press and Tab through them. Touch screens get ≥44 px targets.">
            <DsBlock title="Variants">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete</Button>
                <Button variant="destructive-ghost">
                  <Trash2 /> Remove
                </Button>
                <Button variant="discord" href={INVITE_URL}>
                  <DiscordIcon /> Add to Discord
                </Button>
                <Button variant="link" href="/commands">
                  Link button
                </Button>
              </div>
            </DsBlock>
            <DsBlock title="Sizes & icons">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">
                  Large <ArrowRight />
                </Button>
                <Button size="lg" variant="secondary">
                  <LayoutDashboard /> Open dashboard
                </Button>
                <IconButton label="Add item" size="icon-sm" variant="secondary">
                  <Plus />
                </IconButton>
                <IconButton label="Settings" variant="secondary">
                  <Settings2 />
                </IconButton>
                <IconButton label="Open support server" size="icon-lg" variant="outline" href={SUPPORT_URL}>
                  <ExternalLink />
                </IconButton>
                <IconButton label="Delete" variant="destructive-ghost">
                  <Trash2 />
                </IconButton>
              </div>
            </DsBlock>
            <DsBlock title="States">
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Saving</Button>
                <Button variant="secondary" loading>
                  Loading
                </Button>
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
                <Button variant="discord" disabled>
                  <DiscordIcon /> Disabled
                </Button>
                <div className="w-full max-w-xs">
                  <Button fullWidth>Full width</Button>
                </div>
              </div>
            </DsBlock>
          </DsSection>

          {/* ------------------------------------------------------------ */}
          <DsSection id="badges" title="Badges, pills & keys">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge>Neutral</Badge>
              <Badge tone="brand">Brand</Badge>
              <Badge tone="success" dot>
                Enabled
              </Badge>
              <Badge tone="warning" dot>
                Degraded
              </Badge>
              <Badge tone="danger" dot>
                Disabled
              </Badge>
              <Badge tone="info">Info</Badge>
              <Badge tone="outline">Outline</Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="lg" tone="brand">
                <ShieldCheck /> Large
              </Badge>
              <PlaceholderBadge />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Pill leading={<Badge tone="brand" size="sm" className="rounded-full">New</Badge>} href="/docs">
                Join gates now support account-age rules
              </Pill>
              <Pill>Static pill</Pill>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-fg-secondary">
              <span className="inline-flex items-center gap-2">
                <StatusDot tone="success" pulse /> Operational (pulse)
              </span>
              <span className="inline-flex items-center gap-2">
                <StatusDot tone="warning" /> Degraded
              </span>
              <span className="inline-flex items-center gap-2">
                <StatusDot tone="danger" /> Outage
              </span>
              <span className="inline-flex items-center gap-2">
                <StatusDot tone="neutral" /> Unknown
              </span>
              <span className="inline-flex items-center gap-2">
                Press <Kbd>/</Kbd> to search · <KbdGroup keys={["Ctrl", "K"]} /> · <Kbd>Esc</Kbd>
              </span>
            </div>
          </DsSection>

          {/* ------------------------------------------------------------ */}
          <DsSection id="cards" title="Cards" description="Static cards never lift on hover; only linked cards are interactive.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Default card</CardTitle>
                  <CardDescription>surface-1, hairline border, top light catch.</CardDescription>
                </CardHeader>
              </Card>
              <Card variant="raised">
                <CardHeader>
                  <CardTitle>Raised card</CardTitle>
                  <CardDescription>One level up for emphasis inside a section.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button size="sm" variant="secondary">
                    Action
                  </Button>
                </CardFooter>
              </Card>
              <Card href="/commands">
                <CardHeader>
                  <CardTitle>Interactive card</CardTitle>
                  <CardDescription>Whole card is a link — hover, press, focus.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-1.5 text-sm font-medium text-brand-fg">
                  Browse commands <ArrowRight className="size-4" />
                </CardContent>
              </Card>
              <Card variant="inset">
                <CardTitle as="p">Inset well</CardTitle>
                <CardDescription>For previews and code inside cards.</CardDescription>
              </Card>
              <Card variant="outline">
                <CardTitle as="p">Outline</CardTitle>
                <CardDescription>Border only.</CardDescription>
              </Card>
              <Card variant="brand">
                <CardTitle as="p">Brand tint</CardTitle>
                <CardDescription>One highlighted item per group.</CardDescription>
              </Card>
            </div>
            <DsBlock title="FeatureCard — the one feature-card pattern (grid gap-4 lg:gap-6)">
              <div className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                <FeatureCard
                  icon={ShieldCheck}
                  title="Anti-nuke"
                  description="Stops mass bans, kicks and channel deletes the moment a threshold is crossed."
                />
                <FeatureCard
                  icon={UserCheck}
                  title="Join gates"
                  description="Hold new accounts until they verify, by account age or a button."
                  href="/design-system#cards"
                />
                <FeatureCard
                  icon={MessageSquareReply}
                  title="Auto-responders"
                  description="Answer common questions automatically with a trigger and a reply."
                  variant="raised"
                />
              </div>
            </DsBlock>
          </DsSection>

          <DsSection id="forms" title="Form controls" description="All labelled through Field; 16 px text + 44 px height on touch screens.">
            <FormDemos />
          </DsSection>

          <DsSection id="navigation" title="Navigation" description="Tabs, segmented control, breadcrumbs, accordion, menus and tooltips.">
            <NavigationDemos />
            <DsBlock title="Breadcrumbs">
              <Breadcrumbs
                items={[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "My Server", href: "/dashboard" },
                  { label: "Security", href: "/dashboard/security" },
                  { label: "Anti-nuke" },
                ]}
              />
            </DsBlock>
          </DsSection>

          <DsSection id="overlays" title="Overlays & toasts" description="Focus-trapped, Escape to close, scroll locked, focus returns to the trigger.">
            <OverlayDemos />
          </DsSection>

          <DsSection id="feedback" title="Feedback states" description="Loading, empty and error states — an error must never look like empty or real data.">
            <DsBlock title="Spinner & skeleton">
              <div className="flex flex-wrap items-center gap-6">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" className="text-brand-fg" />
                <Spinner size="lg" label="Loading example" />
              </div>
              <LoadingRegion label="Loading servers" className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-line bg-surface-1 p-5">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </LoadingRegion>
              <SkeletonText lines={3} className="max-w-md" />
            </DsBlock>
            <div className="grid gap-4 lg:grid-cols-2">
              <EmptyState
                icon={Bot}
                title="No auto-responders yet"
                description="Reply automatically when someone says a trigger word — e.g. answer “how do I verify?” with your rules channel."
                actions={
                  <Button size="sm">
                    <Plus /> Add responder
                  </Button>
                }
              />
              <StateDemos />
            </div>
            <ErrorState variant="inline" title="Couldn't save join gate settings" description="Your changes are still here — nothing was lost." />
          </DsSection>

          <DsSection id="data" title="Data display" description="Stat cards (with honest placeholders), responsive table → cards, page header.">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Public commands" value={facts.uniqueCommands} hint="Unique names, derived from commands.json" icon={Zap} />
              <StatCard label="Modules" value={facts.categories} hint="Command categories" icon={LayoutDashboard} />
              {/* PLACEHOLDER: replace with real data */}
              <StatCard label="Servers" value={SITE_STATS.servers} placeholder hint="Live count not connected" />
              <StatCard label="Messages today" value={null} loading hint="loading" />
            </div>
            <ListDemos />
          </DsSection>

          <DsSection id="code" title="Code & commands">
            <CodeDemos />
          </DsSection>

          <DsSection id="prose" title="Prose" description="Legal and docs typography (68ch measure).">
            <Card padding="lg">
              <Prose>
                <h2 id="ds-information">Information we collect</h2>
                <p>
                  Pleed stores only what it needs to work: <strong>user IDs</strong> for settings, permissions and economy
                  balances, and <strong>server IDs</strong> for configuration such as anti-nuke rules and prefixes. See the{" "}
                  <a href="/terms">Terms of Service</a>.
                </p>
                <p>
                  Using Pleed never replaces your obligations under Discord&apos;s own{" "}
                  <TextLink href={DISCORD_GUIDELINES_URL}>Discord Community Guidelines and Terms of Service</TextLink>, which
                  apply in every server it moderates. Questions? Ask in the{" "}
                  <TextLink href={SUPPORT_URL}>support server</TextLink>.
                </p>
                <h3>Command input</h3>
                <p>
                  Commands like <code>!antinuke enable</code> are processed in real time and are not logged beyond what
                  moderation features require.
                </p>
                <ul>
                  <li>Data is never sold, traded or shared.</li>
                  <li>
                    Remove the bot to clear server data.
                    <ul>
                      <li>Request user-data deletion in the support server.</li>
                    </ul>
                  </li>
                </ul>
                <ol>
                  <li>Invite Pleed.</li>
                  <li>
                    Run <code>!setup</code>.
                  </li>
                </ol>
                <blockquote>Role hierarchy matters: Pleed can only act on roles below its own.</blockquote>
                <CodeBlock code="!antinuke ban on --threshold 3 --do ban" prompt="›" />
                <hr />
                {/* Bare <table>: words stay whole ("identify"), links may break. */}
                <table>
                  <thead>
                    <tr>
                      <th>Scope</th>
                      <th>Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>identify</td>
                      <td>Show your name and avatar in the dashboard.</td>
                    </tr>
                    <tr>
                      <td>guilds</td>
                      <td>List the servers you can manage.</td>
                    </tr>
                  </tbody>
                </table>
                <h3>Permissions by command</h3>
                <ProseTable label="Permissions by command">
                  <thead>
                    <tr>
                      <th>Command</th>
                      <th>Needs</th>
                      <th>What it does</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code>!antinuke enable</code>
                      </td>
                      <td>Administrator</td>
                      <td>Turns on anti-nuke with the default thresholds.</td>
                    </tr>
                    <tr>
                      <td>
                        <code>!joingate age 7</code>
                      </td>
                      <td>Manage Server</td>
                      <td>Holds accounts younger than seven days at the gate.</td>
                    </tr>
                    <tr>
                      <td>
                        <code>!log set 1201234567890123456</code>
                      </td>
                      <td>Manage Channels</td>
                      <td>
                        Sends logs to a channel ID. Full reference:{" "}
                        <TextLink href="https://discord.com/developers/docs/topics/permissions">
                          https://discord.com/developers/docs/topics/permissions
                        </TextLink>
                      </td>
                    </tr>
                  </tbody>
                </ProseTable>
              </Prose>
            </Card>
            <p className="type-small text-fg-secondary">
              Inline links are always underlined: <TextLink href="/privacy">internal link</TextLink> ·{" "}
              <TextLink href={SUPPORT_URL}>support server</TextLink> ·{" "}
              <TextLink href="/terms" tone="subtle">
                subtle link
              </TextLink>
              . Standalone link lists (footer columns) may use{" "}
              <TextLink href="/terms" tone="subtle" underline="hover">
                underline=&quot;hover&quot;
              </TextLink>
              .
            </p>
          </DsSection>

          <DsSection id="motion" title="Motion" description="Reveal/Stagger only animate content below the fold; SSR HTML is fully visible. Scroll down to the cards below.">
            <Stagger className="grid gap-4 md:grid-cols-3">
              {["Detect", "Threshold", "Respond"].map((step, i) => (
                <Card key={step}>
                  <p className="type-eyebrow text-brand-fg">Step {i + 1}</p>
                  <CardTitle className="mt-2">{step}</CardTitle>
                  <CardDescription>Staggered 60 ms apart, transform + opacity only.</CardDescription>
                </Card>
              ))}
            </Stagger>
            <Reveal className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="type-h3">
                Revealed with <GradientText>&lt;Reveal&gt;</GradientText>
              </p>
            </Reveal>
          </DsSection>

          {/* Last on the page, exactly like a dashboard settings page: nothing follows the SaveBar, so when it
              hides after a save its reserved space closes without moving any content. */}
          <DsSection
            id="settings"
            title="Settings & save bar"
            description="Change anything — the sticky save bar appears (Ctrl/⌘+S saves), keyboard focus never hides under it, and following a link to another page asks first. The module switch disables its fieldset."
          >
            <SettingsDemo />
          </DsSection>
        </main>
      </Container>
    </div>
  );
}
