"use client";

import { ArrowLeftRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SaveBar, useLeaveGuard } from "@/components/ui/save-bar";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";

type Config = { enabled: boolean; dm: boolean };
const INITIAL: Config = { enabled: true, dm: false };

/** One short settings card + SaveBar, laid out exactly like a dashboard page. */
export function ShortPageDemo() {
  const router = useRouter();
  const { confirmLeave } = useLeaveGuard();
  const [saved, setSaved] = useState<Config>(INITIAL);
  const [draft, setDraft] = useState<Config>(INITIAL);
  const [saving, setSaving] = useState(false);
  const dirty = saved.enabled !== draft.enabled || saved.dm !== draft.dm;

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(draft);
      toast.success("Settings saved");
    }, 900);
  };

  return (
    <>
      <PageHeader
        title="Join gate"
        description="A page shorter than the screen. Change a setting: the save bar rests at the bottom of the viewport, not under the card."
        meta={
          <Badge tone={saved.enabled ? "success" : "neutral"} dot>
            {saved.enabled ? "On" : "Off"}
          </Badge>
        }
        actions={
          // Programmatic navigation (router.push) is guarded with confirmLeave() from useLeaveGuard().
          <Button
            variant="secondary"
            onClick={async () => {
              if (await confirmLeave()) router.push("/design-system#settings");
            }}
          >
            <ArrowLeftRight /> Switch server
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <SettingsSection icon={ShieldCheck} title="Screening" description="Hold new members until they verify.">
          <SettingRow
            label="Enable the join gate"
            description="New members see only the verification channel."
            control={<Switch checked={draft.enabled} onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v }))} />}
          />
          <SettingRow
            label="DM members on join"
            description="Send the verification instructions privately."
            control={<Switch checked={draft.dm} onCheckedChange={(v) => setDraft((d) => ({ ...d, dm: v }))} />}
          />
        </SettingsSection>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setDraft(saved)} />
    </>
  );
}
