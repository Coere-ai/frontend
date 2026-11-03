/** The tabs in the navbar, in order. Each opens a menu on hover and is a link on click. Blog and Careers are hidden for now; their pages stay, unlinked. */
export type NavTabId = "products" | "industries" | "resources" | "blog" | "about" | "careers";

export const navTabs: { id: NavTabId; label: string; href: string }[] = [
  { id: "products", label: "Products", href: "/products/connect" },
  { id: "industries", label: "Industries", href: "/industries" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "about", label: "About Us", href: "/about" },
];

/** The site's waitlist button: it opens the developer waitlist page. */
export const contactHref = "/developers/waitlist";
export const contactLabel = "Join the waitlist";

/** Writing to the team: the footer's Contact, the About menu and the FAQ's email link. */
export const emailHref = "mailto:edisonlaw@berkeley.edu";

/** Coere Solutions sells to companies, so its page asks for a demo, which emails the founder. */
export const demoHref = "mailto:edisonlaw@berkeley.edu?subject=Coere%20Solutions%20demo";
export const demoLabel = "Book a demo";
