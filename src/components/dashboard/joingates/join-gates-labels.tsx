import type { ReactNode } from "react";

/** "(optional)" after a row label; dims with the row when its section is off. */
export function Optional({ children }: { children: ReactNode }) {
  return (
    <>
      {children}{" "}
      <span className="font-normal text-fg-tertiary group-data-disabled/row:text-fg-disabled">(optional)</span>
    </>
  );
}

/** A NumberField's unit is visual only (aria-hidden), so the row label carries it for screen readers. */
export function WithUnit({ unit, children }: { unit: string; children: ReactNode }) {
  return (
    <>
      {children}
      <span className="sr-only">, {unit}</span>
    </>
  );
}
