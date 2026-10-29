/**
 * Dresses a replica site for the camera, as coere-v2's tools/demo-video
 * stage/dress.ts does: the test markers become the person's account and
 * the site's own footnote, and new text is dressed as the page adds it.
 */
export type Person = { name: string; first: string; initials: string };

const FOOTNOTES: Record<string, string> = {
  "chatgpt.com": "ChatGPT can make mistakes. Check important info.",
  "claude.ai": "Claude can make mistakes. Please double check responses.",
  "gemini.google.com": "Gemini can make mistakes, so double check it.",
};
const PLANS: Record<string, string> = { "chatgpt.com": "Plus", "claude.ai": "Pro plan" };
const MODELS: Record<string, string> = { "claude.ai": "Sonnet 4.5" };

export function dress(host: string, person: Person): void {
  const rewrite = (t: string): string => {
    if (t === "TU") return person.initials;
    if (t === "Test User") return person.name;
    if (t.includes("Test User")) return t.replace("Test User", person.first);
    if (/^Fake .+ for tests\. /.test(t)) return FOOTNOTES[host] ?? "";
    if (/^Fake (Plus|Pro) plan$|^Fake account$/.test(t)) return PLANS[host] ?? "Free plan";
    if (/^Fake \S+$/.test(t)) return MODELS[host] ?? t.slice(5);
    return t;
  };
  const scrub = (root: Node): void => {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const before = (n.nodeValue ?? "").trim();
      const after = rewrite(before);
      if (after !== before) n.nodeValue = after;
    }
  };
  const start = (): void => {
    const style = document.createElement("style");
    style.textContent = "[data-fake-label]{display:none!important}";
    document.head.append(style);
    scrub(document.body);
    new MutationObserver((changes) => {
      for (const c of changes) for (const added of c.addedNodes) scrub(added);
    }).observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
}
