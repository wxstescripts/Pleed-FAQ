import { BookOpen } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { FaqList, type FaqItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Section, SectionHeader } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { DEFAULT_PREFIX, SUPPORT_URL, type CommandFacts } from "@/lib/site";

/*
 * Answers come from docs/getting-started.html, docs/security.html,
 * docs/automation.html and the dashboard pages. Nothing about pricing,
 * uptime or user counts — the repo has no source for those.
 */
function faqItems(facts: CommandFacts): FaqItem[] {
  return [
    {
      id: "what",
      question: "What does Pleed do?",
      answer: (
        <p>
          Pleed covers security (anti-nuke, a join gate, kick traps, rate limits), moderation (warnings, timeouts, bans,
          jail, lockdowns, logging), automation (auto-responders, reactions, custom commands, auto-mod) and the rest of
          a community: tickets, economy and leveling, VoiceMaster, snipe, utility and games — {facts.uniqueCommands}{" "}
          public commands across {facts.categories} modules.
        </p>
      ),
    },
    {
      id: "prefix",
      question: "What's the prefix? Do slash commands work?",
      answer: (
        <p>
          The default prefix is <code>{DEFAULT_PREFIX}</code>, and you can change it with{" "}
          <code>{DEFAULT_PREFIX}prefix &lt;new_prefix&gt;</code> or in the dashboard&apos;s settings. Slash commands
          work alongside prefix commands — use whichever is quicker.
        </p>
      ),
    },
    {
      id: "permissions",
      question: "Which permissions does Pleed need?",
      answer: (
        <p>
          Administrator is recommended for full moderation and anti-nuke coverage, but you can grant a narrower set
          instead. Anti-nuke needs View Audit Log. Commands that change server settings also check your own
          permissions (Manage Server, Manage Roles, Manage Channels or Administrator, depending on the command).
        </p>
      ),
    },
    {
      id: "hierarchy",
      question: "Why did a ban, kick or jail fail?",
      answer: (
        <p>
          Role hierarchy. Pleed can only act on members whose highest role sits below Pleed&apos;s own role. Move its
          role higher in Server Settings → Roles, and check that both you and Pleed have the permission the command
          needs.
        </p>
      ),
    },
    {
      id: "antinuke",
      question: "How does anti-nuke decide who to punish?",
      answer: (
        <p>
          It watches the audit log. Each module — bans, kicks, channel and role deletions, emoji deletions, webhook
          creation, bot adds and vanity URL changes — has its own limit, and an account that crosses one within a
          short window is banned, kicked, quarantined or reported. Add trusted staff with{" "}
          <code>{DEFAULT_PREFIX}antinuke admin</code> and whitelist bots that bulk-manage channels with{" "}
          <code>{DEFAULT_PREFIX}antinuke whitelist</code> so they&apos;re never punished.
        </p>
      ),
    },
    {
      id: "joingate",
      question: "How does the join gate work?",
      answer: (
        <p>
          New members get an unverified role and press Verify on Pleed&apos;s panel in your verify channel to receive
          the verified role. You can require a minimum account age, auto-kick members who don&apos;t verify within a
          set time, DM newcomers, let a bypass role skip the gate, and keep a whitelist and blacklist.
        </p>
      ),
    },
    {
      id: "dashboard",
      question: "Can I set Pleed up without commands?",
      answer: (
        <p>
          Yes. Sign in to the <TextLink href="/dashboard">web dashboard</TextLink> with Discord to manage anti-nuke,
          the join gate, auto-mod, auto-responders, your prefix and the welcome channel. Everything else is a command
          away — see the <TextLink href="/commands">command list</TextLink>.
        </p>
      ),
    },
  ];
}

export function Faq({ facts }: { facts: CommandFacts }) {
  return (
    <Section id="faq" aria-labelledby="faq-title">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
          <SectionHeader
            titleId="faq-title"
            eyebrow="FAQ"
            title="Questions, answered"
            description="Still stuck? The support server is the fastest way to a human."
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" href={SUPPORT_URL}>
              <DiscordIcon className="size-4" />
              Support server
            </Button>
            <Button variant="ghost" href="/docs">
              <BookOpen aria-hidden="true" />
              Read the docs
            </Button>
          </div>
        </div>
        <Reveal>
          <FaqList items={faqItems(facts)} headingLevel={3} />
        </Reveal>
      </div>
    </Section>
  );
}
