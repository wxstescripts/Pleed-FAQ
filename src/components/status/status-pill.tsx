import { CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { STATUS_META, type ServiceStatus, type Tone } from "./model";

/**
 * The status pill at the end of every row. Colour is never the only signal:
 * each pill carries its word (Operational, Unreachable…) next to the dot.
 * Server-safe; the client rows import it too.
 */
export function StatusPill({ status, className }: { status: ServiceStatus; className?: string }) {
  const { label, tone } = STATUS_META[status];

  if (status === "checking") {
    return (
      <Badge tone="neutral" className={className}>
        <Spinner size="xs" />
        {label}
      </Badge>
    );
  }

  if (status === "not_monitored") {
    return (
      <Badge tone="outline" className={className}>
        <CircleDashed aria-hidden="true" className="size-3" />
        {label}
      </Badge>
    );
  }

  return <TonePill tone={tone} label={label} className={className} />;
}

/** A pill with an explicit word and tone (Discord's page-wide indicator). */
export function TonePill({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  return (
    <Badge tone={tone} dot className={className}>
      {label}
    </Badge>
  );
}
