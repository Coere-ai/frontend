/**
 * What the demo page draws over the tabs, in the films' look: macOS's
 * arrow for the pointer (coere-v2 tools/demo-video stage/act.ts), the
 * title cards in white with the accent and the Coere mark (stage/cards.ts),
 * and the caption line, which stays hidden unless asked for.
 */
export const STAGE = { width: 1440, height: 900 } as const;

const MARK = '<svg viewBox="0 0 512 512" width="56" height="56" fill="#5267f7" aria-hidden="true"><path d="M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z"/><path d="M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z" transform="rotate(180 256 256)"/></svg>';

const ARROW = '<svg width="23" height="27" viewBox="0 0 23 27"><path d="M5 3 L5 20.6 L9.1 16.8 L11.6 22.7 L14.6 21.4 L12.1 15.6 L17.7 15.6 Z" fill="#000" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';

export const CSS = `
@font-face{font-family:Geist;src:url(/preview/live/lib/ext/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}
html,body{margin:0;height:100%;background:#fff;overflow:hidden}
#view{position:fixed;inset:0;overflow:hidden}
#stage{position:absolute;left:50%;top:50%;width:${STAGE.width}px;height:${STAGE.height}px;overflow:hidden;background:#fff;transform-origin:center;transform:translate(-50%,-50%)}
#camera{position:absolute;inset:0;transform-origin:0 0}
#tabs iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;opacity:0;visibility:hidden;transition:opacity .28s ease}
#tabs iframe.on{opacity:1;visibility:visible}
#card{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(1200px 600px at 50% 110%,rgba(82,103,247,.10),transparent 70%),#fff;color:#080e24;font-family:Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s}
#card.on{opacity:1;visibility:visible}
#card main{display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center}
#card.on main{animation:in .6s cubic-bezier(.2,.8,.2,1) both}
#card h1{margin:0;font-size:64px;line-height:1.1;font-weight:600;letter-spacing:-.02em}
#card p{margin:0;font-size:26px;color:rgba(8,14,36,.62);max-width:900px;line-height:1.4}
@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
#pointer{position:absolute;left:0;top:0;width:23px;height:27px;margin:-3px 0 0 -5px;pointer-events:none;z-index:10;opacity:0;line-height:0;transform-origin:5px 3px;transform:scale(1.2);filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.32));transition:opacity .2s,transform .09s ease-out}
#pointer.down{transform:scale(1.06)}
#caption{position:absolute;left:50%;bottom:40px;transform:translateX(-50%);max-width:1000px;padding:12px 20px;border-radius:14px;background:rgba(8,14,36,.82);color:#fff;font:500 22px/1.4 Geist,system-ui,sans-serif;text-align:center;z-index:11;display:none}
#caption.on{display:block}
#caption.on:empty{display:none}
#cover{position:absolute;inset:0;background:#fff;z-index:12;opacity:1;transition:opacity .5s ease;pointer-events:none}
#cover.off{opacity:0}
`;

export function stageHtml(): string {
  return `<div id="view"><div id="stage"><div id="camera"><div id="tabs"></div><div id="card"></div></div><div id="pointer">${ARROW}</div><div id="caption"></div><div id="cover"></div></div></div>`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function cardHtml(title: string, line?: string): string {
  return `<main>${MARK}${title ? `<h1>${esc(title)}</h1>` : ""}${line ? `<p>${esc(line)}</p>` : ""}</main>`;
}
