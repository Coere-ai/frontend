import Image from "next/image";
import Link from "next/link";
import { contactHref } from "@/site/content/navigation";
import { PanelLabel, PanelLink } from "./panel-parts";
import { hoverUnderline } from "@/site/ui/hover-underline";

/** About menu: the company links, and a card that opens the story. */
export function AboutPanel() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12">
      <div>
        <PanelLabel>Company</PanelLabel>
        <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1">
          <li><PanelLink href="/about" title="Our story" summary="Why memory should belong to you." /></li>
          <li><PanelLink href="/about#team" title="Team" summary="The people building Coere." /></li>
          <li><PanelLink href="/careers" title="Careers" summary="Join the founding team." /></li>
          <li><PanelLink href={contactHref} title="Contact" summary="Talk to the founders." /></li>
        </ul>
      </div>
      <Link href="/about" className="group grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center gap-6 rounded-2xl bg-neutral-50 p-4">
        <div className="overflow-hidden rounded-xl">
          <Image src="/preview/images/catalyst.webp" alt="" width={754} height={421} unoptimized className="aspect-[754/421] w-full object-cover" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-neutral-500">Our story</p>
          <p className={`mt-1 text-xl font-medium tracking-[-0.02em] text-neutral-950 ${hoverUnderline}`}>AI split you into pieces. We put you back together.</p>
        </div>
      </Link>
    </div>
  );
}
