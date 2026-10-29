import type { ReactNode } from "react";

/**
 * Text that underlines itself, the line growing from the middle out.
 *
 * By default it answers to the nearest `group` (a card or a link around
 * it); `self` makes it answer to its own hover instead. `on` holds the
 * line, for the picked item in a list. `big` is for titles: a heavier
 * line that stays in proportion to large text.
 */
export function Underlined({
  children,
  big = false,
  on = false,
  self = false,
  light = false,
  className,
}: {
  children: ReactNode;
  big?: boolean;
  on?: boolean;
  self?: boolean;
  light?: boolean;
  className?: string;
}) {
  const classes = ["u-line", big && "u-line-big", on && "u-on", self && "u-hover", light && "u-line-light", className].filter(Boolean).join(" ");
  return <span className={classes}>{children}</span>;
}
