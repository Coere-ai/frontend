/**
 * A small syntax highlighter for the languages the site shows: TypeScript,
 * Python, shell and JSON. It colors by token kind with one pattern per
 * language, which is all a short sample needs, and keeps the bundle free
 * of a full highlighter.
 */
export type TokenKind = "plain" | "comment" | "string" | "keyword" | "literal" | "number" | "function" | "property" | "flag";
export type Token = { kind: TokenKind; text: string };

const TS_KEYWORDS = "import|from|export|const|let|var|await|async|new|for|of|in|if|else|return|function|class|interface|type|extends";
const PY_KEYWORDS = "import|from|as|def|return|for|in|if|elif|else|with|async|await|class|print";

/** Named groups decide the kind; the first group that matches wins. */
const patterns: Record<string, RegExp> = {
  ts: new RegExp(
    String.raw`(?<comment>\/\/[^\n]*)|(?<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|` + "`(?:\\\\.|[^`\\\\])*`" + String.raw`)|(?<keyword>\b(?:${TS_KEYWORDS})\b)|(?<literal>\b(?:true|false|null|undefined)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_$][\w$]*(?=\())|(?<property>(?<=\.)[A-Za-z_$][\w$]*)`,
    "g",
  ),
  python: new RegExp(
    String.raw`(?<comment>#[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<keyword>\b(?:${PY_KEYWORDS})\b)|(?<literal>\b(?:True|False|None)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_]\w*(?=\())|(?<property>(?<=\.)[A-Za-z_]\w*)`,
    "g",
  ),
  bash: new RegExp(String.raw`(?<comment>(?:^|(?<=\s))#[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'[^']*')|(?<flag>(?<=\s)--?[A-Za-z][\w-]*)|(?<function>^\s*[A-Za-z][\w./-]*)|(?<literal>\$[A-Za-z_]\w*)`, "gm"),
  json: new RegExp(String.raw`(?<property>"(?:\\.|[^"\\])*"(?=\s*:))|(?<string>"(?:\\.|[^"\\])*")|(?<literal>\b(?:true|false|null)\b)|(?<number>-?\b\d+(?:\.\d+)?\b)`, "g"),
};

const aliases: Record<string, string> = { typescript: "ts", js: "ts", javascript: "ts", tsx: "ts", py: "python", sh: "bash", shell: "bash", console: "bash", toml: "bash" };

/** Splits code into colored tokens. An unknown language comes back as one plain token. */
export function tokenize(code: string, language: string): Token[] {
  const pattern = patterns[aliases[language] ?? language];
  if (!pattern) return [{ kind: "plain", text: code }];
  const tokens: Token[] = [];
  let at = 0;
  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > at) tokens.push({ kind: "plain", text: code.slice(at, index) });
    const kind = (Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0] ?? "plain") as TokenKind;
    tokens.push({ kind, text: match[0] });
    at = index + match[0].length;
  }
  if (at < code.length) tokens.push({ kind: "plain", text: code.slice(at) });
  return tokens;
}

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The same tokens as HTML spans with a class per kind, for Markdown code blocks. */
export function highlightHtml(code: string, language: string): string {
  return tokenize(code, language)
    .map((token) => (token.kind === "plain" ? escape(token.text) : `<span class="tok-${token.kind}">${escape(token.text)}</span>`))
    .join("");
}
