"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docPages } from "@/site/content/docs";
import { Underlined } from "@/site/ui/underlined";

/** The list of docs pages. The page being read is underlined in black. */
export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Docs">
      <p className="text-[13px] font-medium text-neutral-500">Developer docs</p>
      <ul className="mt-4 space-y-1">
        {docPages.map((page) => {
          const href = page.slug === "overview" ? "/resources" : `/resources/${page.slug}`;
          const current = pathname === href;
          return (
            <li key={page.slug}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`group block py-1.5 text-[15px] ${current ? "text-neutral-950" : "text-neutral-600 hover:text-neutral-950"}`}
              >
                <Underlined on={current}>{page.title}</Underlined>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
