import Link from "next/link";
import { ChevronDownIcon } from "@/site/ui/icons/interface-icons";

/**
 * One navbar tab: its label and a small chevron on a soft square that
 * lights on hover and stays lit while the tab's menu is open. Clicking goes
 * to the tab's page; hovering or focusing opens its menu.
 */
export function NavTab({
  label,
  href,
  active,
  onOpen,
}: {
  label: string;
  href: string;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      aria-expanded={active}
      aria-controls="site-menu"
      className={`group flex h-10 items-center gap-1 rounded-[10px] px-3 text-[14px] font-medium text-neutral-800 transition-colors hover:bg-neutral-950/[0.05] hover:text-neutral-950 group-data-[tone=dark]/nav:text-white/85 group-data-[tone=dark]/nav:hover:bg-white/10 group-data-[tone=dark]/nav:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        active ? "bg-neutral-950/[0.05] text-neutral-950 group-data-[tone=dark]/nav:bg-white/10 group-data-[tone=dark]/nav:text-white" : ""
      }`}
    >
      {label}
      <ChevronDownIcon size={14} className={`text-neutral-500 transition-transform group-data-[tone=dark]/nav:text-white/60 duration-300 ${active ? "rotate-180" : ""}`} />
    </Link>
  );
}
