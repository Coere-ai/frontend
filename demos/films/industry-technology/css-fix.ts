import "@v2/apps/extension/src/console/memory/page/page.css";
import "@v2/apps/extension/src/console/memory/page/foot.css";
import "@v2/apps/extension/src/console/memory/page/search.css";
import "@v2/apps/extension/src/console/memory/page/sheets.css";
import "@v2/apps/extension/src/console/memory/page/empty.css";
import type { Tab } from "../../stage/stage";
import { winOf } from "./helpers";

/**
 * The Memory page's sheet pulls its parts in with CSS @import
 * (console/memory/memory.css), which Vite's ?inline resolves and the demo
 * build's as-text loader leaves as written, so the page would lose its
 * stage, search and sheet rules. The parts are imported above as plain
 * CSS, which esbuild writes beside this film as film.css in the same
 * order, and that text goes where the @import lines stand, in every sheet
 * the dashboard adds, now and later.
 */
const IMPORTS = /(?:@import '\.\/page\/[a-z]+\.css';\s*)+/;

let parts: Promise<string> | null = null;
const partsText = () => (parts ??= fetch(new URL("film.css", location.href)).then((r) => (r.ok ? r.text() : "")));

function fix(style: HTMLStyleElement, text: string): void {
  const now = style.textContent ?? "";
  if (IMPORTS.test(now)) style.textContent = now.replace(IMPORTS, () => text + "\n");
}

export async function inlineMemoryCss(tab: Tab): Promise<void> {
  const text = await partsText();
  for (const s of tab.doc.querySelectorAll("style")) fix(s, text);
  new (winOf(tab).MutationObserver)((changes) => {
    for (const c of changes) for (const n of c.addedNodes) if (n instanceof winOf(tab).HTMLStyleElement) fix(n, text);
  }).observe(tab.doc.head, { childList: true });
}
