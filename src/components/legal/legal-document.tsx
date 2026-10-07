import { ArrowRight, CalendarClock, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PlaceholderBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { BackToTopLink, CopySectionLink, PrintButton } from "@/components/legal/legal-actions";
import { LegalTocDisclosure, LegalTocNav, type TocItem } from "@/components/legal/legal-toc";

export type LegalSubsection = { id: string; title: string };

export type LegalSection = {
  /** Anchor id (`/privacy#data-removal`). Keep stable — people share these links. */
  id: string;
  title: string;
  /** h3 headings inside `content` that should appear in the table of contents (their `id`s must match). */
  subsections?: LegalSubsection[];
  /** Body copy: plain HTML (p, ul, h3…) styled by Prose, plus kit components (ProseTable, Callout). */
  content: ReactNode;
};

export type LegalHighlight = { icon: LucideIcon; text: ReactNode };

export type LegalDocumentProps = {
  title: string;
  /** One-sentence summary under the title. */
  description: string;
  /** "At a glance" points — a plain-language summary of the sections, never new terms. */
  highlights: LegalHighlight[];
  /** Short note under the highlights, e.g. that the full text below applies. */
  highlightsNote: string;
  sections: LegalSection[];
  /** The other legal document, linked from the sidebar and the end of the page. */
  related: { href: string; title: string; description: string };
};

const SUMMARY_ID = "at-a-glance";

/*
 * Prose on paper: the brand dots of bulleted lists are backgrounds (not
 * printed by default), so lists fall back to disc markers; external links
 * print their address after the text.
 */
const PRINT_PROSE = cn(
  "print:max-w-none",
  "print:[&_ul]:list-disc print:[&_ul>li]:before:hidden",
  "print:[&_a[href^='http']]:after:content-['_('_attr(href)_')'] print:[&_a[href^='http']]:after:text-fg-tertiary",
);

/*
 * Print. Paper is white and browsers drop backgrounds by default, so the
 * light-on-dark text and hairline tokens are remapped to dark ones for this
 * subtree, and the interactive chrome (TOCs, buttons) is hidden by the
 * components themselves. Interim, scoped to the legal pages: the site-wide
 * print rules (header/footer, page background) are requested from
 * design-system / site-chrome.
 */
const PRINT_TOKENS = cn(
  "print:[--color-fg:var(--color-inset)]",
  "print:[--color-fg-secondary:var(--color-canvas)]",
  "print:[--color-fg-tertiary:var(--color-surface-4)]",
  "print:[--color-brand-fg:var(--color-brand-800)]",
  "print:[--color-brand-400:var(--color-brand-700)]",
  "print:[--color-line:var(--color-fg-disabled)]",
  "print:[--color-line-strong:var(--color-surface-4)]",
  "print:[--color-line-subtle:var(--color-fg-disabled)]",
);

/**
 * Shared layout for /privacy and /terms (Server Component).
 *
 * - Header: eyebrow, the page h1 (via Section), a one-line summary, the
 *   "Last updated" date (a visible placeholder until the owner sets it) and
 *   Print.
 * - ≥ 1024 px: the document beside a sticky "On this page" with scroll-spy,
 *   "Back to top" and a link to the other legal document.
 * - < 1024 px: a collapsible "On this page" above the document.
 * - Every section heading has a copy-link button; sections are anchor
 *   targets (offset by the global scroll-padding, nothing else).
 * - Print: one column, dark text on white, no navigation or buttons.
 */
export function LegalDocument({ title, description, highlights, highlightsNote, sections, related }: LegalDocumentProps) {
  const toc: TocItem[] = [
    { id: SUMMARY_ID, label: "At a glance", level: 2 },
    ...sections.flatMap((section, index) => [
      { id: section.id, label: section.title, number: String(index + 1), level: 2 as const },
      ...(section.subsections ?? []).map((sub) => ({ id: sub.id, label: sub.title, level: 3 as const })),
    ]),
  ];

  return (
    <div className={PRINT_TOKENS}>
      <Section
        titleAs="h1"
        eyebrow="Legal"
        title={title}
        description={description}
        headerClassName="print:mb-8"
        actions={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <p className="flex items-center gap-2 type-small text-fg-tertiary">
              <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
              Last updated
              {/* PLACEHOLDER: owner to set the date this version takes effect (e.g. "7 October 2026"). */}
              <PlaceholderBadge title="Placeholder — the owner sets this date before launch" />
            </p>
            <PrintButton />
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-16 print:block">
          {/* First in the DOM, so keyboard and screen-reader users reach "On this page" before the
              document (as on phones, where the disclosure sits above it); shown in the right column. */}
          <aside aria-label="Page navigation" className="hidden lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:col-start-2 lg:row-start-1 lg:block lg:self-start print:hidden">
            <LegalTocNav items={toc} />
            <div className="mt-6 flex flex-col gap-1 border-t border-line-subtle pt-4">
              <BackToTopLink className="-ml-3 self-start text-fg-tertiary" />
              <Link
                href={related.href}
                className="group/rel -ml-3 inline-flex min-h-8 items-center gap-2 self-start rounded-md px-3 type-label text-fg-tertiary transition-colors duration-150 ease-standard hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring pointer-coarse:min-h-11"
              >
                {related.title}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 ease-standard group-hover/rel:translate-x-0.5"
                />
              </Link>
            </div>
          </aside>

          <div className="flex min-w-0 max-w-measure flex-col gap-8 md:gap-10 lg:col-start-1 lg:row-start-1">
            <LegalTocDisclosure items={toc} className="lg:hidden print:hidden" />

            <Card as="section" id={SUMMARY_ID} aria-labelledby={`${SUMMARY_ID}-title`} className="print:break-inside-avoid">
              <div className="flex flex-col gap-1">
                <h2 id={`${SUMMARY_ID}-title`} className="type-h4 text-fg">
                  At a glance
                </h2>
                <p className="type-caption text-fg-tertiary">{highlightsNote}</p>
              </div>
              <ul className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex gap-3">
                    <IconTile icon={highlight.icon} size="sm" className="print:hidden" />
                    <p className="type-small text-fg-secondary [&_strong]:font-medium [&_strong]:text-fg">
                      {highlight.text}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex flex-col gap-12 md:gap-16">
              {sections.map((section, index) => (
                <LegalSectionBlock key={section.id} section={section} number={index + 1} />
              ))}
            </div>

            <footer className="flex flex-col gap-6 border-t border-line pt-8 print:hidden">
              <Card href={related.href} padding="md" className="group/related">
                <p className="type-eyebrow text-fg-tertiary">Also read</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="type-h4 text-fg">{related.title}</p>
                    <p className="type-small text-fg-secondary">{related.description}</p>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-fg-tertiary transition-transform duration-200 ease-standard group-hover/related:translate-x-0.5 group-hover/related:text-fg"
                  />
                </div>
              </Card>
              <BackToTopLink variant="outline" className="self-start lg:hidden" />
            </footer>
          </div>
        </div>
      </Section>
    </div>
  );
}

function LegalSectionBlock({ section, number }: { section: LegalSection; number: number }) {
  const titleId = `${section.id}-title`;
  return (
    <section id={section.id} aria-labelledby={titleId} className="flex flex-col gap-4">
      {/*
        type-h3 on the row, so `1lh` is the heading's line height at every
        width: the number chip and the copy button centre on the FIRST line
        of the heading, however it wraps. The heading is inline so the button
        follows its last word instead of jumping to the row's far edge.
      */}
      <div className="group/heading flex items-start gap-3 type-h3 text-fg print:break-after-avoid">
        <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center">
          <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-md border border-line-strong bg-surface-2 px-1.5 type-code-xs text-fg-secondary tabular-nums">
            {String(number).padStart(2, "0")}
          </span>
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="inline">
            <span className="sr-only">{number}. </span>
            {section.title}
          </h2>
          <span className="ml-1 inline-flex h-[1lh] items-center align-top">
            <CopySectionLink id={section.id} title={section.title} />
          </span>
        </div>
      </div>
      <Prose className={PRINT_PROSE}>{section.content}</Prose>
    </section>
  );
}
