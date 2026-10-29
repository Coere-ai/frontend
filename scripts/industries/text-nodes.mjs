/**
 * Finds the text a saved screen shows: every text node outside tags, style
 * and script, with where it sits in the file, so content can be swapped
 * without touching the markup around it.
 */
export function textNodes(html) {
  const nodes = [];
  const re = /<(style|script)[\s\S]*?<\/\1>|<[^>]+>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[2] === undefined) continue;
    const text = m[2];
    if (!text.trim()) continue;
    nodes.push({ start: m.index, end: m.index + text.length, text });
  }
  return nodes;
}

const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const encode = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * Swaps text in document order. Each [from, to] pair replaces the next text
 * node, after the last one replaced, whose trimmed text is `from`; the
 * spaces around it stay. Throws when a `from` is not found, so a template
 * that changed is caught at once.
 */
export function swapText(html, pairs, label = "screen") {
  const nodes = textNodes(html);
  const edits = [];
  let at = 0;
  for (const [from, to] of pairs) {
    const i = nodes.findIndex((n, k) => k >= at && decode(n.text).trim() === from);
    if (i < 0) throw new Error(`${label}: no text "${from}" after node ${at}`);
    const n = nodes[i];
    const lead = n.text.match(/^\s*/)[0];
    const trail = n.text.match(/\s*$/)[0];
    edits.push({ start: n.start, end: n.end, text: lead + encode(to) + trail });
    at = i + 1;
  }
  let out = html;
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

/** Swaps every text node equal to `from`, wherever it is. */
export function swapAll(html, from, to) {
  return textNodes(html)
    .filter((n) => decode(n.text).trim() === from)
    .sort((a, b) => b.start - a.start)
    .reduce((out, n) => out.slice(0, n.start) + n.text.replace(n.text.trim(), encode(to)) + out.slice(n.end), html);
}
