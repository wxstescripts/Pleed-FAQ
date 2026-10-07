import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";

import { JoinGatesCommands } from "./join-gates-commands";
import { GATE_SECTION, MESSAGES_SECTION, ROWS, SCREENING_SECTION, SECTION_BODY } from "./join-gates-copy";
import { Optional, WithUnit } from "./join-gates-labels";

/**
 * Loading state: the loaded page's own section frames, titles and row labels
 * with skeletons where the values go, so nothing moves when the config
 * arrives. Rendered by the (server) page and handed to the editor.
 */
export function JoinGatesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingRegion label="Loading join gate settings">
        <div aria-hidden="true" className="flex flex-col gap-6">
          <SettingsSection
            icon={GATE_SECTION.icon}
            title={GATE_SECTION.title}
            description={GATE_SECTION.description}
            action={
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-11 rounded-md" />
                <SwitchSkeleton />
              </div>
            }
          >
            <div className={SECTION_BODY}>
              <Skeleton className="h-28 w-full rounded-lg sm:h-20" />
            </div>
            <SettingRow label={ROWS.verify_channel_id.label} description={ROWS.verify_channel_id.description} control={<InputSkeleton />} />
            <SettingRow label={ROWS.unverified_role_id.label} description={ROWS.unverified_role_id.description} control={<InputSkeleton />} />
            <SettingRow label={ROWS.verified_role_id.label} description={ROWS.verified_role_id.description} control={<InputSkeleton />} />
            <SettingRow
              label={<Optional>{ROWS.bypass_role_id.label}</Optional>}
              description={ROWS.bypass_role_id.description}
              control={<InputSkeleton />}
            />
          </SettingsSection>

          <SettingsSection icon={SCREENING_SECTION.icon} title={SCREENING_SECTION.title} description={SCREENING_SECTION.description}>
            <SettingRow
              label={<WithUnit unit={ROWS.min_account_age_days.unit}>{ROWS.min_account_age_days.label}</WithUnit>}
              description={ROWS.min_account_age_days.description}
              control={<NumberSkeleton />}
            />
            <SettingRow
              label={<WithUnit unit={ROWS.auto_kick_minutes.unit}>{ROWS.auto_kick_minutes.label}</WithUnit>}
              description={ROWS.auto_kick_minutes.description}
              control={<NumberSkeleton />}
            />
          </SettingsSection>

          <SettingsSection icon={MESSAGES_SECTION.icon} title={MESSAGES_SECTION.title} description={MESSAGES_SECTION.description}>
            <SettingRow label={ROWS.dm_on_join.label} description={ROWS.dm_on_join.description} control={<SwitchSkeleton />} />
            <SettingRow
              label={<Optional>{ROWS.log_channel_id.label}</Optional>}
              description={ROWS.log_channel_id.description}
              control={<InputSkeleton />}
            />
          </SettingsSection>
        </div>
      </LoadingRegion>
      {/* Static (no config needed) and interactive, so it stays outside the aria-hidden skeleton. */}
      <JoinGatesCommands />
    </div>
  );
}

/** Stand-in for an IdInput: 40 px (44 on touch), the row gives it the 256 px control column. */
function InputSkeleton() {
  return <Skeleton className="h-10 w-full rounded-lg pointer-coarse:h-11" />;
}

/** Stand-in for a NumberField: `data-number-field` gives it the NumberField column (160 px / max 240 px stacked). */
function NumberSkeleton() {
  return (
    <div data-number-field="" className="w-full max-w-60">
      <Skeleton className="h-10 w-full rounded-lg pointer-coarse:h-11" />
    </div>
  );
}

/** Stand-in for a Switch: compact, so the row keeps it beside the label on phones too. */
function SwitchSkeleton() {
  return (
    <span data-compact-control="" className="inline-flex shrink-0">
      <Skeleton className="h-6 w-10 rounded-full" />
    </span>
  );
}
