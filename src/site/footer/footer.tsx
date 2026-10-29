import Link from "next/link";
import { contactHref } from "@/site/content/navigation";
import { products } from "@/site/content/products";
import { Brand } from "@/site/ui/brand";
import { Container } from "@/site/ui/container";

const columns = [
  { title: "Products", links: products.map((p) => ({ href: `/products/${p.slug}`, label: p.name })) },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: contactHref, label: "Contact" },
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
 * The site footer. The sign out button ends the preview pass early, since
 * only pass holders ever see this footer.
 */
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-neutral-500">
            The memory layer you own, across every AI.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[13px] font-medium text-neutral-500">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[15px] text-neutral-950 hover:text-neutral-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-3 border-t border-neutral-100 py-6 text-[13px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {currentYear()} Coere AI</p>
        <form action="/access/leave" method="post">
          <button className="hover:text-neutral-950">Sign out of the preview</button>
        </form>
      </Container>
    </footer>
  );
}
