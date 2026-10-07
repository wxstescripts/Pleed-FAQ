import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";

import { DashboardPreview } from "./dashboard-preview";

/** Server shell around the interactive dashboard preview (the only sizeable client island on the page). */
export function DashboardSection() {
  return (
    <Section
      id="dashboard"
      eyebrow="Dashboard"
      title="Prefer clicking? Set it up on the web."
      description="Sign in with Discord to tune anti-nuke limits, the join gate, auto-mod filters and auto-responders. This preview is built from the dashboard's own controls — try them."
    >
      <Reveal>
        <DashboardPreview />
      </Reveal>
    </Section>
  );
}
