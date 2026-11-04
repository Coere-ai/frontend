import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
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

const pillSizes: Record<PillSize, { pill: string; inset: string; circle: string; arrow: number }> = {
  md: { pill: "h-11 gap-2.5 pr-1.5 text-[15px]", inset: "pl-5", circle: "h-8 w-8", arrow: 15 },
  lg: { pill: "h-14 gap-3 pr-2 text-[16px]", inset: "pl-6", circle: "h-10 w-10", arrow: 18 },
};

/** The pill's classes and its insides, shared by the link and the button. */
function circleArrowParts({ tone, size, icon, wide, className, children }: { tone: PillTone; size: PillSize; icon?: ReactNode; wide: boolean; className: string; children: ReactNode }) {
  const look = pillTones[tone];
  const fit = pillSizes[size];
  return {
    className: `group inline-flex items-center rounded-full font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${look.pill} ${fit.pill} ${wide ? "w-full pl-1.5" : fit.inset} ${className}`,
    inside: (
      <>
        {/* Wide: an empty circle's width on the left keeps the label in the middle. */}
        {wide ? <span aria-hidden="true" className={`shrink-0 ${fit.circle}`} /> : null}
        <span className={`inline-flex items-center gap-2.5 ${wide ? "flex-1 justify-center" : ""}`}>
          {icon}
          {children}
        </span>
        <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full ${look.circle} ${fit.circle}`}>
          <ArrowRightIcon size={fit.arrow} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </>
    ),
  };
}

/**
 * A pill with its label and, inside on the right, a round circle holding an
 * arrow that nudges right on hover. Dark is a black pill with a white
 * circle; light is the reverse, for dark artwork. An optional mark sits
 * before the label. Wide fills its row with the label centered, the way
 * full width buttons sit in the mobile menu.
 */
export function CircleArrowLink({
  href,
  tone = "dark",
  size = "md",
  icon,
  wide = false,
  className = "",
  onClick,
  children,
}: {
  href: string;
  tone?: PillTone;
  size?: PillSize;
  icon?: ReactNode;
  wide?: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const parts = circleArrowParts({ tone, size, icon, wide, className, children });
  return (
    <Link href={href} onClick={onClick} className={parts.className}>
      {parts.inside}
    </Link>
  );
}

/** The same pill as a real button, for something that happens in place, like opening a form. */
export function CircleArrowButton({
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
  const parts = circleArrowParts({ tone, size, icon, wide, className, children });
  return (
    <button type="button" {...rest} className={`${parts.className} cursor-pointer disabled:cursor-default disabled:opacity-60`}>
      {parts.inside}
    </button>
  );
}
