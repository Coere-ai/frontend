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

const pillTones: Record<PillTone, string> = {
  dark: "bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:outline-neutral-950",
  light: "bg-white text-neutral-950 hover:bg-neutral-100 focus-visible:outline-white",
};

const pillSizes: Record<PillSize, { pill: string; arrow: number }> = {
  md: { pill: "h-11 gap-2 px-5 text-[15px]", arrow: 15 },
  lg: { pill: "h-14 gap-2.5 px-6 text-[16px]", arrow: 18 },
};

/** The pill's classes and its insides, shared by the link and the button. The arrow sits bare after the label, with no circle around it. */
function circleArrowParts({ tone, size, icon, wide, className, children }: { tone: PillTone; size: PillSize; icon?: ReactNode; wide: boolean; className: string; children: ReactNode }) {
  const fit = pillSizes[size];
  return {
    className: `group inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${pillTones[tone]} ${fit.pill} ${wide ? "w-full" : ""} ${className}`,
    inside: (
      <>
        {icon}
        {children}
        <ArrowRightIcon size={fit.arrow} strokeWidth={2} aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      </>
    ),
  };
}

/**
 * A pill with its label and a bare arrow after it that nudges right on
 * hover. Dark is a black pill; light is a white one. An optional mark sits
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
