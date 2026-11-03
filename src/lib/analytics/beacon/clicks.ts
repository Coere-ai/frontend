import { send } from "./transport";

/**
 * Build the document-level click listener.
 *
 * Clicks are captured at the document so nothing needs wiring up. `data-cta`
 * marks a conversion (the contact links), `data-track` marks anything else an
 * author wants counted, and a plain link is counted only when it leaves the
 * site, which is worth knowing and which no author would think to annotate.
 *
 * `base` supplies the session, visitor and path fields every beacon carries.
 */
export function clickListener(
  base: () => Record<string, unknown>,
): (e: MouseEvent) => void {
  return (e) => {
    const target = e.target as HTMLElement | null;
    if (!target || typeof target.closest !== "function") return;

    // Checked first: a conversion is also a click, and only the stronger
    // reading counts.
    const cta = target.closest<HTMLElement>("[data-cta]");
    if (cta) {
      send(
        {
          ...base(),
          type: "event",
          kind: "cta",
          label: (cta.dataset.cta || "").slice(0, 120),
          href: cta.getAttribute("href"),
        },
        // Beacon: a mailto navigates away, and a normal fetch would be
        // cancelled with the document.
        true,
      );
      return;
    }

    const tracked = target.closest<HTMLElement>("[data-track]");
    if (tracked) {
      send({
        ...base(),
        type: "event",
        kind: "click",
        label: (tracked.dataset.track || "").slice(0, 120),
        href: tracked.getAttribute("href"),
      });
      return;
    }

    const link = target.closest<HTMLAnchorElement>("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const external =
      /^https?:\/\//i.test(href) && !href.startsWith(window.location.origin);
    if (!external && !href.startsWith("mailto:")) return;
    send({
      ...base(),
      type: "event",
      kind: "outbound",
      // The link's own words, which is what reads in a table.
      label: (link.textContent || "").trim().slice(0, 120) || href,
      href: href.slice(0, 400),
    });
  };
}
