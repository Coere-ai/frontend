"use strict";(()=>{var ye="/preview/live/lib/ext/";var p={width:1440,height:900},ot='<svg viewBox="0 0 512 512" width="56" height="56" fill="#5267f7" aria-hidden="true"><path d="M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z"/><path d="M 42 460 L 88 190 L 220 58 L 332 170 L 168 334 Z" transform="rotate(180 256 256)"/></svg>',nt='<svg width="23" height="27" viewBox="0 0 23 27"><path d="M5 3 L5 20.6 L9.1 16.8 L11.6 22.7 L14.6 21.4 L12.1 15.6 L17.7 15.6 Z" fill="#000" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>',Te=`
@font-face{font-family:Geist;src:url(/preview/live/lib/ext/fonts/Geist-Variable.woff2) format("woff2");font-weight:100 900}
html,body{margin:0;height:100%;background:#fff;overflow:hidden}
#view{position:fixed;inset:0;overflow:hidden}
#stage{position:absolute;left:50%;top:50%;width:${p.width}px;height:${p.height}px;overflow:hidden;background:#fff;transform-origin:center;transform:translate(-50%,-50%)}
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
`;function je(){return`<div id="view"><div id="stage"><div id="camera"><div id="tabs"></div><div id="card"></div></div><div id="pointer">${nt}</div><div id="caption"></div><div id="cover"></div></div></div>`}var ke=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");function Ee(e,t){return`<main>${ot}${e?`<h1>${ke(e)}</h1>`:""}${t?`<p>${ke(t)}</p>`:""}</main>`}function j(e,t){let o=e.elementFromPoint(t.x,t.y);for(;o?.shadowRoot;){let n=o.shadowRoot.elementFromPoint(t.x,t.y);if(!n||n===o)break;o=n}return o}function se(e){let t=e.activeElement;for(;t?.shadowRoot?.activeElement;)t=t.shadowRoot.activeElement;return t}var w=(e,t,o,n={})=>new e.MouseEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:o.x,clientY:o.y,view:e,...n}),R=(e,t,o,n={})=>new e.PointerEvent(t,{bubbles:!0,cancelable:!0,composed:!0,clientX:o.x,clientY:o.y,pointerId:1,pointerType:"mouse",isPrimary:!0,view:e,...n}),O=class{constructor(){this.over=null}move(t,o){let n=t.defaultView;if(!n)return;let a=j(t,o);a!==this.over&&(this.over&&(this.over.dispatchEvent(R(n,"pointerout",o)),this.over.dispatchEvent(w(n,"mouseout",o)),this.over.dispatchEvent(w(n,"mouseleave",o,{bubbles:!1}))),a&&(a.dispatchEvent(R(n,"pointerover",o)),a.dispatchEvent(w(n,"mouseover",o)),a.dispatchEvent(w(n,"mouseenter",o,{bubbles:!1}))),this.over=a),(a??t).dispatchEvent(R(n,"pointermove",o)),(a??t).dispatchEvent(w(n,"mousemove",o))}};function at(e){let t=e.closest?.('input, textarea, select, button, a[href], [tabindex], [contenteditable="true"], [contenteditable=""]');t?t.focus({preventScroll:!0,focusVisible:!1}):se(e.ownerDocument)?.blur?.()}function Ce(e,t,o=0,n=1){let a=e.defaultView,s=j(e,t);return s?(s.dispatchEvent(R(a,"pointerdown",t,{button:o,buttons:1})),s.dispatchEvent(w(a,"mousedown",t,{button:o,buttons:1,detail:n}))&&at(s),s):null}function Me(e,t,o,n=0,a=1){let s=e.defaultView,i=j(e,t)??o;i&&(i.dispatchEvent(R(s,"pointerup",t,{button:n})),i.dispatchEvent(w(s,"mouseup",t,{button:n,detail:a})),o&&(i===o||o.contains(i)||i.contains(o))&&(i.dispatchEvent(w(s,n===2?"contextmenu":"click",t,{button:n,detail:a})),a===2&&i.dispatchEvent(w(s,"dblclick",t,{button:n,detail:2}))))}var st={Enter:"Enter",Escape:"Escape",Tab:"Tab",Backspace:"Backspace",ArrowDown:"ArrowDown",ArrowUp:"ArrowUp",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",End:"End",Home:"Home"," ":"Space"};function V(e,t){let o=e.defaultView,n=t.length===1?[t]:t.split("+"),a=n.pop(),s={metaKey:n.includes("Meta"),ctrlKey:n.includes("Control"),altKey:n.includes("Alt"),shiftKey:n.includes("Shift")},i=se(e)??e.body,c={key:a,code:st[a]??(a.length===1?`Key${a.toUpperCase()}`:a),bubbles:!0,cancelable:!0,composed:!0,...s},l=i.dispatchEvent(new o.KeyboardEvent("keydown",c));l&&a.length===1&&!s.metaKey&&!s.ctrlKey?(i.dispatchEvent(new o.KeyboardEvent("keypress",c)),U(e,a)):l&&a==="Backspace"?e.execCommand("delete"):l&&a==="Enter"&&i instanceof o.HTMLTextAreaElement?U(e,`
`):l&&a==="End"&&it(i)&&ct(e,i),i.dispatchEvent(new o.KeyboardEvent("keyup",c))}function U(e,t){if(!e.execCommand("insertText",!1,t)){let o=se(e);o&&"value"in o&&(o.value+=t,o.dispatchEvent(new e.defaultView.InputEvent("input",{bubbles:!0,composed:!0,inputType:"insertText",data:t})))}}function it(e){return e instanceof HTMLElement&&(e.isContentEditable||"value"in e)}function ct(e,t){if("value"in t){let a=t;a.setSelectionRange(a.value.length,a.value.length);return}let o=e.createRange();o.selectNodeContents(t),o.collapse(!1);let n=e.getSelection();n?.removeAllRanges(),n?.addRange(o)}function _e(e,t,o){let n=e.defaultView,a=j(e,t)??e.documentElement;if(a.dispatchEvent(new n.WheelEvent("wheel",{bubbles:!0,cancelable:!0,composed:!0,clientX:t.x,clientY:t.y,deltaY:o}))){for(let i=a;i;i=i.parentElement??i.getRootNode().host??null){let c=n.getComputedStyle(i);if(/(auto|scroll)/.test(c.overflowY)&&i.scrollHeight>i.clientHeight){i.scrollBy({top:o});return}}e.scrollingElement?.scrollBy({top:o})}}function E(e,t){let o=[],n=a=>{for(let s of a.querySelectorAll("*"))s.matches(t)&&o.push(s),s.shadowRoot&&n(s.shadowRoot)};return n(e),o}function Le(e,t){return E(e,t)[0]??null}function C(e){let t=e.getBoundingClientRect();if(t.width===0&&t.height===0)return!1;let o=e.ownerDocument.defaultView?.getComputedStyle(e);return o?.visibility!=="hidden"&&o?.display!=="none"}function rt(e){let t=e.getAttribute("aria-label");if(t)return t.trim();let o=e.getAttribute("aria-labelledby");if(o){let n=e.getRootNode(),a=o.split(/\s+/).map(s=>n.getElementById?.(s)?.textContent??"").join(" ").trim();if(a)return a}return(e.textContent??"").replace(/\s+/g," ").trim()}var lt={button:'button, [role="button"], input[type="button"], input[type="submit"]',link:'a[href], [role="link"]',heading:'h1, h2, h3, h4, h5, h6, [role="heading"]',textbox:'input:not([type]), input[type="text"], input[type="search"], textarea, [contenteditable="true"], [role="textbox"]',checkbox:'input[type="checkbox"], [role="checkbox"]',tab:'[role="tab"]',option:'[role="option"], option',menuitem:'[role="menuitem"]',dialog:'dialog, [role="dialog"]',region:'section[aria-label], [role="region"]',switch:'[role="switch"]',list:'ul, ol, [role="list"]',listitem:'li, [role="listitem"]'};function N(e,t,o={}){return n=>{let a=o.within?P(n,o.within):n;return a?E(a,lt[e]??`[role="${e}"]`).find(s=>C(s)&&Ae(rt(s),t,o.exact)):null}}function M(e,t="*",o={}){return n=>{let a=o.within?P(n,o.within):n;if(!a)return null;let s=E(a,t).filter(i=>C(i)&&Ae((i.textContent??"").replace(/\s+/g," ").trim(),e,o.exact));return s.find(i=>!s.some(c=>c!==i&&i.contains(c)))??null}}function Ae(e,t,o=!1){return t===void 0?!0:t instanceof RegExp?t.test(e):o?e===t:e.toLowerCase().includes(t.toLowerCase())}function P(e,t){return typeof t=="function"?t(e)??null:E(e,t).find(C)??null}var dt=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,ht={x:1480,y:940},Se=()=>new Promise(e=>requestAnimationFrame(()=>e())),Q=class{constructor(t,o,n){this.world=t;this.el=o;this.hooks=n;this.sites=new Map;this.tabs=new Map;this.ready=new Map;this.hovers=new WeakMap;this.on=null;this.at={x:720,y:560}}get filming(){return this.on!==null}get fast(){return this.hooks.fast()}async open(t,o,n){this.tabs.get(t)?.frame.remove(),n&&this.sites.set(t,n);let a=document.createElement("iframe");a.dataset.tab=t,a.title="";let s=n?new Promise(l=>this.ready.set(t,l)):Promise.resolve(),i=new Promise(l=>a.addEventListener("load",()=>l(),{once:!0}));a.src=o,this.el.tabs.append(a),await i,await Promise.race([s,new Promise(l=>setTimeout(l,8e3))]);let c={name:t,frame:a,doc:a.contentDocument,win:a.contentWindow};return this.tabs.set(t,c),await c.doc.fonts?.ready,c}started(t){this.ready.get(t)?.()}async film(t){this.el.card.classList.remove("on");for(let o of this.tabs.values())o.frame.classList.toggle("on",o===t);this.on=t,this.hooks.filmed(),await this.rest(),await this.wait(300)}close(t){t.frame.remove(),this.tabs.get(t.name)?.frame===t.frame&&(this.world.forget(t.name),this.tabs.delete(t.name)),this.on===t&&(this.on=null)}async card(t,o,n=3e3){this.hooks.cards()&&(this.el.card.innerHTML=Ee(t,o),this.el.card.classList.add("on"),this.pointer(!1),await this.wait(n))}chapter(t){this.hooks.chapter(t)}say(t){this.el.caption.textContent=t}async wait(t){await this.hooks.gate(),this.hooks.spend(t),!(this.fast&&(await Se(),this.fast||t<=16))&&await new Promise(o=>setTimeout(o,t))}async waitFor(t,o,n=2e4){let a=Date.now()+n;for(;;){let s=P(t.doc,o);if(s)return s;if(Date.now()>a)throw new Error(`${t.name}: nothing found for ${String(o)}`);await new Promise(i=>setTimeout(i,50))}}has(t,o){return P(t.doc,o)!==null}async centerOf(t,o){let n=await this.waitFor(t,o);n.scrollIntoView({block:"nearest",inline:"nearest"});let a=n.getBoundingClientRect();return{x:a.left+a.width/2,y:a.top+a.height/2}}async moveTo(t,o={}){let n=this.at,a=t.x-n.x,s=t.y-n.y,i=Math.hypot(a,s);this.pointer(!0);let c=o.ms??Math.min(900,240+i*.5);if(i>=1&&this.hooks.spend(c),this.fast||i<1)return this.place(t);let l=o.straight?0:Math.min(36,i*.04)*(a>=0?1:-1),u=performance.now();for(;;){await this.hooks.gate();let m=Math.min(1,(performance.now()-u)/c),d=dt(m),g=Math.sin(Math.PI*d)*l;if(this.place({x:n.x+a*d+-s/i*g,y:n.y+s*d+a/i*g}),m>=1)break;await Se()}}async glide(t,o){await this.moveTo(await this.centerOf(t,o))}async click(t,o,n={}){let a=await this.centerOf(t,o);await this.moveTo(a),await this.wait(180);let s=await this.centerOf(t,o);Math.hypot(s.x-a.x,s.y-a.y)>3&&await this.moveTo(a=s,{ms:220}),await this.pressAt(t,a,n.button??0,n.count??1),await this.wait(n.after??450)}async clickAt(t,o,n={}){await this.moveTo(o),await this.wait(180),await this.pressAt(t,o,n.button??0,n.count??1),await this.wait(n.after??450)}async pressAt(t,o,n,a){for(let s=1;s<=a;s++){this.el.pointer.classList.add("down");let i=Ce(t.doc,o,n,s);await this.wait(60),Me(t.doc,o,i,n,s),this.el.pointer.classList.remove("down")}}async type(t,o,n=55){if(this.hooks.spend(n*o.length),this.fast){o.length>1&&U(t.doc,o.slice(0,-1)),o&&V(t.doc,o.slice(-1));return}for(let a of o)await this.hooks.gate(),V(t.doc,a),await new Promise(s=>setTimeout(s,n*(.7+Math.random()*.6)))}async press(t,o,n=120){V(t.doc,o),await this.wait(n)}async rest(){await this.moveTo(ht),this.pointer(!1)}async wheel(t,o,n=12){for(let a=0;a<n;a++)_e(t.doc,this.at,o/n),await this.wait(30)}async camera(t,o=1200){let n=t?Math.max(360,Math.min(p.width,t.w)):p.width,a=p.width/n,s=p.height/a,i=t?Math.min(Math.max(0,t.x),p.width-n):0,c=t?Math.min(Math.max(0,t.y),p.height-s):0;this.el.camera.style.transition=this.fast?"none":`transform ${o}ms cubic-bezier(0.22, 1, 0.36, 1)`,this.el.camera.style.transform=`scale(${a}) translate(${-i}px, ${-c}px)`,await this.wait(o)}hit(t,o){return j(t.doc,o)}place(t){if(this.at=t,this.el.pointer.style.left=`${t.x}px`,this.el.pointer.style.top=`${t.y}px`,this.on){let o=this.hovers.get(this.on)??new O;this.hovers.set(this.on,o),o.move(this.on.doc,t)}}pointer(t){this.el.pointer.style.opacity=t?"1":"0"}};var Z=class{constructor(){this.types=new Map;this.methods=new Map;this.listeners=new Map;this.storageListeners=new Map;this.stores={local:{},session:{},sync:{}};this.unanswered=[];this.on("batch.hello",()=>null).on("transfer.claim",()=>null).engine("knownUpdates",()=>({}))}on(t,o){return this.types.set(t,o),this}engine(t,o){return this.methods.set(t,o),this}async handle(t,o){let n=String(t?.type??""),a=n==="engine.call"?this.methods.get(String(t.method)):this.types.get(n);if(!a)return this.unanswered.push({tab:o,type:n==="engine.call"?`engine.${t.method}`:n}),{ok:!0,result:null};try{return{ok:!0,result:await a(t,o)??null}}catch(s){return{ok:!1,error:{code:"internal",message:String(s)}}}}listen(t,o){let n=this.listeners.get(t)??new Set;return n.add(o),this.listeners.set(t,n),()=>n.delete(o)}tell(t,o){for(let[n,a]of this.listeners)if(!(o&&n!==o))for(let s of a)ie(()=>s(t,{id:"coere"},()=>{}))}write(t,o){let n=this.stores[t]??={},a={};for(let[s,i]of Object.entries(o))a[s]={oldValue:n[s],newValue:i},n[s]=i;for(let s of this.storageListeners.keys())ie(()=>s(a,t))}remove(t,o){let n=this.stores[t]??={},a={};for(let s of o)a[s]={oldValue:n[s]},delete n[s];for(let s of this.storageListeners.keys())ie(()=>s(a,t))}watchStorage(t,o=""){return this.storageListeners.set(t,o),()=>this.storageListeners.delete(t)}forget(t){this.listeners.delete(t);for(let[o,n]of this.storageListeners)n===t&&this.storageListeners.delete(o)}reset(){this.listeners.clear(),this.storageListeners.clear()}};function ie(e){try{e()}catch{}}var J=class extends Error{};function qe(e,t,o){let n=new URLSearchParams(location.search),a=document.createElement("style");a.textContent=Te,document.head.append(a),document.title=e.title,document.body.innerHTML=je(),Object.assign(window,{__demoMeta:e});let s=r=>document.getElementById(r);n.get("captions")==="1"&&s("caption").classList.add("on");for(let r of["view","stage","camera","tabs"])s(r).addEventListener("scroll",h=>{let xe=h.currentTarget;xe.scrollTop=0,xe.scrollLeft=0});let i=()=>{let r=Math.min(innerWidth/p.width,innerHeight/p.height);s("stage").style.transform=`translate(-50%, -50%) scale(${r})`};addEventListener("resize",i),i();let c=n.get("from"),l=Math.max(0,Number(n.get("at")??0))*1e3,u=n.get("to"),m=n.get("loop")!=="0",d=!!c,g=0,f=!1,L=!1,we=null,x=null,K=0,te=0,oe=performance.now(),$=0,ne=n.get("pace")==="1",ae={},fe=null;l>0&&fetch("pace.json").then(r=>r.ok?r.json():null).then(r=>fe=r).catch(()=>{});let Y={now:new Z};Object.assign(window,{__demo:{get world(){return Y.now},assets:ye,site:r=>S.sites.get(r),ready:r=>S.started(r),extra:{}}});let ve=()=>{d=!1,g=0,f=!1,s("cover").classList.add("off"),q()},et=()=>(x&&$>0?fe?.[x]?.[$-1]:void 0)??te+(performance.now()-oe),A=()=>{d&&f&&et()>=g&&S?.filming&&requestAnimationFrame(()=>d&&ve())},S=be();function be(){return new Q(Y.now,{tabs:s("tabs"),card:s("card"),pointer:s("pointer"),caption:s("caption"),camera:s("camera")},{fast:()=>d,chapter(r){if(u&&r===u&&!d)throw new J;let h=d&&f&&r!==c;x=r,K=0,te=0,oe=performance.now(),$=0,ne&&(ae[r]=[]),h&&(g=0,A()),d&&r===c&&(f=!0,g=l,K=l/1e3,A()),q()},spend(r){ne&&x&&!d&&ae[x]?.push(Math.round(performance.now()-oe)),$+=1,te+=r,A()},cards:()=>!c,filmed(){A()},gate:()=>L?new Promise(r=>we=r):Promise.resolve()})}function q(){if(parent===window)return;let r={coereDemo:"state",chapters:e.chapters,chapter:x,at:K,paused:L,covered:d||!s("cover").classList.contains("off")};parent.postMessage(r,location.origin)}setInterval(()=>{!L&&!d&&(K+=.25),A(),q()},250),addEventListener("message",r=>{if(r.origin!==location.origin||r.source!==parent)return;let h=r.data?.coereDemo;h==="pause"&&(L=!0),h==="play"&&(L=!1,we?.()),q()});let H=0;async function tt(r){for(;;){s("cover").style.transition="none",s("cover").classList.remove("off"),s("cover").offsetWidth,s("cover").style.transition="",s("tabs").replaceChildren(),s("card").classList.remove("on"),s("camera").style.transform="";try{for(let h of Object.keys(localStorage))h.startsWith("coere")&&localStorage.removeItem(h)}catch{}Y.now=new Z,o(Y.now),S=be(),d=!!c,g=0,f=!1,x=null,q(),d||setTimeout(ve,50);try{await t(S)}catch(h){!(h instanceof J)&&r===H&&console.error(h)}if(r!==H||(await new Promise(h=>setTimeout(h,900)),r!==H))return;if(!m){ne&&Object.assign(window,{__pace:ae}),document.documentElement.dataset.demoEnded="";return}if(!u&&c){c=null,l=0;let h=new URL(location.href);h.searchParams.delete("from"),h.searchParams.delete("at"),history.replaceState(null,"",h)}}}tt(H)}var ut=/^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?)?)?$/;var Re=new Map;function mt(e){let t=Re.get(e);return t||(t=new Intl.DateTimeFormat("en-US",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Re.set(e,t)),t}function y(e,t){let o=mt(t).formatToParts(e),n=a=>Number(o.find(s=>s.type===a)?.value);return{year:n("year"),month:n("month"),day:n("day"),hour:n("hour"),minute:n("minute")}}function Ne(e,t){let o=Math.floor(e/6e4)*6e4,n=y(o,t);return(Date.UTC(n.year,n.month-1,n.day,n.hour,n.minute)-o)/6e4}function D(e,t){let o=ut.exec(e.at);if(!o)throw new Error("bad when");let[n,a,s,i,c,l]=o.slice(1).map(f=>f===void 0?void 0:Number(f)),u=n,m;i!==void 0?m=Date.UTC(u,a-1,s,i,c,l??59,999):s!==void 0?m=Date.UTC(u,a-1,s,23,59,59,999):a!==void 0?m=Date.UTC(u,a,1)-1:m=Date.UTC(u+1,0,1)-1;let d=e.tz??t,g=m-Ne(m,d)*6e4;return m-Ne(g,d)*6e4}function ce(e){return e.at.includes("T")}var _=864e5,pt=14*_,gt=14*_,wt=30*_,Pe=["none","later","upcoming","soon","today","overdue"],re={level:"none",from:null};function Ze(e){return e<0?"overdue":e<=_?"today":e<=3*_?"soon":e<=14*_?"upcoming":"later"}function De(e,t,o){if(e.status!=="active"&&e.status!=="disputed"||e.progress==="completed"||e.progress==="cancelled")return re;let n=Math.max(0,...e.evidence.map(c=>Date.parse(c.at))),a=e.urgency?.due,s=re;if(a){let c=D(a,o),l=Ze(c-t);if(l==="overdue"&&t-c>pt&&n<c)return{level:"stale",from:"due"};s={level:l,from:"due"}}else if(e.kind==="event"&&e.start){let c=D(e.start,o);c>=t&&(s={level:Ze(c-t),from:"start"})}let i=ft(e.urgency?.priority??0,a!==void 0,t-n);return Pe.indexOf(i)>Pe.indexOf(s.level)?{level:i,from:"priority"}:s}function ft(e,t,o){return e>=1&&e<=2&&(t||o<=gt)?"soon":e>=3&&e<=4&&(t||o<=wt)?"upcoming":"none"}var We=36e5,le=24*We,vt=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],bt=["January","February","March","April","May","June","July","August","September","October","November","December"];function Fe(e,t,o){let n=De(e,t,o),a=xt(e,n,t,o);return a===null?{level:n.level,label:null}:{level:n.level,label:e.status==="disputed"?`${a}. These disagree.`:a}}function xt(e,t,o,n){if(t.level==="none"||t.from===null)return null;if(t.from==="priority")return(e.urgency?.priority??0)<=2?"Marked urgent":"Marked important";let a=t.from==="due"?e.urgency?.due:e.start;if(!a)return null;let s=D(a,n);if(t.level==="overdue")return yt(o-s);if(t.level==="stale")return`Was due ${Be(a,s,o,n)}`;let i=t.from==="due"?"Due":"Starts",c=kt(o,s,n),l=ce(a)?` at ${Tt(y(s,n))}`:"";return c===0?`${i} today${l}`:c===1?`${i} tomorrow${l}`:i==="Due"&&(t.level==="today"||t.level==="soon")?`Due in ${c} days`:`${i} ${Be(a,s,o,n)}${i==="Starts"?l:""}`}function yt(e){return e>=le?Ie(Math.floor(e/le),"day"):Ie(Math.max(1,Math.floor(e/We)),"hour")}var Ie=(e,t)=>`Overdue by ${e} ${t}${e===1?"":"s"}`;function kt(e,t,o){let n=y(e,o),a=y(t,o);return Math.round((Date.UTC(a.year,a.month-1,a.day)-Date.UTC(n.year,n.month-1,n.day))/le)}function Be(e,t,o,n){let[a,s,i]=e.at.split(/[-T]/).map(Number),c=ce(e)?y(t,n):{year:a,month:s??0,day:i??0};if(c.month===0)return String(c.year);if(c.day===0)return`${bt[c.month-1]} ${c.year}`;let l=c.year===y(o,n).year?"":`, ${c.year}`;return`${vt[c.month-1]} ${c.day}${l}`}function Tt(e){return`${e.hour%12===0?12:e.hour%12}:${String(e.minute).padStart(2,"0")} ${e.hour<12?"AM":"PM"}`}var de=Date.parse("2026-10-15T16:00:00Z"),Ke="America/Los_Angeles",v=(e,t)=>`${e}_0199a5c1-8a00-7000-8000-${String(t).padStart(12,"0")}`,ao={self:v("ent",10),course:v("ent",11),project:v("ent",12),professor:v("ent",13),trip:v("ent",14)},jt=(e,t)=>({evidenceId:`${v("fact",100+e)}#e0`,platform:"chatgpt",convId:"chatgpt:fake-cs162",title:"Fake CS 162 project help",msg:e,role:"user",at:t,url:null,stale:!1}),Et=(e,t)=>t.map(o=>[e.indexOf(o),e.indexOf(o)+o.length]);function k(e,t){let{due:o,start:n,specifics:a=[],...s}=t,i=s.status??"active",c=s.kind==="event"?"event":"task",{level:l,label:u}=Fe({status:i,kind:c,urgency:o?{due:o}:{},...n?{start:n}:{},evidence:[{at:"2026-10-09T16:12:40Z"}]},de,Ke);return{id:v("fact",100+e),kind:"task",key:"due",importance:4,urgency:l,urgencyLabel:u,progress:null,disagree:i==="disputed",held:!1,pinned:!1,origin:"extracted",basis:"user_stated",sensitivity:null,sources:[jt(e,"2026-10-09T16:12:40Z")],supersededBy:null,replacedOn:null,changedBy:null,...s,status:i,text:t.text,specifics:Et(t.text,a),due:o?{at:o.at,tz:o.tz??null}:null}}var G=e=>({at:e,tz:Ke}),so={dueNow:k(1,{text:"Project 1 for CS 162 is due Oct 20 at 11:59pm.",due:G("2026-10-20T23:59"),specifics:["Oct 20 at 11:59pm"]}),dueBefore:k(2,{text:"Project 1 for CS 162 was due Oct 18 at 11:59pm.",due:G("2026-10-18T23:59"),specifics:["Oct 18 at 11:59pm"],status:"superseded",supersededBy:v("fact",101),replacedOn:"2026-10-09"}),weight:k(3,{kind:"attribute",key:"grade_weight",text:"Project 1 for CS 162 is worth 15% of the grade.",specifics:["15%"]}),instruction:k(4,{kind:"instruction",key:"instruction.punctuation",text:"You want AIs to never use em dashes.",held:!0}),allergy:k(5,{kind:"attribute",key:"allergy",text:"You are allergic to peanuts.",importance:5,sensitivity:"health"}),dinnerA:k(6,{kind:"event",key:"start",text:"Dinner with Fake Maya is on Nov 3.",start:G("2026-11-03T19:00"),specifics:["Nov 3"],status:"disputed"}),dinnerB:k(7,{kind:"event",key:"start",text:"Dinner with Fake Maya is on Nov 5.",start:G("2026-11-05T19:00"),specifics:["Nov 5"],status:"disputed"})};function $e(e,t={}){return{state:e,models:{extract:"claude-opus-5-5",consolidate:"claude-opus-5-5",short:"claude-haiku-5-5"},until:e==="waiting"?de+42e3:null,stopClass:e==="spend_limit"?"spend_cap":null,set:{id:"ws_fake_1",origin:"library",mode:"direct",state:e==="paused"?"paused":"running",byPlatform:{chatgpt:{chats:538,read:120,failed:0,refused:0,batched:0},claude:{chats:412,read:412,failed:3,refused:2,batched:0},gemini:{chats:290,read:0,failed:0,refused:0,batched:0}},linking:{queued:40,done:12},factsFound:3410,spentMicros:312e4,etaSec:1200},held:null,counts:{memories:3410,dueSoon:41,review:3,sourceChats:612,sourceChatsBy:{chatgpt:402,claude:210},held:1,chatsRead:532,chatsInLibrary:1240,failedJobs:3,refusedJobs:2},spend:{monthMicros:312e4,capMicros:2e7},poolSlots:{used:4,capacity:6},lastVerify:null,...t}}var Ct=["chatgpt","claude","gemini"],he=864e5,ue=Date.parse("2026-10-29T13:50:00Z"),Mt=["Notion PM role","PearX interview prep","GitHub handles for the team","Applying to Stripe","History reading list","PHYS 137 lab 1 done","A coworker wedding","Sparrowhawk database upgrade","SkipDoodle setup","Lisbon trip","Flight times for the trip","DATA 100 problem set due date"],Ye=Mt.map((e,t)=>{let o=Ct[t%3];return{id:`${o}:c${t+1}`,platform:o,platformConvId:`c${t+1}`,title:e,created:ue-(t+2)*he,updated:ue-(t+1)*he,messageCount:6+t%5*2,bytes:4e3+t*900,hash:`h${t}`,archived:!1,changedDuringRun:!1}});function He(e){e.write("local",{"coere.cori.hello":{at:ue-3*he}}),e.engine("memory.status",()=>$e("ready",{until:null,set:null,counts:{memories:412,dueSoon:6,review:0,sourceChats:38,sourceChatsBy:{chatgpt:16,claude:13,gemini:9},held:0,chatsRead:38,chatsInLibrary:38,failedJobs:0,refusedJobs:0},spend:{monthMicros:184e4,capMicros:2e7},poolSlots:{used:0,capacity:6}})).engine("memory.buildEstimate",()=>({chats:38,seconds:0,measured:!0,progress:null})).on("",()=>null).engine("memory.chat.keep",()=>({keep:"forever",cleared:0})).engine("listConversations",()=>({rows:Ye,total:Ye.length})).engine("stats",()=>({conversations:38,chunks:410,projects:0,textBytes:612e3,dbBytes:48e5,byPlatform:{chatgpt:{conversations:16,bytes:26e4},claude:{conversations:13,bytes:214e3},gemini:{conversations:9,bytes:138e3}}}))}var Oe={initial:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}},download:{answer:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:0,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}},states:[{t:0,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:0,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:163,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:313,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:326,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:626,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:487,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:939,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:609,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:1252,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:770,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:1565,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:933,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:1878,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:1097,state:{data:{locomo:null,longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"download",id:"locomo",phase:"downloading",done:2191,total:2500,micros:0},lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:1218,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},estimates:[{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:20781,expected:255320,high:558979},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:283,expected:2063,high:3911},total:{low:21064,expected:257383,high:562890},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:15971,expected:219763,high:491183},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"haiku",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:283,expected:2063,high:3911},total:{low:16254,expected:221826,high:495094},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:24455,expected:313458,high:673509},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:5644,expected:41274,high:78234},total:{low:30099,expected:354732,high:751743},minutes:1,capMicros:1e6}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:19645,expected:277901,high:605713},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:10,seed:1,answer:"sonnet",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:5644,expected:41274,high:78234},total:{low:25289,expected:319175,high:683947},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:20781,expected:255320,high:558979},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:283,expected:2063,high:3911},total:{low:21064,expected:257383,high:562890},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:15971,expected:219763,high:491183},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"haiku",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:283,expected:2063,high:3911},total:{low:16254,expected:221826,high:495094},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:24455,expected:313458,high:673509},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:5644,expected:41274,high:78234},total:{low:30099,expected:354732,high:751743},minutes:1,capMicros:1e6}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:19645,expected:277901,high:605713},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:50,seed:1,answer:"sonnet",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:5644,expected:41274,high:78234},total:{low:25289,expected:319175,high:683947},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:20781,expected:255320,high:558979},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:5064,expected:37428,high:71364},baseline:{low:283,expected:2063,high:3911},total:{low:21064,expected:257383,high:562890},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:15971,expected:219763,high:491183},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"haiku",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:194,expected:3060,high:6028},judge:{low:254,expected:1871,high:3568},baseline:{low:283,expected:2063,high:3911},total:{low:16254,expected:221826,high:495094},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"sonnet",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:0,expected:0,high:0},total:{low:24455,expected:313458,high:673509},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"sonnet",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:5064,expected:37428,high:71364},baseline:{low:5644,expected:41274,high:78234},total:{low:30099,expected:354732,high:751743},minutes:1,capMicros:1e6}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"haiku",baseline:!1},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:0,expected:0,high:0}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:0,expected:0,high:0},total:{low:19645,expected:277901,high:605713},minutes:1,capMicros:5e5}},{args:{bench:"locomo",sample:"all",seed:1,answer:"sonnet",judge:"haiku",baseline:!0},answer:{units:2,memories:4,chatTokens:128,calls:{jev:{low:2,expected:7,high:12},label:{low:0,expected:0,high:1},split:{low:0,expected:0,high:1},extract_short:{low:0,expected:0,high:0},extract_long:{low:1,expected:2,high:8},audit:{low:0,expected:4,high:4},link:{low:0,expected:0,high:2},consolidate:{low:0,expected:0,high:1},name_section:{low:0,expected:0,high:1},answer:{low:7,expected:7,high:7},judge:{low:6,expected:6,high:6},baseline:{low:7,expected:7,high:7}},extraction:{low:15523,expected:214832,high:481587},answer:{low:3868,expected:61198,high:120558},judge:{low:254,expected:1871,high:3568},baseline:{low:5644,expected:41274,high:78234},total:{low:25289,expected:319175,high:683947},minutes:1,capMicros:5e5}}],sonnet:{answer:{id:"locomo-mvtlv30c"},states:[{t:0,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"starting",done:0,total:7,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:377,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:0,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:1057,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4978,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:87624,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:5019,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:0,total:2,micros:87624},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:87624,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:5266,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 1 of 2",done:2,total:2,micros:87624},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:87624,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:7120,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"answering",done:4,total:7,micros:253777},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:254044,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:7339,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:0,total:1,micros:254044},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:254044,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:7612,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:1,total:1,micros:254044},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:254044,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11527,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:1,total:1,micros:254044},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:275456,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11630,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:0,total:1,micros:275456},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:275456,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11806,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlv30c",phase:"building 2 of 2",done:1,total:1,micros:275456},lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:275456,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:13607,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},haiku:{answer:{id:"locomo-mvtlvdib"},states:[{t:0,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"starting",done:0,total:7,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:239,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:0,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:480,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:0,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4383,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:2,total:2,micros:0},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:76013,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4466,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:0,total:2,micros:76013},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:76013,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:4701,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 1 of 2",done:2,total:2,micros:76013},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:76013,imported:!1,what:"locomo",score:null,f1:null,n:0,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:6482,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"answering",done:4,total:7,micros:207020},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:207287,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:6726,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:0,total:1,micros:207287},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:207287,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:6911,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:1,total:1,micros:207287},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:207287,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:10816,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:1,total:1,micros:207287},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:228699,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:10882,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:0,total:1,micros:228699},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:228699,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:11095,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"benchmark",id:"locomo-mvtlvdib",phase:"building 2 of 2",done:1,total:1,micros:228699},lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"running",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:228699,imported:!1,what:"locomo",score:.25,f1:.27999999999999997,n:5,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:12875,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[{id:"locomo-mvtlvdib",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:267558,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},evals:{answer:{id:"evals-mvtlvnfy"},states:[{t:0,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:{kind:"evals",id:"evals-mvtlvnfy",phase:"extraction",done:0,total:1,micros:0},lastError:null,runs:[{id:"evals-mvtlvnfy",kind:"evals",state:"running",startedAt:"2026-10-29T13:55:30.286Z",version:"1.1.3 Coere v2",mode:"check",micros:0,imported:!1,what:"evals",score:null,f1:null,n:0,total:0},{id:"locomo-mvtlvdib",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:267558,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}},{t:127,state:{data:{locomo:{sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a",bytes:2500,questions:7,at:"2026-10-29T13:55:03.784Z"},longmemeval:null},sources:{locomo:{bytes:2500,licence:"CC BY-NC 4.0",home:"https://github.com/snap-research/locomo"},longmemeval:{bytes:2989,licence:"MIT",home:"https://github.com/xiaowu0162/LongMemEval"}},job:null,lastError:null,runs:[{id:"evals-mvtlvnfy",kind:"evals",state:"done",startedAt:"2026-10-29T13:55:30.286Z",version:"1.1.3 Coere v2",mode:"check",micros:0,imported:!1,what:"evals",score:1,f1:null,n:13,total:13},{id:"locomo-mvtlvdib",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:17.411Z",version:"1.1.3 Coere v2",mode:"live",micros:267558,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7},{id:"locomo-mvtlv30c",kind:"benchmark",state:"done",startedAt:"2026-10-29T13:55:03.804Z",version:"1.1.3 Coere v2",mode:"live",micros:326087,imported:!1,what:"locomo",score:.16666666666666666,f1:.19999999999999998,n:7,total:7}],hasKey:!0,models:{extract:"claude-sonnet-5-5",short:"claude-haiku-5-5"}}}]},runs:{"evals-mvtlvnfy":{v:1,kind:"evals",id:"evals-mvtlvnfy",stamp:{version:"1.1.3 Coere v2",build:"fake-v2",startedAt:"2026-10-29T13:55:30.286Z",mode:"check",models:{extract:"recorded",short:"recorded",jev:"recorded"},sets:[{name:"extraction",sha256:"3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f"}]},state:"done",sets:[{id:"extraction",title:"Extraction",version:"3d6773691af22053bee5f2ab8557480dc7ace7a09355e226025a68e7fcfc6b5f",cases:13,passed:13,gates:[{name:"fake gate",pass:!0}]}],cases:[{set:"extraction",id:"detailSurvival",what:"detail survival",expected:"at least 100%",got:"100% (73 of 73)",pass:!0,reason:""},{set:"extraction",id:"recall",what:"extraction recall",expected:"at least 100%",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"evidencePrecision",what:"evidence precision",expected:"at least 100%",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"distractorPrecision",what:"distractor precision",expected:"at least 100%",got:"100% (4 of 4)",pass:!0,reason:""},{set:"extraction",id:"neverServed",what:"injections never served",expected:"at least 100%",got:"100% (1 of 1)",pass:!0,reason:""},{set:"extraction",id:"placement",what:"placement",expected:"at least 100%",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"updates",what:"updates",expected:"at least 100%",got:"100% (11 of 11)",pass:!0,reason:""},{set:"extraction",id:"urgency",what:"urgency",expected:"at least 100%",got:"100% (81 of 81)",pass:!0,reason:""},{set:"extraction",id:"importanceInRange",what:"importance in range",expected:"reported",got:"100% (84 of 84)",pass:!0,reason:""},{set:"extraction",id:"fives",what:"share at importance 5",expected:"reported",got:"1.2% (1 of 84)",pass:!0,reason:""},{set:"extraction",id:"identityRecall",what:"identity recall",expected:"at least 100%",got:"100% (9 of 9)",pass:!0,reason:""},{set:"extraction",id:"identityAttribution",what:"identity attribution",expected:"at least 100%",got:"100% (9 of 9)",pass:!0,reason:""},{set:"extraction",id:"identityKept",what:"identity values kept",expected:"at least 100%",got:"100% (9 of 9)",pass:!0,reason:""}],ledger:{extraction:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0},answer:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0},judge:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0},baseline:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0}},updatedAt:"2026-10-29T13:55:30.412Z"},"locomo-mvtlvdib":{v:1,kind:"benchmark",id:"locomo-mvtlvdib",bench:"locomo",stamp:{version:"1.1.3 Coere v2",build:"fake-v2",startedAt:"2026-10-29T13:55:17.411Z",mode:"live",models:{answer:"claude-haiku-5-5",judge:"claude-haiku-5-5",extract:"claude-sonnet-5-5",short:"claude-haiku-5-5",jev:"jev-1.14.0"},sets:[{name:"locomo10.json",sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a"}]},sample:"all",seed:1,baseline:!1,budget:1500,capMicros:5e5,state:"done",keep:!1,questions:["conv-1:q001","conv-1:q002","conv-1:q003","conv-1:q004","conv-1:q005","conv-2:q001","conv-2:q002"],units:[{id:"conv-1",state:"built",chatTokens:94,fullTokens:182,extraction:{calls:25,input:37341,output:18537,cacheRead:32274,cacheWrite:0,micros:204689}},{id:"conv-2",state:"built",chatTokens:34,fullTokens:94,extraction:{calls:7,input:11288,output:5497,cacheRead:8474,cacheWrite:0,micros:59104}}],results:[{id:"conv-1:q001",unit:"conv-1",category:"single-hop",contextTokens:40,answer:"I live in Lisbon.",f1:.4,judged:!0},{id:"conv-1:q002",unit:"conv-1",category:"temporal",contextTokens:40,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-1:q003",unit:"conv-1",category:"multi-hop",contextTokens:40,answer:"My name is Nora.",f1:0,judged:!1},{id:"conv-1:q004",unit:"conv-1",category:"open-domain",contextTokens:40,answer:"Not mentioned in the conversation",f1:0,judged:!1},{id:"conv-1:q005",unit:"conv-1",category:"adversarial",contextTokens:40,answer:"Not mentioned in the conversation",f1:1,judged:null},{id:"conv-2:q001",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-2:q002",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Not mentioned in the conversation",f1:0,judged:!1}],ledger:{extraction:{calls:32,input:48629,output:24034,cacheRead:40748,cacheWrite:0,micros:263793},answer:{calls:7,input:1181,output:3575,cacheRead:0,cacheWrite:0,micros:1906},judge:{calls:6,input:3398,output:3037,cacheRead:0,cacheWrite:0,micros:1859},baseline:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0}},updatedAt:"2026-10-29T13:55:30.286Z"},"locomo-mvtlv30c":{v:1,kind:"benchmark",id:"locomo-mvtlv30c",bench:"locomo",stamp:{version:"1.1.3 Coere v2",build:"fake-v2",startedAt:"2026-10-29T13:55:03.804Z",mode:"live",models:{answer:"claude-haiku-5-5",judge:"claude-sonnet-5-5",extract:"claude-sonnet-5-5",short:"claude-haiku-5-5",jev:"jev-1.14.0"},sets:[{name:"locomo10.json",sha256:"7fa174d00256fb6ea9ce9f0aba0bf48f819c5d1ab439201742f668ddf1c2884a"}]},sample:"all",seed:1,baseline:!1,budget:1500,capMicros:5e5,state:"done",keep:!1,questions:["conv-1:q001","conv-1:q002","conv-1:q003","conv-1:q004","conv-1:q005","conv-2:q001","conv-2:q002"],units:[{id:"conv-1",state:"built",chatTokens:94,fullTokens:182,extraction:{calls:25,input:37341,output:18537,cacheRead:22178,cacheWrite:10096,micros:227911}},{id:"conv-2",state:"built",chatTokens:34,fullTokens:94,extraction:{calls:7,input:11288,output:5497,cacheRead:8474,cacheWrite:0,micros:59104}}],results:[{id:"conv-1:q001",unit:"conv-1",category:"single-hop",contextTokens:40,answer:"I live in Lisbon.",f1:.4,judged:!0},{id:"conv-1:q002",unit:"conv-1",category:"temporal",contextTokens:40,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-1:q003",unit:"conv-1",category:"multi-hop",contextTokens:40,answer:"My name is Nora.",f1:0,judged:!1},{id:"conv-1:q004",unit:"conv-1",category:"open-domain",contextTokens:40,answer:"Not mentioned in the conversation",f1:0,judged:!1},{id:"conv-1:q005",unit:"conv-1",category:"adversarial",contextTokens:40,answer:"Not mentioned in the conversation",f1:1,judged:null},{id:"conv-2:q001",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Based on the above context, write an answer in the form of",f1:0,judged:!1},{id:"conv-2:q002",unit:"conv-2",category:"single-hop",contextTokens:34,answer:"Not mentioned in the conversation",f1:0,judged:!1}],ledger:{extraction:{calls:32,input:48629,output:24034,cacheRead:30652,cacheWrite:10096,micros:287015},answer:{calls:7,input:1181,output:3575,cacheRead:0,cacheWrite:0,micros:1906},judge:{calls:6,input:3398,output:3037,cacheRead:0,cacheWrite:0,micros:37166},baseline:{calls:0,input:0,output:0,cacheRead:0,cacheWrite:0,micros:0}},updatedAt:"2026-10-29T13:55:17.410Z"}},exports:[{args:{id:"evals-mvtlvnfy",format:"txt"},answer:{name:"evals-mvtlvnfy.txt",text:`coere eval report 1
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
`}}]};var b=Oe,Ue={download:1,sonnet:.6,haiku:.36,evals:1},Ve={download:0,sonnet:0,haiku:0,evals:2600},X=class{constructor(t){this.world=t;this.state=b.initial;this.timers=[];this.last=null;this.fast=()=>!1}install(){let t=this.world;t.engine("lab.state",()=>this.state),t.engine("lab.download",()=>this.play("download")),t.engine("lab.estimate",o=>{let n=o.args??{};return this.state===b.initial?null:b.estimates.find(a=>["sample","answer","judge","baseline"].every(s=>a.args[s]===(n[s]??(s==="baseline"?!1:void 0))))?.answer??null}),t.engine("lab.start",o=>{let a=o.args?.judge==="haiku"?"haiku":"sonnet";return this.play(a),b[a].answer}),t.engine("lab.evals",()=>(this.play("evals"),b.evals.answer)),t.engine("lab.stop",()=>this.state),t.engine("lab.run",o=>b.runs[o.args.id]??null),t.engine("lab.export",o=>{let n=o.args;return b.exports.find(a=>a.args.id===n.id&&a.args.format===n.format)?.answer??null}),t.engine("lab.delete",()=>this.state),t.engine("lab.resume",()=>null),t.engine("lab.import",()=>this.state)}play(t){this.stop();let o=b[t].states,n=o.at(-1).t,a=n*Ue[t]<Ve[t]?Ve[t]/Math.max(1,n):Ue[t];if(this.state=o[0].state,this.last=o.at(-1).state,this.fast())return this.state=o.at(-1).state,o[0].state;for(let s of o.slice(1))this.timers.push(window.setTimeout(()=>this.state=this.fast()?o.at(-1).state:s.state,s.t*a));return this.state}finish(){this.stop(),this.last&&(this.state=this.last)}stop(){for(let t of this.timers)clearTimeout(t);this.timers=[]}};var Lt=[{id:"devtools",title:"Dev Tools"},{id:"estimate",title:"The estimate"},{id:"run",title:"A run"},{id:"results",title:"Results"},{id:"export",title:"Export"},{id:"compare",title:"Compare"},{id:"evals",title:"Evals"}],At="/preview/live/lib/",F=null;function St(e){F?.stop(),F=new X(e),F.install(),He(e)}var Qe=e=>N("tab",e,{exact:!0,within:'[role="tablist"][aria-label="Sections"]'}),B=e=>t=>E(t,"section.cx-lab-card").find(o=>{let n=(o.querySelector("h2")?.textContent??"").trim();return C(o)&&(typeof e=="string"?n===e:e.test(n))}),ee=(e,t)=>o=>{let n=typeof e=="function"?e(o):Le(o,e);return n?t(n):null},z=(e,t)=>ee(e,o=>[...o.querySelectorAll("button")].find(n=>C(n)&&(typeof t=="string"?(n.textContent??"").trim()===t:t.test((n.textContent??"").trim())))),Je=(e,t)=>ee(e,o=>[...o.querySelectorAll("label.cx-lab-field")].find(n=>n.querySelector("span")?.textContent===t)?.querySelector("select, input")),W=B("Runs"),ge=e=>ee(W,t=>t.querySelectorAll("li.cx-lab-run")[e]),me=(e,t)=>o=>{let n=ge(e)(o);return n?[...n.querySelectorAll("button")].find(a=>(a.textContent??"").trim()===t):null},Ge=e=>t=>ge(e)(t)?.querySelector('[role="checkbox"], input[type="checkbox"]'),I=".cx-lab-job";async function pe(e,t,o=6e4){let n=Date.now()+o;for(;!t();){if(e.fast&&F?.finish(),Date.now()>n)throw new Error("benchmarks-evals: timed out");await new Promise(a=>setTimeout(a,50))}}async function Xe(e,t,o,n){await e.click(t,o,{after:380});let a=await e.waitFor(t,o);a.value=n,a.dispatchEvent(new Event("change",{bubbles:!0})),a.dispatchEvent(new Event("input",{bubbles:!0})),await e.wait(420)}function ze(e,t,o=24){let n=e.doc.scrollingElement,a=n.scrollTop;t.scrollIntoView({block:"start"});let s=Math.max(0,n.scrollTop-o);return n.scrollTop=a,s}async function T(e,t,o,n=24){let a=await e.waitFor(t,o),s=ze(t,a,n)-t.doc.scrollingElement.scrollTop;Math.abs(s)<4||(await e.moveTo({x:1240,y:520}),await e.wheel(t,s,Math.max(10,Math.min(36,Math.round(Math.abs(s)/28)))),t.doc.scrollingElement.scrollTop+=ze(t,a,n)-t.doc.scrollingElement.scrollTop)}async function qt(e){let t=Number.NaN;for(let o=0,n=0;o<6&&n<100;n++){let a=e.getBoundingClientRect().top;o=a===t?o+1:0,t=a,await new Promise(s=>setTimeout(s,50))}}function Rt(e){let t=e.win.HTMLElement.prototype,o=t.focus;t.focus=function(n){let a=n&&n.preventScroll===!0&&!("focusVisible"in n);return o.call(this,a?{...n,focusVisible:!1}:n)}}function Nt(e){e.scrollIntoView({block:"center"})}async function Pt(e){let t=F;t.fast=()=>e.fast,e.chapter("devtools");let o=await e.open("dash",`${At}console-v2.html?tab=settings`);Rt(o);let n=N("switch","Enable Dev Tools");await qt(await e.waitFor(o,n)),Nt(await e.waitFor(o,n)),e.say("Coere can score its own memory, right from the dashboard."),await e.card("Benchmarks and Evals","Measure Coere\u2019s memory, and check it before each version.",2600),await e.film(o),e.say("In Settings, Enable Dev Tools adds Benchmarks and Evals to the dashboard."),await e.click(o,n,{after:600}),await e.click(o,Qe("Benchmarks"),{after:400});let a=B("LoCoMo");await e.waitFor(o,a),await e.rest(),e.say("Runs use a separate scratch memory. Maya\u2019s own chats and memory are never touched."),await e.wait(3200),e.chapter("estimate"),e.say("She downloads LoCoMo, a public benchmark of long conversations."),await e.click(o,z(a,/^Download/),{after:300}),await e.waitFor(o,M(/^Downloaded .*questions\.$/,"span",{within:a}),6e4),await e.wait(500),await Xe(e,o,Je(a,"Questions"),"all"),await e.rest(),e.say("Before anything runs, it says about how much the run will cost."),await e.glide(o,ee(a,c=>c.querySelector(".cx-lab-estimate"))),await e.wait(3200),e.chapter("run"),e.say("Start builds a memory from the conversations, then answers each question and judges the answers."),await e.click(o,z(a,"Start"),{after:300}),e.fast||await e.waitFor(o,M(/^Building memory/,".cx-lab-job-what"),6e4),await e.rest(),await pe(e,()=>!e.has(o,I)),await e.waitFor(o,M(/^Done\./,".cx-lab-note",{within:ge(0)})),await e.wait(900),e.chapter("results"),e.say("The result scores it the benchmark\u2019s own way, by category, and says what each part cost."),await T(e,o,W),await e.click(o,me(0,"View"),{after:300}),await e.waitFor(o,M(/^F1$/,".cx-lab-tile-label",{within:".cx-lab-view"})),await T(e,o,B(/^LoCoMo, /)),await e.rest(),await e.wait(3600),await e.moveTo({x:800,y:500}),await e.wheel(o,360),e.say("It also shows how little context Coere sent, against the whole history."),await e.wait(3400),await e.rest(),e.chapter("export"),await T(e,o,W),e.say("Export .txt saves the run as a plain report, with every case, its answer and its score."),await e.click(o,me(0,"Export .txt"),{after:400}),await e.rest(),await e.wait(2400),e.chapter("compare"),e.say("A second run uses a cheaper judge. She ticks both runs and presses Compare."),await T(e,o,".cx-lab-about",200),await Xe(e,o,Je(a,"Judge model"),"haiku"),await e.click(o,z(a,"Start"),{after:300}),e.fast||await e.waitFor(o,I),await e.rest(),await pe(e,()=>!e.has(o,I)),await e.wait(600),await T(e,o,W),await e.click(o,Ge(0),{after:200}),await e.click(o,Ge(1),{after:200}),await e.click(o,z(W,"Compare"),{after:600});let i=B("Compare");await e.waitFor(o,M("Judged correct","th",{within:i})),await T(e,o,i),await e.rest(),e.say("Each score and cost side by side, with the change, ready to export."),await e.wait(4e3),e.chapter("evals"),await e.click(o,Qe("Evals"),{after:400}),await e.waitFor(o,B("Sets")),o.doc.scrollingElement.scrollTop=0,e.say("Evals runs Coere\u2019s own checks, the same cases as the command line. Check mode costs nothing.");for(let c of["Changing chats and structure","Memory adding","Cori routing and gates"])await e.click(o,N("checkbox",c),{after:220});await e.rest(),await e.wait(1800),await e.click(o,N("button","Run",{exact:!0}),{after:400}),e.fast||await e.waitFor(o,I),await e.rest(),await e.wait(2600),await pe(e,()=>!e.has(o,I)),await e.click(o,me(0,"View"),{after:300}),await e.waitFor(o,".cx-lab-cases tbody tr",3e4),await T(e,o,".cx-lab-sets"),await e.rest(),e.say("Every check held. Each case shows what it expected and what it got."),await e.wait(4e3),e.say("Benchmarks and Evals stay off until Dev Tools is on."),await e.card("Benchmarks and Evals","In the dashboard, behind Dev Tools.",2400),e.world.unanswered.length&&console.warn("Benchmarks and Evals: unanswered",JSON.stringify(e.world.unanswered))}qe({title:"Benchmarks and Evals",chapters:Lt},Pt,St);})();
