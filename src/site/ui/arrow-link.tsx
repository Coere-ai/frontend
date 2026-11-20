import Link from "@/site/i18n/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "./icons/interface-icons";

/** "Learn more" style link: words and an arrow that nudges right on hover. White on a dark page. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-[15px] font-medium dark:text-white ${className ?? "text-neutral-950"}`}>
      {children}
      <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
