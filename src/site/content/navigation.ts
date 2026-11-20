import { siteConfig } from "@/lib/site";

/** The tabs in the navbar, in order. Each opens a menu on hover and is a link on click. Blog and Careers are hidden for now; their pages stay, unlinked. */
export type NavTabId = "products" | "industries" | "resources" | "blog" | "about" | "careers";

export const navTabs: { id: NavTabId; label: string; href: string }[] = [
  { id: "products", label: "Product", href: "/products/connect" },
  { id: "industries", label: "Industry", href: "/industries" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "about", label: "About us", href: "/about" },
];

/**
 * The first step for someone new: install Coere. The extension opens the
 * connect page, where they make an account or sign in, so a sign up first
 * would only land them on a page that says to install (docs/launch.md 7.5).
 */
export const startHref = "/install";
export const startLabel = "Start for free";

/** The site's waitlist button: it opens the developer waitlist page. */
export const contactHref = "/developers/waitlist";
export const contactLabel = "Join the waitlist";

/** Writing to the team: the footer's Contact, the About menu, the FAQ's email link and the privacy policy. */
export const emailHref = `mailto:${siteConfig.email}`;

/** Coere Solutions sells to companies, so its page asks for a demo, which emails the team. */
export const demoHref = `mailto:${siteConfig.email}?subject=Coere%20Solutions%20demo`;
export const demoLabel = "Book a demo";
