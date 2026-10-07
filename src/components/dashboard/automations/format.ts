import type { ApiError, Automation } from "@/lib/api";

/**
 * Discord's limit for a message a bot sends. A longer reply could never be
 * posted, so the composer stops it before it reaches the API.
 */
export const REPLY_MAX_LENGTH = 2000;

/** The match type the API accepts today — createAutomation always sends "contains". */
export const DEFAULT_MATCH_TYPE = "contains";

export type ResponderDraft = { trigger: string; payload: string };

export const EMPTY_DRAFT: ResponderDraft = { trigger: "", payload: "" };

/** A responder people can start from (empty state "Use this example"). */
export const EXAMPLE_DRAFT: ResponderDraft = {
  trigger: "how do I verify",
  payload: "Head to #verify and press the button — you'll get access to the rest of the server right after.",
};

const MATCH_LABELS: Record<string, string> = {
  contains: "Contains",
};

/** "contains" → "Contains"; unknown types (set elsewhere, e.g. by a bot command) read as plain words. */
export function matchTypeLabel(matchType: string | undefined): string {
  const value = (matchType || DEFAULT_MATCH_TYPE).trim();
  const known = MATCH_LABELS[value.toLowerCase()];
  if (known) return known;
  const words = value.replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** A trigger shortened for titles, toasts and dialogs (the full text stays in the list). */
export function shortTrigger(trigger: string, max = 48): string {
  const clean = trigger.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export type DraftErrors = { trigger?: string; payload?: string };

/**
 * Validation for a new responder. `showRequired` hides the "can't be empty"
 * messages until the first submit, so nobody is scolded for tabbing through;
 * duplicate and too-long errors show as soon as they're true.
 */
export function validateDraft(draft: ResponderDraft, existing: readonly Automation[], showRequired: boolean): DraftErrors {
  const errors: DraftErrors = {};
  const trigger = draft.trigger.trim();
  const payload = draft.payload.trim();

  if (!trigger) {
    if (showRequired) errors.trigger = "Enter a trigger — the text Pleed listens for.";
  } else if (existing.some((a) => a.trigger.trim() === trigger)) {
    errors.trigger = `You already have a responder for “${shortTrigger(trigger)}”. Delete that one first, or use a different trigger.`;
  }

  if (!payload) {
    if (showRequired) errors.payload = "Enter the reply Pleed should send.";
  } else if (payload.length > REPLY_MAX_LENGTH) {
    const over = payload.length - REPLY_MAX_LENGTH;
    errors.payload = `Discord messages can be up to ${formatCount(REPLY_MAX_LENGTH)} characters. Remove ${formatCount(over)} ${over === 1 ? "character" : "characters"}.`;
  }

  return errors;
}

/** Technical line for an ErrorState: "GET automations.list → HTTP 503". */
export function errorDetail(error: ApiError | null | undefined): string | undefined {
  if (!error) return undefined;
  const request = [error.method, error.endpoint].filter(Boolean).join(" ");
  const outcome = error.status ? `HTTP ${error.status}` : error.kind === "network" ? "no response" : error.kind;
  return request ? `${request} → ${outcome}` : undefined;
}
