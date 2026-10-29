import { FILES, TREE, type FileName } from "./files";

/**
 * A code editor drawn as a page, in VS Code's dark look: the explorer with
 * the developer's small app, tabs, an editor with line numbers and syntax
 * colors, the command palette, a Simple Browser pane for the docs, the
 * terminal panel and the status bar. The editor is a real text box under
 * the colored text, so the scripted hand's keys type into it key by key,
 * Enter keeps the indent, and Cmd+V pastes what the film copied. The
 * terminal prints what the film hands it: lines the real client printed
 * (bake.mts).
 */

const FONT = "/preview/live/lib/ext/fonts/";
const LINE = 23;
const PAD_TOP = 6;

const CSS = `
@font-face{font-family:Geist;src:url(${FONT}Geist-Variable.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(${FONT}GeistMono-Variable.woff2) format("woff2");font-weight:100 900}
:root{--bg:#1f1f1f;--side:#181818;--line:#2b2b2b;--fg:#cccccc;--dim:#9d9d9d;--accent:#0078d4;--mono:"Geist Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#0e0e0e;overflow:hidden;font:13px/1.4 Geist,system-ui,sans-serif;color:var(--fg);-webkit-font-smoothing:antialiased}
.vs{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--bg)}
.titlebar{height:34px;flex:none;display:flex;align-items:center;justify-content:center;position:relative;background:var(--side);border-bottom:1px solid var(--line);color:var(--dim);font-size:13px}
.lights{position:absolute;left:14px;top:11px;display:flex;gap:8px}.lights i{width:12px;height:12px;border-radius:50%;display:block}
.lights i:nth-child(1){background:#ff5f57}.lights i:nth-child(2){background:#febc2e}.lights i:nth-child(3){background:#28c840}
.search{width:420px;height:24px;border:1px solid #3c3c3c;border-radius:6px;background:#242424;display:flex;align-items:center;justify-content:center;gap:6px;color:var(--dim);font-size:12.5px}
.main{flex:1;display:flex;min-height:0}
.act{width:48px;flex:none;background:var(--side);border-right:1px solid var(--line);display:flex;flex-direction:column;align-items:center;padding-top:6px;gap:4px}
.act b{width:48px;height:46px;display:grid;place-items:center;color:#868686;border-left:2px solid transparent}
.act b.on{color:#e7e7e7;border-left-color:var(--accent)}
.act svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.side{width:236px;flex:none;background:var(--side);border-right:1px solid var(--line);display:flex;flex-direction:column}
.side.off{display:none}
.side h2{margin:0;padding:0 20px;height:35px;display:flex;align-items:center;font:400 11px Geist,sans-serif;letter-spacing:.06em;color:var(--fg)}
.folder{height:22px;display:flex;align-items:center;gap:4px;padding-left:6px;font-weight:700;font-size:11px;letter-spacing:.04em}
.item{height:24px;display:flex;align-items:center;gap:7px;padding-left:22px;cursor:default;font-size:13.5px;color:#cccccc}
.item.on{background:#37373d}
.item:hover{background:#2a2d2e}
.item.on:hover{background:#37373d}
.ico{width:16px;height:16px;flex:none;display:grid;place-items:center;font:700 9px/1 Geist,sans-serif}
.ico.ts{color:#3178c6;font-size:9.5px}.ico.json{color:#cbcb41;font-size:11px}.ico.env{color:#e5c07b}.ico.git{color:#e37933}.ico.dir{color:#c5c5c5}
.chev{width:16px;height:16px;fill:none;stroke:#c5c5c5;stroke-width:1.5}
.work{flex:1;display:flex;flex-direction:column;min-width:0}
.groups{flex:1;display:flex;min-height:0}
.group{flex:1;display:flex;flex-direction:column;min-width:0}
.group+.group{border-left:1px solid var(--line)}
.group.off{display:none}
.tabs{height:35px;flex:none;display:flex;background:var(--side);border-bottom:1px solid var(--line)}
.tab{display:flex;align-items:center;gap:6px;padding:0 10px 0 12px;border-right:1px solid var(--line);color:#9d9d9d;font-size:13px;white-space:nowrap;position:relative}
.tab.on{background:var(--bg);color:#fff}
.tab.on::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:var(--accent)}
.tab.on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--bg)}
.x{width:20px;height:20px;display:grid;place-items:center;border-radius:4px;color:#cccccc;font-size:15px;line-height:1}
.x:hover{background:#ffffff1f}
.tab:not(.on) .x{visibility:hidden}
.tab.dirty .x{visibility:visible}
.tab.dirty .x::before{content:"";width:8px;height:8px;border-radius:50%;background:#cccccc}
.tab.dirty .x span{display:none}
.crumbs{height:22px;flex:none;display:flex;align-items:center;gap:6px;padding-left:16px;color:var(--dim);font-size:12.5px}
.ed{flex:1;display:flex;position:relative;min-height:0;overflow:hidden;font:15px/${LINE}px var(--mono)}
.gutter{width:62px;flex:none;text-align:right;padding:${PAD_TOP}px 22px 0 0;color:#6e7681;white-space:pre}
.gutter .cur{color:#cccccc}
.code{flex:1;position:relative;min-width:0}
.code pre,.code textarea{position:absolute;inset:0;margin:0;padding:${PAD_TOP}px 0 0 4px;font:inherit;white-space:pre;overflow:hidden;tab-size:2;letter-spacing:0}
.code pre{color:#d4d4d4;pointer-events:none}
.code .curline{position:absolute;left:0;right:0;height:${LINE}px;border-top:1px solid #282828;border-bottom:1px solid #282828;pointer-events:none}
.code textarea{background:transparent;color:transparent;caret-color:#aeafad;border:0;outline:0;resize:none}
.code textarea::selection{background:#264f78;color:transparent}
.k{color:#569cd6}.c{color:#c586c0}.s{color:#ce9178}.n{color:#b5cea8}.f{color:#dcdcaa}.t{color:#4ec9b0}.v{color:#9cdcfe}.m{color:#6a9955}.p{color:#d4d4d4}
.b1{color:#ffd700}.b2{color:#da70d6}.b3{color:#179fff}
.suggest{position:absolute;z-index:5;min-width:280px;background:#202020;border:1px solid #454545;border-radius:4px;box-shadow:0 4px 14px #0008;font:13.5px/22px var(--mono);padding:2px 0;display:none}
.suggest.on{display:block}
.suggest div{display:flex;align-items:center;gap:8px;padding:0 8px;color:#cccccc;white-space:nowrap}
.suggest div.sel{background:#04395e;outline:1px solid #2b79d3}
.suggest i{font-style:normal;width:16px;text-align:center;color:#b180d7}
.suggest i.prop{color:#75beff}
.suggest em{font-style:normal;color:#18a3ff;font-weight:600}
.suggest small{margin-left:auto;padding-left:18px;color:#8b8b8b;font-size:12px}
.browser{flex:1;display:flex;flex-direction:column;min-height:0;background:#fff}
.nav{height:36px;flex:none;display:flex;align-items:center;gap:6px;padding:0 8px;background:var(--bg);border-bottom:1px solid var(--line)}
.nav b{width:26px;height:26px;display:grid;place-items:center;color:#9d9d9d}
.nav svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.addr{flex:1;height:26px;border:1px solid #3c3c3c;border-radius:4px;background:#2a2a2a;color:#cccccc;display:flex;align-items:center;padding:0 9px;font-size:13px}
.browser iframe{flex:1;border:0;width:100%;background:#fff}
.panel{height:232px;flex:none;border-top:1px solid var(--line);display:flex;flex-direction:column;background:var(--bg);transition:height .45s cubic-bezier(.2,.8,.2,1)}
.panel.max{height:calc(100% - 0px)}
.work.maxed .groups{display:none}
.work.maxed .panel{flex:1;height:auto}
.ptabs{height:35px;flex:none;display:flex;align-items:center;gap:22px;padding:0 20px;font-size:11px;letter-spacing:.05em;color:#9d9d9d}
.ptabs span.on{color:#e7e7e7;border-bottom:1px solid #e7e7e7;padding:7px 0 6px}
.ptabs .tools{margin-left:auto;display:flex;gap:6px}
.ptabs .tools b{width:24px;height:22px;display:grid;place-items:center;color:#cccccc;border-radius:4px}
.ptabs .tools b:hover{background:#ffffff1f}
.ptabs svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.term{flex:1;margin:0;padding:4px 20px 12px;font:14px/21px var(--mono);color:#cccccc;white-space:pre-wrap;overflow:hidden}
.term .ps{color:#89d185}.term .cwd{color:#3b8eea}
.term .cmd{outline:none;caret-color:transparent;color:#e5e5e5}
.term .cursor{display:inline-block;width:.6em;height:1.1em;vertical-align:-.2em;background:#cccccc;opacity:.8;animation:blink 1.05s steps(1) infinite}
.term .cursor.busy{animation:none}
@keyframes blink{50%{opacity:0}}
.status{height:24px;flex:none;display:flex;align-items:center;gap:16px;padding:0 0 0 0;background:var(--side);border-top:1px solid var(--line);color:#9d9d9d;font-size:12px}
.status .remote{height:100%;padding:0 10px;display:flex;align-items:center;background:var(--accent);color:#fff}
.status .right{margin-left:auto;display:flex;gap:18px;padding-right:14px}
.status svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.5;vertical-align:-3px;margin-right:4px}
.palette{position:absolute;left:50%;top:40px;width:620px;transform:translateX(-50%);background:#222222;border:1px solid #454545;border-radius:8px;box-shadow:0 8px 28px #000a;padding:6px;display:none;z-index:9}
.palette.on{display:block}
.palette input{width:100%;height:28px;border:1px solid #0078d4;border-radius:4px;background:#313131;color:#e7e7e7;font:13.5px Geist,sans-serif;padding:0 8px;outline:0}
.palette .hint{padding:6px 8px 2px;color:#9d9d9d;font-size:12.5px}
.palette ul{list-style:none;margin:6px 0 0;padding:0}
.palette li{height:24px;display:flex;align-items:center;padding:0 10px;border-radius:4px;color:#cccccc;font-size:13px}
.palette li.sel{background:#04395e;outline:1px solid #2b79d3}
.palette li em{font-style:normal;color:#2aaaff;font-weight:600}
.palette li small{margin-left:auto;color:#9d9d9d}
`;

const ICON = {
  files: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7z"/><path d="M14 3v4h4"/><path d="M9 21h9a2 2 0 0 0 2-2V9"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></svg>',
  git: '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 8.2v7.6M18 10.2c0 4-6 3-11 6"/></svg>',
  run: '<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="6" height="6"/><rect x="10" y="10" width="6" height="6"/><rect x="4" y="16" width="6" height="4" transform="translate(0 0)"/><rect x="14" y="4" width="6" height="6"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4"/></svg>',
  down: '<svg class="chev" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4 3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 3v3h-3"/></svg>',
  max: '<svg viewBox="0 0 16 16"><path d="m4 10 4-4 4 4"/></svg>',
  min: '<svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  branch: '<svg viewBox="0 0 16 16"><circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="5" r="1.5"/><path d="M4.5 5v6M11.5 6.5c0 3-4 2.5-7 4.5"/></svg>',
  globe: '<svg viewBox="0 0 16 16" style="width:14px;height:14px;fill:none;stroke:#75beff;stroke-width:1.3"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/></svg>',
};

function iconFor(name: string): string {
  if (name.endsWith(".ts")) return '<span class="ico ts">TS</span>';
  if (name.endsWith(".json")) return '<span class="ico json">{ }</span>';
  if (name === ".env") return '<span class="ico env">⚙</span>';
  if (name === ".gitignore") return '<span class="ico git">◆</span>';
  return '<span class="ico dir"></span>';
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CONTROL = new Set(["import", "from", "export", "return", "await", "if", "else", "for", "of", "while", "break", "continue", "throw", "try", "catch"]);
const STORAGE = new Set(["const", "let", "var", "new", "async", "function", "true", "false", "null", "undefined", "typeof", "this", "class", "extends", "type", "interface", "in", "as"]);
const TYPES = new Set(["string", "number", "boolean", "void", "unknown", "any"]);

/** VS Code's Dark Modern colors for TypeScript, with its bracket pair colors. */
function highlightTs(src: string): string {
  const re = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'?|"(?:[^"\\\n]|\\.)*"?|`(?:[^`\\]|\\.)*`?)|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)|([()[\]{}])|(\s+)|([^\s\w])/g;
  let out = "";
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [all, comment, str, num, word, bracket] = m;
    if (comment) out += `<span class="m">${esc(all)}</span>`;
    else if (str) out += `<span class="s">${esc(all)}</span>`;
    else if (num) out += `<span class="n">${all}</span>`;
    else if (word) {
      const rest = src.slice(re.lastIndex);
      const before = src.slice(0, m.index).trimEnd();
      let cls = "v";
      if (CONTROL.has(word)) cls = "c";
      else if (STORAGE.has(word)) cls = "k";
      else if (TYPES.has(word)) cls = "t";
      else if (/^\s*\(/.test(rest)) cls = "f";
      else if (/^[A-Z]/.test(word) && !before.endsWith(".")) cls = "t";
      out += `<span class="${cls}">${word}</span>`;
    } else if (bracket) {
      const open = "([{".includes(bracket);
      if (!open) depth = Math.max(0, depth - 1);
      out += `<span class="b${(depth % 3) + 1}">${bracket}</span>`;
      if (open) depth++;
    } else out += `<span class="p">${esc(all)}</span>`;
  }
  return out;
}

function highlightJson(src: string): string {
  return src.replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(\b(?:true|false|null)\b)|(\b\d+\b)|([{}[\],:])|([^"{}[\],:\s]+)/g, (all, str, colon, lit, num, punct) => {
    if (str) return colon ? `<span class="v">${esc(str)}</span><span class="p">${colon}</span>` : `<span class="s">${esc(str)}</span>`;
    if (lit) return `<span class="k">${lit}</span>`;
    if (num) return `<span class="n">${num}</span>`;
    if (punct) return `<span class="p">${punct}</span>`;
    return esc(all);
  });
}

function highlightEnv(src: string): string {
  return src
    .split("\n")
    .map((line) => {
      const m = /^([A-Z_][A-Z0-9_]*)(=)(.*)$/.exec(line);
      return m ? `<span class="v">${m[1]}</span><span class="p">=</span><span class="s">${esc(m[3])}</span>` : `<span class="m">${esc(line)}</span>`;
    })
    .join("\n");
}

const highlight = (name: string, src: string) => (name.endsWith(".ts") ? highlightTs(src) : name.endsWith(".json") ? highlightJson(src) : name === ".gitignore" ? esc(src) : highlightEnv(src));
const language = (name: string) => (name.endsWith(".ts") ? "TypeScript" : name.endsWith(".json") ? "JSON" : name === ".env" ? "Environment Variables" : "Ignore");

/** What the editor suggests after a dot: the members the real @coere/client and its answer have. */
const MEMBERS: Array<{ after: RegExp; items: Array<[string, string, "fn" | "prop"]> }> = [
  { after: /\bcoere\.context\.(\w*)$/, items: [["forDraft", "(draft: string, options?: DraftOptions): Promise<DraftContext>", "fn"], ["sent", "(receipt: string): Promise<number>", "fn"]] },
  {
    after: /\bctx\.(\w*)$/,
    items: [["also", "", "prop"], ["block", "string", "prop"], ["chars", "number", "prop"], ["chat", "string | null", "prop"], ["first", "boolean", "prop"], ["fromChats", "number", "prop"], ["items", "DraftItem[]", "prop"], ["receipt", "string | null", "prop"], ["sources", "", "prop"], ["tokens", "number", "prop"]],
  },
  {
    after: /\bcoere\.(\w*)$/,
    items: [["changes", "", "fn"], ["clients", "", "prop"], ["context", "ContextResource", "prop"], ["corePack", "", "fn"], ["entities", "", "prop"], ["export", "", "fn"], ["facts", "", "prop"], ["health", "", "fn"], ["me", "", "fn"], ["nodes", "", "prop"], ["people", "", "prop"], ["profile", "", "fn"], ["search", "", "fn"]],
  },
];

const style = document.createElement("style");
style.textContent = CSS;
document.head.append(style);
document.title = "prep-coach";

document.body.innerHTML = `
<div class="vs">
  <div class="titlebar"><div class="lights"><i></i><i></i><i></i></div><div class="search">${ICON.search.replace("<svg", '<svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6"')} prep-coach</div></div>
  <div class="main">
    <div class="act"><b class="on">${ICON.files}</b><b>${ICON.search}</b><b>${ICON.git}</b><b>${ICON.run}</b><b>${ICON.ext}</b></div>
    <div class="side">
      <h2>EXPLORER</h2>
      <div class="folder">${ICON.down}PREP-COACH</div>
      <div class="item" style="padding-left:8px">${ICON.chev}<span>node_modules</span></div>
      ${TREE.map((f) => `<div class="item" data-file="${f}">${iconFor(f)}<span>${f}</span></div>`).join("")}
    </div>
    <div class="work">
      <div class="groups">
        <div class="group" id="g1">
          <div class="tabs"></div>
          <div class="crumbs"></div>
          <div class="ed"><div class="gutter"></div><div class="code"><div class="curline"></div><pre></pre><textarea spellcheck="false" autocomplete="off" wrap="off" aria-label="Editor"></textarea><div class="suggest"></div></div></div>
        </div>
        <div class="group off" id="g2">
          <div class="tabs"><div class="tab on">${ICON.globe}<span>Simple Browser</span><span class="x close-docs" role="button" aria-label="Close Simple Browser"><span>×</span></span></div></div>
          <div class="browser"><div class="nav"><b>${ICON.back}</b><b>${ICON.fwd}</b><b>${ICON.reload}</b><div class="addr"></div></div></div>
        </div>
      </div>
      <div class="panel">
        <div class="ptabs"><span>PROBLEMS</span><span>OUTPUT</span><span>DEBUG CONSOLE</span><span class="on">TERMINAL</span><span>PORTS</span>
          <div class="tools"><b>${ICON.plus}</b><b class="maxi" role="button" aria-label="Maximize Panel Size">${ICON.max}</b></div></div>
        <pre class="term"></pre>
      </div>
    </div>
  </div>
  <div class="status"><span class="remote">&gt;&lt;</span><span>${ICON.branch}main</span><span>⊗ 0  ⚠ 0</span><div class="right"><span class="pos"></span><span>Spaces: 2</span><span>UTF-8</span><span>LF</span><span class="lang"></span></div></div>
  <div class="palette"><input spellcheck="false" aria-label="Command palette"><div class="hint"></div><ul></ul></div>
</div>`;

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector(sel) as unknown as T;
const area = $<HTMLTextAreaElement>("textarea");
const pre = $<HTMLPreElement>(".code pre");
const gutter = $(".gutter");
const curline = $(".curline");
const suggest = $(".suggest");
const tabsEl = $("#g1 .tabs");
const crumbs = $(".crumbs");

type Doc = { name: FileName; text: string; saved: string; sel: number };
const docs = new Map<FileName, Doc>();
for (const name of TREE) docs.set(name, { name, text: FILES[name], saved: FILES[name], sel: 0 });
let open: FileName[] = [];
let active: Doc | null = null;

/** Character width of the code font, measured once it has loaded. */
let charW = 9;
function measure(): void {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;font:15px var(--mono);white-space:pre";
  probe.textContent = "x".repeat(100);
  document.body.append(probe);
  charW = probe.getBoundingClientRect().width / 100;
  probe.remove();
}

function drawTabs(): void {
  tabsEl.innerHTML = open
    .map((n) => {
      const d = docs.get(n)!;
      return `<div class="tab${d === active ? " on" : ""}${d.text !== d.saved ? " dirty" : ""}" data-tab="${n}">${iconFor(n)}<span>${n}</span><span class="x" role="button" aria-label="Close ${n}"><span>×</span></span></div>`;
    })
    .join("");
  for (const item of document.querySelectorAll<HTMLElement>(".item[data-file]")) item.classList.toggle("on", item.dataset.file === active?.name);
}

function drawCode(): void {
  if (!active) {
    pre.innerHTML = "";
    gutter.textContent = "";
    return;
  }
  active.text = area.value;
  pre.innerHTML = highlight(active.name, area.value) + "\n";
  const lines = area.value.split("\n").length;
  const { line, col } = caretLine();
  gutter.innerHTML = Array.from({ length: Math.max(1, lines - (area.value.endsWith("\n") ? 1 : 0)) }, (_, i) => (i === line ? `<span class="cur">${i + 1}</span>` : String(i + 1))).join("\n");
  curline.style.top = `${PAD_TOP + line * LINE - 1}px`;
  $(".pos").textContent = `Ln ${line + 1}, Col ${col + 1}`;
  $(".lang").textContent = language(active.name);
  crumbs.innerHTML = `<span>prep-coach</span><span>›</span>${iconFor(active.name)}<span>${active.name}</span>`;
  drawTabs();
  drawSuggest();
}

function caretLine(): { line: number; col: number } {
  const before = area.value.slice(0, area.selectionStart);
  const line = before.split("\n").length - 1;
  return { line, col: before.length - before.lastIndexOf("\n") - 1 };
}

let suggestSel = 0;
function drawSuggest(): void {
  const before = area.value.slice(0, area.selectionStart);
  const line = before.slice(before.lastIndexOf("\n") + 1);
  const hit = active?.name.endsWith(".ts") && document.activeElement === area ? MEMBERS.map((m) => ({ m, x: m.after.exec(line) })).find((h) => h.x) : undefined;
  const typed = hit?.x?.[1] ?? "";
  const items = hit ? hit.m.items.filter(([n]) => n.toLowerCase().startsWith(typed.toLowerCase())) : [];
  if (!hit || items.length === 0) {
    suggest.classList.remove("on");
    return;
  }
  const { line: l, col } = caretLine();
  suggest.style.left = `${4 + (col - typed.length) * charW - 30}px`;
  suggest.style.top = `${PAD_TOP + (l + 1) * LINE + 2}px`;
  suggestSel = Math.min(suggestSel, items.length - 1);
  suggest.innerHTML = items
    .slice(0, 8)
    .map(([n, sig, kind], i) => `<div class="${i === 0 ? "sel" : ""}"><i class="${kind === "prop" ? "prop" : ""}">${kind === "prop" ? "◇" : "⬡"}</i><span><em>${esc(n.slice(0, typed.length))}</em>${esc(n.slice(typed.length))}</span>${i === 0 && sig ? `<small>${esc(sig)}</small>` : ""}</div>`)
    .join("");
  suggest.classList.add("on");
}

function openFile(name: FileName): void {
  if (active) {
    active.text = area.value;
    active.sel = area.selectionStart;
  }
  if (!open.includes(name)) open.push(name);
  active = docs.get(name)!;
  area.value = active.text;
  area.setSelectionRange(active.sel, active.sel);
  area.focus({ preventScroll: true });
  drawCode();
}

function closeFile(name: FileName): void {
  open = open.filter((n) => n !== name);
  if (active?.name === name) {
    active = null;
    const next = open.at(-1);
    if (next) openFile(next);
    else {
      area.value = "";
      drawCode();
      drawTabs();
    }
  } else drawTabs();
}

/** VS Code's typing help: Enter keeps the indent (one more after an opener), a closer on an empty line steps back. */
area.addEventListener("keydown", (e) => {
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.key.toLowerCase() === "s") {
    e.preventDefault();
    if (active) active.saved = area.value;
    drawTabs();
    return;
  }
  if (meta && e.key.toLowerCase() === "v") {
    e.preventDefault();
    document.execCommand("insertText", false, code.clip);
    return;
  }
  if (e.key === "Escape") {
    suggest.classList.remove("on");
    return;
  }
  if (e.key === "Enter" && !meta) {
    e.preventDefault();
    suggest.classList.remove("on");
    const before = area.value.slice(0, area.selectionStart);
    const line = before.slice(before.lastIndexOf("\n") + 1);
    let indent = /^\s*/.exec(line)![0];
    if (/[{([]\s*$/.test(line)) indent += "  ";
    document.execCommand("insertText", false, "\n" + indent);
    return;
  }
  if (e.key.length === 1 && ")]}".includes(e.key)) {
    const before = area.value.slice(0, area.selectionStart);
    const line = before.slice(before.lastIndexOf("\n") + 1);
    if (line.length >= 2 && /^\s+$/.test(line)) {
      e.preventDefault();
      area.setSelectionRange(area.selectionStart - 2, area.selectionStart);
      document.execCommand("insertText", false, e.key);
    }
  }
});
area.addEventListener("input", drawCode);
area.addEventListener("blur", () => suggest.classList.remove("on"));
document.addEventListener("selectionchange", () => document.activeElement === area && drawCode());

document.addEventListener("click", (e) => {
  const el = e.target as HTMLElement;
  const item = el.closest<HTMLElement>(".item[data-file]");
  if (item) openFile(item.dataset.file as FileName);
  const x = el.closest<HTMLElement>(".x");
  const tab = el.closest<HTMLElement>("[data-tab]");
  if (x && tab) closeFile(tab.dataset.tab as FileName);
  else if (tab) openFile(tab.dataset.tab as FileName);
  if (el.closest(".close-docs")) code.closeDocs();
  if (el.closest(".maxi")) code.maximize(!$(".work").classList.contains("maxed"));
  if (el.closest(".term")) termFocus();
});

/** The command palette: Cmd+Shift+P, a filtered list of commands, Enter runs the first. */
const palette = $(".palette");
const pin = $<HTMLInputElement>(".palette input");
const COMMANDS = ["Simple Browser: Show", "Terminal: Create New Terminal", "View: Toggle Primary Side Bar Visibility", "File: New Untitled Text File", "Preferences: Color Theme", "TypeScript: Restart TS Server"];
let paletteMode: "commands" | "url" = "commands";
function drawPalette(): void {
  const q = pin.value.replace(/^>\s*/, "").toLowerCase();
  const ul = $(".palette ul");
  if (paletteMode === "url") {
    $(".palette .hint").textContent = "Enter url to visit";
    ul.innerHTML = "";
    return;
  }
  $(".palette .hint").textContent = "";
  const hits = COMMANDS.filter((c) => c.toLowerCase().includes(q));
  ul.innerHTML = hits
    .slice(0, 6)
    .map((c, i) => {
      const at = q ? c.toLowerCase().indexOf(q) : -1;
      const label = at >= 0 ? `${esc(c.slice(0, at))}<em>${esc(c.slice(at, at + q.length))}</em>${esc(c.slice(at + q.length))}` : esc(c);
      return `<li class="${i === 0 ? "sel" : ""}">${label}${i === 0 && c.startsWith("Simple") ? "<small>recently used</small>" : ""}</li>`;
    })
    .join("");
}
pin.addEventListener("input", drawPalette);
pin.addEventListener("keydown", (e) => {
  if (e.key === "Escape") return void palette.classList.remove("on");
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (paletteMode === "commands") {
    const first = $(".palette li.sel")?.textContent?.replace("recently used", "") ?? "";
    if (first.startsWith("Simple Browser")) {
      paletteMode = "url";
      pin.value = "";
      pin.placeholder = "https://example.com";
      drawPalette();
    } else palette.classList.remove("on");
    return;
  }
  palette.classList.remove("on");
  code.showDocs(pin.value.trim());
});
document.addEventListener("keydown", (e) => {
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.shiftKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    paletteMode = "commands";
    pin.value = ">";
    pin.placeholder = "";
    palette.classList.add("on");
    pin.focus({ preventScroll: true });
    pin.setSelectionRange(1, 1);
    drawPalette();
  }
  if (meta && !e.shiftKey && e.key.toLowerCase() === "b") {
    e.preventDefault();
    $(".side").classList.toggle("off");
  }
});

/** The terminal: a zsh prompt in the app's folder, a command line that takes keys, and what the film prints. */
const term = $<HTMLPreElement>(".term");
const tcursor = document.createElement("span");
tcursor.className = "cursor";
function termFocus(): void {
  const cmd = term.querySelector<HTMLElement>(".cmd[contenteditable]");
  if (!cmd) return;
  cmd.focus({ preventScroll: true });
  const r = document.createRange();
  r.selectNodeContents(cmd);
  r.collapse(false);
  const sel = getSelection()!;
  sel.removeAllRanges();
  sel.addRange(r);
}
const termApi = {
  prompt(): void {
    if (term.childNodes.length > 0) term.append("\n");
    const ps = document.createElement("span");
    ps.innerHTML = '<span class="ps">maya@mac</span> <span class="cwd">prep-coach</span> % ';
    const cmd = document.createElement("span");
    cmd.className = "cmd";
    cmd.contentEditable = "plaintext-only";
    cmd.spellcheck = false;
    cmd.addEventListener("keydown", (e) => e.key === "Enter" && e.preventDefault());
    tcursor.classList.remove("busy");
    term.append(ps, cmd, tcursor);
  },
  focus: termFocus,
  ran(): void {
    const cmd = term.querySelector<HTMLElement>(".cmd[contenteditable]");
    if (cmd) {
      cmd.removeAttribute("contenteditable");
      cmd.blur();
    }
    tcursor.classList.add("busy");
    term.append("\n", tcursor);
  },
  line(text: string): void {
    tcursor.before(`${text}\n`);
    term.scrollTop = term.scrollHeight;
  },
  /** Words added to the line being written, as a model's answer streams in. */
  words(text: string): void {
    tcursor.before(text);
    term.scrollTop = term.scrollHeight;
  },
  done(): void {
    const last = tcursor.previousSibling;
    if (last?.nodeType === Node.TEXT_NODE && last.textContent?.endsWith("\n")) last.textContent = last.textContent.slice(0, -1);
    tcursor.remove();
  },
  clear(): void {
    term.replaceChildren();
  },
};

/** What the film calls on this page. */
const code = {
  /** What Cmd+V pastes: the film copies into it. */
  clip: "",
  term: termApi,
  open: openFile,
  text: () => area.value,
  /** Where a line and column of the open file is drawn, in the page's pixels (the middle of that character). */
  point(line: number, col: number): { x: number; y: number } {
    const box = area.getBoundingClientRect();
    return { x: box.left + 4 + (col + 0.5) * charW, y: box.top + PAD_TOP + line * LINE + LINE / 2 };
  },
  /** The line and column where `text` first starts in the open file, or at its end with `after`. */
  find(text: string, after = false): { line: number; col: number } {
    const at = area.value.indexOf(text);
    if (at < 0) throw new Error(`not in the file: ${text}`);
    const before = area.value.slice(0, at + (after ? text.length : 0));
    return { line: before.split("\n").length - 1, col: before.length - before.lastIndexOf("\n") - 1 };
  },
  /** Puts the caret at a line and column, as the click there would. */
  caret(line: number, col: number): void {
    const lines = area.value.split("\n");
    let at = 0;
    for (let i = 0; i < line; i++) at += lines[i]!.length + 1;
    at += Math.min(col, lines[line]?.length ?? 0);
    area.focus({ preventScroll: true });
    area.setSelectionRange(at, at);
    drawCode();
  },
  sidebar(on: boolean): void {
    $(".side").classList.toggle("off", !on);
  },
  showDocs(typed: string): void {
    const url = typed.replace(/^https?:\/\//, "");
    const path = url.slice(url.indexOf("/")) || "/";
    $("#g2").classList.remove("off");
    $(".addr").textContent = `https://${url}`;
    const old = document.querySelector(".browser iframe");
    old?.remove();
    const frame = document.createElement("iframe");
    frame.src = path;
    // Drawn once the film has put the page where the person last read it.
    frame.style.visibility = "hidden";
    $(".browser").append(frame);
  },
  docsFrame: () => document.querySelector<HTMLIFrameElement>(".browser iframe"),
  closeDocs(): void {
    $("#g2").classList.add("off");
    document.querySelector(".browser iframe")?.remove();
  },
  maximize(on: boolean): void {
    $(".work").classList.toggle("maxed", on);
    $(".maxi").innerHTML = on ? ICON.min : ICON.max;
  },
  /** Back to the app as it was, for the film's next run. */
  reset(): void {
    for (const name of TREE) docs.set(name, { name, text: FILES[name], saved: FILES[name], sel: 0 });
    open = [];
    active = null;
    openFile("app.ts");
  },
};
Object.assign(window, { __code: code });

termApi.prompt();
void document.fonts.ready.then(() => {
  measure();
  openFile("app.ts");
  area.setSelectionRange(0, 0);
  drawCode();
  area.blur();
});
