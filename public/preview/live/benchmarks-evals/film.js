"use strict";(()=>{var re="/preview/live/lib/ext/";var u={width:1440,height:900},Ke='<svg viewBox="0 0 512 512" width="56" height="56" fill="#5267f7" aria-hidden="true"><path d="M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z"/><path d="M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z" transform="rotate(180 256 256)"/></svg>',$e='<svg width="23" height="27" viewBox="0 0 23 27"><path d="M5 3 L5 20.6 L9.1 16.8 L11.6 22.7 L14.6 21.4 L12.1 15.6 L17.7 15.6 Z" fill="#000" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>',de=`
@font-face{font-family:Geist;src:url(/preview/live/lib/ext/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}
html,body{margin:0;height:100%;background:#fff;overflow:hidden}
#view{position:fixed;inset:0;overflow:hidden}
#stage{position:absolute;left:50%;top:50%;width:${u.width}px;height:${u.height}px;overflow:hidden;background:#fff;transform-origin:center;transform:translate(-50%,-50%)}
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
#cover{position:absolute;inset:0;background:#fff;z-index:12;opacity:1;transition:opacity .5s ease;pointer-events:none}
#cover.off{opacity:0}
`;function he(){return`<div id="view"><div id="stage"><div id="camera"><div id="tabs"></div><div id="card"></div></div><div id="pointer">${$e}</div><div id="caption"></div><div id="cover"></div></div></div>`}var le=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");function ue(e,t){return`<main>${Ke}${e?`<h1>${le(e)}</h1>`:""}${t?`<p>${le(t)}</p>`:""}</main>`}function j(e,t){let o=e.elementFromPoint(t.x,t.y);for(;o?.shadowRoot;){let n=o.shadowRoot.elementFromPoint(t.x,t.y);if(!n||n===o)break;o=n}return o}function V(e){let t=e.activeElement;for(;t?.shadowRoot?.activeElement;)t=t.shadowRoot.activeElement;return t}var p=(e,t,o,n={})=>new e.MouseEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:o.x,clientY:o.y,view:e,...n}),L=(e,t,o,n={})=>new e.PointerEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:o.x,clientY:o.y,pointerId:1,pointerType:"mouse",isPrimary:!0,view:e,...n}),D=class{constructor(){this.over=null}move(t,o){let n=t.defaultView;if(!n)return;let a=j(t,o);a!==this.over&&(this.over&&(this.over.dispatchEvent(L(n,"pointerout",o)),this.over.dispatchEvent(p(n,"mouseout",o)),this.over.dispatchEvent(p(n,"mouseleave",o,{bubbles:!1}))),a&&(a.dispatchEvent(L(n,"pointerover",o)),a.dispatchEvent(p(n,"mouseover",o)),a.dispatchEvent(p(n,"mouseenter",o,{bubbles:!1}))),this.over=a),(a??t).dispatchEvent(L(n,"pointermove",o)),(a??t).dispatchEvent(p(n,"mousemove",o))}};function Ye(e){let t=e.closest?.('input, textarea, select, button, a[href], [tabindex], [contenteditable="true"], [contenteditable=""]');t?t.focus({preventScroll:!0,focusVisible:!1}):V(e.ownerDocument)?.blur?.()}function me(e,t,o=0,n=1){let a=e.defaultView,s=j(e,t);return s?(s.dispatchEvent(L(a,"pointerdown",t,{button:o,buttons:1})),s.dispatchEvent(p(a,"mousedown",t,{button:o,buttons:1,detail:n}))&&Ye(s),s):null}function pe(e,t,o,n=0,a=1){let s=e.defaultView,i=j(e,t)??o;i&&(i.dispatchEvent(L(s,"pointerup",t,{button:n})),i.dispatchEvent(p(s,"mouseup",t,{button:n,detail:a})),o&&(i===o||o.contains(i)||i.contains(o))&&(i.dispatchEvent(p(s,n===2?"contextmenu":"click",t,{button:n,detail:a})),a===2&&i.dispatchEvent(p(s,"dblclick",t,{button:n,detail:2}))))}var He={Enter:"Enter",Escape:"Escape",Tab:"Tab",Backspace:"Backspace",ArrowDown:"ArrowDown",ArrowUp:"ArrowUp",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",End:"End",Home:"Home"," ":"Space"};function F(e,t){let o=e.defaultView,n=t.split("+"),a=n.pop(),s={metaKey:n.includes("Meta"),ctrlKey:n.includes("Control"),altKey:n.includes("Alt"),shiftKey:n.includes("Shift")},i=V(e)??e.body,c={key:a,code:He[a]??(a.length===1?`Key${a.toUpperCase()}`:a),bubbles:!0,cancelable:!0,composed:!0,...s},r=i.dispatchEvent(new o.KeyboardEvent("keydown",c));r&&a.length===1&&!s.metaKey&&!s.ctrlKey?(i.dispatchEvent(new o.KeyboardEvent("keypress",c)),W(e,a)):r&&a==="Backspace"?e.execCommand("delete"):r&&a==="Enter"&&i instanceof o.HTMLTextAreaElement?W(e,`
`):r&&a==="End"&&Oe(i)&&Ue(e,i),i.dispatchEvent(new o.KeyboardEvent("keyup",c))}function W(e,t){if(!e.execCommand("insertText",!1,t)){let o=V(e);o&&"value"in o&&(o.value+=t,o.dispatchEvent(new e.defaultView.InputEvent("input",{bubbles:!0,composed:!0,inputType:"insertText",data:t})))}}function Oe(e){return e instanceof HTMLElement&&(e.isContentEditable||"value"in e)}function Ue(e,t){if("value"in t){let a=t;a.setSelectionRange(a.value.length,a.value.length);return}let o=e.createRange();o.selectNodeContents(t),o.collapse(!1);let n=e.getSelection();n?.removeAllRanges(),n?.addRange(o)}function ge(e,t,o){let n=e.defaultView,a=j(e,t)??e.documentElement;if(a.dispatchEvent(new n.WheelEvent("wheel",{bubbles:!0,cancelable:!0,composed:!0,clientX:t.x,clientY:t.y,deltaY:o}))){for(let i=a;i;i=i.parentElement??i.getRootNode().host??null){let c=n.getComputedStyle(i);if(/(auto|scroll)/.test(c.overflowY)&&i.scrollHeight>i.clientHeight){i.scrollBy({top:o});return}}e.scrollingElement?.scrollBy({top:o})}}function C(e,t){let o=[],n=a=>{for(let s of a.querySelectorAll("*"))s.matches(t)&&o.push(s),s.shadowRoot&&n(s.shadowRoot)};return n(e),o}function we(e,t){return C(e,t)[0]??null}function E(e){let t=e.getBoundingClientRect();if(t.width===0&&t.height===0)return!1;let o=e.ownerDocument.defaultView?.getComputedStyle(e);return o?.visibility!=="hidden"&&o?.display!=="none"}function Ve(e){let t=e.getAttribute("aria-label");if(t)return t.trim();let o=e.getAttribute("aria-labelledby");if(o){let n=e.getRootNode(),a=o.split(/\s+/).map(s=>n.getElementById?.(s)?.textContent??"").join(" ").trim();if(a)return a}return(e.textContent??"").replace(/\s+/g," ").trim()}var Qe={button:'button, [role="button"], input[type="button"], input[type="submit"]',link:'a[href], [role="link"]',heading:'h1, h2, h3, h4, h5, h6, [role="heading"]',textbox:'input:not([type]), input[type="text"], input[type="search"], textarea, [contenteditable="true"], [role="textbox"]',checkbox:'input[type="checkbox"], [role="checkbox"]',tab:'[role="tab"]',option:'[role="option"], option',menuitem:'[role="menuitem"]',dialog:'dialog, [role="dialog"]',region:'section[aria-label], [role="region"]',switch:'[role="switch"]',list:'ul, ol, [role="list"]',listitem:'li, [role="listitem"]'};function A(e,t,o={}){return n=>{let a=o.within?S(n,o.within):n;return a?C(a,Qe[e]??`[role="${e}"]`).find(s=>E(s)&&fe(Ve(s),t,o.exact)):null}}function M(e,t="*",o={}){return n=>{let a=o.within?S(n,o.within):n;if(!a)return null;let s=C(a,t).filter(i=>E(i)&&fe((i.textContent??"").replace(/\s+/g," ").trim(),e,o.exact));return s.find(i=>!s.some(c=>c!==i&&i.contains(c)))??null}}function fe(e,t,o=!1){return t===void 0?!0:t instanceof RegExp?t.test(e):o?e===t:e.toLowerCase().includes(t.toLowerCase())}function S(e,t){return typeof t=="function"?t(e)??null:C(e,t).find(E)??null}var Je=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,Ge={x:1480,y:940},ve=()=>new Promise(e=>requestAnimationFrame(()=>e())),K=class{constructor(t,o,n){this.world=t;this.el=o;this.hooks=n;this.sites=new Map;this.tabs=new Map;this.ready=new Map;this.hovers=new WeakMap;this.on=null;this.at={x:720,y:560}}get fast(){return this.hooks.fast()}async open(t,o,n){this.tabs.get(t)?.frame.remove(),n&&this.sites.set(t,n);let a=document.createElement("iframe");a.dataset.tab=t,a.title="";let s=n?new Promise(r=>this.ready.set(t,r)):Promise.resolve(),i=new Promise(r=>a.addEventListener("load",()=>r(),{once:!0}));a.src=o,this.el.tabs.append(a),await i,await Promise.race([s,new Promise(r=>setTimeout(r,8e3))]);let c={name:t,frame:a,doc:a.contentDocument,win:a.contentWindow};return this.tabs.set(t,c),await c.doc.fonts?.ready,c}started(t){this.ready.get(t)?.()}async film(t){this.el.card.classList.remove("on");for(let o of this.tabs.values())o.frame.classList.toggle("on",o===t);this.on=t,await this.rest(),await this.wait(300)}close(t){this.world.forget(t.name),t.frame.remove(),this.tabs.delete(t.name),this.on===t&&(this.on=null)}async card(t,o,n=3e3){this.el.card.innerHTML=ue(t,o),this.el.card.classList.add("on"),this.pointer(!1),await this.wait(n)}chapter(t){this.hooks.chapter(t)}say(t){this.el.caption.textContent=t}async wait(t){if(await this.hooks.gate(),this.fast)return ve();await new Promise(o=>setTimeout(o,t))}async waitFor(t,o,n=2e4){let a=Date.now()+n;for(;;){let s=S(t.doc,o);if(s)return s;if(Date.now()>a)throw new Error(`${t.name}: nothing found for ${String(o)}`);await new Promise(i=>setTimeout(i,50))}}has(t,o){return S(t.doc,o)!==null}async centerOf(t,o){let n=await this.waitFor(t,o);n.scrollIntoView({block:"nearest",inline:"nearest"});let a=n.getBoundingClientRect();return{x:a.left+a.width/2,y:a.top+a.height/2}}async moveTo(t,o={}){let n=this.at,a=t.x-n.x,s=t.y-n.y,i=Math.hypot(a,s);if(this.pointer(!0),this.fast||i<1)return this.place(t);let c=o.ms??Math.min(900,240+i*.5),r=o.straight?0:Math.min(36,i*.04)*(a>=0?1:-1),m=performance.now();for(;;){await this.hooks.gate();let d=Math.min(1,(performance.now()-m)/c),h=Je(d),g=Math.sin(Math.PI*h)*r;if(this.place({x:n.x+a*h+-s/i*g,y:n.y+s*h+a/i*g}),d>=1)break;await ve()}}async glide(t,o){await this.moveTo(await this.centerOf(t,o))}async click(t,o,n={}){let a=await this.centerOf(t,o);await this.moveTo(a),await this.wait(180);let s=await this.centerOf(t,o);Math.hypot(s.x-a.x,s.y-a.y)>3&&await this.moveTo(a=s,{ms:220}),await this.pressAt(t,a,n.button??0,n.count??1),await this.wait(n.after??450)}async clickAt(t,o,n={}){await this.moveTo(o),await this.wait(180),await this.pressAt(t,o,n.button??0,n.count??1),await this.wait(n.after??450)}async pressAt(t,o,n,a){for(let s=1;s<=a;s++){this.el.pointer.classList.add("down");let i=me(t.doc,o,n,s);await this.wait(60),pe(t.doc,o,i,n,s),this.el.pointer.classList.remove("down")}}async type(t,o,n=55){if(this.fast){o.length>1&&W(t.doc,o.slice(0,-1)),o&&F(t.doc,o.slice(-1));return}for(let a of o)await this.hooks.gate(),F(t.doc,a),await new Promise(s=>setTimeout(s,n*(.7+Math.random()*.6)))}async press(t,o,n=120){F(t.doc,o),await this.wait(n)}async rest(){await this.moveTo(Ge),this.pointer(!1)}async wheel(t,o,n=12){for(let a=0;a<n;a++)ge(t.doc,this.at,o/n),await this.wait(30)}async camera(t,o=1200){let n=t?Math.max(360,Math.min(u.width,t.w)):u.width,a=u.width/n,s=u.height/a,i=t?Math.min(Math.max(0,t.x),u.width-n):0,c=t?Math.min(Math.max(0,t.y),u.height-s):0;this.el.camera.style.transition=this.fast?"none":`transform ${o}ms cubic-bezier(0.22, 1, 0.36, 1)`,this.el.camera.style.transform=`scale(${a}) translate(${-i}px, ${-c}px)`,await this.wait(o)}hit(t,o){return j(t.doc,o)}place(t){if(this.at=t,this.el.pointer.style.left=`${t.x}px`,this.el.pointer.style.top=`${t.y}px`,this.on){let o=this.hovers.get(this.on)??new D;this.hovers.set(this.on,o),o.move(this.on.doc,t)}}pointer(t){this.el.pointer.style.opacity=t?"1":"0"}};var q=class{constructor(){this.types=new Map;this.methods=new Map;this.listeners=new Map;this.storageListeners=new Map;this.stores={local:{},session:{},sync:{}};this.unanswered=[];this.on("batch.hello",()=>null).on("transfer.claim",()=>null).engine("knownUpdates",()=>({}))}on(t,o){return this.types.set(t,o),this}engine(t,o){return this.methods.set(t,o),this}async handle(t,o){let n=String(t?.type??""),a=n==="engine.call"?this.methods.get(String(t.method)):this.types.get(n);if(!a)return this.unanswered.push({tab:o,type:n==="engine.call"?`engine.${t.method}`:n}),{ok:!0,result:null};try{return{ok:!0,result:await a(t,o)??null}}catch(s){return{ok:!1,error:{code:"internal",message:String(s)}}}}listen(t,o){let n=this.listeners.get(t)??new Set;return n.add(o),this.listeners.set(t,n),()=>n.delete(o)}tell(t,o){for(let[n,a]of this.listeners)if(!(o&&n!==o))for(let s of a)s(t,{id:"coere"},()=>{})}write(t,o){let n=this.stores[t]??={},a={};for(let[s,i]of Object.entries(o))a[s]={oldValue:n[s],newValue:i},n[s]=i;for(let s of this.storageListeners.keys())s(a,t)}remove(t,o){let n=this.stores[t]??={},a={};for(let s of o)a[s]={oldValue:n[s]},delete n[s];for(let s of this.storageListeners.keys())s(a,t)}watchStorage(t,o=""){return this.storageListeners.set(t,o),()=>this.storageListeners.delete(t)}forget(t){this.listeners.delete(t);for(let[o,n]of this.storageListeners)n===t&&this.storageListeners.delete(o)}reset(){this.listeners.clear(),this.storageListeners.clear()}};var $=class extends Error{};function be(e,t,o){let n=new URLSearchParams(location.search),a=document.createElement("style");a.textContent=de,document.head.append(a),document.title=e.title,document.body.innerHTML=he();let s=l=>document.getElementById(l);n.get("captions")==="1"&&s("caption").classList.add("on");for(let l of["view","stage","camera","tabs"])s(l).addEventListener("scroll",T=>{let ce=T.currentTarget;ce.scrollTop=0,ce.scrollLeft=0});let i=()=>{let l=Math.min(innerWidth/u.width,innerHeight/u.height);s("stage").style.transform=`translate(-50%, -50%) scale(${l})`};addEventListener("resize",i),i();let c=n.get("from"),r=n.get("to"),m=n.get("loop")!=="0",d=!!c,h=!1,g=null,v={now:new q};Object.assign(window,{__demo:{get world(){return v.now},assets:re,site:l=>I.sites.get(l),ready:l=>I.started(l),extra:{}}});let I=ae();function ae(){return new K(v.now,{tabs:s("tabs"),card:s("card"),pointer:s("pointer"),caption:s("caption"),camera:s("camera")},{fast:()=>d,chapter(l){if(r&&l===r&&!d)throw new $;d&&l===c&&(d=!1,s("cover").classList.add("off")),se?.mark(l)},gate:()=>h?new Promise(l=>g=l):Promise.resolve()})}let se=n.get("controls")==="1"?Xe(e,{jump(l){c=l,Fe()},toggle(){return h=!h,h||g?.(),h}}):null,k=0;function Fe(){k++,h=!1,g?.(),ie(k)}async function ie(l){for(;;){s("cover").style.transition="none",s("cover").classList.remove("off"),s("cover").offsetWidth,s("cover").style.transition="",s("tabs").replaceChildren(),s("card").classList.remove("on"),s("camera").style.transform="",v.now=new q,o(v.now),I=ae(),d=!!c,d||setTimeout(()=>s("cover").classList.add("off"),50);try{await t(I)}catch(T){!(T instanceof $)&&l===k&&console.error(T)}if(l!==k||(await new Promise(T=>setTimeout(T,900)),!m||l!==k))return;se&&(c=null)}}ie(k)}function Xe(e,t){let o=document.createElement("nav");o.setAttribute("aria-label","Chapters"),o.style.cssText="position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:6px;align-items:center;padding:6px;border-radius:999px;background:rgba(8,14,36,.78);backdrop-filter:blur(10px);font:500 13px/1 Geist,system-ui,sans-serif;z-index:20;max-width:calc(100% - 28px);overflow-x:auto;opacity:0;transition:opacity .25s";let n=(i,c)=>{let r=document.createElement("button");return r.type="button",r.textContent=i,r.style.cssText="flex:none;border:0;border-radius:999px;padding:8px 12px;background:transparent;color:rgba(255,255,255,.75);font:inherit;cursor:pointer;white-space:nowrap",r.addEventListener("click",c),o.append(r),r},a=n("Pause",()=>a.textContent=t.toggle()?"Play":"Pause"),s=new Map(e.chapters.map(i=>[i.id,n(i.title,()=>t.jump(i.id))]));return document.body.append(o),addEventListener("mousemove",()=>{o.style.opacity="1",clearTimeout(o.t),o.t=window.setTimeout(()=>o.style.opacity="0",2500)}),{mark(i){for(let[c,r]of s)r.style.background=c===i?"#fff":"transparent",r.style.color=c===i?"#080e24":"rgba(255,255,255,.75)"}}}var ze=/^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?)?)?$/;var xe=new Map;function et(e){let t=xe.get(e);return t||(t=new Intl.DateTimeFormat("en-US",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),xe.set(e,t)),t}function b(e,t){let o=et(t).formatToParts(e),n=a=>Number(o.find(s=>s.type===a)?.value);return{year:n("year"),month:n("month"),day:n("day"),hour:n("hour"),minute:n("minute")}}function ye(e,t){let o=Math.floor(e/6e4)*6e4,n=b(o,t);return(Date.UTC(n.year,n.month-1,n.day,n.hour,n.minute)-o)/6e4}function R(e,t){let o=ze.exec(e.at);if(!o)throw new Error("bad when");let[n,a,s,i,c,r]=o.slice(1).map(v=>v===void 0?void 0:Number(v)),m=n,d;i!==void 0?d=Date.UTC(m,a-1,s,i,c,r??59,999):s!==void 0?d=Date.UTC(m,a-1,s,23,59,59,999):a!==void 0?d=Date.UTC(m,a,1)-1:d=Date.UTC(m+1,0,1)-1;let h=e.tz??t,g=d-ye(d,h)*6e4;return d-ye(g,h)*6e4}function Q(e){return e.at.includes("T")}var _=864e5,tt=14*_,ot=14*_,nt=30*_,ke=["none","later","upcoming","soon","today","overdue"],J={level:"none",from:null};function Te(e){return e<0?"overdue":e<=_?"today":e<=3*_?"soon":e<=14*_?"upcoming":"later"}function je(e,t,o){if(e.status!=="active"&&e.status!=="disputed"||e.progress==="completed"||e.progress==="cancelled")return J;let n=Math.max(0,...e.evidence.map(c=>Date.parse(c.at))),a=e.urgency?.due,s=J;if(a){let c=R(a,o),r=Te(c-t);if(r==="overdue"&&t-c>tt&&n<c)return{level:"stale",from:"due"};s={level:r,from:"due"}}else if(e.kind==="event"&&e.start){let c=R(e.start,o);c>=t&&(s={level:Te(c-t),from:"start"})}let i=at(e.urgency?.priority??0,a!==void 0,t-n);return ke.indexOf(i)>ke.indexOf(s.level)?{level:i,from:"priority"}:s}function at(e,t,o){return e>=1&&e<=2&&(t||o<=ot)?"soon":e>=3&&e<=4&&(t||o<=nt)?"upcoming":"none"}var Me=36e5,G=24*Me,st=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],it=["January","February","March","April","May","June","July","August","September","October","November","December"];function _e(e,t,o){let n=je(e,t,o),a=ct(e,n,t,o);return a===null?{level:n.level,label:null}:{level:n.level,label:e.status==="disputed"?`${a}. These disagree.`:a}}function ct(e,t,o,n){if(t.level==="none"||t.from===null)return null;if(t.from==="priority")return(e.urgency?.priority??0)<=2?"Marked urgent":"Marked important";let a=t.from==="due"?e.urgency?.due:e.start;if(!a)return null;let s=R(a,n);if(t.level==="overdue")return rt(o-s);if(t.level==="stale")return`Was due ${Ee(a,s,o,n)}`;let i=t.from==="due"?"Due":"Starts",c=lt(o,s,n),r=Q(a)?` at ${dt(b(s,n))}`:"";return c===0?`${i} today${r}`:c===1?`${i} tomorrow${r}`:i==="Due"&&(t.level==="today"||t.level==="soon")?`Due in ${c} days`:`${i} ${Ee(a,s,o,n)}${i==="Starts"?r:""}`}function rt(e){return e>=G?Ce(Math.floor(e/G),"day"):Ce(Math.max(1,Math.floor(e/Me)),"hour")}var Ce=(e,t)=>`Overdue by ${e} ${t}${e===1?"":"s"}`;function lt(e,t,o){let n=b(e,o),a=b(t,o);return Math.round((Date.UTC(a.year,a.month-1,a.day)-Date.UTC(n.year,n.month-1,n.day))/G)}function Ee(e,t,o,n){let[a,s,i]=e.at.split(/[-T]/).map(Number),c=Q(e)?b(t,n):{year:a,month:s??0,day:i??0};if(c.month===0)return String(c.year);if(c.day===0)return`${it[c.month-1]} ${c.year}`;let r=c.year===b(o,n).year?"":`, ${c.year}`;return`${st[c.month-1]} ${c.day}${r}`}function dt(e){return`${e.hour%12===0?12:e.hour%12}:${String(e.minute).padStart(2,"0")} ${e.hour<12?"AM":"PM"}`}var X=Date.parse("2026-10-15T16:00:00Z"),Le="America/Los_Angeles",w=(e,t)=>`${e}_0199a5c1-8a00-7000-8000-${String(t).padStart(12,"0")}`,Ht={self:w("ent",10),course:w("ent",11),project:w("ent",12),professor:w("ent",13),trip:w("ent",14)},ht=(e,t)=>({evidenceId:`${w("fact",100+e)}#e0`,platform:"chatgpt",convId:"chatgpt:fake-cs162",title:"Fake CS 162 project help",msg:e,role:"user",at:t,url:null,stale:!1}),ut=(e,t)=>t.map(o=>[e.indexOf(o),e.indexOf(o)+o.length]);function x(e,t){let{due:o,start:n,specifics:a=[],...s}=t,i=s.status??"active",c=s.kind==="event"?"event":"task",{level:r,label:m}=_e({status:i,kind:c,urgency:o?{due:o}:{},...n?{start:n}:{},evidence:[{at:"2026-10-09T16:12:40Z"}]},X,Le);return{id:w("fact",100+e),kind:"task",key:"due",importance:4,urgency:r,urgencyLabel:m,progress:null,disagree:i==="disputed",held:!1,pinned:!1,origin:"extracted",basis:"user_stated",sensitivity:null,sources:[ht(e,"2026-10-09T16:12:40Z")],supersededBy:null,replacedOn:null,changedBy:null,...s,status:i,text:t.text,specifics:ut(t.text,a),due:o?{at:o.at,tz:o.tz??null}:null}}var Y=e=>({at:e,tz:Le}),Ot={dueNow:x(1,{text:"Project 1 for CS 162 is due Oct 20 at 11:59pm.",due:Y("2026-10-20T23:59"),specifics:["Oct 20 at 11:59pm"]}),dueBefore:x(2,{text:"Project 1 for CS 162 was due Oct 18 at 11:59pm.",due:Y("2026-10-18T23:59"),specifics:["Oct 18 at 11:59pm"],status:"superseded",supersededBy:w("fact",101),replacedOn:"2026-10-09"}),weight:x(3,{kind:"attribute",key:"grade_weight",text:"Project 1 for CS 162 is worth 15% of the grade.",specifics:["15%"]}),instruction:x(4,{kind:"instruction",key:"instruction.punctuation",text:"You want AIs to never use em dashes.",held:!0}),allergy:x(5,{kind:"attribute",key:"allergy",text:"You are allergic to peanuts.",importance:5,sensitivity:"health"}),dinnerA:x(6,{kind:"event",key:"start",text:"Dinner with Fake Maya is on Nov 3.",start:Y("2026-11-03T19:00"),specifics:["Nov 3"],status:"disputed"}),dinnerB:x(7,{kind:"event",key:"start",text:"Dinner with Fake Maya is on Nov 5.",start:Y("2026-11-05T19:00"),specifics:["Nov 5"],status:"disputed"})};function Ae(e,t={}){return{state:e,models:{extract:"claude-opus-5-5",consolidate:"claude-opus-5-5",short:"claude-haiku-5-5"},until:e==="waiting"?X+42e3:null,stopClass:e==="spend_limit"?"spend_cap":null,set:{id:"ws_fake_1",origin:"library",mode:"direct",state:e==="paused"?"paused":"running",byPlatform:{chatgpt:{chats:538,read:120,failed:0,refused:0,batched:0},claude:{chats:412,read:412,failed:3,refused:2,batched:0},gemini:{chats:290,read:0,failed:0,refused:0,batched:0}},linking:{queued:40,done:12},factsFound:3410,spentMicros:312e4,etaSec:1200},held:null,counts:{memories:3410,dueSoon:41,review:3,sourceChats:612,sourceChatsBy:{chatgpt:402,claude:210},held:1,chatsRead:532,chatsInLibrary:1240,failedJobs:3,refusedJobs:2},spend:{monthMicros:312e4,capMicros:2e7},poolSlots:{used:4,capacity:6},lastVerify:null,...t}}var mt=["chatgpt","claude","gemini"],z=864e5,ee=Date.parse("2026-10-29T13:50:00Z"),pt=["Notion PM role","PearX interview prep","GitHub handles for the team","Applying to Stripe","History reading list","PHYS 137 lab 1 done","A coworker wedding","Sparrowhawk database upgrade","SkipDoodle setup","Lisbon trip","Flight times for the trip","DATA 100 problem set due date"],Se=pt.map((e,t)=>{let o=mt[t%3];return{id:`${o}:c${t+1}`,platform:o,platformConvId:`c${t+1}`,title:e,created:ee-(t+2)*z,updated:ee-(t+1)*z,messageCount:6+t%5*2,bytes:4e3+t*900,hash:`h${t}`,archived:!1,changedDuringRun:!1}});function qe(e){e.write("local",{"coere.cori.hello":{at:ee-3*z}}),e.engine("memory.status",()=>Ae("ready",{until:null,set:null,counts:{memories:412,dueSoon:6,review:0,sourceChats:38,sourceChatsBy:{chatgpt:16,claude:13,gemini:9},held:0,chatsRead:38,chatsInLibrary:38,failedJobs:0,refusedJobs:0},spend:{monthMicros:184e4,capMicros:2e7},poolSlots:{used:0,capacity:6}})).engine("memory.buildEstimate",()=>({chats:38,seconds:0,measured:!0,progress:null})).on("",()=>null).engine("memory.chat.keep",()=>({keep:"forever",cleared:0})).engine("listConversations",()=>({rows:Se,total:Se.length})).engine("stats",()=>({conversations:38,chunks:410,projects:0,textBytes:612e3,dbBytes:48e5,byPlatform:{chatgpt:{conversations:16,bytes:26e4},claude:{conversations:13,bytes:214e3},gemini:{conversations:9,bytes:138e3}}}))}var Re={initial:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}},download:{answer:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:0,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}},states:[{t:0,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:0,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:163,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:313,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:326,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:626,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:487,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:939,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:609,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:1252,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:770,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:1565,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:933,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:1878,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:1097,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:2191,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:1218,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},estimates:[{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:20781,expected:255320,high:558979},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:283,expected:2063,high:3911},total:{low:21064,expected:257383,high:562890},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:15971,expected:219763,high:491183},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:283,expected:2063,high:3911},total:{low:16254,expected:221826,high:495094},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:24455,expected:313458,high:673509},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:5644,expected:41274,high:78234},total:{low:30099,expected:354732,high:751743},minutes:1,capMicros:1e6}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:19645,expected:277901,high:605713},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:5644,expected:41274,high:78234},total:{low:25289,expected:319175,high:683947},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:20781,expected:255320,high:558979},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:283,expected:2063,high:3911},total:{low:21064,expected:257383,high:562890},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:15971,expected:219763,high:491183},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:283,expected:2063,high:3911},total:{low:16254,expected:221826,high:495094},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:24455,expected:313458,high:673509},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:5644,expected:41274,high:78234},total:{low:30099,expected:354732,high:751743},minutes:1,capMicros:1e6}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:19645,expected:277901,high:605713},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:5644,expected:41274,high:78234},total:{low:25289,expected:319175,high:683947},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:20781,expected:255320,high:558979},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:283,expected:2063,high:3911},total:{low:21064,expected:257383,high:562890},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:15971,expected:219763,high:491183},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:283,expected:2063,high:3911},total:{low:16254,expected:221826,high:495094},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:24455,expected:313458,high:673509},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:5644,expected:41274,high:78234},total:{low:30099,expected:354732,high:751743},minutes:1,capMicros:1e6}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:19645,expected:277901,high:605713},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:5644,expected:41274,high:78234},total:{low:25289,expected:319175,high:683947},minutes:1,capMicros:5e5}}],sonnet:{answer:{id:"locomo-mvtlv30c"},states:[{t:0,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"starting",done:0,total:7,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:377,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:0,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:1057,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4978,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:87624,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:5019,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:0,total:2,micros:87624},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:87624,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:5266,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:2,total:2,micros:87624},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:87624,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:7120,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"answering",done:4,total:7,micros:253777},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:254044,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:7339,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:0,total:1,micros:254044},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:254044,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:7612,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:1,total:1,micros:254044},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:254044,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11527,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:1,total:1,micros:254044},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:275456,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11630,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:0,total:1,micros:275456},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:275456,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11806,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:1,total:1,micros:275456},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:275456,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:13607,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},haiku:{answer:{id:"locomo-mvtlvdib"},states:[{t:0,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"starting",done:0,total:7,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:239,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:0,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:480,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4383,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:76013,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4466,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:0,total:2,micros:76013},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:76013,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4701,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:2,total:2,micros:76013},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:76013,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:6482,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"answering",done:4,total:7,micros:207020},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:207287,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:6726,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:0,total:1,micros:207287},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:207287,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:6911,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:1,total:1,micros:207287},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:207287,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:10816,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:1,total:1,micros:207287},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:228699,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:10882,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:0,total:1,micros:228699},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:228699,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11095,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:1,total:1,micros:228699},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:228699,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:12875,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:267558,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},evals:{answer:{id:"evals-mvtlvnfy"},states:[{t:0,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"evals",id:"evals-mvtlvnfy",phase:"extraction",done:0,total:1,micros:0},lastError:null,runs:[{id:"evals-mvtlvnfy",kind:"evals",state:"running",startedAt:"2026-10-29T13:55:30.286Z",version:"1.1.3 Coere v2",mode:"check",micros:0,imported:!1,what:"evals",score:null,f1:null,n:0,total:0},{id:"locomo-mvtlvdib",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:267558,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:127,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[{id:"evals-mvtlvnfy",kind:"evals",state:"done",startedAt:"2026-10-29T13:55:30.286Z",version:"1.1.3 Coere v2",mode:"check",micros:0,imported:!1,what:"evals",score:1,f1:null,n:13,total:13},{id:"locomo-mvtlvdib",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:267558,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},runs:{"evals-mvtlvnfy":{v:1,kind:"evals",id:"evals-mvtlvnfy",stamp:{version:"1.1.3 Coere v2",build:"fake-v2",startedAt:"2026-10-29T13:55:30.286Z",mode:"check",models:{extract:"recorded",short:"recorded",jev:"recorded"},sets:[{name:"extraction",sha256:"3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f"}]},state:"done",sets:[{id:"extraction",title:"Extraction",version:"3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f",cases:13,passed:13,gates:[{name:"fake gate",pass:!0}]}],cases:[{set:"extraction",id:"detailSurvival",what:"detail survival",expected:"at least 100%",got:"100% (73 of 73)",pass:!0,reason:""},{set:"extraction",id:"recall",what:"extraction recall",expected:"at least 100%",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"evidencePrecision",what:"evidence precision",expected:"at least 100%",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"distractorPrecision",what:"distractor precision",expected:"at least 100%",got:"100% (4 of 4)",pass:!0,reason:""},{set:"extraction",id:"neverServed",what:"injections never served",expected:"at least 100%",got:"100% (1 of 1)",pass:!0,reason:""},{set:"extraction",id:"placement",what:"placement",expected:"at least 100%",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"updates",what:"updates",expected:"at least 100%",got:"100% (11 of 11)",pass:!0,reason:""},{set:"extraction",id:"urgency",what:"urgency",expected:"at least 100%",got:"100% (81 of 81)",pass:!0,reason:""},{set:"extraction",id:"importanceInRange",what:"importance in range",expected:"reported",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"fives",what:"share at importance 5",expected:"reported",got:"1.2% (1 of 84)",pass:!0,reason:""},{set:"extraction",id:"identityRecall",what:"identity recall",expected:"at least 100%",got:"100% (9 of 9)",pass:!0,reason:""},{set:"extraction",id:"identityAttribution",what:"identity attribution",expected:"at least 100%",got:"100% (9 of 9)",pass:!0,reason:""},{set:"extraction",id:"identityKept",what:"identity values kept",expected:"at least 100%",got:"100% (9 of 9)",pass:!0,reason:""}],ledger:{extraction:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0},answer:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0},judge:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0},baseline:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0}},updatedAt:"2026-10-29T13:55:30.412Z"},"locomo-mvtlvdib":{v:1,kind:"benchmark",id:"locomo-mvtlvdib",bench:"locomo",stamp:{version:"1.1.3 Coere v2",build:"fake-v2",startedAt:"2026-10-29T13:55:17.411Z",mode:"live",models:{answer:"claude-haiku-5-5",judge:"claude-haiku-5-5",extract:"claude-sonnet-5-5",short:"claude-haiku-5-5",jev:"jev-1.14.0"},sets:[{name:"locomo10.json",sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a"}]},sample:"all",seed:1,baseline:!1,budget:1500,capMicros:5e5,state:"done",keep:!1,questions:["conv-1:q001","conv-1:q002","conv-1:q003","conv-1:q004","conv-1:q005","conv-2:q001","conv-2:q002"],units:[{id:"conv-1",state:"built",chatTokens:94,fullTokens:182,extraction:{calls:25,input:37341,output:18537,cacheRead:32274,cacheWrite:0,micros:204689}},{id:"conv-2",state:"built",chatTokens:34,fullTokens:94,extraction:{calls:7,input:11288,output:5497,cacheRead:8474,cacheWrite:0,micros:59104}}],results:[{id:"conv-1:q001",unit:"conv-1",category:"single-hop",contextTokens:40,answer:"I live in Lisbon.",f1:.4,judged:!0},{id:"conv-1:q002",unit:"conv-1",category:"temporal",contextTokens:40,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-1:q003",unit:"conv-1",category:"multi-hop",contextTokens:40,answer:"My name is Nora.",f1:0,judged:!1},{id:"conv-1:q004",unit:"conv-1",category:"open-domain",contextTokens:40,answer:"Not mentioned in the conversation",f1:0,judged:!1},{id:"conv-1:q005",unit:"conv-1",category:"adversarial",contextTokens:40,answer:"Not mentioned in the conversation",f1:1,judged:null},{id:"conv-2:q001",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-2:q002",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Not mentioned in the conversation",f1:0,judged:!1}],ledger:{extraction:{calls:32,input:48629,output:24034,cacheRead:40748,cacheWrite:0,micros:263793},answer:{calls:7,input:1181,output:3575,cacheRead:0,cacheWrite:0,micros:1906},judge:{calls:6,input:3398,output:3037,cacheRead:0,cacheWrite:0,micros:1859},baseline:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0}},updatedAt:"2026-10-29T13:55:30.286Z"},"locomo-mvtlv30c":{v:1,kind:"benchmark",id:"locomo-mvtlv30c",bench:"locomo",stamp:{version:"1.1.3 Coere v2",build:"fake-v2",startedAt:"2026-10-29T13:55:03.804Z",mode:"live",models:{answer:"claude-haiku-5-5",judge:"claude-sonnet-5-5",extract:"claude-sonnet-5-5",short:"claude-haiku-5-5",jev:"jev-1.14.0"},sets:[{name:"locomo10.json",sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a"}]},sample:"all",seed:1,baseline:!1,budget:1500,capMicros:5e5,state:"done",keep:!1,questions:["conv-1:q001","conv-1:q002","conv-1:q003","conv-1:q004","conv-1:q005","conv-2:q001","conv-2:q002"],units:[{id:"conv-1",state:"built",chatTokens:94,fullTokens:182,extraction:{calls:25,input:37341,output:18537,cacheRead:22178,cacheWrite:10096,micros:227911}},{id:"conv-2",state:"built",chatTokens:34,fullTokens:94,extraction:{calls:7,input:11288,output:5497,cacheRead:8474,cacheWrite:0,micros:59104}}],results:[{id:"conv-1:q001",unit:"conv-1",category:"single-hop",contextTokens:40,answer:"I live in Lisbon.",f1:.4,judged:!0},{id:"conv-1:q002",unit:"conv-1",category:"temporal",contextTokens:40,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-1:q003",unit:"conv-1",category:"multi-hop",contextTokens:40,answer:"My name is Nora.",f1:0,judged:!1},{id:"conv-1:q004",unit:"conv-1",category:"open-domain",contextTokens:40,answer:"Not mentioned in the conversation",f1:0,judged:!1},{id:"conv-1:q005",unit:"conv-1",category:"adversarial",contextTokens:40,answer:"Not mentioned in the conversation",f1:1,judged:null},{id:"conv-2:q001",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-2:q002",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Not mentioned in the conversation",f1:0,judged:!1}],ledger:{extraction:{calls:32,input:48629,output:24034,cacheRead:30652,cacheWrite:10096,micros:287015},answer:{calls:7,input:1181,output:3575,cacheRead:0,cacheWrite:0,micros:1906},judge:{calls:6,input:3398,output:3037,cacheRead:0,cacheWrite:0,micros:37166},baseline:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0}},updatedAt:"2026-10-29T13:55:17.410Z"}},exports:[{args:{id:"evals-mvtlvnfy",format:"txt"},answer:{name:"evals-mvtlvnfy.txt",text:`coere eval report 1
kind evals
run evals-mvtlvnfy
version 1.1.3 Coere v2
build fake-v2
date 2026-10-29T13:55:30.286Z
mode check
models answer - judge - extract recorded short recorded jev recorded
set extraction sha256 3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f
state done
score passed 13 of 13
set extraction version 3d6773691af2 passed 13 of 13
gate extraction fake gate pass
cost extraction calls 0 in 0 out 0 cache 0 usd 0.0000
cost answer calls 0 in 0 out 0 cache 0 usd 0.0000
cost judge calls 0 in 0 out 0 cache 0 usd 0.0000
cost baseline calls 0 in 0 out 0 cache 0 usd 0.0000
cost total usd 0.0000
case extraction/detailSurvival pass
case extraction/distractorPrecision pass
case extraction/evidencePrecision pass
case extraction/fives pass
case extraction/identityAttribution pass
case extraction/identityKept pass
case extraction/identityRecall pass
case extraction/importanceInRange pass
case extraction/neverServed pass
case extraction/placement pass
case extraction/recall pass
case extraction/updates pass
case extraction/urgency pass
`}},{args:{id:"evals-mvtlvnfy",format:"json"},answer:{name:"evals-mvtlvnfy.json",text:`{
 "v": 1,
 "kind": "evals",
 "id": "evals-mvtlvnfy",
 "stamp": {
  "version": "1.1.3 Coere v2",
  "build": "fake-v2",
  "startedAt": "2026-10-29T13:55:30.286Z",
  "mode": "check",
  "models": {
   "extract": "recorded",
   "short": "recorded",
   "jev": "recorded"
  },
  "sets": [
   {
    "name": "extraction",
    "sha256": "3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f"
   }
  ]
 },
 "state": "done",
 "sets": [
  {
   "id": "extraction",
   "title": "Extraction",
   "version": "3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f",
   "cases": 13,
   "passed": 13,
   "gates": [
    {
     "name": "fake gate",
     "pass": true
    }
   ]
  }
 ],
 "cases": [
  {
   "set": "extraction",
   "id": "detailSurvival",
   "what": "detail survival",
   "expected": "at least 100%",
   "got": "100% (73 of 73)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "recall",
   "what": "extraction recall",
   "expected": "at least 100%",
   "got": "100% (84 of 84)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "evidencePrecision",
   "what": "evidence precision",
   "expected": "at least 100%",
   "got": "100% (84 of 84)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "distractorPrecision",
   "what": "distractor precision",
   "expected": "at least 100%",
   "got": "100% (4 of 4)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "neverServed",
   "what": "injections never served",
   "expected": "at least 100%",
   "got": "100% (1 of 1)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "placement",
   "what": "placement",
   "expected": "at least 100%",
   "got": "100% (84 of 84)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "updates",
   "what": "updates",
   "expected": "at least 100%",
   "got": "100% (11 of 11)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "urgency",
   "what": "urgency",
   "expected": "at least 100%",
   "got": "100% (81 of 81)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "importanceInRange",
   "what": "importance in range",
   "expected": "reported",
   "got": "100% (84 of 84)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "fives",
   "what": "share at importance 5",
   "expected": "reported",
   "got": "1.2% (1 of 84)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "identityRecall",
   "what": "identity recall",
   "expected": "at least 100%",
   "got": "100% (9 of 9)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "identityAttribution",
   "what": "identity attribution",
   "expected": "at least 100%",
   "got": "100% (9 of 9)",
   "pass": true,
   "reason": ""
  },
  {
   "set": "extraction",
   "id": "identityKept",
   "what": "identity values kept",
   "expected": "at least 100%",
   "got": "100% (9 of 9)",
   "pass": true,
   "reason": ""
  }
 ],
 "ledger": {
  "extraction": {
   "calls": 0,
   "input": 0,
   "output": 0,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 0
  },
  "answer": {
   "calls": 0,
   "input": 0,
   "output": 0,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 0
  },
  "judge": {
   "calls": 0,
   "input": 0,
   "output": 0,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 0
  },
  "baseline": {
   "calls": 0,
   "input": 0,
   "output": 0,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 0
  }
 },
 "updatedAt": "2026-10-29T13:55:30.412Z"
}
`}},{args:{id:"locomo-mvtlvdib",format:"txt"},answer:{name:"locomo-mvtlvdib.txt",text:`coere eval report 1
kind benchmark locomo
run locomo-mvtlvdib
version 1.1.3 Coere v2
build fake-v2
date 2026-10-29T13:55:17.411Z
mode live
models answer claude-haiku-5-5 judge claude-haiku-5-5 extract claude-sonnet-5-5 short claude-haiku-5-5 jev jev-1.14.0
set locomo10.json sha256 7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a
state done
sample all seed 1 baseline no budget 1500 cap usd 0.5000
questions 7 answered 7
score f1 0.200
score judged 0.167 n 6 judged-by claude-haiku-5-5
category adversarial n 1 f1 1.000 judged -
category multi-hop n 1 f1 0.000 judged 0.000
category open-domain n 1 f1 0.000 judged 0.000
category single-hop n 3 f1 0.133 judged 0.333
category temporal n 1 f1 0.000 judged 0.000
context tokens per question 38 full 157 saved 75.6%
cost extraction calls 32 in 48629 out 24034 cache 40748 usd 0.2638
cost answer calls 7 in 1181 out 3575 cache 0 usd 0.0019
cost judge calls 6 in 3398 out 3037 cache 0 usd 0.0019
cost baseline calls 0 in 0 out 0 cache 0 usd 0.0000
cost total usd 0.2676
case conv-1:q001 single-hop judged correct f1 0.400 context 40
case conv-1:q002 temporal judged wrong f1 0.000 context 40
case conv-1:q003 multi-hop judged wrong f1 0.000 context 40
case conv-1:q004 open-domain judged wrong f1 0.000 context 40
case conv-1:q005 adversarial judged - f1 1.000 context 40
case conv-2:q001 single-hop judged wrong f1 0.000 context 34
case conv-2:q002 single-hop judged wrong f1 0.000 context 34
`}},{args:{id:"locomo-mvtlvdib",format:"json"},answer:{name:"locomo-mvtlvdib.json",text:`{
 "v": 1,
 "kind": "benchmark",
 "id": "locomo-mvtlvdib",
 "bench": "locomo",
 "stamp": {
  "version": "1.1.3 Coere v2",
  "build": "fake-v2",
  "startedAt": "2026-10-29T13:55:17.411Z",
  "mode": "live",
  "models": {
   "answer": "claude-haiku-5-5",
   "judge": "claude-haiku-5-5",
   "extract": "claude-sonnet-5-5",
   "short": "claude-haiku-5-5",
   "jev": "jev-1.14.0"
  },
  "sets": [
   {
    "name": "locomo10.json",
    "sha256": "7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a"
   }
  ]
 },
 "sample": "all",
 "seed": 1,
 "baseline": false,
 "budget": 1500,
 "capMicros": 500000,
 "state": "done",
 "keep": false,
 "questions": [
  "conv-1:q001",
  "conv-1:q002",
  "conv-1:q003",
  "conv-1:q004",
  "conv-1:q005",
  "conv-2:q001",
  "conv-2:q002"
 ],
 "units": [
  {
   "id": "conv-1",
   "state": "built",
   "chatTokens": 94,
   "fullTokens": 182,
   "extraction": {
    "calls": 25,
    "input": 37341,
    "output": 18537,
    "cacheRead": 32274,
    "cacheWrite": 0,
    "micros": 204689
   }
  },
  {
   "id": "conv-2",
   "state": "built",
   "chatTokens": 34,
   "fullTokens": 94,
   "extraction": {
    "calls": 7,
    "input": 11288,
    "output": 5497,
    "cacheRead": 8474,
    "cacheWrite": 0,
    "micros": 59104
   }
  }
 ],
 "results": [
  {
   "id": "conv-1:q001",
   "unit": "conv-1",
   "category": "single-hop",
   "contextTokens": 40,
   "answer": "I live in Lisbon.",
   "f1": 0.4,
   "judged": true
  },
  {
   "id": "conv-1:q002",
   "unit": "conv-1",
   "category": "temporal",
   "contextTokens": 40,
   "answer": "Based on the above context, write an answer in the form of",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-1:q003",
   "unit": "conv-1",
   "category": "multi-hop",
   "contextTokens": 40,
   "answer": "My name is Nora.",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-1:q004",
   "unit": "conv-1",
   "category": "open-domain",
   "contextTokens": 40,
   "answer": "Not mentioned in the conversation",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-1:q005",
   "unit": "conv-1",
   "category": "adversarial",
   "contextTokens": 40,
   "answer": "Not mentioned in the conversation",
   "f1": 1,
   "judged": null
  },
  {
   "id": "conv-2:q001",
   "unit": "conv-2",
   "category": "single-hop",
   "contextTokens": 34,
   "answer": "Based on the above context, write an answer in the form of",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-2:q002",
   "unit": "conv-2",
   "category": "single-hop",
   "contextTokens": 34,
   "answer": "Not mentioned in the conversation",
   "f1": 0,
   "judged": false
  }
 ],
 "ledger": {
  "extraction": {
   "calls": 32,
   "input": 48629,
   "output": 24034,
   "cacheRead": 40748,
   "cacheWrite": 0,
   "micros": 263793
  },
  "answer": {
   "calls": 7,
   "input": 1181,
   "output": 3575,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 1906
  },
  "judge": {
   "calls": 6,
   "input": 3398,
   "output": 3037,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 1859
  },
  "baseline": {
   "calls": 0,
   "input": 0,
   "output": 0,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 0
  }
 },
 "updatedAt": "2026-10-29T13:55:30.286Z"
}
`}},{args:{id:"locomo-mvtlvdib",format:"official"},answer:{name:"locomo-mvtlvdib.official.json",text:`[
  {
    "sample_id": "conv-1",
    "qa": [
      {
        "question": "Where does Nora live?",
        "answer": "Lisbon",
        "evidence": [
          "D1:3"
        ],
        "category": 4,
        "coere_prediction": "I live in Lisbon."
      },
      {
        "question": "When did Nora run her first half marathon?",
        "answer": "16 April 2023",
        "evidence": [
          "D2:2"
        ],
        "category": 2,
        "coere_prediction": "Based on the above context, write an answer in the form of"
      },
      {
        "question": "What hobbies has Nora taken up?",
        "answer": "pottery, running",
        "evidence": [
          "D1:1",
          "D2:2"
        ],
        "category": 1,
        "coere_prediction": "My name is Nora."
      },
      {
        "question": "Would Theo likely enjoy a dog park?",
        "answer": "Likely yes; he has a beagle",
        "evidence": [
          "D1:2"
        ],
        "category": 3,
        "coere_prediction": "Not mentioned in the conversation"
      },
      {
        "question": "What is the name of Nora's cat?",
        "answer": null,
        "evidence": [
          "D1:2"
        ],
        "category": 5,
        "adversarial_answer": "Pepper",
        "coere_prediction": "Not mentioned in the conversation"
      }
    ]
  },
  {
    "sample_id": "conv-2",
    "qa": [
      {
        "question": "Who is Ivy learning the violin with?",
        "answer": "her grandmother",
        "evidence": [
          "D1:1"
        ],
        "category": 4,
        "coere_prediction": "Based on the above context, write an answer in the form of"
      },
      {
        "question": "Where did Sam go hiking?",
        "answer": "Patagonia",
        "evidence": [
          "D1:2"
        ],
        "category": 4,
        "coere_prediction": "Not mentioned in the conversation"
      }
    ]
  }
]
`}},{args:{id:"locomo-mvtlv30c",format:"txt"},answer:{name:"locomo-mvtlv30c.txt",text:`coere eval report 1
kind benchmark locomo
run locomo-mvtlv30c
version 1.1.3 Coere v2
build fake-v2
date 2026-10-29T13:55:03.804Z
mode live
models answer claude-haiku-5-5 judge claude-sonnet-5-5 extract claude-sonnet-5-5 short claude-haiku-5-5 jev jev-1.14.0
set locomo10.json sha256 7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a
state done
sample all seed 1 baseline no budget 1500 cap usd 0.5000
questions 7 answered 7
score f1 0.200
score judged 0.167 n 6 judged-by claude-sonnet-5-5
category adversarial n 1 f1 1.000 judged -
category multi-hop n 1 f1 0.000 judged 0.000
category open-domain n 1 f1 0.000 judged 0.000
category single-hop n 3 f1 0.133 judged 0.333
category temporal n 1 f1 0.000 judged 0.000
context tokens per question 38 full 157 saved 75.6%
cost extraction calls 32 in 48629 out 24034 cache 30652 usd 0.2870
cost answer calls 7 in 1181 out 3575 cache 0 usd 0.0019
cost judge calls 6 in 3398 out 3037 cache 0 usd 0.0372
cost baseline calls 0 in 0 out 0 cache 0 usd 0.0000
cost total usd 0.3261
case conv-1:q001 single-hop judged correct f1 0.400 context 40
case conv-1:q002 temporal judged wrong f1 0.000 context 40
case conv-1:q003 multi-hop judged wrong f1 0.000 context 40
case conv-1:q004 open-domain judged wrong f1 0.000 context 40
case conv-1:q005 adversarial judged - f1 1.000 context 40
case conv-2:q001 single-hop judged wrong f1 0.000 context 34
case conv-2:q002 single-hop judged wrong f1 0.000 context 34
`}},{args:{id:"locomo-mvtlv30c",format:"json"},answer:{name:"locomo-mvtlv30c.json",text:`{
 "v": 1,
 "kind": "benchmark",
 "id": "locomo-mvtlv30c",
 "bench": "locomo",
 "stamp": {
  "version": "1.1.3 Coere v2",
  "build": "fake-v2",
  "startedAt": "2026-10-29T13:55:03.804Z",
  "mode": "live",
  "models": {
   "answer": "claude-haiku-5-5",
   "judge": "claude-sonnet-5-5",
   "extract": "claude-sonnet-5-5",
   "short": "claude-haiku-5-5",
   "jev": "jev-1.14.0"
  },
  "sets": [
   {
    "name": "locomo10.json",
    "sha256": "7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a"
   }
  ]
 },
 "sample": "all",
 "seed": 1,
 "baseline": false,
 "budget": 1500,
 "capMicros": 500000,
 "state": "done",
 "keep": false,
 "questions": [
  "conv-1:q001",
  "conv-1:q002",
  "conv-1:q003",
  "conv-1:q004",
  "conv-1:q005",
  "conv-2:q001",
  "conv-2:q002"
 ],
 "units": [
  {
   "id": "conv-1",
   "state": "built",
   "chatTokens": 94,
   "fullTokens": 182,
   "extraction": {
    "calls": 25,
    "input": 37341,
    "output": 18537,
    "cacheRead": 22178,
    "cacheWrite": 10096,
    "micros": 227911
   }
  },
  {
   "id": "conv-2",
   "state": "built",
   "chatTokens": 34,
   "fullTokens": 94,
   "extraction": {
    "calls": 7,
    "input": 11288,
    "output": 5497,
    "cacheRead": 8474,
    "cacheWrite": 0,
    "micros": 59104
   }
  }
 ],
 "results": [
  {
   "id": "conv-1:q001",
   "unit": "conv-1",
   "category": "single-hop",
   "contextTokens": 40,
   "answer": "I live in Lisbon.",
   "f1": 0.4,
   "judged": true
  },
  {
   "id": "conv-1:q002",
   "unit": "conv-1",
   "category": "temporal",
   "contextTokens": 40,
   "answer": "Based on the above context, write an answer in the form of",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-1:q003",
   "unit": "conv-1",
   "category": "multi-hop",
   "contextTokens": 40,
   "answer": "My name is Nora.",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-1:q004",
   "unit": "conv-1",
   "category": "open-domain",
   "contextTokens": 40,
   "answer": "Not mentioned in the conversation",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-1:q005",
   "unit": "conv-1",
   "category": "adversarial",
   "contextTokens": 40,
   "answer": "Not mentioned in the conversation",
   "f1": 1,
   "judged": null
  },
  {
   "id": "conv-2:q001",
   "unit": "conv-2",
   "category": "single-hop",
   "contextTokens": 34,
   "answer": "Based on the above context, write an answer in the form of",
   "f1": 0,
   "judged": false
  },
  {
   "id": "conv-2:q002",
   "unit": "conv-2",
   "category": "single-hop",
   "contextTokens": 34,
   "answer": "Not mentioned in the conversation",
   "f1": 0,
   "judged": false
  }
 ],
 "ledger": {
  "extraction": {
   "calls": 32,
   "input": 48629,
   "output": 24034,
   "cacheRead": 30652,
   "cacheWrite": 10096,
   "micros": 287015
  },
  "answer": {
   "calls": 7,
   "input": 1181,
   "output": 3575,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 1906
  },
  "judge": {
   "calls": 6,
   "input": 3398,
   "output": 3037,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 37166
  },
  "baseline": {
   "calls": 0,
   "input": 0,
   "output": 0,
   "cacheRead": 0,
   "cacheWrite": 0,
   "micros": 0
  }
 },
 "updatedAt": "2026-10-29T13:55:17.410Z"
}
`}},{args:{id:"locomo-mvtlv30c",format:"official"},answer:{name:"locomo-mvtlv30c.official.json",text:`[
  {
    "sample_id": "conv-1",
    "qa": [
      {
        "question": "Where does Nora live?",
        "answer": "Lisbon",
        "evidence": [
          "D1:3"
        ],
        "category": 4,
        "coere_prediction": "I live in Lisbon."
      },
      {
        "question": "When did Nora run her first half marathon?",
        "answer": "16 April 2023",
        "evidence": [
          "D2:2"
        ],
        "category": 2,
        "coere_prediction": "Based on the above context, write an answer in the form of"
      },
      {
        "question": "What hobbies has Nora taken up?",
        "answer": "pottery, running",
        "evidence": [
          "D1:1",
          "D2:2"
        ],
        "category": 1,
        "coere_prediction": "My name is Nora."
      },
      {
        "question": "Would Theo likely enjoy a dog park?",
        "answer": "Likely yes; he has a beagle",
        "evidence": [
          "D1:2"
        ],
        "category": 3,
        "coere_prediction": "Not mentioned in the conversation"
      },
      {
        "question": "What is the name of Nora's cat?",
        "answer": null,
        "evidence": [
          "D1:2"
        ],
        "category": 5,
        "adversarial_answer": "Pepper",
        "coere_prediction": "Not mentioned in the conversation"
      }
    ]
  },
  {
    "sample_id": "conv-2",
    "qa": [
      {
        "question": "Who is Ivy learning the violin with?",
        "answer": "her grandmother",
        "evidence": [
          "D1:1"
        ],
        "category": 4,
        "coere_prediction": "Based on the above context, write an answer in the form of"
      },
      {
        "question": "Where did Sam go hiking?",
        "answer": "Patagonia",
        "evidence": [
          "D1:2"
        ],
        "category": 4,
        "coere_prediction": "Not mentioned in the conversation"
      }
    ]
  }
]
`}}]};var f=Re,Pe={download:1,sonnet:.6,haiku:.36,evals:1},Ne={download:0,sonnet:0,haiku:0,evals:2600},H=class{constructor(t){this.world=t;this.state=f.initial;this.timers=[];this.last=null;this.fast=()=>!1}install(){let t=this.world;t.engine("lab.state",()=>this.state),t.engine("lab.download",()=>this.play("download")),t.engine("lab.estimate",o=>{let n=o.args??{};return this.state===f.initial?null:f.estimates.find(a=>["sample","answer","judge","baseline"].every(s=>a.args[s]===(n[s]??(s==="baseline"?!1:void 0))))?.answer??null}),t.engine("lab.start",o=>{let a=o.args?.judge==="haiku"?"haiku":"sonnet";return this.play(a),f[a].answer}),t.engine("lab.evals",()=>(this.play("evals"),f.evals.answer)),t.engine("lab.stop",()=>this.state),t.engine("lab.run",o=>f.runs[o.args.id]??null),t.engine("lab.export",o=>{let n=o.args;return f.exports.find(a=>a.args.id===n.id&&a.args.format===n.format)?.answer??null}),t.engine("lab.delete",()=>this.state),t.engine("lab.resume",()=>null),t.engine("lab.import",()=>this.state)}play(t){this.stop();let o=f[t].states,n=o.at(-1).t,a=n*Pe[t]<Ne[t]?Ne[t]/Math.max(1,n):Pe[t];if(this.state=o[0].state,this.last=o.at(-1).state,this.fast())return this.state=o.at(-1).state,o[0].state;for(let s of o.slice(1))this.timers.push(window.setTimeout(()=>this.state=this.fast()?o.at(-1).state:s.state,s.t*a));return this.state}finish(){this.stop(),this.last&&(this.state=this.last)}stop(){for(let t of this.timers)clearTimeout(t);this.timers=[]}};var wt=[{id:"devtools",title:"Dev Tools"},{id:"estimate",title:"The estimate"},{id:"run",title:"A run"},{id:"results",title:"Results"},{id:"export",title:"Export"},{id:"compare",title:"Compare"},{id:"evals",title:"Evals"}],ft="/preview/live/lib/",B=null;function vt(e){B?.stop(),B=new H(e),B.install(),qe(e)}var Ze=e=>A("tab",e,{exact:!0,within:'[role="tablist"][aria-label="Sections"]'}),N=e=>t=>C(t,"section.cx-lab-card").find(o=>{let n=(o.querySelector("h2")?.textContent??"").trim();return E(o)&&(typeof e=="string"?n===e:e.test(n))}),U=(e,t)=>o=>{let n=typeof e=="function"?e(o):we(o,e);return n?t(n):null},O=(e,t)=>U(e,o=>[...o.querySelectorAll("button")].find(n=>E(n)&&(typeof t=="string"?(n.textContent??"").trim()===t:t.test((n.textContent??"").trim())))),Be=(e,t)=>U(e,o=>[...o.querySelectorAll("label.cx-lab-field")].find(n=>n.querySelector("span")?.textContent===t)?.querySelector("select, input")),Z=N("Runs"),ne=e=>U(Z,t=>t.querySelectorAll("li.cx-lab-run")[e]),te=(e,t)=>o=>{let n=ne(e)(o);return n?[...n.querySelectorAll("button")].find(a=>(a.textContent??"").trim()===t):null},Ie=e=>t=>ne(e)(t)?.querySelector('[role="checkbox"], input[type="checkbox"]'),P=".cx-lab-job";async function oe(e,t,o=6e4){let n=Date.now()+o;for(;!t();){if(e.fast&&B?.finish(),Date.now()>n)throw new Error("benchmarks-evals: timed out");await new Promise(a=>setTimeout(a,50))}}async function De(e,t,o,n){await e.click(t,o,{after:380});let a=await e.waitFor(t,o);a.value=n,a.dispatchEvent(new Event("change",{bubbles:!0})),a.dispatchEvent(new Event("input",{bubbles:!0})),await e.wait(420)}function We(e,t,o=24){let n=e.doc.scrollingElement,a=n.scrollTop;t.scrollIntoView({block:"start"});let s=Math.max(0,n.scrollTop-o);return n.scrollTop=a,s}async function y(e,t,o,n=24){let a=await e.waitFor(t,o),s=We(t,a,n)-t.doc.scrollingElement.scrollTop;Math.abs(s)<4||(await e.moveTo({x:1240,y:520}),await e.wheel(t,s,Math.max(10,Math.min(36,Math.round(Math.abs(s)/28)))),t.doc.scrollingElement.scrollTop+=We(t,a,n)-t.doc.scrollingElement.scrollTop)}async function bt(e){let t=Number.NaN;for(let o=0,n=0;o<6&&n<100;n++){let a=e.getBoundingClientRect().top;o=a===t?o+1:0,t=a,await new Promise(s=>setTimeout(s,50))}}function xt(e){let t=e.win.HTMLElement.prototype,o=t.focus;t.focus=function(n){let a=n&&n.preventScroll===!0&&!("focusVisible"in n);return o.call(this,a?{...n,focusVisible:!1}:n)}}function yt(e){e.scrollIntoView({block:"center"})}async function kt(e){let t=B;t.fast=()=>e.fast,e.chapter("devtools");let o=await e.open("dash",`${ft}console-v2.html?tab=settings`);xt(o);let n=A("switch","Enable Dev Tools");await bt(await e.waitFor(o,n)),yt(await e.waitFor(o,n)),e.say("Coere can score its own memory, right from the dashboard."),await e.card("Benchmarks and Evals","Measure Coere\u2019s memory, and check it before each version.",2600),await e.film(o),e.say("In Settings, Enable Dev Tools adds Benchmarks and Evals to the dashboard."),await e.click(o,n,{after:600}),await e.click(o,Ze("Benchmarks"),{after:400});let a=N("LoCoMo");await e.waitFor(o,a),await e.rest(),e.say("Runs use a separate scratch memory. Maya\u2019s own chats and memory are never touched."),await e.wait(3200),e.chapter("estimate"),e.say("She downloads LoCoMo, a public benchmark of long conversations."),await e.click(o,O(a,/^Download/),{after:300}),await e.waitFor(o,M(/^Downloaded .*questions\.$/,"span",{within:a}),6e4),await e.wait(500),await De(e,o,Be(a,"Questions"),"all"),await e.rest(),e.say("Before anything runs, it says about how much the run will cost."),await e.glide(o,U(a,c=>c.querySelector(".cx-lab-estimate"))),await e.wait(3200),e.chapter("run"),e.say("Start builds a memory from the conversations, then answers each question and judges the answers."),await e.click(o,O(a,"Start"),{after:300}),e.fast||await e.waitFor(o,M(/^Building memory/,".cx-lab-job-what"),6e4),await e.rest(),await oe(e,()=>!e.has(o,P)),await e.waitFor(o,M(/^Done\./,".cx-lab-note",{within:ne(0)})),await e.wait(900),e.chapter("results"),e.say("The result scores it the benchmark\u2019s own way, by category, and says what each part cost."),await y(e,o,Z),await e.click(o,te(0,"View"),{after:300}),await e.waitFor(o,M(/^F1$/,".cx-lab-tile-label",{within:".cx-lab-view"})),await y(e,o,N(/^LoCoMo, /)),await e.rest(),await e.wait(3600),await e.moveTo({x:800,y:500}),await e.wheel(o,360),e.say("It also shows how little context Coere sent, against the whole history."),await e.wait(3400),await e.rest(),e.chapter("export"),await y(e,o,Z),e.say("Export .txt saves the run as a plain report, with every case, its answer and its score."),await e.click(o,te(0,"Export .txt"),{after:400}),await e.rest(),await e.wait(2400),e.chapter("compare"),e.say("A second run uses a cheaper judge. She ticks both runs and presses Compare."),await y(e,o,".cx-lab-about",200),await De(e,o,Be(a,"Judge model"),"haiku"),await e.click(o,O(a,"Start"),{after:300}),e.fast||await e.waitFor(o,P),await e.rest(),await oe(e,()=>!e.has(o,P)),await e.wait(600),await y(e,o,Z),await e.click(o,Ie(0),{after:200}),await e.click(o,Ie(1),{after:200}),await e.click(o,O(Z,"Compare"),{after:600});let i=N("Compare");await e.waitFor(o,M("Judged correct","th",{within:i})),await y(e,o,i),await e.rest(),e.say("Each score and cost side by side, with the change, ready to export."),await e.wait(4e3),e.chapter("evals"),await e.click(o,Ze("Evals"),{after:400}),await e.waitFor(o,N("Sets")),o.doc.scrollingElement.scrollTop=0,e.say("Evals runs Coere\u2019s own checks, the same cases as the command line. Check mode costs nothing.");for(let c of["Changing chats and structure","Memory adding","Cori routing and gates"])await e.click(o,A("checkbox",c),{after:220});await e.rest(),await e.wait(1800),await e.click(o,A("button","Run",{exact:!0}),{after:400}),e.fast||await e.waitFor(o,P),await e.rest(),await e.wait(2600),await oe(e,()=>!e.has(o,P)),await e.click(o,te(0,"View"),{after:300}),await e.waitFor(o,".cx-lab-cases tbody tr",3e4),await y(e,o,".cx-lab-sets"),await e.rest(),e.say("Every check held. Each case shows what it expected and what it got."),await e.wait(4e3),e.say("Benchmarks and Evals stay off until Dev Tools is on."),await e.card("Benchmarks and Evals","In the dashboard, behind Dev Tools.",2400),e.world.unanswered.length&&console.warn("Benchmarks and Evals: unanswered",JSON.stringify(e.world.unanswered))}be({title:"Benchmarks and Evals",chapters:wt},kt,vt);})();
