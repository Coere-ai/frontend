"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "@/site/i18n/link";
import { useEffect, useState } from "react";
import { industriesIn } from "@/site/content/industries";
import { navTabs, startHref, type NavTabId } from "@/site/content/navigation";
import { productsIn } from "@/site/content/products";
import { useMessages } from "@/site/i18n/client";
import type { Messages } from "@/site/i18n/messages/types";
import { ChevronDownIcon } from "@/site/ui/icons/interface-icons";
import { SoftLink } from "@/site/ui/soft-button";
import { AccountLink } from "./account-link";
import { LanguageMenu } from "./language-menu";
import type { NavPost } from "./nav-posts";

type Item = { href: string; label: string };

/** The links each tab shows on small screens, where there is no room for the full menus, in the page's language. */
const itemsIn = ({ chrome: { nav }, catalog }: Pick<Messages, "chrome" | "catalog">, posts: readonly NavPost[]): Record<NavTabId, Item[]> => ({
  products: [...productsIn(catalog).map((p) => ({ href: `/products/${p.slug}`, label: p.name })), { href: "/pricing", label: nav.pricing }],
  industries: [{ href: "/industries", label: nav.allIndustries }, ...industriesIn(catalog).slice(0, 6).map((i) => ({ href: `/industries/${i.slug}`, label: i.name }))],
  resources: [
    { href: "/resources", label: "Developer docs" },
    { href: "/resources/sdks", label: "SDKs" },
    { href: "/resources/mcp", label: "MCP" },
    { href: "/demo", label: "Product demo" },
  ],
  blog: [{ href: "/blog", label: "All posts" }, ...posts.slice(0, 3).map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))],
  about: [
    { href: "/about", label: nav.ourStory },
    { href: "/about#team", label: nav.ourTeam },
    { href: "/blog", label: nav.blog },
  ],
  careers: [{ href: "/careers", label: "Open roles" }],
});

/**
 * The menu below lg: a dark glass card under the glass bar, filling the rest of
 * the screen. Each tab folds open to its links, then come Start for free,
 * Log in and the language. While it is open the page behind it doesn't
 * scroll. `posts` are the newest posts the navbar was given.
 */
export function MobileMenu({ open, onClose, posts }: { open: boolean; onClose: () => void; posts: readonly NavPost[] }) {
  const [expanded, setExpanded] = useState<NavTabId | null>("products");
  const chrome = useMessages("chrome");
  const catalog = useMessages("catalog");
  const items = itemsIn({ chrome, catalog }, posts);
  const t = chrome.nav;

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
          // Marks the card dark for the language button inside it, whatever the bar's tone.
          data-tone="dark"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="group/nav fixed inset-x-3 top-[80px] bottom-3 overflow-y-auto rounded-[20px] border border-white/10 bg-[#12111b]/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:inset-x-4 md:inset-x-6 lg:hidden"
        >
          <nav aria-label={t.mobile} className="px-5 pt-1 pb-8">
            {navTabs.map((tab) => (
              <div key={tab.id} className="border-b border-white/10">
                <button
                  type="button"
                  aria-expanded={expanded === tab.id}
                  onClick={() => setExpanded(expanded === tab.id ? null : tab.id)}
                  className="flex w-full items-center justify-between py-4 text-left text-lg text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  {t.tabs[tab.id as keyof typeof t.tabs] ?? tab.label}
                  <ChevronDownIcon size={18} className={`text-white/60 transition-transform ${expanded === tab.id ? "rotate-180" : ""}`} />
                </button>
                {expanded === tab.id ? (
                  <ul className="pb-4">
                    {items[tab.id].map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} onClick={onClose} className="block py-2 text-[15px] text-white/65 transition-colors hover:text-white">
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
              {t.start}
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
