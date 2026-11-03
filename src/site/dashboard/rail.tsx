"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The dashboard's sections: a quiet list down the left on a wide screen,
 * a row that scrolls sideways on a phone. The current one is in the brand
 * blue.
 */

export const SECTIONS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/memory", label: "Memory" },
  { href: "/dashboard/chats", label: "Chats" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/organization", label: "Organization" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/account", label: "Account" },
] as const;

/** The overview is current only on its own path; every other section also on the paths under it. */
const isCurrent = (path: string, href: string) => (href === "/dashboard" ? path === href : path === href || path.startsWith(`${href}/`));

export function DashboardRail() {
  const path = usePathname();
  return (
    <nav aria-label="Dashboard" className="-mx-6 overflow-x-auto px-6 md:-mx-10 md:px-10 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-1.5 lg:flex-col lg:gap-1">
        {SECTIONS.map((s) => {
          const current = isCurrent(path, s.href);
          return (
            <li key={s.href} className="shrink-0">
              <Link
                href={s.href}
                aria-current={current ? "page" : undefined}
                className={`block rounded-full px-4 py-2 text-[15px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${
                  current ? "bg-brand-50 font-medium text-brand-600" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                }`}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
