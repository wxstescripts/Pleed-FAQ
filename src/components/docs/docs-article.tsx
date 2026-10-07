import { ChevronDown, LifeBuoy, SquareTerminal } from "lucide-react";
import { Fragment } from "react";

import { SUPPORT_URL } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Pill } from "@/components/ui/badge";
import { Prose } from "@/components/ui/prose";
import { SectionHeader } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { COMMAND_REFERENCE_ID, countReferenceCommands, getDocsHeadings } from "@/content/docs/content";
import { DOCS_HOME } from "@/content/docs/index";
import type { DocsHeading as DocsHeadingEntry, DocsPage } from "@/content/docs/types";
import { CommandReference } from "@/components/docs/command-reference";
import { DocsBlocks } from "@/components/docs/docs-blocks";
import { DocsHeading } from "@/components/docs/docs-heading";
import { DocsPager } from "@/components/docs/docs-pager";
import { DocsToc } from "@/components/docs/docs-toc";
import { InlineText } from "@/components/docs/inline-text";

/** "On this page" for < 1280 (no side column): a native disclosure at the top of the article — no JS. */
function InlineToc({ headings }: { headings: DocsHeadingEntry[] }) {
  return (
    <details className="group/toc rounded-xl border border-line bg-surface-1 xl:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 type-label text-fg-secondary transition-colors duration-150 select-none hover:bg-hover hover:text-fg focus-visible:focus-ring [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-fg-tertiary transition-transform duration-200 group-open/toc:rotate-180"
        />
      </summary>
      <ul className="border-t border-line-subtle px-2 py-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={
                heading.level === 3
                  ? "flex min-h-10 items-center rounded-md py-1.5 pr-2 pl-6 type-small text-fg-tertiary transition-colors duration-150 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring-inset pointer-coarse:min-h-11"
                  : "flex min-h-10 items-center rounded-md px-2 py-1.5 type-small text-fg-secondary transition-colors duration-150 hover:bg-hover hover:text-fg active:bg-pressed focus-visible:focus-ring-inset pointer-coarse:min-h-11"
              }
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * One docs page: breadcrumbs, the page h1 (type-h1, like every marketing
 * page), the guide, the command reference, help and the pager — plus the
 * sticky "On this page" column from 1280. Server Component; the only client
 * islands are the TOC scroll-spy and the copy buttons.
 */
export function DocsArticle({ page }: { page: DocsPage }) {
  const headings = getDocsHeadings(page);
  const commandCount = countReferenceCommands(page);

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,48rem)_13rem] xl:justify-between xl:gap-12">
      <article aria-labelledby="docs-page-title" className="mx-auto w-full max-w-3xl min-w-0 lg:mx-0">
        <Breadcrumbs items={[{ label: "Docs", href: DOCS_HOME.href }, { label: page.title }]} />
        <SectionHeader
          className="mt-5"
          eyebrow={page.section}
          title={page.title}
          titleId="docs-page-title"
          titleAs="h1"
          description={<InlineText text={page.lead} />}
        />
        {commandCount > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Pill href={`#${COMMAND_REFERENCE_ID}`} leading={<SquareTerminal aria-hidden="true" className="ml-1.5 size-3.5 text-brand-fg" />}>
              {commandCount} commands documented
            </Pill>
          </div>
        ) : null}

        <div className="mt-8 md:mt-10">
          <InlineToc headings={headings} />
        </div>

        <Prose className="mt-10 max-w-none md:mt-12">
          {page.sections.map((section) => (
            <Fragment key={section.id}>
              <DocsHeading as="h2" id={section.id} title={section.title} />
              <DocsBlocks blocks={section.blocks} />
              {section.subsections?.map((sub) => (
                <Fragment key={sub.id}>
                  <DocsHeading as="h3" id={sub.id} title={sub.title} />
                  <DocsBlocks blocks={sub.blocks} />
                </Fragment>
              ))}
            </Fragment>
          ))}
          <CommandReference page={page} />
        </Prose>

        <Callout
          tone="neutral"
          icon={LifeBuoy}
          title="Stuck on something?"
          className="mt-14"
          actions={
            <Button variant="secondary" size="sm" href={SUPPORT_URL}>
              Ask in the support server
            </Button>
          }
        >
          <p>
            Ask the Pleed team and community in the support server — or browse every public command in the{" "}
            <TextLink href="/commands">command explorer</TextLink>.
          </p>
        </Callout>

        <DocsPager slug={page.slug} className="mt-8" />
      </article>

      <div className="hidden xl:block">
        <div className="sticky top-[calc(var(--spacing-header)+2.5rem)] flex max-h-[calc(100dvh-var(--spacing-header)-5rem)] flex-col">
          <DocsToc headings={headings} />
        </div>
      </div>
    </div>
  );
}
