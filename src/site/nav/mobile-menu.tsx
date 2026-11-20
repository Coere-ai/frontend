"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { industries } from "@/site/content/industries";
import { navTabs, type NavTabId } from "@/site/content/navigation";
import { posts } from "@/site/content/posts";
import { products } from "@/site/content/products";
import { startHref, startLabel } from "@/site/content/navigation";
import { ChevronDownIcon } from "@/site/ui/icons/interface-icons";
import { SoftLink } from "@/site/ui/soft-button";
import { AccountLink } from "./account-link";
import { LanguageMenu } from "./language-menu";

type Item = { href: string; label: string };

/** The links each tab shows on small screens, where there is no room for the full menus. */
const items: Record<NavTabId, Item[]> = {
  products: [...products.map((p) => ({ href: `/products/${p.slug}`, label: p.name })), { href: "/pricing", label: "Pricing" }],
  industries: [{ href: "/industries", label: "All industries" }, ...industries.slice(0, 6).map((i) => ({ href: `/industries/${i.slug}`, label: i.name }))],
  resources: [
    { href: "/resources", label: "Developer docs" },
    { href: "/resources/sdks", label: "SDKs" },
    { href: "/resources/mcp", label: "MCP" },
    { href: "/demo", label: "Product demo" },
  ],
  blog: [{ href: "/blog", label: "All posts" }, ...posts.slice(0, 3).map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))],
  about: [
    { href: "/about", label: "Our story" },
    { href: "/about#team", label: "Our team" },
    { href: "/blog", label: "Blog" },
  ],
  careers: [{ href: "/careers", label: "Open roles" }],
};

/**
 * The menu below lg: a white card under the glass bar, filling the rest of
 * the screen. Each tab folds open to its links, then come Start for free,
 * Log in and the language. While it is open the page behind it doesn't
 * scroll.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<NavTabId | null>("products");

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-3 top-[80px] bottom-3 overflow-y-auto rounded-[20px] border border-neutral-200/80 bg-white shadow-[0_30px_80px_-30px_rgba(20,17,15,0.35)] sm:inset-x-4 md:inset-x-6 lg:hidden"
        >
          <nav aria-label="Mobile" className="px-5 pt-1 pb-8">
            {navTabs.map((tab) => (
              <div key={tab.id} className="border-b border-neutral-100">
                <button
                  type="button"
                  aria-expanded={expanded === tab.id}
                  onClick={() => setExpanded(expanded === tab.id ? null : tab.id)}
                  className="flex w-full items-center justify-between py-4 text-left text-lg text-neutral-950"
                >
                  {tab.label}
                  <ChevronDownIcon size={18} className={`transition-transform ${expanded === tab.id ? "rotate-180" : ""}`} />
                </button>
                {expanded === tab.id ? (
                  <ul className="pb-4">
                    {items[tab.id].map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} onClick={onClose} className="block py-2 text-[15px] text-neutral-600">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            {/* The same Start for free as the navbar's; the menu closes as it opens, like the tabs above. */}
            <SoftLink href={startHref} size="lg" onClick={onClose} className="mt-8 w-full">
              {startLabel}
            </SoftLink>
            <div className="mt-3 flex flex-col gap-3">
              <AccountLink variant="panel" onNavigate={onClose} />
            </div>
            <div className="mt-6 flex justify-center">
              <LanguageMenu />
            </div>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
