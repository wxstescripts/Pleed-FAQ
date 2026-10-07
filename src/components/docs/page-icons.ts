import {
  BookOpen,
  Coins,
  Gamepad2,
  Gavel,
  Info,
  Mic,
  Rocket,
  ShieldCheck,
  Ticket,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** One lucide icon per docs page (sidebar, section cards, search results). */
export const DOCS_PAGE_ICONS: Record<string, LucideIcon> = {
  "getting-started": Rocket,
  "server-setup": Wrench,
  security: ShieldCheck,
  moderation: Gavel,
  automation: Workflow,
  tickets: Ticket,
  voice: Mic,
  economy: Coins,
  utility: Info,
  fun: Gamepad2,
};

export const DOCS_HOME_ICON: LucideIcon = BookOpen;

export function docsPageIcon(slug: string): LucideIcon {
  return DOCS_PAGE_ICONS[slug] ?? BookOpen;
}
