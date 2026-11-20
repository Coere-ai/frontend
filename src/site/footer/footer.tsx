import Link from "next/link";
import { guides } from "@/site/content/guides";
import { emailHref } from "@/site/content/navigation";
import { products } from "@/site/content/products";
import { BrandLockup } from "@/site/nav/brand-lockup";
import { Container } from "@/site/ui/container";

const columns = [
  { title: "Products", links: [...products.map((p) => ({ href: `/products/${p.slug}`, label: p.name })), { href: "/pricing", label: "Pricing" }] },
  { title: "Guides", links: guides.map((g) => ({ href: `/${g.slug}`, label: g.name })) },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/blog", label: "Blog" },
      { href: emailHref, label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Developer docs" },
      { href: "/resources/sdks", label: "SDKs" },
      { href: "/resources/mcp", label: "MCP" },
      { href: "/#demo", label: "Product demo" },
      { href: "/industries", label: "Industries" },
    ],
  },
];

/** The year for the copyright line, read once per render on the server. */
function currentYear(): number {
  return new Date().getFullYear();
}

/**
 * The site footer: the product, company and resource links, the copyright
 * line and the privacy policy. Under a dark page (see DarkPage) it turns
 * near black with light words, so the page stays dark to its end.
 */
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-white/10 dark:bg-night">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-neutral-500 dark:text-white/55">
            The memory layer you own, across every AI.
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
          Privacy policy
        </Link>
      </Container>
    </footer>
  );
}
