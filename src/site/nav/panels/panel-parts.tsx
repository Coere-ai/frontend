import Link from "next/link";
import type { ReactNode } from "react";
import { hoverUnderline } from "@/site/ui/hover-underline";
import { ArrowRightIcon } from "@/site/ui/icons/interface-icons";

/** The small grey label that names a column in a menu. */
export function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-medium text-neutral-500">{children}</p>;
}

/** A menu row: a title and an optional line under it. Hover underlines the title. */
export function PanelLink({
  href,
  title,
  summary,
  icon,
}: {
  href: string;
  title: string;
  summary?: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 py-2.5 focus-visible:outline-none"
    >
      {icon ? (
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center text-neutral-950">
          {icon}
        </span>
      ) : null}
      <span>
        <span className={`block text-[15px] font-medium text-neutral-950 ${hoverUnderline}`}>{title}</span>
        {summary ? <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">{summary}</span> : null}
      </span>
    </Link>
  );
}

/** "Read more" style link at the foot of a menu column. */
export function PanelMore({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-950"
    >
      {children}
      <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
