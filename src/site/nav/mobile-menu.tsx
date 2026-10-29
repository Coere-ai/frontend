"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { industries } from "@/site/content/industries";
import { contactHref, navTabs, type NavTabId } from "@/site/content/navigation";
import { posts } from "@/site/content/posts";
import { products } from "@/site/content/products";
import { ButtonLink } from "@/site/ui/button";
import { ChevronDownIcon } from "@/site/ui/icons/interface-icons";

type Item = { href: string; label: string };

/** The links each tab shows on small screens, where there is no room for the full menus. */
const items: Record<NavTabId, Item[]> = {
  products: products.map((p) => ({ href: `/products/${p.slug}`, label: p.name })),
  industries: [{ href: "/industries", label: "All industries" }, ...industries.slice(0, 6).map((i) => ({ href: `/industries#${i.slug}`, label: i.name }))],
  resources: [
    { href: "/#demo", label: "Product demo" },
    { href: "/resources#films", label: "Feature films" },
    { href: "/resources#privacy", label: "Privacy" },
    { href: "/resources#faq", label: "Questions" },
  ],
  blog: [{ href: "/blog", label: "All posts" }, ...posts.slice(0, 3).map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))],
  about: [
    { href: "/about", label: "Our story" },
    { href: "/about#team", label: "Team" },
  ],
  careers: [{ href: "/careers", label: "Open roles" }],
};

/**
 * The full screen menu below lg. Each tab folds open to its links. While it
 * is open the page behind it doesn't scroll.
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
          className="fixed inset-x-0 top-[73px] bottom-0 overflow-y-auto bg-white lg:hidden"
        >
          <nav aria-label="Mobile" className="px-6 pt-2 pb-10">
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
            <ButtonLink href={contactHref} className="mt-8 w-full">
              Talk to Us
            </ButtonLink>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
