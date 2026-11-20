import Link from "@/site/i18n/link";
import { guidesIn } from "@/site/content/guides";
import { emailHref } from "@/site/content/navigation";
import { productsIn } from "@/site/content/products";
import { getMessages } from "@/site/i18n/server";
import type { Messages } from "@/site/i18n/messages/types";
import { BrandLockup } from "@/site/nav/brand-lockup";
import { Container } from "@/site/ui/container";

/** The footer's columns in a language. */
function columnsIn({ chrome: { footer: t }, catalog }: Messages) {
  return [
    { title: t.products, links: [...productsIn(catalog).map((p) => ({ href: `/products/${p.slug}`, label: p.name })), { href: "/pricing", label: t.pricing }] },
    { title: t.guides, links: guidesIn(catalog).map((g) => ({ href: `/${g.slug}`, label: g.name })) },
    {
      title: t.company,
      links: [
        { href: "/about", label: t.about },
        { href: "/blog", label: t.blog },
        { href: emailHref, label: t.contact },
      ],
    },
    {
      title: t.resources,
      links: [
        { href: "/demo", label: t.demo },
        { href: "/industries", label: t.industries },
      ],
    },
  ];
}

/** The year for the copyright line, read once per render on the server. */
function currentYear(): number {
  return new Date().getFullYear();
}

/**
 * The site footer: the product, company and resource links, the copyright
 * line and the privacy policy. Under a dark page (see DarkPage) it turns
 * near black with light words, so the page stays dark to its end.
 */
export async function Footer() {
  const messages = await getMessages();
  const t = messages.chrome.footer;
  const columns = columnsIn(messages);
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-white/10 dark:bg-night">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-neutral-500 dark:text-white/55">
            {t.tagline}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[13px] font-medium text-neutral-500 dark:text-white/55">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[15px] text-neutral-950 hover:text-neutral-500 dark:text-white/85 dark:hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-3 border-t border-neutral-100 py-6 text-[13px] text-neutral-500 sm:flex-row dark:border-white/10 dark:text-white/55 sm:items-center sm:justify-between">
        <p>© {currentYear()} Coere AI</p>
        <Link href="/privacy" className="hover:text-neutral-950 dark:hover:text-white">
          {t.privacy}
        </Link>
      </Container>
    </footer>
  );
}
