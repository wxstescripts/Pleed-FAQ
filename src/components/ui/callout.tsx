import { CircleAlert, CircleCheck, Info, Lightbulb, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  info: { soft: "border-info-border bg-info-subtle", outline: "border-info-border", icon: "text-info-fg", Icon: Info },
  success: {
    soft: "border-success-border bg-success-subtle",
    outline: "border-success-border",
    icon: "text-success-fg",
    Icon: CircleCheck,
  },
  warning: {
    soft: "border-warning-border bg-warning-subtle",
    outline: "border-warning-border",
    icon: "text-warning-fg",
    Icon: TriangleAlert,
  },
  danger: {
    soft: "border-danger-border bg-danger-subtle",
    outline: "border-danger-border",
    icon: "text-danger-fg",
    Icon: CircleAlert,
  },
  brand: { soft: "border-brand-border bg-brand-subtle", outline: "border-brand-border", icon: "text-brand-fg", Icon: Lightbulb },
  // A recessed well: reads as an aside on the canvas and on every card surface.
  neutral: { soft: "border-line-strong bg-inset", outline: "border-line-strong", icon: "text-fg-tertiary", Icon: Info },
} as const;

export type CalloutTone = keyof typeof tones;

export type CalloutProps = {
  /**
   * info (a note) · success · warning (permission / role-hierarchy problems,
   * "Anti-nuke is off") · danger (failures, destructive consequences) ·
   * brand (a tip, something new) · neutral (an aside, "Last updated").
   */
  tone?: CalloutTone;
  /** "soft" (default): tinted background. "outline": border only, for long pages with several notes. */
  variant?: "soft" | "outline";
  /** Short bold first line ("Pleed is missing Manage Roles"). Not a heading — it never enters the outline. */
  title?: ReactNode;
  /** The message: text, inline code, TextLinks. Several paragraphs are spaced automatically. */
  children?: ReactNode;
  /** lucide icon; defaults per tone (Info, CircleCheck, TriangleAlert, CircleAlert, Lightbulb). */
  icon?: LucideIcon;
  /** Buttons / links: beside the text when there is room (≥ 30rem of the callout's width), on their own indented line below it otherwise. */
  actions?: ReactNode;
  /**
   * Live-region role. None by default (static notes in docs, legal, settings).
   * "status" for a polite announcement when it appears; "alert" only for an
   * error the user must notice now (ErrorState inline uses it).
   */
  role?: "status" | "alert";
  className?: string;
};

/**
 * Every note, tip, warning and permission banner — docs ("Note: Pleed's role
 * must be above…"), dashboard modules ("Pleed is missing Manage Roles"),
 * status and legal pages. A Server Component.
 *
 *   <Callout tone="warning" title="Pleed is missing Manage Roles"
 *     actions={<Button size="sm" variant="secondary" href={INVITE_URL}>Fix permissions</Button>}>
 *     Join gates can't assign the verified role until it has this permission.
 *   </Callout>
 *
 * Carries `not-prose`, so inside <Prose> it keeps its own type and gets a
 * 1.5em block margin. It is a size container (its actions wrap by its own
 * width, not the viewport's), so it is a block: in a flex row give it a width.
 */
export function Callout({ tone = "info", variant = "soft", title, children, icon, actions, role, className }: CalloutProps) {
  const t = tones[tone];
  const Icon = icon ?? t.Icon;
  return (
    <div role={role} data-slot="callout" className={cn("not-prose @container w-full min-w-0", className)}>
      <div className={cn("flex flex-wrap items-start gap-3 rounded-lg border p-4", variant === "soft" ? t.soft : t.outline)}>
        {/* Without a title the 20 px icon centres on the first 22 px line of the message. */}
        <Icon aria-hidden="true" className={cn("size-5 shrink-0", !title && "mt-px", t.icon)} />
        <div className="flex min-w-0 flex-1 basis-0 flex-col gap-1">
          {title ? <p className="type-label text-fg">{title}</p> : null}
          {children ? (
            <div
              className={cn(
                "type-small text-fg-secondary [&>*+*]:mt-2",
                // Inline code inside the message (prose styles don't reach in here).
                "[&_code]:rounded-xs [&_code]:border [&_code]:border-line [&_code]:bg-inset [&_code]:px-1 [&_code]:type-code [&_code]:text-fg [&_code]:box-decoration-clone",
              )}
            >
              {children}
            </div>
          ) : null}
        </div>
        {actions ? (
          // Narrow: own line, indented to the text (icon 20 px + gap 12 px). Wide: beside it.
          <div className="flex basis-full flex-wrap items-center gap-2 pl-8 @min-[30rem]:shrink-0 @min-[30rem]:basis-auto @min-[30rem]:self-center @min-[30rem]:pl-0">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
