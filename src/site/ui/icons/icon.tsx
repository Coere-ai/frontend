import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Rendered size in pixels. Icons are square. */
  size?: number;
};

/**
 * The frame every icon shares: a 24 unit grid, a 1.6 stroke in the current
 * color and round joins, so the whole set reads as one family. Icons are
 * decorative by default; pass aria-label to make one speak.
 */
export function Icon({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  const labelled = Boolean(props["aria-label"]);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
