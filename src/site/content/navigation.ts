/** The tabs in the navbar, in order. Each opens a menu on hover and is a link on click. Blog and Careers are hidden for now; their pages stay, unlinked. */
export type NavTabId = "products" | "industries" | "resources" | "blog" | "about" | "careers";

export const navTabs: { id: NavTabId; label: string; href: string }[] = [
  { id: "products", label: "Products", href: "/products/connect" },
  { id: "industries", label: "Industries", href: "/industries" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "about", label: "About Us", href: "/about" },
];

/** The contact button reads Waitlist Coming Soon for now, and emails the team. */
export const contactHref = "mailto:edisonlaw@berkeley.edu";
export const contactLabel = "Waitlist Coming Soon";
