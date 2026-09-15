import { Logo } from "@/components/logo";
import { Container } from "@/components/ui";
import { navLinks, siteConfig } from "@/lib/site";

const footerLinks = [
  ...navLinks,
  { href: `mailto:${siteConfig.email}`, label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-900/6 py-10">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-[12.5px] text-ink-900/45">
              © {new Date().getFullYear()} {siteConfig.legalName}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-2.5 text-[13px]"
          >
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-ink-900/55 transition-colors hover:text-ink-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
