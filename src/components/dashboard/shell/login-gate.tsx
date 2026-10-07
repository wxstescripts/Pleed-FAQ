"use client";

import { ArrowLeft, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { IconTile } from "@/components/ui/icon-tile";
import { Logo, LogoMark } from "@/components/ui/logo";
import { TextLink } from "@/components/ui/text-link";
import { COPYRIGHT_HOLDER, INVITE_URL } from "@/lib/site";

import { getPageForPath, MODULE_PAGES, OVERVIEW_PAGE } from "./nav";

/**
 * Signed out (production: no NextAuth session). The only way in is the
 * real `signIn("discord")` flow; nothing of the dashboard renders here.
 * Route-aware: /dashboard/security asks you to sign in to manage Security.
 */
export function LoginGate() {
  const pathname = usePathname();
  const page = getPageForPath(pathname);
  const [pending, setPending] = useState(false);

  const heading =
    page && page !== OVERVIEW_PAGE ? `Sign in to manage ${page.label}` : "Sign in to the Pleed dashboard";

  const continueWithDiscord = () => {
    setPending(true);
    // Real NextAuth flow (Discord OAuth, scopes identify + guilds). If it fails before
    // redirecting, give the button back.
    signIn("discord").catch(() => setPending(false));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-spotlight">
      <a
        href="#main"
        className="fixed top-3 left-3 z-skip inline-flex min-h-11 -translate-y-[calc(100%+1rem)] items-center rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 type-label text-fg shadow-lg transition-transform duration-200 ease-standard focus-visible:translate-y-0 focus-visible:focus-ring"
      >
        Skip to content
      </a>

      <header className="container-wide flex h-header shrink-0 items-center justify-between gap-4 pt-[env(safe-area-inset-top)]">
        <Logo href="/" size="sm" />
        <Button href="/" variant="ghost" size="sm">
          <ArrowLeft aria-hidden="true" />
          Back to site
        </Button>
      </header>

      <main id="main" tabIndex={-1} className="flex flex-1 flex-col items-center justify-center px-gutter py-page outline-none">
        <div className="grid w-full max-w-md overflow-hidden rounded-2xl border border-line-strong bg-surface-1 shadow-xl inset-shadow-highlight lg:max-w-4xl lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          {/* Sign in */}
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
            <LogoMark size="lg" />
            <div className="flex flex-col gap-3">
              <p className="type-eyebrow text-brand-fg">Pleed dashboard</p>
              <h1 className="type-h3 text-fg">{heading}</h1>
              <p className="type-body text-fg-secondary">
                Configure Pleed for your server from the browser. Log in with the Discord account you already
                have — there&apos;s no separate Pleed account.
              </p>
            </div>

            <Button
              variant="discord"
              size="lg"
              fullWidth
              loading={pending}
              onClick={continueWithDiscord}
            >
              <DiscordIcon className="size-5" />
              Continue with Discord
            </Button>

            <Callout tone="neutral" icon={Lock} title="What Discord shares with Pleed">
              <p>
                Your username and avatar (<code className="type-code">identify</code>) and the list of servers
                you&apos;re in (<code className="type-code">guilds</code>). It doesn&apos;t let Pleed read your
                messages or act on your behalf. <TextLink href="/privacy">Privacy Policy</TextLink>
              </p>
            </Callout>
          </div>

          {/* What you can do */}
          <div className="flex flex-col gap-5 border-t border-line-subtle bg-inset p-6 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
            <h2 className="type-h4 text-fg">What you can do here</h2>
            <ul className="flex flex-col gap-4">
              {MODULE_PAGES.map((module) => (
                <li key={module.href} className="flex items-start gap-3">
                  <IconTile icon={module.icon} size="sm" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="type-label text-fg">{module.label}</p>
                    <p className="type-caption text-fg-tertiary">{module.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-auto border-t border-line-subtle pt-5 type-small text-fg-secondary">
              Pleed not in your server yet? <TextLink href={INVITE_URL}>Add it to Discord</TextLink> first, then
              come back here. New to Pleed? <TextLink href="/docs">Read the docs</TextLink>.
            </p>
          </div>
        </div>
      </main>

      <footer className="container-wide flex flex-col items-center justify-between gap-2 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] type-caption text-fg-tertiary sm:flex-row">
        <p>
          © {new Date().getFullYear()} {COPYRIGHT_HOLDER}
        </p>
        <nav aria-label="Legal" className="flex items-center gap-4">
          <TextLink href="/privacy" tone="subtle" underline="hover">
            Privacy
          </TextLink>
          <TextLink href="/terms" tone="subtle" underline="hover">
            Terms
          </TextLink>
          <TextLink href="/status" tone="subtle" underline="hover">
            Status
          </TextLink>
        </nav>
      </footer>
    </div>
  );
}
