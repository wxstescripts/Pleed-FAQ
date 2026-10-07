import { Badge } from "@/components/ui/badge";
import { DiscordMention, DiscordMessage, DiscordPreview, PLEED_AUTHOR } from "@/components/ui/discord-message";
import { LogoMark } from "@/components/ui/logo";

import { HeroPanel } from "./hero-panel";

/**
 * The hero's product illustration, built from the real kit (no screenshots):
 * the dashboard's anti-nuke card at the back and, layered over it, the alert
 * Pleed posts when a compromised account starts mass-banning.
 *
 * It is a picture, not a form: `inert` keeps its controls out of the tab
 * order and aria-hidden keeps it out of the accessibility tree (the hero copy
 * says the same thing in words). Phones get the same composition with the
 * second slider row dropped, so nothing is shrunk below its real size.
 */
export function HeroVisual() {
  return (
    <div aria-hidden="true" inert className="relative mx-auto w-full max-w-xl select-none lg:max-w-none">
      <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-surface-1 shadow-glow-lg inset-shadow-highlight sm:w-11/12">
        <div className="flex h-11 items-center gap-2 border-b border-line-subtle bg-surface-2 px-4">
          <LogoMark size="xs" />
          <span className="type-label text-fg">Dashboard</span>
          <span className="type-label text-fg-disabled">/</span>
          <span className="truncate type-label text-fg-secondary">Security</span>
          <Badge size="sm" className="ml-auto">
            Your server
          </Badge>
        </div>
        <HeroPanel />
      </div>

      <DiscordPreview
        channel="mod-log"
        className="relative z-raised -mt-4 ml-6 border-line-strong shadow-xl sm:-mt-28 sm:ml-auto sm:w-4/5"
      >
        <DiscordMessage
          author={PLEED_AUTHOR}
          timestamp="Today at 03:12"
          embed={{
            accent: "danger",
            title: "Anti-nuke stopped a mass ban",
            description: (
              <>
                <DiscordMention kind="user">mod-account</DiscordMention> banned 3 members in under a minute — your
                limit is 3.
              </>
            ),
            fields: [{ name: "Action taken", value: "Banned the account" }],
            footer: "Trusted admins and whitelisted bots are exempt.",
          }}
        />
      </DiscordPreview>
    </div>
  );
}
