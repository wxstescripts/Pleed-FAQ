"use client";

import { ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SettingsSection } from "@/components/ui/settings-section";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { SECURITY_PUNISHMENTS } from "./dashboard-data";

/**
 * The dashboard's anti-nuke card, drawn with the real dashboard controls for
 * the hero illustration. The hero marks the whole visual `inert` +
 * aria-hidden: it is a picture of the product, not a form. Rows are the
 * compact standalone form of each control (label + value on one line) so the
 * card stays legible in a half-width column; the real settings page uses
 * SettingRow. (A client file only because SettingsSection takes a lucide
 * component.)
 */
export function HeroPanel() {
  return (
    <SettingsSection
      headingAs="h3"
      icon={ShieldAlert}
      title="Anti-nuke"
      description="Punish anyone who bans, kicks or deletes faster than these limits."
      action={
        <>
          <Badge tone="success" dot className="max-sm:hidden">
            On
          </Badge>
          <Switch aria-label="Enable anti-nuke" defaultChecked />
        </>
      }
      className="rounded-none border-0 bg-transparent inset-shadow-none"
    >
      <div className="px-5 pt-4 pb-3 md:px-6">
        <Slider label="Ban threshold" unit="per minute" defaultValue={3} min={1} max={20} showRange={false} />
      </div>
      <div className="px-5 pt-4 pb-3 max-sm:hidden md:px-6">
        <Slider label="Kick threshold" unit="per minute" defaultValue={5} min={1} max={20} showRange={false} />
      </div>
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-6">
        <span className="type-label text-fg">Punishment</span>
        <div className="w-44 min-w-0">
          <Select aria-label="Punishment" items={SECURITY_PUNISHMENTS} defaultValue="ban" />
        </div>
      </div>
    </SettingsSection>
  );
}
