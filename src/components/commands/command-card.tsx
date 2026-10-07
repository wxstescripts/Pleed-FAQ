import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/code-block";

import { Highlight, RichText, UsageLine, usagePrefix } from "./command-text";
import type { CatalogCommand } from "./types";

export type CommandCardProps = {
  command: CatalogCommand;
  categoryName: string;
  matcher: RegExp | null;
};

/**
 * One command: name with its real prefix, category, description (only when
 * the data has a real one) and every usage form with a copy button.
 * Static card — the copy buttons are the only interactive parts.
 */
export const CommandCard = memo(function CommandCard({ command, categoryName, matcher }: CommandCardProps) {
  const prefix = usagePrefix(command.forms[0]?.usage ?? "");
  return (
    <Card as="article" padding="sm" className="h-full gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 type-h4 text-fg">
          <span className="type-code wrap-anywhere">
            {prefix ? <span className="text-brand-fg">{prefix}</span> : null}
            <Highlight text={command.name} matcher={matcher} />
          </span>
        </h3>
        <Badge tone="outline" size="sm" className="mt-0.5">
          {categoryName}
        </Badge>
      </div>

      {command.description ? (
        <p className="type-small text-fg-secondary">
          <RichText text={command.description} matcher={matcher} />
        </p>
      ) : null}

      <div className="mt-auto flex flex-col rounded-lg border border-line-subtle bg-inset">
        <p className="sr-only">Usage</p>
        {command.forms.map((form) => (
          <div
            key={`${form.usage}\u0000${form.note ?? ""}`}
            className="flex items-start gap-2 border-line-subtle py-1.5 pr-1 pl-3 not-first:border-t pointer-coarse:pr-0.5"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1 py-1.5">
              <UsageLine usage={form.usage} matcher={matcher} />
              {form.note ? (
                <p className="type-caption text-fg-tertiary">
                  <RichText text={form.note} matcher={matcher} />
                </p>
              ) : null}
            </div>
            <CopyButton value={form.usage} label={`Copy ${form.usage}`} />
          </div>
        ))}
      </div>
    </Card>
  );
});
