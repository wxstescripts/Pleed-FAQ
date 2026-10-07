import { Button, IconButton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Logo } from "@/components/ui/logo";
import { TextLink } from "@/components/ui/text-link";
import { COPYRIGHT_HOLDER, FOOTER_GROUPS, INVITE_URL, SITE_TAGLINE, SOCIAL_LINKS } from "@/lib/site";

/**
 * Global site footer (Server Component — no client JS).
 *
 *  - Phones: brand block, then a two-column link grid; every link is a
 *    44 px row on touch screens.
 *  - Tablets (≥ 768): brand row (Logo + tagline | CTA) above three link columns.
 *  - ≥ 1024: one row — brand block (5/12) beside the three columns (7/12),
 *    aligned to the content container like every marketing section.
 *
 * Links come from `@/lib/site` only. The invite lives in the brand block's
 * button, so it is not repeated in the "Resources" list.
 */
const groups = FOOTER_GROUPS.map((group) => ({
  ...group,
  links: group.links.filter((link) => link.href !== INVITE_URL),
})).filter((group) => group.links.length > 0);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line-subtle">
      {/* Top light catch on the hairline (decorative). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px max-w-3xl bg-linear-to-r from-transparent via-line-hover to-transparent"
      />

      <Container className="grid gap-12 py-section-sm lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:col-span-5 lg:flex-col lg:items-start lg:justify-start">
          <div className="flex flex-col items-start gap-4">
            <Logo href="/" />
            <p className="max-w-xs type-small text-fg-secondary">{SITE_TAGLINE}.</p>
          </div>
          <Button variant="discord" href={INVITE_URL}>
            <DiscordIcon className="size-4" />
            Add to Discord
          </Button>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-7 lg:gap-x-8"
        >
          {groups.map((group) => (
            <div key={group.title} className="flex min-w-0 flex-col gap-3 pointer-coarse:gap-1">
              <h2 className="type-label text-fg">{group.title}</h2>
              <ul className="flex flex-col gap-1 pointer-coarse:gap-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <TextLink
                      href={link.href}
                      external={link.external}
                      tone="subtle"
                      underline="hover"
                      className="inline-block py-1 type-small pointer-coarse:min-w-11 pointer-coarse:py-3"
                    >
                      {link.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div className="border-t border-line-subtle">
        <Container className="flex flex-col-reverse gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-caption text-fg-tertiary">
            © {year} {COPYRIGHT_HOLDER}. <span className="whitespace-nowrap">Not affiliated with Discord Inc.</span>
          </p>
          {SOCIAL_LINKS.length > 0 ? (
            <ul aria-label="Community" className="-ml-2 flex items-center gap-1 sm:-mr-2 sm:ml-0">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <IconButton href={link.href} external={link.external} label={`${link.label} (opens in a new tab)`}>
                    <DiscordIcon className="size-4.5" />
                  </IconButton>
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </div>
    </footer>
  );
}
