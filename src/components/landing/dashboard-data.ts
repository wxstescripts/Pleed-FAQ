import type { SelectItemData } from "@/components/ui/select";

/*
 * Option lists for the landing's dashboard illustrations. They mirror the
 * real dashboard API (src/lib/api/types.ts: SecurityPunishment,
 * AutomodPunishment) so the previews never promise an option that doesn't
 * exist.
 */

/** SecurityConfig.punishment — "ban" | "kick" | "quarantine" | "alert". */
export const SECURITY_PUNISHMENTS: SelectItemData[] = [
  { value: "ban", label: "Ban", description: "Ban the account that crossed the limit." },
  { value: "kick", label: "Kick", description: "Remove it from the server." },
  { value: "quarantine", label: "Quarantine", description: "Strip its roles so it can't act." },
  { value: "alert", label: "Alert only", description: "Take no action, just report it." },
];

/** AutomodConfig.punishment — "delete" | "timeout" | "kick" | "ban". */
export const AUTOMOD_PUNISHMENTS: SelectItemData[] = [
  { value: "delete", label: "Delete the message" },
  { value: "timeout", label: "Time out the member" },
  { value: "kick", label: "Kick the member" },
  { value: "ban", label: "Ban the member" },
];
