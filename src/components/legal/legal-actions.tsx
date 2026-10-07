"use client";

import { ArrowUp, Check, Link2, Printer } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { cn } from "@/lib/utils";
import { Button, IconButton, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

/*
 * The client islands of the legal pages. Everything around them (the
 * document, its sections, the tables of contents' markup) is server
 * rendered; only these buttons and the scroll-spy ship JavaScript.
 */

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Insecure contexts / older browsers.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** "Print" — legal pages have print styles (only the document is printed). */
export function PrintButton({ className }: { className?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className={cn("print:hidden", className)}>
      <Printer aria-hidden="true" />
      Print
    </Button>
  );
}

/**
 * Copies a link to a section (`/privacy#data-removal`) and confirms with a
 * check mark and a toast. On mouse devices it appears while the heading row
 * is hovered (and whenever it has keyboard focus); on touch it is always
 * shown, quietly, because there is no hover.
 */
export function CopySectionLink({ id, title, className }: { id: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = async () => {
    const url = new URL(window.location.href);
    url.hash = id;
    if (await copyText(url.toString())) {
      setCopied(true);
      toast.success("Link copied", { description: title });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Couldn't copy the link", {
        description: "Your browser blocked clipboard access. Copy the address from the address bar instead.",
      });
    }
  };

  return (
    <Tooltip content={copied ? "Copied" : "Copy link to this section"}>
      <IconButton
        label={`Copy link to “${title}”`}
        size="icon-sm"
        onClick={onClick}
        data-copied={copied || undefined}
        className={cn(
          "text-fg-tertiary transition-[opacity,background-color,color] duration-150 ease-standard print:hidden",
          // Mouse: revealed by hovering the heading row, by focus, or while confirming.
          "pointer-fine:opacity-0 pointer-fine:group-hover/heading:opacity-100 pointer-fine:focus-visible:opacity-100 pointer-fine:data-copied:opacity-100",
          className,
        )}
      >
        {copied ? <Check aria-hidden="true" className="text-success-fg" /> : <Link2 aria-hidden="true" />}
      </IconButton>
    </Tooltip>
  );
}

/**
 * "Back to top". A real link to `#top` (the HTML spec scrolls to the top of
 * the document for it, so it works before hydration); enhanced to scroll
 * smoothly — instantly under reduced motion — and to move keyboard focus to
 * the start of the content, so the next Tab doesn't continue from the
 * bottom of the page.
 */
export function BackToTopLink({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "outline";
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    document.getElementById("main")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  return (
    <a
      href="#top"
      onClick={onClick}
      className={cn(buttonVariants({ variant, size: "sm" }), "justify-start print:hidden", className)}
    >
      <ArrowUp aria-hidden="true" />
      Back to top
    </a>
  );
}
