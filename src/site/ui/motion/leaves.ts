/**
 * Reads a saved screen as the pieces of text it shows, so two moments of
 * the same page can be compared. A leaf is an element with text of its own;
 * open shadow roots (Coere's in-page panels) are read too.
 */
export type Leaf = { el: HTMLElement; text: string };

const SKIP = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "SVG"]);

/** The text an element holds directly, not inside its children. */
function ownText(el: Element): string {
  let text = "";
  for (const node of el.childNodes) if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
  return text.replace(/\s+/g, " ").trim();
}

/** True when the element takes up room on screen. */
function shown(el: HTMLElement): boolean {
  if (el.getClientRects().length === 0) return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  return !style || (style.visibility !== "hidden" && style.opacity !== "0");
}

/** Every leaf on the page, in document order. */
export function leavesOf(doc: Document): Leaf[] {
  const out: Leaf[] = [];
  const walk = (root: Element | ShadowRoot) => {
    for (const el of root.children) {
      if (SKIP.has(el.tagName.toUpperCase())) continue;
      const text = ownText(el);
      if (text && el instanceof doc.defaultView!.HTMLElement && shown(el)) out.push({ el, text });
      if ((el as HTMLElement).shadowRoot) walk((el as HTMLElement).shadowRoot!);
      walk(el);
    }
  };
  if (doc.body) walk(doc.body);
  return out;
}

/** The element a leaf's text is typed into, when it sits in a text box. */
export function editableOf(el: HTMLElement): HTMLElement | null {
  return el.closest<HTMLElement>('textarea, [contenteditable="true"], [contenteditable=""], .ProseMirror');
}

/**
 * The largest element around `el` that holds nothing but new text, so a new
 * panel or card comes in as one piece instead of line by line.
 */
export function newestGroup(el: HTMLElement, isNew: (leaf: HTMLElement) => boolean, all: Leaf[]): HTMLElement {
  let group = el;
  for (let up = el.parentElement; up && up.tagName !== "BODY"; up = up.parentElement) {
    const inside = all.filter((l) => up.contains(l.el));
    if (inside.length === 0 || !inside.every((l) => isNew(l.el))) break;
    // A group that would cover most of the screen is a page, not a piece of one.
    const r = up.getBoundingClientRect();
    if (r.width * r.height > 0.45 * innerAreaOf(up)) break;
    group = up;
  }
  return group;
}

function innerAreaOf(el: HTMLElement): number {
  const w = el.ownerDocument.defaultView!;
  return w.innerWidth * w.innerHeight;
}
