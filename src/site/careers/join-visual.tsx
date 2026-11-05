import Link from "next/link";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

/** The invitation to build Coere: one plain line, opening the job board or, from the About menu, an email to the team. */
export function JoinVisual({ className, href = "/careers", label = "Open careers" }: { className?: string; href?: string; label?: string }) {
  return (
    <Link href={href} className={`group flex min-h-[220px] flex-col justify-end border-t border-neutral-200 pt-7 ${className ?? ""}`}>
      <p className="max-w-md text-[24px] leading-tight font-medium tracking-[-0.02em] text-neutral-950 text-balance">Come join us in building the future of AI infrastructure.</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950">
        {label}
        <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
