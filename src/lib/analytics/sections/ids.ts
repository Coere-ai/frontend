/**
 * Section ids and labels, as plain string rules.
 *
 * Kept free of the DOM so the beacon endpoint (which validates what a browser
 * sends) and the tracker (which mints the ids) share one definition of what a
 * section id may look like. If the two ever disagreed, the tracker would mint
 * ids the server silently drops.
 */

/** Short, lower case, digits and dashes. Matches what the server will store. */
export const SECTION_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** The longest label we keep. Long enough for a real heading, short enough
 *  that a crafted page cannot stuff a paragraph into every beacon. */
export const MAX_LABEL = 80;

/**
 * Turn a heading's text into an id the server accepts.
 *
 * Accents are folded rather than dropped ("Kubánek" becomes "kubanek"), so a
 * heading in another language still yields a readable id. Returns "" when the
 * text has nothing usable in it, and the caller falls back to a numbered id.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Collapse whitespace and cap the length, so a label is one tidy line. */
export function cleanLabel(text: string | null | undefined): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= MAX_LABEL) return flat;
  return `${flat.slice(0, MAX_LABEL - 1).trimEnd()}…`;
}

/**
 * Hand out ids that are unique within one page.
 *
 * Two headings called "Results" on the same page are two sections, and giving
 * them the same id would fold their reading time into one row. The second gets
 * "-2", the third "-3", and the suffix is fitted inside the 40 character limit.
 */
export function idAllocator(): (preferred: string, fallback: string) => string {
  const used = new Set<string>();
  return (preferred, fallback) => {
    const base = SECTION_ID.test(preferred) ? preferred : fallback;
    let id = base;
    for (let n = 2; used.has(id); n++) {
      const suffix = `-${n}`;
      id = `${base.slice(0, 40 - suffix.length)}${suffix}`;
    }
    used.add(id);
    return id;
  };
}
