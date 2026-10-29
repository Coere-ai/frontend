import { PlatformLogo } from "@v2/packages/ui/src/logos/PlatformLogo";
import { platformName } from "@v2/packages/ui/src/logos/platform-info";
import { render } from "preact";
import { useRef, useState } from "preact/hooks";
import forge from "./data/forge.json";
import { SNIPPETS, type Ai } from "./snippets";

/**
 * Any AI: the same lines that get Coere's context for what the user typed,
 * in front of the prompt to each AI. A code card with a chip per AI (its
 * logo from coere-v2's own PlatformLogo), the call for that AI, and a grid
 * of the AIs, each lighting up as the context flows into it. The block
 * under the code is the one the real client got for the film's draft
 * (bake.mts).
 */

const FONT = "/preview/live/lib/ext/fonts/";
const CSS = `
@font-face{font-family:Geist;src:url(${FONT}Geist-Variable.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(${FONT}GeistMono-Variable.woff2) format("woff2");font-weight:100 900}
:root{--ink:#080e24;--soft:rgba(8,14,36,.6);--line:#e6e8f0;--accent:#5267f7;--card:#0b1020}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:radial-gradient(1100px 520px at 50% 115%,rgba(82,103,247,.10),transparent 70%),#fff;color:var(--ink);font:16px/1.45 Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.page{position:absolute;inset:0;padding:64px 84px 0}
header{text-align:center;margin-bottom:40px}
header h1{margin:0;font-size:46px;line-height:1.1;font-weight:600;letter-spacing:-.02em}
header p{margin:12px 0 0;font-size:20px;color:var(--soft)}
.row{display:flex;gap:48px;align-items:flex-start;justify-content:center}
.card{width:690px;flex:none;background:var(--card);border-radius:22px;box-shadow:0 18px 50px rgba(8,14,36,.18);overflow:hidden}
.chips{display:flex;gap:6px;padding:14px 16px;border-bottom:1px solid #1d2440}
.chip{width:58px;height:44px;border-radius:12px;border:1px solid transparent;display:grid;place-items:center;background:#141a33;cursor:pointer;transition:background .2s,border-color .2s}
.chip.on{background:#fff;border-color:#fff}
.chip svg{filter:grayscale(1) brightness(1.7);opacity:.75;transition:filter .2s,opacity .2s}
.chip.on svg{filter:none;opacity:1}
.file{display:flex;align-items:center;gap:8px;padding:12px 22px 0;color:#8b93b8;font:13px/1 "Geist Mono",monospace}
.file b{width:7px;height:7px;border-radius:50%;background:var(--accent)}
pre{margin:0;padding:14px 22px 22px;height:322px;color:#d4d4d4;font:14.5px/1.62 "Geist Mono",ui-monospace,monospace;white-space:pre;transition:opacity .18s}
pre.swap{opacity:0}
.k{color:#569cd6}.c{color:#c586c0}.s{color:#ce9178}.n{color:#b5cea8}.t{color:#4ec9b0}.v{color:#9cdcfe}.m{color:#6a9955}.f{color:#dcdcaa}
mark{background:rgba(82,103,247,.32);color:#fff;border-radius:5px;padding:1px 3px;margin:0 -3px}
.block{border-top:1px solid #1d2440;padding:14px 22px 18px;color:#aab2d5;font:12.5px/1.6 "Geist Mono",monospace;white-space:pre;height:118px;overflow:hidden;-webkit-mask-image:linear-gradient(#000 55%,transparent)}
.block span{color:#6d77a8}
.grid{display:grid;grid-template-columns:repeat(3,172px);gap:16px}
.tile{height:156px;border-radius:22px;border:1px solid var(--line);background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;transition:border-color .35s,box-shadow .35s,transform .35s}
.tile svg{filter:grayscale(1);opacity:.4;transition:filter .35s,opacity .35s}
.tile .name{font-size:16px;font-weight:500;color:var(--soft);transition:color .35s}
.tile .state{height:18px;font-size:12.5px;color:var(--accent);opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s;display:flex;align-items:center;gap:6px}
.tile .state::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--accent)}
.tile.lit{border-color:rgba(82,103,247,.55);box-shadow:0 0 0 4px rgba(82,103,247,.10),0 10px 26px rgba(82,103,247,.14)}
.tile.lit svg{filter:none;opacity:1}
.tile.lit .name{color:var(--ink)}
.tile.lit .state{opacity:1;transform:none}
.tile.now{transform:translateY(-3px)}
.pill{position:absolute;left:0;top:0;padding:5px 11px;border-radius:999px;background:var(--accent);color:#fff;font:600 13px/1 "Geist Mono",monospace;box-shadow:0 6px 18px rgba(82,103,247,.4);pointer-events:none;opacity:0;z-index:5}
`;

const AIS: Ai[] = ["chatgpt", "claude", "gemini", "deepseek", "kimi", "perplexity", "grok", "copilot", "meta_ai"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The site's code colors: keywords, strings, types and calls, with `ctx.block` marked. */
function colored(src: string): string {
  const re = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|(\bctx\.block\b)|(\b\d[\d_]*\b)|([A-Za-z_$][\w$]*)|([\s\S])/g;
  const control = new Set(["import", "from", "await", "return", "export"]);
  const storage = new Set(["const", "new", "async", "function", "true", "false"]);
  let out = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [all, comment, str, block, num, word] = m;
    if (comment) out += `<span class="m">${esc(all)}</span>`;
    else if (str) out += `<span class="${/^"[^"]*"\s*:/.test(src.slice(m.index)) ? "v" : "s"}">${esc(all)}</span>`;
    else if (block) out += "<mark>ctx.block</mark>";
    else if (num) out += `<span class="n">${all}</span>`;
    else if (word) {
      const cls = control.has(word) ? "c" : storage.has(word) ? "k" : /^\s*\(/.test(src.slice(re.lastIndex)) ? "f" : /^[A-Z]/.test(word) ? "t" : "v";
      out += `<span class="${cls}">${word}</span>`;
    } else out += esc(all);
  }
  return out;
}

const BLOCK = (forge.context.block as string).trimEnd().split("\n");

function App() {
  const [ai, setAi] = useState<Ai>("chatgpt");
  const [lit, setLit] = useState<Ai[]>([]);
  const [now, setNow] = useState<Ai | null>(null);
  const [swap, setSwap] = useState(false);
  const [shown, setShown] = useState<Ai>("chatgpt");
  const pill = useRef<HTMLDivElement>(null);
  const code = useRef<HTMLPreElement>(null);

  // A new AI: the code fades over to its call, then the context flows from `ctx.block` to its tile.
  const pick = (next: Ai) => {
    if (next === ai && lit.includes(next)) return;
    setAi(next);
    setSwap(true);
    setTimeout(() => {
      setShown(next);
      setSwap(false);
      setTimeout(() => flow(next), 260);
    }, 180);
  };

  const flow = (to: Ai) => {
    const el = pill.current;
    const tile = document.querySelector(`.tile[data-ai="${to}"]`);
    const from = code.current?.querySelector("mark") ?? document.querySelector(".file");
    if (!el || !tile || !from) return;
    const a = from.getBoundingClientRect();
    const b = tile.getBoundingClientRect();
    el.style.transition = "none";
    el.style.transform = `translate(${a.left}px, ${a.top - 3}px)`;
    el.style.opacity = "1";
    void el.offsetWidth;
    el.style.transition = "transform .75s cubic-bezier(.45,0,.2,1), opacity .25s .62s";
    el.style.transform = `translate(${b.left + b.width / 2 - el.offsetWidth / 2}px, ${b.top + b.height / 2 - 12}px) scale(.85)`;
    el.style.opacity = "0";
    setTimeout(() => {
      setLit((l) => (l.includes(to) ? l : [...l, to]));
      setNow(to);
    }, 700);
  };

  const snippet = SNIPPETS[shown];
  return (
    <div class="page">
      <header>
        <h1>Works with every AI</h1>
        <p>Coere's context is plain text. Put it in front of the prompt, for any model.</p>
      </header>
      <div class="row">
        <div class="card">
          <div class="chips" role="tablist" aria-label="AI">
            {AIS.map((id) => (
              <button type="button" role="tab" aria-selected={id === ai} aria-label={platformName(id)} data-ai={id} class={`chip${id === ai ? " on" : ""}`} onClick={() => pick(id)} style="border:0;padding:0">
                <PlatformLogo platform={id} size={24} decorative />
              </button>
            ))}
          </div>
          <div class="file">
            <b />
            {snippet.file}
          </div>
          <pre ref={code} class={swap ? "swap" : ""} dangerouslySetInnerHTML={{ __html: colored(snippet.code) }} />
          <div class="block">
            <span>ctx.block</span>
            {"\n" + BLOCK.slice(0, 5).join("\n")}
          </div>
        </div>
        <div class="grid">
          {AIS.map((id) => (
            <div class={`tile${lit.includes(id) ? " lit" : ""}${now === id ? " now" : ""}`} data-ai={id}>
              <PlatformLogo platform={id} size={46} decorative />
              <span class="name">{platformName(id)}</span>
              <span class="state">{SNIPPETS[id].via}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={pill} class="pill">
        ctx.block
      </div>
    </div>
  );
}

const style = document.createElement("style");
style.textContent = CSS;
document.head.append(style);
document.title = "Any AI";
render(<App />, document.getElementById("app")!);
