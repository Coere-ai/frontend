/** The tabs in the navbar, in order. Each opens a menu on hover and is a link on click. Careers is hidden for now; its page stays, unlinked. */
export type NavTabId = "products" | "industries" | "resources" | "blog" | "about" | "careers";

export const navTabs: { id: NavTabId; label: string; href: string }[] = [
  { id: "products", label: "Products", href: "/products/connect" },
  { id: "industries", label: "Industries", href: "/industries" },
  { id: "resources", label: "Resources", href: "/resources" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "about", label: "About Us", href: "/about" },
];

/** The contact button reads Coming Soon for now, and emails the team. */
export const contactHref = "mailto:edisonlaw@berkeley.edu";
export const contactLabel = "Coming Soon";
