import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Marked, type Tokens } from "marked";
import { highlightHtml } from "@/site/code/highlight";
import { docPages } from "@/site/content/docs";

export type TocEntry = { id: string; text: string; depth: number };
export type RenderedDoc = { html: string; toc: TocEntry[] };

const DIR = join(process.cwd(), "src/site/content/docs");

/** The anchor a heading gets, the way GitHub makes them, so links written against the source still land. */
export function headingId(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s/g, "-");
}

/** Hands out heading ids for one page, numbering repeats as GitHub does: constructor, constructor-1. */
function idMaker() {
  const seen = new Map<string, number>();
  return (raw: string) => {
    const id = headingId(raw);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    return count === 0 ? id : `${id}-${count}`;
  };
}

/** "4.3 Getting a token" and "1. Overview" read better without the section numbers. */
function withoutNumber(text: string): string {
  return text.replace(/^\d+(\.\d+)*\.?\s+/, "");
}

/** Markdown with the source comments taken out. */
function source(slug: string): string {
  return readFileSync(join(DIR, `${slug}.md`), "utf8").replace(/\s*<!-- src:[^>]*-->/g, "");
}

/**
 * Every heading anchor and the page it is on. The docs were one document,
 * so a link like #43-getting-a-token may point at another page now; this
 * map sends it there.
 */
const anchors = (() => {
  const map = new Map<string, string>();
  for (const page of docPages) {
    const nextId = idMaker();
    for (const match of source(page.slug).matchAll(/^#{2,6}\s+(.+)$/gm)) map.set(nextId(match[1]), page.slug);
  }
  return map;
})();

const cache = new Map<string, RenderedDoc>();

/** One docs page as HTML, with the list of its headings for the "On this page" column. */
export function renderDoc(slug: string): RenderedDoc {
  const kept = cache.get(slug);
  if (kept) return kept;
  const toc: TocEntry[] = [];
  const nextId = idMaker();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }: Tokens.Heading) {
        const id = nextId(text);
        const inner = withoutNumber(this.parser.parseInline(tokens));
        if (depth <= 3) toc.push({ id, text: withoutNumber(text.replace(/`/g, "")), depth });
        return `<h${depth} id="${id}"><a href="#${id}">${inner}</a></h${depth}>\n`;
      },
      link({ href, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        if (href.startsWith("#")) {
          const page = anchors.get(href.slice(1));
          const target = page && page !== slug ? `/resources/${page === "overview" ? "" : page}${href}` : href;
          return `<a href="${target.replace("/resources/#", "/resources#")}">${inner}</a>`;
        }
        return `<a href="${href}" rel="noreferrer">${inner}</a>`;
      },
      code({ text, lang }: Tokens.Code) {
        return `<pre><code>${highlightHtml(text, lang ?? "")}</code></pre>\n`;
      },
      table(token: Tokens.Table) {
        const head = token.header.map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`).join("");
        const body = token.rows.map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`).join("");
        return `<div class="docs-table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n`;
      },
    },
  });
  const html = marked.parse(source(slug), { async: false });
  const doc = { html, toc };
  cache.set(slug, doc);
  return doc;
}
