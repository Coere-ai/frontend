import { deepAll, nameOf, resolve, role, shown, type Query } from "../../stage/query";
import type { Stage, Tab } from "../../stage/stage";

/**
 * Finding things the way the film's Playwright helpers do
 * (tests/e2e/helpers/memory/page.ts and friends), and the few moves a
 * person makes that the stage has no word for.
 */

/** A button inside a group of that name that also holds a button named `has`: the scope chips, not the graph's own Show chips. */
export const groupButton = (group: string, has: string, name: string): Query => (doc) => {
  const groups = deepAll(doc, `[role="group"][aria-label="${group}"]`).filter(shown);
  const g = groups.find((x) => deepAll(x, "button").some((b) => nameOf(b) === has));
  return g ? deepAll(g, "button").find((b) => nameOf(b) === name && shown(b)) : null;
};

/** The one box that searches memories and chats. */
export const searchBox: Query = role("combobox", "Search memory and chats", { exact: true });

/** A thing's side sheet, by its name. */
export const sideSheet = (name: string) =>
  label(`sheet ${name}`, (doc: Document) => deepAll(doc, 'aside, [role="complementary"]').find((el) => shown(el) && nameOf(el) === name));

/** A query with a name, so a wait that finds nothing says what it looked for. */
export function label<Q extends (doc: Document) => Element | null | undefined>(text: string, q: Q): Q {
  q.toString = () => text;
  return q;
}

/** The first row of the search results that reads exactly `name`. */
export const searchHit = (name: string): Query =>
  label(`search result ${name}`, (doc) => {
    const list = resolve(doc, role("listbox", "Search results"));
    if (!list) return null;
    return deepAll(list, "*").find((el) => shown(el) && el.children.length === 0 && (el.textContent ?? "").trim() === name) ?? null;
  });

/** A role and name inside what a query finds, as locator.getByRole chains. */
export const roleIn = (outer: Query, kind: string, name?: string | RegExp, exact = false): Query =>
  label(`${kind} ${String(name)} in ${String(outer)}`, (doc) => {
    const scope = resolve(doc, outer);
    return scope ? resolve(doc, role(kind, name, { exact, within: () => scope })) : null;
  });

/** A tab's window with its constructors, for the events a script makes in it. */
export const winOf = (tab: Tab): Window & typeof globalThis => tab.win as Window & typeof globalThis;

/** Selects all of what the focused box holds, as Cmd+A does. */
export function selectAll(tab: Tab): void {
  let el = tab.doc.activeElement as HTMLElement | null;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement;
  if (el && "select" in el) (el as HTMLInputElement).select();
  else tab.doc.execCommand("selectAll");
}

/** Finds a thing by name in the Memory page's search and opens its sheet, as a person does. */
export async function openByName(s: Stage, page: Tab, name: string): Promise<void> {
  await s.click(page, searchBox, { after: 150 });
  selectAll(page);
  await s.type(page, name, 55);
  await s.waitFor(page, searchHit(name));
  await s.wait(500);
  await s.click(page, searchHit(name), { after: 300 });
  await s.waitFor(page, sideSheet(name));
  await s.rest();
}

/** Scrolls every box in a page back to its top, as the film does after ticking the AIs. */
export function scrollTops(tab: Tab): void {
  for (const el of tab.doc.querySelectorAll("*")) el.scrollTop = 0;
}

/** The Extract all dock on a dashboard page. */
const dock = label("the Extract all dock", (doc: Document) => doc.querySelector<HTMLElement>('[data-testid="coere-extract-all-dock"]'));

/**
 * Presses Clear in the dock while a finished run still stands there, as
 * the film does before it shows a page (tests/e2e/helpers/readme/memory-scenes.ts).
 * The page is not on screen yet, so no pointer is seen doing it.
 */
export async function clearDock(page: Tab): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await new Promise((r) => setTimeout(r, 300));
    const d = dock(page.doc);
    if (!d) return;
    const clear = [...d.querySelectorAll<HTMLElement>("button")].find((b) => nameOf(b) === "Clear" && shown(b));
    clear?.click();
  }
}
