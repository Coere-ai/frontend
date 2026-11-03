"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The panel's sections, drawn like its Segmented switch so the nav reads as
 * part of the same page. A client component only because a server component
 * cannot read the path; the links themselves are plain anchors.
 */
export const ADMIN_SECTIONS = [
  { href: "/admin", label: "Statistics" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/database", label: "Database" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/cost", label: "Cost" },
] as const;

/** /admin is only its own page; every other section also owns the pages under it. */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="overflow-x-auto">
      <ul className="flex w-max overflow-hidden rounded-md border" style={{ borderColor: "var(--color-border)" }}>
        {ADMIN_SECTIONS.map((s) => {
          const on = isActive(s.href, pathname);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={on ? "page" : undefined}
                className="block px-3 py-1.5 text-[12px] transition-colors hover:bg-[color:var(--color-canvas-soft)]"
                style={on ? { background: "var(--color-accent)", color: "var(--color-on-ink)" } : { color: "var(--color-ink)" }}
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
