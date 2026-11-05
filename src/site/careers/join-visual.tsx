import Link from "next/link";
import { backgrounds } from "@/site/content/backgrounds";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";
import { SizedPhoto } from "@/site/ui/sized-photo";

/** The invitation to build Coere: one line over Coere's artwork, opening the job board or, from the About menu, an email to the team. */
export function JoinVisual({ className, href = "/careers", label = "Open careers" }: { className?: string; href?: string; label?: string }) {
  return (
    <Link href={href} className={`group relative isolate flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl bg-neutral-950 p-7 ${className ?? ""}`}>
      <SizedPhoto src={backgrounds.tangle.src} alt="" fill sizes="700px" className="-z-10 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950/70 to-neutral-950/0" />
      <p className="max-w-md text-[24px] leading-tight font-medium tracking-[-0.02em] text-white text-balance">Come join us in building the future of AI infrastructure.</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-white">
        {label}
        <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
