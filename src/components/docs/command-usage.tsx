import { cn } from "@/lib/utils";

/** Tokens up to this length never break inside (like CodeBlock): "--threshold", "<user_or_role>". */
const UNBREAKABLE = 24;

type TokenKind = "command" | "required" | "optional" | "literal";

const TOKEN_CLASS: Record<TokenKind, string> = {
  command: "text-fg",
  required: "text-brand-fg",
  optional: "text-fg-tertiary",
  literal: "text-fg-secondary",
};

/** "!antinuke ban [status] <args>" → command, command, optional, required. */
function tokenize(usage: string): { text: string; kind: TokenKind }[] {
  const tokens: { text: string; kind: TokenKind }[] = [];
  let inArgs = false;
  for (const text of usage.trim().split(/\s+/)) {
    let kind: TokenKind = "command";
    if (text.startsWith("<")) kind = "required";
    else if (text.startsWith("[")) kind = "optional";
    else if (inArgs) kind = "literal";
    if (kind !== "command") inArgs = true;
    tokens.push({ text, kind });
  }
  return tokens;
}

/**
 * A usage line with its parts told apart: the command in full contrast,
 * `<required>` arguments in brand, `[optional]` ones dimmed (still ≥ 6:1).
 * Wraps between tokens, never inside a short one. Put it in a mono
 * context (type-code-sm). Server Component.
 */
export function CommandUsage({ usage, className }: { usage: string; className?: string }) {
  const tokens = tokenize(usage);
  return (
    <span className={className}>
      {tokens.map((token, index) => (
        <span key={index}>
          <span className={cn(TOKEN_CLASS[token.kind], token.text.length <= UNBREAKABLE && "whitespace-nowrap")}>
            {token.text}
          </span>
          {index < tokens.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
