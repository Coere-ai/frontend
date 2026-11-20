import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The squarer buttons of the glass navbar and the home hero: solid Coere
 * blue for the main step, white with a line for the second, and clear glass
 * for the second on a dark hero. Their corners match the bar's soft square
 * rather than the site's pills.
 */
type Tone = "blue" | "outline" | "glass";
type Size = "md" | "lg";

const tones: Record<Tone, string> = {
  blue: "bg-brand-500 text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-8px_rgba(82,103,247,0.7)] hover:bg-brand-600",
  outline: "bg-white/90 text-neutral-950 ring-1 ring-neutral-950/15 hover:bg-white hover:ring-neutral-950/40",
  glass: "bg-white/[0.08] text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-white/[0.14] hover:ring-white/35",
};

const sizes: Record<Size, string> = {
  md: "h-10 gap-2 rounded-[11px] px-4 text-[14px]",
  lg: "h-[52px] gap-2.5 rounded-[14px] px-6 text-[16px]",
};

export function softButtonClass(tone: Tone = "blue", size: Size = "md", extra = ""): string {
  return `inline-flex items-center justify-center font-medium whitespace-nowrap transition-[background-color,box-shadow,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${tones[tone]} ${sizes[size]} ${extra}`;
}

export function SoftLink({ href, tone, size, className = "", onClick, children }: { href: string; tone?: Tone; size?: Size; className?: string; onClick?: () => void; children: ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className={softButtonClass(tone, size, className)}>
      {children}
    </Link>
  );
}

export function SoftButton({ tone, size, className = "", children, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { tone?: Tone; size?: Size; className?: string; children: ReactNode }) {
  return (
    <button type="button" {...rest} className={`${softButtonClass(tone, size, className)} cursor-pointer`}>
      {children}
    </button>
  );
}
