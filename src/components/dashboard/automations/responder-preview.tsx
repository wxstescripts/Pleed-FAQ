import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DiscordMessage, DiscordPreview, PLEED_AUTHOR } from "@/components/ui/discord-message";

/** A member who triggers the responder in every preview (a made-up name, clearly not a real user). */
const MEMBER = { name: "Nova", accent: "info" } as const;

export type ResponderPreviewProps = {
  /** What the member writes. Empty → `triggerPlaceholder` in a muted tone. */
  trigger: string;
  /** What Pleed answers. Empty → `replyPlaceholder` in a muted tone. */
  reply: string;
  triggerPlaceholder?: ReactNode;
  replyPlaceholder?: ReactNode;
  className?: string;
};

/**
 * How an auto-responder looks in Discord: a member's message that contains
 * the trigger, then Pleed's reply. Plain text, line breaks kept, long words
 * wrapped — a reply is sent exactly as typed.
 */
export function ResponderPreview({
  trigger,
  reply,
  triggerPlaceholder = "Your trigger",
  replyPlaceholder = "Your reply",
  className,
}: ResponderPreviewProps) {
  return (
    <DiscordPreview channel="general" className={className}>
      <DiscordMessage author={MEMBER} timestamp="Today at 12:03">
        <MessageText value={trigger} placeholder={triggerPlaceholder} />
      </DiscordMessage>
      <DiscordMessage author={PLEED_AUTHOR} timestamp="Today at 12:03">
        <MessageText value={reply} placeholder={replyPlaceholder} />
      </DiscordMessage>
    </DiscordPreview>
  );
}

function MessageText({ value, placeholder }: { value: string; placeholder: ReactNode }) {
  const text = value.trim();
  return (
    <p className={cn("whitespace-pre-wrap wrap-anywhere", !text && "text-fg-tertiary")}>
      {text || placeholder}
    </p>
  );
}
