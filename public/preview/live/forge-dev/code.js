"use strict";(()=>{var L={".env":`ANTHROPIC_API_KEY=sk-ant-api03-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022
`,".gitignore":`node_modules
.env
`,"app.ts":`import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic()

export async function reply(text: string) {
  const msg = await claude.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    messages: [{ role: 'user', content: text }],
  })
  return msg.content.find((b) => b.type === 'text')?.text
}

console.log(await reply(process.argv[2]))
`,"package.json":`{
  "name": "prep-coach",
  "private": true,
  "type": "module",
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "@coere/client": "link:../coere-v2/packages/client"
  },
  "devDependencies": {
    "tsx": "latest"
  }
}
`,"tsconfig.json":`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  }
}
`},C=[".env",".gitignore","app.ts","package.json","tsconfig.json"];var D="/preview/live/lib/ext/fonts/",y=23,E=6,K=`
@font-face{font-family:Geist;src:url(${D}Geist-Variable.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:"Geist Mono";src:url(${D}GeistMono-Variable.woff2) format("woff2");font-weight:100 900}
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
.ed{flex:1;display:flex;position:relative;min-height:0;overflow:hidden;font:15px/${y}px var(--mono)}
.gutter{width:62px;flex:none;text-align:right;padding:${E}px 22px 0 0;color:#6e7681;white-space:pre}
.gutter .cur{color:#cccccc}
.code{flex:1;position:relative;min-width:0}
.code pre,.code textarea{position:absolute;inset:0;margin:0;padding:${E}px 0 0 4px;font:inherit;white-space:pre;overflow:hidden;tab-size:2;letter-spacing:0}
.code pre{color:#d4d4d4;pointer-events:none}
.code .curline{position:absolute;left:0;right:0;height:${y}px;border-top:1px solid #282828;border-bottom:1px solid #282828;pointer-events:none}
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
`,l={files:'<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7z"/><path d="M14 3v4h4"/><path d="M9 21h9a2 2 0 0 0 2-2V9"/></svg>',search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></svg>',git:'<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="8" r="2.2"/><path d="M6 8.2v7.6M18 10.2c0 4-6 3-11 6"/></svg>',run:'<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg>',ext:'<svg viewBox="0 0 24 24"><rect x="4" y="10" width="6" height="6"/><rect x="10" y="10" width="6" height="6"/><rect x="4" y="16" width="6" height="4" transform="translate(0 0)"/><rect x="14" y="4" width="6" height="6"/></svg>',chev:'<svg class="chev" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4"/></svg>',down:'<svg class="chev" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></svg>',back:'<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4 3 8l4 4"/></svg>',fwd:'<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',reload:'<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 3v3h-3"/></svg>',max:'<svg viewBox="0 0 16 16"><path d="m4 10 4-4 4 4"/></svg>',min:'<svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4"/></svg>',plus:'<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',branch:'<svg viewBox="0 0 16 16"><circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="5" r="1.5"/><path d="M4.5 5v6M11.5 6.5c0 3-4 2.5-7 4.5"/></svg>',globe:'<svg viewBox="0 0 16 16" style="width:14px;height:14px;fill:none;stroke:#75beff;stroke-width:1.3"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/></svg>'};function R(e){return e.endsWith(".ts")?'<span class="ico ts">TS</span>':e.endsWith(".json")?'<span class="ico json">{ }</span>':e===".env"?'<span class="ico env">\u2699</span>':e===".gitignore"?'<span class="ico git">\u25C6</span>':'<span class="ico dir"></span>'}var c=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),V=new Set(["import","from","export","return","await","if","else","for","of","while","break","continue","throw","try","catch"]),U=new Set(["const","let","var","new","async","function","true","false","null","undefined","typeof","this","class","extends","type","interface","in","as"]),Z=new Set(["string","number","boolean","void","unknown","any"]);function X(e){let t=/(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'?|"(?:[^"\\\n]|\\.)*"?|`(?:[^`\\]|\\.)*`?)|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)|([()[\]{}])|(\s+)|([^\s\w])/g,n="",s=0,i;for(;i=t.exec(e);){let[p,u,d,M,x,b]=i;if(u)n+=`<span class="m">${c(p)}</span>`;else if(d)n+=`<span class="s">${c(p)}</span>`;else if(M)n+=`<span class="n">${p}</span>`;else if(x){let S=e.slice(t.lastIndex),q=e.slice(0,i.index).trimEnd(),w="v";V.has(x)?w="c":U.has(x)?w="k":Z.has(x)?w="t":/^\s*\(/.test(S)?w="f":/^[A-Z]/.test(x)&&!q.endsWith(".")&&(w="t"),n+=`<span class="${w}">${x}</span>`}else if(b){let S="([{".includes(b);S||(s=Math.max(0,s-1)),n+=`<span class="b${s%3+1}">${b}</span>`,S&&s++}else n+=`<span class="p">${c(p)}</span>`}return n}function J(e){return e.replace(/("(?:[^"\\]|\\.)*")(\s*:)?|(\b(?:true|false|null)\b)|(\b\d+\b)|([{}[\],:])|([^"{}[\],:\s]+)/g,(t,n,s,i,p,u)=>n?s?`<span class="v">${c(n)}</span><span class="p">${s}</span>`:`<span class="s">${c(n)}</span>`:i?`<span class="k">${i}</span>`:p?`<span class="n">${p}</span>`:u?`<span class="p">${u}</span>`:c(t))}function Y(e){return e.split(`
`).map(t=>{let n=/^([A-Z_][A-Z0-9_]*)(=)(.*)$/.exec(t);return n?`<span class="v">${n[1]}</span><span class="p">=</span><span class="s">${c(n[3])}</span>`:`<span class="m">${c(t)}</span>`}).join(`
`)}var Q=(e,t)=>e.endsWith(".ts")?X(t):e.endsWith(".json")?J(t):e===".gitignore"?c(t):Y(t),ee=e=>e.endsWith(".ts")?"TypeScript":e.endsWith(".json")?"JSON":e===".env"?"Environment Variables":"Ignore",te=[{after:/\bcoere\.context\.(\w*)$/,items:[["forDraft","(draft: string, options?: DraftOptions): Promise<DraftContext>","fn"],["sent","(receipt: string): Promise<number>","fn"]]},{after:/\bctx\.(\w*)$/,items:[["also","","prop"],["block","string","prop"],["chars","number","prop"],["chat","string | null","prop"],["first","boolean","prop"],["fromChats","number","prop"],["items","DraftItem[]","prop"],["receipt","string | null","prop"],["sources","","prop"],["tokens","number","prop"]]},{after:/\bcoere\.(\w*)$/,items:[["changes","","fn"],["clients","","prop"],["context","ContextResource","prop"],["corePack","","fn"],["entities","","prop"],["export","","fn"],["facts","","prop"],["health","","fn"],["me","","fn"],["nodes","","prop"],["people","","prop"],["profile","","fn"],["search","","fn"]]}],I=document.createElement("style");I.textContent=K;document.head.append(I);document.title="prep-coach";document.body.innerHTML=`
<div class="vs">
  <div class="titlebar"><div class="lights"><i></i><i></i><i></i></div><div class="search">${l.search.replace("<svg",'<svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.6"')} prep-coach</div></div>
  <div class="main">
    <div class="act"><b class="on">${l.files}</b><b>${l.search}</b><b>${l.git}</b><b>${l.run}</b><b>${l.ext}</b></div>
    <div class="side">
      <h2>EXPLORER</h2>
      <div class="folder">${l.down}PREP-COACH</div>
      <div class="item" style="padding-left:8px">${l.chev}<span>node_modules</span></div>
      ${C.map(e=>`<div class="item" data-file="${e}">${R(e)}<span>${e}</span></div>`).join("")}
    </div>
    <div class="work">
      <div class="groups">
        <div class="group" id="g1">
          <div class="tabs"></div>
          <div class="crumbs"></div>
          <div class="ed"><div class="gutter"></div><div class="code"><div class="curline"></div><pre></pre><textarea spellcheck="false" autocomplete="off" wrap="off" aria-label="Editor"></textarea><div class="suggest"></div></div></div>
        </div>
        <div class="group off" id="g2">
          <div class="tabs"><div class="tab on">${l.globe}<span>Simple Browser</span><span class="x close-docs" role="button" aria-label="Close Simple Browser"><span>\xD7</span></span></div></div>
          <div class="browser"><div class="nav"><b>${l.back}</b><b>${l.fwd}</b><b>${l.reload}</b><div class="addr"></div></div></div>
        </div>
      </div>
      <div class="panel">
        <div class="ptabs"><span>PROBLEMS</span><span>OUTPUT</span><span>DEBUG CONSOLE</span><span class="on">TERMINAL</span><span>PORTS</span>
          <div class="tools"><b>${l.plus}</b><b class="maxi" role="button" aria-label="Maximize Panel Size">${l.max}</b></div></div>
        <pre class="term"></pre>
      </div>
    </div>
  </div>
  <div class="status"><span class="remote">&gt;&lt;</span><span>${l.branch}main</span><span>\u2297 0  \u26A0 0</span><div class="right"><span class="pos"></span><span>Spaces: 2</span><span>UTF-8</span><span>LF</span><span class="lang"></span></div></div>
  <div class="palette"><input spellcheck="false" aria-label="Command palette"><div class="hint"></div><ul></ul></div>
</div>`;var a=e=>document.querySelector(e),o=a("textarea"),j=a(".code pre"),A=a(".gutter"),ne=a(".curline"),h=a(".suggest"),se=a("#g1 .tabs"),oe=a(".crumbs"),O=new Map;for(let e of C)O.set(e,{name:e,text:L[e],saved:L[e],sel:0});var v=[],r=null,B=9;function ie(){let e=document.createElement("span");e.style.cssText="position:absolute;visibility:hidden;font:15px var(--mono);white-space:pre",e.textContent="x".repeat(100),document.body.append(e),B=e.getBoundingClientRect().width/100,e.remove()}function H(){se.innerHTML=v.map(e=>{let t=O.get(e);return`<div class="tab${t===r?" on":""}${t.text!==t.saved?" dirty":""}" data-tab="${e}">${R(e)}<span>${e}</span><span class="x" role="button" aria-label="Close ${e}"><span>\xD7</span></span></div>`}).join("");for(let e of document.querySelectorAll(".item[data-file]"))e.classList.toggle("on",e.dataset.file===r?.name)}function $(){if(!r){j.innerHTML="",A.textContent="";return}r.text=o.value,j.innerHTML=Q(r.name,o.value)+`
`;let e=o.value.split(`
`).length,{line:t,col:n}=W();A.innerHTML=Array.from({length:Math.max(1,e-(o.value.endsWith(`
`)?1:0))},(s,i)=>i===t?`<span class="cur">${i+1}</span>`:String(i+1)).join(`
`),ne.style.top=`${E+t*y-1}px`,a(".pos").textContent=`Ln ${t+1}, Col ${n+1}`,a(".lang").textContent=ee(r.name),oe.innerHTML=`<span>prep-coach</span><span>\u203A</span>${R(r.name)}<span>${r.name}</span>`,H(),ae()}function W(){let e=o.value.slice(0,o.selectionStart);return{line:e.split(`
`).length-1,col:e.length-e.lastIndexOf(`
`)-1}}var P=0;function ae(){let e=o.value.slice(0,o.selectionStart),t=e.slice(e.lastIndexOf(`
`)+1),n=r?.name.endsWith(".ts")&&document.activeElement===o?te.map(d=>({m:d,x:d.after.exec(t)})).find(d=>d.x):void 0,s=n?.x?.[1]??"",i=n?n.m.items.filter(([d])=>d.toLowerCase().startsWith(s.toLowerCase())):[];if(!n||i.length===0){h.classList.remove("on");return}let{line:p,col:u}=W();h.style.left=`${4+(u-s.length)*B-30}px`,h.style.top=`${E+(p+1)*y+2}px`,P=Math.min(P,i.length-1),h.innerHTML=i.slice(0,8).map(([d,M,x],b)=>`<div class="${b===0?"sel":""}"><i class="${x==="prop"?"prop":""}">${x==="prop"?"\u25C7":"\u2B21"}</i><span><em>${c(d.slice(0,s.length))}</em>${c(d.slice(s.length))}</span>${b===0&&M?`<small>${c(M)}</small>`:""}</div>`).join(""),h.classList.add("on")}function k(e){r&&(r.text=o.value,r.sel=o.selectionStart),v.includes(e)||v.push(e),r=O.get(e),o.value=r.text,o.setSelectionRange(r.sel,r.sel),o.focus({preventScroll:!0}),$()}function re(e){if(v=v.filter(t=>t!==e),r?.name===e){r=null;let t=v.at(-1);t?k(t):(o.value="",$(),H())}else H()}o.addEventListener("keydown",e=>{let t=e.metaKey||e.ctrlKey;if(t&&e.key.toLowerCase()==="s"){e.preventDefault(),r&&(r.saved=o.value),H();return}if(t&&e.key.toLowerCase()==="v"){e.preventDefault(),document.execCommand("insertText",!1,T.clip);return}if(e.key==="Escape"){h.classList.remove("on");return}if(e.key==="Enter"&&!t){e.preventDefault(),h.classList.remove("on");let n=o.value.slice(0,o.selectionStart),s=n.slice(n.lastIndexOf(`
`)+1),i=/^\s*/.exec(s)[0];/[{([]\s*$/.test(s)&&(i+="  "),document.execCommand("insertText",!1,`
`+i);return}if(e.key.length===1&&")]}".includes(e.key)){let n=o.value.slice(0,o.selectionStart),s=n.slice(n.lastIndexOf(`
`)+1);s.length>=2&&/^\s+$/.test(s)&&(e.preventDefault(),o.setSelectionRange(o.selectionStart-2,o.selectionStart),document.execCommand("insertText",!1,e.key))}});o.addEventListener("input",$);o.addEventListener("blur",()=>h.classList.remove("on"));document.addEventListener("selectionchange",()=>document.activeElement===o&&$());document.addEventListener("click",e=>{let t=e.target,n=t.closest(".item[data-file]");n&&k(n.dataset.file);let s=t.closest(".x"),i=t.closest("[data-tab]");s&&i?re(i.dataset.tab):i&&k(i.dataset.tab),t.closest(".close-docs")&&T.closeDocs(),t.closest(".maxi")&&T.maximize(!a(".work").classList.contains("maxed")),t.closest(".term")&&_()});var N=a(".palette"),g=a(".palette input"),le=["Simple Browser: Show","Terminal: Create New Terminal","View: Toggle Primary Side Bar Visibility","File: New Untitled Text File","Preferences: Color Theme","TypeScript: Restart TS Server"],z="commands";function F(){let e=g.value.replace(/^>\s*/,"").toLowerCase(),t=a(".palette ul");if(z==="url"){a(".palette .hint").textContent="Enter url to visit",t.innerHTML="";return}a(".palette .hint").textContent="";let n=le.filter(s=>s.toLowerCase().includes(e));t.innerHTML=n.slice(0,6).map((s,i)=>{let p=e?s.toLowerCase().indexOf(e):-1,u=p>=0?`${c(s.slice(0,p))}<em>${c(s.slice(p,p+e.length))}</em>${c(s.slice(p+e.length))}`:c(s);return`<li class="${i===0?"sel":""}">${u}${i===0&&s.startsWith("Simple")?"<small>recently used</small>":""}</li>`}).join("")}g.addEventListener("input",F);g.addEventListener("keydown",e=>{if(e.key==="Escape")return void N.classList.remove("on");if(e.key==="Enter"){if(e.preventDefault(),z==="commands"){(a(".palette li.sel")?.textContent?.replace("recently used","")??"").startsWith("Simple Browser")?(z="url",g.value="",g.placeholder="https://example.com",F()):N.classList.remove("on");return}N.classList.remove("on"),T.showDocs(g.value.trim())}});document.addEventListener("keydown",e=>{let t=e.metaKey||e.ctrlKey;t&&e.shiftKey&&e.key.toLowerCase()==="p"&&(e.preventDefault(),z="commands",g.value=">",g.placeholder="",N.classList.add("on"),g.focus({preventScroll:!0}),g.setSelectionRange(1,1),F()),t&&!e.shiftKey&&e.key.toLowerCase()==="b"&&(e.preventDefault(),a(".side").classList.toggle("off"))});var f=a(".term"),m=document.createElement("span");m.className="cursor";function _(){let e=f.querySelector(".cmd[contenteditable]");if(!e)return;e.focus({preventScroll:!0});let t=document.createRange();t.selectNodeContents(e),t.collapse(!1);let n=getSelection();n.removeAllRanges(),n.addRange(t)}var G={prompt(){f.childNodes.length>0&&f.append(`
`);let e=document.createElement("span");e.innerHTML='<span class="ps">maya@mac</span> <span class="cwd">prep-coach</span> % ';let t=document.createElement("span");t.className="cmd",t.contentEditable="plaintext-only",t.spellcheck=!1,t.addEventListener("keydown",n=>n.key==="Enter"&&n.preventDefault()),m.classList.remove("busy"),f.append(e,t,m)},focus:_,ran(){let e=f.querySelector(".cmd[contenteditable]");e&&(e.removeAttribute("contenteditable"),e.blur()),m.classList.add("busy"),f.append(`
`,m)},line(e){m.before(`${e}
`),f.scrollTop=f.scrollHeight},words(e){m.before(e),f.scrollTop=f.scrollHeight},done(){let e=m.previousSibling;e?.nodeType===Node.TEXT_NODE&&e.textContent?.endsWith(`
`)&&(e.textContent=e.textContent.slice(0,-1)),m.remove()},clear(){f.replaceChildren()}},T={clip:"",term:G,open:k,text:()=>o.value,point(e,t){let n=o.getBoundingClientRect();return{x:n.left+4+(t+.5)*B,y:n.top+E+e*y+y/2}},find(e,t=!1){let n=o.value.indexOf(e);if(n<0)throw new Error(`not in the file: ${e}`);let s=o.value.slice(0,n+(t?e.length:0));return{line:s.split(`
`).length-1,col:s.length-s.lastIndexOf(`
`)-1}},caret(e,t){let n=o.value.split(`
`),s=0;for(let i=0;i<e;i++)s+=n[i].length+1;s+=Math.min(t,n[e]?.length??0),o.focus({preventScroll:!0}),o.setSelectionRange(s,s),$()},sidebar(e){a(".side").classList.toggle("off",!e)},showDocs(e){let t=e.replace(/^https?:\/\//,""),n=t.slice(t.indexOf("/"))||"/";a("#g2").classList.remove("off"),a(".addr").textContent=`https://${t}`,document.querySelector(".browser iframe")?.remove();let i=document.createElement("iframe");i.src=n,i.style.visibility="hidden",a(".browser").append(i)},docsFrame:()=>document.querySelector(".browser iframe"),closeDocs(){a("#g2").classList.add("off"),document.querySelector(".browser iframe")?.remove()},maximize(e){a(".work").classList.toggle("maxed",e),a(".maxi").innerHTML=e?l.min:l.max},reset(){for(let e of C)O.set(e,{name:e,text:L[e],saved:L[e],sel:0});v=[],r=null,k("app.ts")}};Object.assign(window,{__code:T});G.prompt();document.fonts.ready.then(()=>{ie(),k("app.ts"),o.setSelectionRange(0,0),$(),o.blur()});})();
