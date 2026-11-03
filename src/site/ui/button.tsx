import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "./icons/interface-icons";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";

const variants: Record<Variant, string> = {
  primary: "bg-neutral-950 text-white hover:bg-neutral-800",
  secondary: "border border-neutral-200 bg-white text-neutral-950 hover:border-neutral-950",
  ghost: "text-neutral-950 hover:bg-neutral-100",
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

const pillTones: Record<PillTone, { pill: string; circle: string }> = {
  dark: { pill: "bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:outline-neutral-950", circle: "bg-white text-neutral-950" },
  light: { pill: "bg-white text-neutral-950 hover:bg-neutral-100 focus-visible:outline-white", circle: "bg-neutral-950 text-white" },
};

const pillSizes: Record<PillSize, { pill: string; circle: string; arrow: number }> = {
  md: { pill: "h-11 gap-2.5 pl-5 pr-1.5 text-[15px]", circle: "h-8 w-8", arrow: 15 },
  lg: { pill: "h-14 gap-3 pl-6 pr-2 text-[16px]", circle: "h-10 w-10", arrow: 18 },
};

/**
 * A pill with its label and, inside on the right, a round circle holding an
 * arrow that nudges right on hover. Dark is a black pill with a white
 * circle; light is the reverse, for dark artwork. An optional mark sits
 * before the label.
 */
export function CircleArrowLink({
  href,
  tone = "dark",
  size = "md",
  icon,
  className = "",
  onClick,
  children,
}: {
  href: string;
  tone?: PillTone;
  size?: PillSize;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const look = pillTones[tone];
  const fit = pillSizes[size];
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center justify-between rounded-full font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${look.pill} ${fit.pill} ${className}`}
    >
      <span className="inline-flex items-center gap-2.5">
        {icon}
        {children}
      </span>
      <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full ${look.circle} ${fit.circle}`}>
        <ArrowRightIcon size={fit.arrow} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
