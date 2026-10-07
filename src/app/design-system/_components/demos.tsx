"use client";

import {
  Bell,
  BookOpen,
  Bot,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MoreHorizontal,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { FaqList } from "@/components/ui/accordion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Checkbox, CheckboxGroup, CheckboxOption } from "@/components/ui/checkbox";
import { CodeBlock, CommandChip, CopyButton } from "@/components/ui/code-block";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DiscordIcon } from "@/components/ui/discord-icon";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldLabel, FormField } from "@/components/ui/field";
import { Input, NumberField, Textarea } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { NavItem } from "@/components/ui/nav-item";
import { RadioGroup, RadioOption, SegmentedControl } from "@/components/ui/radio-group";
import { ResponsiveList } from "@/components/ui/responsive-list";
import { SaveBar } from "@/components/ui/save-bar";
import { SearchField } from "@/components/ui/search-field";
import { NativeSelect, Select } from "@/components/ui/select";
import { SettingRow, SettingsSection } from "@/components/ui/settings-section";
import { Sheet, SheetContent, SheetNavItem, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { IdInput, snowflakeHelp } from "@/components/ui/snowflake-input";
import { ErrorState } from "@/components/ui/states";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { INVITE_URL, NAV_LINKS, SUPPORT_URL } from "@/lib/site";

import { DsBlock } from "./ds-layout";

const PUNISHMENTS = [
  { value: "ban", label: "Ban", description: "Remove the member and block rejoining." },
  { value: "kick", label: "Kick", description: "Remove the member; they can rejoin with an invite." },
  { value: "quarantine", label: "Quarantine", description: "Strip roles and isolate until reviewed." },
  { value: "alert", label: "Alert only", description: "Log the event and notify staff." },
];

/* ------------------------------------------------------------------ */

const SEARCHABLE = ["ban", "kick", "mute", "timeout", "antinuke", "antiraid", "ticket", "voicemaster", "welcome", "verify"];

export function FormDemos() {
  const [prefix, setPrefix] = useState("!");
  const [welcomeChannel, setWelcomeChannel] = useState("");
  const [verifiedRole, setVerifiedRole] = useState("12345");
  const [query, setQuery] = useState("");
  const matches = SEARCHABLE.filter((c) => c.includes(query.trim().toLowerCase()));
  const prefixError =
    prefix.length === 0 ? "Enter a prefix." : /\s/.test(prefix) ? "Prefixes can't contain spaces." : prefix.length > 3 ? "Use 1–3 characters." : undefined;

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <DsBlock title="Text inputs">
        <div className="grid gap-5 rounded-xl border border-line bg-surface-1 p-5 md:p-6">
          <FormField label="Server name" description="Shown in the dashboard header.">
            <Input placeholder="My awesome server" />
          </FormField>
          <FormField label="Command prefix" description={`Commands will look like ${prefix || "!"}help`} error={prefixError}>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} maxLength={4} className="font-mono" />
          </FormField>
          <FormField label="Welcome channel" optional description={snowflakeHelp("channel")}>
            <IdInput kind="channel" value={welcomeChannel} onValueChange={setWelcomeChannel} />
          </FormField>
          <FormField label="Verified role" description="IdInput checks 17–20 digits after the first blur (pre-filled with a bad value here).">
            <IdInput kind="role" value={verifiedRole} onValueChange={setVerifiedRole} required />
          </FormField>
          <div className="flex flex-col gap-2">
            <SearchField
              label="Search commands"
              placeholder="ban, ticket, antinuke…"
              value={query}
              onValueChange={setQuery}
              resultCount={query ? matches.length : null}
            />
            <p className="type-caption text-fg-tertiary" aria-hidden="true">
              SearchField — press <span className="font-mono">/</span> to focus, Esc clears.{" "}
              {query ? `${matches.length} of ${SEARCHABLE.length} match.` : null}
            </p>
          </div>
          <FormField label="Disabled" description="Read-only while saving.">
            <Input disabled value="Can't touch this" readOnly />
          </FormField>
          <FormField label="Auto-responder reply">
            <Textarea placeholder="Welcome! Read #rules to get verified." />
          </FormField>
        </div>
      </DsBlock>

      <DsBlock title="Numbers, selects, choices">
        <div className="grid gap-5 rounded-xl border border-line bg-surface-1 p-5 md:p-6">
          <Field>
            <FieldLabel>Minimum account age (days)</FieldLabel>
            <NumberField defaultValue={7} min={0} max={365} unit="days" />
            <FieldDescription>New accounts younger than this are held at the gate. 0 = off.</FieldDescription>
          </Field>
          <Select label="Punishment" items={PUNISHMENTS} defaultValue="ban" />
          <Field>
            <FieldLabel>Log channel (native select)</FieldLabel>
            <NativeSelect defaultValue="mod-log">
              <option value="mod-log">#mod-log</option>
              <option value="security">#security</option>
              <option value="general">#general</option>
            </NativeSelect>
          </Field>
          <div className="flex flex-col gap-3">
            <p id="ds-notify-label" className="type-label text-fg">
              Notifications
            </p>
            <CheckboxGroup aria-labelledby="ds-notify-label" defaultValue={["join"]}>
              <CheckboxOption value="join" label="DM members when they join" />
              <CheckboxOption value="channels" indeterminate label="Some channels selected (indeterminate)" />
              <CheckboxOption value="digest" label="Weekly digest" description="A summary of held members and blocked raids." />
              <CheckboxOption value="disabled" disabled label="Disabled option" />
            </CheckboxGroup>
          </div>
        </div>
      </DsBlock>

      <DsBlock title="Radio & segmented">
        <div className="grid gap-5 rounded-xl border border-line bg-surface-1 p-5 md:p-6">
          <RadioGroup defaultValue="kick" aria-label="When the threshold is hit">
            <RadioOption value="ban" label="Ban" description="Remove and block from rejoining." />
            <RadioOption value="kick" label="Kick" description="Remove; can rejoin with an invite." />
            <RadioOption value="alert" label="Alert only" description="Log and notify staff." disabled />
          </RadioGroup>
          <RadioGroup defaultValue="contains" aria-label="Match type" className="grid gap-3 sm:grid-cols-2">
            <RadioOption card value="contains" label="Contains" description="Trigger anywhere in a message." />
            <RadioOption card value="exact" label="Exact" description="Whole message must match." />
          </RadioGroup>
          <SegmentedControl
            aria-label="Time range"
            defaultValue="7d"
            options={[
              { value: "24h", label: "24 hours" },
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "all", label: "All time" },
            ]}
          />
          <SegmentedControl
            aria-label="Layout"
            size="sm"
            defaultValue="grid"
            options={[
              { value: "grid", label: "Grid", icon: <LayoutDashboard /> },
              { value: "list", label: "List", icon: <Menu /> },
            ]}
          />
        </div>
      </DsBlock>

      <DsBlock title="Switches & sliders">
        <div className="grid gap-6 rounded-xl border border-line bg-surface-1 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-6">
            <Switch defaultChecked aria-label="Enabled example" />
            <Switch aria-label="Disabled-off example" />
            <Switch size="sm" defaultChecked aria-label="Small example" />
            <Switch disabled aria-label="Disabled example" />
            <Switch disabled defaultChecked aria-label="Disabled on example" />
          </div>
          <Slider label="Ban threshold" defaultValue={3} min={1} max={20} unit="per minute" />
          <Slider label="Auto-kick after" defaultValue={30} min={0} max={120} step={5} unit="min" description="0 disables auto-kick." />
          <Slider label="Disabled slider" defaultValue={40} disabled showRange={false} />
        </div>
      </DsBlock>

      <DsBlock title="Control heights — sm 32 / md 40 px, every size 44 px on touch" className="xl:col-span-2">
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-5 md:p-6">
          {(["sm", "md"] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              <span className="w-8 type-code-xs text-fg-tertiary">{size}</span>
              <Input inputSize={size} aria-label={`Filter (${size})`} placeholder="Filter…" className="w-40" />
              <Field className="w-36">
                <FieldLabel className="sr-only">Limit ({size})</FieldLabel>
                <NumberField size={size} defaultValue={5} min={0} max={99} />
              </Field>
              <Select size={size} aria-label={`Sort (${size})`} items={SORTS} defaultValue="new" className="w-36" />
              <Button size={size} variant="secondary">
                Apply
              </Button>
              <Button size={size}>Save</Button>
            </div>
          ))}
        </div>
      </DsBlock>
    </div>
  );
}

const SORTS = [
  { value: "new", label: "Newest" },
  { value: "old", label: "Oldest" },
  { value: "az", label: "A → Z" },
];

/* ------------------------------------------------------------------ */

export function NavigationDemos() {
  const [compact, setCompact] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <DsBlock title="Tabs — pill">
        <Tabs defaultValue="overview">
          <TabsList aria-label="Server sections">
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="security">
              <ShieldCheck /> Security
            </TabsTab>
            <TabsTab value="automod">Auto-mod</TabsTab>
            <TabsTab value="disabled" disabled>
              Disabled
            </TabsTab>
          </TabsList>
          <TabsPanel value="overview" className="rounded-xl border border-line bg-surface-1 p-5 type-small text-fg-secondary">
            Overview panel — arrow keys move between tabs.
          </TabsPanel>
          <TabsPanel value="security" className="rounded-xl border border-line bg-surface-1 p-5 type-small text-fg-secondary">
            Security panel.
          </TabsPanel>
          <TabsPanel value="automod" className="rounded-xl border border-line bg-surface-1 p-5 type-small text-fg-secondary">
            Auto-mod panel.
          </TabsPanel>
        </Tabs>
      </DsBlock>
      <DsBlock title="Tabs — line (scrolls on phones)">
        <Tabs defaultValue="Moderation">
          <TabsList variant="line" aria-label="Command categories">
            {["All", "Antinuke", "Automation", "Economy", "Information", "Moderation", "Security", "Voice"].map((c) => (
              <TabsTab key={c} value={c}>
                {c}
              </TabsTab>
            ))}
          </TabsList>
          <TabsPanel value="Moderation" className="type-small text-fg-secondary">
            Moderation commands…
          </TabsPanel>
        </Tabs>
      </DsBlock>
      <DsBlock title="Accordion / FAQ">
        <FaqList
          items={[
            {
              question: "What's Pleed's default prefix?",
              answer: (
                <>
                  <code>!</code> — change it with <code>!prefix ?</code>. Slash commands work alongside prefix commands.
                </>
              ),
            },
            {
              question: "Which permissions does Pleed need?",
              answer: "Administrator is simplest. Otherwise grant Manage Server, Roles, Channels and View Audit Log, and keep Pleed's role above the roles it manages.",
            },
            { question: "Is the dashboard free?", answer: "Yes — sign in with Discord to configure your servers." },
          ]}
        />
      </DsBlock>
      <DsBlock title="Menu & tooltip">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-1 p-5">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="secondary" />}>
              <Avatar name="Nova Admin" size="xs" /> Nova <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Signed in as Nova</DropdownMenuLabel>
              <DropdownMenuLinkItem href="/design-system#overlays">
                <LayoutDashboard /> Dashboard (link)
              </DropdownMenuLinkItem>
              <DropdownMenuItem>
                <Settings2 /> Settings
              </DropdownMenuItem>
              <DropdownMenuLinkItem href={SUPPORT_URL}>
                <LifeBuoy /> Support server
              </DropdownMenuLinkItem>
              <DropdownMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
                Compact mode
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip content="Notifications (none yet)">
            <IconButton label="Notifications" variant="ghost">
              <Bell />
            </IconButton>
          </Tooltip>
          <Tooltip content="Copies the usage line" side="bottom">
            <Button variant="outline" size="sm">
              Hover or focus me
            </Button>
          </Tooltip>
          <div className="flex flex-wrap items-center gap-2">
            <Avatar name="Pleed Dev" size="sm" />
            <Avatar name="Mod Squad" size="md" shape="rounded" />
            <Avatar name={null} size="lg" decorative={false} />
          </div>
        </div>
      </DsBlock>
      <DsBlock title="NavItem — header · sidebar · icon rail (one active state everywhere)" className="xl:col-span-2">
        <div className="grid min-w-0 gap-4 rounded-xl border border-line bg-surface-1 p-5 md:grid-cols-[minmax(0,1fr)_15rem_4rem]">
          <nav aria-label="Header example" className="flex min-w-0 flex-wrap items-start gap-1 self-start">
            <NavItem href="/design-system#navigation">Features</NavItem>
            <NavItem href="/design-system#navigation" active>
              Commands
            </NavItem>
            <NavItem href="/design-system#navigation">Docs</NavItem>
            <NavItem href={SUPPORT_URL}>Support</NavItem>
          </nav>
          <nav aria-label="Sidebar example" className="flex flex-col gap-0.5 rounded-lg bg-canvas p-2">
            <NavItem variant="sidebar" href="/design-system#navigation" icon={LayoutDashboard}>
              Overview
            </NavItem>
            <NavItem variant="sidebar" href="/design-system#navigation" icon={ShieldAlert} active>
              Security
            </NavItem>
            <NavItem variant="sidebar" href="/design-system#navigation" icon={UserCheck} badge={<Badge size="sm">3</Badge>}>
              Join gates
            </NavItem>
            <NavItem variant="sidebar" href="/design-system#navigation" icon={Bot} badge={<Badge size="sm" tone="brand">New</Badge>}>
              Automations
            </NavItem>
            <NavItem variant="sidebar" href={SUPPORT_URL} icon={LifeBuoy}>
              Support server
            </NavItem>
          </nav>
          <nav aria-label="Icon rail example" className="flex flex-col items-stretch gap-0.5 rounded-lg bg-canvas p-2 max-md:w-16">
            {[
              { label: "Overview", icon: LayoutDashboard },
              { label: "Security", icon: ShieldAlert, active: true },
              { label: "Automod", icon: Zap },
              { label: "Docs", icon: BookOpen },
            ].map((item) => (
              <Tooltip key={item.label} content={item.label} side="right">
                <NavItem variant="sidebar" collapsed href="/design-system#navigation" icon={item.icon} active={item.active}>
                  {item.label}
                </NavItem>
              </Tooltip>
            ))}
          </nav>
        </div>
      </DsBlock>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function OverlayDemos() {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" />}>Open dialog</DialogTrigger>
          <DialogContent
            title="Add an auto-responder"
            description="Pleed replies whenever a message contains the trigger."
            footer={
              <>
                <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                <DialogClose render={<Button />}>Add responder</DialogClose>
              </>
            }
          >
            <div className="grid gap-4">
              <FormField label="Trigger">
                <Input placeholder="how do I verify" />
              </FormField>
              <FormField label="Reply">
                <Textarea placeholder="Head to #verify and press the button." />
              </FormField>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            <Trash2 /> Delete responder
          </AlertDialogTrigger>
          <AlertDialogContent
            title="Delete this auto-responder?"
            description="“how do I verify” will stop replying immediately. This can't be undone."
            footer={
              <>
                <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
                <AlertDialogClose render={<Button variant="destructive" />} onClick={() => toast.success("Responder deleted")}>
                  Delete
                </AlertDialogClose>
              </>
            }
          />
        </AlertDialog>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="outline" />}>
            <Menu /> Mobile menu (sheet)
          </SheetTrigger>
          <SheetContent
            side="right"
            title="Menu"
            hideTitle
            headerStart={<Logo size="sm" />}
            footer={
              <Button variant="discord" fullWidth size="lg" href={INVITE_URL}>
                <DiscordIcon /> Add to Discord
              </Button>
            }
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <SheetNavItem key={link.href} href={link.href} active={link.href === "/commands"} onClick={() => setSheetOpen(false)}>
                  {link.label}
                </SheetNavItem>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Bottom sheet</SheetTrigger>
          <SheetContent side="bottom" title="Filter commands" description="Pick a category.">
            <div className="flex flex-wrap gap-2 p-1">
              {["Antinuke", "Automation", "Economy", "Moderation", "Security", "Voice"].map((c) => (
                <Badge key={c} size="lg">
                  {c}
                </Badge>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Left drawer</SheetTrigger>
          <SheetContent side="left" title="Dashboard" headerStart={<Logo size="sm" markOnly title="Pleed" />}>
            <nav aria-label="Dashboard" className="flex flex-col gap-1">
              <SheetNavItem href="/dashboard" icon={LayoutDashboard} active>
                Overview
              </SheetNavItem>
              <SheetNavItem href="/dashboard/security" icon={ShieldAlert}>
                Security
              </SheetNavItem>
              <SheetNavItem href="/dashboard/joingates" icon={UserCheck} badge={<Badge size="sm">3</Badge>}>
                Join gates
              </SheetNavItem>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <DsBlock title="Toasts">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => toast.success("Settings saved", { description: "Anti-nuke thresholds updated." })}>
            Success
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast.error("Couldn't save settings", {
                description: "The Pleed API didn't respond.",
                action: { label: "Retry", onClick: () => toast.info("Retrying…") },
              })
            }
          >
            Error + action
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast.warning("Pleed's role is below Moderator", { description: "Move it up so it can act on those members." })}>
            Warning
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast.info("Tip: press / to search commands")}>
            Info
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
                loading: "Saving changes…",
                success: "Changes saved",
                error: "Save failed",
              })
            }
          >
            Promise
          </Button>
        </div>
      </DsBlock>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function StateDemos() {
  const [retrying, setRetrying] = useState(false);
  return (
    <ErrorState
      title="Couldn't load security settings"
      description="We won't show default values in their place — retry to load your real configuration."
      detail="GET /api/security/… → 502 Bad Gateway"
      retrying={retrying}
      onRetry={() => {
        setRetrying(true);
        setTimeout(() => setRetrying(false), 1500);
      }}
    />
  );
}

/* ------------------------------------------------------------------ */

type Responder = { id: string; trigger: string; payload: string; match: string };

export function ListDemos() {
  const [rows, setRows] = useState<Responder[]>([
    { id: "1", trigger: "how do I verify", payload: "Head to #verify and press the button.", match: "contains" },
    { id: "2", trigger: "supercalifragilisticexpialidocious_trigger_without_any_spaces_at_all", payload: "Long triggers wrap instead of pushing the delete button out of the card.", match: "contains" },
    { id: "3", trigger: "rules", payload: "Read #rules before chatting!", match: "exact" },
    {
      id: "4",
      trigger: "appeal",
      payload: "https://discord.com/channels/1184703029243416757/1201234567890123456/1298765432109876543?appeal=true&source=automod",
      match: "contains",
    },
  ]);
  return (
    <DsBlock title="ResponsiveList (table ≥ md, cards on phones)">
      <ResponsiveList
        caption="Auto-responders"
        rows={rows}
        getRowKey={(r) => r.id}
        columns={[
          { key: "trigger", header: "Trigger", primary: true, cell: (r) => <span className="type-code-sm">{r.trigger}</span> },
          { key: "payload", header: "Reply", cell: (r) => r.payload },
          { key: "match", header: "Match", cell: (r) => <Badge size="sm">{r.match}</Badge> },
          {
            key: "actions",
            header: "Actions",
            actions: true,
            cell: (r) => (
              <IconButton label={`Delete responder “${r.trigger}”`} variant="destructive-ghost" size="icon-sm" onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}>
                <Trash2 />
              </IconButton>
            ),
          },
        ]}
        empty={<p className="type-small text-fg-tertiary">All rows deleted — reload to reset.</p>}
      />
    </DsBlock>
  );
}

/* ------------------------------------------------------------------ */

type SecurityConfig = {
  enabled: boolean;
  punishment: string;
  ban: number;
  kick: number;
  dm: boolean;
  age: number;
  logChannel: string;
  pingStaff: boolean;
  notify: string[];
};
const INITIAL: SecurityConfig = {
  enabled: true,
  punishment: "ban",
  ban: 3,
  kick: 5,
  dm: true,
  age: 7,
  logChannel: "1201234567890123456",
  pingStaff: false,
  notify: ["held"],
};

export function SettingsDemo() {
  const [saved, setSaved] = useState<SecurityConfig>(INITIAL);
  const [draft, setDraft] = useState<SecurityConfig>(INITIAL);
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
  const set = <K extends keyof SecurityConfig>(key: K, value: SecurityConfig[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(draft);
      toast.success("Settings saved");
    }, 900);
  };

  return (
    <div>
      {/* Sections stack with gap-6; the SaveBar sits AFTER the stack (0 px when hidden). */}
      <div className="flex flex-col gap-6">
        <SettingsSection
          icon={ShieldCheck}
          title="Anti-nuke"
          description="Stops rogue admins and compromised accounts from mass-banning, kicking or deleting channels."
          action={
            <div className="flex items-center gap-3">
              <Badge tone={draft.enabled ? "success" : "neutral"} dot>
                {draft.enabled ? "On" : "Off"}
              </Badge>
              <Switch checked={draft.enabled} onCheckedChange={(v) => set("enabled", v)} aria-label="Enable anti-nuke" />
            </div>
          }
          disabled={!draft.enabled || saving}
          disabledHint={!draft.enabled ? "Turn on anti-nuke to edit its thresholds." : undefined}
        >
          <SettingRow
            label="Punishment"
            description="What happens to someone who crosses a threshold."
            control={<Select items={PUNISHMENTS} value={draft.punishment} onValueChange={(v) => set("punishment", v)} />}
          />
          <SettingRow
            label="Ban threshold"
            hideLabel
            control={<Slider label="Ban threshold" value={draft.ban} onValueChange={(v) => set("ban", v as number)} min={1} max={20} unit="per minute" />}
          />
          <SettingRow
            label="Kick threshold"
            hideLabel
            control={<Slider label="Kick threshold" value={draft.kick} onValueChange={(v) => set("kick", v as number)} min={1} max={20} unit="per minute" />}
          />
        </SettingsSection>

        <SettingsSection icon={UserCheck} title="Join gate" description="Screen new members before they can see your server.">
          <SettingRow
            label="DM members on join"
            description="Send the verification instructions privately."
            control={<Switch checked={draft.dm} onCheckedChange={(v) => set("dm", v)} />}
          />
          <SettingRow
            label="Ping staff on hold"
            description="Mention the moderator role when an account is held at the gate."
            control={<Checkbox checked={draft.pingStaff} onCheckedChange={(v) => set("pingStaff", v)} />}
          />
          <SettingRow
            label="Log channel"
            description="Where held and verified members are logged. Stacks under the label on phones."
            control={
              <IdInput kind="channel" value={draft.logChannel} onValueChange={(v) => set("logChannel", v)} />
            }
          />
          <SettingRow
            label="Notify staff about"
            description="Stacked control: a CheckboxGroup labelled by the row."
            layout="stacked"
            control={
              <CheckboxGroup value={draft.notify} onValueChange={(v) => set("notify", v)}>
                <CheckboxOption value="held" label="Held members" />
                <CheckboxOption value="raids" label="Blocked raids" description="Five or more joins within ten seconds." />
              </CheckboxGroup>
            }
          />
          <SettingRow
            label="Minimum account age"
            description="Accounts younger than this many days are held. 0 = off."
            control={<NumberField value={draft.age} onValueChange={(v) => set("age", v ?? 0)} min={0} max={365} unit="days" />}
          />
        </SettingsSection>

        <SettingsSection icon={Trash2} tone="danger" title="Danger zone" description="Reset every security setting to Pleed's defaults.">
          <SettingRow
            label="Reset configuration"
            description="This can't be undone."
            control={
              <Button variant="destructive" size="sm">
                Reset to defaults
              </Button>
            }
          />
        </SettingsSection>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setDraft(saved)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CodeDemos() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DsBlock title="CodeBlock">
        <CodeBlock
          title="Set up anti-nuke"
          prompt="›"
          code={"!antinuke enable\n!antinuke admin @Owner\n!antinuke ban on --threshold 3 --do ban --log #security --notify @Moderators"}
        />
        <CodeBlock code={"!prefix ?\n?help antinuke"} />
      </DsBlock>
      <DsBlock title="CommandChip & CopyButton">
        <div className="flex flex-wrap items-center gap-2.5">
          <CommandChip command="!setup" />
          <CommandChip command="!antinuke enable" />
          <CommandChip command="!voicemaster setup" />
          <CommandChip command="!help" size="sm" />
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-1 p-3">
          <Terminal aria-hidden="true" className="size-4 text-fg-tertiary" />
          <code className="flex-1 truncate type-code-sm text-fg">!ban @user [reason]</code>
          <CopyButton value="!ban @user [reason]" label="Copy usage" />
        </div>
        <div className="flex items-center gap-2 type-caption text-fg-tertiary">
          <X aria-hidden="true" className="size-3.5" /> Don&apos;t show owner-only commands (eval, shell, git…) anywhere public.
        </div>
      </DsBlock>
    </div>
  );
}
