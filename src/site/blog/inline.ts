/**
 * The few inline marks a post's text may carry: [words](/path) for a link,
 * **words** for bold and `words` for code. Parsed into pieces the post page
 * renders as elements, so post text never goes in as HTML.
 */
export type InlinePiece =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "link"; text: string; href: string }
  | { kind: "bold"; text: string; href?: string };

const MARK = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|`([^`]+)`/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

export function parseInline(text: string): InlinePiece[] {
  const pieces: InlinePiece[] = [];
  let last = 0;
  for (const m of text.matchAll(MARK)) {
    const at = m.index ?? 0;
    if (at > last) pieces.push({ kind: "text", text: text.slice(last, at) });
    if (m[1] !== undefined) pieces.push({ kind: "link", text: m[1], href: m[2] });
    else if (m[3] !== undefined) {
      // Bold around a whole link keeps the link, so a list item can open with one.
      const link = LINK.exec(m[3]);
      pieces.push(link ? { kind: "bold", text: link[1], href: link[2] } : { kind: "bold", text: m[3] });
    } else pieces.push({ kind: "code", text: m[4] });
    last = at + m[0].length;
  }
  if (last < text.length) pieces.push({ kind: "text", text: text.slice(last) });
  return pieces;
}

/** A heading as an address for its anchor: lower case words joined by hyphens. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
