"use strict";(()=>{var s=`
html,body{margin:0;height:100%;background:#f6f7f9;font:15px/1.6 ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace}
body{display:grid;place-items:center}
.win{width:1180px;height:780px;display:flex;flex-direction:column;border:1px solid #e3e6ec;border-radius:14px;background:#fff;box-shadow:0 12px 40px #0000001a;overflow:hidden}
.bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#eef0f3;border-bottom:1px solid #e3e6ec;color:#6b7280;font:500 13px Geist,system-ui,sans-serif}
.dot{width:11px;height:11px;border-radius:50%;background:#dcdfe5}.title{margin-left:10px}
pre{flex:1;margin:0;padding:20px 24px 24px;color:#1d2333;white-space:pre-wrap;overflow:hidden;font:inherit}
.cmd{color:#4355cd;outline:none;caret-color:transparent}.dim{color:#6b7280}
.cursor{display:inline-block;width:.6em;height:1.15em;margin-left:1px;vertical-align:-.2em;background:#4355cd;opacity:.75;animation:blink 1.05s steps(1) infinite}
.cursor.busy{animation:none;opacity:.75}
@keyframes blink{50%{opacity:0}}
@font-face{font-family:Geist;src:url(/preview/live/lib/ext/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}
`,a=document.createElement("style");a.textContent=s;document.head.append(a);document.title=new URLSearchParams(location.search).get("title")??"Terminal";document.body.innerHTML='<div class="win"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="title"></span></div><pre></pre></div>';document.querySelector(".title").textContent=document.title;var t=document.querySelector("pre"),n=document.createElement("span");n.className="cursor";var r={prompt(){t.childNodes.length>0&&t.append(`
`);let e=document.createElement("span");e.className="dim",e.textContent="$ ";let o=document.createElement("span");return o.className="cmd",o.contentEditable="plaintext-only",o.spellcheck=!1,o.addEventListener("keydown",i=>i.key==="Enter"&&i.preventDefault()),n.classList.remove("busy"),t.append(e,o,n),o.focus(),o},ran(){let e=t.querySelector(".cmd[contenteditable]");e&&(e.removeAttribute("contenteditable"),e.blur()),n.classList.add("busy"),t.append(`
`,n)},line(e){n.before(`${e}
`),t.scrollTop=t.scrollHeight},done(){let e=n.previousSibling;e?.nodeType===Node.TEXT_NODE&&e.textContent?.endsWith(`
`)&&(e.textContent=e.textContent.slice(0,-1)),n.remove()},clear(){t.replaceChildren()}};Object.assign(window,{__term:r});})();
