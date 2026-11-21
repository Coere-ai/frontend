import { siteConfig } from "@/lib/site";
import { BOOKING_URL } from "@/site/contact/links";

/** The tabs in the navbar, in order. Each opens a menu on hover and is a link on click. Resources and Careers are hidden for now; their pages stay, unlinked (the blog sits under About us). */
export type NavTabId = "products" | "industries" | "resources" | "blog" | "about" | "careers";

export const navTabs: { id: NavTabId; label: string; href: string }[] = [
  { id: "products", label: "Product", href: "/products/connect" },
  { id: "industries", label: "Industry", href: "/industries" },
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

/**
 * Writing to the team: the footer's Contact, the About menu, the FAQ's email
 * link and the privacy policy. On the page the contact pop up opens instead
 * (src/site/contact); the mailto stays for a browser without JavaScript.
 */
export const emailHref = `mailto:${siteConfig.email}`;

/**
 * Coere Solutions and the Team plan sell to companies, so they ask for a
 * demo: the founders' Cal.com page, which opens in the booking pop up.
 */
export const demoHref = BOOKING_URL;
export const demoLabel = "Book a demo";
