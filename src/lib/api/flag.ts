import type { Flag } from "./types";

/** `1` → true, anything else → false. Use for switches bound to API flags. */
export function flagOn(value: Flag | number | null | undefined): boolean {
  return value === 1;
}

/** true → `1`, false → `0` (the API's on/off encoding). */
export function toFlag(on: boolean): Flag {
  return on ? 1 : 0;
}
