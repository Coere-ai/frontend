import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRightIcon } from "./icons/interface-icons";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";

/** Each look on a dark page (see DarkPage): Coere blue for the main step, dark glass with a fine light edge for the second. */
const variants: Record<Variant, string> = {
  primary: "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-brand-500 dark:shadow-[0_12px_30px_-12px_rgba(82,103,247,0.9)] dark:hover:bg-brand-600 dark:focus-visible:outline-white",
  secondary:
    "border border-neutral-200 bg-white text-neutral-950 hover:border-neutral-950 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10 dark:focus-visible:outline-white",
  ghost: "text-neutral-950 hover:bg-neutral-100 dark:text-white dark:hover:bg-white/10 dark:focus-visible:outline-white",
};

/** Class names for a button look, for the few places that need a real <button>. */
export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return `${base} ${variants[variant]} ${extra}`;
}

/**
 * A link that looks like a button. Internal paths use Next's Link; mailto and
 * outside addresses use a plain anchor.
 */
export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  const classes = buttonClass(variant, className);
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}

type PillTone = "dark" | "light";
type PillSize = "md" | "lg";

const pillTones: Record<PillTone, string> = {
  dark: "bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:outline-neutral-950 dark:bg-brand-500 dark:hover:bg-brand-600 dark:focus-visible:outline-white",
  light: "bg-white text-neutral-950 hover:bg-neutral-100 focus-visible:outline-white",
};

const pillSizes: Record<PillSize, { pill: string; inset: string; box: string; arrow: number }> = {
  md: { pill: "h-11 gap-2.5 pr-1.5 text-[15px]", inset: "pl-5", box: "h-8 w-8", arrow: 17 },
  lg: { pill: "h-14 gap-3 pr-2 text-[16px]", inset: "pl-6", box: "h-10 w-10", arrow: 20 },
};

/**
 * A pill with its label and a bare arrow on the right that nudges right on
 * hover, as a real button for something that happens in place, like opening
 * a form. Dark is a black pill (Coere blue on a dark page); light is white,
 * for dark artwork. An optional mark sits before the label. Wide fills its
 * row with the label centered, the way full width buttons sit in the
 * mobile menu.
 */
export function ArrowButton({
  tone = "dark",
  size = "md",
  icon,
  wide = false,
  className = "",
  children,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  tone?: PillTone;
  size?: PillSize;
  icon?: ReactNode;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const fit = pillSizes[size];
  return (
    <button
      type="button"
      {...rest}
      className={`group inline-flex cursor-pointer items-center rounded-full font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-60 ${pillTones[tone]} ${fit.pill} ${wide ? "w-full pl-1.5" : fit.inset} ${className}`}
    >
      {/* Wide: an empty box the arrow's width on the left keeps the label in the middle. */}
      {wide ? <span aria-hidden="true" className={`shrink-0 ${fit.box}`} /> : null}
      <span className={`inline-flex items-center gap-2.5 ${wide ? "flex-1 justify-center" : ""}`}>
        {icon}
        {children}
      </span>
      <span aria-hidden="true" className={`grid shrink-0 place-items-center ${fit.box}`}>
        <ArrowRightIcon size={fit.arrow} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
