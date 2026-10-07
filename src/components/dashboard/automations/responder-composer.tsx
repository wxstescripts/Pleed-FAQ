"use client";

import { MessageSquarePlus, Plus } from "lucide-react";
import { useRef, useState, type FormEvent, type RefObject } from "react";

import { createAutomation, type Automation } from "@/lib/api";
import { usePleedMutation } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel, FormField } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { UnsavedChangesGuard } from "@/components/ui/save-bar";
import { SettingsSection } from "@/components/ui/settings-section";
import { ErrorState } from "@/components/ui/states";
import { toast } from "@/components/ui/toast";

import {
  DEFAULT_MATCH_TYPE,
  EMPTY_DRAFT,
  EXAMPLE_DRAFT,
  REPLY_MAX_LENGTH,
  formatCount,
  matchTypeLabel,
  shortTrigger,
  validateDraft,
  type ResponderDraft,
} from "./format";
import { COMPOSER_FOOTER, COMPOSER_GRID, COMPOSER_PREVIEW } from "./layout";
import { ResponderPreview } from "./responder-preview";

export type ResponderComposerProps = {
  draft: ResponderDraft;
  onDraftChange: (draft: ResponderDraft) => void;
  /** Loaded responders — a trigger that already exists can't be added twice. */
  existing: readonly Automation[];
  /** After the API confirmed the create (the parent re-fetches the list). */
  onCreated: () => void;
  triggerRef: RefObject<HTMLInputElement | null>;
};

/**
 * "New responder": trigger + reply with validation, the only match type the
 * API supports (contains) and a live Discord preview. Sends exactly what the
 * old form sent: `{ name: "", trigger, payload, match_type: "contains" }`
 * (createAutomation fills name and match_type).
 */
export function ResponderComposer({ draft, onDraftChange, existing, onCreated, triggerRef }: ResponderComposerProps) {
  const create = usePleedMutation(createAutomation);
  const [submitted, setSubmitted] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const pending = create.status === "pending";
  const dirty = draft.trigger !== "" || draft.payload !== "";
  const errors = validateDraft(draft, existing, submitted);
  const replyLength = draft.payload.trim().length;
  const overLimit = replyLength > REPLY_MAX_LENGTH;
  const showExample = !dirty;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    const found = validateDraft(draft, existing, true);
    if (found.trigger) {
      triggerRef.current?.focus();
      return;
    }
    if (found.payload) {
      replyRef.current?.focus();
      return;
    }

    const trigger = draft.trigger.trim();
    const payload = draft.payload.trim();
    const result = await create.mutate({ trigger, payload });
    // Failure: the draft stays and the inline alert below explains it.
    if (!result.ok) return;

    onDraftChange(EMPTY_DRAFT);
    setSubmitted(false);
    create.reset();
    toast.success("Responder created", { description: `Pleed now replies to “${shortTrigger(trigger)}”.` });
    onCreated();
  }

  function clear() {
    onDraftChange(EMPTY_DRAFT);
    setSubmitted(false);
    create.reset();
    triggerRef.current?.focus();
  }

  return (
    <>
      <form noValidate onSubmit={onSubmit} className="min-w-0">
        <SettingsSection
          icon={MessageSquarePlus}
          title="New responder"
          description="Choose the text Pleed listens for and what it says back."
        >
          <div className="@container p-5 md:p-6">
            {/* Layout: see COMPOSER_GRID. */}
            <div className={COMPOSER_GRID}>
              <div className="flex min-w-0 flex-col gap-5">
                <FormField label="Trigger" description="The word or phrase Pleed listens for." error={errors.trigger}>
                  <Input
                    ref={triggerRef}
                    value={draft.trigger}
                    onChange={(event) => onDraftChange({ ...draft, trigger: event.target.value })}
                    placeholder="e.g. how do I verify"
                    autoComplete="off"
                    enterKeyHint="next"
                  />
                </FormField>

                {/* The API takes one match type today ("contains"), so it is shown, not chosen. */}
                <dl className="-mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <dt className="type-label text-fg">Match type</dt>
                  <dd className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge tone="neutral">{matchTypeLabel(DEFAULT_MATCH_TYPE)}</Badge>
                    <span className="type-caption text-fg-tertiary">anywhere in a message</span>
                  </dd>
                </dl>

                <Field invalid={Boolean(errors.payload)}>
                  <div className="flex items-baseline justify-between gap-3">
                    <FieldLabel>Reply</FieldLabel>
                    <span
                      className={cn("type-caption tabular-nums", overLimit ? "text-danger-fg" : "text-fg-tertiary")}
                    >
                      {formatCount(replyLength)} / {formatCount(REPLY_MAX_LENGTH)}
                    </span>
                  </div>
                  <Textarea
                    ref={replyRef}
                    value={draft.payload}
                    onChange={(event) => onDraftChange({ ...draft, payload: event.target.value })}
                    placeholder="e.g. Head to #verify and press the button."
                    rows={3}
                  />
                  <FieldDescription>Sent exactly as typed, line breaks included.</FieldDescription>
                  {errors.payload ? <FieldError match={true}>{errors.payload}</FieldError> : null}
                </Field>

              </div>

              <div className={cn("flex min-w-0 flex-col gap-3", COMPOSER_PREVIEW)}>
                <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <h3 className="type-label text-fg">Preview</h3>
                  {showExample ? (
                    <Badge tone="outline">Example</Badge>
                  ) : (
                    <span className="type-caption text-fg-tertiary">Updates as you type</span>
                  )}
                </div>
                <ResponderPreview
                  trigger={showExample ? EXAMPLE_DRAFT.trigger : draft.trigger}
                  reply={showExample ? EXAMPLE_DRAFT.payload : draft.payload}
                />
              </div>

              <div className={cn("flex min-w-0 flex-col gap-4", COMPOSER_FOOTER)}>
                {create.error ? (
                  <ErrorState
                    variant="inline"
                    title="Couldn't create this responder"
                    description={`${create.error.message} Your trigger and reply are still here, so you can try again.`}
                  />
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" loading={pending} className="max-sm:flex-1">
                    <Plus aria-hidden="true" />
                    Create responder
                  </Button>
                  {dirty ? (
                    <Button variant="ghost" onClick={clear} aria-disabled={pending || undefined}>
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>
      </form>
      <UnsavedChangesGuard
        when={dirty}
        onDiscard={() => onDraftChange(EMPTY_DRAFT)}
        title="Discard this responder?"
        description="You started a new auto-responder but haven't created it yet. If you leave now, its trigger and reply are lost."
      />
    </>
  );
}
