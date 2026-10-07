import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn, isExternalHref } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * Button — one component for every clickable action.
 * - `href` turns it into a link (next/link for internal paths, <a target=_blank
 *   rel="noopener noreferrer"> for http(s) URLs, with an sr-only hint).
 * - Heights: sm 32 · md 40 · lg 48 px on mouse; md/lg grow to 44/48 on touch
 *   screens and sm/icon-sm get an invisible 44 px hit area.
 * - `loading` keeps the width stable, shows a spinner, sets aria-busy and
 *   ignores activation — but keeps keyboard focus (aria-disabled, never the
 *   native `disabled`, which would blur the button).
 * - `aria-disabled` = focusable but inert: exactly like `loading` without the
 *   spinner. Clicks, Enter and Space do nothing, a submit button can't submit
 *   and a link doesn't navigate — no need to also drop `onClick`.
 * - `data-variant` mirrors the variant, so behaviour can tell a destructive
 *   button apart (the SaveBar never returns focus to one).
 */
export const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap select-none",
    "border border-transparent transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-150 ease-standard",
    "focus-visible:focus-ring active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-fg-on-brand inset-shadow-highlight-strong hover:bg-brand-hover hover:shadow-glow active:bg-brand-active",
        secondary:
          "border-line-strong bg-surface-2 text-fg inset-shadow-highlight hover:border-line-hover hover:bg-surface-3 active:bg-surface-4",
        // Transparent variants use white-alpha overlays so hover/press read on every surface.
        outline:
          "border-line-strong bg-transparent text-fg hover:border-line-hover hover:bg-hover active:bg-pressed",
        ghost: "bg-transparent text-fg-secondary hover:bg-hover hover:text-fg active:bg-pressed",
        destructive:
          "bg-danger-strong text-danger-strong-fg inset-shadow-highlight-strong hover:bg-danger-strong-hover active:brightness-95",
        "destructive-ghost":
          "bg-transparent text-fg-tertiary hover:bg-danger-subtle hover:text-danger-fg active:bg-danger-border",
        discord:
          "bg-discord text-discord-fg inset-shadow-highlight-strong hover:bg-discord-hover active:bg-discord-active",
        link: "h-auto! px-0! pointer-coarse:min-h-11 text-brand-fg underline-offset-4 decoration-brand-fg/40 hover:underline hover:text-brand-100 active:translate-y-0",
      },
      size: {
        sm: "h-8 gap-1.5 rounded-md px-3 text-sm pointer-coarse:h-11 [&_svg:not([class*='size-'])]:size-4",
        md: "h-10 rounded-lg px-4 text-sm pointer-coarse:h-11 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 rounded-xl px-6 text-base [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "size-8 rounded-md pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10 rounded-lg pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-4.5",
        "icon-lg": "size-12 rounded-xl [&_svg:not([class*='size-'])]:size-5",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type SharedProps = ButtonVariantProps & {
  className?: string;
  children?: ReactNode;
  /** Shows a spinner and sets aria-busy; clicks are ignored but the button keeps focus. */
  loading?: boolean;
};

/** `aria-disabled` (true / "true") makes a Button inert while it stays focusable. */
function isAriaDisabled(value: unknown): boolean {
  return value === true || value === "true";
}

export type ButtonAsButton = SharedProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
  };

export type ButtonAsLink = SharedProps &
  Omit<ComponentProps<"a">, "className" | "children" | "href"> & {
    href: string;
    /** Force external behaviour (auto-detected for http(s) URLs). */
    external?: boolean;
    /** next/link prefetch (internal links only). */
    prefetch?: boolean | null;
    replace?: boolean;
    scroll?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function ButtonInner({ loading, children }: { loading?: boolean; children?: ReactNode }) {
  if (!loading) return <>{children}</>;
  return (
    <>
      <span className="inline-flex items-center [gap:inherit] opacity-0">{children}</span>
      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <Spinner size="sm" />
      </span>
    </>
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const {
      className,
      variant,
      size,
      fullWidth,
      loading,
      children,
      href,
      external,
      prefetch,
      replace,
      scroll,
      ...rest
    } = props;
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);
    const isExternal = external ?? isExternalHref(href);
    if (loading || isAriaDisabled(rest["aria-disabled"])) {
      // Inert link: no href, so neither a click nor Enter navigates (and no client handler is
      // needed, so this stays server-safe). It keeps its place in the tab order and is
      // announced as a disabled link.
      const inertRest = { ...rest };
      delete inertRest.onClick;
      delete inertRest.target;
      delete inertRest.rel;
      return (
        <a
          {...inertRest}
          role="link"
          tabIndex={inertRest.tabIndex ?? 0}
          aria-disabled={true}
          aria-busy={loading || undefined}
          data-slot="button"
          data-variant={variant ?? "primary"}
          className={cn(classes, loading && "aria-disabled:opacity-100")}
        >
          <ButtonInner loading={loading}>{children}</ButtonInner>
        </a>
      );
    }
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-slot="button"
          data-variant={variant ?? "primary"}
          className={classes}
          {...rest}
        >
          <ButtonInner loading={loading}>{children}</ButtonInner>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    return (
      <Link
        href={href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        data-slot="button"
        data-variant={variant ?? "primary"}
        className={classes}
        {...rest}
      >
        <ButtonInner loading={loading}>{children}</ButtonInner>
      </Link>
    );
  }

  const { className, variant, size, fullWidth, loading, children, type = "button", onClick, ...rest } = props;
  // Busy (`loading`) or `aria-disabled`: the button stays focusable (never the native
  // `disabled`, which would blur it and drop a keyboard user's focus to <body>), but clicks,
  // Enter and Space do nothing, and a submit button can't submit its form.
  const inert = loading || isAriaDisabled(rest["aria-disabled"]);
  return (
    <button
      {...rest}
      type={inert && type === "submit" ? "button" : type}
      data-slot="button"
      data-variant={variant ?? "primary"}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={inert ? undefined : onClick}
      className={cn(buttonVariants({ variant, size, fullWidth }), loading && "aria-disabled:opacity-100", className)}
    >
      <ButtonInner loading={loading}>{children}</ButtonInner>
    </button>
  );
}

type IconButtonOwnProps = {
  /** Required accessible name (icon-only buttons have no visible text). */
  label: string;
  size?: "icon-sm" | "icon" | "icon-lg";
  children: ReactNode;
};

export type IconButtonProps =
  | (Omit<ButtonAsButton, "size" | "children" | "aria-label"> & IconButtonOwnProps)
  | (Omit<ButtonAsLink, "size" | "children" | "aria-label"> & IconButtonOwnProps);

/** Square icon-only button. `label` becomes aria-label (and the tooltip text if you wrap it). */
export function IconButton({ label, size = "icon", variant = "ghost", children, ...rest }: IconButtonProps) {
  return (
    <Button {...(rest as ButtonProps)} variant={variant} size={size} aria-label={label}>
      {children}
    </Button>
  );
}
