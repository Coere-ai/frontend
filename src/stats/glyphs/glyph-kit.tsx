/** Props every mark takes. `| undefined` is explicit because the lookups
 *  forward whatever their caller passed, including nothing. */
export type GlyphProps = { size?: number | undefined; className?: string | undefined };

/** Every mark is a 24x24 viewBox, so they line up in a column without
 *  per-icon nudging. */
export const box = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
});

/** Line marks, not brand marks, for things with no vendor: currentColor, a
 *  1.5 stroke and round joins. */
export const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The neutral fallback, so an unrecognised value still lines up in the
 *  column instead of leaving a gap. */
export function Unknown({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className} {...line}>
      <circle cx="12" cy="12" r="8.6" strokeDasharray="2.6 2.6" />
    </svg>
  );
}
