/*
 * Shared by the page and its loading skeleton, so the skeleton has the final
 * layout's shape at every width (no jump when the responders arrive).
 */

/**
 * The page body: the composer, then the list. One column at every width —
 * the composer's own grid puts its live preview beside the fields once the
 * card is wide enough, and the list is a full-width table from 1024 px.
 */
export const RESPONDERS_STACK = "flex min-w-0 flex-col gap-8";

/**
 * Inside the composer card (an `@container`). Narrow (phones, portrait
 * tablets): fields → preview → button. From 42rem of the card's own width:
 * fields and button on the left, the live preview beside them, so every
 * keystroke shows up next to the field. From 64rem the field column stops at
 * 30rem (a comfortable line for a trigger and a reply); the preview takes the rest.
 */
export const COMPOSER_GRID =
  "grid grid-cols-1 gap-6 @2xl:grid-cols-2 @2xl:gap-x-8 @5xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] @5xl:gap-x-10";

/** Grid placement of the composer's three parts (see COMPOSER_GRID). */
export const COMPOSER_PREVIEW = "@2xl:col-start-2 @2xl:row-span-2 @2xl:row-start-1";
export const COMPOSER_FOOTER = "@2xl:col-start-1";
