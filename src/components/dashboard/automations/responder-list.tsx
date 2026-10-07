"use client";

import { Eye, MessageSquareReply, Trash2 } from "lucide-react";
import { useRef, useState, type ReactNode, type RefObject } from "react";

import { deleteAutomation, type Automation } from "@/lib/api";
import { usePleedMutation } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { AlertDialog, AlertDialogClose, AlertDialogContent, Dialog, DialogContent } from "@/components/ui/dialog";
import { ResponsiveList, type ResponsiveColumn } from "@/components/ui/responsive-list";
import { EmptyState } from "@/components/ui/states";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

import { formatCount, matchTypeLabel, shortTrigger } from "./format";
import { ResponderPreview } from "./responder-preview";

export type ResponderListProps = {
  responders: readonly Automation[];
  /** Remove a deleted responder from the loaded list (the API confirmed it). */
  onDeleted: (id: Automation["id"]) => void;
  /** Empty state: fill the composer with an example and focus it. */
  onUseExample: () => void;
  /** The section heading — focus lands here after a delete or a successful retry. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Shown above the list (e.g. "Couldn't refresh the list"). */
  notice?: ReactNode;
};

export function ResponderList({ responders, onDeleted, onUseExample, headingRef, notice }: ResponderListProps) {
  const remove = usePleedMutation(deleteAutomation);
  // Each dialog keeps its last row while it animates out, so `open` is separate.
  const [confirming, setConfirming] = useState<Automation | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewing, setViewing] = useState<Automation | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<Automation["id"] | null>(null);
  // Where focus goes when the confirmation closes: back to the row's button,
  // or — when that row is gone — to the list heading.
  const deletedRef = useRef(false);

  async function runDelete(target: Automation) {
    setDeletingId(target.id);
    const result = await remove.mutate(target.id);
    setDeletingId(null);
    const name = shortTrigger(target.trigger);
    if (result.ok) {
      deletedRef.current = true;
      onDeleted(target.id);
      toast.success("Responder deleted", { description: `Pleed no longer replies to “${name}”.` });
    } else {
      // The row stays; the toast offers the retry (nothing else is on screen to show the failure).
      toast.error(`Couldn't delete “${name}”`, {
        description: result.error.message,
        action: { label: "Retry", onClick: () => void runDelete(target) },
      });
    }
    return result.ok;
  }

  async function confirmDelete() {
    if (!confirming) return;
    await runDelete(confirming);
    setConfirmOpen(false);
  }

  const deleting = confirmOpen && confirming !== null && deletingId === confirming.id;
  const count = responders.length;

  const actions = (row: Automation) => (
    <div className="flex items-center gap-1">
      <Tooltip content="Preview reply">
        <IconButton label={`Preview the reply to “${shortTrigger(row.trigger)}”`} size="icon-sm" onClick={() => {
            setViewing(row);
            setViewOpen(true);
          }}>
          <Eye />
        </IconButton>
      </Tooltip>
      <Tooltip content="Delete">
        <IconButton
          label={`Delete the responder for “${shortTrigger(row.trigger)}”`}
          size="icon-sm"
          variant="destructive-ghost"
          loading={deletingId === row.id}
          onClick={() => {
            deletedRef.current = false;
            setConfirming(row);
            setConfirmOpen(true);
          }}
        >
          <Trash2 />
        </IconButton>
      </Tooltip>
    </div>
  );

  const columns: ResponsiveColumn<Automation>[] = [
    { key: "trigger", header: "Trigger", primary: true, width: "30%", cell: (row) => <TriggerText responder={row} /> },
    {
      key: "reply",
      header: "Reply",
      cell: (row) => <span className="line-clamp-2 whitespace-pre-line">{row.payload}</span>,
    },
    {
      key: "match",
      header: "Match",
      className: "w-px",
      cell: (row) => <Badge tone="neutral">{matchTypeLabel(row.match_type)}</Badge>,
    },
    { key: "actions", header: "Actions", actions: true, cell: actions },
  ];

  return (
    <section aria-labelledby="responders-heading" className="flex min-w-0 flex-col gap-4">
      <div className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1">
        <h2
          id="responders-heading"
          ref={headingRef}
          tabIndex={-1}
          className="rounded-sm type-h4 text-fg outline-none focus-visible:focus-ring"
        >
          Your responders
        </h2>
        <Badge tone="neutral" aria-hidden="true" className="tabular-nums">
          {formatCount(count)}
        </Badge>
        <span className="sr-only">
          {count === 1 ? "1 responder" : `${formatCount(count)} responders`}
        </span>
      </div>

      {notice}

      {count === 0 ? (
        <EmptyState
          icon={MessageSquareReply}
          title="No auto-responders yet"
          description="Answer the questions your members keep asking. Write your first one in the form, or start from the example in its preview."
          actions={
            <Button variant="secondary" onClick={onUseExample}>
              Use the example
            </Button>
          }
        />
      ) : (
        <>
          {/* ≥ 1024 px: a table. Below: cards (see ResponderCards). */}
          <ResponsiveList
            className="hidden lg:block"
            caption="Auto-responders"
            rows={responders as Automation[]}
            getRowKey={(row) => String(row.id)}
            columns={columns}
          />
          <ResponderCards responders={responders} actions={actions} className="lg:hidden" />
        </>
      )}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        {viewing ? (
          <DialogContent
            size="lg"
            title="Reply preview"
            description={
              <>
                How Pleed answers a message that contains{" "}
                <span className="wrap-anywhere text-fg">“{shortTrigger(viewing.trigger, 80)}”</span>.
              </>
            }
          >
            <ResponderPreview trigger={viewing.trigger} reply={viewing.payload} />
          </DialogContent>
        ) : null}
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          // Stay open while the request runs (Escape is ignored until it settles).
          if (!open && !deleting) setConfirmOpen(false);
        }}
      >
        {confirming ? (
          <AlertDialogContent
            title="Delete this responder?"
            description={
              <>
                Pleed will stop replying to messages that contain{" "}
                <span className="wrap-anywhere text-fg">“{shortTrigger(confirming.trigger, 80)}”</span>. This can&apos;t be
                undone.
              </>
            }
            finalFocus={() => (deletedRef.current ? headingRef.current : true)}
            footer={
              <>
                <AlertDialogClose render={<Button variant="secondary" aria-disabled={deleting || undefined} />}>
                  Cancel
                </AlertDialogClose>
                <Button variant="destructive" loading={deleting} onClick={() => void confirmDelete()}>
                  <Trash2 aria-hidden="true" />
                  Delete responder
                </Button>
              </>
            }
          />
        ) : null}
      </AlertDialog>
    </section>
  );
}

function TriggerText({ responder }: { responder: Automation }) {
  const name = responder.name?.trim();
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="type-code-sm wrap-anywhere text-fg">{responder.trigger}</span>
      {name ? <span className="type-caption text-fg-tertiary">{name}</span> : null}
    </span>
  );
}

/**
 * Cards below 1024 px (phones and tablet portrait). Same anatomy as
 * ResponsiveList's cards — title row with the icon actions beside it, then
 * label/value details (label above the value on a narrow card, beside it from
 * 22rem) — but ResponsiveList switches to its table at 768 px, and on a
 * portrait tablet a four-column table squeezes the reply into a sliver.
 * TODO(design-system): replace with <ResponsiveList breakpoint="lg"> once the
 * kit has a breakpoint prop.
 */
function ResponderCards({
  responders,
  actions,
  className,
}: {
  responders: readonly Automation[];
  actions: (row: Automation) => ReactNode;
  className?: string;
}) {
  return (
    <ul aria-label="Auto-responders" className={cn("flex flex-col gap-3", className)}>
      {responders.map((row) => (
        <li key={row.id} className="min-w-0 rounded-xl border border-line bg-surface-1 p-4 inset-shadow-highlight">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 type-label text-fg">
              <TriggerText responder={row} />
            </div>
            <div className="-my-1.5 -mr-1.5 flex shrink-0 items-center pointer-coarse:-my-3 pointer-coarse:-mr-3">
              {actions(row)}
            </div>
          </div>
          <dl className="@container mt-3 grid gap-2.5">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5 @min-[22rem]:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] @min-[22rem]:gap-3">
              <dt className="type-caption text-fg-tertiary">Reply</dt>
              <dd className="line-clamp-4 min-w-0 type-small whitespace-pre-line wrap-anywhere text-fg-secondary">
                {row.payload}
              </dd>
            </div>
            {/* A one-word badge: always beside its label, even on a narrow card. */}
            <div className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-center gap-3">
              <dt className="type-caption text-fg-tertiary">Match</dt>
              <dd className="min-w-0">
                <Badge tone="neutral">{matchTypeLabel(row.match_type)}</Badge>
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
