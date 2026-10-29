/**
 * Finding things in a tab the way the films' Playwright scripts do, by
 * CSS, by role and name, or by text, looking inside open shadow roots too,
 * since Coere draws its surfaces in one.
 */
export type Query = string | ((doc: Document) => Element | null | undefined);

/** Every element under `root` that matches `selector`, shadow roots included, in document order. */
export function deepAll(root: ParentNode, selector: string): Element[] {
  const out: Element[] = [];
  const walk = (node: ParentNode) => {
    for (const el of node.querySelectorAll("*")) {
      if (el.matches(selector)) out.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(root);
  return out;
}

export function deep(root: ParentNode, selector: string): Element | null {
  return deepAll(root, selector)[0] ?? null;
}

/** Whether an element is drawn: it has a size and nothing hides it. */
export function shown(el: Element): boolean {
  const box = el.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  return style?.visibility !== "hidden" && style?.display !== "none";
}

/** The accessible name, as near as a demo needs: aria-label, then aria-labelledby, then the text. */
export function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label.trim();
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    const root = el.getRootNode() as Document | ShadowRoot;
    const text = by.split(/\s+/).map((id) => root.getElementById?.(id)?.textContent ?? "").join(" ").trim();
    if (text) return text;
  }
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

const ROLES: Record<string, string> = {
  button: 'button, [role="button"], input[type="button"], input[type="submit"]',
  link: 'a[href], [role="link"]',
  heading: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
  textbox: 'input:not([type]), input[type="text"], input[type="search"], textarea, [contenteditable="true"], [role="textbox"]',
  checkbox: 'input[type="checkbox"], [role="checkbox"]',
  tab: '[role="tab"]',
  option: '[role="option"], option',
  menuitem: '[role="menuitem"]',
  dialog: 'dialog, [role="dialog"]',
  region: 'section[aria-label], [role="region"]',
  switch: '[role="switch"]',
  list: 'ul, ol, [role="list"]',
  listitem: 'li, [role="listitem"]',
};

/** Like Playwright's getByRole: a drawn element with that role whose name matches. */
export function role(name: string, match?: string | RegExp, o: { exact?: boolean; within?: Query } = {}): Query {
  return (doc) => {
    const scope = o.within ? resolve(doc, o.within) : doc;
    if (!scope) return null;
    return deepAll(scope as ParentNode, ROLES[name] ?? `[role="${name}"]`).find((el) => shown(el) && matches(nameOf(el), match, o.exact));
  };
}

/** Like getByText: the smallest drawn element under `selector` whose text matches. */
export function text(match: string | RegExp, selector = "*", o: { exact?: boolean; within?: Query } = {}): Query {
  return (doc) => {
    const scope = o.within ? resolve(doc, o.within) : doc;
    if (!scope) return null;
    const hits = deepAll(scope as ParentNode, selector).filter((el) => shown(el) && matches((el.textContent ?? "").replace(/\s+/g, " ").trim(), match, o.exact));
    return hits.find((el) => !hits.some((other) => other !== el && el.contains(other))) ?? null;
  };
}

/** A CSS selector inside an element found first. */
export function within(outer: Query, selector: string): Query {
  return (doc) => {
    const scope = resolve(doc, outer);
    return scope ? deep(scope, selector) ?? (scope.shadowRoot ? deep(scope.shadowRoot, selector) : null) : null;
  };
}

function matches(value: string, match: string | RegExp | undefined, exact = false): boolean {
  if (match === undefined) return true;
  if (match instanceof RegExp) return match.test(value);
  return exact ? value === match : value.toLowerCase().includes(match.toLowerCase());
}

export function resolve(doc: Document, query: Query): Element | null {
  if (typeof query === "function") return query(doc) ?? null;
  return deepAll(doc, query).find(shown) ?? null;
}
