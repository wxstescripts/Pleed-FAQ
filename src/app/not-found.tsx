import type { Metadata } from "next";
import { Activity, ArrowRight, ArrowUpRight, BookOpen, House, LayoutDashboard, LifeBuoy, SquareTerminal, type LucideIcon } from "lucide-react";

import Footer from "@/components/site/footer";
import Navbar from "@/components/site/navbar";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { DiscordMessage, DiscordPreview, PLEED_AUTHOR } from "@/components/ui/discord-message";
import { Section, SectionHeader } from "@/components/ui/section";
import { getCommandFacts, SUPPORT_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page doesn't exist or has moved. Head back to Pleed's home page, commands, docs, status or the dashboard.",
};

type Destination = { href: string; title: string; description: string; icon: LucideIcon };

/**
 * The 404 for every unmatched URL and every notFound() without a closer
 * boundary. It renders OUTSIDE the (marketing) layout (the root not-found
 * boundary sits above it), so it brings the same chrome itself — skip link,
 * site header, <main id="main">, footer — and looks like any marketing page.
 *
 * One message, one way home, then the four places people usually meant.
 * Server Component: no client JS beyond the header's own islands.
 */
export default async function NotFound() {
  const facts = await getCommandFacts();

  const destinations: Destination[] = [
    {
      href: "/commands",
      title: "Commands",
      description: `Search ${facts.uniqueCommandsLabel} commands across ${facts.categories} modules.`,
      icon: SquareTerminal,
    },
    {
      href: "/docs",
      title: "Docs",
      description: "Setup guides and the full reference for every module.",
      icon: BookOpen,
    },
    {
      href: "/status",
      title: "Status",
      description: "Check how the bot and the dashboard are doing.",
      icon: Activity,
    },
    {
      href: "/dashboard",
      title: "Dashboard",
      description: "Configure anti-nuke, join gates, auto-mod and automations.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      {/* Same skip link as the (marketing) layout. */}
      <a
        href="#main"
        className="fixed top-3 left-3 z-skip inline-flex min-h-11 -translate-y-[calc(100%+1rem)] items-center rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 type-label text-fg shadow-lg transition-transform duration-200 ease-standard focus-visible:translate-y-0 focus-visible:focus-ring"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {/* flex-1 + my-auto: on tall screens the message sits in the optical middle, not under the header. */}
        <Section behindHeader container={false} className="flex flex-1 flex-col bg-spotlight">
          <Container className="my-auto flex flex-col gap-16 lg:gap-20">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
              <div className="flex flex-col gap-8">
                <SectionHeader
                  titleAs="h1"
                  eyebrow="Error 404"
                  title="This page doesn’t exist"
                  description="The link may be broken, or the page has moved. Everything else is right where you left it."
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button href="/" size="lg">
                    <House aria-hidden="true" />
                    Back to home
                  </Button>
                  <Button href={SUPPORT_URL} size="lg" variant="secondary">
                    <LifeBuoy aria-hidden="true" />
                    Support server
                    <ArrowUpRight aria-hidden="true" className="text-fg-tertiary" />
                  </Button>
                </div>
              </div>

              {/* Illustration only — it repeats the heading in Pleed's own voice, so screen readers skip it. */}
              <div aria-hidden="true" className="w-full max-w-lg lg:max-w-none">
                <DiscordPreview channel="help" className="shadow-lg">
                  <DiscordMessage
                    author={PLEED_AUTHOR}
                    timestamp="Today at 12:04"
                    embed={{
                      accent: "warning",
                      title: "404 · Page not found",
                      description: "I looked everywhere, but nothing lives at this address.",
                      footer: (
                        <>
                          Lost in your server instead? Run <code className="rounded-xs bg-inset px-1 type-code text-fg">!help</code>
                        </>
                      ),
                    }}
                  >
                    Hmm, that link didn’t lead anywhere.
                  </DiscordMessage>
                </DiscordPreview>
              </div>
            </div>

            <nav aria-labelledby="not-found-destinations" className="flex flex-col gap-6">
              <h2 id="not-found-destinations" className="type-eyebrow text-fg-tertiary">
                Where to next
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
                {destinations.map((item) => (
                  <li key={item.href} className="flex">
                    <FeatureCard
                      href={item.href}
                      icon={item.icon}
                      className="flex-1"
                      title={
                        <span className="flex items-center justify-between gap-3">
                          {item.title}
                          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-fg-tertiary" />
                        </span>
                      }
                      description={item.description}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
