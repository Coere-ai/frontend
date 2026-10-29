"use strict";(()=>{var ef=Object.defineProperty;var Os=(e,t)=>{for(var r in t)ef(e,r,{get:t[r],enumerable:!0})};var qr="coere.actions.page";function tf(e){return{ok:!1,failure:e==="aborted"?"aborted":"network",usdMicros:0}}function rf(e,t){async function r(o,i){try{return await e({ch:"coere",type:"engine.call",id:t(),method:o,args:i})}catch{return{id:"",ok:!1,error:{code:"engine_unreachable",message:"engine is not reachable"}}}}return{call:r,answer:o=>async i=>{let s=await r(o,i);return s.ok?s.result:tf(s.error.code)}}}function Ns(e,t){let{call:r,answer:n}=rf(e,t);return{"memory.act.step":n("memory.act.step"),"memory.act.see":n("memory.act.see"),"memory.act.write":n("memory.act.write"),"memory.act.pick":n("memory.act.pick"),"memory.act.check":n("memory.act.check"),"memory.act.context":async o=>{let i=await r("memory.act.context",o);if(!i.ok)throw new Error(i.error.code);return i.result},"memory.act.abort":async o=>{await r("memory.act.abort",o)},"memory.act.log":async o=>{await r("memory.act.log",o)}}}var Xr={bolt:{steps:40,calls:50,screenshots:8,askAtMicros:5e4,wallMs:36e4,callMs:2e4},pro:{steps:30,calls:40,screenshots:8,askAtMicros:5e5,wallMs:48e4,callMs:45e3},ultra:{steps:30,calls:40,screenshots:8,askAtMicros:12e5,wallMs:6e5,callMs:9e4}};var Q={estimateAskMicros:25e4,estimateOverShare:.5,takeoverMs:10*6e4,undoMs:10*6e4,rewriteUndoMs:3e4,resultBarMs:6e3,screenshotGapMs:1e3,taskPreviewMs:3e3,workerPreviewMs:2e3,workerPageMs:3e3,workersPerHost:2,searchGapMs:8e3,dryReads:8,linksPerSite:2,historyRows:500,continueMs:30*6e4};var Ds=["click","type","select","check","key","scroll","wait","navigate","extract","look","ask","done","fail"],Hs=["Enter","Escape","Tab","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageDown","PageUp","Backspace"];function Bs(e,t={}){return{action:e,el:null,mark:null,point:null,text:null,replace:null,option:null,on:null,key:null,dir:null,by:null,ms:null,for:null,url:null,what:null,question:null,choices:null,summary:null,reason:null,target:"",expect:"",note:null,...t}}var We={waitMs:3e3,extractChars:600,noteChars:120,choices:4},Fs=["navigate","scroll","click","type","extract","done","fail"];var Us=["Organization","Person","Event","Product","ContactPoint"];var gr={pageText:3e3,snapshotText:2500,snapshotElements:150,picture:1300,stepTurn:6e3,historySteps:6};var $s=["email_draft","calendar_add","text_rewrite","form_fill","page_click","web_research"];var nf=[["captcha",/\b(re|h)?captcha\b|turnstile|verify (that )?you are (a )?human|i'?m not a robot|i am not a robot/i],["purchase",/\b(buy|pay( now)?|place (your )?order|check ?out|subscribe|donate|send money|transfer|trade|purchase|complete (your )?order)\b/i],["account_security",/\b(delete|close|deactivate) (my |your )?account\b|\b(change|reset) (your )?password\b|\b(two|2)[- ]step|\b(two|2)[- ]factor|\b2fa\b|\brecovery\b|security settings|sign out (of all devices|everywhere)/i],["sign_in",/\b(sign ?in|log ?in|sign ?up|create (an )?account|choose an account)\b/i],["file",/\b(upload|download|install|add to chrome|attach (a )?file)\b/i]],of=new Set(["radio","option","textbox","searchbox","combobox","listbox","spinbutton"]),sf=/\b(password|passcode|pin|security (question|answer)|one[- ]time (code|password)|verification code|otp)\b/i,af=/\b(card number|credit card|debit card|cvv|cvc|expiry|expiration|iban|routing|ssn|social security|passport( number)?|tax id)\b/i,cf={secret:"password",payment:"payment",purchase:"purchase",account:"account_security",sign_in:"sign_in",captcha:"captcha",file:"file",download:"file"},So=/^(chrome|chrome-extension|edge|about|devtools|view-source|file):|^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)/i,lf=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,df=/\b(?:https?:\/\/|www\.)[^\s"'<>]+/gi,Eo=/^(to|cc|bcc|recipients?|guests?|add guests|invite|share with|people)\b/i,uf=/\b(submit|finish (attempt|quiz|test)|end attempt|delete|publish|send for review)\b/i,pf=/^send\b(?!\s+money)/i,ff=/\b(coere|cori|ai assistant|assistant|ai agent)('s)? (instructions?|note|command|task)\b|\bignore (the|all|any|previous|prior|your|earlier|above) (questions?|instructions?|task|request|rules)\b/i,mf=/\b(coere|cori)\s*:\s*\w|\b(coere|cori) instructions?\b|\b(note|message|instructions?) (to|for) (any|the|an) (ai )?(assistant|agent|model)\b/i,hf=/\b(gender|race|ethnicity|veteran|disability|sexual orientation|equal (employment )?opportunity)\b/i,gf=new Set(["click","type","select","check","key","navigate"]),Vt=e=>e.toLowerCase().replace(/\s+/g," ").trim(),Co=e=>{try{return new URL(e).origin}catch{return null}},Yr=e=>(e.match(lf)??[]).map(t=>t.toLowerCase());function bf(e,t){for(let o of e.flags){let i=cf[o];if(i)return i}let r=`${e.name} ${e.heading??""}`;if(t.action==="type"||t.action==="select"){if(sf.test(r))return"password";if(af.test(r))return"payment"}let n=of.has(e.role);for(let[o,i]of nf)if((!n||o==="captcha")&&i.test(e.name))return o;return null}function wf(e){if(/\b\d{3}-\d{2}-\d{4}\b/.test(e))return!0;for(let t of e.match(/\d[\d -]{11,22}\d/g)??[]){let r=t.replace(/\D/g,"");if(r.length<13||r.length>19)continue;let n=0;for(let o=0;o<r.length;o++){let i=Number(r[r.length-1-o]);o%2===1&&(i=i*2>9?i*2-9:i*2),n+=i}if(n%10===0)return!0}return!1}function js(e){return Vt([e.line,...Object.values(e.fields),...e.named,...e.given].join(" "))}function yf(e,t){let r=js(t),n=new Set(t.named.map(i=>i.toLowerCase()));return Yr(e).some(i=>!n.has(i)&&!r.includes(i))?!0:(e.match(df)??[]).map(i=>i.replace(/[.,;:!?)\]]+$/,"")).some(i=>!r.includes(Vt(i)))}function xf(e,t){let r=t.snapshot?.elements.some(o=>o.href===e)??!1,n=t.sites.some(o=>e===o||e===`${o}/`);return r||n||e===t.url}function vf(e){let{step:t,element:r}=e;if(!Fs.includes(t.action))return{kind:"stop",reason:"outside_vocabulary"};let n=Vt(r?.name??"");return t.action==="click"&&!/^(next( page)?|more|load more|show more|older|newer|previous|\d{1,3}|reject all|necessary only|only necessary|decline|close)$/.test(n)?{kind:"stop",reason:"outside_vocabulary"}:t.action==="type"&&r?.role!=="searchbox"&&!/search/.test(n)?{kind:"stop",reason:"outside_vocabulary"}:null}function kf(e){let t=["to","cc","who"].flatMap(n=>Yr(e.fields[n]??"")),r=(e.snapshot?.elements??[]).filter(n=>Eo.test(n.heading??"")||Eo.test(n.name)).flatMap(n=>Yr(`${n.name} ${n.value??""}`));return[...new Set([...t,...r])]}var Jr=(e,t)=>e.test(t.line);function _f(e){let{step:t,element:r}=e,n=(l,u=null)=>({kind:"confirm",why:l,address:u}),o=r?.name??"",i=t.action==="click"&&pf.test(o.trim());if(i||t.action==="click"&&/\b(send invitations?|invite)\b/i.test(o)){let l=new Set(e.named.map(p=>p.toLowerCase())),u=kf(e).find(p=>!l.has(p));if(u!==void 0)return n("unnamed_recipient",u)}if(i&&e.kind==="email_draft"&&e.fields.send!=="yes"||i&&e.kind!=="email_draft"&&!Jr(/\bsend\b/i,e))return n("send_not_asked");let s=r?.flags.some(l=>l==="submit"||l==="irreversible")??!1;if(t.action==="click"&&(s||uf.test(o))&&!i&&!(/\bdelete\b/i.test(o)?Jr(/\b(delete|remove)\b/i,e):/\bpublish\b/i.test(o)?Jr(/\b(publish|post)\b/i,e):e.fields.submit==="yes"||Jr(/\bsubmit\b/i,e)))return n("irreversible");let a=t.action==="navigate"?t.url:t.action==="click"?r?.href??null:null,c=a===null?null:Co(a);return c!==null&&!e.worker&&!e.sites.includes(c)?n("leaves_sites",new URL(c).host):null}function Sf(e){let{step:t,element:r}=e,n=s=>({kind:"stop",reason:s}),o=Co(e.url);if(So.test(e.url)||o!==null&&e.blocked.includes(o))return n("blocked_site");if(!gf.has(t.action))return null;let i=e.snapshot?.findings.find(s=>s.el===null);if(i)return n(i.reason);if(r&&ff.test(r.name))return n("injection");if(r){let a=e.snapshot?.findings.find(c=>c.el===r.n)?.reason??bf(r,t);if(a)return n(a)}if(t.action==="navigate"){let s=t.url??"";if(!/^https?:\/\//i.test(s)||So.test(s))return n("outside_vocabulary");let a=Co(s);if(a!==null&&e.blocked.includes(a))return n("blocked_site");if(!xf(s,e))return n("injection")}if(t.action==="click"&&r?.href&&So.test(r.href))return n("blocked_site");if(t.action==="type"){let s=t.text??"";if(wf(s))return n("payment");if(yf(s,e)||(e.kind==="email_draft"||e.kind==="calendar_add")&&r&&Eo.test(r.name)&&!js(e).includes(Vt(s)))return n("injection")}return null}function Ef(e,t){let r=(e.snapshot?.text??"").split(`
`).filter(i=>mf.test(i)).map(Vt);if(r.length===0)return!1;let n=t.kind==="confirm"?t.address:null;if(n!==null&&r.some(i=>i.includes(n.toLowerCase())))return!0;let o=Vt(e.element?.name??"").split(/[^a-z]+/).filter(i=>i.length>=4);return r.some(i=>o.some(s=>new RegExp(`\\b${s}`).test(i)))}var Cf=new Set(["click","navigate","select","check"]),Ro=e=>{let t=e.worker?vf(e):null;if(t)return t;let r=Sf(e);if(r)return r;let n=_f(e);if(n&&Ef(e,n))return{kind:"stop",reason:"injection"};if(n)return n;let o=Cf.has(e.step.action)||e.step.action==="key"&&e.step.key==="Enter";return e.level==="review"&&!e.allowedForTask&&!e.worker&&o?{kind:"review"}:{kind:"go"}},Ao=e=>hf.test(`${e.name} ${e.heading??""}`);var Gs=["fresh_snapshot","tier_up","ask","end_stuck"],Rf=8,Af=3,Tf=(e,t)=>e.url===t.url&&e.signature===t.signature&&e.action===t.action&&e.target===t.target;function Pf(e){let[t,r]=e.slice(-2);return t!==void 0&&r!==void 0&&Tf(t,r)}function If(e){let t=e.slice(-Rf),r=new Map;for(let n of t){let o=`${n.signature}
${n.notes}`,i=(r.get(o)??0)+1;if(i>=Af)return!0;r.set(o,i)}return!1}function Mf(e){let t=e.slice(-2);return t.length===2&&t.every(r=>!r.held)}function Lf(e){return Pf(e)?"stuck":If(e)?"loop":Mf(e)?"failing":null}var To=(e,t)=>{let r=Lf(e);return r===null?{trouble:null,next:null}:{trouble:r,next:Gs[Math.min(Math.max(t,0),Gs.length-1)]??"end_stuck"}};var Of=["chatgpt","claude","gemini","deepseek","kimi","perplexity","grok","copilot","meta_ai"];function Po(e){return typeof e=="string"&&Of.includes(e)}var Mo="COERE RAW EXPORT",Ws="=".repeat(64),Ks=["platform","platform_name","id","title","project","url","created","updated","messages","branch","hidden_messages_left_out","captured_at","adapter"],Vs=Ks.length+2;var Pk=new Intl.Segmenter(void 0,{granularity:"grapheme"});var C2=Array.from({length:256},(e,t)=>t.toString(16).padStart(2,"0"));var G2=new RegExp("\\p{Mn}","gu");var X2=new Intl.Segmenter(void 0,{granularity:"word"}),J2=new RegExp("[_./:\\-#+@]*[\\p{L}\\p{N}\\p{M}\\p{Cf}]+(?:(?:[_./:\\-#+@]+|['\u2019\xB7]|(?<=\\p{N})[,;](?=\\p{N}))[\\p{L}\\p{N}\\p{M}\\p{Cf}]+)*[_./:\\-#+@]*","gu");var Y2=new RegExp("[\\p{Ll}\\p{N}]\\p{M}*\\p{Lu}|\\p{Lu}\\p{M}*\\p{Lu}\\p{M}*\\p{Ll}\\p{M}*\\p{Ll}","u"),Z2=new RegExp("(?<=[\\p{Ll}\\p{N}]\\p{M}*)(?=\\p{Lu})|(?<=\\p{Lu}\\p{M}*)(?=\\p{Lu}\\p{M}*\\p{Ll}\\p{M}*\\p{Ll})","gu");var qf=`a about above after again all also am an and any are as at be because been before being
below between both but by can could did do does doing dont down during each few for from further had has
have having he her here hers him his how i if im in into is isnt it its itself ive just let me more most
my no nor not now of off on once only or other our ours out over own same she should so some such than
that thats the their theirs them then there these they this those through to too under until up very
was we were what when where which while who whom why will with would you your yours`,Xf=`al algo algunos ante antes como con contra cual cuando de del desde donde durante el ella ellas
ellos en entre era es esa ese eso esta estaba estan estas este esto estos fue ha hay la las le les lo los
mas me mi mis muy nada ni no nos nosotros o otra otro para pero poco por porque que quien se sea ser si
sin sobre son su sus tambien te tiene todo todos tu tus un una uno unos usted y ya yo`,Jf=`\u7684 \u4E86 \u662F \u5728 \u548C \u4E0E \u53CA \u6216 \u4E5F \u5C31 \u90FD \u800C \u7740 \u628A \u88AB \u8BA9 \u7ED9 \u5BF9 \u4ECE \u5230 \u4E3A \u4EE5 \u4E4B \u5176 \u4F46 \u5E76 \u5F88 \u5417 \u5462 \u5427 \u554A \u5440 \u4E48 \u8FD9 \u90A3 \u8FD9\u4E2A \u90A3\u4E2A
\u4E00\u4E2A \u6211\u4EEC \u4F60\u4EEC \u4ED6\u4EEC \u4EC0\u4E48 \u600E\u4E48 \u5982\u4F55 \u53EF\u4EE5 \u6CA1\u6709 \u306E \u306F \u304C \u3092 \u306B \u3067 \u3068 \u3082 \u3078 \u3084 \u304B\u3089 \u307E\u3067`,Yf=new Set([qf,Xf,Jf].flatMap(e=>e.split(/\s+/)));var o_=new RegExp("^(?:\\p{M}|\\u200d)","u");var c_=new Intl.Segmenter(void 0,{granularity:"sentence"});var tm=`remember remembered remembering remind reminds reminded recall please pls plz kindly
help helps helped helping thanks thank thx ty hey hi hello hiya yo ok okay yes yeah yep nope sure
just really actually basically literally also maybe perhaps probably
want wants wanted wanna need needs needed know knows knew think thinks thought
tell tells told show shows showed give gives gave ask asks asked say says said saying
lets going gonna get gets got gotten like likes liked try trying tried see look looks
something anything everything someone anyone thing things stuff way ways lot lots bit
e.g i.e eg ie etc`,rm="recuerda recuerdame recordar favor gracias hola ayuda ayudame ayudar quiero necesito dime puedes podrias",nm=`\u6211 \u4F60 \u4ED6 \u5979 \u5B83 \u6211\u4EEC \u4F60\u4EEC \u4ED6\u4EEC \u5979\u4EEC \u54B1\u4EEC \u6211\u60F3 \u60F3\u8981 \u60F3 \u8981 \u8BF7 \u8BF7\u95EE \u5E2E \u5E2E\u6211 \u5E2E\u52A9 \u8BA9 \u4E00\u4E0B \u4E00\u4E9B \u5173\u4E8E \u544A\u8BC9 \u8BB0\u5F97 \u8BB0\u4F4F \u8C22\u8C22 \u4F60\u597D
\u79C1 \u50D5 \u304A\u9858\u3044 \u304F\u3060\u3055\u3044 \u3057\u3066 \u307E\u3059 \u3067\u3059 \u3059\u308B \u3053\u306E \u305D\u306E \u3042\u306E \u3053\u308C \u305D\u308C`,om=new Set([tm,rm,nm].flatMap(e=>e.split(/\s+/))),im=new Set("mr mrs ms mx dr prof sir jr sr st".split(" ")),sm=new Set("e.g i.e mr mrs ms mx dr prof sr jr st vs approx inc ltd".split(" "));var $_=new RegExp("^\\p{N}$","u"),j_=new RegExp("\\p{N}","u");function Do(e,t){return`COERE TRANSFER part ${e} of ${t}. Contents, oldest first:`}var ra=Mo,ZS=`${ra}
`;function um(e){return e>=55296&&e<=56319}function pm(e){return e>=56320&&e<=57343}function Ho(e,t=0,r=e.length){let n=0;for(let o=t;o<r;o+=1){let i=e.charCodeAt(o);i<128?n+=1:i<2048?n+=2:um(i)&&o+1<r&&pm(e.charCodeAt(o+1))?(n+=4,o+=1):n+=3}return n}var bm=5*1024*1024,na=99999,dE=Ho(Do(na,na))+1;var ym=/^[A-Za-z0-9:_.-]{1,160}$/;var xm=/(^|[^a-z0-9])(sk-ant-|coere_app_|coere_dev_)/i;function vm(e){return ym.test(e)&&!xm.test(e)}function Bo(e){return vm(e)}var km=["run.start","run.page","run.inventory","run.plan","run.fetch","run.retry","run.wait","run.concurrency","run.large_chat","run.error","run.pause","run.resume","run.cancel","run.attention","run.verify","run.metrics","run.done","engine.call","engine.upsert","engine.error","index.batch","index.done","index.verify","search.run","recall.open","recall.close","recall.insert","transfer.plan","transfer.start","transfer.blocked","transfer.insert","transfer.result","extractall.start","extractall.answer","extractall.control","extractall.done","import.start","import.done","folder.connect","folder.permission","folder.write","zip.build","worker.start","adapter.selftest","memory.plan","memory.call","memory.job","memory.batch","memory.capture","memory.queue","memory.consolidate","memory.verify","memory.export","memory.import","memory.stop","memory.reconcile","memory.rebuild","memory.forget","memory.classify","memory.triage","memory.retain","memory.audit","memory.doc","memory.link","memory.section","memory.vectors","memory.migrate","memory.build","memory.route","memory.context","memory.scan","memory.forget_topic","cori.answer","cori.feedback"],jE=new Set(km);var oa={$comment:"One entry per platform. Code reads this file and never hardcodes a platform name. Capabilities start as unknown and are filled by the M0 spike and kept fresh by the live canary. Host evidence lives in docs/site-notes.md.",platforms:[{id:"chatgpt",name:"ChatGPT",tier:1,hosts:["chatgpt.com"],newChatUrl:"https://chatgpt.com/",logo:"icons/platforms/chatgpt.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"yes",pasteLimitChars:null},exportImport:"zip-conversations-json"},{id:"claude",name:"Claude",tier:1,hosts:["claude.ai"],newChatUrl:"https://claude.ai/new",logo:"icons/platforms/claude.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"yes",pasteLimitChars:null},exportImport:"zip-conversations-json"},{id:"gemini",name:"Gemini",tier:1,hosts:["gemini.google.com"],newChatUrl:"https://gemini.google.com/app",logo:"icons/platforms/gemini.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"no",pasteLimitChars:null},exportImport:"unknown"},{id:"deepseek",name:"DeepSeek",tier:2,hosts:["chat.deepseek.com"],newChatUrl:"https://chat.deepseek.com/",logo:"icons/platforms/deepseek.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"kimi",name:"Kimi",tier:2,hosts:["www.kimi.com"],newChatUrl:"https://www.kimi.com/",logo:"icons/platforms/kimi.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"perplexity",name:"Perplexity",tier:2,hosts:["www.perplexity.ai"],newChatUrl:"https://www.perplexity.ai/",logo:"icons/platforms/perplexity.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"grok",name:"Grok",tier:2,hosts:["grok.com"],newChatUrl:"https://grok.com/",logo:"icons/platforms/grok.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"copilot",name:"Copilot",tier:2,hosts:["copilot.microsoft.com","copilot.com"],newChatUrl:"https://copilot.microsoft.com/",logo:"icons/platforms/copilot.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"meta_ai",name:"Meta AI",tier:2,hosts:["www.meta.ai"],newChatUrl:"https://www.meta.ai/",logo:"icons/platforms/meta_ai.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"}]};var ia=oa.platforms.map(e=>{if(!Po(e.id))throw new Error(`platforms.json has an unknown id: ${e.id}`);return e}),Sm=new Map(ia.map(e=>[e.id,e]));function K(e){let t=Sm.get(e);if(!t)throw new Error(`No platform with id ${e}`);return t}var V=class extends Error{constructor(t,r){super(`${t}: ${r}`),this.name="ConfigError"}};function Em(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Oe(e,t){if(!Em(e))throw new V(t,"must be an object");return e}function Ne(e,t,r){for(let n of Object.keys(e))if(!t.includes(n))throw new V(`${r}.${n}`,"is not a known key")}function it(e,t){if(typeof e!="string"||e.trim()==="")throw new V(t,"must be a non empty string");return e}function Ke(e,t,r){if(typeof e!="string"||!t.includes(e))throw new V(r,`must be one of ${t.join(", ")}`);return e}function wr(e,t){if(!Array.isArray(e))throw new V(t,"must be an array");return e}function Xt(e,t){let r=it(e,t);try{new RegExp(r)}catch{throw new V(t,"is not a valid regular expression")}return r}var tn=["live","logged-out","reference","owner-prior","none"];var Cm=["name","match","verified","note"];function sa(e){return e===void 0?[]:wr(e,"config.temporaryUrl").map((t,r)=>{let n=`config.temporaryUrl[${r}]`,o=Oe(t,n);Ne(o,Cm,n);let i={name:it(o.name,`${n}.name`),match:Xt(o.match,`${n}.match`),verified:Ke(o.verified,tn,`${n}.verified`)};if(o.note!==void 0&&(i.note=it(o.note,`${n}.note`)),i.match==="")throw new V(`${n}.match`,"must not be empty");return i})}var yr=["composer","composerShell","sendButton","message","messageContent","userMessage","assistantMessage","scrollContainer","sidebarLink","title","temporaryChat","streamingIndicator","rateLimitBanner","loggedOut"],Rm=["user","assistant","system","tool"],Am=["execCommand","paste","beforeinput","value"],aa=["execCommand","paste","beforeinput"],Tm=["sync","twoStep"],Pm="twoStep",Im=["$comment","anchors","roles","urls","insertOrder","sendHook","temporaryUrl"],Mm=["name","selector","verified","deep","note"];function j(e){let t=Oe(e,"config");return Ne(t,Im,"config"),{anchors:Lm(t.anchors===void 0?{}:t.anchors),roles:t.roles===void 0?{by:"anchors"}:Nm(t.roles),urls:Dm(t.urls),insertOrder:t.insertOrder===void 0?[...aa]:Hm(t.insertOrder),sendHook:t.sendHook===void 0?Pm:Ke(t.sendHook,Tm,"config.sendHook"),temporaryUrl:sa(t.temporaryUrl)}}function Lm(e){let t=Oe(e,"config.anchors");Ne(t,yr,"config.anchors");let r={};for(let n of yr){let o=`config.anchors.${n}`,i=t[n]===void 0?[]:wr(t[n],o);r[n]=i.map((a,c)=>Om(a,`${o}[${c}]`));let s=new Set;for(let a of r[n]){if(s.has(a.name))throw new V(o,`has two strategies named "${a.name}"`);s.add(a.name)}}return r}function Om(e,t){let r=Oe(e,t);Ne(r,Mm,t);let n={name:it(r.name,`${t}.name`),selector:it(r.selector,`${t}.selector`),verified:Ke(r.verified,tn,`${t}.verified`)};if(r.deep!==void 0){if(typeof r.deep!="boolean")throw new V(`${t}.deep`,"must be true or false");n.deep=r.deep}return r.note!==void 0&&(n.note=it(r.note,`${t}.note`)),n}function Nm(e){let t=Oe(e,"config.roles"),r=Ke(t.by,["attribute","anchors"],"config.roles.by");if(r==="anchors")return Ne(t,["by"],"config.roles"),{by:r};Ne(t,["by","attribute","values"],"config.roles");let n={};for(let[o,i]of Object.entries(Oe(t.values,"config.roles.values")))n[o]=Ke(i,Rm,`config.roles.values.${o}`);return{by:r,attribute:it(t.attribute,"config.roles.attribute"),values:n}}function Dm(e){let t=Oe(e,"config.urls");Ne(t,["chatPath","newChatPath","projectPath"],"config.urls");let r={chatPath:Xt(t.chatPath,"config.urls.chatPath"),newChatPath:Xt(t.newChatPath,"config.urls.newChatPath")};return t.projectPath!==void 0&&(r.projectPath=Xt(t.projectPath,"config.urls.projectPath")),r}function Hm(e){let t=wr(e,"config.insertOrder");if(t.length===0)throw new V("config.insertOrder","needs at least one strategy");let r=t.map((n,o)=>Ke(n,Am,`config.insertOrder[${o}]`));if(new Set(r).size!==r.length)throw new V("config.insertOrder","repeats a strategy");return r}var ua={$comment:"Per site limits measured live and refreshed by the live canary. Null means not measured. Nothing here may be assumed. Gemini: the logged out box kept the first 32,000 characters of a longer insert on 2026-10-20 (docs/site-notes.md).",measuredAt:"2026-10-20",sites:{chatgpt:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},claude:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},gemini:{pasteLimitChars:32e3,tokenLimit:null,source:"measured"},deepseek:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},kimi:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},perplexity:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},grok:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},copilot:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},meta_ai:{pasteLimitChars:null,tokenLimit:null,source:"unknown"}}};var Zm=["pasteLimitChars","tokenLimit","source"],Qm=["pasteLimitChars","tokenLimit"];function eh(e,t){if(e===null)return null;if(typeof e!="number"||!Number.isInteger(e)||e<0)throw new V(t,"must be null or a whole number of at least 0");return e}function th(e,t){let r=`limits.sites.${t}`,n=Oe(e,r);Ne(n,Zm,r);let[o,i]=Qm.map(s=>eh(n[s],`${r}.${s}`));return{pasteLimitChars:o??null,tokenLimit:i??null,source:Ke(n.source,["unknown","measured"],`${r}.source`)}}var rh=ua.sites;function q(e){return th(rh[e],e)}var pa={$comment:"ChatGPT. The cloud browser never got past Cloudflare (docs/site-notes.md), so nothing here was watched in a signed in browser for this build. Strategies marked reference follow ChatGPT's current markup as the maintained open source exporter pionxzh/chatgpt-exporter and similar tools read it: the ProseMirror composer at #prompt-textarea, one element per message carrying data-message-author-role, and the stop button while a reply streams. Owner-prior strategies stay as fallbacks. Chats live at /c/<uuid>, also under a project or GPT at /g/<id>/c/<uuid>.",anchors:{composer:[{name:"reference: prompt textarea id",selector:"#prompt-textarea[contenteditable='true']",verified:"reference",note:"ProseMirror editor, chatgpt-exporter"},{name:"owner-prior: prompt textarea id",selector:"#prompt-textarea",verified:"owner-prior"},{name:"owner-prior: ProseMirror editor",selector:"div[contenteditable='true'].ProseMirror",verified:"owner-prior"},{name:"owner-prior: textarea with data-id",selector:"textarea[data-id]",verified:"owner-prior"}],composerShell:[{name:"reference: unified composer form",selector:"form[data-type='unified-composer']",verified:"reference"},{name:"reference: form around the composer",selector:"form:has(#prompt-textarea)",verified:"reference"}],sendButton:[{name:"reference: send button test id",selector:"button[data-testid='send-button']",verified:"reference"},{name:"reference: composer submit button",selector:"#composer-submit-button",verified:"reference"}],message:[{name:"owner-prior: author role attribute",selector:"[data-message-author-role]",verified:"owner-prior",note:"chatgpt-exporter reads messages the same way"}],messageContent:[{name:"reference: assistant markdown",selector:".markdown",verified:"reference"},{name:"reference: user text",selector:".whitespace-pre-wrap",verified:"reference"}],userMessage:[{name:"owner-prior: user author role",selector:"[data-message-author-role='user']",verified:"owner-prior"}],assistantMessage:[{name:"reference: assistant author role",selector:"[data-message-author-role='assistant']",verified:"reference"}],sidebarLink:[{name:"reference: history link",selector:"nav a[href*='/c/']",verified:"reference"}],streamingIndicator:[{name:"reference: stop button test id",selector:"button[data-testid='stop-button']",verified:"reference"}],loggedOut:[{name:"reference: log in button",selector:"button[data-testid='login-button']",verified:"reference"}],title:[{name:"owner-prior: page heading",selector:"main h1",verified:"owner-prior",note:"Usually absent; the kit falls back to document.title, which ChatGPT sets to the chat's title."}]},roles:{by:"attribute",attribute:"data-message-author-role",values:{user:"user",assistant:"assistant"}},urls:{newChatPath:"^/(?:g/[^/]+/?)?$",chatPath:"^/(?:g/[^/]+/)?c/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",projectPath:"^/g/(?<id>g-p-[^/]+)/project"},sendHook:"twoStep",temporaryUrl:[{name:"temporary chat flag",match:"[?&]temporary-chat=true(?:&|$)",verified:"none",note:"ChatGPT's own links open a temporary chat at /?temporary-chat=true. Unverified on the live site."}]};var oh={info:K("chatgpt"),config:j(pa),version:"0.1.0",dataSource:null,limits:q("chatgpt")};var fa={$comment:"Claude. The cloud browser never got past Cloudflare (docs/site-notes.md), so nothing here was watched in a signed in browser for this build. Strategies marked reference follow claude.ai's current markup as maintained open source exporters (socketteer/Claude-Conversation-Exporter and others) read it: the ProseMirror composer, data-testid='user-message' for the person's turns, font-claude-response inside a data-is-streaming wrapper for replies, which reads true while a reply streams. Owner-prior strategies stay as fallbacks. Chats live at /chat/<uuid>, projects at /project/<uuid>.",anchors:{composer:[{name:"reference: chat input ProseMirror",selector:"[data-testid='chat-input'] div[contenteditable='true'].ProseMirror",verified:"reference"},{name:"owner-prior: ProseMirror editor",selector:"div[contenteditable='true'].ProseMirror",verified:"owner-prior"},{name:"owner-prior: editable textbox",selector:"div[contenteditable='true'][role='textbox']",verified:"owner-prior"},{name:"owner-prior: editable inside a fieldset",selector:"fieldset div[contenteditable='true']",verified:"owner-prior"}],composerShell:[{name:"reference: fieldset around the composer",selector:"fieldset:has(div[contenteditable='true'].ProseMirror)",verified:"reference"}],sendButton:[{name:"reference: send message label",selector:"button[aria-label='Send message'], button[aria-label='Send Message']",verified:"reference"}],userMessage:[{name:"owner-prior: user message test id",selector:"[data-testid='user-message']",verified:"owner-prior"}],assistantMessage:[{name:"reference: streaming wrapper",selector:"div[data-is-streaming]",verified:"reference",note:"Wraps each reply; holds font-claude-response inside."},{name:"reference: response font",selector:".font-claude-response",verified:"reference"}],messageContent:[{name:"reference: response body",selector:".font-claude-response",verified:"reference"}],sidebarLink:[{name:"reference: recents link",selector:"a[href^='/chat/']",verified:"reference"}],streamingIndicator:[{name:"reference: reply streaming",selector:"div[data-is-streaming='true']",verified:"reference"}],title:[{name:"owner-prior: chat menu trigger",selector:"button[data-testid='chat-menu-trigger']",verified:"owner-prior"}]},urls:{newChatPath:"^/new$",chatPath:"^/chat/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",projectPath:"^/project/(?<id>[0-9a-f-]{36})"},sendHook:"twoStep",temporaryUrl:[{name:"incognito flag",match:"[?&]incognito(?:=[^&]*)?(?:&|$)",verified:"none",note:"Claude opens an incognito chat at /new?incognito. Unverified on the live site."}]};var sh={info:K("claude"),config:j(fa),version:"0.1.0",dataSource:null,limits:q("claude")};var ma={$comment:"Copilot. Nothing here is verified: logged out, copilot.com shows a sign in landing page with no composer (docs/site-notes.md, docs/evidence/m0/probe-copilot.json). The composer is owner-prior, from the owner's older extension, never checked for this build; the owner's bare contenteditable fallback is left to the kit's generic finder. The owner's message selectors (div[data-content='user-message'], div[data-content='ai-message'], cib-message) are left out: the owner gave no user selector, and reading roles from those values would be a guess. newChatPath is the owner's new chat URL. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"owner-prior: user input textarea",selector:"textarea#userInput",verified:"owner-prior"},{name:"owner-prior: textarea with placeholder",selector:"textarea[placeholder]",verified:"owner-prior"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},sendHook:"twoStep"};var ch={info:K("copilot"),config:j(ma),version:"0.1.0",dataSource:null,limits:q("copilot")};var ha={$comment:"DeepSeek. Nothing here is verified: logged out, the site moves to /sign_in (docs/site-notes.md, docs/evidence/m0/probe-deepseek.json). The composer is owner-prior, from the owner's older extension, never checked for this build; the owner's bare textarea fallback is left to the kit's generic finder. The owner's message selectors (div._4f9bf79, div.ds-markdown, div[class*='message']) are left out: with no user selector, every message would read as hidden. newChatPath is the owner's new chat URL. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"owner-prior: chat input textarea",selector:"textarea#chat-input",verified:"owner-prior"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},sendHook:"twoStep"};var dh={info:K("deepseek"),config:j(ha),version:"0.1.0",dataSource:null,limits:q("deepseek")};var ga={$comment:"Gemini. The composer, its box, the /app path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-gemini.json). Strategies marked reference follow Gemini's current markup as maintained open source clients and exporters read it: one user-query element per prompt and one model-response per reply, with the text in .query-text and message-content, and the stop button while a reply streams. They were not watched in a signed in browser for this build. Insert: execCommand kept lines and the draft, paste and beforeinput did nothing, so execCommand is the only one tried. Chats live at /app/<hex>, or /u/<n>/app/<hex> on a second Google account.",anchors:{composer:[{name:"logged-out: Quill editor by label",selector:"div.ql-editor[contenteditable='true'][role='textbox'][aria-label='Enter a prompt for Gemini']",verified:"logged-out",note:"The label is English. The off screen div.ql-clipboard has no role, so it never matches."},{name:"logged-out: Quill editor in rich-textarea",selector:"rich-textarea div.ql-editor[contenteditable='true'][role='textbox']",verified:"logged-out"}],composerShell:[{name:"logged-out: input area fieldset",selector:"fieldset.input-area-fieldset",verified:"logged-out",note:"660 by 64 px when empty."},{name:"logged-out: input-area-v2",selector:"input-area-v2",verified:"logged-out",note:"The element that paints the box: 32 px radius, shadow, same size as the fieldset."}],message:[{name:"owner-prior: message list",selector:"user-query, model-response",verified:"owner-prior",note:"The owner's list also named message-content, which sits inside model-response and was read twice."}],messageContent:[{name:"reference: query text",selector:".query-text",verified:"reference"},{name:"reference: message content",selector:"message-content",verified:"reference"}],userMessage:[{name:"owner-prior: user-query",selector:"user-query",verified:"owner-prior"}],assistantMessage:[{name:"reference: model-response",selector:"model-response",verified:"reference"}],sidebarLink:[{name:"reference: conversation link",selector:"a[href*='/app/']",verified:"reference"}],streamingIndicator:[{name:"reference: stop response button",selector:"button[aria-label='Stop response']",verified:"reference"}],title:[{name:"owner-prior: conversation title test id",selector:"[data-test-id='conversation-title']",verified:"owner-prior"},{name:"reference: selected conversation in the sidebar",selector:".conversation.selected .conversation-title",verified:"reference"}]},urls:{newChatPath:"^/(?:u/\\d+/)?app/?$",chatPath:"^/(?:u/\\d+/)?app/(?<id>[0-9a-f]{8,})",projectPath:"^/(?:u/\\d+/)?gem/(?<id>[^/]+)"},insertOrder:["execCommand"],sendHook:"twoStep"};var ph={info:K("gemini"),config:j(ga),version:"0.1.0",dataSource:null,limits:q("gemini")};var ba={$comment:"Grok. The composer, its box, Submit, the / path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-grok.json). The page shows a plain textarea first and swaps in the TipTap editor about a second later; the textarea stays in the page, hidden. Insert: execCommand and paste kept lines and the draft, beforeinput did nothing. The owner's Grok textarea selector is owner-prior; the owner's bare textarea and contenteditable fallbacks are left to the kit's generic finder, and the owner's message selectors (div.message-bubble, [data-testid='message'], div.response-content-markdown) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: TipTap editor by label",selector:"div.ProseMirror[contenteditable][aria-label='Ask Grok anything']",verified:"logged-out",note:"Its role is combobox, not textbox. The label is English."},{name:"logged-out: editor in chat input",selector:"[data-testid='chat-input'] [contenteditable]",verified:"logged-out"},{name:"owner-prior: Grok textarea",selector:"textarea[aria-label*='Grok' i]",verified:"owner-prior"}],composerShell:[{name:"logged-out: query bar",selector:"div.query-bar",verified:"logged-out",note:"752 by 102 px, 24 px radius, border and shadow."}],sendButton:[{name:"logged-out: chat submit",selector:"[data-testid='chat-submit']",verified:"logged-out",note:"Labeled Submit. Disabled while the box is empty."}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["execCommand","paste"],sendHook:"twoStep"};var mh={info:K("grok"),config:j(ba),version:"0.1.0",dataSource:null,limits:q("grok")};var wa={$comment:"Kimi. The composer, its box, the / path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-kimi.json); the composer appears 6 to 15 seconds after load. Insert: paste kept lines and the draft, execCommand lost line breaks and broke the draft, beforeinput doubled the text, so paste is the only one tried. Kimi also restores the last tab's draft in a new tab. The owner's message selectors (div[class*='segment'], div[class*='markdown']) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: Lexical chat input editor",selector:"div.chat-input-editor[contenteditable='true'][role='textbox'][data-lexical-editor='true']",verified:"logged-out"},{name:"logged-out: chat input editor",selector:"div.chat-input-editor[contenteditable='true']",verified:"logged-out"}],composerShell:[{name:"logged-out: chat editor content",selector:"div.chat-editor-content",verified:"logged-out",note:"768 by 114 px, 24 px radius, border and shadow."},{name:"logged-out: chat editor test id",selector:"div.chat-editor[data-testid='chat-editor']",verified:"logged-out"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["paste"],sendHook:"twoStep"};var gh={info:K("kimi"),config:j(wa),version:"0.1.0",dataSource:null,limits:q("kimi")};var ya={$comment:"Meta AI. The composer, Send, the sign in marker, the / path and the value insert were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-meta_ai.json). Logged out, the composer is a one line text input behind a sign in dialog, inside a wrapper named logged-out-composer-input, so the logged in composer may be a different element. Insert: only the value setter reached the input, so it goes first; the default order follows for whatever the logged in composer turns out to be. The box has only utility class names, so the kit's generic box finder applies. The owner's selectors for Meta AI were bare contenteditable, textarea and div[dir='auto'], left to the kit's generic finders. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: composer input in its slot",selector:"div[data-slot='logged-out-composer-input'] input[type='text']",verified:"logged-out"},{name:"logged-out: composer input by label",selector:"input[type='text'][aria-label='Ask Meta AI']",verified:"logged-out",note:"The label is English."}],sendButton:[{name:"logged-out: Send label",selector:"[aria-label='Send']",verified:"logged-out",note:"Disabled while the box is empty."}],loggedOut:[{name:"logged-out: logged out composer slot",selector:"[data-slot='logged-out-composer-input']",verified:"logged-out"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["value","execCommand","paste","beforeinput"],sendHook:"twoStep"};var wh={info:K("meta_ai"),config:j(ya),version:"0.1.0",dataSource:null,limits:q("meta_ai")};var xa={$comment:"Perplexity. The logged out strategies and the insert order come from the probe's first run (docs/site-notes.md), whose JSON was overwritten by a later run that met a human check, so the notes call them unconfirmed until the owner's pass. Insert: paste kept lines and the draft, execCommand lost line breaks and broke the draft, beforeinput doubled the text, so paste is the only one tried. The owner's #ask-input and textarea selectors are owner-prior; the owner's bare contenteditable and textarea fallbacks are left to the kit's generic finder, and the owner's message selectors (div.prose, [data-testid='answer'], div[class*='query']) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: Lexical ask input",selector:"div#ask-input[contenteditable='true'][role='textbox']",verified:"logged-out",note:"First probe run only."},{name:"owner-prior: ask input id",selector:"#ask-input",verified:"owner-prior"},{name:"owner-prior: ask textarea",selector:"textarea[placeholder*='Ask' i]",verified:"owner-prior"}],composerShell:[{name:"logged-out: raised box",selector:"div[data-appearance='raised']",verified:"logged-out",note:"First probe run only. 640 by 118 px, 16 px radius."}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["paste"],sendHook:"twoStep"};var xh={info:K("perplexity"),config:j(xa),version:"0.1.0",dataSource:null,limits:q("perplexity")};function G(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function vr(e){return typeof e=="string"&&Bo(e)}function kr(e){return typeof e=="number"&&Number.isFinite(e)&&e>=0}function nn(e){return typeof e=="number"&&Number.isSafeInteger(e)&&e>=0}function be(e,t){return typeof t=="string"&&e.includes(t)}var Sr="coere.browser_use",zo=["autonomous","review"],Wo=["bolt","pro","ultra"],_r={on:!1,level:"autonomous",model:"bolt",blocked:[],grantedAt:null},_h=/^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+$/;function _a(e){if(!G(e)||typeof e.on!="boolean")return{..._r,blocked:[]};let t=Array.isArray(e.blocked)?[...new Set(e.blocked.filter(r=>typeof r=="string"&&_h.test(r)))]:[];return{on:e.on,level:be(zo,e.level)?e.level:_r.level,model:be(Wo,e.model)?e.model:_r.model,blocked:t,grantedAt:kr(e.grantedAt)?e.grantedAt:null}}var Ko=["https://mail.google.com/*","https://calendar.google.com/*"];var B8=5*6e4,Sa="Coere",Ea="blue";var F8=Object.keys({start:!0,resume:!0});var U8=Object.keys({retry:!0,resume:!0,pause_all:!0,resume_all:!0,cancel_all:!0,clear:!0});async function Vo(e,t,r){let n=await e.getTab(t);if(!n)return r;if(r!==null){let o=await e.groupWindow(r);if(o!==null&&o!==n.windowId||o!==null&&await Sh(e,t,r))return r}return await Eh(e,t)??r}async function Sh(e,t,r){try{return await e.groupTab(t,r),!0}catch{return!1}}async function Eh(e,t){try{let r=await e.groupTab(t,null);return await e.updateGroup(r,{title:Sa,color:Ea,collapsed:!1}).catch(()=>{}),r}catch{return null}}var Jo={gmail:{pattern:"https://mail.google.com/*",account:/^https:\/\/mail\.google\.com\/mail\/u\/(\d)\//,home:e=>`https://mail.google.com/mail/u/${e}/`},calendar:{pattern:"https://calendar.google.com/*",account:/^https:\/\/calendar\.google\.com\/calendar\/u\/(\d)\//,home:e=>`https://calendar.google.com/calendar/u/${e}/r`}},Ca="coere.actions.own_tabs",qo="coere.actions.group";function Xo(e,t){let r=Jo[e].account.exec(t);return r?Number(r[1]):null}async function Ch(e){let t=await e.sessionGet(Ca);return G(t)?Object.fromEntries(Object.entries(t).filter(([r,n])=>(r==="gmail"||r==="calendar")&&nn(n))):{}}async function on(e,t,r){let n=await Ch(e),o=await t.queryTabs([Jo[r].pattern]),i=o.find(d=>d.id===n[r]),a=o.filter(d=>d.id!==n[r]).map(d=>Xo(r,d.url)).find(d=>d!==null)??Xo(r,i?.url??"")??0,c=await e.sessionGet(qo),l=typeof c=="number"?c:null;if(i&&Xo(r,i.url)===a){let d=await Vo(e,i.id,l);return await e.sessionSet(qo,d),{tabId:i.id,groupId:d,account:a,opened:!1}}let u=await e.createTab(Jo[r].home(a),{active:!0});if(u.id===void 0)throw new Error("tab not opened");let p=await Vo(e,u.id,l);return await e.sessionSet(qo,p),await e.sessionSet(Ca,{...n,[r]:u.id}),{tabId:u.id,groupId:p,account:a,opened:!0}}async function sn(e,t,r,n=o=>new Promise(i=>setTimeout(i,o))){let o=e.now()+r;for(;;){let i=await e.getTab(t);if(!i)return!1;if(!i.loading)return!0;if(e.now()>=o)return!1;await n(100)}}var Rh="actions-page.js",Ra={load:15e3,connect:5e3},an=class{waiting=new Map;offer(t){if(t.name!==qr)return!1;let r=t.sender?.tab?.id,n=r===void 0||t.sender?.frameId!==0?void 0:this.waiting.get(r);return!n||r===void 0?(t.disconnect(),!0):(this.waiting.delete(r),n(t),!0)}expect(t,r){return new Promise(n=>{let o=setTimeout(()=>{this.waiting.get(t)===i&&this.waiting.delete(t),n(null)},r),i=s=>{clearTimeout(o),n(s)};this.waiting.set(t,i)})}};async function Aa(e,t,r,n){if(!await sn(e,n,Ra.load))return"closed";let o=r.expect(n,Ra.connect);return await t.inject(n,Rh)?await o??"no_port":"no_permission"}function ln(e,t,r){return{runId:e.runId,parentId:e.parentId,worker:e.worker,convId:e.convId,kind:e.kind,site:e.site,level:e.level,model:e.model,outcome:t?.outcome??null,reason:t?.reason??null,steps:e.step,startedAt:e.startedAt,endedAt:r}}function Ta(e,t,r){return{runId:e.runId,step:e.step,at:r,kind:e.kind,site:e.site,action:t.action,role:t.role.slice(0,40),tier:t.tier,level:e.level,allowed:t.allowed,outcome:t.outcome,model:t.byModel?e.model:"none"}}var cn=class{constructor(t){this.brain=t}chain=Promise.resolve();run(t,r=null){return this.write({run:t,steps:[],...r?{planCall:r}:{}})}step(t){return this.write({run:null,steps:[t]})}write(t){return this.chain=this.chain.then(()=>this.brain["memory.act.log"](t)).catch(()=>{}),this.chain}};var A={};Os(A,{ALLOW:()=>Ih,ALLOWED_STARTING:()=>Lh,ALLOW_LINE:()=>Ph,ALLOW_TITLE:()=>Th,CANCEL:()=>Hh,CANCELLED:()=>bg,CAPTCHA:()=>sg,GMAIL_SIGN_IN:()=>ig,INJECTION:()=>og,KEEP_GOING:()=>rg,KEEP_GOING_LINE:()=>tg,NEED_OK:()=>Ah,NEED_TO_LOOK:()=>ng,NOT_NOW:()=>Mh,NO_UNDO_INVITES:()=>Jh,NO_UNDO_SENT:()=>Xh,ON_IT:()=>hg,ON_IT_RESEARCH:()=>gg,PLAN_LINES:()=>jh,PLAN_TITLE:()=>Nh,REFUSED:()=>mg,RESULT_CHIP_WORDS:()=>qh,RESUME:()=>ag,SOMETHING_ELSE:()=>Fh,START:()=>Dh,STARTING:()=>Uh,STARTING_LINK:()=>$h,STOP:()=>Bh,STOPPED_OFF:()=>eg,SUBMIT_QUIZ:()=>fg,TASK_STATUS:()=>Wh,allowSendTo:()=>dg,alwaysAllowOn:()=>Oh,answered:()=>Zh,emptyFields:()=>Qh,findEmailsWith:()=>Gh,foundTwo:()=>ug,needsYou:()=>lg,noAddressFor:()=>pg,noUndoOn:()=>Yh,resultTitle:()=>Kh,workOn:()=>zh});var Ah="I need your OK to use your browser for this.",Th="Allow Coere browser use",Ph="Cori works in a Coere tab group and you can stop it anytime.",Ih="Allow",Mh="Not now",Lh="Allowed. Starting now.",Oh=e=>`Always allow on ${e}`,Nh="Here's my plan",Dh="Start",Hh="Cancel",Bh="Stop",Fh="Something else",Uh="Got it, starting the task",$h="here",jh={openGmail:"Open Gmail",openCalendar:"Open Google Calendar",writeEmail:"Write the email in your style",saveDraft:"Save it as a draft",send:"Send it",addEvent:"Add the event",saveEvent:"Save it to your calendar",rewrite:"Rewrite it in your style",readPage:"Read the page",workOnPage:"Work on the page step by step"},Gh=e=>`Find your recent emails with ${e}`,zh=e=>`Work on ${e}`,Wh={running:"Working",waiting:"Waiting for you",taken_over:"You have control",done:"Done",stopped:"Stopped",stuck:"I got stuck"};function Kh(e,t){return e==="sent"?t?`Sent to ${t}`:"Sent":Vh[e]}var Vh={draft_saved:"Draft saved in Gmail",event_added:"Event added to your calendar",rewritten:"Rewritten",kept:"Kept the original",done:"Done",stopped:"Stopped",stuck:"I got stuck"},qh={open:"Open",openDraft:"Open draft",delete_draft:"Delete draft",undo_send:"Undo send",delete_event:"Delete event",undo:"Undo",clear:"Clear",try_pro:"Try with Pro"},Xh="It's sent now, so there's no undo.",Jh="The invitations are out. Delete event sends a cancellation.",Yh=e=>`Cori can't undo this on ${e}.`,Zh=(e,t)=>`Answered ${e} of ${t} questions`,Qh=e=>`Left ${e} ${e===1?"field":"fields"} empty, since your memory has nothing for ${e===1?"it":"them"}.`,eg="Stopped. Coere Browser Use is off.",tg="This is taking longer than usual. Keep going?",rg="Keep going",ng="I need to see this page. Press Coere's toolbar button to let me look.",og="This page asked me to do something you didn't ask for. I stopped.",ig="Gmail wants you to sign in first.",sg="This page wants to check you're a person. Finish that, then press Resume.",ag="Resume",cg={password:"a password",payment:"payment details",purchase:"a purchase",account_security:"your account settings",captcha:"a check that you are a person",sign_in:"signing in",file:"a file",blocked_site:"a site you blocked"},lg=e=>`This step needs you: ${cg[e]}. I stopped here.`,dg=e=>`Allow Cori to send to ${e}?`,ug=e=>`You said ${e}. I found two. Is it this one?`,pg=e=>`I couldn't find an address for ${e}. What is it?`,fg="Allow Cori to submit this quiz?",mg={busy:"I'm already working on a task like this. Stop it first, or wait until it's done.",blocked_site:"That site is on your blocked list, so I won't work there.",not_ready:"I can't do that kind of task yet.",no_plan:"I couldn't work out a plan for that. Try saying it another way."},hg="Sure, here's what I'll do.",gg="Sure, I'll look into it.",bg="Okay, I won't do that.";var x={};Os(x,{ACCEPT:()=>zg,ALLOW:()=>Fg,ALLOW_FOR_TASK:()=>Ug,ALLOW_SAVE_EVENT:()=>Dg,ALLOW_SEND_GMAIL:()=>Ng,CLOSE:()=>Zg,CONTROLLED:()=>wg,COPY:()=>sb,DID_IT_GO_IN:()=>Jg,FIELD_LABELS:()=>$g,GO_BACK:()=>eb,GO_TO_CHAT:()=>_g,HAND_BACK:()=>kg,LOOKS_GOOD:()=>Qg,MENU_ASK:()=>cb,MENU_REWRITE:()=>ab,MODE_GRAMMAR:()=>Ma,MODE_IMPROVE:()=>Ia,MODE_REWRITE:()=>Pa,MORE_FORMAL:()=>Vg,NOTHING_TO_CHANGE:()=>tb,REWRITING:()=>Gg,REWRITTEN:()=>qg,SHORTER:()=>Kg,SITE_NAMES:()=>jg,STEP_LINES:()=>Rg,STOP:()=>Sg,TAKE_OVER:()=>vg,TRY_AGAIN:()=>Wg,UNDO:()=>Xg,WAITING_FOR_YOU:()=>Cg,WORKING_ON_TASK:()=>xg,YES:()=>Yg,YOU_HAVE_CONTROL:()=>Eg,allowChoose:()=>Og,allowFill:()=>Lg,allowInvite:()=>Hg,allowOpenHost:()=>Mg,allowOpenLink:()=>Ig,allowPress:()=>Pg,allowSubmit:()=>Bg,answeringQuestion:()=>Ag,controlledWorker:()=>yg,copiedPaste:()=>ob,modeName:()=>rb,pasteLine:()=>ib,pressCopy:()=>nb,readingHost:()=>Tg});var wg="Controlled by Cori",yg=e=>`Controlled by Cori, worker ${e}`,xg="Working on task",vg="Take over",kg="Hand back",_g="Go to chat",Sg="Stop",Eg="You have control",Cg="Waiting for you",Rg={openGmail:"Opening Gmail",findEmails:"Finding your recent emails",writeEmail:"Writing the email",fillEmail:"Filling in the email",saveDraft:"Saving the draft",send:"Sending",openCalendar:"Opening Google Calendar",writeEvent:"Writing the event",saveEvent:"Saving the event",rewrite:"Rewriting in your style",look:"Looking at the page"},Ag=(e,t)=>`Answering question ${e} of ${t}`,Tg=e=>`Reading ${e}`,Pg=(e,t)=>`Allow Cori to press ${e} in ${t}`,Ig=(e,t)=>`Allow Cori to open ${e} in ${t}`,Mg=e=>`Allow Cori to open ${e}`,Lg=(e,t)=>`Allow Cori to fill in ${e} ${e===1?"field":"fields"} in ${t}`,Og=(e,t)=>`Allow Cori to choose ${e} in ${t}`,Ng="Allow Cori to press Send in Gmail",Dg="Allow Cori to save this event in Google Calendar",Hg=e=>`Allow Cori to send invitations to ${e}`,Bg=e=>`Allow Cori to submit this form in ${e}`,Fg="Allow",Ug="Allow for this task",$g={to:"To",cc:"Cc",subject:"Subject",body:"Message",title:"Title",when:"When",where:"Where",guests:"Guests",address:"Address"},jg={gmail:"Gmail",calendar:"Google Calendar",docs:"Google Docs"},Gg="Rewriting in your style",zg="Accept",Wg="Try again",Kg="Shorter",Vg="More formal",qg="Rewritten",Xg="Undo",Jg="Did it go in right?",Yg="Yes",Zg="Close",Qg="Looks good",eb="Go back",tb="Nothing to change",Pa="Rewrite",Ia="Improve",Ma="Fix grammar only";function rb(e){return e==="grammar"?Ma:e==="improve"?Ia:Pa}var Yo=(e,t)=>`${e?"Cmd":"Ctrl"}+${t}`,nb=e=>`Press ${Yo(e,"C")} so I can read your selection.`,ob=e=>`Copied. Press ${Yo(e,"V")} to replace your selection.`,ib=e=>`Copy it, then press ${Yo(e,"V")} over your selection.`,sb="Copy",ab="Rewrite with Cori",cb="Ask Cori";var yt=e=>{let{lines:t=[],...r}=e;return{name:null,chips:[],undoUntil:null,reason:null,...r,lines:t.slice(0,3)}},Zo=e=>`${x.FIELD_LABELS.to}: ${e}`,Qo=e=>`${x.FIELD_LABELS.subject}: ${e}`;function La(e,t,r){return yt({outcome:"draft_saved",lines:[Zo(e),Qo(t)],chips:["open","delete_draft"],undoUntil:r})}function Oa(e,t,r,n){return yt(n===null?{outcome:"sent",name:e,lines:[Zo(t),Qo(r),A.NO_UNDO_SENT],chips:["open"]}:{outcome:"sent",name:e,lines:[Zo(t),Qo(r)],chips:["open","undo_send"],undoUntil:n})}function Na(e,t,r,n){return yt({outcome:"event_added",lines:[e,t,...r?[A.NO_UNDO_INVITES]:[]],chips:["open","delete_event"],undoUntil:n})}function xt(e,t=[]){return yt({outcome:e,lines:t})}function Da(e,t){return yt({outcome:"done",lines:[...t,A.noUndoOn(e)],chips:["open"]})}function ce(e,t=[],r=!0){return yt({outcome:"stuck",lines:t,chips:e==="bolt"&&r?["open","try_pro"]:["open"],reason:"stuck"})}function Ee(e,t=[],r={chips:[],undoUntil:null}){let n=e==="off"?[A.STOPPED_OFF]:[];return yt({outcome:"stopped",reason:e,lines:[...n,...t],chips:r.chips,undoUntil:r.undoUntil})}var Ha=e=>A.resultTitle(e.outcome,e.name);var X=class extends Error{constructor(r){super(r.outcome);this.result=r}};function Er(e){return Ee("forbidden",[e==="captcha"?A.CAPTCHA:A.needsYou(e)])}var vt=()=>Ee("injection",[A.INJECTION]);function ei(e,t,r){return e.fail==="sign_in"?new X(Ee("forbidden",[r])):e.fail==="check"&&Array.isArray(e.data.strangers)&&e.data.strangers.length>0?new X(vt()):new X(ce(t,[],e.data.pressed!==!0))}function Ve(e,t,r){if(!e.held)throw ei(e,t,r);return e}var ub=["read","snapshot","do","settle","marks","overlay","recipe","picture"],pb=["stale_element","not_found","refused","timeout","detached","internal"],fb=["take_over","hand_back","go_to_chat","stop"],mb=["accept","try_again","shorter","more_formal","close","undo","yes","looks_good","go_back","mode_rewrite","mode_improve","mode_grammar","copy","pasted"],hb=["allow","allow_task","stop"];function Fa(e){return!G(e)||typeof e.id!="string"||typeof e.ok!="boolean"||!ub.includes(e.type)?null:e.ok?"result"in e?e:null:pb.includes(e.error)?e:null}function gb(e){if(!G(e))return null;if(e.kind==="bar"&&be(fb,e.button))return{kind:"bar",button:e.button};if(e.kind==="rewrite"&&be(mb,e.button))return{kind:"rewrite",button:e.button};if(e.kind!=="card"||typeof e.step!="number"||!Number.isInteger(e.step))return null;let t=bb(e.edited);return be(hb,e.choice)?{kind:"card",step:e.step,choice:e.choice,edited:t}:typeof e.choice=="number"&&Number.isInteger(e.choice)&&e.choice>=0?{kind:"card",step:e.step,choice:e.choice,edited:t}:null}function bb(e){if(!G(e))return{};let t=Object.entries(e).filter(r=>r[0].length<=40&&typeof r[1]=="string");return Object.fromEntries(t.slice(0,8).map(([r,n])=>[r,n.slice(0,4e3)]))}function Ua(e){if(!G(e))return null;if(e.type==="person"&&(e.input==="pointer"||e.input==="key"))return{type:"person",input:e.input};if(e.type==="navigated"&&typeof e.url=="string")return{type:"navigated",url:e.url};if(e.type==="rewrite"&&(e.end==="accepted"||e.end==="reverted"||e.end===null)&&Number.isInteger(e.left)&&e.left>=0)return{type:"rewrite",end:e.end,left:e.left};if(e.type!=="press")return null;let t=gb(e.press);return t?{type:"press",press:t}:null}function $a(e){if(!G(e)||e.type!=="pick"||typeof e.id!="string"||typeof e.description!="string"||!Array.isArray(e.candidates))return null;let t=e.candidates.filter(r=>G(r)&&Number.isInteger(r.n)&&typeof r.role=="string"&&typeof r.name=="string"&&(r.heading===null||typeof r.heading=="string")).slice(0,20);return{type:"pick",id:e.id,description:e.description.slice(0,200),candidates:t}}var Ba=e=>e.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>1);function dn(e,t){let r=new Set(Ba(e));return t.map(n=>({e:n,score:Ba(`${n.name} ${n.role}`).filter(o=>r.has(o)).length})).filter(n=>n.score>0).sort((n,o)=>o.score-n.score).slice(0,20).map(({e:n})=>({n:n.n,role:n.role,name:n.name,heading:n.heading}))}var kt=class extends Error{constructor(r){super(r);this.code=r}},un=class{constructor(t,r){this.port=t;this.handlers=r;t.onMessage.addListener(n=>this.receive(n)),t.onDisconnect.addListener(()=>this.closed())}waiting=new Map;next=0;open=!0;get isOpen(){return this.open}call(t,r,n){if(!this.open)return Promise.reject(new kt("detached"));let o=`p${++this.next}`;return new Promise((i,s)=>{let a=setTimeout(()=>{this.waiting.delete(o),s(new kt("timeout"))},n);this.waiting.set(o,{resolve:i,reject:s,timer:a});try{this.port.postMessage({...r,id:o,type:t})}catch{this.closed()}})}close(){if(this.open){try{this.port.disconnect()}catch{}this.closed()}}receive(t){let r=Fa(t);if(r){let i=this.waiting.get(r.id);if(!i)return;this.waiting.delete(r.id),clearTimeout(i.timer),r.ok?i.resolve(r.result):i.reject(new kt(r.error));return}let n=$a(t);if(n){this.handlers.onPick(n.description,n.candidates).catch(()=>null).then(i=>{let s=i!==null&&n.candidates.some(c=>c.n===i),a={type:"picked",id:n.id,n:s?i:null};this.open&&this.port.postMessage(a)});return}let o=Ua(t);o&&this.handlers.onEvent(o)}closed(){if(this.open){this.open=!1;for(let t of this.waiting.values())clearTimeout(t.timer),t.reject(new kt("detached"));this.waiting.clear(),this.handlers.onClose()}}};var wb=new Set(["running","waiting","taken_over"]),le=e=>wb.has(e.status);function pn(e,t){if(!le(e))return e;switch(t.type){case"step":return e.status==="taken_over"?e:{...e,status:"running",step:t.step,tier:t.tier,pending:null};case"wait":return e.status==="taken_over"?e:{...e,status:"waiting",pending:t.pending};case"answered":return e.status==="waiting"?{...e,status:"running",pending:null}:e;case"take_over":return{...e,status:"taken_over",pending:null};case"hand_back":return e.status==="taken_over"?{...e,status:"running"}:e;case"spent":return Number.isFinite(t.micros)&&t.micros>0?{...e,spentMicros:e.spentMicros+Math.round(t.micros)}:e;case"screenshot":return{...e,screenshots:e.screenshots+1};case"tab":return{...e,tabId:t.tabId,groupId:t.groupId};case"end":return{...e,status:t.status,pending:null};case"restarted":return{...e,status:"stopped",pending:null}}}function ja(e){return{runId:e.runId,kind:e.kind,site:e.site,tabId:e.tabId,groupId:null,parentId:e.parentId??null,worker:e.worker??null,convId:e.convId,level:e.level,model:e.model,step:0,tier:e.tier,status:"running",pending:null,spentMicros:0,screenshots:0,startedAt:e.now}}var Ga=(e,t=!1)=>({site:e,stepLine:"",card:null,rewrite:null,result:null,cardOnly:t,hidden:!1});function yb(e,t){return t.result?"result":e.status==="taken_over"?"taken_over":e.status==="waiting"?"waiting":"working"}function za(e,t,r){let n=t.result!==null;return{visible:!t.hidden&&(t.cardOnly?t.rewrite!==null:!n||r||t.rewrite!==null),glow:e.status==="taken_over"?"still":"working",bar:{mode:yb(e,t),step:t.stepLine,worker:e.worker,result:t.result?Ha(t.result):null},card:t.hidden||n||e.status!=="waiting"?null:t.card,rewrite:t.hidden?null:t.rewrite,rewriteAt:null,cardOnly:t.cardOnly}}function ti(e,t){return t.result===null&&e.status==="waiting"?t.card:null}function ri(e,t){return{runId:e.runId,site:t.site,status:e.status,step:t.stepLine,preview:null,result:t.result}}var oe=class extends Error{constructor(r){super(r);this.reason=r}},Cr=class extends Error{},xb="The person took over the page and handed it back. Keep every answer and field they changed, and carry on from the page as it is now.",fn=class{constructor(t,r,n,o,i,s,a){this.deps=t;this.state=r;this.view=n;this.line=o;this.plan=i;this.budget=s;this.origin=a}link=null;allowedForTask=!1;undo=null;notes=[];handedBack=!1;calls=0;resultShowing=!1;blocked=[];given=[];stopReason=null;card=null;edits={};rewrite=null;resume=[];interrupts=new Set;takenAt=0;get stopped(){return this.stopReason}get actCall(){return{runId:this.state.runId,worker:this.state.worker,model:this.state.model}}get fields(){return Object.fromEntries(this.plan.fields.map(t=>[t.name,t.value]))}async event(t){this.state=pn(this.state,t),await this.deps.store.put(this.state),await this.redraw(),this.deps.publish(this)}async redraw(){this.link?.isOpen&&await this.link.call("overlay",{state:za(this.state,this.view,this.resultShowing)},3e3).catch(()=>{})}async checkpoint(){for(;this.state.status==="taken_over"&&this.stopReason===null;)await new Promise(t=>this.resume.push(t));if(this.stopReason!==null)throw new oe(this.stopReason);if(this.budget.overWall(this.deps.now())&&this.stop("budget"),this.stopReason!==null)throw new oe(this.stopReason)}interrupted(){let t=()=>{},r=new Promise(n=>t=n);return this.interrupts.add(t),{done:r,off:()=>this.interrupts.delete(t)}}cut(){for(let t of this.interrupts)t();this.interrupts.clear(),this.deps.brain["memory.act.abort"]({runId:this.state.runId})}stop(t){if(!(this.stopReason!==null||!le(this.state))){this.stopReason=t,this.cut(),this.card?.reject(new oe(t)),this.card=null,this.rewrite?.reject(new oe(t)),this.rewrite=null;for(let r of this.resume.splice(0))r()}}async takeOver(){if(!le(this.state)||this.state.status==="taken_over"||this.view.cardOnly)return!1;this.cut(),this.card?.reject(new Cr),this.card=null,this.takenAt=this.deps.now(),await this.event({type:"take_over"});let t=this.takenAt;return setTimeout(()=>{this.state.status==="taken_over"&&this.takenAt===t&&this.stop("takeover_timeout")},Q.takeoverMs),!0}async handBack(){if(this.state.status!=="taken_over")return!1;this.handedBack=!0,this.notes.push(xb),await this.event({type:"hand_back"});for(let t of this.resume.splice(0))t();return!0}waitForAnswer(t){return this.stopReason!==null?Promise.reject(new oe(this.stopReason)):new Promise((r,n)=>{this.card={step:t,resolve:r,reject:n}})}answer(t,r,n={}){if(!this.card||this.card.step!==t)return!1;let o=this.card;return this.card=null,this.edits=n,o.resolve(r),!0}takeEdits(){let t=this.edits;return this.edits={},t}waitForRewrite(){return this.stopReason!==null?Promise.reject(new oe(this.stopReason)):new Promise((t,r)=>this.rewrite={resolve:t,reject:r})}pressRewrite(t){let r=this.rewrite;this.rewrite=null,r?.resolve(t)}};var Rr={"mail.google.com":{recipe:"gmail",site:{name:x.SITE_NAMES.gmail,icon:"gmail"}},"calendar.google.com":{recipe:"calendar",site:{name:x.SITE_NAMES.calendar,icon:"calendar"}},"docs.google.com":{recipe:"docs",site:{name:x.SITE_NAMES.docs,icon:"docs"}}};function He(e){try{return new URL(e).hostname.toLowerCase()||null}catch{return null}}function Zt(e){try{let t=new URL(e);return t.protocol==="https:"||t.protocol==="http:"?`${t.protocol}//${t.hostname.toLowerCase()}`:null}catch{return null}}function Wa(e){let t=He(e)??"";return Rr[t]?.site??{name:t,icon:"globe"}}function Ka(e){return Object.values(Rr).find(t=>t.site.name===e)?.site??{name:e,icon:"globe"}}function Va(e){return Rr[He(e)??""]?.recipe??null}var qa=Rr["mail.google.com"].site,Xa=Rr["calendar.google.com"].site;var ct={quick:5e3,settle:1e4,recipe:3e4},ni=class extends Error{};async function de(e,t,r=e.state.tier){await e.checkpoint(),e.view={...e.view,stepLine:t},await e.event({type:"step",step:e.state.step+1,tier:r})}async function qe(e,t){let r=await Aa(e.deps.router,e.deps.chrome,e.deps.hub,t);if(r==="closed")throw new oe("tab_closed");if(r==="no_permission")throw new oe("no_permission");if(r==="no_port")throw new ni("no_port");e.link=new un(r,{onEvent:n=>e.deps.onPageEvent(e,n),onPick:(n,o)=>Cb(e,n,o),onClose:()=>void vb(e,t)}),await e.redraw()}async function vb(e,t){let r=()=>e.state.status==="taken_over"&&e.stopped===null&&e.state.tabId===t&&!e.link?.isOpen;!r()||!await sn(e.deps.router,t,kb)||r()&&await qe(e,t).catch(()=>{})}var kb=15e3;async function ue(e,t,r,n=ct.quick,o=!1){return o||await e.checkpoint(),e.link?.isOpen||await qe(e,e.state.tabId),e.link.call(t,r,n)}var _b=e=>!e.held&&e.fail===null&&typeof e.data.navigate=="string"?e.data.navigate:null;async function _t(e,t,r,n=!1){for(let o=0;o<3;o++){let i=await ue(e,"recipe",{call:t},ct.recipe,n),s=_b(i);if(s===null)return i;if(He(s)!==r||!s.startsWith("https://"))return{held:!1,fail:"check",data:{}};e.link?.close(),await e.deps.router.updateTab(e.state.tabId,{url:s})}return{held:!1,fail:"timeout",data:{}}}var Sb=()=>({ok:!1,failure:"aborted",usdMicros:0}),Eb=()=>({ok:!1,failure:"timeout",usdMicros:0});async function Ce(e,t){for(;;){await e.checkpoint();let r=e.interrupted(),n,o=new Promise(s=>n=setTimeout(()=>s(Eb()),e.budget.callMs));e.calls+=1;let i=await Promise.race([t(),r.done.then(()=>Sb()),o]);if(clearTimeout(n),r.off(),i.usdMicros>0&&await e.event({type:"spent",micros:i.usdMicros}),!(!i.ok&&i.failure==="aborted"&&e.stopped===null&&e.state.status==="taken_over")){if(e.stopped!==null)throw new oe(e.stopped);return i}}}async function Cb(e,t,r){if(r.length===0)return null;let n=await Ce(e,()=>e.deps.brain["memory.act.pick"]({...e.actCall,description:t,candidates:r}));return n.ok?n.n:null}async function pe(e,t,r){for(;;){await e.checkpoint(),e.view={...e.view,card:{...t,step:e.state.step}};let n=e.waitForAnswer(e.state.step);await e.event({type:"wait",pending:r});try{let o=await n;return e.view={...e.view,card:null},await e.event({type:"answered"}),o==="stop"&&e.stop("person"),o==="allow_task"&&(e.allowedForTask=!0),await e.checkpoint(),o}catch(o){if(e.view={...e.view,card:null},!(o instanceof Cr))throw o}}}function ee(e,t){e.deps.audit.step(Ta(e.state,t,e.deps.now()))}var Ja=e=>e instanceof kt&&e.code==="detached";var Ya=40,Rb=/@|https?:|www\.|\b(ignore|instead|instruction|cori|coere|assistant|system|you must|always|never)\b/i;function Qt(e){let t=e.replace(/\s+/g," ").trim(),r=t.length>Ya?`${t.slice(0,Ya-3).trimEnd()}...`:t;return Rb.test(t)?`"${r.replace(/"/g,"'")}"`:r}function Za(e,t,r){let n=Qt(t?.name||e.target);switch(e.action){case"navigate":return x.allowOpenHost(He(e.url??"")??r.name);case"type":return x.allowFill(1,r.name);case"select":return x.allowChoose(Qt(e.option??""),r.name);case"click":return t?.flags.includes("submit")?x.allowSubmit(r.name):t?.role==="link"?x.allowOpenLink(n,r.name):x.allowPress(n,r.name);default:return x.allowPress(n,r.name)}}function Qa(e,t,r,n){switch(e){case"unnamed_recipient":return A.allowSendTo(n??"");case"send_not_asked":return x.ALLOW_SEND_GMAIL;case"leaves_sites":return x.allowOpenHost(He(t.url??"")??r.name);case"irreversible":return x.allowSubmit(r.name)}}function fe(e){return{step:e.step,site:e.site,line:e.line,reason:e.reason??null,fields:e.fields??[],allowForTask:e.allowForTask,choices:e.choices??[]}}function ec(e,t=3){return e.split(/\r?\n/).filter(r=>r.trim()!=="").slice(0,t).join(`
`)}var Re=(e,t,r=!1)=>({label:e,value:t,editable:r});var rc=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,lt=e=>[...new Set((e.match(rc)??[]).map(t=>t.toLowerCase()))];function er(e){return e.replace(rc," ").split(/,|;|\band\b|&/i).map(t=>t.trim()).filter(t=>t.length>0&&t.length<=60)}var tc=e=>e.toLowerCase().replace(/\s+/g," ").trim(),Ab=new Set(["professor","prof","dr","doctor","mr","mrs","ms","miss","mx","coach"]);function mn(e,t){let r=tc(e).replace(/\./g,"").split(" "),n=r.length>1?r.filter(s=>!Ab.has(s)):r,o=t.filter(s=>s.address!==null&&n.every(a=>tc(s.name).split(" ").includes(a))),i=new Set;return o.flatMap(s=>{let a=lt(s.address??"")[0];return a===void 0||i.has(a)?[]:(i.add(a),[{name:s.name,address:a}])})}function nc(e){let t=Array.isArray(e.data.matches)?e.data.matches:[],r=new Set;return t.flatMap(n=>{let o=n;return typeof o.address!="string"||lt(o.address).length!==1||r.has(o.address.toLowerCase())?[]:(r.add(o.address.toLowerCase()),[{name:typeof o.name=="string"?o.name.trim():"",address:o.address.toLowerCase()}])})}async function tr(e,t,r){if(r.length===1)return r[0];if(r.length===0)throw new X(Ee(null,[A.noAddressFor(t)]));let n=await pe(e,fe({step:e.state.step,site:e.view.site,line:A.foundTwo(t),allowForTask:!1,choices:r.slice(0,4).map(o=>o.address)}),{verb:"type",role:"textbox",site:e.state.site});if(typeof n!="number"||!r[n])throw new X(Ee("person"));return r[n]}var Ae=e=>({kind:e.kind,target:e.target,fields:e.fields.map(t=>({name:t.name,value:t.value}))});function rr(e){return{person:{name:"",timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,today:new Date(e).toISOString().slice(0,10)},style:[],facts:[],people:[],form:{}}}var Tb="mail.google.com",Pb=1200,te=(e,t,r={})=>_t(e,{recipe:"gmail",step:t,args:r},Tb),dt=(e,t)=>Ve(t,e.state.model,A.GMAIL_SIGN_IN);async function oc(e,t,r,n,o){let i=new Set(lt(e.line)),s=lt(n).filter(l=>i.has(l)).map(l=>({name:l,address:l})),a=er(n);s.length===0&&a.length===0&&n.trim()!==""&&a.push(n.trim());for(let l of a){let u=mn(l,t.people);if(u.length>0){s.push(await tr(e,l,u));continue}o.open||dt(e,await te(e,"compose",{account:r})),o.open=!0,s.push(await tr(e,l,nc(dt(e,await te(e,"to",{lookup:l})))))}let c=new Set;return s.filter(l=>!c.has(l.address)&&c.add(l.address))}async function Ib(e,t,r){if(!(await te(e,"search",{query:`to:${t.address}`,account:r})).held)return[];let o=(await te(e,"read_results",{limit:3})).data.rows,i=[];for(let[s,a]of(Array.isArray(o)?o:[]).slice(0,3).entries()){if(s>0&&!(await te(e,"search",{query:`to:${t.address}`,account:r})).held)break;let c=await te(e,"read_thread",{row:s}),u=(Array.isArray(c.data.messages)?c.data.messages:[]).filter(d=>typeof d.body=="string"&&String(d.from).toLowerCase()!==t.address),p=typeof a.subject=="string"?a.subject:"";for(let d of u.slice(0,1))i.push({subject:p,text:String(d.body).slice(0,Pb)})}return i}var Mb=/^\s*(reply|respond|write back)\b|\breply to\b/i;async function Lb(e,t){let r=lt(e.fields.to??"")[0],n=r?`from:${r}`:`in:inbox ${e.plan.target}`.slice(0,200);if(!(await te(e,"search",{query:n,account:t})).held)return null;let o=(await te(e,"read_results",{limit:1})).data.rows,i=Array.isArray(o)?o[0]:void 0;if(!i)return null;let s=await te(e,"read_thread",{row:0}),c=(Array.isArray(s.data.messages)?s.data.messages:[]).at(-1),l=typeof c?.from=="string"?lt(c.from)[0]:void 0;if(!c||l===void 0||r!==void 0&&l!==r)return null;let u=typeof i.subject=="string"?i.subject:"";return{to:{name:typeof c.sender=="string"?c.sender:l,address:l},subject:u,source:typeof c.body=="string"?c.body:""}}async function ic(e){let t=/^(yes|true)$/i.test(e.fields.send??"");await de(e,x.STEP_LINES.openGmail,"recipe");let r=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"email",plan:Ae(e.plan),names:er(e.fields.to??""),sensitive:!1}).catch(()=>rr(e.deps.now())),n=await on(e.deps.router,e.deps.chrome,"gmail");await e.event({type:"tab",tabId:n.tabId,groupId:n.groupId}),await qe(e,n.tabId);let o=Number(dt(e,await te(e,"account")).data.account??n.account)||0;ee(e,{action:"navigate",role:"page",tier:"recipe",allowed:!1,outcome:"held",byModel:!1});let i={open:!1},s=Mb.test(e.line)?await Lb(e,o):null,a=s?[s.to]:await oc(e,r,o,e.fields.to??"",i),c=(await oc(e,r,o,e.fields.cc??"",i)).filter(se=>!a.some(ae=>ae.address===se.address)),l=a[0]??await tr(e,e.fields.to??"",[]),u=a.map(se=>se.address),p=c.map(se=>se.address);await de(e,x.STEP_LINES.findEmails);let d=s?[]:await Ib(e,l,o);await de(e,x.STEP_LINES.writeEmail);let f=await Ce(e,()=>e.deps.brain["memory.act.write"]({...e.actCall,request:{kind:"email",line:e.line,plan:Ae(e.plan),person:r.person,style:r.style,facts:r.facts,samples:d,recipient:{name:l.name,address:l.address},source:s?.source??""}}));if(!f.ok&&f.failure==="injected")return vt();if(!f.ok||f.written.kind!=="email")return ce(e.state.model);let h=s&&!/^re:/i.test(f.written.email.subject)&&s.subject?{...f.written.email,subject:`Re: ${s.subject}`}:f.written.email,w=e.state.level==="review"&&!e.allowedForTask,y=[Re(x.FIELD_LABELS.to,u.join(", ")),...p.length?[Re(x.FIELD_LABELS.cc,p.join(", "))]:[]],b=[...y,Re(x.FIELD_LABELS.subject,h.subject,!0),Re(x.FIELD_LABELS.body,h.body,!0)],v=w&&await pe(e,fe({step:0,site:e.view.site,line:x.allowFill(b.length,e.view.site.name),fields:b,allowForTask:!0}),{verb:"type",role:"textbox",site:e.state.site})!=="stop",E=e.takeEdits(),T={subject:E[x.FIELD_LABELS.subject]??h.subject,body:E[x.FIELD_LABELS.body]??h.body};await de(e,x.STEP_LINES.fillEmail),dt(e,await te(e,"compose",{account:o})),dt(e,await te(e,"to",{to:u,cc:p}));let $=dt(e,await te(e,"subject",{text:T.subject,...e.handedBack?{ifEmpty:!0}:{}}));if(typeof $.data.kept=="string"&&(T.subject=$.data.kept),dt(e,await te(e,"body",{text:T.body})),ee(e,{action:"type",role:"textbox",tier:"recipe",allowed:v,outcome:"held",byModel:!1}),!t)return await de(e,x.STEP_LINES.saveDraft),dt(e,await te(e,"save_draft")),ee(e,{action:"click",role:"button",tier:"recipe",allowed:!1,outcome:"held",byModel:!1}),e.undo={kind:"draft",subject:T.subject,account:o},La(u.join(", "),T.subject,e.deps.now()+Q.undoMs);let W=fe({step:0,site:e.view.site,line:x.ALLOW_SEND_GMAIL,fields:[...y,Re(x.FIELD_LABELS.subject,T.subject),Re(x.FIELD_LABELS.body,ec(T.body))],allowForTask:!0}),Z=e.state.level==="review"&&!e.allowedForTask&&await pe(e,W,{verb:"click",role:"button",site:e.state.site})!=="stop";await de(e,x.STEP_LINES.send),dt(e,await te(e,"send",{confirmed:!0,to:u,cc:p})),ee(e,{action:"click",role:"button",tier:"recipe",allowed:Z,outcome:"held",byModel:!1});let U=await te(e,"sent");return e.undo=U.data.undo===!0?{kind:"send"}:null,Oa(l.name,u.join(", "),T.subject,U.data.undo===!0?e.deps.now()+oi:null)}var oi=3e4;function Ob(e,t){let r=t.reason==="no_permission"?[A.NEED_TO_LOOK]:[];return e.undo?.kind!=="send"?Ee(t.reason,r):Ee(t.reason,r,{chips:["open","undo_send"],undoUntil:e.deps.now()+oi})}function Nb(e,t){return t instanceof X?t.result:t instanceof oe?Ob(e,t):ce(e.state.model)}var Db=e=>e.outcome==="stuck"?"stuck":e.outcome==="stopped"?"stopped":"done";async function sc(e,t,r){let n;try{n=await r(t)}catch(s){n=Nb(t,s)}t.view={...t.view,result:n,card:null},t.resultShowing=!0,await t.event({type:"end",status:Db(n)}).catch(()=>{}),await e.writeEnd(t,n);let o=t.deps.now(),i=n.undoUntil===null?0:Math.max(0,n.undoUntil-o);setTimeout(()=>{t.resultShowing=!1,t.redraw().then(()=>{t.view.rewrite?.state!=="done"&&t.link?.close()})},Q.resultBarMs),t.view.rewrite?.state==="done"&&setTimeout(()=>t.link?.close(),Math.max(i,Q.resultBarMs)),e.forget(t.state.runId,Math.max(i,Q.undoMs))}var ac=(e,t)=>({type:"task",runId:e.runId,site:e.site,result:t});async function cc(e,t){try{let r={role:"cori",text:`${A.STARTING} ${A.STARTING_LINK}`,blocks:[ac(t,null)],runId:t.runId},{conv:n,n:o}=await e["memory.chat.append"]({convId:t.convId,startedOn:"dashboard",fresh:!1,turn:r});return{convId:n.id,n:o}}catch{return null}}async function lc(e,t,r,n){t&&await e["memory.chat.update"]({convId:t.convId,n:t.n,blocks:[ac(r,n)]}).catch(()=>{})}var Hb="calendar.google.com",Ar=A.needsYou("sign_in"),nr=(e,t,r={})=>_t(e,{recipe:"calendar",step:t,args:r},Hb);function dc(e){let t=new Date(e.start);if(Number.isNaN(t.getTime()))return e.start;let r={weekday:"short",month:"short",day:"numeric"};return t.toLocaleString("en-US",e.allDay?r:{...r,hour:"numeric",minute:"2-digit"})}var Bb=[[/\b(new york|eastern|et|est|edt|boston|miami)\b/,"America/New_York"],[/\b(chicago|central|ct|cst|cdt|austin|dallas)\b/,"America/Chicago"],[/\b(denver|mountain|mt|mst|mdt)\b/,"America/Denver"],[/\b(los angeles|pacific|pt|pst|pdt|san francisco|seattle|california)\b/,"America/Los_Angeles"],[/\b(london|uk|bst)\b/,"Europe/London"],[/\b(utc|gmt)\b/,"UTC"]];function Fb(e){let t=e.toLowerCase();return/\b(time|zone|et|pt|ct|mt|est|pst|cst|mst|edt|pdt|cdt|mdt|utc|gmt|bst)\b/.test(t)?Bb.find(([r])=>r.test(t))?.[1]??null:null}async function Ub(e,t){let r=[];for(let n of er(e.fields.who??""))r.push(await tr(e,n,mn(n,t)));return r}async function $b(e,t,r){let n=new Set(r.map(o=>o.address));for(let o of t.filter(i=>!n.has(i.toLowerCase())))await pe(e,fe({step:0,site:e.view.site,line:A.allowSendTo(o),allowForTask:!1}),{verb:"type",role:"textbox",site:e.state.site})}async function uc(e){await de(e,x.STEP_LINES.openCalendar,"recipe");let t=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"event",plan:Ae(e.plan),names:er(e.fields.who??""),sensitive:!1}).catch(()=>rr(e.deps.now())),r=await Ub(e,t.people),n=Fb(e.line)??t.person.timeZone;await de(e,x.STEP_LINES.writeEvent);let o=await Ce(e,()=>e.deps.brain["memory.act.write"]({...e.actCall,request:{kind:"event",line:e.line,plan:Ae(e.plan),person:{...t.person,timeZone:n},style:t.style,facts:t.facts,samples:[],recipient:{name:r[0]?.name??"",address:r[0]?.address??""},source:""}}));if(!o.ok&&o.failure==="injected")return vt();if(!o.ok||o.written.kind!=="event")return ce(e.state.model);let i=o.written.event,s=[...new Set([...r.map(y=>y.address),...i.guests.map(y=>y.toLowerCase())])];await $b(e,s,r);let a=[Re(x.FIELD_LABELS.title,i.title),Re(x.FIELD_LABELS.when,dc(i)),...i.where?[Re(x.FIELD_LABELS.where,i.where)]:[],...s.length?[Re(x.FIELD_LABELS.guests,s.join(", "))]:[]],l=e.state.level==="review"&&!e.allowedForTask&&await pe(e,fe({step:0,site:e.view.site,line:x.ALLOW_SAVE_EVENT,fields:a,allowForTask:!0}),{verb:"click",role:"button",site:e.state.site})!=="stop",u=await on(e.deps.router,e.deps.chrome,"calendar");await e.event({type:"tab",tabId:u.tabId,groupId:u.groupId}),await qe(e,u.tabId);let p=Number(Ve(await nr(e,"account"),e.state.model,Ar).data.account??u.account)||0,d={title:i.title,start:i.start,end:i.end,zone:n,allDay:i.allDay,where:i.where,details:i.details};Ve(await nr(e,"open_editor",{account:p,...d}),e.state.model,Ar),s.length>0&&Ve(await nr(e,"guests",{guests:s}),e.state.model,Ar),Ve(await nr(e,"check",d),e.state.model,Ar),ee(e,{action:"type",role:"textbox",tier:"recipe",allowed:l,outcome:"held",byModel:!1}),await de(e,x.STEP_LINES.saveEvent);let f=Ve(await nr(e,"save",{guests:s,invite:s.length>0,confirmed:!0}),e.state.model,Ar);ee(e,{action:"click",role:"button",tier:"recipe",allowed:l,outcome:"held",byModel:!1});let h=await nr(e,"saved",{title:i.title}),w=typeof h.data.eventId=="string"?h.data.eventId:null;return e.undo=w?{kind:"event",eventId:w,account:p}:null,Na(i.title,dc(i),f.data.invited===!0,e.deps.now()+Q.undoMs)}var jb=new Set(["click","type","select","check"]);async function pc(e,t,r){let n=t.el??t.mark,o=n===null?void 0:r.elements.find(a=>a.n===n);if(o||!jb.has(t.action))return o??null;let i=dn(t.target,r.elements);if(i.length===0)return null;let s=await Ce(e,()=>e.deps.brain["memory.act.pick"]({...e.actCall,description:t.target,candidates:i}));return s.ok&&s.n!==null?r.elements.find(a=>a.n===s.n)??null:null}async function fc(e,t,r,n,o,i){if(t.action==="navigate"){let c=new Set([i,...n.elements.flatMap(l=>l.href?[l.href]:[])]);if(!t.url||!c.has(t.url))throw new X(vt())}let s=e.deps.policies.guard({step:t,element:r,snapshot:n,kind:e.state.kind,level:e.state.level,tier:e.state.tier,line:e.line,fields:e.fields,url:n.url,sites:o,blocked:e.blocked,named:lt(e.line),given:e.given,worker:e.state.worker!==null,allowedForTask:e.allowedForTask}),a={verb:t.action,role:r?.role??"",site:e.state.site};switch(s.kind){case"go":return!1;case"stop":throw new X(s.reason==="injection"||s.reason==="outside_vocabulary"?vt():Er(s.reason));case"confirm":return await pe(e,fe({step:0,site:e.view.site,line:Qa(s.why,t,e.view.site,s.address),allowForTask:!1}),a),!0;case"review":return await pe(e,fe({step:0,site:e.view.site,line:Za(t,r,e.view.site),allowForTask:!0}),a),!0}}function Gb(e){let t=e.changed;return t?[...t.added.map(r=>`+ ${r.text}`),...t.removed.map(r=>`- ${r.text}`),...t.text].join(`
`):""}async function mc(e,t,r){if(t.action==="navigate")return e.link?.close(),await e.deps.router.updateTab(e.state.tabId,{url:t.url}),!0;let n=r?{...t,el:r.n,mark:null}:t,o=await ue(e,"do",{step:n},ct.settle).catch(a=>{if(Ja(a))return{ran:!0,checked:null,navigated:!0};throw a});if(await ue(e,"settle",{afterNavigation:o.navigated},ct.settle).catch(()=>{}),!o.ran||o.checked===!1)return!1;if(o.checked===!0||o.navigated||!t.expect)return!0;let i=await ue(e,"snapshot",{step:e.state.step,steps:e.state.step,viewportOnly:!0}),s=await Ce(e,()=>e.deps.brain["memory.act.check"]({...e.actCall,expect:t.expect,diff:Gb(i)}));return!(s.ok&&s.verdict==="failed")}var hc=(e,t)=>{let r=Zt(t);return r===null||e.blocked.includes(r)};var ii=e=>e.elements.length===0||e.canvas===!0;async function gc(e,t){let r=e.deps.now(),n={steps:e.state.step,calls:e.calls,spentMicros:e.state.spentMicros,screenshots:e.state.screenshots};if(!e.budget.mayShoot(n,r))return null;let o=await e.deps.router.getTab(e.state.tabId);if(!o||!await e.deps.chrome.tabActive(e.state.tabId))return null;await ue(e,"marks",{show:!0,grid:ii(t)}),e.view={...e.view,hidden:!0},await e.redraw();try{let i=await e.deps.chrome.capture(o.windowId,70);return e.budget.shot(r),i&&await e.event({type:"screenshot"}),i}finally{e.view={...e.view,hidden:!1},await e.redraw(),await ue(e,"marks",{show:!1,grid:!1}).catch(()=>{})}}var zb="Your last two steps changed nothing. Try another way.",Wb=new Set(["click","type","select","check","key","scroll","navigate"]),Kb=new Set(["type","select","check"]);function Vb(e){let t=2166136261;for(let r of e.join(`
`))t=Math.imul(t^r.charCodeAt(0),16777619)>>>0;return t.toString(36)}async function qb(e){let t={steps:e.state.step,calls:e.calls,spentMicros:e.state.spentMicros,screenshots:e.state.screenshots},r=e.budget.ask(t);r&&(await pe(e,fe({step:0,site:e.view.site,line:A.KEEP_GOING_LINE,allowForTask:!1,choices:[A.KEEP_GOING]}),{verb:"ask",role:"",site:e.state.site}),e.budget.grant(r))}async function Xb(e,t){if(t.next==="end_stuck")throw new X(ce(e.state.model));return t.next==="ask"&&await pe(e,fe({step:0,site:e.view.site,line:A.KEEP_GOING_LINE,allowForTask:!1,choices:[A.KEEP_GOING]}),{verb:"ask",role:"",site:e.state.site}),{hint:t.next==="fresh_snapshot"?zb:"",tier:t.next==="tier_up"?"vision":"snapshot"}}async function Jb(e,t){switch(t.action){case"done":return Da(e.view.site.name,[]);case"fail":throw new X(ce(e.state.model));case"look":return"look";case"ask":{let r=(t.choices??[]).slice(0,We.choices).map(Qt),n=await pe(e,fe({step:0,site:e.view.site,line:Qt(t.question??""),allowForTask:!1,choices:r}),{verb:"ask",role:"",site:e.state.site});return e.notes.push(typeof n=="number"?`The person chose ${r[n]??""}`:"The person said go on"),null}case"extract":{let r=await ue(e,"read",{read:"text",section:t.what},ct.settle);return"main"in r&&e.notes.push(r.main.slice(0,We.extractChars)),null}case"wait":return t.for?await ue(e,"settle",{afterNavigation:!1},ct.settle):await new Promise(r=>setTimeout(r,Math.min(Math.max(t.ms??0,0),We.waitMs))),null;default:return null}}var Yb=(e,t,r,n)=>({url:e.url,signature:e.signature,action:t.action,target:t.target,held:r,notes:Vb(n)});async function Zb(e){if(e.state.kind!=="form_fill")return[];let t=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"form",plan:Ae(e.plan),names:[],sensitive:!1}).catch(()=>null),r=Object.entries(t?.form??{}).filter(([,n])=>n.trim()!=="");return e.given=r.map(([,n])=>n),r.map(([n,o])=>`The person's ${n.replace(/_/g," ")}: ${o}`.slice(0,We.noteChars))}async function si(e){await qe(e,e.state.tabId);let t=await Zb(e),r=(await e.deps.router.getTab(e.state.tabId))?.url??"",n=[Zt(r)].filter(l=>l!==null),o=[],i=[],[s,a,c]=[0,"","snapshot"];for(;;){await qb(e),await de(e,e.view.stepLine,c),await ue(e,"settle",{afterNavigation:!1},ct.settle).catch(()=>{});let l=await ue(e,"snapshot",{step:e.state.step,steps:Xr[e.state.model].steps,viewportOnly:c==="vision"});if(hc(e,l.url))throw new X(Er("blocked_site"));let u=l.findings.find(b=>b.el===null&&(b.reason==="captcha"||b.reason==="sign_in"));if(u)throw new X(Er(u.reason));let p={goal:e.plan.target||e.line,line:e.line,plan:Ae(e.plan),notes:[...t,...e.notes.slice(-8)],history:i.slice(-6),hint:a,page:l.text},d=c==="vision"?await gc(e,l):null,f=await Ce(e,()=>d?e.deps.brain["memory.act.see"]({...e.actCall,request:{...p,marks:l.elements.filter(b=>b.inView).length,grid:ii(l)},image:d}):e.deps.brain["memory.act.step"]({...e.actCall,request:p}));[a,c]=["","snapshot"];let h=f.ok?f.step:Bs("wait"),w=f.ok;if(f.ok){e.view={...e.view,stepLine:h.action==="look"?x.STEP_LINES.look:Qt(h.target)};let b=await Jb(e,h);if(b==="look")c="vision";else if(b)return b;if(Wb.has(h.action)){let v=await pc(e,h,l);if(v&&Kb.has(h.action)&&e.deps.policies.skip(v)){e.notes.push("Skipped an equal opportunity question; leave it empty."),ee(e,{action:h.action,role:v.role,tier:"snapshot",allowed:!1,outcome:"refused",byModel:!0});continue}let E=await fc(e,h,v,l,n,r);w=await mc(e,h,v),ee(e,{action:h.action,role:v?.role??"",tier:d?"vision":"snapshot",allowed:E,outcome:w?"held":"failed_check",byModel:!0})}h.note&&e.notes.push(h.note.slice(0,We.noteChars))}o.push(Yb(l,h,w,e.notes)),i.push({step:e.state.step,action:h.action,target:h.target.slice(0,80),held:w});let y=e.deps.policies.loop(o,s);y.trouble&&(s+=1,{hint:a,tier:c}=await Xb(e,y))}}var bc=/^cori_[a-z0-9]{8,32}$/;var Qb="cori",ew="chat";function wc(e,t){let r=new URL(e);return r.searchParams.set("tab",Qb),bc.test(t)&&r.searchParams.set(ew,t),r.toString()}var tw=new Set(["delete_draft","undo_send","delete_event","undo"]);function rw(e,t){switch(e.kind){case"draft":return{recipe:"gmail",step:"discard",args:{subject:t??e.subject,account:e.account}};case"send":return{recipe:"gmail",step:"undo_send",args:{}};case"event":return{recipe:"calendar",step:"delete",args:{eventId:e.eventId,title:t??"",account:e.account}};case"rewrite":return{recipe:e.recipe,step:"undo",args:{}}}}var nw=e=>e.filter(t=>!tw.has(t));async function yc(e,t){let r=e.view.result;if(!e.undo||!r||r.undoUntil===null||t>r.undoUntil)return!1;let n=e.undo;e.undo=null;let o=n.kind==="event"?r.lines[0]??null:null,i=await e.deps.router.getTab(e.state.tabId),s={held:!1,fail:"wrong_state",data:{}};return i&&(s=await _t(e,rw(n,o),He(i.url??"")??"",!0).catch(()=>s)),e.view={...e.view,result:{...r,chips:nw(r.chips),undoUntil:null}},s.held}async function xc(e,t){let r=e.deps.router,n=t.origin===null?null:await r.getTab(t.origin);if(n){await r.updateTab(n.id,{active:!0}).catch(()=>{}),await r.focusWindow(n.windowId).catch(()=>{});return}await ow(r,t.state.convId)}async function ow(e,t){let r=wc(e.getURL("console.html"),t),n=(await e.pageTabs()).find(o=>o.documentUrl?.startsWith(e.getURL("console.html")));if(!n){await e.createTab(r,{active:!0});return}await e.updateTab(n.tabId,{active:!0,url:r}).catch(()=>{}),await e.focusWindow(n.windowId).catch(()=>{})}async function vc(e,t){let r=e.session(t);if(!r)return!1;let n=await yc(r,e.deps.now());return e.publish(r),await r.redraw(),n}async function kc(e,t,r){if(r.type==="navigated")return;if(r.type==="rewrite"){r.end&&le(t.state)&&t.pressRewrite(r.end==="accepted"?"page_accepted":"page_reverted");return}if(r.type==="person"){le(t.state)&&t.state.status!=="taken_over"&&await t.takeOver();return}let n=r.press;if(n.kind==="card"){t.answer(n.step,n.choice,n.edited);return}if(n.kind==="bar"){n.button==="take_over"?await t.takeOver():n.button==="hand_back"?await t.handBack():n.button==="stop"?t.stop("person"):await xc(e,t);return}if(le(t.state)){t.pressRewrite(n.button);return}n.button==="undo"&&await vc(e,t.state.runId),(n.button==="close"||n.button==="undo")&&(t.view={...t.view,rewrite:null},await t.redraw(),t.link?.close())}var iw=50,sw=320,hn=class{constructor(t){this.send=t}timers=new Map;watch(t,r){let n=t.state.runId;clearInterval(this.timers.get(n)),this.timers.delete(n),!(!r||!le(t.state))&&(this.take(t),this.timers.set(n,setInterval(()=>le(t.state)?void this.take(t):this.watch(t,!1),Q.taskPreviewMs)))}stopAll(){for(let t of this.timers.values())clearInterval(t);this.timers.clear()}async take(t){let r=await t.deps.router.getTab(t.state.tabId);if(!r)return;let o=await t.deps.chrome.tabActive(t.state.tabId)?await t.deps.chrome.capture(r.windowId,iw):await this.sketch(t);o&&this.send({runId:t.state.runId,worker:t.state.worker,image:o,at:t.deps.now()})}async sketch(t){return t.link?.isOpen?(await ue(t,"picture",{width:sw},5e3,!0).catch(()=>null))?.dataUrl??null:null}};function _c(e,t,r,n){let o=e.length,i=t.length,s=o+i,a=s+1,c=new Int32Array(2*s+3),l=[],u=-1;for(let p=0;p<=Math.min(s,n);p++){l.push(c.slice(a-p-1,a+p+2));for(let d=-p;d<=p;d+=2){let h=d===-p||d!==p&&c[a+d-1]<c[a+d+1]?c[a+d+1]:c[a+d-1]+1,w=h-d;for(;h<o&&w<i&&r(e[h],t[w]);)h++,w++;if(c[a+d]=h,h>=o&&w>=i){u=p;break}}if(u>=0)break}return u<0?null:aw(l,o,i)}function aw(e,t,r){let n=[],o=t,i=r;for(let s=e.length-1;s>=0;s--){let a=e[s],c=s+1,l=o-i,u=l===-s||l!==s&&a[c+l-1]<a[c+l+1],p=u?l+1:l-1,d=s===0?0:a[c+p],f=s===0?0:d-p;for(;o>d&&i>f;)o--,i--,n.push({kind:"keep",a:o,b:i});s>0&&(u?n.push({kind:"add",a:o,b:--i}):n.push({kind:"remove",a:--o,b:i}))}return n.reverse()}var cw=/([\p{L}\p{M}\p{N}]+(?:['’ʼ-][\p{L}\p{M}\p{N}]+)*)|(\s+)|([\s\S])/gu;function gn(e){let t=[];for(let r of e.matchAll(cw)){let n=r.index;t.push({text:r[0],start:n,end:n+r[0].length,kind:r[1]?"word":r[2]?"space":"mark"})}return t}var ai=8e3,lw=1500,Sc=(e,t)=>[{before:{start:0,end:e.length},after:{start:0,end:t.length},old:e,now:t}];function It(e,t,r=!0){if(e===t)return[];if(e.length>ai||t.length>ai)return Sc(e,t);let n=gn(e),o=gn(t),i=_c(n,o,(u,p)=>u.text===p.text,lw);if(!i)return Sc(e,t);let s=[],a=null,c=0,l=0;for(let u of i){if(u.kind==="keep"){a&&s.push(a),a=null,c=u.a+1,l=u.b+1;continue}a??={a0:c,a1:c,b0:l,b1:l},u.kind==="remove"?a.a1=c=u.a+1:a.b1=l=u.b+1}return a&&s.push(a),(r?dw(s,n,o):s).map(u=>uw(u,n,o,e,t))}function dw(e,t,r){let n=[];for(let o of e){let i=n[n.length-1],s=i?o.a0-i.a1:-1,a=i?o.b0-i.b1:-1;i&&s===1&&a===1&&t[i.a1]?.kind==="space"&&r[i.b1]?.kind==="space"?(i.a1=o.a1,i.b1=o.b1):n.push({...o})}return n}function Ec(e,t,r,n){let o=t<e.length?e[t].start:n,i=r>t?e[r-1].end:o;return{start:o,end:i}}function uw(e,t,r,n,o){let i=Ec(t,e.a0,e.a1,n.length),s=Ec(r,e.b0,e.b1,o.length);return{before:i,after:s,old:n.slice(i.start,i.end),now:o.slice(s.start,s.end)}}var Ac=["rewrite","improve","grammar"],pw=/\b(grammar|grammatical|spelling|spell ?check|typos?|punctuation|proofread\w*)\b/i,Cc=/\b(improve|polish|clean (?:it |this |that )?up|clearer|tighten|refine|better)\b/i,Rc=/\b(rewrite|re-write|reword|rephrase|paraphrase|shorter|longer|formal|casual|friendlier|simpler)\b/i,fw=/\b(only|just)\b/i,Tc=e=>typeof e=="string"&&Ac.includes(e);function ci(e,t){let r=t.find(s=>s.name==="mode")?.value;if(Tc(r))return r;let n=[e,...t.filter(s=>s.name==="how").map(s=>s.value)].join(" ").trim();if(n==="")return null;let o=pw.test(n),i=Cc.test(n)||Rc.test(n);return o&&(fw.test(n)||!i)?"grammar":Cc.test(n)&&!Rc.test(n)?"improve":"rewrite"}var li={rewrite:"Rewrite this in my voice. Keep its meaning, names and numbers.",improve:"Improve this: clearer and smoother, in my voice. Keep its meaning, names and numbers.",grammar:"Fix only the spelling, grammar and punctuation. Keep every other word and the word order."};async function we(e,t){e.view={...e.view,rewrite:t},await e.redraw(),e.deps.publish(e)}var di=10*6e4,mw=new Set(["go_back","undo"]),Pc=new Set(["looks_good","yes","page_accepted","accept"]);async function hw(e){let t=null,r=new Promise(n=>t=setTimeout(()=>n("page_accepted"),di));try{for(;;){let n=await Promise.race([e.waitForRewrite(),r]);if(mw.has(n)||Pc.has(n)||n==="page_reverted")return n}}finally{t&&clearTimeout(t)}}async function bn(e,t,r){let n=r.readable?await t("show_changes"):null,o=typeof n?.data.changes=="number"?n.data.changes:0;await we(e,{state:r.readable?"review":"check",original:r.source,rewrite:r.text,undoLeft:null,mode:r.mode,changes:o});let i=await hw(e);if(i==="page_reverted")return await t("end_preview"),await we(e,null),xt("kept");if(Pc.has(i))return await t("end_preview"),await we(e,null),xt("rewritten");let s=await t("go_back");return await we(e,null),ee(e,{action:"type",role:"textbox",tier:"recipe",allowed:!0,outcome:s.held?"held":"failed_check",byModel:!1}),s.held?xt("kept"):ce(e.state.model,[],!1)}var gw=12;async function ui(e,t,r){let n=It(r.source,r.text).map(a=>({old:a.old.trim(),now:a.now.trim()})).filter(a=>a.old||a.now).slice(0,gw);await t("watch_paste",{text:r.text});let o={original:r.source,rewrite:r.text,undoLeft:null,mode:r.mode,edits:n};await we(e,{state:"paste",...o});let i=null,s=new Promise(a=>i=setTimeout(()=>a("close"),di));try{for(;;){let a=await Promise.race([e.waitForRewrite(),s]);if(a==="copy")await t("focus_text"),await we(e,{state:"copied",...o});else{if(a==="pasted")return ee(e,{action:"type",role:"textbox",tier:"recipe",allowed:!0,outcome:"held",byModel:!1}),await bn(e,t,{source:r.source,text:r.text,mode:r.mode,readable:!0});if(a==="close")return await we(e,null),xt("kept")}}}finally{i&&clearTimeout(i)}}var bw={mode_rewrite:"rewrite",mode_improve:"improve",mode_grammar:"grammar"},ww=(e,t)=>({...e,fields:[...e.fields.filter(r=>r.name!=="mode"),{name:"mode",value:t}]}),wn=(e,t,r,n={})=>({state:e,original:t,rewrite:"",undoLeft:null,mode:r,...n});async function yw(e,t){let r=ci(e.line,e.plan.fields);if(r)return r;for(await we(e,wn("picker",t,null));;){let n=await e.waitForRewrite(),o=bw[n];if(o)return o;if(n==="close")throw e.stop("person"),new oe("person")}}async function Ic(e){let t=(await e.deps.router.getTab(e.state.tabId))?.url??"",r=Va(t)==="docs"?"docs":"field",n=He(t)??"",o=(h,w={})=>_t(e,{recipe:r,step:h,args:w},n);await qe(e,e.state.tabId),await de(e,x.REWRITING,"recipe");let i=await o("read_selection");if(!i.held&&i.fail==="no_selection"&&i.data.ask==="copy"&&(await we(e,wn("working","",null)),i=await o("read_selection",{waitCopyMs:xw})),!i.held||typeof i.data.text!="string")throw ei(i,e.state.model,"");let s=i.data.text,a=await yw(e,s);await we(e,wn("working",s,a));let c=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"rewrite",plan:Ae(e.plan),names:[],sensitive:!1}).catch(()=>rr(e.deps.now())),l=a==="grammar"?{...e.actCall,model:"bolt"}:e.actCall,u=e.line.trim()||li[a],p=await Ce(e,()=>e.deps.brain["memory.act.write"]({...l,request:{kind:"rewrite",line:u,plan:ww(Ae(e.plan),a),person:c.person,style:c.style,facts:[],samples:[],recipient:{name:"",address:""},source:s}}));if(!p.ok||p.written.kind!=="rewrite")return ce(e.state.model);let d=p.written.rewrite.text;if(d===s)return await we(e,wn("none",s,a)),await Promise.race([new Promise(h=>setTimeout(h,vw)),e.waitForRewrite().catch(()=>{})]),await we(e,null),xt("kept",[x.NOTHING_TO_CHANGE]);if(i.data.via==="person_copy")return ui(e,o,{source:s,text:d,mode:a});let f=await o("replace_selection",{text:d});return f.fail==="not_replaced"?ui(e,o,{source:s,text:d,mode:a}):(Ve(f,e.state.model,""),ee(e,{action:"type",role:"textbox",tier:"recipe",allowed:!0,outcome:"held",byModel:!1}),bn(e,o,{source:s,text:d,mode:a,readable:(await o("check_replace")).held}))}var xw=25e3,vw=4e3;var yn=class{constructor(t,r,n){this.startedAt=r;this.counted=n;this.base=Xr[t]}base;grants={steps:0,calls:0,spend:0};lastShot=Number.NEGATIVE_INFINITY;ask(t){return this.counted.steps&&t.steps>=this.base.steps*(1+this.grants.steps)?"steps":t.calls>=this.base.calls*(1+this.grants.calls)?"calls":t.spentMicros>=this.base.askAtMicros*(1+this.grants.spend)?"spend":null}grant(t){this.grants={...this.grants,[t]:this.grants[t]+1}}overWall(t){return t-this.startedAt>=this.base.wallMs}get callMs(){return this.base.callMs}mayShoot(t,r){return t.screenshots<this.base.screenshots&&r-this.lastShot>=Q.screenshotGapMs}shot(t){this.lastShot=t}};var pi={email_draft:qa,calendar_add:Xa},kw={email_draft:"https://mail.google.com",calendar_add:"https://calendar.google.com"};async function _w(e,t,r,n){let o=pi[t];if(o)return n.blocked.includes(kw[t])?"blocked_site":{site:o,tabId:r.origin??0,tier:"recipe"};if(r.tabId===null)return"no_permission";let i=await e.deps.router.getTab(r.tabId),s=Zt(i?.url??"");return!i||s===null?"no_permission":n.blocked.includes(s)?"blocked_site":{site:Wa(i.url??""),tabId:i.id,tier:t==="text_rewrite"?"recipe":"snapshot"}}async function Mc(e,t,r){let n=t.plan.kind,o=await _w(e,n,t,r);if(typeof o=="string")return{refused:o};let i=pi[n]!==void 0;if(e.live().some(p=>i?p.state.kind===n:p.state.tabId===o.tabId&&pi[p.state.kind]===void 0))return{refused:"busy"};let a=e.deps.now(),c=t.model??r.model,l=ja({runId:t.runId,kind:n,site:o.site.name,tabId:o.tabId,convId:t.convId,level:r.level,model:c,tier:o.tier,now:a}),u=new fn({router:e.deps.router,chrome:e.deps.chrome,hub:e.hub,store:e.store,brain:e.deps.brain,policies:e.deps.policies,audit:e.audit,publish:p=>e.publish(p),onPageEvent:(p,d)=>e.pageEvent(p,d),now:()=>e.deps.now()},l,Ga(o.site,n==="text_rewrite"),t.line,t.plan,new yn(c,a,{steps:!i&&n!=="text_rewrite"}),t.origin);return u.blocked=r.blocked,{session:u}}var fi="coere.actions.runs",Sw=["running","waiting","taken_over","done","stopped","stuck"],Ew=["recipe","snapshot","vision"],mi=e=>typeof e=="string"&&e.length<=200,Cw=e=>e===null||vr(e);function Rw(e){if(e===null)return null;if(!(!G(e)||!be(Ds,e.verb)||!mi(e.role)||!mi(e.site)))return{verb:e.verb,role:e.role,site:e.site}}function Aw(e){if(!G(e)||!vr(e.runId)||!vr(e.convId)||!Cw(e.parentId)||!be($s,e.kind)||!mi(e.site)||!nn(e.tabId)||!(e.groupId===null||typeof e.groupId=="number")||!(e.worker===null||kr(e.worker))||!be(zo,e.level)||!be(Wo,e.model)||!be(Sw,e.status)||!be(Ew,e.tier)||![e.step,e.spentMicros,e.screenshots,e.startedAt].every(kr))return null;let t=Rw(e.pending);return t===void 0?null:{runId:e.runId,kind:e.kind,site:e.site,tabId:e.tabId,groupId:e.groupId,parentId:e.parentId,worker:e.worker,convId:e.convId,level:e.level,model:e.model,step:e.step,tier:e.tier,status:e.status,pending:t,spentMicros:e.spentMicros,screenshots:e.screenshots,startedAt:e.startedAt}}var xn=class{constructor(t){this.area=t}chain=Promise.resolve();async all(){let t=(await this.area.get(fi))[fi];return G(t)?Object.values(t).flatMap(r=>Aw(r)??[]):[]}async get(t){return(await this.all()).find(r=>r.runId===t)??null}put(t){return this.edit(r=>r.set(t.runId,t))}drop(t){return this.edit(r=>r.delete(t))}edit(t){let r=this.chain.then(async()=>{let n=new Map((await this.all()).map(o=>[o.runId,o]));t(n),await this.area.set({[fi]:Object.fromEntries(n)})});return this.chain=r.catch(()=>{}),r}};var Tw={email_draft:ic,calendar_add:uc,text_rewrite:Ic,form_fill:si,page_click:si},vn=class{constructor(t){this.deps=t;this.store=new xn(t.router.sessionArea),this.audit=new cn(t.brain),this.previews=new hn(r=>this.broadcast({ch:"coere",type:"actions.preview",...r},null))}hub=new an;store;audit;sessions=new Map;requests=new Map;held=new Map;turns=new Map;previews;session(t){return this.sessions.get(t)}live(){return[...this.sessions.values()].filter(t=>le(t.state))}async start(t){let r=_a((await this.deps.router.localArea.get(Sr))[Sr]);if(!r.on)return this.held.set(t.runId,t),{started:!1,refused:"off"};let n=Tw[t.plan.kind];if(!n)return{started:!1,refused:"not_ready"};if(t.plan.kind==="email_draft"||t.plan.kind==="calendar_add"){let s=t.plan.kind==="email_draft"?Ko[0]:Ko[1];if(!await this.deps.chrome.granted([s]))return{started:!1,refused:"no_permission"}}let o=await Mc(this,t,r);if("refused"in o)return{started:!1,refused:o.refused};let i=o.session;return this.sessions.set(t.runId,i),this.requests.set(t.runId,t),await this.store.put(i.state),this.audit.run(ln(i.state,null,null),t.plan.call??null),this.deps.history&&this.turns.set(t.runId,cc(this.deps.history,i.state)),this.publish(i),sc(this,i,n),{started:!0,state:i.state}}broadcast(t,r){this.deps.router.broadcast(t).catch(()=>{}),r!==null&&this.deps.router.sendToTab(r,t).catch(()=>{})}publish(t){this.broadcast({ch:"coere",type:"actions.state",state:t.state,task:ri(t.state,t.view),card:ti(t.state,t.view),result:t.view.result,grid:null},t.origin)}pageEvent(t,r){kc(this,t,r)}writeEnd(t,r){let n=this.deps.history,o=this.turns.get(t.state.runId);return n&&o&&o.then(i=>lc(n,i,t.state,r)),this.audit.run(ln(t.state,r,this.deps.now()))}forget(t,r=Q.undoMs){setTimeout(()=>{this.sessions.delete(t),this.requests.delete(t),this.turns.delete(t),this.store.drop(t)},r)}stop(t,r){let n=this.sessions.get(t);return!n||!le(n.state)?!1:(n.stop(r),!0)}stopAll(t){for(let r of this.live())r.stop(t)}tabClosed(t){for(let r of this.live())r.state.tabId===t&&r.stop("tab_closed")}request(t){return this.requests.get(t)}takeHeld(t){let r=this.held.get(t);return this.held.delete(t),r}hasHeld(t){return this.held.has(t)}async recover(){for(let t of await this.store.all()){if(!le(t)){await this.store.drop(t.runId);continue}let r=pn(t,{type:"restarted"}),n=Ee("restarted");await this.store.put(r),this.audit.run(ln(r,n,this.deps.now())),this.broadcast({ch:"coere",type:"actions.state",state:r,task:{runId:r.runId,site:Ka(r.site),status:r.status,step:"",preview:null,result:n},card:null,result:n,grid:null},null),this.forget(r.runId,Q.resultBarMs)}}get(t){let r=this.sessions.get(t);return r?{state:r.state,task:ri(r.state,r.view),card:ti(r.state,r.view),grid:null}:null}};var Lc={guard:Ro,loop:To,skip:Ao};var kn=class{constructor(t){this.tabs=t}byId=new Map;failing=!1;next=500;join(t,r){if(this.failing)throw new Error("fake tabs.group failed");if(r!==null&&!this.byId.has(r))throw new Error(`No group with id: ${r}.`);let n=r??this.next++;return r===null&&this.byId.set(n,{id:n,windowId:t.windowId}),t.groupId!==n&&this.leave(t),t.groupId=n,n}windowOf(t){return this.byId.get(t)?.windowId??null}look(t,r){if(this.failing)throw new Error("fake tabGroups.update failed");let n=this.byId.get(t);if(!n)throw new Error(`No group with id: ${t}.`);Object.assign(n,r)}leave(t){let r=t.groupId;t.groupId=null,this.dropIfEmpty(r)}dropIfEmpty(t){t!==null&&!this.tabs.some(r=>r.groupId===t)&&this.byId.delete(t)}};function Oc(e){let t=r=>typeof r=="string"?[r]:r;return{get:async r=>Object.fromEntries(t(r).flatMap(n=>e.has(n)?[[n,JSON.parse(JSON.stringify(e.get(n)))]]:[])),set:async r=>{for(let[n,o]of Object.entries(r))e.set(n,JSON.parse(JSON.stringify(o)))},remove:async r=>{for(let n of t(r))e.delete(n)}}}var _n=class{extensionId="fakeextensionidaaaaaaaaaaaaaaaaa";tabs=[];session=new Map;local=new Map;sentToTabs=[];broadcasts=[];focused=[];created=[];reloaded=[];removed=[];tabGroups=new kn(this.tabs);answers=new Map;activeId;deaf=new Set;windows=[1];failCreate=!1;popup="popup.html";popupCalls=[];failSetPopup=!1;popupOpens=0;failOpenPopup=!1;t=1e6;nextId=100;sessionArea=Oc(this.session);localArea=Oc(this.local);getURL(t){return`chrome-extension://${this.extensionId}/${t}`}now(){return this.t}async pageTabs(){let t=`chrome-extension://${this.extensionId}/`;return this.tabs.filter(r=>r.url.startsWith(t)).map(r=>({tabId:r.id,windowId:r.windowId,documentUrl:r.url}))}async broadcast(t){this.broadcasts.push(t)}async createTab(t,r={}){if(this.failCreate)throw new Error("fake tabs.create failed");this.created.push({url:t,options:r});let n={id:this.nextId++,windowId:r.windowId??1,url:t,active:r.active??!0,discarded:!1,frozen:!1,autoDiscardable:!0,groupId:null};if(n.active){for(let o of this.tabs)o.active=!1;this.activeId=n.id}return this.tabs.push(n),{id:n.id,windowId:n.windowId}}async updateTab(t,r){let n=this.tab(t);if(r.url&&(n.url=r.url),r.autoDiscardable!==void 0&&(n.autoDiscardable=r.autoDiscardable),r.active){for(let o of this.tabs)o.active=o===n;this.activeId=n.id}return{id:n.id,windowId:n.windowId}}async getTab(t){let r=this.tabs.find(n=>n.id===t);return r?{id:r.id,windowId:r.windowId,...r.url?{url:r.url}:{},...r.pendingUrl?{pendingUrl:r.pendingUrl}:{},...r.loading?{loading:!0}:{},discarded:r.discarded,frozen:r.frozen}:null}async reloadTab(t){this.tab(t).discarded=!1,this.reloaded.push(t)}async removeTab(t){let{groupId:r}=this.tab(t);this.tabs.splice(this.tabs.findIndex(n=>n.id===t),1),this.removed.push(t),this.tabGroups.dropIfEmpty(r)}get groups(){return this.tabGroups.byId}set failGroups(t){this.tabGroups.failing=t}async groupTab(t,r){return this.tabGroups.join(this.tab(t),r)}async groupWindow(t){return this.tabGroups.windowOf(t)}async updateGroup(t,r){this.tabGroups.look(t,r)}async normalWindows(){return[...this.windows]}async undiscardableTabs(t){let r=t.map(n=>new URL(n.replace("/*","/")).host);return this.tabs.filter(n=>!n.autoDiscardable&&n.url.startsWith("https://")&&r.includes(new URL(n.url).host)).map(n=>n.id)}async focusWindow(t){this.focused.push(t)}async activeTabId(){return this.activeId}async sendToTab(t,r){if(this.deaf.has(t)||!this.tabs.some(n=>n.id===t))throw new Error("Could not establish connection. Receiving end does not exist.");return this.sentToTabs.push({tabId:t,message:r}),this.answers.get(t)?.(r)}async sessionGet(t){return this.session.get(t)}async sessionSet(t,r){this.session.set(t,r)}async setActionPopup(t){if(this.failSetPopup)throw new Error("fake action.setPopup failed");this.popupCalls.push(t),this.popup=t}async openActionPopup(){if(this.failOpenPopup)throw new Error("fake action.openPopup failed");this.popupOpens++}openSite(t){let r=this.nextId++;return this.tabs.push({id:r,windowId:1,url:t,active:!1,discarded:!1,frozen:!1,autoDiscardable:!0,groupId:null}),r}ungroup(t){this.tabGroups.leave(this.tab(t))}tab(t){let r=this.tabs.find(n=>n.id===t);if(!r)throw new Error(`No tab with id: ${t}.`);return r}};var Pw=["read","snapshot","do","settle","marks","overlay","recipe","picture"],Iw=e=>G(e)&&typeof e.id=="string"&&Pw.includes(e.type)?e:null,Mw=e=>e.visible&&(e.bar.mode==="working"||e.bar.mode==="waiting");function Nc(e){let t=e.connect(),r=!0,n=null,o=null,i=0,s=new Map,a=p=>{r&&t.postMessage(p)},c=p=>{n??=e.overlay(f=>a({type:"press",press:f})),n.draw(p);let d=Mw(p);d&&!o&&(o=e.watchPerson(f=>a({type:"person",input:f}))),!d&&o&&(o(),o=null)};async function l(p){if(p.type==="overlay")return c(p.state),{id:p.id,ok:!0,type:"overlay",result:{drawn:!0}};if(p.type!=="recipe")return e.kit.handle(p);if(!e.recipes)return{id:p.id,ok:!1,type:"recipe",error:"refused"};try{return{id:p.id,ok:!0,type:"recipe",result:await e.recipes(p.call)}}catch{return{id:p.id,ok:!1,type:"recipe",error:"internal"}}}let u=()=>{if(r){r=!1,o?.(),n?.remove(),e.kit.dispose();for(let p of s.values())p(null);s.clear()}};return t.onMessage.addListener(p=>{if(G(p)&&p.type==="picked"&&typeof p.id=="string"){s.get(p.id)?.(typeof p.n=="number"?p.n:null),s.delete(p.id);return}let d=Iw(p);d&&l(d).then(a)}),t.onDisconnect.addListener(u),{emit:a,pick(p,d){let f=dn(p,d);if(!r||f.length===0)return Promise.resolve(null);let h=`k${++i}`,w={type:"pick",id:h,description:p,candidates:f};return new Promise(y=>{s.set(h,y),a(w)})},stop(){try{t.disconnect()}catch{}u()}}}var In,P,Uc,Lw,St,Dc,$c,jc,hi,En,Tr,Gc,wi,gi,bi,Ow,An={},Tn=[],Nw=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Mn=Array.isArray;function ut(e,t){for(var r in t)e[r]=t[r];return e}function yi(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Be(e,t,r){var n,o,i,s={};for(i in t)i=="key"?n=t[i]:i=="ref"?o=t[i]:s[i]=t[i];if(arguments.length>2&&(s.children=arguments.length>3?In.call(arguments,2):r),typeof e=="function"&&e.defaultProps!=null)for(i in e.defaultProps)s[i]===void 0&&(s[i]=e.defaultProps[i]);return Cn(e,s,n,o,null)}function Cn(e,t,r,n,o){var i={type:e,props:t,key:r,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Uc,__i:-1,__u:0};return o==null&&P.vnode!=null&&P.vnode(i),i}function L(e){return e.children}function Rn(e,t){this.props=e,this.context=t}function Mt(e,t){if(t==null)return e.__?Mt(e.__,e.__i+1):null;for(var r;t<e.__k.length;t++)if((r=e.__k[t])!=null&&r.__e!=null)return r.__e;return typeof e.type=="function"?Mt(e):null}function Dw(e){if(e.__P&&e.__d){var t=e.__v,r=t.__e,n=[],o=[],i=ut({},t);i.__v=t.__v+1,P.vnode&&P.vnode(i),xi(e.__P,i,t,e.__n,e.__P.namespaceURI,32&t.__u?[r]:null,n,r??Mt(t),!!(32&t.__u),o),i.__v=t.__v,i.__.__k[i.__i]=i,qc(n,i,o),t.__e=t.__=null,i.__e!=r&&zc(i)}}function zc(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),zc(e)}function Hc(e){(!e.__d&&(e.__d=!0)&&St.push(e)&&!Pn.__r++||Dc!=P.debounceRendering)&&((Dc=P.debounceRendering)||$c)(Pn)}function Pn(){try{for(var e,t=1;St.length;)St.length>t&&St.sort(jc),e=St.shift(),t=St.length,Dw(e)}finally{St.length=Pn.__r=0}}function Wc(e,t,r,n,o,i,s,a,c,l,u){var p,d,f,h,w,y,b=n&&n.__k||Tn,v=t.length;for(c=Hw(r,t,b,c,v),p=0;p<v;p++)(f=r.__k[p])!=null&&(d=f.__i!=-1&&b[f.__i]||An,f.__i=p,y=xi(e,f,d,o,i,s,a,c,l,u),h=f.__e,f.ref&&d.ref!=f.ref&&(d.ref&&vi(d.ref,null,f),u.push(f.ref,f.__c||h,f)),w==null&&h!=null&&(w=h),4&f.__u?(c=Kc(f,c,e),d.__e&&(d.__e=null)):typeof f.type=="function"&&y!==void 0?c=y:h&&(c=h.nextSibling),f.__u&=-7);return r.__e=w,c}function Hw(e,t,r,n,o){var i,s,a,c,l,u=r.length,p=u,d=0;for(e.__k=new Array(o),i=0;i<o;i++)(s=t[i])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[i]=Cn(null,s,null,null,null):Mn(s)?s=e.__k[i]=Cn(L,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[i]=Cn(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[i]=s,c=i+d,s.__=e,s.__b=e.__b+1,a=null,(l=s.__i=Bw(s,r,c,p))!=-1&&(p--,(a=r[l])&&(a.__u|=2)),a==null||a.__v==null?(l==-1&&(o>u?d--:o<u&&d++),typeof s.type!="function"&&(s.__u|=4)):l!=c&&(l==c-1?d--:l==c+1?d++:(l>c?d--:d++,s.__u|=4))):e.__k[i]=null;if(p)for(i=0;i<u;i++)(a=r[i])!=null&&(2&a.__u)==0&&(a.__e==n&&(n=Mt(a)),Jc(a,a));return n}function Kc(e,t,r){var n,o;if(typeof e.type=="function"){for(n=e.__k,o=0;n&&o<n.length;o++)n[o]&&(n[o].__=e,t=Kc(n[o],t,r));return t}e.__e!=t&&(t&&e.type&&!t.parentNode&&(t=Mt(e)),t=r.insertBefore(e.__e,t||null));do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Bw(e,t,r,n){var o,i,s,a=e.key,c=e.type,l=t[r],u=l!=null&&(2&l.__u)==0;if(l===null&&a==null||u&&a==l.key&&c==l.type)return r;if(n>(u?1:0)){for(o=r-1,i=r+1;o>=0||i<t.length;)if((l=t[s=o>=0?o--:i++])!=null&&(2&l.__u)==0&&a==l.key&&c==l.type)return s}return-1}function Bc(e,t,r){t[0]=="-"?e.setProperty(t,r??""):e[t]=r==null?"":typeof r!="number"||Nw.test(t)?r:r+"px"}function Sn(e,t,r,n,o){var i,s;e:if(t=="style")if(typeof r=="string")e.style.cssText=r;else{if(typeof n=="string"&&(e.style.cssText=n=""),n)for(t in n)r&&t in r||Bc(e.style,t,"");if(r)for(t in r)n&&r[t]==n[t]||Bc(e.style,t,r[t])}else if(t[0]=="o"&&t[1]=="n")i=t!=(t=t.replace(Gc,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+i]=r,r?n?r[Tr]=n[Tr]:(r[Tr]=wi,e.addEventListener(t,i?bi:gi,i)):e.removeEventListener(t,i?bi:gi,i);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=r??"";break e}catch{}typeof r=="function"||(r==null||r===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&r==1?"":r))}}function Fc(e){return function(t){if(this.l){var r=this.l[t.type+e];if(t[En]==null)t[En]=wi++;else if(t[En]<r[Tr])return;return r(P.event?P.event(t):t)}}}function xi(e,t,r,n,o,i,s,a,c,l){var u,p,d,f,h,w,y,b,v,E,T,$,W,Z,U,se,ae=t.type;if(t.constructor!==void 0)return null;128&r.__u&&(c=!!(32&r.__u),i=[a=t.__e=r.__e]),(u=P.__b)&&u(t);e:if(typeof ae=="function"){p=s.length;try{if(v=t.props,E=ae.prototype&&ae.prototype.render,T=(u=ae.contextType)&&n[u.__c],$=u?T?T.props.value:u.__:n,r.__c?b=(d=t.__c=r.__c).__=d.__E:(E?t.__c=d=new ae(v,$):(t.__c=d=new Rn(v,$),d.constructor=ae,d.render=Uw),T&&T.sub(d),d.state||(d.state={}),d.__n=n,f=d.__d=!0,d.__h=[],d._sb=[]),E&&d.__s==null&&(d.__s=d.state),E&&ae.getDerivedStateFromProps!=null&&(d.__s==d.state&&(d.__s=ut({},d.__s)),ut(d.__s,ae.getDerivedStateFromProps(v,d.__s))),h=d.props,w=d.state,d.__v=t,f)E&&ae.getDerivedStateFromProps==null&&d.componentWillMount!=null&&d.componentWillMount(),E&&d.componentDidMount!=null&&d.__h.push(d.componentDidMount);else{if(E&&ae.getDerivedStateFromProps==null&&v!==h&&d.componentWillReceiveProps!=null&&d.componentWillReceiveProps(v,$),t.__v==r.__v||!d.__e&&d.shouldComponentUpdate!=null&&d.shouldComponentUpdate(v,d.__s,$)===!1){t.__v!=r.__v&&(d.props=v,d.state=d.__s,d.__d=!1),t.__e=r.__e,t.__k=r.__k,t.__k.some(function(ot){ot&&(ot.__=t)}),Tn.push.apply(d.__h,d._sb),d._sb=[],d.__h.length&&s.push(d),a=Mt(r);break e}d.componentWillUpdate!=null&&d.componentWillUpdate(v,d.__s,$),E&&d.componentDidUpdate!=null&&d.__h.push(function(){d.componentDidUpdate(h,w,y)})}if(d.context=$,d.props=v,d.__P=e,d.__e=!1,W=P.__r,Z=0,E)d.state=d.__s,d.__d=!1,W&&W(t),u=d.render(d.props,d.state,d.context),Tn.push.apply(d.__h,d._sb),d._sb=[];else do d.__d=!1,W&&W(t),u=d.render(d.props,d.state,d.context),d.state=d.__s;while(d.__d&&++Z<25);d.state=d.__s,d.getChildContext!=null&&(n=ut(ut({},n),d.getChildContext())),E&&!f&&d.getSnapshotBeforeUpdate!=null&&(y=d.getSnapshotBeforeUpdate(h,w)),U=u!=null&&u.type===L&&u.key==null?Xc(u.props.children):u,a=Wc(e,Mn(U)?U:[U],t,r,n,o,i,s,a,c,l),d.base=t.__e,t.__u&=-161,d.__h.length&&s.push(d),b&&(d.__E=d.__=null)}catch(ot){if(s.length=p,t.__v=null,c||i!=null){if(ot.then){for(t.__u|=c?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;i!=null&&(i[i.indexOf(a)]=null),t.__e=a}else if(i!=null)for(se=i.length;se--;)yi(i[se])}else t.__e=r.__e;t.__k==null&&(t.__k=r.__k||[]),ot.then||Vc(t),P.__e(ot,t,r)}}else i==null&&t.__v==r.__v?(t.__k=r.__k,t.__e=r.__e):a=t.__e=Fw(r.__e,t,r,n,o,i,s,c,l);return(u=P.diffed)&&u(t),128&t.__u?void 0:a}function Vc(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Vc))}function qc(e,t,r){for(var n=0;n<r.length;n++)vi(r[n],r[++n],r[++n]);P.__c&&P.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(i){i.call(o)})}catch(i){P.__e(i,o.__v)}})}function Xc(e){return typeof e!="object"||e==null||e.__b>0?e:Mn(e)?e.map(Xc):e.constructor!==void 0?null:ut({},e)}function Fw(e,t,r,n,o,i,s,a,c){var l,u,p,d,f,h,w,y=r.props||An,b=t.props,v=t.type;if(v=="svg"?o="http://www.w3.org/2000/svg":v=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),i!=null){for(l=0;l<i.length;l++)if((f=i[l])&&"setAttribute"in f==!!v&&(v?f.localName==v:f.nodeType==3)){e=f,i[l]=null;break}}if(e==null){if(v==null)return document.createTextNode(b);e=document.createElementNS(o,v,b.is&&b),a&&(P.__m&&P.__m(t,i),a=!1),i=null}if(v==null)y===b||a&&e.data==b||(e.data=b);else{if(i=v=="textarea"&&b.defaultValue!=null?null:i&&In.call(e.childNodes),!a&&i!=null)for(y={},l=0;l<e.attributes.length;l++)y[(f=e.attributes[l]).name]=f.value;for(l in y)f=y[l],l=="dangerouslySetInnerHTML"?p=f:l=="children"||l in b||l=="value"&&"defaultValue"in b||l=="checked"&&"defaultChecked"in b||Sn(e,l,null,f,o);for(l in b)f=b[l],l=="children"?d=f:l=="dangerouslySetInnerHTML"?u=f:l=="value"?h=f:l=="checked"?w=f:a&&typeof f!="function"||y[l]===f||Sn(e,l,f,y[l],o);if(u)a||p&&(u.__html==p.__html||u.__html==e.innerHTML)||(e.innerHTML=u.__html),t.__k=[];else if(p&&(e.innerHTML=""),Wc(t.type=="template"?e.content:e,Mn(d)?d:[d],t,r,n,v=="foreignObject"?"http://www.w3.org/1999/xhtml":o,i,s,i?i[0]:r.__k&&Mt(r,0),a,c),i!=null)for(l=i.length;l--;)yi(i[l]);a&&v!="textarea"||(l="value",v=="progress"&&h==null?e.removeAttribute("value"):h!=null&&(h!==e[l]||v=="progress"&&!h||v=="option"&&h!=y[l])&&Sn(e,l,h,y[l],o),l="checked",w!=null&&w!=e[l]&&Sn(e,l,w,y[l],o))}return e}function vi(e,t,r){try{if(typeof e=="function"){var n=typeof e.__u=="function";n&&e.__u(),n&&t==null||(e.__u=e(t))}else e.current=t}catch(o){P.__e(o,r)}}function Jc(e,t,r){var n,o;if(P.unmount&&P.unmount(e),(n=e.ref)&&(n.current&&n.current!=e.__e||vi(n,null,t)),(n=e.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(i){P.__e(i,t)}n.base=n.__P=n.__n=null}if(n=e.__k)for(o=0;o<n.length;o++)n[o]&&Jc(n[o],t,r||typeof e.type!="function");r||yi(e.__e),e.__c=e.__=e.__e=void 0}function Uw(e,t,r){return this.constructor(e,r)}function ki(e,t,r){var n,o,i,s;t==document&&(t=document.documentElement),P.__&&P.__(e,t),o=(n=typeof r=="function")?null:r&&r.__k||t.__k,i=[],s=[],xi(t,e=(!n&&r||t).__k=Be(L,null,[e]),o||An,An,t.namespaceURI,!n&&r?[r]:o?null:t.firstChild?In.call(t.childNodes):null,i,!n&&r?r:o?o.__e:t.firstChild,n,s),qc(i,e,s),e.props.children=null}In=Tn.slice,P={__e:function(e,t,r,n){for(var o,i,s;t=t.__;)if((o=t.__c)&&!o.__)try{if((i=o.constructor)&&i.getDerivedStateFromError!=null&&(o.setState(i.getDerivedStateFromError(e)),s=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,n||{}),s=o.__d),s)return o.__E=o}catch(a){e=a}throw e}},Uc=0,Lw=function(e){return e!=null&&e.constructor===void 0},Rn.prototype.setState=function(e,t){var r;r=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=ut({},this.state),typeof e=="function"&&(e=e(ut({},r),this.props)),e&&ut(r,e),e!=null&&this.__v&&(t&&this._sb.push(t),Hc(this))},Rn.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Hc(this))},Rn.prototype.render=L,St=[],$c=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,jc=function(e,t){return e.__v.__b-t.__v.__b},Pn.__r=0,hi=Math.random().toString(8),En="__d"+hi,Tr="__a"+hi,Gc=/(PointerCapture)$|Capture$/i,wi=0,gi=Fc(!1),bi=Fc(!0),Ow=0;var $w=0;function m(e,t,r,n,o,i){t||(t={});var s,a,c=t;if("ref"in c)for(a in c={},t)a=="ref"?s=t[a]:c[a]=t[a];var l={type:e,props:c,key:r,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--$w,__i:-1,__u:0,__source:o,__self:i};if(typeof e=="function"&&(s=e.defaultProps))for(a in s)c[a]===void 0&&(c[a]=s[a]);return P.vnode&&P.vnode(l),l}var jw=["top","right","bottom","left"],Gw=["tl","tr","br","bl"];function _i({mode:e}){return m("div",{class:"coere-act-glow","data-mode":e,"aria-hidden":"true",children:[jw.map(t=>m("span",{class:"coere-act-glow-edge","data-edge":t},t)),Gw.map(t=>m("span",{class:"coere-act-glow-corner","data-corner":t},t))]})}var or,B,Si,Yc,On=0,il=[],F=P,Zc=F.__b,Qc=F.__r,el=F.diffed,tl=F.__c,rl=F.unmount,nl=F.__;function Nn(e,t){F.__h&&F.__h(B,e,On||t),On=0;var r=B.__H||(B.__H={__:[],__h:[]});return e>=r.__.length&&r.__.push({}),r.__[e]}function Lt(e){return On=1,zw(al,e)}function zw(e,t,r){var n=Nn(or++,2);if(n.t=e,!n.__c&&(n.__=[r?r(t):al(void 0,t),function(a){var c=n.__N?n.__N[0]:n.__[0],l=n.t(c,a);c!==l&&(n.__N=[l,n.__[1]],n.__c.setState({}))}],n.__c=B,!B.__f)){var o=function(a,c,l){if(!n.__c.__H)return!0;var u=!1,p=n.__c.props!==a;if(n.__c.__H.__.some(function(f){if(f.__N){u=!0;var h=f.__[0];f.__=f.__N,f.__N=void 0,h!==f.__[0]&&(p=!0)}}),i){var d=i.call(this,a,c,l);return u?d||p:d}return!u||p};B.__f=!0;var i=B.shouldComponentUpdate,s=B.componentWillUpdate;B.componentWillUpdate=function(a,c,l){if(this.__e){var u=i;i=void 0,o(a,c,l),i=u}s&&s.call(this,a,c,l)},B.shouldComponentUpdate=o}return n.__N||n.__}function Et(e,t){var r=Nn(or++,3);!F.__s&&Ci(r.__H,t)&&(r.__=e,r.u=t,B.__H.__h.push(r))}function sl(e,t){var r=Nn(or++,4);!F.__s&&Ci(r.__H,t)&&(r.__=e,r.u=t,B.__h.push(r))}function ir(e){return On=5,Pr(function(){return{current:e}},[])}function Pr(e,t){var r=Nn(or++,7);return Ci(r.__H,t)&&(r.__=e(),r.__H=t,r.__h=e),r.__}function Ww(){for(var e;e=il.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ln),t.__h.some(Ei),t.__h=[]}catch(r){t.__h=[],F.__e(r,e.__v)}}}F.__b=function(e){B=null,Zc&&Zc(e)},F.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),nl&&nl(e,t)},F.__r=function(e){Qc&&Qc(e),or=0;var t=(B=e.__c).__H;t&&(Si===B?(t.__h=[],B.__h=[],t.__.some(function(r){r.__N&&(r.__=r.__N),r.u=r.__N=void 0})):(t.__h.some(Ln),t.__h.some(Ei),t.__h=[],or=0)),Si=B},F.diffed=function(e){el&&el(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(il.push(t)!==1&&Yc===F.requestAnimationFrame||((Yc=F.requestAnimationFrame)||Kw)(Ww)),t.__H.__.some(function(r){r.u&&(r.__H=r.u,r.u=void 0)})),Si=B=null},F.__c=function(e,t){t.some(function(r){try{r.__h.some(Ln),r.__h=r.__h.filter(function(n){return!n.__||Ei(n)})}catch(n){t.some(function(o){o.__h&&(o.__h=[])}),t=[],F.__e(n,r.__v)}}),tl&&tl(e,t)},F.unmount=function(e){rl&&rl(e);var t,r=e.__c;r&&r.__H&&(r.__H.__.some(function(n){try{Ln(n)}catch(o){t=o}}),r.__H=void 0,t&&F.__e(t,r.__v))};var ol=typeof requestAnimationFrame=="function";function Kw(e){var t,r=function(){clearTimeout(n),ol&&cancelAnimationFrame(t),setTimeout(e)},n=setTimeout(r,35);ol&&(t=requestAnimationFrame(r))}function Ln(e){var t=B,r=e.__c;typeof r=="function"&&(e.__c=void 0,r()),B=t}function Ei(e){var t=B;e.__c=e.__(),B=t}function Ci(e,t){return!e||e.length!==t.length||t.some(function(r,n){return r!==e[n]})}function al(e,t){return typeof t=="function"?t(e):t}function pt(...e){return e.filter(Boolean).join(" ")}var cl=0;function Vw(e){return cl+=1,`${e}-${cl.toString(36)}`}function Te(e){let[t]=Lt(()=>Vw(e));return t}var ll={kind:"button",svg:{tag:"svg",attrs:{viewBox:"0 0 256 256",class:"coere-cori-art",style:"--coere-cori-o-seat:128px 234px;--coere-cori-o-floor:128px 237px;--coere-cori-o-tuft:124.92px 62.04px;--coere-cori-tilt-dx:-91.3px;--coere-cori-look-k:0.8;--coere-cori-u:1"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"96",cy:"88",r:"200",fx:"88",fy:"80"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.3","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.58","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"0.84","stop-color":"#485bd9"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#3f50c0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"128",cy:"173.2",r:"111.2"},children:[{tag:"stop",attrs:{offset:"0.93","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-256",y:"-256",width:"768",height:"768"},children:[{tag:"rect",attrs:{x:"-256",y:"-256",width:"768",height:"768",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-sheen"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff","stop-opacity":"0.34"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.8"},children:[]},{tag:"stop",attrs:{offset:"0.4","stop-color":"#a2adfb","stop-opacity":"0.45"},children:[]},{tag:"stop",attrs:{offset:"0.75","stop-color":"#a2adfb","stop-opacity":"0.12"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-eye",x1:"0",y1:"0",x2:"0",y2:"1"},children:[{tag:"stop",attrs:{offset:"0.55","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eef0fe"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floor"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#080e24","stop-opacity":"0.2",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:var(--coere-cori-floor-o, 0.2)"},children:[]},{tag:"stop",attrs:{offset:"0.6","stop-color":"#080e24","stop-opacity":"0.08",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:calc(var(--coere-cori-floor-o, 0.2) * 0.4)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#080e24","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floorglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#5267f7","stop-opacity":"0.3",style:"stop-opacity:var(--coere-cori-glow-o, 0.3)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#5267f7","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-lr",gradientUnits:"userSpaceOnUse",x1:"72",y1:"82",x2:"240",y2:"234"},children:[{tag:"stop",attrs:{offset:"0.38","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.92","stop-color":"#fff"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim",gradientUnits:"userSpaceOnUse",x1:"49.6",y1:"0",x2:"240",y2:"0"},children:[{tag:"stop",attrs:{offset:"0.1","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.86","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#000"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim-v",gradientUnits:"userSpaceOnUse",x1:"0",y1:"136",x2:"0",y2:"234"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.7","stop-color":"#fff"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-mask-ul",gradientUnits:"userSpaceOnUse",cx:"16",cy:"134.08",r:"117.6"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#fff","stop-opacity":"0.6"},children:[]},{tag:"stop",attrs:{offset:"0.8","stop-color":"#fff","stop-opacity":"0.13"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#fff","stop-opacity":"0"},children:[]}]},{tag:"mask",attrs:{id:"m-lr",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-lr)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim-v",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim)",mask:"url(#m-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-ul",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-ul)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z"},children:[]}]},{tag:"filter",attrs:{id:"f-core",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"12.19"},children:[]}]},{tag:"filter",attrs:{id:"f-rim",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"2.38"},children:[]}]},{tag:"filter",attrs:{id:"f-lit",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"4"},children:[]}]}]},{tag:"g",attrs:{class:"b-shadow"},children:[{tag:"g",attrs:{class:"b-shadow-pose"},children:[{tag:"ellipse",attrs:{cx:"128",cy:"237",rx:"100",ry:"8",fill:"url(#g-floor)"},children:[]},{tag:"ellipse",attrs:{cx:"132",cy:"236",rx:"62",ry:"4.96",fill:"url(#g-floorglow)"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#2d3b8e","stroke-width":"46.08",opacity:"0.5",filter:"url(#f-core)",mask:"url(#m-lr)"},children:[]},{tag:"ellipse",attrs:{cx:"138",cy:"208.2",rx:"67.2",ry:"41.28",fill:"url(#g-glow)",opacity:"0.5"},children:[]},{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#bdc5fc","stroke-width":"14",opacity:"0.7",filter:"url(#f-rim)",mask:"url(#m-rim)"},children:[]},{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#cbd1fd","stroke-width":"12.8",opacity:"0.38",filter:"url(#f-lit)",mask:"url(#m-ul)"},children:[]},{tag:"ellipse",attrs:{cx:"92",cy:"112",rx:"74",ry:"54",transform:"rotate(-32 92 112)",fill:"url(#g-sheen)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 58.49 97.96 C 58.69 97.49 59.3 96.07 59.7 95.13 C 60.1 94.18 60.48 93.23 60.91 92.29 C 61.33 91.36 61.78 90.44 62.25 89.52 C 62.72 88.61 63.2 87.7 63.72 86.82 C 64.23 85.93 64.78 85.06 65.36 84.22 C 65.93 83.37 66.51 82.5 67.18 81.74 C 67.86 80.97 68.63 80.28 69.42 79.64 C 70.22 79 71.08 78.45 71.94 77.89 C 72.8 77.33 73.7 76.84 74.57 76.28 C 75.43 75.72 76.28 75.14 77.11 74.54 C 77.94 73.94 78.75 73.31 79.55 72.66 C 80.34 72.01 81.12 71.34 81.87 70.64 C 82.62 69.94 83.36 69.22 84.06 68.47 C 84.75 67.72 85.42 66.93 86.06 66.13 C 86.7 65.33 87.29 64.49 87.9 63.66 C 88.5 62.83 89.09 61.99 89.68 61.15 C 90.28 60.32 90.87 59.48 91.47 58.64 C 92.06 57.81 92.66 56.97 93.25 56.14 C 93.85 55.3 94.44 54.46 95.04 53.63 C 95.63 52.79 96.23 51.95 96.83 51.12 C 97.42 50.28 98.02 49.44 98.61 48.61 C 99.21 47.77 99.8 46.93 100.4 46.1 C 100.99 45.26 101.59 44.42 102.18 43.59 C 102.78 42.75 103.37 41.91 103.97 41.08 C 104.56 40.24 105.11 39.36 105.75 38.57 C 106.4 37.77 107.05 36.94 107.83 36.3 C 108.62 35.67 109.55 35.12 110.49 34.75 C 111.43 34.38 112.47 34.16 113.48 34.09 C 114.49 34.03 115.55 34.12 116.53 34.35 C 117.51 34.59 118.5 34.99 119.36 35.51 C 120.23 36.03 121.05 36.7 121.72 37.45 C 122.39 38.2 122.97 39.09 123.38 40.01 C 123.8 40.92 124.05 41.94 124.21 42.94 C 124.38 43.94 124.34 44.99 124.37 46.01 C 124.41 47.03 124.24 48.11 124.42 49.09 C 124.61 50.07 124.82 51.33 125.48 51.9 C 126.13 52.46 127.4 52.59 128.34 52.46 C 129.27 52.34 130.25 51.71 131.1 51.17 C 131.96 50.62 132.73 49.91 133.47 49.21 C 134.21 48.5 134.86 47.7 135.55 46.94 C 136.23 46.17 136.9 45.39 137.58 44.62 C 138.26 43.85 138.93 43.08 139.61 42.31 C 140.29 41.53 140.96 40.76 141.64 39.99 C 142.32 39.22 143 38.45 143.67 37.67 C 144.35 36.9 145.03 36.13 145.7 35.36 C 146.38 34.59 147.06 33.81 147.73 33.04 C 148.41 32.27 149.09 31.5 149.77 30.73 C 150.44 29.96 151.12 29.18 151.8 28.41 C 152.47 27.64 153.15 26.87 153.83 26.1 C 154.5 25.32 155.16 24.53 155.86 23.78 C 156.56 23.03 157.23 22.24 158.02 21.6 C 158.81 20.95 159.66 20.35 160.57 19.92 C 161.48 19.5 162.49 19.19 163.49 19.04 C 164.48 18.88 165.54 18.87 166.54 19.01 C 167.54 19.14 168.56 19.43 169.48 19.84 C 170.4 20.26 171.29 20.82 172.06 21.48 C 172.82 22.13 173.52 22.93 174.07 23.77 C 174.62 24.61 175.07 25.58 175.36 26.54 C 175.65 27.51 175.81 28.56 175.82 29.57 C 175.82 30.58 175.62 31.61 175.4 32.6 C 175.17 33.6 174.79 34.56 174.47 35.53 C 174.15 36.51 173.81 37.48 173.48 38.45 C 173.15 39.42 172.82 40.4 172.49 41.37 C 172.16 42.34 171.83 43.31 171.5 44.28 C 171.17 45.26 170.84 46.23 170.51 47.2 C 170.18 48.17 169.85 49.15 169.52 50.12 C 169.19 51.09 168.86 52.06 168.53 53.03 C 168.2 54.01 167.87 54.98 167.54 55.95 C 167.21 56.92 166.82 57.88 166.56 58.87 C 166.3 59.86 166.04 60.87 165.98 61.88 C 165.92 62.89 165.96 63.97 166.22 64.94 C 166.49 65.9 166.99 66.85 167.57 67.68 C 168.15 68.5 168.9 69.24 169.68 69.9 C 170.46 70.56 171.34 71.11 172.23 71.62 C 173.12 72.13 174.13 72.42 175.01 72.94 C 175.89 73.46 176.71 74.08 177.48 74.74 C 178.26 75.4 179 76.12 179.67 76.9 C 180.33 77.68 180.89 78.55 181.45 79.4 C 182.02 80.26 182.56 81.13 183.07 82.02 C 183.58 82.91 184.05 83.82 184.52 84.74 C 184.98 85.65 185.44 86.57 185.86 87.51 C 186.28 88.44 186.65 89.36 187.06 90.34 C 187.48 91.33 188.14 92.89 188.35 93.4 L 188.35 110.2 L 58.49 114.76 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"ellipse",attrs:{cx:"92",cy:"112",rx:"74",ry:"54",transform:"rotate(-32 92 112)",fill:"url(#g-sheen)"},children:[]},{tag:"circle",attrs:{cx:"115.48",cy:"40.32",r:"24.39",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"167.26",cy:"25.86",r:"25.87",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"114.23",cy:"44.19",r:"21.34",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"165.1",cy:"29.59",r:"22.64",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 97.93 79.45 C 97.17 79.61 96.12 80.04 95.23 80.35 C 94.34 80.66 93.46 80.99 92.58 81.33 C 91.71 81.67 90.84 82.02 89.98 82.38 C 89.12 82.75 88.27 83.12 87.43 83.51 C 86.58 83.9 85.75 84.31 84.92 84.72 C 84.09 85.14 83.27 85.57 82.46 86.01 C 81.65 86.45 80.85 86.9 80.05 87.37 C 79.26 87.83 78.47 88.31 77.69 88.8 C 76.91 89.29 76.14 89.79 75.38 90.31 C 74.62 90.82 73.86 91.35 73.12 91.89 C 72.37 92.43 71.63 92.98 70.9 93.55 C 70.17 94.11 69.45 94.69 68.73 95.28 C 68.02 95.87 67.31 96.47 66.62 97.08 C 65.92 97.69 65.23 98.32 64.55 98.96 C 63.87 99.59 63.19 100.24 62.53 100.91 C 61.86 101.57 61.21 102.24 60.56 102.93 C 59.91 103.61 59.27 104.31 58.64 105.02 C 58.01 105.73 57.22 106.55 56.77 107.19 C 56.33 107.83 56.1 108.28 56 108.87 C 55.89 109.45 55.96 110.15 56.16 110.71 C 56.37 111.27 56.77 111.84 57.23 112.22 C 57.68 112.6 58.32 112.9 58.9 113 C 59.49 113.1 60.19 113.04 60.75 112.84 C 61.31 112.63 61.59 112.17 62.26 111.77 C 62.93 111.37 63.92 110.87 64.75 110.44 C 65.57 110.02 66.4 109.61 67.21 109.21 C 68.03 108.81 68.84 108.43 69.64 108.04 C 70.43 107.66 71.23 107.29 72 106.92 C 72.78 106.55 73.54 106.19 74.29 105.82 C 75.04 105.45 75.78 105.08 76.5 104.7 C 77.23 104.33 77.94 103.95 78.63 103.56 C 79.33 103.16 80.01 102.77 80.68 102.35 C 81.35 101.94 82.01 101.52 82.66 101.08 C 83.31 100.64 83.94 100.19 84.57 99.73 C 85.2 99.26 85.83 98.78 86.45 98.28 C 87.07 97.78 87.68 97.27 88.29 96.74 C 88.91 96.21 89.52 95.67 90.14 95.12 C 90.76 94.56 91.38 93.99 92.01 93.42 C 92.64 92.84 93.27 92.25 93.91 91.66 C 94.56 91.06 95.21 90.46 95.88 89.86 C 96.55 89.26 97.24 88.65 97.93 88.06 C 98.63 87.46 99.46 86.73 100.08 86.27 C 100.7 85.81 101.24 85.71 101.64 85.28 C 102.05 84.84 102.37 84.22 102.5 83.63 C 102.63 83.05 102.6 82.35 102.42 81.79 C 102.24 81.22 101.86 80.63 101.42 80.22 C 100.98 79.82 100.36 79.5 99.78 79.37 C 99.2 79.24 98.69 79.29 97.93 79.45 Z",fill:"#ffffff",opacity:"0.94"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:112px 168.32px"},children:[{tag:"rect",attrs:{x:"96",width:"32",height:"57.6",rx:"16",y:"128",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{class:"b-blink",style:"transform-origin:163.2px 168.32px"},children:[{tag:"rect",attrs:{x:"147.2",width:"32",height:"57.6",rx:"16",y:"128",fill:"url(#g-eye)"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 100 140.8 L 124 156.8 L 100 172.8",fill:"none",stroke:"#ffffff","stroke-width":"12.77","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 175.2 140.8 L 151.2 156.8 L 175.2 172.8",fill:"none",stroke:"#ffffff","stroke-width":"12.77","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 95.04 160.46 C 95.04 134.68 128.96 134.68 128.96 160.46",fill:"none",stroke:"#ffffff","stroke-width":"13.44","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 146.24 160.46 C 146.24 134.68 180.16 134.68 180.16 160.46",fill:"none",stroke:"#ffffff","stroke-width":"13.44","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"108.16",width:"32",height:"49.54",rx:"16",y:"116.03",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"159.36",width:"32",height:"46.08",rx:"16",y:"117.76",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"95.36",width:"33.28",height:"59.9",rx:"16.64",y:"126.85",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"148.16",width:"30.08",height:"28.8",rx:"15.04",y:"135.49",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 95.04 161.95 C 95.04 180.26 128.96 180.26 128.96 161.95",fill:"none",stroke:"#ffffff","stroke-width":"11.56","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 146.24 161.95 C 146.24 180.26 180.16 180.26 180.16 161.95",fill:"none",stroke:"#ffffff","stroke-width":"11.56","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"smile"},children:[{tag:"path",attrs:{d:"M 123.52 203.52 C 130.56 212.48 144.64 212.48 151.68 203.52",fill:"none",stroke:"#243074","stroke-width":"8.32","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"ellipse",attrs:{cx:"137.6",cy:"209.72",rx:"10.14",ry:"11.83",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"open"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-open"},children:[{tag:"path",attrs:{d:"M 120.7 201.49 C 120.7 225.48 154.5 225.48 154.5 201.49 Z"},children:[]}]},{tag:"path",attrs:{d:"M 120.7 201.49 C 120.7 225.48 154.5 225.48 154.5 201.49 Z",fill:"#243074",stroke:"#243074","stroke-width":"4.58","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"137.6",cy:"219.57",rx:"10.48",ry:"7.1",fill:"#7585f9","clip-path":"url(#clip-mouth-open)"},children:[]}]},{tag:"g",attrs:{"data-mouth":"hmm"},children:[{tag:"ellipse",attrs:{cx:"144.36",cy:"207.46",rx:"7.6",ry:"8.45",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:137.6px 203.52px"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-talk"},children:[{tag:"path",attrs:{d:"M 123.52 208.48 A 14.08 9.01 0 1 0 151.68 208.48 A 14.08 9.01 0 1 0 123.52 208.48 Z"},children:[]}]},{tag:"path",attrs:{d:"M 123.52 208.48 A 14.08 9.01 0 1 0 151.68 208.48 A 14.08 9.01 0 1 0 123.52 208.48 Z",fill:"#243074",stroke:"#243074","stroke-width":"4.58","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"137.6",cy:"214.78",rx:"9.86",ry:"4.06",fill:"#7585f9","clip-path":"url(#clip-mouth-talk)"},children:[]}]}]},{tag:"g",attrs:{"data-mouth":"wavy"},children:[{tag:"path",attrs:{d:"M 121.41 204.52 C 122.08 204 124.11 201.8 125.46 201.4 C 126.81 201 128.15 201.39 129.5 202.13 C 130.85 202.87 132.2 204.85 133.55 205.81 C 134.9 206.77 136.25 207.9 137.6 207.9 C 138.95 207.9 140.3 206.77 141.65 205.81 C 143 204.85 144.35 202.87 145.7 202.13 C 147.05 201.39 148.39 201 149.74 201.4 C 151.09 201.8 153.12 204 153.79 204.52",fill:"none",stroke:"#243074","stroke-width":"7.65","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"sleep"},children:[{tag:"ellipse",attrs:{cx:"137.6",cy:"207.46",rx:"5.63",ry:"4.79",fill:"#243074"},children:[]}]}]}]}]}]},{tag:"g",attrs:{"data-fx":"sparkles"},children:[{tag:"path",attrs:{class:"b-spark b-spark-1",d:"M 230 35 Q 233.36 52.64 251 56 Q 233.36 59.36 230 77 Q 226.64 59.36 209 56 Q 226.64 52.64 230 35 Z",fill:"#5267f7"},children:[]}]},{tag:"g",attrs:{"data-fx":"question"},children:[{tag:"g",attrs:{class:"b-q"},children:[{tag:"path",attrs:{d:"M 216 26.2 C 216 13.6 241.8 13.6 241.8 26.2 C 241.8 35.8 228.9 35.8 228.9 46.6",fill:"none",stroke:"#5267f7","stroke-width":"11","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"circle",attrs:{cx:"228.9",cy:"58.6",r:"6.82",fill:"#5267f7"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"zzz"},children:[{tag:"g",attrs:{class:"b-z b-z-1"},children:[{tag:"path",attrs:{d:"M 206 18 H 236 L 206 48 H 236",fill:"none",stroke:"#5267f7","stroke-width":"10","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"work"},children:[{tag:"g",attrs:{class:"b-key b-key-1"},children:[{tag:"rect",attrs:{x:"196",y:"14",width:"40",height:"32",rx:"9.6",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"205.6",y:"21.68",width:"20.8",height:"6.4",rx:"3.2",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"path",attrs:{class:"b-fly b-fly-1",d:"M 30 34 Q 32.88 49.12 48 52 Q 32.88 54.88 30 70 Q 27.12 54.88 12 52 Q 27.12 49.12 30 34 Z",fill:"#5267f7",style:"--coere-cori-fly-x:-10px"},children:[]}]}]}};var dl={kind:"full",svg:{tag:"svg",attrs:{viewBox:"0 0 256 256",class:"coere-cori-art",style:"--coere-cori-o-seat:128px 220px;--coere-cori-o-floor:128px 223px;--coere-cori-o-tuft:126px 66.02px;--coere-cori-tilt-dx:-72px;--coere-cori-look-k:1;--coere-cori-u:1"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"100",cy:"92",r:"178",fx:"92",fy:"84"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.3","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.58","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"0.84","stop-color":"#485bd9"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#3f50c0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"128",cy:"150.02",r:"84.02"},children:[{tag:"stop",attrs:{offset:"0.92","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-256",y:"-256",width:"768",height:"768"},children:[{tag:"rect",attrs:{x:"-256",y:"-256",width:"768",height:"768",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-sheen"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff","stop-opacity":"0.34"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.8"},children:[]},{tag:"stop",attrs:{offset:"0.4","stop-color":"#a2adfb","stop-opacity":"0.45"},children:[]},{tag:"stop",attrs:{offset:"0.75","stop-color":"#a2adfb","stop-opacity":"0.12"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-blush"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#bdc5fc"},children:[]},{tag:"stop",attrs:{offset:"0.5","stop-color":"#bdc5fc","stop-opacity":"0.7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#bdc5fc","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-eye",x1:"0",y1:"0",x2:"0",y2:"1"},children:[{tag:"stop",attrs:{offset:"0.55","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eef0fe"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floor"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#080e24","stop-opacity":"0.2",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:var(--coere-cori-floor-o, 0.2)"},children:[]},{tag:"stop",attrs:{offset:"0.6","stop-color":"#080e24","stop-opacity":"0.08",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:calc(var(--coere-cori-floor-o, 0.2) * 0.4)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#080e24","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floorglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#5267f7","stop-opacity":"0.3",style:"stop-opacity:var(--coere-cori-glow-o, 0.3)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#5267f7","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-lr",gradientUnits:"userSpaceOnUse",x1:"83",y1:"86",x2:"218",y2:"220"},children:[{tag:"stop",attrs:{offset:"0.38","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.92","stop-color":"#fff"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim",gradientUnits:"userSpaceOnUse",x1:"65",y1:"0",x2:"218",y2:"0"},children:[{tag:"stop",attrs:{offset:"0.1","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.86","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#000"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim-v",gradientUnits:"userSpaceOnUse",x1:"0",y1:"124",x2:"0",y2:"220"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.7","stop-color":"#fff"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-mask-ul",gradientUnits:"userSpaceOnUse",cx:"38",cy:"128.56",r:"94.5"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#fff","stop-opacity":"0.6"},children:[]},{tag:"stop",attrs:{offset:"0.8","stop-color":"#fff","stop-opacity":"0.13"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#fff","stop-opacity":"0"},children:[]}]},{tag:"mask",attrs:{id:"m-lr",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-lr)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim-v",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim)",mask:"url(#m-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-ul",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-ul)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z"},children:[]}]},{tag:"filter",attrs:{id:"f-core",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"12.19"},children:[]}]},{tag:"filter",attrs:{id:"f-rim",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"1.7"},children:[]}]},{tag:"filter",attrs:{id:"f-lit",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"4"},children:[]}]}]},{tag:"g",attrs:{class:"b-shadow"},children:[{tag:"g",attrs:{class:"b-shadow-pose"},children:[{tag:"ellipse",attrs:{cx:"128",cy:"223",rx:"84",ry:"10",fill:"url(#g-floor)"},children:[]},{tag:"ellipse",attrs:{cx:"132",cy:"222",rx:"52.08",ry:"6.2",fill:"url(#g-floorglow)"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#2d3b8e","stroke-width":"46.08",opacity:"0.5",filter:"url(#f-core)",mask:"url(#m-lr)"},children:[]},{tag:"ellipse",attrs:{cx:"138",cy:"196.9",rx:"54",ry:"36.96",fill:"url(#g-glow)",opacity:"0.5"},children:[]},{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#bdc5fc","stroke-width":"10",opacity:"0.7",filter:"url(#f-rim)",mask:"url(#m-rim)"},children:[]},{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#cbd1fd","stroke-width":"12.8",opacity:"0.38",filter:"url(#f-lit)",mask:"url(#m-ul)"},children:[]},{tag:"ellipse",attrs:{cx:"96",cy:"112",rx:"62",ry:"46",transform:"rotate(-32 96 112)",fill:"url(#g-sheen)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 81.27 89.4 C 81.42 89.07 81.87 88.07 82.18 87.4 C 82.48 86.73 82.76 86.05 83.08 85.39 C 83.4 84.73 83.74 84.08 84.08 83.44 C 84.43 82.79 84.78 82.14 85.16 81.52 C 85.54 80.89 85.95 80.28 86.37 79.68 C 86.79 79.08 87.2 78.47 87.68 77.92 C 88.17 77.37 88.71 76.87 89.28 76.41 C 89.84 75.95 90.43 75.51 91.06 75.15 C 91.69 74.78 92.39 74.54 93.05 74.2 C 93.7 73.87 94.34 73.51 94.97 73.14 C 95.6 72.76 96.22 72.36 96.82 71.94 C 97.42 71.52 98.01 71.08 98.57 70.61 C 99.14 70.15 99.68 69.66 100.21 69.15 C 100.73 68.63 101.23 68.09 101.7 67.54 C 102.18 66.98 102.61 66.39 103.04 65.79 C 103.47 65.2 103.86 64.58 104.27 63.97 C 104.68 63.36 105.09 62.75 105.5 62.14 C 105.9 61.53 106.31 60.92 106.72 60.31 C 107.13 59.7 107.54 59.09 107.94 58.48 C 108.35 57.87 108.76 57.26 109.17 56.65 C 109.57 56.05 109.98 55.44 110.39 54.83 C 110.8 54.22 111.21 53.61 111.61 53 C 112.02 52.39 112.43 51.78 112.84 51.17 C 113.25 50.56 113.61 49.91 114.06 49.34 C 114.52 48.77 114.99 48.18 115.57 47.74 C 116.15 47.31 116.83 46.95 117.52 46.73 C 118.2 46.51 118.97 46.4 119.69 46.42 C 120.41 46.44 121.16 46.58 121.83 46.83 C 122.51 47.08 123.17 47.47 123.73 47.93 C 124.28 48.39 124.78 48.97 125.15 49.58 C 125.52 50.19 125.79 50.9 125.95 51.61 C 126.12 52.31 126.12 53.06 126.14 53.79 C 126.16 54.53 126 55.27 126.07 55.99 C 126.14 56.71 126.14 57.61 126.53 58.11 C 126.93 58.6 127.77 58.95 128.43 58.97 C 129.08 58.99 129.84 58.56 130.47 58.21 C 131.11 57.86 131.69 57.38 132.23 56.89 C 132.77 56.4 133.23 55.82 133.71 55.27 C 134.2 54.72 134.66 54.15 135.13 53.59 C 135.61 53.03 136.08 52.47 136.55 51.91 C 137.03 51.35 137.5 50.79 137.97 50.23 C 138.45 49.67 138.92 49.11 139.4 48.55 C 139.87 47.99 140.34 47.43 140.82 46.87 C 141.29 46.31 141.76 45.75 142.24 45.19 C 142.71 44.63 143.18 44.07 143.66 43.51 C 144.13 42.95 144.6 42.39 145.08 41.83 C 145.55 41.27 146.02 40.71 146.5 40.15 C 146.97 39.59 147.41 39 147.92 38.47 C 148.43 37.94 148.94 37.39 149.54 36.99 C 150.14 36.58 150.82 36.25 151.51 36.04 C 152.2 35.83 152.96 35.73 153.68 35.75 C 154.4 35.76 155.15 35.9 155.83 36.14 C 156.51 36.38 157.19 36.74 157.76 37.18 C 158.33 37.62 158.86 38.18 159.27 38.78 C 159.68 39.37 160.01 40.06 160.21 40.76 C 160.42 41.45 160.51 42.21 160.49 42.94 C 160.47 43.66 160.27 44.39 160.08 45.1 C 159.89 45.8 159.58 46.48 159.34 47.17 C 159.09 47.86 158.84 48.55 158.59 49.24 C 158.34 49.93 158.1 50.62 157.85 51.31 C 157.6 52 157.35 52.69 157.1 53.38 C 156.85 54.07 156.61 54.76 156.36 55.45 C 156.11 56.14 155.86 56.83 155.61 57.52 C 155.37 58.21 155.12 58.9 154.87 59.59 C 154.62 60.28 154.36 60.96 154.12 61.66 C 153.89 62.35 153.61 63.04 153.44 63.75 C 153.28 64.46 153.1 65.2 153.13 65.91 C 153.15 66.63 153.31 67.38 153.59 68.04 C 153.87 68.7 154.3 69.34 154.79 69.87 C 155.28 70.4 155.9 70.83 156.52 71.22 C 157.13 71.61 157.82 71.89 158.47 72.22 C 159.13 72.55 159.82 72.81 160.44 73.18 C 161.07 73.55 161.68 73.96 162.23 74.44 C 162.78 74.92 163.26 75.5 163.72 76.06 C 164.19 76.62 164.6 77.23 165.02 77.83 C 165.44 78.43 165.86 79.03 166.23 79.66 C 166.61 80.29 166.88 80.87 167.26 81.61 C 167.65 82.35 168.33 83.69 168.55 84.11 L 168.55 96.11 L 81.27 101.4 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"ellipse",attrs:{cx:"96",cy:"112",rx:"62",ry:"46",transform:"rotate(-32 96 112)",fill:"url(#g-sheen)"},children:[]},{tag:"circle",attrs:{cx:"120.38",cy:"50.48",r:"17.16",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"154.9",cy:"40.29",r:"18.2",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"119.56",cy:"52.99",r:"13.86",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"153.5",cy:"42.71",r:"14.7",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 99.74 83.15 C 99.27 83.29 98.79 83.57 98.31 83.79 C 97.84 84.01 97.36 84.24 96.9 84.47 C 96.43 84.7 95.96 84.94 95.5 85.18 C 95.03 85.42 94.57 85.67 94.12 85.92 C 93.66 86.17 93.21 86.43 92.75 86.7 C 92.3 86.96 91.85 87.23 91.41 87.5 C 90.96 87.78 90.52 88.06 90.08 88.35 C 89.64 88.63 89.21 88.92 88.77 89.22 C 88.34 89.52 87.91 89.82 87.48 90.13 C 87.05 90.43 86.63 90.75 86.2 91.06 C 85.78 91.38 85.36 91.71 84.95 92.04 C 84.53 92.37 84.12 92.7 83.71 93.04 C 83.3 93.38 82.89 93.73 82.48 94.08 C 82.08 94.43 81.68 94.79 81.28 95.15 C 80.88 95.51 80.49 95.88 80.09 96.25 C 79.7 96.62 79.31 97 78.93 97.39 C 78.54 97.77 78.16 98.16 77.78 98.55 C 77.4 98.95 77.02 99.35 76.65 99.76 C 76.27 100.16 75.9 100.57 75.53 100.99 C 75.17 101.4 74.8 101.83 74.44 102.25 C 74.08 102.68 73.72 103.11 73.37 103.55 C 73.01 103.99 72.66 104.43 72.31 104.88 C 71.96 105.33 71.62 105.79 71.28 106.25 C 70.93 106.71 70.51 107.18 70.26 107.64 C 70.01 108.1 69.8 108.53 69.76 108.99 C 69.71 109.46 69.8 109.99 69.99 110.42 C 70.19 110.84 70.54 111.26 70.91 111.53 C 71.29 111.8 71.8 111.99 72.27 112.03 C 72.73 112.08 73.27 111.99 73.69 111.79 C 74.11 111.6 74.41 111.21 74.8 110.88 C 75.19 110.54 75.62 110.14 76.03 109.78 C 76.43 109.42 76.84 109.06 77.25 108.72 C 77.66 108.37 78.07 108.03 78.48 107.69 C 78.89 107.36 79.29 107.03 79.7 106.7 C 80.1 106.37 80.51 106.05 80.91 105.74 C 81.31 105.42 81.71 105.1 82.11 104.79 C 82.51 104.48 82.9 104.17 83.29 103.87 C 83.68 103.56 84.07 103.26 84.46 102.95 C 84.84 102.65 85.23 102.35 85.61 102.05 C 85.99 101.75 86.36 101.45 86.74 101.15 C 87.11 100.85 87.48 100.55 87.85 100.25 C 88.21 99.95 88.58 99.65 88.94 99.35 C 89.3 99.05 89.66 98.75 90.02 98.45 C 90.38 98.15 90.73 97.84 91.09 97.54 C 91.44 97.23 91.8 96.93 92.15 96.62 C 92.5 96.31 92.85 96.01 93.2 95.7 C 93.55 95.39 93.9 95.08 94.25 94.77 C 94.61 94.45 94.96 94.14 95.31 93.83 C 95.66 93.52 96.02 93.2 96.37 92.89 C 96.73 92.58 97.09 92.26 97.45 91.95 C 97.81 91.64 98.18 91.32 98.54 91.01 C 98.91 90.7 99.28 90.39 99.66 90.08 C 100.03 89.77 100.41 89.47 100.8 89.16 C 101.18 88.86 101.58 88.57 101.97 88.27 C 102.35 87.97 102.82 87.74 103.1 87.37 C 103.37 86.99 103.57 86.49 103.62 86.03 C 103.68 85.56 103.6 85.02 103.41 84.6 C 103.23 84.17 102.89 83.74 102.51 83.47 C 102.14 83.19 101.63 82.99 101.17 82.94 C 100.71 82.89 100.22 83.01 99.74 83.15 Z",fill:"#ffffff",opacity:"0.94"},children:[]},{tag:"circle",attrs:{cx:"113.33",cy:"83",r:"4.2",fill:"#ffffff",opacity:"0.85"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{class:"b-cheeks",opacity:"0.55"},children:[{tag:"ellipse",attrs:{cx:"93",cy:"173",rx:"13",ry:"7.5",fill:"url(#g-blush)"},children:[]},{tag:"ellipse",attrs:{cx:"173.08",cy:"173",rx:"11.96",ry:"7.5",fill:"url(#g-blush)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:117px 157.6px"},children:[{tag:"rect",attrs:{x:"107",width:"20",height:"38",rx:"10",y:"134",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"107",width:"20",height:"38",rx:"10",y:"131",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{class:"b-blink",style:"transform-origin:151px 157.28px"},children:[{tag:"rect",attrs:{x:"141.8",width:"18.4",height:"36.4",rx:"9.2",y:"134.8",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"141.8",width:"18.4",height:"36.4",rx:"9.2",y:"131.8",fill:"url(#g-eye)"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 109.5 140 L 124.5 150 L 109.5 160",fill:"none",stroke:"#ffffff","stroke-width":"7.98","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 158.5 140 L 143.5 150 L 158.5 160",fill:"none",stroke:"#ffffff","stroke-width":"7.98","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 106.4 152.29 C 106.4 136.18 127.6 136.18 127.6 152.29",fill:"none",stroke:"#ffffff","stroke-width":"8.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 140.4 152.29 C 140.4 136.18 161.6 136.18 161.6 152.29",fill:"none",stroke:"#ffffff","stroke-width":"8.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"114.6",width:"20",height:"32.68",rx:"10",y:"126.66",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"114.6",width:"20",height:"32.68",rx:"10",y:"123.66",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"149.4",width:"18.4",height:"29.12",rx:"9.2",y:"128.44",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"149.4",width:"18.4",height:"29.12",rx:"9.2",y:"125.44",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"106.6",width:"20.8",height:"39.52",rx:"10.4",y:"133.24",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"106.6",width:"20.8",height:"39.52",rx:"10.4",y:"130.24",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"142.35",width:"17.3",height:"18.2",rx:"8.65",y:"139.53",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"142.35",width:"17.3",height:"18.2",rx:"8.65",y:"136.53",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 106.4 153.54 C 106.4 164.98 127.6 164.98 127.6 153.54",fill:"none",stroke:"#ffffff","stroke-width":"7.22","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 140.4 153.28 C 140.4 164.73 161.6 164.73 161.6 153.28",fill:"none",stroke:"#ffffff","stroke-width":"7.22","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"smile"},children:[{tag:"path",attrs:{d:"M 127.5 182 C 130.75 186.6 137.25 186.6 140.5 182",fill:"none",stroke:"#243074","stroke-width":"4.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"ellipse",attrs:{cx:"134",cy:"184.86",rx:"4.68",ry:"5.46",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"open"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-open"},children:[{tag:"path",attrs:{d:"M 126.2 181.06 C 126.2 192.14 141.8 192.14 141.8 181.06 Z"},children:[]}]},{tag:"path",attrs:{d:"M 126.2 181.06 C 126.2 192.14 141.8 192.14 141.8 181.06 Z",fill:"#243074",stroke:"#243074","stroke-width":"2.42","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"134",cy:"189.41",rx:"4.84",ry:"3.28",fill:"#7585f9","clip-path":"url(#clip-mouth-open)"},children:[]}]},{tag:"g",attrs:{"data-mouth":"hmm"},children:[{tag:"ellipse",attrs:{cx:"137.12",cy:"183.82",rx:"3.51",ry:"3.9",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:134px 182px"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-talk"},children:[{tag:"path",attrs:{d:"M 127.5 184.29 A 6.5 4.16 0 1 0 140.5 184.29 A 6.5 4.16 0 1 0 127.5 184.29 Z"},children:[]}]},{tag:"path",attrs:{d:"M 127.5 184.29 A 6.5 4.16 0 1 0 140.5 184.29 A 6.5 4.16 0 1 0 127.5 184.29 Z",fill:"#243074",stroke:"#243074","stroke-width":"2.42","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"134",cy:"187.2",rx:"4.55",ry:"1.87",fill:"#7585f9","clip-path":"url(#clip-mouth-talk)"},children:[]}]}]},{tag:"g",attrs:{"data-mouth":"wavy"},children:[{tag:"path",attrs:{d:"M 126.53 183 C 126.84 182.76 127.77 181.74 128.39 181.56 C 129.02 181.37 129.64 181.56 130.26 181.9 C 130.89 182.24 131.51 183.15 132.13 183.6 C 132.75 184.04 133.38 184.56 134 184.56 C 134.62 184.56 135.25 184.04 135.87 183.6 C 136.49 183.15 137.11 182.24 137.74 181.9 C 138.36 181.56 138.98 181.37 139.61 181.56 C 140.23 181.74 141.16 182.76 141.47 183",fill:"none",stroke:"#243074","stroke-width":"4.05","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"sleep"},children:[{tag:"ellipse",attrs:{cx:"134",cy:"183.82",rx:"2.6",ry:"2.21",fill:"#243074"},children:[]}]}]}]}]}]},{tag:"g",attrs:{"data-fx":"sparkles"},children:[{tag:"path",attrs:{class:"b-spark b-spark-1",d:"M 36 82 Q 38.24 93.76 50 96 Q 38.24 98.24 36 110 Q 33.76 98.24 22 96 Q 33.76 93.76 36 82 Z",fill:"#5267f7"},children:[]},{tag:"path",attrs:{class:"b-spark b-spark-2",d:"M 224 88 Q 225.6 96.4 234 98 Q 225.6 99.6 224 108 Q 222.4 99.6 214 98 Q 222.4 96.4 224 88 Z",fill:"#8695f9"},children:[]},{tag:"path",attrs:{class:"b-spark b-spark-3",d:"M 204 36.5 Q 205.2 42.8 211.5 44 Q 205.2 45.2 204 51.5 Q 202.8 45.2 196.5 44 Q 202.8 42.8 204 36.5 Z",fill:"#5267f7"},children:[]}]},{tag:"g",attrs:{"data-fx":"thought"},children:[{tag:"g",attrs:{class:"b-dot b-dot-1"},children:[{tag:"circle",attrs:{cx:"190",cy:"62",r:"5.5",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"188.24",cy:"60.13",r:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-dot b-dot-2"},children:[{tag:"circle",attrs:{cx:"208",cy:"42",r:"7.5",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"205.6",cy:"39.45",r:"2.4",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-dot b-dot-3"},children:[{tag:"circle",attrs:{cx:"232",cy:"19",r:"10",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"228.8",cy:"15.6",r:"3.2",fill:"#ffffff",opacity:"0.85"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"question"},children:[{tag:"g",attrs:{class:"b-q"},children:[{tag:"path",attrs:{d:"M 206 34.84 C 206 23.92 228.36 23.92 228.36 34.84 C 228.36 43.16 217.18 43.16 217.18 52.52",fill:"none",stroke:"#5267f7","stroke-width":"7.5","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"circle",attrs:{cx:"217.18",cy:"62.92",r:"4.65",fill:"#5267f7"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"zzz"},children:[{tag:"g",attrs:{class:"b-z b-z-1"},children:[{tag:"path",attrs:{d:"M 188 62 H 201 L 188 75 H 201",fill:"none",stroke:"#5267f7","stroke-width":"5","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{class:"b-z b-z-2"},children:[{tag:"path",attrs:{d:"M 212 28 H 231 L 212 47 H 231",fill:"none",stroke:"#8695f9","stroke-width":"6","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"work"},children:[{tag:"g",attrs:{class:"b-key b-key-1"},children:[{tag:"rect",attrs:{x:"166",y:"50",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"171.28",y:"54.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-key b-key-2"},children:[{tag:"rect",attrs:{x:"194",y:"34",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"199.28",y:"38.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-key b-key-3"},children:[{tag:"rect",attrs:{x:"222",y:"54",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"227.28",y:"58.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"path",attrs:{class:"b-fly b-fly-1",d:"M 36 80 Q 37.92 90.08 48 92 Q 37.92 93.92 36 104 Q 34.08 93.92 24 92 Q 34.08 90.08 36 80 Z",fill:"#5267f7",style:"--coere-cori-fly-x:-10px"},children:[]},{tag:"path",attrs:{class:"b-fly b-fly-2",d:"M 58 44 Q 59.28 50.72 66 52 Q 59.28 53.28 58 60 Q 56.72 53.28 50 52 Q 56.72 50.72 58 44 Z",fill:"#8695f9",style:"--coere-cori-fly-x:-8px"},children:[]},{tag:"path",attrs:{class:"b-fly b-fly-3",d:"M 226 99 Q 227.44 106.56 235 108 Q 227.44 109.44 226 117 Q 224.56 109.44 217 108 Q 224.56 106.56 226 99 Z",fill:"#5267f7",style:"--coere-cori-fly-x:10px"},children:[]}]}]}};var ul={kind:"icon",svg:{tag:"svg",attrs:{viewBox:"0 0 24 24",class:"coere-cori-art",style:"--coere-cori-o-seat:12px 22.6px;--coere-cori-o-floor:12px 22.6px;--coere-cori-o-tuft:11.69px 6.6px;--coere-cori-tilt-dx:-8.53px;--coere-cori-look-k:0.12;--coere-cori-u:0.094"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"9",cy:"10",r:"16",fx:"8.4",fy:"9.4"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.32","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#485bd9"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"12",cy:"17.13",r:"10.53"},children:[{tag:"stop",attrs:{offset:"0.92","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-24",y:"-24",width:"72",height:"72"},children:[{tag:"rect",attrs:{x:"-24",y:"-24",width:"72",height:"72",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 12 6.6 C 18.36 6.6 22.6 11.64 22.6 19.2 C 22.6 21.17 20.67 22.6 18 22.6 C 15.6 22.6 14.4 22.6 12 22.6 C 9.6 22.6 8.4 22.6 6 22.6 C 3.33 22.6 1.4 21.17 1.4 19.2 C 1.4 11.64 5.64 6.6 12 6.6 Z"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 12 6.6 C 18.36 6.6 22.6 11.64 22.6 19.2 C 22.6 21.17 20.67 22.6 18 22.6 C 15.6 22.6 14.4 22.6 12 22.6 C 9.6 22.6 8.4 22.6 6 22.6 C 3.33 22.6 1.4 21.17 1.4 19.2 C 1.4 11.64 5.64 6.6 12 6.6 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"ellipse",attrs:{cx:"12.6",cy:"21.4",rx:"8",ry:"2.8",fill:"url(#g-glow)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 5.15 10.06 C 5.17 10.01 5.23 9.88 5.26 9.8 C 5.3 9.71 5.34 9.63 5.38 9.54 C 5.42 9.46 5.46 9.37 5.51 9.29 C 5.55 9.21 5.6 9.13 5.65 9.05 C 5.7 8.97 5.75 8.89 5.81 8.82 C 5.86 8.74 5.92 8.66 5.98 8.59 C 6.05 8.53 6.12 8.47 6.2 8.41 C 6.27 8.36 6.36 8.31 6.43 8.26 C 6.51 8.21 6.59 8.16 6.66 8.1 C 6.74 8.04 6.81 7.99 6.89 7.93 C 6.96 7.87 7.03 7.81 7.1 7.75 C 7.17 7.68 7.24 7.62 7.31 7.55 C 7.37 7.49 7.44 7.42 7.5 7.35 C 7.56 7.28 7.62 7.2 7.68 7.13 C 7.74 7.06 7.79 6.98 7.85 6.91 C 7.91 6.83 7.96 6.76 8.02 6.68 C 8.08 6.61 8.13 6.53 8.19 6.46 C 8.25 6.38 8.3 6.31 8.36 6.23 C 8.41 6.16 8.47 6.08 8.53 6.01 C 8.58 5.93 8.64 5.86 8.7 5.78 C 8.75 5.71 8.81 5.63 8.87 5.56 C 8.92 5.48 8.98 5.41 9.04 5.33 C 9.09 5.26 9.15 5.18 9.21 5.11 C 9.26 5.03 9.32 4.96 9.38 4.88 C 9.43 4.81 9.49 4.73 9.55 4.66 C 9.6 4.58 9.66 4.51 9.72 4.43 C 9.78 4.36 9.84 4.29 9.91 4.23 C 9.98 4.17 10.06 4.12 10.15 4.08 C 10.23 4.04 10.32 4.01 10.41 4 C 10.51 3.99 10.6 3.99 10.69 4 C 10.79 4.01 10.88 4.04 10.96 4.07 C 11.05 4.11 11.13 4.16 11.2 4.22 C 11.27 4.28 11.34 4.35 11.39 4.42 C 11.45 4.5 11.49 4.59 11.52 4.68 C 11.55 4.76 11.56 4.86 11.57 4.95 C 11.58 5.04 11.58 5.14 11.58 5.23 C 11.58 5.33 11.57 5.43 11.6 5.51 C 11.63 5.6 11.67 5.7 11.74 5.74 C 11.81 5.78 11.93 5.76 12.02 5.73 C 12.1 5.71 12.18 5.65 12.26 5.59 C 12.33 5.54 12.4 5.47 12.47 5.4 C 12.53 5.34 12.59 5.27 12.66 5.2 C 12.72 5.13 12.78 5.06 12.85 4.99 C 12.91 4.92 12.97 4.85 13.04 4.78 C 13.1 4.71 13.16 4.64 13.23 4.57 C 13.29 4.5 13.35 4.43 13.42 4.36 C 13.48 4.3 13.54 4.23 13.61 4.16 C 13.67 4.09 13.73 4.02 13.8 3.95 C 13.86 3.88 13.92 3.81 13.98 3.74 C 14.05 3.67 14.11 3.6 14.17 3.53 C 14.24 3.46 14.3 3.39 14.36 3.32 C 14.43 3.25 14.49 3.18 14.55 3.12 C 14.62 3.05 14.68 2.97 14.74 2.91 C 14.81 2.85 14.88 2.78 14.96 2.73 C 15.04 2.69 15.13 2.65 15.22 2.62 C 15.31 2.6 15.41 2.58 15.5 2.58 C 15.59 2.58 15.69 2.59 15.78 2.61 C 15.87 2.64 15.96 2.67 16.04 2.72 C 16.12 2.76 16.19 2.82 16.26 2.88 C 16.33 2.95 16.39 3.02 16.43 3.1 C 16.48 3.18 16.52 3.27 16.55 3.36 C 16.57 3.45 16.59 3.54 16.59 3.63 C 16.59 3.73 16.57 3.82 16.56 3.91 C 16.54 4 16.51 4.09 16.48 4.18 C 16.45 4.27 16.42 4.36 16.39 4.45 C 16.36 4.54 16.34 4.63 16.31 4.72 C 16.28 4.81 16.25 4.9 16.22 4.99 C 16.19 5.08 16.16 5.17 16.14 5.25 C 16.11 5.34 16.08 5.43 16.05 5.52 C 16.02 5.61 15.99 5.7 15.96 5.79 C 15.94 5.88 15.91 5.97 15.88 6.06 C 15.85 6.15 15.82 6.24 15.79 6.33 C 15.77 6.42 15.74 6.51 15.73 6.6 C 15.72 6.69 15.73 6.79 15.75 6.88 C 15.77 6.97 15.8 7.06 15.85 7.14 C 15.89 7.22 15.96 7.29 16.03 7.36 C 16.1 7.42 16.18 7.47 16.25 7.52 C 16.33 7.57 16.42 7.61 16.5 7.65 C 16.58 7.7 16.66 7.75 16.74 7.81 C 16.81 7.87 16.88 7.93 16.94 8 C 17 8.07 17.07 8.14 17.12 8.22 C 17.17 8.29 17.22 8.38 17.27 8.46 C 17.32 8.54 17.37 8.62 17.41 8.7 C 17.45 8.78 17.48 8.86 17.53 8.95 C 17.57 9.05 17.66 9.23 17.68 9.28 L 17.68 10.82 L 5.15 11.59 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"circle",attrs:{cx:"10.69",cy:"4.61",r:"2.23",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"15.74",cy:"3.28",r:"2.37",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"10.56",cy:"5",r:"1.93",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"15.52",cy:"3.65",r:"2.04",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 8.52 9.04 C 8.46 9.07 8.28 9.15 8.16 9.2 C 8.05 9.26 7.93 9.32 7.82 9.39 C 7.71 9.45 7.6 9.51 7.49 9.58 C 7.38 9.65 7.28 9.72 7.17 9.8 C 7.07 9.87 6.96 9.95 6.86 10.02 C 6.76 10.1 6.66 10.19 6.56 10.27 C 6.46 10.35 6.37 10.44 6.27 10.53 C 6.18 10.62 6.09 10.71 6 10.81 C 5.9 10.91 5.82 11 5.73 11.1 C 5.64 11.21 5.52 11.36 5.47 11.42",fill:"none",stroke:"#ffffff","stroke-width":"1.35","stroke-linecap":"round",opacity:"0.92"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:13px 16px"},children:[{tag:"rect",attrs:{x:"10",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"14",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 9.7 13.7 L 11.9 15.5 L 9.7 17.3",fill:"none",stroke:"#ffffff","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 16.3 13.7 L 14.1 15.5 L 16.3 17.3",fill:"none",stroke:"#ffffff","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 8 16 V 15 A 2 2 0 0 1 12 15 V 16 H 11 V 15 A 1 1 0 0 0 9 15 V 16 Z M 14 16 V 15 A 2 2 0 0 1 18 15 V 16 H 17 V 15 A 1 1 0 0 0 15 15 V 16 Z",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"11",y:"12",width:"2",height:"4",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"15",y:"12",width:"2",height:"4",rx:"1",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"10",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"14",y:"13",width:"2",height:"3",rx:"1",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 9 15 H 10 V 16 H 12 V 15 H 13 V 16.2 A 1 1 0 0 1 12 17 H 10 A 1 1 0 0 1 9 16.2 Z M 13.5 15 H 14.5 V 16 H 16.5 V 15 H 17.5 V 16.2 A 1 1 0 0 1 16.5 17 H 14.5 A 1 1 0 0 1 13.5 16.2 Z",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"rect",attrs:{x:"12.2",y:"19.4",width:"1.6",height:"1.6",rx:"0.8",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:13px 19.5px"},children:[{tag:"rect",attrs:{x:"12",y:"19.2",width:"2",height:"2",rx:"1",fill:"#243074"},children:[]}]}]}]}]}]}]}]}};function qw(e,t){return e.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g,(r,n,o)=>`url(${n}#${o}-${t}${n})`)}function Ir(e,t){let r={};for(let[n,o]of Object.entries(e))n==="id"?r[n]=`${o}-${t}`:(n==="href"||n==="xlink:href")&&o.startsWith("#")?r[n]=`${o}-${t}`:r[n]=qw(o,t);return r}function Mr(e,t){return e.children.map((r,n)=>Be(r.tag,{key:n,...Ir(r.attrs,t)},...Mr(r,t)))}function pl(e,t){let r={...Ir(e.svg.attrs,t),"aria-hidden":"true",focusable:"false"};return Be("svg",r,...Mr(e.svg,t))}function Xw(e){return e<=32?ul:e<64?ll:dl}function sr(e){let{size:t,controller:r,mood:n="idle",label:o="Cori",tappable:i=!1}=e,s=Te("coere-cori"),a=ir(null),c=Xw(t),l=Pr(()=>pl(c,s),[c,s]);sl(()=>{let d=a.current;return r&&d?r.attach(d):void 0},[r]);let u=r!==void 0,p=o===null?{"aria-hidden":"true"}:{role:"img","aria-label":o};return Be("span",{ref:a,class:pt("coere-cori",e.class),"data-art":c.kind,"data-mood":u?void 0:n,"data-tappable":i&&u?"":void 0,style:{width:`${t}px`,height:`${t}px`},onClick:i&&r?()=>r.react("cori"):void 0,...p},l)}function fl(e){return{delay:4e3+e()*3e3,double:e()<.2}}var ml=e=>Number.isFinite(e)?Math.max(-1,Math.min(1,e)):0;function hl(e){return e?{x:ml(e.x)*5+0,y:ml(e.y)*5+0}:{x:0,y:0}}var Jw="(prefers-reduced-motion: reduce)",Yw={matches:!1,addEventListener:()=>{},removeEventListener:()=>{}};function gl(e=globalThis){return e.matchMedia?e.matchMedia(Jw):Yw}var bl={cori:820,hop:620,wiggle:480,wake:520,blink:150};var Zw=540,Ot={talk:760,happy:1400,unsure:1600,coriFace:120,coriHappy:1200};function wl(e,t){switch(e){case"talk":return t?[{at:0,mood:"talking"},{at:Ot.talk,mood:"rest"}]:[{at:0,mood:"rest"}];case"happy":return[t?{at:0,mood:"happy",move:"hop"}:{at:0,mood:"happy"},{at:Ot.happy,mood:"rest"}];case"unsure":return[{at:0,mood:"confused"},{at:Ot.unsure,mood:"rest"}];case"cori":return t?[{at:0,mood:"poked",move:"cori"},{at:Ot.coriFace,mood:"happy"},{at:Ot.coriFace+Ot.coriHappy,mood:"rest"}]:[{at:0,mood:"happy"},{at:Ot.coriHappy,mood:"rest"}]}}function yl(e){return e?[{at:0,mood:"rest",move:"wake"},{at:Zw,move:"blink"}]:[{at:0,mood:"rest"}]}function xl(e,t){let r=new Map,n=null,o=()=>{if(n!==null&&e.clearTimeout(n),n=null,r.size===0||!t())return;let s=Math.min(...[...r.values()].map(a=>a.at));n=e.setTimeout(i,Math.max(0,s-e.now()))},i=()=>{n=null;let s=e.now(),a=[...r].filter(([,c])=>c.at<=s).sort((c,l)=>c[1].at-l[1].at);for(let[c,l]of a)r.get(c)===l&&(r.delete(c),l.run());o()};return{at(s,a,c){r.set(s,{at:e.now()+a,run:c}),o()},drop(...s){for(let a of s)r.delete(a);o()},clear(){r.clear(),o()},arm:o}}var ty={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),now:()=>performance.now()},ry={hidden:!1,addEventListener:()=>{},removeEventListener:()=>{}},ny=["cori","hop","wiggle","wake"],oy=["cori","hop","wiggle","wake","blink"],Dn=e=>`is-${e}`;function vl(e){let t=e.clock??ty,r=e.random??Math.random,n=e.motion??gl(),o=e.page??(typeof document>"u"?ry:document),i=new Set,s="idle",a="idle",c={x:0,y:0},l=!1,u=()=>!n.matches,p=R=>i.forEach(R),d=xl(t,()=>!l&&!o.hidden&&i.size>0),{at:f,drop:h}=d,w=R=>{a=R,p(ge=>ge.setAttribute("data-mood",R))},y=R=>{c=hl(R),p(b)},b=R=>{R.style.setProperty("--coere-cori-look-x",`${c.x}px`),R.style.setProperty("--coere-cori-look-y",`${c.y}px`)},v=()=>p(R=>R.classList.remove(...oy.map(Dn).filter(ge=>R.classList.contains(ge)))),E=R=>{if(!u())return;let ge=(R==="blink"?[R]:ny).map(Dn),Le=[...i].filter(ze=>ge.some(Qp=>ze.classList.contains(Qp)));Le.forEach(ze=>ze.classList.remove(...ge)),Le[0]&&Le[0].getBoundingClientRect(),p(ze=>ze.classList.add(Dn(R))),f(R==="blink"?"blink-end":"move-end",bl[R],()=>p(ze=>ze.classList.remove(Dn(R))))},T=(R,ge=0)=>{let Le=R[ge];if(!Le)return;Le.mood&&w(Le.mood==="rest"?s:Le.mood),Le.move&&E(Le.move);let ze=R[ge+1];ze?f("step",ze.at-Le.at,()=>T(R,ge+1)):h("step")},$=()=>{a!=="sleeping"&&E("blink")},W=()=>{if(!u())return h("blink");let{delay:R,double:ge}=fl(r);f("blink",R,()=>{$(),ge&&f("blink-again",260,$),W()})},Z=()=>{if(s!=="idle")return h("sleep");f("sleep",e.sleepAfterMs,()=>{s="sleeping",h("step"),w("sleeping")})},U=()=>{W(),Z()},se=()=>{d.clear(),w(s),v(),y(null)},ae=()=>{if(p(R=>R.toggleAttribute("data-alive",u())),u())return W();h("blink","blink-again","blink-end","move-end","look"),v(),y(null)},ot=()=>{o.hidden?se():i.size>0&&U()};return n.addEventListener("change",ae),o.addEventListener("visibilitychange",ot),{react(R){l||(s="idle",Z(),i.size>0&&T(wl(R,u())))},rest(R){l||(s=R,h("step"),w(R),(R==="thinking"||R==="working")&&E("wiggle"),Z())},look(R){l||!u()||(y(R),R?f("look",1200,()=>y(null)):h("look"))},poke(){l||(s==="sleeping"&&(s="idle",T(yl(u()))),Z())},attach(R){if(l)return()=>{};let ge=i.size===0;return i.add(R),R.setAttribute("data-mood",a),R.toggleAttribute("data-alive",u()),b(R),ge&&!o.hidden&&U(),()=>{i.delete(R)&&i.size===0&&se()}},dispose(){l||(l=!0,d.clear(),n.removeEventListener("change",ae),o.removeEventListener("visibilitychange",ot),i.clear())}}}function iy({size:e=16,label:t,children:r,class:n,...o}){let i=t?{role:"img","aria-label":t}:{"aria-hidden":"true"};return m("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":"1.75","stroke-linecap":"round","stroke-linejoin":"round",focusable:"false",class:n?`coere-icon ${String(n)}`:"coere-icon",...i,...o,children:r})}function N(e,t){let r=n=>m(iy,{...n,children:t()});return r.displayName=e,r}var Ri=N("CursorIcon",()=>m("path",{d:"M6 4.5l12 6.2-5.4 1.5-2.3 5.3z"})),kl=N("ArrowUpRightIcon",()=>m("path",{d:"M8 16L16.5 7.5M9.5 7.5h7v7"})),_l=N("GlobeIcon",()=>m(L,{children:[m("circle",{cx:"12",cy:"12",r:"7.75"}),m("path",{d:"M4.5 12h15M12 4.25c2.2 2.3 3.2 4.9 3.2 7.75S14.2 17.45 12 19.75C9.8 17.45 8.8 14.85 8.8 12S9.8 6.55 12 4.25z"})]})),sy=N("PenIcon",()=>m("path",{d:"M14.5 6l3.5 3.5M5 19l1-4.5L15.8 4.7a1.5 1.5 0 012.1 0l1.4 1.4a1.5 1.5 0 010 2.1L9.5 18z"})),ay=N("SendPlaneIcon",()=>m("path",{d:"M19.5 4.5L10.5 13.5M19.5 4.5l-5.5 15-3.5-6-6-3.5z"})),cy=N("CalendarIcon",()=>m(L,{children:[m("rect",{x:"4.5",y:"5.5",width:"15",height:"14",rx:"2.25"}),m("path",{d:"M4.5 10h15M8.5 3.5v4M15.5 3.5v4"})]})),ly=N("SaveIcon",()=>m("path",{d:"M4.5 13.5v4.25c0 .97.78 1.75 1.75 1.75h11.5c.97 0 1.75-.78 1.75-1.75V13.5M8.5 10l2.5 2.5 4.5-5"})),dy=N("OpenIcon",()=>m(L,{children:[m("rect",{x:"4.5",y:"5",width:"15",height:"14",rx:"2.25"}),m("path",{d:"M4.5 9h15"})]}));function ar(e){return!0}var Xe=e=>t=>{ar(t)&&e()};var uy={working:["take_over","go_to_chat","stop"],waiting:["take_over","go_to_chat","stop"],taken_over:["hand_back","stop"],result:["go_to_chat"]},py={take_over:x.TAKE_OVER,hand_back:x.HAND_BACK,go_to_chat:x.GO_TO_CHAT,stop:x.STOP};function fy(e){return e.mode==="taken_over"?x.YOU_HAVE_CONTROL:e.mode==="waiting"?x.WAITING_FOR_YOU:e.mode==="result"?e.result??"":e.step||x.WORKING_ON_TASK}function Ai({model:e,onPress:t}){let r=e.worker===null?x.CONTROLLED:x.controlledWorker(e.worker);return m("div",{class:"coere-act-bar",role:"region","aria-label":r,"data-mode":e.mode,children:[m("p",{class:"coere-act-bar-head",children:[m(Ri,{size:13}),m("span",{children:r})]}),m("div",{class:"coere-act-bar-row",children:[m(my,{resting:e.mode==="working"||e.mode==="waiting"}),m("p",{class:"coere-act-bar-step",role:"status","aria-live":"polite",children:fy(e)}),m("div",{class:"coere-act-bar-buttons",children:uy[e.mode].map(n=>m("button",{type:"button",class:"coere-act-bar-btn","data-button":n,onClick:Xe(()=>t(n)),children:[m("span",{children:py[n]}),n==="go_to_chat"&&m(kl,{size:14})]},n))})]})]})}function my({resting:e}){let t=Pr(()=>vl({sleepAfterMs:Number.MAX_SAFE_INTEGER}),[]);return Et(()=>t.rest(e?"working":"idle"),[t,e]),Et(()=>()=>t.dispose(),[t]),m(sr,{size:28,controller:t,label:null,class:"coere-act-bar-cori"})}function Sl({size:e=16,label:t,class:r}){let n=m("svg",{class:"coere-spinner-svg",viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":"2.5","stroke-linecap":"round","aria-hidden":"true",focusable:"false",children:[m("circle",{cx:"12",cy:"12",r:"9",opacity:"0.18"}),m("path",{d:"M21 12a9 9 0 00-9-9"})]});return t?m("span",{class:pt("coere-spinner",r),role:"status",children:[n,m("span",{class:"coere-sr-only",children:t})]}):m("span",{class:pt("coere-spinner",r),children:n})}function re({variant:e="secondary",size:t="md",icon:r,iconEnd:n,loading:o=!1,block:i=!1,type:s="button",disabled:a,class:c,children:l,...u}){return m("button",{type:s,class:pt("coere-btn",`coere-btn--${e}`,`coere-btn--${t}`,i&&"coere-btn--block",c),disabled:!!a||o,"aria-busy":o||void 0,...u,children:[o?m(Sl,{size:t==="sm"?13:15}):r,l!=null&&m("span",{class:"coere-btn-label",children:l}),n]})}var El=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<g transform="translate(3.75 3.75)">
<path fill="#fff" d="M148.882 43.618l-47.368-5.263-57.895 5.263-5.264 52.632 5.263 52.632 52.632 6.579 52.632-6.579 5.263-53.947z"/>
<path fill="#1a73e8" d="M65.211 125.276c-3.934-2.658-6.658-6.539-8.145-11.671l9.132-3.763c.829 3.158 2.276 5.605 4.342 7.342 2.053 1.737 4.553 2.592 7.474 2.592 2.987 0 5.553-.908 7.697-2.724s3.224-4.132 3.224-6.934c0-2.868-1.132-5.211-3.395-7.026s-5.105-2.724-8.5-2.724h-5.276v-9.039H76.5c2.921 0 5.382-.789 7.382-2.368 2-1.579 3-3.737 3-6.487 0-2.447-.895-4.395-2.684-5.855s-4.053-2.197-6.803-2.197c-2.684 0-4.816.711-6.395 2.145s-2.724 3.197-3.447 5.276l-9.039-3.763c1.197-3.395 3.395-6.395 6.618-8.987 3.224-2.592 7.342-3.895 12.342-3.895 3.697 0 7.026.711 9.974 2.145 2.947 1.434 5.263 3.421 6.934 5.947 1.671 2.539 2.5 5.382 2.5 8.539 0 3.224-.776 5.947-2.329 8.184-1.553 2.237-3.461 3.947-5.724 5.145v.539c2.987 1.25 5.421 3.158 7.342 5.724 1.908 2.566 2.868 5.632 2.868 9.211s-.908 6.776-2.724 9.579c-1.816 2.803-4.329 5.013-7.513 6.618-3.197 1.605-6.789 2.421-10.776 2.421C73.408 129.263 69.145 127.934 65.211 125.276z"/>
<path fill="#1a73e8" d="M121.25 79.961l-9.974 7.25-5.013-7.605 17.987-12.974h6.895v61.197h-9.895z"/>
<path fill="#ea4335" d="M148.882 196.25l47.368-47.368-23.684-10.526-23.684 10.526-10.526 23.684z"/>
<path fill="#34a853" d="M33.092 172.566l10.526 23.684h105.263v-47.368H43.618z"/>
<path fill="#4285f4" d="M12.039-3.75C3.316-3.75-3.75 3.316-3.75 12.039v136.842l23.684 10.526 23.684-10.526V43.618h105.263l10.526-23.684L148.882-3.75z"/>
<path fill="#188038" d="M-3.75 148.882v31.579c0 8.724 7.066 15.789 15.789 15.789h31.579v-47.368z"/>
<path fill="#fbbc04" d="M148.882 43.618v105.263h47.368V43.618l-23.684-10.526z"/>
<path fill="#1967d2" d="M196.25 43.618V12.039c0-8.724-7.066-15.789-15.789-15.789h-31.579v47.368z"/>
</g>
</svg>
`;var Cl=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 65">
<defs><linearGradient id="fold" x1="50%" y1="8.6%" x2="50%" y2="100%"><stop offset="0" stop-color="#1a237e" stop-opacity=".2"/><stop offset="1" stop-color="#1a237e" stop-opacity=".02"/></linearGradient></defs>
<path fill="#4285f4" d="M29.375 0H4.406C1.983 0 0 1.994 0 4.432v56.136C0 63.006 1.983 65 4.406 65h38.188C45.017 65 47 63.006 47 60.568V17.727L29.375 0z"/>
<path fill="url(#fold)" d="M30.664 16.431L47 32.858V17.727z"/>
<path fill="#f1f1f1" d="M11.75 47.273h23.5v-2.955h-23.5zm0 5.909h17.625v-2.955H11.75zm0-20.682v2.955h23.5V32.5zm0 8.864h23.5v-2.955h-23.5z"/>
<path fill="#a1c2fa" d="M29.375 0v13.295c0 2.449 1.972 4.432 4.406 4.432H47z"/>
</svg>
`;var Rl=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66">
<path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
<path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
<path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
<path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
<path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
</svg>`;var Tl=["svg","g","path","circle","ellipse","rect","line","polyline","polygon","defs","linearGradient","radialGradient","stop","clipPath","mask"],wy=new Map([...Tl,"viewBox","gradientTransform","gradientUnits","preserveAspectRatio","clipPathUnits","maskUnits","maskContentUnits","spreadMethod"].map(e=>[e.toLowerCase(),e])),yy=new Set(Tl);function Al(e){return wy.get(e.toLowerCase())??e}function xy(e,t){let r=e.toLowerCase();if(r.startsWith("on")||r.startsWith("xmlns")||r==="style")return!1;if(r==="href"||r==="xlink:href")return t.startsWith("#");let n=t.match(/url\(([^)]*)\)/gi);return!n||n.every(o=>/^url\(\s*['"]?#/i.test(o))}function Pl(e){let t=Al(e.localName);if(!yy.has(t))return null;let r={};for(let o of Array.from(e.attributes))xy(o.name,o.value)&&(r[Al(o.name)]=o.value);let n=[];for(let o of Array.from(e.children)){let i=Pl(o);i&&n.push(i)}return{tag:t,attrs:r,children:n}}function Il(e){if(!e.trim())return null;let t=new DOMParser().parseFromString(e,"image/svg+xml"),r=t.documentElement;return!r||r.localName.toLowerCase()!=="svg"||t.getElementsByTagName("parsererror").length>0?null:Pl(r)}var vy={gmail:Rl,calendar:El,docs:Cl},Ti=new Map;function ky(e){if(!Ti.has(e)){let t=Il(vy[e]);Ti.set(e,t&&t.children.length>0?t:null)}return Ti.get(e)??null}function Lr({icon:e,size:t=16}){let r=Te("coere-site"),n=e==="globe"?null:ky(e);if(!n)return m(_l,{size:t,class:"coere-act-site-globe"});let{width:o,height:i,...s}=n.attrs;return Be("svg",{...Ir(s,r),class:"coere-act-site","data-site":e,width:t,height:t,"aria-hidden":"true",focusable:"false"},...Mr(n,r))}function Pi({model:e,onAnswer:t}){let r=Te("coere-act-review"),[n,o]=Lt({});Et(()=>o({}),[e.step]);let i=s=>Xe(()=>t(s,n));return m("section",{class:"coere-act-card coere-act-review","aria-labelledby":r,children:[m("p",{id:r,class:"coere-act-card-title",children:[m(Lr,{icon:e.site.icon}),m("span",{children:e.line})]}),e.reason&&m("p",{class:"coere-act-card-line",children:e.reason}),e.fields.length>0&&m("div",{class:"coere-act-fields",children:e.fields.map(s=>m(Sy,{field:s,value:n[s.label]??s.value,onEdit:a=>o(c=>_y(c,s,a))},s.label))}),e.choices.length>0?m("div",{class:"coere-act-chips",role:"group","aria-labelledby":r,children:e.choices.map((s,a)=>m("button",{type:"button",class:"coere-act-chip",onClick:i(a),children:s},s))}):null,m("div",{class:"coere-act-actions",children:[e.choices.length===0&&m(re,{variant:"primary",size:"sm",onClick:i("allow"),children:x.ALLOW}),e.choices.length===0&&e.allowForTask&&m(re,{size:"sm",onClick:i("allow_task"),children:x.ALLOW_FOR_TASK}),m(re,{variant:"quiet",size:"sm",class:"coere-act-stop",onClick:i("stop"),children:x.STOP})]})]})}function _y(e,t,r){let n={...e};return r===t.value?delete n[t.label]:n[t.label]=r,n}function Sy({field:e,value:t,onEdit:r}){let n=Te("coere-act-field"),o=e.label===x.FIELD_LABELS.body;if(!e.editable)return m("div",{class:"coere-act-field","data-long":o?"":void 0,children:[m("span",{class:"coere-act-field-label",children:e.label}),m("span",{class:"coere-act-field-value",children:e.value})]});let i=s=>r(s.currentTarget.value);return m("div",{class:"coere-act-field is-editable","data-long":o?"":void 0,children:[m("label",{class:"coere-act-field-label",for:n,children:e.label}),o?m("textarea",{id:n,class:"coere-act-input",rows:5,value:t,onInput:i}):m("input",{id:n,class:"coere-act-input",type:"text",value:t,onInput:i})]})}function Ml({label:e,size:t="md",type:r="button",class:n,children:o,...i}){return m("button",{type:r,"aria-label":e,title:e,class:pt("coere-icon-btn",`coere-icon-btn--${t}`,n),...i,children:o})}var DL=N("HomeIcon",()=>m(L,{children:[m("path",{d:"M4.25 10.5L12 4.25l7.75 6.25"}),m("path",{d:"M6.25 9v9.25c0 .69.56 1.25 1.25 1.25h9c.69 0 1.25-.56 1.25-1.25V9"}),m("path",{d:"M10 19.5v-4.25c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v4.25"})]})),Ey=N("SearchIcon",()=>m(L,{children:[m("circle",{cx:"11",cy:"11",r:"6.5"}),m("path",{d:"M20 20l-4.35-4.35"})]})),Ll=N("CloseIcon",()=>m("path",{d:"M6.5 6.5l11 11M17.5 6.5l-11 11"})),HL=N("ChevronUpIcon",()=>m("path",{d:"M6.5 14.5L12 9l5.5 5.5"})),BL=N("ChevronDownIcon",()=>m("path",{d:"M6.5 9.5L12 15l5.5-5.5"})),FL=N("ChevronRightIcon",()=>m("path",{d:"M9.5 6.5L15 12l-5.5 5.5"})),UL=N("ChevronLeftIcon",()=>m("path",{d:"M14.5 6.5L9 12l5.5 5.5"})),$L=N("ExternalLinkIcon",()=>m(L,{children:[m("path",{d:"M14 4.5h5.5V10M19.5 4.5L11.5 12.5"}),m("path",{d:"M17.5 13.5v4.25a1.75 1.75 0 01-1.75 1.75h-9.5a1.75 1.75 0 01-1.75-1.75v-9.5A1.75 1.75 0 016.25 6.5h4.25"})]})),jL=N("MinimizeIcon",()=>m("path",{d:"M4.5 19.5L10 14M5.5 14H10v4.5M19.5 4.5L14 10M18.5 10H14V5.5"}));var Ol=[["mode_rewrite",x.MODE_REWRITE],["mode_improve",x.MODE_IMPROVE],["mode_grammar",x.MODE_GRAMMAR]];function Nl({onPress:e}){let t=ir(null);return Et(()=>{t.current?.querySelector("button")?.focus()},[]),m("div",{class:"coere-act-modes",ref:t,onKeyDown:n=>{let o=["1","2","3"].indexOf(n.key);o<0||!ar(n)||(n.preventDefault(),n.stopPropagation(),e(Ol[o][0]))},children:Ol.map(([n,o],i)=>m(re,{size:"sm",variant:i===0?"primary":"secondary",onClick:Xe(()=>e(n)),children:[m("kbd",{"aria-hidden":"true",children:i+1}),o]},n))})}function Dl({onPress:e}){return m("div",{class:"coere-act-review",children:[m(sr,{size:20,mood:"happy",label:null}),m(re,{variant:"primary",size:"sm",onClick:Xe(()=>e("looks_good")),children:x.LOOKS_GOOD}),m(re,{size:"sm",onClick:Xe(()=>e("go_back")),children:x.GO_BACK})]})}function Cy(e,t){let r=e.ownerDocument,n=r.createElement("textarea");n.value=t,n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;left:-9999px;top:0;opacity:0",(e.parentElement??r.body).append(n),n.select();let o=r.execCommand?.("copy")===!0;n.remove(),o||r.defaultView?.navigator.clipboard?.writeText(t).catch(()=>{})}function Hl({text:e,edits:t,onPress:r}){let n=o=>{ar(o)&&(Cy(o.currentTarget,e),r("copy"))};return m(L,{children:[m("div",{class:"coere-act-rewrite-text",children:[m("p",{class:"coere-act-rewrite-now",children:e}),t.length>0&&m("ul",{class:"coere-act-edits",children:t.map((o,i)=>m("li",{class:"coere-act-edit",children:[o.old&&m("s",{children:o.old}),o.now&&m("ins",{children:o.now})]},i))})]}),m("div",{class:"coere-act-actions",children:m(re,{variant:"primary",size:"sm",onClick:n,children:x.COPY})})]})}function Hn({model:e,mac:t,onPress:r}){let n=Te("coere-act-rewrite"),o=a=>Xe(()=>r(a)),i=a=>{a.key==="Escape"&&ar(a)&&(a.stopPropagation(),r(e.state==="review"?"go_back":"close"))},s=e.mode?x.modeName(e.mode):x.MENU_REWRITE;return e.state==="review"?m("section",{class:"coere-act-card coere-act-rewrite","aria-label":s,"data-state":"review",onKeyDown:i,children:m(Dl,{onPress:r})}):e.state==="picker"?m("section",{class:"coere-act-card coere-act-rewrite","aria-labelledby":n,"data-state":"picker",onKeyDown:i,children:[m("p",{id:n,class:"coere-act-card-title",children:x.MENU_REWRITE}),m(Nl,{onPress:r})]}):m("section",{class:"coere-act-card coere-act-rewrite","aria-labelledby":n,"data-state":e.state,onKeyDown:i,children:[m("div",{class:"coere-act-rewrite-head",children:[m(sr,{size:20,mood:e.state==="working"?"working":"happy",label:null}),m("p",{id:n,class:"coere-act-card-title",role:"status",children:Ry(e,t)}),m(Ml,{label:x.CLOSE,size:"sm",onClick:o("close"),children:m(Ll,{})})]}),e.state==="preview"&&m(L,{children:[m("div",{class:"coere-act-rewrite-text",children:[m("s",{class:"coere-act-rewrite-was",children:e.original}),m("p",{class:"coere-act-rewrite-now",children:e.rewrite})]}),m("div",{class:"coere-act-chips",children:[m("button",{type:"button",class:"coere-act-chip",onClick:o("shorter"),children:x.SHORTER}),m("button",{type:"button",class:"coere-act-chip",onClick:o("more_formal"),children:x.MORE_FORMAL})]}),m("div",{class:"coere-act-actions",children:[m(re,{variant:"primary",size:"sm",onClick:o("accept"),children:x.ACCEPT}),m(re,{size:"sm",onClick:o("try_again"),children:x.TRY_AGAIN})]})]}),(e.state==="paste"||e.state==="copied")&&m(Hl,{text:e.rewrite,edits:e.edits??[],onPress:r}),e.state==="check"&&m("div",{class:"coere-act-actions",children:[m(re,{variant:"primary",size:"sm",onClick:o("yes"),children:x.YES}),m(re,{size:"sm",onClick:o("undo"),children:x.UNDO})]}),e.state==="done"&&e.undoLeft!==null&&e.undoLeft>0&&m("div",{class:"coere-act-actions",children:m(re,{size:"sm",onClick:o("undo"),children:x.UNDO})})]})}function Ry(e,t){switch(e.state){case"working":return e.original?x.REWRITING:x.pressCopy(t);case"preview":return x.REWRITING;case"copied":return x.copiedPaste(t);case"paste":return x.pasteLine(t);case"check":return x.DID_IT_GO_IN;case"done":return x.REWRITTEN;case"none":return x.NOTHING_TO_CHANGE;case"picker":case"review":return x.MENU_REWRITE}}var Ay=N("CheckIcon",()=>m("path",{d:"M5 12.5l4.5 4.5L19 7.5"})),l7=N("AlertIcon",()=>m(L,{children:[m("path",{d:"M10.4 4.9a1.85 1.85 0 013.2 0l6.95 12.1a1.85 1.85 0 01-1.6 2.75H5.05a1.85 1.85 0 01-1.6-2.75z"}),m("path",{d:"M12 9.75v3.5M12 16.25v.01"})]})),d7=N("InfoIcon",()=>m(L,{children:[m("circle",{cx:"12",cy:"12",r:"8.5"}),m("path",{d:"M12 11.25v4.75M12 8v.01"})]})),u7=N("ClockIcon",()=>m(L,{children:[m("circle",{cx:"12",cy:"12",r:"8.5"}),m("path",{d:"M12 7.5V12l3 2"})]})),Ty=N("EyeIcon",()=>m(L,{children:[m("path",{d:"M2.75 12S6.1 5.75 12 5.75 21.25 12 21.25 12 17.9 18.25 12 18.25 2.75 12 2.75 12z"}),m("circle",{cx:"12",cy:"12",r:"2.75"})]}));var Je={color:"#5267f7",band:14,from:.55,to:.85,breathMs:2400,still:2,reduced:.7},Fe={maxWidth:560,gutter:16,bottom:16,stackBelow:480,radius:16},Ii={width:360,gap:8};function Mi(e,t,r=0){let n=Math.min(Fe.maxWidth,e.width-2*Fe.gutter),o=(e.width-n)/2;return{x:Math.min(Math.max(o+r,Fe.gutter),e.width-Fe.gutter-n),y:e.height-Fe.bottom-t,width:n,height:t,stacked:e.width<Fe.stackBelow}}function Bl(e,t,r){let n=Math.min(Ii.width,e.width-2*Fe.gutter),o=Math.min(Math.max(t.x,Fe.gutter),e.width-Fe.gutter-n),i=t.y+t.height+Ii.gap,s=i+r<=e.height-Fe.gutter?i:Math.max(Fe.gutter,t.y-Ii.gap-r);return{x:o,y:s,width:n,height:r}}var Or={cols:"ABCDEFGH",rows:6};function Fl(e,t){let r=/^([A-H])([1-6])$/.exec(e);if(!r)return null;let n=t.width/Or.cols.length,o=t.height/Or.rows;return{x:Or.cols.indexOf(r[1])*n,y:(Number(r[2])-1)*o,width:n,height:o}}function Ul(e){let t=[];for(let r=1;r<=Or.rows;r++)for(let n of Or.cols)t.push({cell:`${n}${r}`,box:Fl(`${n}${r}`,e)});return t}function Fn(e,t){let r=Fl(e.cell,t),n=o=>Number.isFinite(o)&&o>=0&&o<=1;return!r||!n(e.x)||!n(e.y)?null:{x:Math.round(r.x+e.x*r.width),y:Math.round(r.y+e.y*r.height)}}var Bn={height:16,pad:8,digit:7};function $l(e,t){let r=[];for(let{n,rect:o}of e){if(!(o.x<t.width&&o.x+o.width>0&&o.y<t.height&&o.y+o.height>0))continue;let s=Bn.pad+String(n).length*Bn.digit,a={x:Math.min(Math.max(o.x,0),t.width-s),y:Math.min(Math.max(o.y,0),t.height-Bn.height),width:s,height:Bn.height};r.push({n,tag:a,outline:o})}return r}var Py=220,Iy={review:52,picker:96,working:64,none:52};function Li({state:e,mac:t,onPress:r,drag:n=0,onDrag:o}){let[i,s]=Lt(n),a=ir(null),c=f=>{let h=f.currentTarget;if(f.button!==0||f.target.closest("button, input, textarea, a"))return;let w=h.ownerDocument.defaultView??window,y={width:w.innerWidth,height:w.innerHeight},b=Mi(y,0);a.current={startX:f.clientX,from:i,limit:Math.max(0,b.x-Mi(y,0,-y.width).x)},h.setPointerCapture(f.pointerId)},l=f=>{let h=a.current;h&&s(Math.max(-h.limit,Math.min(h.limit,h.from+f.clientX-h.startX)))},u=()=>{a.current&&a.current.from!==i&&o?.(i),a.current=null},p=e.rewrite&&e.rewriteAt?My(e.rewriteAt,Iy[e.rewrite.state]??Py):null,d=e.cardOnly===!0;return m("div",{class:"coere-root coere-act-overlay","data-hidden":e.visible?void 0:"",children:[!d&&m(_i,{mode:e.glow}),m("div",{class:"coere-act-dock",style:{"--coere-act-x":`${i}px`},onPointerDown:c,onPointerMove:l,onPointerUp:u,onPointerCancel:u,children:[e.card&&m("div",{class:"coere-act-dock-card coere-enter",children:m(Pi,{model:e.card,onAnswer:(f,h)=>r({kind:"card",step:e.card?.step??0,choice:f,edited:h})})}),e.rewrite&&!p&&m("div",{class:"coere-act-dock-card coere-enter",children:m(Hn,{model:e.rewrite,mac:t,onPress:f=>r({kind:"rewrite",button:f})})}),!d&&m(Ai,{model:e.bar,onPress:f=>r({kind:"bar",button:f})})]}),e.rewrite&&p&&m("div",{class:"coere-act-float coere-enter",style:{left:`${p.x}px`,top:`${p.y}px`,width:`${p.width}px`},children:m(Hn,{model:e.rewrite,mac:t,onPress:f=>r({kind:"rewrite",button:f})})})]})}function My(e,t){let r={width:window.innerWidth,height:window.innerHeight};return Bl(r,e,t)}var jl=`:root, :host, [data-theme='light'] { --coere-cori-floor: #080e24; --coere-cori-floor-o: 0.2; --coere-cori-glow-o: 0.3; }
[data-theme='dark'], :host([data-theme='dark']) { --coere-cori-floor: #02040c; --coere-cori-floor-o: 0.7; --coere-cori-glow-o: 0.42; }
.coere-cori { --coere-cori-look-x: 0px; --coere-cori-look-y: 0px; --coere-cori-glance-x: 0px; --coere-cori-glance-y: 0px; }
.coere-cori .coere-cori-art { display: block; width: 100%; height: 100%; overflow: visible; forced-color-adjust: none; }
.coere-cori .b-shadow, .coere-cori .b-shadow-pose, .coere-cori .b-figure, .coere-cori .b-pose, .coere-cori .b-mood, .coere-cori .b-tuft, .coere-cori .b-tuft-mood, .coere-cori .b-tuft-pose, .coere-cori .b-face, .coere-cori .b-blink, .coere-cori .b-talk { transform-box: view-box; }
.coere-cori .b-figure, .coere-cori .b-pose, .coere-cori .b-mood { transform-origin: var(--coere-cori-o-seat); }
.coere-cori .b-shadow, .coere-cori .b-shadow-pose { transform-origin: var(--coere-cori-o-floor); }
.coere-cori .b-tuft, .coere-cori .b-tuft-mood, .coere-cori .b-tuft-pose { transform-origin: var(--coere-cori-o-tuft); }
.coere-cori .b-spark, .coere-cori .b-dot, .coere-cori .b-z, .coere-cori .b-q, .coere-cori .b-key, .coere-cori .b-fly, .coere-cori [data-eyes], .coere-cori [data-mouth] { transform-box: fill-box; transform-origin: center; }
.coere-cori [data-eyes], .coere-cori [data-mouth], .coere-cori [data-fx] { display: none; }
.coere-cori[data-mood='idle'] [data-eyes='open'],
.coere-cori[data-mood='idle'] [data-mouth='smile'],
.coere-cori[data-mood='poked'] [data-eyes='squeeze'],
.coere-cori[data-mood='poked'] [data-mouth='o'],
.coere-cori[data-mood='happy'] [data-eyes='happy'],
.coere-cori[data-mood='happy'] [data-mouth='open'],
.coere-cori[data-mood='happy'] [data-fx='sparkles'],
.coere-cori[data-mood='thinking'] [data-eyes='up'],
.coere-cori[data-mood='thinking'] [data-mouth='hmm'],
.coere-cori[data-mood='thinking'] [data-fx='thought'],
.coere-cori[data-mood='working'] [data-eyes='happy'],
.coere-cori[data-mood='working'] [data-mouth='smile'],
.coere-cori[data-mood='working'] [data-fx='work'],
.coere-cori[data-mood='talking'] [data-eyes='open'],
.coere-cori[data-mood='talking'] [data-mouth='talk'],
.coere-cori[data-mood='confused'] [data-eyes='unsure'],
.coere-cori[data-mood='confused'] [data-mouth='wavy'],
.coere-cori[data-mood='confused'] [data-fx='question'],
.coere-cori[data-mood='sleeping'] [data-eyes='closed'],
.coere-cori[data-mood='sleeping'] [data-mouth='sleep'],
.coere-cori[data-mood='sleeping'] [data-fx='zzz'] { display: inline; }
.coere-cori[data-mood='idle'] .b-cheeks { opacity: 0.55; }
.coere-cori[data-mood='poked'] .b-cheeks { opacity: 0.8; }
.coere-cori[data-mood='happy'] .b-cheeks { opacity: 0.8; }
.coere-cori[data-mood='thinking'] .b-cheeks { opacity: 0.4; }
.coere-cori:not([data-art='icon'])[data-mood='thinking'] { --coere-cori-glance-x: 3.6px; --coere-cori-glance-y: -2.7px; }
.coere-cori[data-mood='thinking'] .b-tips { opacity: 0.8; }
.coere-cori[data-mood='working'] .b-cheeks { opacity: 0.8; }
.coere-cori[data-mood='working'] .b-tips { opacity: 0.8; }
.coere-cori[data-mood='talking'] .b-cheeks { opacity: 0.55; }
.coere-cori[data-mood='confused'] .b-cheeks { opacity: 0.4; }
.coere-cori[data-mood='sleeping'] .b-cheeks { opacity: 0.55; }
.coere-cori[data-mood='poked']:not([data-alive]) .b-tuft-mood { transform: skewX(10deg); }
.coere-cori:not([data-art='icon'])[data-mood='poked']:not([data-alive]) .b-mood { transform: scale(1.12, 0.87); }
.coere-cori:not([data-art='icon'])[data-mood='poked']:not([data-alive]) .b-shadow-pose { scale: 1.12 1; }
.coere-cori[data-mood='happy'] .b-tuft-mood { transform: skewX(-7deg); }
.coere-cori:not([data-art='icon'])[data-mood='happy'] .b-mood { transform: scale(1.03, 0.97); }
.coere-cori:not([data-art='icon'])[data-mood='happy'] .b-shadow-pose { scale: 1.03 1; }
.coere-cori[data-mood='thinking'] .b-tuft-mood { transform: skewX(5deg); }
.coere-cori[data-mood='working'] .b-tuft-mood { transform: skewX(6deg); }
.coere-cori[data-mood='confused'] .b-tuft-mood { transform: skewX(6deg); }
.coere-cori:not([data-art='icon'])[data-mood='confused'] .b-mood { transform: translate(var(--coere-cori-tilt-dx), 0) rotate(-6deg) translate(calc(-1 * var(--coere-cori-tilt-dx)), 0); }
.coere-cori:not([data-art='icon'])[data-mood='confused'] .b-shadow { translate: calc(-9px * var(--coere-cori-u)) 0; }
.coere-cori:not([data-art='icon'])[data-mood='confused'] .b-shadow-pose { scale: 0.92 1; }
.coere-cori[data-mood='sleeping'] .b-tuft-mood { transform: skewX(-8deg); }
.coere-cori:not([data-art='icon'])[data-mood='sleeping'] .b-mood { transform: scale(1.03, 0.97); }
.coere-cori:not([data-art='icon'])[data-mood='sleeping'] .b-shadow-pose { scale: 1.03 1; }
.coere-cori .b-mood { transition: transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1); }
.coere-cori .b-tuft-mood { transition: transform 420ms cubic-bezier(0.34, 1.4, 0.64, 1); }
.coere-cori .b-cheeks { transition: opacity 200ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.coere-cori .b-shadow { transition: translate 320ms cubic-bezier(0.34, 1.4, 0.64, 1); }
.coere-cori .b-shadow-pose { transition: scale 320ms cubic-bezier(0.34, 1.4, 0.64, 1); }
.coere-cori .b-face {
  transform: translate(calc((var(--coere-cori-look-x) + var(--coere-cori-glance-x)) * var(--coere-cori-look-k)), calc((var(--coere-cori-look-y) + var(--coere-cori-glance-y)) * var(--coere-cori-look-k)));
  transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.coere-cori[data-alive] .b-figure { animation: coere-cori-breathe 3.4s steps(17) infinite; }
.coere-cori[data-alive] .b-shadow { animation: coere-cori-floor 3.4s steps(17) infinite; }
.coere-cori[data-alive] .b-tuft { animation: coere-cori-sway 3.4s steps(17) 0.5s infinite; }
@keyframes coere-cori-breathe { 0%, 100% { translate: 0 0; scale: 1 1; } 50% { translate: 0 calc(-2.4px * var(--coere-cori-u)); scale: 0.988 1.014; } }
@keyframes coere-cori-floor { 0%, 100% { scale: 1 1; opacity: 1; } 50% { scale: 0.93 1; opacity: 0.8; } }
@keyframes coere-cori-sway { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(-3.5deg); } }
.coere-cori[data-alive][data-mood='sleeping'] .b-figure { animation: coere-cori-breathe-sleep 5.6s steps(28) infinite; }
.coere-cori[data-alive][data-mood='sleeping'] .b-shadow, .coere-cori[data-alive][data-mood='sleeping'] .b-tuft { animation-duration: 5.6s; animation-timing-function: steps(28); }
.coere-cori[data-alive][data-mood='sleeping'] .b-z { animation: coere-cori-zee 2.8s ease-in-out infinite both; }
.coere-cori[data-alive][data-mood='sleeping'] .b-z-2 { animation-delay: 1.4s; }
@keyframes coere-cori-breathe-sleep { 0%, 100% { scale: 1 1; } 50% { scale: 1.022 0.978; } }
@keyframes coere-cori-zee {
  0% { opacity: 0; translate: calc(-6px * var(--coere-cori-u)) calc(10px * var(--coere-cori-u)); scale: 0.6; }
  30%, 65% { opacity: 1; }
  100% { opacity: 0; translate: calc(8px * var(--coere-cori-u)) calc(-12px * var(--coere-cori-u)); scale: 1.1; }
}
.coere-cori[data-alive][data-mood='happy'] [data-eyes='happy'], .coere-cori[data-alive][data-mood='happy'] [data-mouth='open'] { animation: coere-cori-pop 300ms cubic-bezier(0.34, 1.4, 0.64, 1) both; }
.coere-cori[data-alive][data-mood='happy'] .b-spark { animation: coere-cori-spark 520ms cubic-bezier(0.34, 1.4, 0.64, 1) both, coere-cori-twinkle 1.6s ease-in-out 600ms infinite alternate; }
.coere-cori[data-alive][data-mood='happy'] .b-spark-2 { animation-delay: 70ms, 670ms; }
.coere-cori[data-alive][data-mood='happy'] .b-spark-3 { animation-delay: 140ms, 740ms; }
@keyframes coere-cori-pop { 0% { scale: 0.6; } 100% { scale: 1; } }
@keyframes coere-cori-spark { 0% { scale: 0.2; rotate: -40deg; opacity: 0; } 100% { scale: 1; rotate: 0deg; opacity: 1; } }
@keyframes coere-cori-twinkle { 0% { scale: 1; } 100% { scale: 0.8; } }
.coere-cori[data-alive][data-mood='thinking'] .b-tips { animation: coere-cori-tips 1.1s ease-in-out infinite alternate; }
.coere-cori[data-alive][data-mood='thinking'] .b-dot { animation: coere-cori-dot-in 360ms cubic-bezier(0.34, 1.4, 0.64, 1) both, coere-cori-dot-bob 1.2s ease-in-out 400ms infinite alternate; }
.coere-cori[data-alive][data-mood='thinking'] .b-dot-2 { animation-delay: 160ms, 560ms; }
.coere-cori[data-alive][data-mood='thinking'] .b-dot-3 { animation-delay: 320ms, 720ms; }
@keyframes coere-cori-tips { 0% { opacity: 0.25; } 100% { opacity: 0.9; } }
@keyframes coere-cori-dot-in { 0% { scale: 0; opacity: 0; } 100% { scale: 1; opacity: 1; } }
@keyframes coere-cori-dot-bob { 0% { translate: 0 0; } 100% { translate: 0 calc(-3px * var(--coere-cori-u)); } }
.coere-cori[data-alive][data-mood='working'] .b-figure { animation: coere-cori-bob 420ms steps(4) infinite; }
.coere-cori[data-alive][data-mood='working'] .b-shadow { animation: coere-cori-floor-bob 420ms steps(4) infinite; }
.coere-cori[data-alive][data-mood='working'] .b-tuft { animation: coere-cori-sway-work 600ms steps(3) infinite; }
@keyframes coere-cori-bob { 0%, 100% { translate: 0 0; scale: 1 1; } 50% { translate: 0 calc(-3.2px * var(--coere-cori-u)); scale: 0.985 1.02; } }
@keyframes coere-cori-floor-bob { 0%, 100% { scale: 1 1; opacity: 1; } 50% { scale: 0.92 1; opacity: 0.78; } }
@keyframes coere-cori-sway-work { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(-5deg); } }
.coere-cori[data-alive][data-mood='working'] .b-key { animation: coere-cori-key 360ms cubic-bezier(0.2, 0.8, 0.2, 1) infinite; }
.coere-cori[data-alive][data-mood='working'] .b-key-2 { animation-delay: 120ms; }
.coere-cori[data-alive][data-mood='working'] .b-key-3 { animation-delay: 240ms; }
@keyframes coere-cori-key { 0%, 100% { scale: 1 1; translate: 0 0; } 30% { scale: 1.08 0.7; translate: 0 calc(3px * var(--coere-cori-u)); } 65% { scale: 0.96 1.1; translate: 0 calc(-1.5px * var(--coere-cori-u)); } }
.coere-cori[data-alive][data-mood='working'] .b-fly { animation: coere-cori-fly 700ms cubic-bezier(0.2, 0.8, 0.2, 1) infinite both; }
.coere-cori[data-alive][data-mood='working'] .b-fly-2 { animation-delay: 230ms; }
.coere-cori[data-alive][data-mood='working'] .b-fly-3 { animation-delay: 460ms; }
@keyframes coere-cori-fly { 0% { opacity: 0; scale: 0.3; translate: 0 calc(8px * var(--coere-cori-u)); } 30% { opacity: 1; scale: 1; } 100% { opacity: 0; scale: 0.5; translate: calc(var(--coere-cori-fly-x) * var(--coere-cori-u)) calc(-16px * var(--coere-cori-u)); } }
.coere-cori[data-alive][data-mood='talking'] .b-talk { animation: coere-cori-talk 760ms ease-in-out infinite; }
@keyframes coere-cori-talk { 0%, 100% { scale: 1 1; } 20% { scale: 1 0.35; } 40% { scale: 1 0.85; } 55% { scale: 1 0.4; } 78% { scale: 1 1; } 90% { scale: 1 0.7; } }
.coere-cori[data-alive][data-mood='confused'] .b-q { animation: coere-cori-spark 340ms cubic-bezier(0.34, 1.4, 0.64, 1) 80ms both; }
.coere-cori.is-blink .b-blink { animation: coere-cori-blink 150ms cubic-bezier(0.2, 0.8, 0.2, 1); }
@keyframes coere-cori-blink { 0%, 100% { scale: 1 1; } 45% { scale: 1.05 0.1; } }
.coere-cori.is-cori .b-pose { animation: coere-cori-squash 620ms both; }
.coere-cori.is-cori .b-shadow-pose { animation: coere-cori-squash-floor 620ms both; }
.coere-cori.is-cori .b-tuft-pose { animation: coere-cori-flick 820ms both; }
@keyframes coere-cori-squash {
  0% { scale: 1 1; translate: 0 0; animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1); }
  16% { scale: 1.17 0.8; translate: 0 0; animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1); }
  40% { scale: 0.9 1.12; translate: 0 calc(-7px * var(--coere-cori-u)); animation-timing-function: cubic-bezier(0.5, 0, 0.7, 0.4); }
  62% { scale: 1.05 0.96; translate: 0 0; animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
  80% { scale: 0.985 1.015; translate: 0 0; }
  100% { scale: 1 1; translate: 0 0; }
}
@keyframes coere-cori-squash-floor { 0%, 100% { scale: 1 1; opacity: 1; } 16% { scale: 1.16 1; opacity: 1; } 40% { scale: 0.8 1; opacity: 0.55; } 62% { scale: 1.06 1; opacity: 1; } }
@keyframes coere-cori-flick {
  0% { transform: skewX(0deg); } 16% { transform: skewX(10deg); } 40% { transform: skewX(-15deg); }
  62% { transform: skewX(8deg); } 80% { transform: skewX(-3.5deg); } 100% { transform: skewX(0deg); }
}
.coere-cori.is-hop .b-pose { animation: coere-cori-hop 460ms both; }
.coere-cori.is-hop .b-shadow-pose { animation: coere-cori-hop-floor 460ms both; }
.coere-cori.is-hop .b-tuft-pose { animation: coere-cori-follow 620ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes coere-cori-hop {
  0% { scale: 1 1; translate: 0 0; animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
  18% { scale: 1.08 0.92; translate: 0 0; animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); }
  48% { scale: 0.95 1.06; translate: 0 calc(-8px * var(--coere-cori-u)); animation-timing-function: cubic-bezier(0.5, 0, 0.8, 0.5); }
  76% { scale: 1.05 0.95; translate: 0 0; animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
  100% { scale: 1 1; translate: 0 0; }
}
@keyframes coere-cori-hop-floor { 0%, 100% { scale: 1 1; opacity: 1; } 18% { scale: 1.06 1; opacity: 1; } 48% { scale: 0.82 1; opacity: 0.6; } 76% { scale: 1.05 1; opacity: 1; } }
@keyframes coere-cori-follow {
  0% { transform: skewX(0deg); } 20% { transform: skewX(4deg); } 50% { transform: skewX(-7deg); }
  72% { transform: skewX(4.5deg); } 88% { transform: skewX(-1.5deg); } 100% { transform: skewX(0deg); }
}
.coere-cori.is-wiggle .b-pose { animation: coere-cori-wiggle 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.coere-cori.is-wiggle .b-tuft-pose { animation: coere-cori-follow 420ms cubic-bezier(0.2, 0.8, 0.2, 1) 60ms both; }
@keyframes coere-cori-wiggle { 0% { rotate: 0deg; } 30% { rotate: -6deg; } 60% { rotate: 5deg; } 85% { rotate: -2deg; } 100% { rotate: 0deg; } }
.coere-cori.is-wake .b-pose { animation: coere-cori-wake 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes coere-cori-wake { 0%, 100% { scale: 1 1; } 40% { scale: 0.95 1.08; } 70% { scale: 1.02 0.98; } }
@media (prefers-reduced-motion: reduce) {
  .coere-cori, .coere-cori * { animation: none !important; transition: none !important; }
}
`;var Ly=`.coere-cori { position: relative; display: inline-block; flex: none; vertical-align: middle; line-height: 0; }
.coere-cori[data-tappable] { cursor: pointer; user-select: none; -webkit-user-select: none; }
`,Gl=Ly+jl;var zl=`/* Pill buttons. They press down a little, which reads as physical without being loud. */
.coere-btn {
  --coere-btn-h: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: var(--coere-btn-h);
  padding: 0 15px;
  border: 1px solid transparent;
  border-radius: var(--coere-radius-pill);
  font-family: var(--coere-font-sans);
  font-size: var(--coere-text-sm);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--coere-dur-fast) var(--coere-ease),
    border-color var(--coere-dur-fast) var(--coere-ease),
    color var(--coere-dur-fast) var(--coere-ease),
    transform var(--coere-dur-fast) var(--coere-ease);
}

.coere-btn:active:not(:disabled) {
  transform: scale(var(--coere-press-scale));
}

.coere-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.coere-btn .coere-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.coere-btn-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.coere-btn--sm {
  --coere-btn-h: 28px;
  gap: 5px;
  padding: 0 12px;
  font-size: var(--coere-text-xs);
}

.coere-btn--sm .coere-icon {
  width: 14px;
  height: 14px;
}

.coere-btn--block {
  display: flex;
  width: 100%;
}

.coere-btn:has(.coere-btn-label) > .coere-icon:first-child,
.coere-btn:has(.coere-btn-label) > .coere-spinner:first-child {
  margin-left: -3px;
}

.coere-btn--primary {
  background: var(--coere-accent);
  color: var(--coere-on-accent);
}

.coere-btn--primary:hover:not(:disabled) {
  background: var(--coere-accent-hover);
}

.coere-btn--primary:active:not(:disabled) {
  background: var(--coere-accent-press);
}

.coere-btn--secondary {
  background: var(--coere-surface);
  border-color: var(--coere-line-strong);
  color: var(--coere-fg);
}

.coere-btn--secondary:hover:not(:disabled) {
  background: var(--coere-tint);
  border-color: var(--coere-tint-line);
}

.coere-btn--quiet {
  background: transparent;
  color: var(--coere-fg-muted);
}

.coere-btn--quiet:hover:not(:disabled) {
  background: var(--coere-fill-quiet-hover);
  color: var(--coere-fg);
}
`;var Wl=`.coere-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.coere-checkbox.is-disabled {
  opacity: 0.5;
  cursor: default;
}

.coere-checkbox-control {
  position: relative;
  display: inline-flex;
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 1px;
}

/* The real input sits over the drawn box: invisible, still focusable and clickable. */
.coere-checkbox-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}

.coere-checkbox-box {
  display: inline-flex;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-xs);
  background: var(--coere-surface);
  color: var(--coere-on-accent);
  pointer-events: none;
  transition:
    background-color var(--coere-dur-fast) var(--coere-ease),
    border-color var(--coere-dur-fast) var(--coere-ease),
    transform var(--coere-dur-base) var(--coere-ease-pop);
}

.coere-checkbox-box svg {
  margin: -1.5px;
}

.coere-checkbox-check,
.coere-checkbox-dash {
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
}

/* The tick draws itself in when checked. */
.coere-checkbox-check {
  stroke-dasharray: 12;
  stroke-dashoffset: 12;
  transition:
    stroke-dashoffset var(--coere-dur-base) var(--coere-ease),
    opacity 0ms linear var(--coere-dur-base);
}

.coere-checkbox:hover .coere-checkbox-input:not(:disabled) + .coere-checkbox-box {
  border-color: var(--coere-accent);
}

.coere-checkbox-input:checked + .coere-checkbox-box,
.coere-checkbox-input:indeterminate + .coere-checkbox-box {
  background: var(--coere-accent);
  border-color: var(--coere-accent);
}

.coere-checkbox-input:active:not(:disabled) + .coere-checkbox-box {
  transform: scale(0.9);
}

.coere-checkbox-input:checked:not(:indeterminate) + .coere-checkbox-box .coere-checkbox-check {
  opacity: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--coere-dur-base) var(--coere-ease);
}

.coere-checkbox-input:indeterminate + .coere-checkbox-box .coere-checkbox-dash {
  opacity: 1;
}

.coere-checkbox-input:focus-visible + .coere-checkbox-box {
  outline: 2px solid var(--coere-focus);
  outline-offset: 2px;
}

.coere-checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.coere-checkbox-label {
  font-size: var(--coere-text-sm);
  color: var(--coere-fg);
}

.coere-checkbox-desc {
  font-size: var(--coere-text-xs);
  color: var(--coere-fg-muted);
}
`;var Kl=`/*
 * An icon button is the icon alone: no fill at rest or under the mouse,
 * where the icon turns from muted to ink. The round box only shapes the
 * focus ring. The transparent border draws nothing here, and in forced
 * colors mode it shows the button's edge.
 */
.coere-icon-btn {
  --coere-icon-btn-size: 32px;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--coere-icon-btn-size);
  height: var(--coere-icon-btn-size);
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--coere-radius-pill);
  background: transparent;
  color: var(--coere-fg-muted);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--coere-dur-fast) var(--coere-ease),
    transform var(--coere-dur-fast) var(--coere-ease);
}

.coere-icon-btn .coere-icon {
  width: 16px;
  height: 16px;
}

.coere-icon-btn--sm {
  --coere-icon-btn-size: 26px;
}

.coere-icon-btn--sm .coere-icon {
  width: 14px;
  height: 14px;
}

.coere-icon-btn:hover:not(:disabled) {
  color: var(--coere-fg);
}

.coere-icon-btn:active:not(:disabled) {
  transform: scale(0.94);
}

.coere-icon-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
`;var Vl=`/*
 * The "i" beside a setting's label and the tooltip it opens. The icon is
 * bare like every icon button: muted at rest, the accent under the mouse,
 * on focus and while its tooltip is open. The round box only shapes the
 * focus ring. The tooltip is a small rounded card in the surface color.
 */
.coere-info {
  display: inline-flex;
  flex: none;
  align-items: center;
  vertical-align: middle;
}

.coere-info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--coere-radius-pill);
  background: transparent;
  color: var(--coere-fg-subtle);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--coere-dur-fast) var(--coere-ease);
}

.coere-info-btn:hover,
.coere-info-btn:focus-visible,
.coere-info-btn[data-open] {
  color: var(--coere-brand);
}

.coere-info-btn .coere-icon {
  width: 15px;
  height: 15px;
}

/* Placed by hand in window coordinates (InfoTip.tsx), in the top layer where the browser has one. */
.coere-info-tip {
  position: fixed;
  inset: auto;
  z-index: var(--coere-z-popover);
  box-sizing: border-box;
  width: max-content;
  max-width: min(260px, calc(100vw - 16px));
  margin: 0;
  padding: var(--coere-space-2) var(--coere-space-3);
  overflow: visible;
  border: 1px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-md);
  background: var(--coere-surface);
  box-shadow: var(--coere-shadow-md);
  color: var(--coere-fg);
  font-family: var(--coere-font-sans);
  font-size: var(--coere-text-xs);
  font-weight: 400;
  line-height: var(--coere-leading);
  text-align: left;
  white-space: normal;
  pointer-events: auto;
  animation: coere-info-in var(--coere-dur-fast) var(--coere-ease);
}

.coere-info-tip:not([data-open]) {
  display: none;
}

@keyframes coere-info-in {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .coere-info-tip {
    animation: none;
  }
}
`;var ql=`.coere-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border: 1px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-xs);
  background: var(--coere-surface);
  box-shadow: 0 1px 0 var(--coere-line);
  color: var(--coere-fg-muted);
  font-family: var(--coere-font-mono);
  font-size: var(--coere-text-2xs);
  font-weight: 500;
  line-height: 1;
  vertical-align: 1px;
  white-space: nowrap;
}
`;var Xl=`.coere-tabs {
  position: relative;
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--coere-line);
}

.coere-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--coere-radius-sm) var(--coere-radius-sm) 0 0;
  background: transparent;
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-sm);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--coere-dur-fast) var(--coere-ease);
}

.coere-tab .coere-icon {
  width: 16px;
  height: 16px;
  opacity: 0.85;
}

.coere-tab:hover {
  color: var(--coere-fg);
}

.coere-tab[aria-selected='true'] {
  color: var(--coere-fg);
}

.coere-tab[aria-selected='true'] .coere-icon {
  color: var(--coere-accent-text);
  opacity: 1;
}

.coere-tab:focus-visible {
  outline-offset: -2px;
}

.coere-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--coere-radius-pill);
  background: var(--coere-fill-quiet-hover);
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-2xs);
  font-variant-numeric: tabular-nums;
}

/* A 1 px wide bar stretched with scaleX: the slide stays on the compositor. */
.coere-tab-line {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 1px;
  height: 2px;
  background: var(--coere-accent);
  transform: scaleX(0);
  transform-origin: 0 0;
  pointer-events: none;
}

.coere-tab-line[data-ready] {
  transition: transform var(--coere-dur-slow) var(--coere-ease);
}

.coere-tab-panel:focus-visible {
  outline-offset: 4px;
}
`;var Jl=`.coere-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--coere-space-4);
}

.coere-toggle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  cursor: pointer;
}

.coere-toggle-label {
  font-size: var(--coere-text-sm);
  font-weight: 500;
  color: var(--coere-fg);
}

.coere-toggle-desc {
  font-size: var(--coere-text-xs);
  color: var(--coere-fg-muted);
}

.coere-toggle.is-disabled {
  opacity: 0.5;
}

.coere-toggle.is-disabled .coere-toggle-text {
  cursor: default;
}

/* The track. The knob slides with the gentle overshoot so it lands softly. */
.coere-switch {
  position: relative;
  flex: none;
  width: 34px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: var(--coere-radius-pill);
  background: var(--coere-line-strong);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--coere-dur-base) var(--coere-ease);
}

.coere-switch:hover:not(:disabled) {
  background: var(--coere-fg-subtle);
}

.coere-switch[aria-checked='true'] {
  background: var(--coere-accent);
}

.coere-switch[aria-checked='true']:hover:not(:disabled) {
  background: var(--coere-accent-hover);
}

.coere-switch:disabled {
  cursor: default;
}

.coere-switch-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: var(--coere-radius-pill);
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(8, 14, 36, 0.2);
  transition: transform var(--coere-dur-slow) var(--coere-ease-pop);
}

.coere-switch[aria-checked='true'] .coere-switch-knob {
  transform: translateX(14px);
}

.coere-switch:active:not(:disabled) .coere-switch-knob {
  transform: scale(0.92);
}

.coere-switch[aria-checked='true']:active:not(:disabled) .coere-switch-knob {
  transform: translateX(14px) scale(0.92);
}
/* With an "i" the label and the icon sit together at the left, and the switch keeps the right edge. */
.coere-toggle.has-info {
  justify-content: flex-start;
  gap: var(--coere-space-1);
}

.coere-toggle.has-info .coere-switch {
  margin-left: auto;
}

.coere-toggle.has-info .coere-info {
  margin-right: var(--coere-space-3);
}

/* The Recommended pill: the accent's tint, like the one onboarding draws beside a switch's name. */
.coere-toggle-badge {
  flex: none;
  padding: 1px 8px;
  border: 1px solid var(--coere-tint-line);
  border-radius: var(--coere-radius-pill);
  background: var(--coere-tint);
  color: var(--coere-accent-text);
  font-size: var(--coere-text-2xs);
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

/*
 * Windows high contrast (forced colors) replaces every fill and shadow with
 * the system colors, so the track and the knob would vanish. Here the track
 * is drawn with a border in the text color and the knob in the text color
 * inside it. On, the track turns to the highlight color and the knob to the
 * color of text on it. The box keeps its size, so the 2 px border takes room
 * from the 30 by 16 that is left. A 12 px knob 2 px in from the top and left
 * has 2 px on every side, and the ordinary 14 px travel ends 2 px from the
 * far side, so the knob needs no travel of its own here.
 */
@media (forced-colors: active) {
  .coere-switch {
    box-sizing: border-box;
    border: 2px solid ButtonText;
    background: Canvas;
  }

  .coere-switch:hover:not(:disabled) {
    border-color: Highlight;
    background: Canvas;
  }

  .coere-switch[aria-checked='true'],
  .coere-switch[aria-checked='true']:hover:not(:disabled) {
    border-color: Highlight;
    background: Highlight;
  }

  .coere-switch:disabled {
    border-color: GrayText;
  }

  .coere-switch-knob {
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: ButtonText;
    box-shadow: none;
  }

  .coere-switch[aria-checked='true'] .coere-switch-knob {
    background: HighlightText;
  }

  .coere-switch:disabled .coere-switch-knob {
    background: GrayText;
  }
}
`;var Yl=`.coere-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--coere-space-8) var(--coere-space-6);
  text-align: center;
}

.coere-empty--compact {
  gap: 2px;
  padding: var(--coere-space-4);
}

/* The icon alone in the accent, with no circle behind it: the owner wants every icon bare. */
.coere-empty-icon {
  display: inline-flex;
  margin-bottom: 6px;
  color: var(--coere-accent-text);
}

.coere-empty-icon .coere-icon {
  width: 20px;
  height: 20px;
}

.coere-empty-title {
  font-size: var(--coere-text-md);
  font-weight: 600;
  color: var(--coere-fg);
}

.coere-empty--compact .coere-empty-title {
  font-size: var(--coere-text-sm);
  font-weight: 500;
  color: var(--coere-fg-muted);
}

.coere-empty-desc {
  max-width: 36ch;
  font-size: var(--coere-text-xs);
  color: var(--coere-fg-muted);
}

.coere-empty-action {
  margin-top: 10px;
}
`;var Zl=`.coere-progress {
  position: relative;
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: var(--coere-radius-pill);
  background: var(--coere-track);
  /* A new stacking context keeps the clipped fill inside the rounded corners. */
  isolation: isolate;
}

.coere-progress--sm {
  height: 4px;
}

.coere-progress-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--coere-accent);
  transform: translateX(-100%);
  will-change: transform;
  transition: transform var(--coere-dur-slow) var(--coere-ease);
}

/* Loops run linear, like the spinner, so the bar never seems to stall at an edge. */
.coere-progress[data-state='indeterminate'] .coere-progress-fill {
  right: auto;
  width: 40%;
  transition: none;
  animation: coere-sweep 1400ms linear infinite;
}

/* No sweep under reduced motion: a calm, still bar says "working" instead. */
@media (prefers-reduced-motion: reduce) {
  .coere-progress[data-state='indeterminate'] .coere-progress-fill {
    width: 100%;
    opacity: 0.35;
    animation: none !important;
    transform: none;
  }
}
`;var Ql=`.coere-spinner {
  display: inline-flex;
  flex: none;
  line-height: 0;
  vertical-align: middle;
}

.coere-spinner-svg {
  animation: coere-spin 700ms linear infinite;
}
`;var ed=`.coere-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.coere-stat-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--coere-fg);
  font-variant-numeric: tabular-nums;
}

.coere-stat-label {
  font-size: var(--coere-text-xs);
  font-weight: 500;
  color: var(--coere-fg-muted);
}

.coere-stat-hint {
  font-size: var(--coere-text-2xs);
  color: var(--coere-fg-subtle);
}
`;var td=`/*
 * A small mark, then a name, with nothing behind them: the owner asked for
 * logos on no background. The name carries the chip's baseline, so in a
 * baseline aligned row it sits level with the date or text beside it.
 */
.coere-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  color: var(--coere-fg);
  font-size: var(--coere-text-xs);
  font-weight: 500;
  line-height: var(--coere-leading-tight);
  white-space: nowrap;
}

/* The mark centers on the name's line, the way Recall's rows put a logo beside a title. */
.coere-chip-icon {
  display: inline-flex;
  flex: none;
  align-self: center;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--coere-fg-muted);
}

.coere-chip-icon .coere-icon {
  width: 14px;
  height: 14px;
}

/* A logo keeps its own colors. Single color marks follow the chip's text color. */
.coere-chip-icon .coere-logo {
  color: var(--coere-fg);
}

.coere-chip-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;var rd=`.coere-hl-mark {
  padding: 0 2px;
  margin: 0 -1px;
  border-radius: 4px;
  background: var(--coere-mark-bg);
  color: var(--coere-mark-fg);
  font-weight: 550;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
`;var nd=`/* The capsule card: lavender fill, a 1 px tint border, 16 px corners. */
.coere-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 14px;
  border: 1px solid var(--coere-tint-line);
  border-radius: var(--coere-radius-lg);
  background: var(--coere-tint);
  transition: border-color var(--coere-dur-fast) var(--coere-ease);
}

.coere-card.is-selected {
  border-color: var(--coere-tint-line-strong);
}

.coere-card-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--coere-accent-text);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.coere-card-title.is-untitled {
  color: var(--coere-fg-subtle);
  font-weight: 500;
}

/* Bare chips and the date share one text baseline, with room between them in place of a pill edge. */
.coere-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 14px;
}

.coere-card-date {
  margin-left: auto;
  padding-left: 8px;
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-xs);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.coere-card-passage {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  color: var(--coere-fg);
  font-size: var(--coere-text-sm);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.coere-card-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 2px;
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-xs);
}

.coere-card-open {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: -3px -6px;
  padding: 3px 6px;
  border-radius: var(--coere-radius-sm);
  color: var(--coere-accent-text);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--coere-dur-fast) var(--coere-ease);
}

.coere-card-open:hover {
  background: var(--coere-tint-strong);
}

.coere-card-open .coere-icon {
  width: 13px;
  height: 13px;
}
`;var od=`.coere-results {
  position: relative;
  max-height: var(--coere-results-max-height, none);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.coere-results-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.coere-results-item {
  border-radius: var(--coere-radius-md);
  cursor: pointer;
}

.coere-results-item.is-card {
  margin-bottom: 6px;
  border-radius: var(--coere-radius-lg);
}

/* The marker does the fill inside a list, so rows stay clear. */
.coere-results .coere-row.is-selected {
  background: transparent;
}

/* One element that glides between rows. It hides behind the card, which has its own fill. */
.coere-results-marker {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 0;
  height: 0;
  border-radius: var(--coere-radius-md);
  background: var(--coere-tint);
  pointer-events: none;
  will-change: transform;
}

.coere-results-marker[data-ready] {
  transition:
    transform var(--coere-dur-base) var(--coere-ease),
    height var(--coere-dur-base) var(--coere-ease),
    opacity var(--coere-dur-fast) var(--coere-ease);
}

.coere-results-marker[data-on-card] {
  opacity: 0;
}
`;var id=`.coere-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 9px 12px;
  border-radius: var(--coere-radius-md);
  transition: background-color var(--coere-dur-fast) var(--coere-ease);
}

/* On its own a selected row fills itself. Inside a ResultList the sliding marker does it. */
.coere-row.is-selected {
  background: var(--coere-tint);
}

.coere-row-logo {
  display: inline-flex;
  flex: none;
  margin-top: 1px;
  color: var(--coere-fg);
}

.coere-row-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.coere-row-top {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.coere-row-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--coere-fg);
  font-size: var(--coere-text-sm);
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--coere-dur-fast) var(--coere-ease);
}

.coere-row.is-selected .coere-row-title {
  color: var(--coere-accent-text);
}

.coere-row-title.is-untitled {
  color: var(--coere-fg-subtle);
}

.coere-row-date {
  flex: none;
  color: var(--coere-fg-subtle);
  font-size: var(--coere-text-xs);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.coere-row-snippet {
  overflow: hidden;
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-xs);
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`;var sd=`/* Platform logos keep their own colors. Single color marks follow the text color. */
.coere-logo {
  display: inline-block;
  flex: none;
  vertical-align: middle;
  overflow: visible;
}

.coere-logo-badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: var(--coere-radius-pill);
  background: var(--coere-badge-bg);
  color: var(--coere-badge-fg);
  font-family: var(--coere-font-sans);
  font-weight: 600;
  line-height: 1;
  vertical-align: middle;
  user-select: none;
}
`;var ad=`/*
 * Base for every Coere surface. Inherited properties (font, color, spacing)
 * cross a shadow boundary, so the root element resets them to ours instead of
 * picking up whatever the AI site set on its body.
 */

.coere-root {
  font-family: var(--coere-font-sans);
  font-size: var(--coere-text-sm);
  font-weight: 400;
  font-style: normal;
  line-height: var(--coere-leading);
  letter-spacing: normal;
  word-spacing: normal;
  text-align: start;
  text-transform: none;
  text-indent: 0;
  white-space: normal;
  color: var(--coere-fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.coere-root *,
.coere-root *::before,
.coere-root *::after {
  box-sizing: border-box;
}

.coere-root :where(button, input, select, textarea) {
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
}

.coere-root :where(h1, h2, h3, h4, p, ul, ol, figure) {
  margin: 0;
}

.coere-root :where(ul, ol) {
  padding: 0;
  list-style: none;
}

.coere-root :focus-visible {
  outline: 2px solid var(--coere-focus);
  outline-offset: 2px;
}

.coere-root ::selection {
  background: var(--coere-tint-strong);
}

/*
 * Hidden from sight, still read by screen readers. It is absolute, so it needs
 * a positioned ancestor to be held by: put position: relative on the nearest
 * box that scrolls or clips (a view, a list, a panel) around any of it.
 */
.coere-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.coere-mono {
  font-family: var(--coere-font-mono);
  font-variant-ligatures: none;
}

/*
 * A log scrolls and holds screen reader only text in every turn. Held by the
 * box above it instead, that text is neither clipped nor scrolled with the
 * turns, and it stretches that box to the full height of the conversation: a
 * Cori chat of five answers made its popup view 1,570 px tall in 459. The log
 * is the one scroller of that kind, so it is its own containing block. The
 * :where() adds no weight, so a later rule on the log can still place it.
 */
.coere-root :where([role='log']) {
  position: relative;
}
`;var cd=`/*
 * Shared motion. Enter animations combine opacity with a small lift and a
 * scale from 0.98, so things settle into place instead of blinking in. Lists
 * set --coere-i on each item and the delay staggers by --coere-stagger.
 */

@keyframes coere-enter {
  from {
    opacity: 0;
    transform: translateY(var(--coere-enter-y)) scale(var(--coere-enter-scale));
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes coere-exit {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: translateY(var(--coere-enter-y)) scale(var(--coere-enter-scale));
  }
}

@keyframes coere-pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes coere-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes coere-spin {
  to {
    transform: rotate(360deg);
  }
}

/*
 * The solid bar of an indeterminate progress bar sweeps across the track.
 * The bar is 40% of the track, so 250% of its own width takes it fully out.
 */
@keyframes coere-sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

.coere-enter {
  animation: coere-enter var(--coere-dur-base) var(--coere-ease) both;
  animation-delay: calc(var(--coere-i, 0) * var(--coere-stagger));
}

.coere-panel-enter {
  animation: coere-enter var(--coere-dur-slow) var(--coere-ease) both;
  transform-origin: 50% 100%;
}

.coere-exit {
  animation: coere-exit var(--coere-dur-base) var(--coere-ease) both;
}

.coere-pop {
  animation: coere-pop var(--coere-dur-base) var(--coere-ease-pop) both;
}

.coere-fade {
  animation: coere-fade var(--coere-dur-base) var(--coere-ease) both;
}

/* Reduced motion: no movement at all. Things appear in their final state. */
@media (prefers-reduced-motion: reduce) {
  .coere-root *,
  .coere-root *::before,
  .coere-root *::after,
  .coere-enter,
  .coere-panel-enter,
  .coere-exit,
  .coere-pop,
  .coere-fade {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0ms !important;
  }
}
`;var ld=`/*
 * Design tokens. Every name starts with --coere- so nothing collides with a
 * host page. In a shadow root the tokens sit on :host, on an extension page on
 * :root. Inside a shadow root :root matches nothing, so we never touch the
 * site's own root element.
 *
 * Palette: one accent, ink and white. Everything else is a tint of the accent
 * (fills and borders) or ink at reduced opacity (text, lines, shadows). The
 * dark theme mirrors it with white at reduced opacity on ink.
 */

:root,
:host {
  /* The brand, the same in both themes */
  --coere-brand: #5267f7;
  --coere-ink: #080e24;
  --coere-white: #ffffff;

  /* Shape */
  --coere-radius-xs: 5px;
  --coere-radius-sm: 8px;
  --coere-radius-md: 12px;
  --coere-radius-lg: 16px;
  --coere-radius-pill: 999px;

  /* Spacing, a 4 px scale */
  --coere-space-1: 4px;
  --coere-space-2: 8px;
  --coere-space-3: 12px;
  --coere-space-4: 16px;
  --coere-space-5: 20px;
  --coere-space-6: 24px;
  --coere-space-8: 32px;
  --coere-space-10: 40px;

  /* Type. The prefixed family names never clash with a site that loads Geist. */
  --coere-font-sans:
    'Coere Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  --coere-font-mono:
    'Coere Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  --coere-text-2xs: 11px;
  --coere-text-xs: 12px;
  --coere-text-sm: 13px;
  --coere-text-md: 14px;
  --coere-text-lg: 16px;
  --coere-text-xl: 20px;
  --coere-text-2xl: 28px;
  --coere-leading-tight: 1.25;
  --coere-leading: 1.5;

  /* Motion. One standard curve, one gentle overshoot for things that pop in. */
  --coere-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --coere-ease-pop: cubic-bezier(0.34, 1.4, 0.64, 1);
  --coere-dur-fast: 120ms;
  --coere-dur-base: 180ms;
  --coere-dur-slow: 260ms;
  --coere-stagger: 18ms;
  --coere-enter-y: 4px;
  --coere-enter-scale: 0.98;
  --coere-press-scale: 0.97;

  /* Stacking inside our own surfaces. The host element itself uses --coere-z-host. */
  --coere-z-host: 2147483646;
  --coere-z-raised: 1;
  --coere-z-overlay: 10;
  --coere-z-popover: 20;
  --coere-z-toast: 30;
}

:root,
:host,
[data-theme='light'] {
  color-scheme: light;

  --coere-accent: #5267f7;
  --coere-accent-hover: #495cde;
  --coere-accent-press: #4355cd;
  /* The pressed shade: #5267f7 measured 4.0:1 on the card tint, under AA for small text. */
  --coere-accent-text: #4355cd;
  --coere-on-accent: #ffffff;

  /* Accent tints: card fill, hover, selection, card border */
  --coere-tint: #eef0fe;
  --coere-tint-hover: #e7eafe;
  --coere-tint-strong: #dce1fd;
  --coere-tint-line: #c9d0fb;
  --coere-tint-line-strong: #a0abfb;

  --coere-bg: #ffffff;
  --coere-surface: #ffffff;
  --coere-chip: #ffffff;

  --coere-fg: #080e24;
  --coere-fg-muted: rgba(8, 14, 36, 0.64);
  /* 60 percent ink: 46 percent measured 3.2:1 on white, under AA for small text. */
  --coere-fg-subtle: rgba(8, 14, 36, 0.6);
  --coere-line: rgba(8, 14, 36, 0.08);
  --coere-line-strong: rgba(8, 14, 36, 0.16);
  --coere-fill-quiet: rgba(8, 14, 36, 0.04);
  --coere-fill-quiet-hover: rgba(8, 14, 36, 0.07);
  --coere-track: rgba(8, 14, 36, 0.08);

  --coere-mark-bg: #d6dcfd;
  --coere-mark-fg: #080e24;
  --coere-badge-bg: rgba(8, 14, 36, 0.08);
  --coere-badge-fg: #080e24;
  --coere-focus: #5267f7;

  --coere-shadow-sm: 0 1px 2px rgba(8, 14, 36, 0.06);
  --coere-shadow-md: 0 1px 2px rgba(8, 14, 36, 0.04), 0 4px 14px rgba(8, 14, 36, 0.07);
  --coere-shadow-lg: 0 2px 6px rgba(8, 14, 36, 0.05), 0 14px 36px rgba(8, 14, 36, 0.13);
}

[data-theme='dark'],
:host([data-theme='dark']) {
  color-scheme: dark;

  --coere-accent: #5267f7;
  /* The light theme's hover shade. A lighter blue gave white text 3.83:1, under AA. */
  --coere-accent-hover: #495cde;
  --coere-accent-press: #4a5ee0;
  --coere-accent-text: #8695f9;
  --coere-on-accent: #ffffff;

  --coere-tint: #11193d;
  --coere-tint-hover: #141c46;
  --coere-tint-strong: #1a2457;
  --coere-tint-line: #232e6e;
  --coere-tint-line-strong: #3443a2;

  --coere-bg: #080e24;
  --coere-surface: #0d1329;
  --coere-chip: #171c31;

  --coere-fg: #ffffff;
  --coere-fg-muted: rgba(255, 255, 255, 0.66);
  --coere-fg-subtle: rgba(255, 255, 255, 0.6);
  --coere-line: rgba(255, 255, 255, 0.09);
  --coere-line-strong: rgba(255, 255, 255, 0.16);
  --coere-fill-quiet: rgba(255, 255, 255, 0.05);
  --coere-fill-quiet-hover: rgba(255, 255, 255, 0.09);
  --coere-track: rgba(255, 255, 255, 0.1);

  --coere-mark-bg: #253183;
  --coere-mark-fg: #ffffff;
  --coere-badge-bg: rgba(255, 255, 255, 0.12);
  --coere-badge-fg: #ffffff;
  --coere-focus: #8695f9;

  --coere-shadow-sm: 0 1px 2px rgba(2, 4, 12, 0.4);
  --coere-shadow-md: 0 1px 2px rgba(2, 4, 12, 0.4), 0 6px 18px rgba(2, 4, 12, 0.45);
  --coere-shadow-lg: 0 2px 6px rgba(2, 4, 12, 0.45), 0 16px 40px rgba(2, 4, 12, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  :root,
  :host {
    --coere-dur-fast: 0ms;
    --coere-dur-base: 0ms;
    --coere-dur-slow: 0ms;
    --coere-stagger: 0ms;
    --coere-enter-y: 0px;
    --coere-enter-scale: 1;
    --coere-press-scale: 1;
  }
}
`;var ex=[sd,zl,Kl,Vl,Jl,Wl,ql,Xl,Ql,Zl,Yl,ed,td,rd,nd,id,od],dd=[ld,ad,cd,...ex].join(`
`);var ud=`
.coere-act-dock {
  position: absolute;
  left: 50%;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: min(560px, calc(100% - 32px));
  transform: translateX(calc(-50% + var(--coere-act-x, 0px)));
  touch-action: none;
}

.coere-act-dock-card {
  width: min(360px, 100%);
  pointer-events: auto;
}

.coere-act-float {
  position: absolute;
  pointer-events: auto;
}

.coere-act-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 8px 10px 10px 12px;
  border: 1px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-lg);
  background: var(--coere-surface);
  box-shadow: var(--coere-shadow-lg);
  color: var(--coere-fg);
  pointer-events: auto;
  cursor: grab;
}

.coere-act-bar:active {
  cursor: grabbing;
}

.coere-act-bar-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-2xs);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.01em;
  user-select: none;
}

.coere-act-bar-head .coere-icon {
  flex: none;
  color: var(--coere-accent-text);
}

.coere-act-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.coere-act-bar-cori {
  flex: none;
}

.coere-act-bar-step {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: var(--coere-text-sm);
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  user-select: none;
}

.coere-act-bar-buttons {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
}

.coere-act-bar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-pill);
  background: var(--coere-surface);
  color: var(--coere-fg);
  font-size: var(--coere-text-xs);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--coere-dur-fast) var(--coere-ease),
    border-color var(--coere-dur-fast) var(--coere-ease),
    transform var(--coere-dur-fast) var(--coere-ease);
}

.coere-act-bar-btn:hover {
  background: var(--coere-tint);
  border-color: var(--coere-tint-line);
}

.coere-act-bar-btn:active {
  transform: scale(var(--coere-press-scale));
}

.coere-act-bar-btn:focus-visible {
  outline: 2px solid var(--coere-focus);
  outline-offset: 2px;
}

/* Go to chat is a ghost: no box until the pointer is on it. */
.coere-act-bar-btn[data-button='go_to_chat'] {
  border-color: transparent;
  background: transparent;
  color: var(--coere-fg-muted);
}

.coere-act-bar-btn[data-button='go_to_chat']:hover {
  background: var(--coere-fill-quiet-hover);
  color: var(--coere-fg);
}

/* Stop and Hand back are filled in ink: the one strong button, with no red in the palette. */
.coere-act-bar-btn[data-button='stop'] {
  border-color: var(--coere-fg);
  background: var(--coere-fg);
  color: var(--coere-bg);
}

.coere-act-bar-btn[data-button='stop']:hover {
  border-color: var(--coere-fg);
  background: color-mix(in srgb, var(--coere-fg) 86%, var(--coere-bg));
}

.coere-act-bar-btn[data-button='hand_back'] {
  border-color: var(--coere-accent);
  background: var(--coere-accent);
  color: var(--coere-on-accent);
}

.coere-act-bar-btn[data-button='hand_back']:hover {
  border-color: var(--coere-accent-hover);
  background: var(--coere-accent-hover);
}

/* Under 480 px the step takes its own line above the buttons. */
@media (max-width: 480px) {
  .coere-act-bar-row {
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .coere-act-bar-step {
    flex-basis: calc(100% - 38px);
  }

  .coere-act-bar-buttons {
    flex-basis: 100%;
    justify-content: flex-end;
  }
}

@media (forced-colors: active) {
  .coere-act-bar,
  .coere-act-bar-btn {
    border: 1px solid CanvasText;
  }
}
`;var pd=`
.coere-act-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 13px 16px 14px;
  border: 1px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-lg);
  background: var(--coere-surface);
  color: var(--coere-fg);
  font-size: 13.5px;
  line-height: 1.5;
}

.coere-act-dock-card .coere-act-card {
  box-shadow: var(--coere-shadow-lg);
}

.coere-act-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.coere-act-card-title > span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.coere-act-site,
.coere-act-site-globe {
  flex: none;
}

.coere-act-site-globe {
  color: var(--coere-fg-muted);
}

.coere-act-done {
  flex: none;
  color: var(--coere-accent-text);
}

.coere-act-card-line {
  margin: 0;
  color: var(--coere-fg-muted);
}

.coere-act-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

/* A quiet button alone at the start lines its words up with the card's text, not its empty box. */
.coere-act-actions > .coere-btn--quiet:first-child {
  margin-left: -12px;
}

/* A stop in a card is a quiet button with ink words, the bar's Stop in a softer voice. */
.coere-act-stop.coere-btn--quiet {
  color: var(--coere-fg);
}

.coere-act-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.coere-act-chip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--coere-tint-line);
  border-radius: var(--coere-radius-pill);
  background: var(--coere-tint);
  color: var(--coere-accent-text);
  font-size: var(--coere-text-xs);
  font-weight: 550;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--coere-dur-fast) var(--coere-ease),
    border-color var(--coere-dur-fast) var(--coere-ease),
    transform var(--coere-dur-fast) var(--coere-ease);
}

.coere-act-chip:hover {
  background: var(--coere-tint-strong);
  border-color: var(--coere-tint-line-strong);
}

.coere-act-chip:active {
  transform: scale(var(--coere-press-scale));
}

.coere-act-chip:focus-visible,
.coere-act-site-link:focus-visible,
.coere-act-preview:focus-visible,
.coere-act-input:focus-visible {
  outline: 2px solid var(--coere-focus);
  outline-offset: 2px;
}

/* A review card's fields: a label column and the value, which wraps and keeps its line breaks. */
.coere-act-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: var(--coere-radius-md);
  background: var(--coere-fill-quiet);
}

.coere-act-field {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: baseline;
  gap: 8px;
}

.coere-act-field-label {
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-xs);
}

.coere-act-field-value {
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.coere-act-field[data-long] .coere-act-field-value {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.coere-act-field.is-editable[data-long] {
  grid-template-columns: minmax(0, 1fr);
  gap: 4px;
}

.coere-act-input {
  width: 100%;
  min-width: 0;
  padding: 5px 8px;
  border: 1px solid var(--coere-line-strong);
  border-radius: var(--coere-radius-sm);
  background: var(--coere-surface);
  color: var(--coere-fg);
  font-size: 13px;
  line-height: 1.45;
  resize: vertical;
}

.coere-act-input:hover {
  border-color: var(--coere-tint-line-strong);
}

/* The plan: numbered lines, each with its bare icon. */
.coere-act-plan-lines {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.coere-act-plan-line {
  display: grid;
  grid-template-columns: 16px 16px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.coere-act-plan-n {
  color: var(--coere-fg-subtle);
  font-size: var(--coere-text-xs);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.coere-act-plan-line .coere-icon {
  color: var(--coere-accent-text);
}

.coere-act-plan-ask {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coere-act-result-lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  color: var(--coere-fg-muted);
  list-style: none;
}

.coere-act-result-lines li {
  overflow-wrap: anywhere;
}
`;var fd=`
.coere-act-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.coere-act-overlay[data-hidden] {
  visibility: hidden;
}

.coere-act-glow {
  --coere-act-glow-size: 14px;
  position: absolute;
  inset: 0;
  opacity: 0.7;
  pointer-events: none;
  animation: coere-act-breathe 2.4s ease-in-out infinite alternate;
}

.coere-act-glow-edge,
.coere-act-glow-corner {
  position: absolute;
  transition:
    width var(--coere-dur-slow) var(--coere-ease),
    height var(--coere-dur-slow) var(--coere-ease),
    opacity var(--coere-dur-slow) var(--coere-ease);
}

.coere-act-glow-edge[data-edge='top'],
.coere-act-glow-edge[data-edge='bottom'] {
  left: var(--coere-act-glow-size);
  right: var(--coere-act-glow-size);
  height: var(--coere-act-glow-size);
}

.coere-act-glow-edge[data-edge='left'],
.coere-act-glow-edge[data-edge='right'] {
  top: var(--coere-act-glow-size);
  bottom: var(--coere-act-glow-size);
  width: var(--coere-act-glow-size);
}

.coere-act-glow-edge[data-edge='top'] {
  top: 0;
  background: linear-gradient(to bottom, var(--coere-brand), transparent);
}

.coere-act-glow-edge[data-edge='bottom'] {
  bottom: 0;
  background: linear-gradient(to top, var(--coere-brand), transparent);
}

.coere-act-glow-edge[data-edge='left'] {
  left: 0;
  background: linear-gradient(to right, var(--coere-brand), transparent);
}

.coere-act-glow-edge[data-edge='right'] {
  right: 0;
  background: linear-gradient(to left, var(--coere-brand), transparent);
}

.coere-act-glow-corner {
  width: var(--coere-act-glow-size);
  height: var(--coere-act-glow-size);
}

/* Each corner fades from clear at its inner point to the accent at 14 px, which meets both bands beside it. */
.coere-act-glow-corner[data-corner='tl'] {
  top: 0;
  left: 0;
  background: radial-gradient(circle at 100% 100%, transparent 0, var(--coere-brand) var(--coere-act-glow-size));
}

.coere-act-glow-corner[data-corner='tr'] {
  top: 0;
  right: 0;
  background: radial-gradient(circle at 0 100%, transparent 0, var(--coere-brand) var(--coere-act-glow-size));
}

.coere-act-glow-corner[data-corner='br'] {
  bottom: 0;
  right: 0;
  background: radial-gradient(circle at 0 0, transparent 0, var(--coere-brand) var(--coere-act-glow-size));
}

.coere-act-glow-corner[data-corner='bl'] {
  bottom: 0;
  left: 0;
  background: radial-gradient(circle at 100% 0, transparent 0, var(--coere-brand) var(--coere-act-glow-size));
}

/* Under Take over the glow stops and thins to a still 2 px line, so the person sees Cori is waiting. */
.coere-act-glow[data-mode='still'] {
  --coere-act-glow-size: 2px;
  animation: none;
  opacity: 0.85;
}

.coere-act-glow[data-mode='still'] .coere-act-glow-edge {
  background: var(--coere-brand);
}

.coere-act-glow[data-mode='still'] .coere-act-glow-corner {
  background: var(--coere-brand);
}

@keyframes coere-act-breathe {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 0.85;
  }
}

/* Reduced motion: the glow holds still at 0.7. */
@media (prefers-reduced-motion: reduce) {
  .coere-act-glow,
  .coere-act-glow[data-mode] {
    animation: none !important;
  }

  .coere-act-glow[data-mode='working'] {
    opacity: 0.7;
  }
}
`;var md=`
.coere-act-task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.coere-act-site-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 2px 6px 2px 2px;
  border: 0;
  border-radius: var(--coere-radius-sm);
  background: transparent;
  color: var(--coere-fg);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.coere-act-site-link span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
  transition: text-decoration-color var(--coere-dur-fast) var(--coere-ease);
}

.coere-act-site-link:hover span {
  text-decoration-color: currentColor;
}

.coere-act-status {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 2px 9px;
  border-radius: var(--coere-radius-pill);
  background: var(--coere-fill-quiet);
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-2xs);
  font-weight: 600;
}

.coere-act-status::before {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  content: '';
}

.coere-act-status[data-status='running'],
.coere-act-status[data-status='waiting'],
.coere-act-status[data-status='taken_over'] {
  background: var(--coere-tint);
  color: var(--coere-accent-text);
}

.coere-act-status[data-status='running']::before {
  animation: coere-act-dot 1.2s ease-in-out infinite alternate;
}

.coere-act-status[data-status='done'] {
  background: var(--coere-tint);
  color: var(--coere-accent-text);
}

@keyframes coere-act-dot {
  from {
    opacity: 0.35;
  }
  to {
    opacity: 1;
  }
}

.coere-act-task-step {
  margin: 0;
  overflow: hidden;
  color: var(--coere-fg-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.coere-act-preview {
  display: block;
  width: min(320px, 100%);
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--coere-line);
  border-radius: var(--coere-radius-md);
  background: var(--coere-fill-quiet);
  cursor: pointer;
  /* The working tab's glow round its picture, as on the tab itself. */
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--coere-brand) 35%, transparent);
}

.coere-act-preview img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

/* Rewrite: Cori and the line, then the old text struck through above the new. */
.coere-act-rewrite-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coere-act-rewrite-head .coere-act-card-title {
  flex: 1;
  min-width: 0;
}

.coere-act-rewrite-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.coere-act-rewrite-was {
  color: var(--coere-fg-subtle);
  text-decoration-color: var(--coere-fg-subtle);
  white-space: pre-line;
}

.coere-act-rewrite-now {
  margin: 0;
  white-space: pre-line;
}

@media (prefers-reduced-motion: reduce) {
  .coere-act-status[data-status='running']::before {
    animation: none;
  }
}
`;var hd=[fd,ud,pd,md].join(`
`),Oi=[dd,Gl,hd].join(`
`);var Ni=`
.coere-act-rewrite[data-state='review'],
.coere-act-rewrite[data-state='picker'],
.coere-act-rewrite[data-state='none'] {
  width: max-content;
  max-width: 100%;
  padding: 8px 8px 8px 12px;
  gap: 8px;
  box-shadow: var(--coere-shadow-lg);
}

.coere-act-review {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coere-act-review .coere-btn {
  white-space: nowrap;
}

.coere-act-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.coere-act-modes .coere-btn {
  white-space: nowrap;
}

.coere-act-edits {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
}

.coere-act-edit {
  display: inline-flex;
  gap: 4px;
}

.coere-act-edit s {
  color: var(--coere-fg-subtle);
}

.coere-act-edit ins {
  text-decoration: none;
  color: var(--coere-accent-text);
}

.coere-act-modes kbd {
  margin-right: 6px;
  font: inherit;
  font-size: 11px;
  color: var(--coere-fg-subtle);
}
`;var Nt=(e,t,r)=>Math.min(r,Math.max(t,e));function gd(e,t=100){if(e===void 0)return 1;let r=Number.parseFloat(e);return Number.isNaN(r)?null:e.trim().endsWith("%")?r/t:r}function tx(e){let[t="",r]=e.split("/"),n=t.split(/[\s,]+/).filter(Boolean);return r!==void 0?{parts:n,alpha:r.trim()}:{parts:n.slice(0,3),alpha:n[3]}}function bd(e,t){let r=Nt(e,0,1),n=r<=.0031308?r*12.92:1.055*r**(1/2.4)-.055,o=Math.round(n*255);return{r:o,g:o,b:o,a:t}}function rx(e){let t=e.length<=4?[...e].map(n=>n+n).join(""):e;if(!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(t))return null;let r=n=>Number.parseInt(t.slice(n,n+2),16);return{r:r(0),g:r(2),b:r(4),a:t.length===8?r(6)/255:1}}function wd(e){let t=e.trim().toLowerCase();if(t==="transparent")return{r:0,g:0,b:0,a:0};if(t.startsWith("#"))return rx(t.slice(1));let r=/^([a-z]+)\((.*)\)$/.exec(t);if(!r)return null;let[,n="",o=""]=r,i=n==="color"?/^\s*([a-z0-9-]+)\s+/.exec(o):null;if(n==="color"&&i?.[1]!=="srgb")return null;let{parts:s,alpha:a}=tx(i?o.slice(i[0].length):o),c=gd(a);if(c===null)return null;if(n==="rgb"||n==="rgba"){let l=s.slice(0,3).map(f=>f.endsWith("%")?Number.parseFloat(f)/100*255:Number(f));if(l.length!==3||l.some(f=>Number.isNaN(f)))return null;let[u=0,p=0,d=0]=l;return{r:u,g:p,b:d,a:Nt(c,0,1)}}if(n==="color"){let l=s.map(Number);if(l.length!==3||l.some(f=>Number.isNaN(f)))return null;let[u=0,p=0,d=0]=l.map(f=>Math.round(Nt(f,0,1)*255));return{r:u,g:p,b:d,a:Nt(c,0,1)}}if(n==="oklch"||n==="oklab"){let l=gd(s[0]);return l===null?null:bd(l**3,Nt(c,0,1))}if(n==="lab"||n==="lch"){let l=Number.parseFloat(s[0]??"");if(Number.isNaN(l))return null;let u=(l+16)/116;return bd(l>8?u**3:l/903.3,Nt(c,0,1))}return null}function Di(e){let t=Nt(e,0,255)/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function yd(e){let t=.2126*Di(e.r)+.7152*Di(e.g)+.0722*Di(e.b);return 1.05/(t+.05)>(t+.05)/.05}function xd(e,t=Object.is){let r=e,n=new Set,o=i=>{if(!t(r,i)){r=i;for(let s of[...n])try{s(r)}catch{}}};return{get:()=>r,set:o,update:i=>o(i(r)),subscribe(i){return n.add(i),()=>n.delete(i)}}}var vd=32,nx=5e3,ox=["class","style","data-theme","data-mode","data-color-mode","data-color-scheme"];function ix(e,t){return t?e===t||t.contains(e):!1}function*sx(e,t,r){let o=(typeof t.elementsFromPoint=="function"?t.elementsFromPoint(e.innerWidth-vd,e.innerHeight-vd):[]).find(i=>!ix(i,r));for(let i=o;i;i=i.parentElement)yield i;t.body&&(yield t.body),yield t.documentElement}function ax(e,t){let r=e.getComputedStyle(t.documentElement).colorScheme??"";return/\bdark\b/.test(r)?/\blight\b/.test(r)?e.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light":"dark":"light"}function kd(e,t,r){for(let n of sx(e,t,r)){let o=wd(e.getComputedStyle(n).backgroundColor);if(o&&o.a>=.5)return yd(o)?"dark":"light"}return ax(e,t)}function _d(e,t,r){let n=xd(kd(e,t,r)),o=!1,i=()=>{o||(o=!0,e.requestAnimationFrame(()=>{o=!1,n.set(kd(e,t,r))}))},s=new MutationObserver(i),a={attributes:!0,attributeFilter:ox};s.observe(t.documentElement,a),t.body&&s.observe(t.body,a),t.head&&s.observe(t.head,{childList:!0});let c=e.matchMedia?.("(prefers-color-scheme: dark)");c?.addEventListener("change",i);let l=e.setInterval(i,nx);return{get:n.get,subscribe:n.subscribe,refresh:i,stop(){s.disconnect(),c?.removeEventListener("change",i),e.clearInterval(l)}}}var Hi="coere.actions.bar";function cx(e){return typeof e!="object"||e===null||Array.isArray(e)?{}:Object.fromEntries(Object.entries(e).filter(t=>typeof t[1]=="number"&&Number.isFinite(t[1])))}function lx(e,t){let r=async()=>cx((await e.get(Hi))[Hi]);return{async read(){try{return(await r())[t]??0}catch{return 0}},async write(n){try{let o=await r();delete o[t];let i=Object.entries({...o,[t]:Math.round(n)}).slice(-50);await e.set({[Hi]:Object.fromEntries(i)})}catch{}}}}var Sd=e=>lx(chrome.storage.local,e);function dx(e){let t=e.activeElement,r=t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement?t:null,n=e.getSelection(),o=r?r.getBoundingClientRect():n&&n.rangeCount>0?n.getRangeAt(0).getBoundingClientRect():null;return!o||o.width<=0||o.height<=0?null:{x:o.x,y:o.y,width:o.width,height:o.height}}function Ed(e,t,r,n=Sd(location.host),o=null){let i=e.ownerDocument,s=i.createElement("style");s.textContent=`${Oi}
${Ni}`;let a=i.createElement("div");e.append(s,a);let c=e.host,l=_d(i.defaultView??window,i,c);c.setAttribute("data-theme",l.get());let u=l.subscribe(w=>c.setAttribute("data-theme",w)),p=null,d=null,f=null,h=w=>{if(w.rewrite?d?.rewrite||(f=dx(i)):f=null,d=w,p===null)return;let y={...w,rewriteAt:w.rewriteAt??o?.box()??f};ki(Be(Li,{state:y,mac:t,onPress:r,drag:p,onDrag:b=>void n.write(b)}),a)};return o?.listen(()=>{d?.rewrite&&h(d)}),n.read().then(w=>{p=w,d&&h(d)}),{draw:h,remove(){u(),l.stop(),ki(null,a),s.remove(),a.remove()}}}var Cd="[redacted]",ux=[/(?<![\w-])sk-(?=[\w-]*\d)[\w-]{20,}/g,/(?<![A-Za-z0-9])AKIA[0-9A-Z]{16}(?![A-Za-z0-9])/g,/(?<![A-Za-z0-9])gh[pousr]_[A-Za-z0-9]{36,}/g,/(?<![A-Za-z0-9])xox[abprs]-[A-Za-z0-9-]{10,}/g,/(?<![A-Za-z0-9])AIza[\w-]{35}(?![\w-])/g,/(?<![\w-])eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g,/(?<![A-Za-z0-9])coere_(?:app|dev)_[A-Z2-7]{52}(?![A-Za-z0-9])/g,/-----BEGIN [A-Z ]*PRIVATE KEY-----(?:[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----|[\s\S]*$)/g];function px(e){let t=0;for(let r=0;r<e.length;r++){let n=Number(e[e.length-1-r]);r%2===1&&(n=n*2>9?n*2-9:n*2),t+=n}return t%10===0}function fx(e,t,r){return/^\+|[()]/.test(e.slice(Math.max(0,t-1),t)+r)||/^\d{3}[ -]\d{3}[ -]\d{4}$/.test(r)}function mx(e){let t=[];for(let r of e.matchAll(/\b\d(?:[ -]?\d){12,18}\b/g))px(r[0].replace(/[ -]/g,""))&&!fx(e,r.index,r[0])&&t.push([r.index,r.index+r[0].length]);return t}function hx(e){let t=e.slice(4)+e.slice(0,4),r=0;for(let n of t){let o=n>="A"&&n<="Z"?String(n.charCodeAt(0)-55):n;for(let i of o)r=(r*10+Number(i))%97}return r===1}function gx(e){let t=[];for(let r of e.matchAll(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){11,30}\b/g))for(let n=r.index+r[0].length;n-r.index>=15;n--)if(!/[A-Z0-9]/.test(e[n]??"")&&e[n-1]!==" "&&hx(e.slice(r.index,n).replace(/ /g,""))){t.push([r.index,n]);break}return t}function bx(e){let t=[];for(let r of e.matchAll(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g)){let n=e.slice(Math.max(0,r.index-40),r.index+r[0].length+20);/\bssn\b|social security/i.test(n)&&t.push([r.index,r.index+r[0].length])}return t}function wx(e){let t=[];for(let r of e.matchAll(/\b(?:password|passcode|pin)\b\s*(?:is\b\s*[:=]?|[:=])\s*(\S+)/dgi)){let[n]=r.indices?.[1]??[0],o=(r[1]??"").replace(/[.,;:!?)\]}'"]+$/,"");o!==""&&t.push([n,n+o.length])}return t}function ye(e){let t=[...mx(e),...gx(e),...bx(e),...wx(e)];for(let o of ux)for(let i of e.matchAll(o))t.push([i.index,i.index+i[0].length]);if(t.length===0)return e;t.sort((o,i)=>o[0]-i[0]||i[1]-o[1]);let r="",n=0;for(let[o,i]of t)i<=n||(r+=e.slice(n,Math.max(n,o))+(o>=n?Cd:""),n=i);return r+e.slice(n)}var yx=/[A-Za-z]+|\d+|\n|[^\sA-Za-z\d]/g,xx=/^[A-Z]?[a-z]{0,11}$/;function vx(e){let t=xx.test(e)&&/[aeiouy]/i.test(e);return Math.ceil(e.length/(t?4:2))}function Bi(e){let t=0;for(let r of e.matchAll(yx)){let n=r[0],o=n.charCodeAt(0);o>=65&&o<=90||o>=97&&o<=122?t+=vx(n):o>=48&&o<=57?t+=Math.ceil(n.length/3)+1:t+=o>=11904?2:1}return t}function kx(e){let t=e.getBoundingClientRect(),r=t.x,n=t.y,o=e.ownerDocument.defaultView?.frameElement??null;for(;o;){let i=o.getBoundingClientRect();r+=i.x,n+=i.y,o=o.ownerDocument.defaultView?.frameElement??null}return{x:r,y:n,width:t.width,height:t.height}}function Fi(e,t={}){let r=e.defaultView;return{doc:e,rect:kx,viewport:()=>({width:r?.innerWidth??0,height:r?.innerHeight??0,scrollY:r?.scrollY??0,scrollHeight:Math.max(e.documentElement.scrollHeight,e.body?.scrollHeight??0)}),redact:ye,count:Bi,now:()=>Date.now(),...t}}var D=class extends Error{constructor(r){super(r);this.code=r;this.name="KitError"}};var Un=new WeakSet;function Ui(e){Un.add(e)}function Rd(e){Un.delete(e)}function Ct(e){return e!=null&&Un.has(e)}function Ad(e){return e.composedPath().some(t=>t instanceof Object&&Un.has(t))}var cr=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","HEAD","META","LINK","TITLE"]);function Nr(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();if(t instanceof Object&&"host"in t&&t.host)return t.host;let r=(e.ownerDocument??e).defaultView?.frameElement;return e===e.ownerDocument?.documentElement&&r?r:null}function Dr(e){if(e.tagName!=="IFRAME"&&e.tagName!=="FRAME")return null;try{return e.contentDocument??null}catch{return null}}function Dt(e){if(e instanceof Object&&"shadowRoot"in e&&e.shadowRoot)return Array.from(e.shadowRoot.childNodes);if(e.tagName==="SLOT"){let r=e.assignedNodes?.({flatten:!0})??[];if(r.length>0)return r}let t=e.tagName?Dr(e):null;return t?.body?[t.body]:Array.from(e.childNodes)}function C(e){return e.replace(/\s+/g," ").trim()}function z(e,t){let r=Array.from(e);return r.length<=t?e:`${r.slice(0,t-1).join("")}\u2026`}var _x=new Set(["button","link","heading","option","tab","menuitem","menuitemcheckbox","menuitemradio","checkbox","radio","switch","treeitem"]);function ie(e){let t=[],r=n=>{if(n.nodeType===3){t.push(n.textContent??"");return}if(n.nodeType!==1)return;let o=n;if(o.getAttribute("aria-hidden")==="true"||o.hidden||["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","SELECT","TEXTAREA"].includes(o.tagName))return;if(o.tagName==="IMG"){t.push(` ${o.getAttribute("alt")??""} `);return}if(o.tagName==="INPUT")return;let i=o.ownerDocument.defaultView?.getComputedStyle(o);if(i?.display==="none"||i?.visibility==="hidden")return;let s=i?.display&&i.display!=="inline";s&&t.push(" ");for(let a of Array.from((o.shadowRoot??o).childNodes))r(a);s&&t.push(" ")};return r(e),C(t.join(""))}function Sx(e,t){let r=e.getRootNode();return C(t.split(/\s+/).map(n=>{let o=r.getElementById?.(n);return o?o.getAttribute("aria-label")??ie(o):""}).join(" "))}function Ex(e){let t=e.labels;if(t&&t.length>0)return C(Array.from(t).map(ie).join(" "));let r=e.closest("label");return r?ie(r):""}function Pe(e,t){let r=e.getAttribute("aria-labelledby");if(r){let i=Sx(e,r);if(i)return i}let n=C(e.getAttribute("aria-label")??"");if(n)return n;let o=e.tagName;if(o==="INPUT"||o==="SELECT"||o==="TEXTAREA"){let i=Ex(e);if(i)return i;let s=e.type;if(o==="INPUT"&&["button","submit","reset"].includes(s))return C(e.value)||(s==="reset"?"Reset":s==="submit"?"Submit":"");if(o==="INPUT"&&s==="image")return C(e.getAttribute("alt")??"")}if(t!==null&&_x.has(t)){let i=ie(e);if(i)return i}return o==="IMG"?C(e.getAttribute("alt")??""):C(e.getAttribute("title")??e.getAttribute("placeholder")??"")}var $i=new Set(["button","link","checkbox","radio","switch","tab","menuitem","menuitemcheckbox","menuitemradio","option","combobox","listbox","textbox","searchbox","slider","spinbutton","treeitem"]),Cx=new Set([...$i,"heading","dialog","alertdialog","progressbar","img","none","presentation"]),Td={checkbox:"checkbox",radio:"radio",button:"button",submit:"button",reset:"button",image:"button",range:"slider",number:"spinbutton",search:"searchbox",file:"button",color:"button"};function Rx(e){let t=e.tagName;if(t==="A"||t==="AREA")return e.hasAttribute("href")?"link":null;if(t==="BUTTON"||t==="SUMMARY")return"button";if(t==="INPUT"){let n=(e.type||"text").toLowerCase();return n==="hidden"?null:Td[n]??"textbox"}if(t==="TEXTAREA")return"textbox";if(t==="SELECT"){let n=e;return n.multiple||n.size>1?"listbox":"combobox"}if(t==="OPTION")return"option";if(/^H[1-6]$/.test(t))return"heading";if(t==="DIALOG")return"dialog";if(t==="PROGRESS")return"progressbar";if(t==="IMG")return"img";let r=e.getAttribute("contenteditable");return r!==null&&r!=="false"?"textbox":null}function Ie(e){let t=e.getAttribute("role")?.trim().split(/\s+/)[0]?.toLowerCase();return t&&Cx.has(t)?t==="presentation"?"none":t:Rx(e)}function Pd(e){return e!==null&&($i.has(e)||e==="heading")}function $n(e){return e!==null&&$i.has(e)}var jn=new Set(["checkbox","radio","switch","menuitemcheckbox","menuitemradio"]),Id=new Set(["textbox","searchbox","combobox","spinbutton"]);function xe(e){if(e.tagName==="TEXTAREA")return!0;if(e.tagName!=="INPUT")return!1;let t=(e.type||"text").toLowerCase();return!(t in Td)&&t!=="hidden"}function lr(e){let t=e.getAttribute("contenteditable");return t!==null&&t!=="false"}var ke=class{constructor(t){this.env=t}styled=new Map;shown(t){let r=this.styled.get(t);if(r!==void 0)return r;let n=this.ownShown(t),o=Nr(t),i=n&&(o===null||this.shown(o));return this.styled.set(t,i),i}visible(t){if(!this.shown(t))return!1;let r=this.env.rect(t);if(r.width<=1||r.height<=1)return!1;let n=this.env.viewport();return r.x+r.width>0&&r.y+n.scrollY+r.height>0}ownShown(t){if(t.hasAttribute("inert")||t.getAttribute("aria-hidden")==="true"||t.hidden)return!1;let r=t.ownerDocument.defaultView?.getComputedStyle(t);return r?r.display==="none"||r.visibility==="hidden"||r.visibility==="collapse"?!1:r.opacity===""||Number(r.opacity)>0:!0}};function Ax(e,t){let r=e.rect(t),n=t.ownerDocument.defaultView?.frameElement,o=n?e.rect(n):{x:0,y:0};return{clientX:r.x-o.x+r.width/2,clientY:r.y-o.y+r.height/2}}function Tx(e){typeof e.scrollIntoView=="function"&&e.scrollIntoView({block:"center",inline:"center"})}function Ht(e,t,r){r||Tx(t);let n=t.ownerDocument.defaultView??window,o=r?{clientX:r.x,clientY:r.y}:Ax(e,t),i={bubbles:!0,cancelable:!0,composed:!0,view:n,button:0,...o},s=n.PointerEvent,a=(l,u)=>s?new s(l,{...i,buttons:u,pointerId:1,pointerType:"mouse",isPrimary:!0}):new n.MouseEvent(l,{...i,buttons:u});t.dispatchEvent(a("pointerover",0)),t.dispatchEvent(new n.MouseEvent("mouseover",i)),t.dispatchEvent(a("pointerdown",1)),t.dispatchEvent(new n.MouseEvent("mousedown",{...i,buttons:1}))&&typeof t.focus=="function"&&t.focus({preventScroll:!0}),t.dispatchEvent(a("pointerup",0)),t.dispatchEvent(new n.MouseEvent("mouseup",i)),t.dispatchEvent(new n.MouseEvent("click",{...i,detail:1}))}var Md=/\b(password|passcode|passphrase|pin|security (question|answer|code)|one[- ]time (code|password)|verification code|2fa code|otp)\b/i,Ld=/\b(card ?number|credit card|debit card|cvv|cvc|csc|security code on|expiry|expiration|exp date|iban|routing( number)?|account number|sort code|swift|ssn|social security|passport( number)?|tax id|tin|national id|driver'?s licen[cs]e)\b/i,Od=/\b(buy|pay|pay now|place (your )?order|checkout|check out|subscribe|donate|send money|transfer|trade|purchase|complete (purchase|payment|order)|add payment)\b/i,Nd=/\b(delete (my |your )?account|close (my |your )?account|deactivate|change (my |your )?password|reset password|two[- ]step|2[- ]?step|2fa|two[- ]factor|recovery (email|phone|code)|security settings|sign out of all|log ?out of all)\b/i,Gn=/\b(sign ?in|log ?in|sign ?up|create (an |your )?account|register|continue with google|choose an account)\b/i,zn=/\b(i'?m not a robot|verify (that )?you are (a )?human|are you human|human verification|captcha)\b/i,Dd=/\b(submit|send|post|publish|apply|confirm|finish|complete|share|invite)\b/i,Hd=/^(next|previous|prev|back|continue|search|go|filter|apply filters?|load more|show more|more|page \d+|\d+|[<>]+)$/i,Bd=/\b(delete|remove|discard|erase|destroy|permanently|finish attempt|end attempt|submit (quiz|test|exam|attempt|all|answers)|turn in|hand in|unsubscribe|cancel (my |your )?(subscription|order|plan))\b/i,Fd=/\.(exe|msi|dmg|pkg|deb|rpm|apk|ipa|crx|xpi|zip|rar|7z|tar|gz|iso|bat|sh|jar)(\?|#|$)/i,Ud=/(^|\.)(chromewebstore\.google\.com|chrome\.google\.com|addons\.mozilla\.org|microsoftedge\.microsoft\.com|apps\.apple\.com|play\.google\.com)$/i;var ji=new Set(["secret","payment","purchase","account","sign_in","captcha","file","download"]),Px=/\b(current-password|new-password|one-time-code)\b/,Ix=/\bcc-/;function Mx(e,t){return[t,e.getAttribute("name"),e.id,e.getAttribute("placeholder")].filter(Boolean).join(" ").replace(/[_-]/g," ")}function Lx(e,t){let r=[],n=e.getAttribute("autocomplete")??"",o=Mx(e,t);return(e.type?.toLowerCase()==="password"||Px.test(n)||Md.test(o))&&r.push("secret"),(Ix.test(n)||Ld.test(o))&&r.push("payment"),r}function Ox(e){return e.tagName==="INPUT"?["submit","image"].includes(e.type):e.tagName!=="BUTTON"?!1:e.type==="submit"&&e.form!==null}function Nx(e){if(e.tagName!=="A")return!1;if(e.hasAttribute("download"))return!0;let t=e.href;try{let r=new URL(t);return Fd.test(r.pathname)||Ud.test(r.hostname)}catch{return!1}}function Dx(e,t){let r=[];return Od.test(t)&&r.push("purchase"),Nd.test(t)&&r.push("account"),Gn.test(t)&&r.push("sign_in"),zn.test(t)&&r.push("captcha"),Nx(e)&&r.push("download"),!Hd.test(t.trim())&&(Dd.test(t)||Ox(e))&&r.push("submit"),Bd.test(t)&&r.push("irreversible"),r}function Bt(e,t,r){let n=new Set;if(e.tagName==="INPUT"&&e.type==="file"&&n.add("file"),xe(e)||lr(e)||e.tagName==="SELECT"||t==="textbox"||t==="combobox")for(let o of Lx(e,r))n.add(o);if($n(t)&&!Id.has(t))for(let o of Dx(e,r))n.add(o);return[...n]}function Hx(e,t,r){let n=e.elementFromPoint?.(t,r)??null;for(let o=0;o<10&&n?.shadowRoot;o++){let i=n.shadowRoot.elementFromPoint(t,r);if(!i||i===n)break;n=i}for(let o=n;o;o=Nr(o))if(Ct(o))return null;return n}function dr(e,t){let r=t.el??t.mark;if(r!==null){let n=e.session.element(r);if(!n)throw new D("stale_element");return n}if(t.point!==null){let n=Fn(t.point,e.env.viewport());if(!n)throw new D("refused");let o=Hx(e.env.doc,n.x,n.y);if(!o)throw new D("not_found");return o}throw new D("not_found")}function Bx(e){let t=new Set;for(let r=e,n=0;r&&n<6;r=Nr(r),n++){let o=Ie(r);for(let i of Bt(r,o,Pe(r,o)))t.add(i)}return[...t]}function ft(e){if(Bx(e).some(t=>ji.has(t)))throw new D("refused")}var Wn=e=>C(e).toLowerCase();function Gi(e,t,r){let n=Wn(r);for(let o of[i=>i===n,i=>i.startsWith(n),i=>i.includes(n)]){let i=e.filter(s=>o(Wn(t(s))));if(i.length===1)return i[0];if(i.length>1)return null}return null}var Fx=e=>new Promise(t=>setTimeout(t,e));async function Ux(e,t){let r=new ke(e),n=(t.getAttribute("aria-controls")??t.getAttribute("aria-owns")??"").split(/\s+/).filter(Boolean);for(let o=0;o<10;o++){let i=n.map(c=>e.doc.getElementById(c)).filter(c=>c!==null),a=(i.length>0?i:[e.doc.body]).flatMap(c=>Array.from(c.querySelectorAll('[role="option"]'))).filter(c=>r.visible(c));if(a.length>0)return a;await Fx(50)}return[]}async function jd(e,t,r){if(t.tagName==="SELECT"){let i=t,s=Gi(Array.from(i.options),c=>c.text,r);if(!s||s.disabled)throw new D("not_found");i.value=s.value,s.selected=!0;let a=t.ownerDocument.defaultView??window;return i.dispatchEvent(new a.Event("input",{bubbles:!0})),i.dispatchEvent(new a.Event("change",{bubbles:!0})),i.selectedIndex===s.index}Ie(t)!=="option"&&Ht(e,t);let n=Ie(t)==="option"?[t]:await Ux(e,t),o=Gi(n,i=>Pe(i,"option"),r);if(!o)throw new D("not_found");return ft(o),Ht(e,o),o.getAttribute("aria-selected")==="true"||Wn(Pe(t,Ie(t))).includes(Wn(r))}function $d(e){return e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true"||e.getAttribute("aria-pressed")==="true"}function Gd(e,t,r){return $d(t)!==r&&Ht(e,t),$d(t)===r}var zi=e=>xe(e)?e.value:e.innerText??e.textContent??"";function zd(e,t,r,n){let o=zi(e);if(xe(e))return n?o===t:o===r+t;let i=C(n?t:r+t);return C(o)===i||C(e.textContent??"")===i}function $x(e,t){let r=e.ownerDocument;if(xe(e)){let i=e.value.length;e.setSelectionRange(t?0:i,i);return}let n=r.createRange();n.selectNodeContents(e),t||n.collapse(!1);let o=r.getSelection();o?.removeAllRanges(),o?.addRange(n)}function jx(e,t){let r=e.ownerDocument;typeof r.execCommand=="function"&&r.execCommand("insertText",!1,t)}function Gx(e,t){let r=e.ownerDocument.defaultView;if(!r?.DataTransfer||!r.ClipboardEvent)return;let n=new r.DataTransfer;n.setData("text/plain",t),e.dispatchEvent(new r.ClipboardEvent("paste",{clipboardData:n,bubbles:!0,cancelable:!0,composed:!0}))}function zx(e,t){let r=e.ownerDocument.defaultView??window,n={inputType:"insertText",data:t,bubbles:!0,composed:!0};if(e.dispatchEvent(new r.InputEvent("beforeinput",{...n,cancelable:!0}))){if(xe(e))e.setRangeText(t,e.selectionStart??0,e.selectionEnd??0,"end");else{let o=e.ownerDocument.getSelection(),i=o&&o.rangeCount>0?o.getRangeAt(0):null;if(!i||!e.contains(i.startContainer))return;i.deleteContents();let s=e.ownerDocument.createDocumentFragment();t.split(`
`).forEach((a,c)=>{c>0&&s.append(e.ownerDocument.createElement("br")),a&&s.append(e.ownerDocument.createTextNode(a))}),i.insertNode(s)}e.dispatchEvent(new r.InputEvent("input",n))}}function Wx(e,t,r,n){let o=e.ownerDocument.defaultView??window,i=e.tagName==="INPUT"?o.HTMLInputElement.prototype:o.HTMLTextAreaElement.prototype;Object.getOwnPropertyDescriptor(i,"value")?.set?.call(e,n?t:r+t),e.dispatchEvent(new o.Event("input",{bubbles:!0,composed:!0}))}var Kx=new Set(["text","search","url","tel","password"]),Vx=e=>e.tagName!=="INPUT"||Kx.has(e.type);function Wi(e,t,r){if(!xe(e)&&!lr(e))return!1;let o=e.tagName==="INPUT"?t.replace(/\s*\n\s*/g," "):t;e.focus({preventScroll:!0});let i=zi(e),s=Vx(e)?[jx,Gx,zx]:[],a=!1,c={replace:r,text:o};for(let l of s){if($x(e,c.replace),l(e,c.text),a=zd(e,o,i,r))break;zi(e)!==i&&(c={replace:!0,text:r?o:i+o})}return!a&&xe(e)&&(Wx(e,o,i,r),a=zd(e,o,i,r)),a&&xe(e)&&e.dispatchEvent(new(e.ownerDocument.defaultView??window).Event("change",{bubbles:!0})),a}function ur(e){let t=e.activeElement;for(let r=0;r<20&&t;r++){let n=t.shadowRoot?.activeElement??Dr(t)?.activeElement??null;if(!n||n===t)break;t=n}return!t||t.tagName==="BODY"||t.tagName==="HTML"?null:t}var qx={Enter:"Enter",Escape:"Escape",Tab:"Tab",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",PageDown:"PageDown",PageUp:"PageUp",Backspace:"Backspace"},Xx='a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';function Jx(e,t){let r=Array.from(e.querySelectorAll(Xx)),n=t?r.indexOf(t):-1;r[(n+1)%Math.max(1,r.length)]?.focus()}function Wd(e,t){if(!Hs.includes(t))throw new D("refused");let r=ur(e)??e.body;r!==e.body&&ft(r);let n=r.ownerDocument.defaultView??window,o={key:t,code:qx[t],bubbles:!0,cancelable:!0,composed:!0};if(r.dispatchEvent(new n.KeyboardEvent("keydown",o))&&(t==="Tab"&&Jx(r.ownerDocument,ur(e)),(t==="PageDown"||t==="PageUp")&&n.scrollBy?.(0,(t==="PageDown"?1:-1)*n.innerHeight*.85),t==="Backspace"&&xe(r))){let s=r.selectionStart??r.value.length,a=r.selectionEnd??s;s===a&&s>0?r.setRangeText("",s-1,a,"end"):r.setRangeText("",s,a,"end"),r.dispatchEvent(new n.Event("input",{bubbles:!0}))}r.dispatchEvent(new n.KeyboardEvent("keyup",o))}function Vd(e,t,r,n){let o=e.doc.defaultView,i=t??e.doc.scrollingElement??e.doc.documentElement,s=t?i.scrollTop:o?.scrollY??0,a=t?i.clientHeight:o?.innerHeight??0,l=n==="end"?r==="down"?i.scrollHeight:0:s+(r==="down"?1:-1)*a*.85;return t?t.scrollTop=l:o?.scrollTo?.({top:l,behavior:"instant"}),(t?i.scrollTop:o?.scrollY??0)!==s}var Kd=e=>new Promise(t=>setTimeout(t,e));async function qd(e,t,r){let n=Math.min(Math.max(t??We.waitMs,0),We.waitMs);if(r===null)return await Kd(n),null;let o=C(r).toLowerCase(),i=e.now()+We.waitMs;for(;;){if(ie(e.doc.body).toLowerCase().includes(o))return!0;if(e.now()>=i)return!1;await Kd(100)}}function Yx(e){let t=new Set;for(let r of Array.from(e.querySelectorAll("a[href], area[href]")))t.add(Kn(r.href));return t}var Kn=e=>e.replace(/#.*$/,"");function Xd(e,t,r){let n;try{n=new URL(r,e.doc.baseURI)}catch{throw new D("refused")}if(n.protocol!=="https:"&&n.protocol!=="http:")throw new D("refused");let o=n.href;if(Kn(o)===Kn(t.startUrl)||Yx(e.doc).has(Kn(o)))return o;throw new D("refused")}var Rt=(e=null,t=!1)=>({ran:!0,checked:e,navigated:t});function Yd(e){let t=e.tagName==="INPUT"?e.type:e.getAttribute("role")??"";return t==="radio"||t==="checkbox"?t:null}function Jd(e){return Yd(e)===null?null:e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true"}async function Ki(e,t){let{env:r}=e;switch(t.action){case"click":{let n=dr(e,t);ft(n);let o=r.doc.URL,i=Jd(n);Ht(r,n,t.el===null&&t.mark===null&&t.point!==null?Fn(t.point,r.viewport())??void 0:void 0),await Promise.resolve();let s=Jd(n),a=i===null||s===null?null:Yd(n)==="radio"?s:s!==i;return Rt(a,r.doc.URL!==o)}case"type":{let n=dr(e,t);return ft(n),Rt(Wi(n,t.text??"",t.replace??!1))}case"select":{let n=dr(e,t);return ft(n),Rt(await jd(r,n,t.option??""))}case"check":{let n=dr(e,t);return ft(n),Rt(Gd(r,n,t.on??!0))}case"key":return Wd(r.doc,t.key??""),Rt();case"scroll":{let n=t.el!==null||t.mark!==null?dr(e,t):null;return Rt(Vd(r,n,t.dir??"down",t.by??"screen"))}case"wait":return Rt(await qd(r,t.ms,t.for));case"navigate":{let n=Xd(r,e.session,t.url??"");return(e.go??(o=>r.doc.defaultView?.location.assign(o)))(n),Rt(null,!0)}default:throw new D("refused")}}var Zd="coere-layer",Zx="all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; contain: layout style;",Qx=1e3;function Hr(e,t=()=>Date.now()){let r=e.createElement(Zd);r.setAttribute("style",Zx);let n=r.attachShadow({mode:"closed"});Ui(r),e.documentElement.append(r);let o=-1/0,i=null,s=()=>{i=null,!r.isConnected&&(o=t(),e.documentElement.append(r))},a=e.defaultView?.MutationObserver??MutationObserver,c=new a(()=>{if(r.isConnected||i!==null)return;let l=Math.max(0,o+Qx-t());i=setTimeout(s,l)});return c.observe(e.documentElement,{childList:!0}),{host:r,root:n,remove(){c.disconnect(),i!==null&&clearTimeout(i),r.remove(),Rd(r)}}}var Qd="coere-marks";function Vi(e,t,r){let n=e.createElement("div");return n.setAttribute("style",`position:fixed;left:${t.x}px;top:${t.y}px;width:${t.width}px;height:${t.height}px;box-sizing:border-box;${r}`),n}var e1=`background:${Je.color};color:#fff;font:600 11px/16px system-ui,sans-serif;text-align:center;border-radius:4px;`,t1=`border:2px solid ${Je.color};border-radius:3px;`,r1=`border:1px dashed ${Je.color}88;color:${Je.color};font:600 12px/1 system-ui,sans-serif;padding:2px;`;function Vn(e){e.root.querySelector(`#${Qd}`)?.remove()}function qi(e,t,r,n){Vn(e);let o=e.host.ownerDocument,i=o.createElement("div");if(i.id=Qd,n)for(let{cell:a,box:c}of Ul(r)){let l=Vi(o,c,r1);l.textContent=a,i.append(l)}let s=$l(t,r);for(let a of s){i.append(Vi(o,a.outline,t1));let c=Vi(o,a.tag,e1);c.textContent=String(a.n),i.append(c)}return e.root.append(i),s.length}var n1="#e6e8ef";async function o1(e){let t=new Uint8Array(await e.arrayBuffer()),r="";for(let n=0;n<t.length;n+=32768)r+=String.fromCharCode(...t.subarray(n,n+32768));return`data:${e.type};base64,${btoa(r)}`}async function Xi(e){let t=Math.max(1,e.width),r=Math.max(1,e.height),n=new OffscreenCanvas(t,r),o=n.getContext("2d");if(!o)throw new Error("no 2d context");o.fillStyle=e.background,o.fillRect(0,0,t,r);for(let s of e.ops){let a=s.box;s.kind==="rect"?(o.fillStyle=s.color,o.fillRect(a.x,a.y,a.width,a.height)):s.kind==="image"?(o.fillStyle=n1,o.beginPath(),o.roundRect(a.x,a.y,a.width,a.height,Math.min(6,a.width/4,a.height/4)),o.fill()):(o.fillStyle=s.color,o.font=`${s.size}px system-ui, sans-serif`,o.textBaseline="top",o.save(),o.beginPath(),o.rect(a.x,a.y,a.width,a.height),o.clip(),o.fillText(s.text,a.x,a.y),o.restore())}let i=await n.convertToBlob({type:"image/jpeg",quality:.6});return{dataUrl:await o1(i),width:t,height:r,sketch:!0}}var i1=800,s1=new Set(["IMG","VIDEO","CANVAS","SVG","svg","PICTURE","IFRAME","OBJECT","EMBED"]),eu=e=>e===""||e==="transparent"||/rgba\([^)]*,\s*0\)$/.test(e);function a1(e){return C(Array.from(e.childNodes).filter(t=>t.nodeType===3).map(t=>t.textContent??"").join(" "))}function Ji(e,t){let r=e.viewport(),n=r.width>0?t/r.width:1,o=new ke(e),i=[],s=f=>f.ownerDocument.defaultView?.getComputedStyle(f),a=e.doc.body,c=a?s(a)?.backgroundColor??"":"",l=eu(c)?"#ffffff":c,u=f=>({x:f.x*n,y:f.y*n,width:f.width*n,height:f.height*n}),p=f=>f.x<r.width&&f.y<r.height&&f.x+f.width>0&&f.y+f.height>0,d=f=>{if(i.length>=i1||f.nodeType!==1||Ct(f))return;let h=f;if(cr.has(h.tagName)||!o.shown(h))return;let w=e.rect(h),y=s(h);if(w.width>1&&w.height>1&&p(w)){if(s1.has(h.tagName)){i.push({kind:"image",box:u(w)});return}y&&!eu(y.backgroundColor)&&h!==a&&i.push({kind:"rect",box:u(w),color:y.backgroundColor});let b=a1(h);if(b){let v=Math.min(20,Math.max(4,(parseFloat(y?.fontSize??"16")||16)*n));i.push({kind:"text",box:u(w),size:v,color:y?.color||"#111111",text:z(b,120)})}}for(let b of Dt(h))d(b)};return a&&d(a),{width:Math.round(t),height:Math.round(r.height*n),background:l,ops:i}}function qn(e){let t=3735928559,r=1103547991;for(let n=0;n<e.length;n++){let o=e.charCodeAt(n);t=Math.imul(t^o,2654435761),r=Math.imul(r^o,1597334677)}return t=Math.imul(t^t>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),r=Math.imul(r^r>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),(4294967296*(2097151&r)+(t>>>0)).toString(16).padStart(14,"0")}var c1=new Set(["NAV","FOOTER","ASIDE","DIALOG"]),l1=new Set(["navigation","banner","contentinfo","complementary","search","dialog","alertdialog"]),d1=/(^|[-_\s])(cookies?|consent|gdpr|banner|ads?|advert|advertisement|sponsor(ed)?|promo|newsletter|popup|modal|share|social|related|breadcrumbs?|menu|sidebar|footer|nav(bar)?|skip)($|[-_\s])/i;function Yi(e){if(c1.has(e.tagName)||e.tagName==="HEADER"&&!e.closest('article, main, [role="main"]'))return!0;let t=e.getAttribute("role");if(t&&l1.has(t))return!0;let r=`${e.getAttribute("class")??""} ${e.id}`;return r.trim()!==""&&d1.test(r)}var u1="p, pre, li, td, blockquote, dd";function p1(e){let t=C(e.textContent??"").length;return t===0?1:Array.from(e.querySelectorAll("a")).reduce((n,o)=>n+C(o.textContent??"").length,0)/t}var f1=e=>{for(let t=e;t;t=t.parentElement)if(Yi(t))return!0;return!1};function tu(e,t){let r=e.body??e.documentElement,n=e.querySelector('main, [role="main"]')??(e.querySelectorAll("article").length===1?e.querySelector("article"):null);if(n&&t.shown(n)&&ie(n).length>=200)return n;let o=new Map;for(let a of Array.from(r.querySelectorAll(u1))){if(!t.shown(a)||f1(a))continue;let c=C(a.textContent??"");if(c.length<25)continue;let l=1+(c.match(/,/g)?.length??0)+Math.min(Math.floor(c.length/100),3),u=a.parentElement;u&&o.set(u,(o.get(u)??0)+l);let p=u?.parentElement;p&&o.set(p,(o.get(p)??0)+l/2)}let i=r,s=0;for(let[a,c]of o){let l=c*(1-p1(a));l>s&&(s=l,i=a)}return i}var m1=new Set(["P","DIV","SECTION","ARTICLE","MAIN","BLOCKQUOTE","PRE","FIGURE","FIGCAPTION","DL","DT","DD","FORM","FIELDSET","DETAILS","SUMMARY","ADDRESS","HEADER","UL","OL","BR","HR"]),h1=10,g1=50;function b1(e){return Array.from(e.querySelectorAll("tr")).slice(0,g1).map(r=>Array.from(r.children).map(n=>C(n.textContent??"").replace(/\t/g," ")).join("	")).filter(r=>r.replace(/\t/g,"").trim()!=="").join(`
`)}function ru(e,t){let r=[],n=[],o=[],i="",s=()=>{let c=C(o.join(""));c&&r.push(i+c),(c||i==="")&&(i=""),o=[]},a=c=>{if(c.nodeType===3){o.push(c.textContent??"");return}if(c.nodeType!==1)return;let l=c;if(cr.has(l.tagName)||!t.shown(l)||l!==e&&Yi(l))return;let u=/^H([1-6])$/.exec(l.tagName);if(u){s();let f=C(l.textContent??"");f&&r.push(`${"#".repeat(Number(u[1]))} ${z(f,200)}`);return}if(l.tagName==="TABLE"){s();let f=b1(l);f&&n.length<h1&&(n.push(f),r.push(`(table ${n.length})`));return}if(l.tagName==="IMG"){let f=C(l.getAttribute("alt")??"");f&&o.push(` ${f} `);return}let p=l.tagName==="LI",d=p||m1.has(l.tagName);d&&s(),p&&(i="- ");for(let f of Dt(l))a(f);d&&s()};return a(e),s(),{lines:r,tables:n}}var w1=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,y1=/(?:\+\d{1,3}[ .-]?)?(?:\(\d{2,4}\)[ .-]?)?\d{2,4}(?:[ .-]\d{2,4}){1,4}/g,x1=/^https?:\/\/(?:[a-z]+\.)?(?:linkedin\.com\/(?:in|company)\/|twitter\.com\/|x\.com\/|github\.com\/|mastodon\.social\/@)[^/?#]+/i,nu=e=>e.replace(/\D/g,"").replace(/^1(?=\d{10}$)/,"");function Zi(e,t){let r=new Set(e.map(t));return n=>{let o=t(n);!o||r.has(o)||e.length>=20||(r.add(o),e.push(n))}}function ou(e,t){let r=[],n=[],o=[],i=Zi(r,c=>c.toLowerCase()),s=Zi(n,nu),a=Zi(o,c=>c.toLowerCase().replace(/\/$/,""));for(let c of Array.from(e.querySelectorAll("a[href]"))){let l=c.getAttribute("href")??"";if(/^mailto:/i.test(l))i(decodeURIComponent(l.slice(7).split("?")[0]??"").trim());else if(/^tel:/i.test(l))s(l.slice(4).trim());else{let u=x1.exec(c.href);u&&a(u[0])}}for(let c of t.matchAll(w1))i(c[0].replace(/\.$/,""));for(let c of t.matchAll(y1)){let l=nu(c[0]).length;l>=7&&l<=15&&!/^\d{4}-\d{2}-\d{2}$/.test(c[0])&&s(c[0].trim())}return{emails:r,phones:n,profiles:o}}var v1=20,iu=200,k1=new Set(Us);function su(e){return C(e.querySelector('meta[name="description" i]')?.getAttribute("content")??"")}function au(e){let t={};for(let r of Array.from(e.querySelectorAll('meta[property^="og:"]'))){let n=r.getAttribute("property"),o=C(r.getAttribute("content")??"");o&&!(n in t)&&Object.keys(t).length<20&&(t[n]=z(o,iu))}return t}function _1(e){let t=e["@type"];return(Array.isArray(t)?t:[t]).filter(r=>typeof r=="string")}function Qi(e){return e===null?"":typeof e!="object"?C(String(e)):Array.isArray(e)?e.map(Qi).filter(Boolean).join(", "):typeof e.name=="string"?C(e.name):Object.entries(e).filter(([r])=>!r.startsWith("@")).map(([,r])=>typeof r=="object"?"":Qi(r)).filter(Boolean).join(", ")}function S1(e){let t={};for(let[r,n]of Object.entries(e)){if(r.startsWith("@"))continue;let o=Qi(n);o&&(t[r]=z(o,iu))}return t}function*es(e,t=!1){if(Array.isArray(e))for(let r of e)yield*es(r,t);else if(e&&typeof e=="object"){yield{node:e,nested:t};for(let[r,n]of Object.entries(e))typeof n=="object"&&(yield*es(n,r!=="@graph"))}}function cu(e,t){let r=[];for(let n of Array.from(e.querySelectorAll('script[type="application/ld+json" i]'))){let o;try{o=JSON.parse(n.textContent??"")}catch{continue}for(let{node:i,nested:s}of es(o)){let a=_1(i).find(l=>k1.has(l));if(!a||r.length>=v1)continue;let c=Object.fromEntries(Object.entries(S1(i)).map(([l,u])=>[l,t(u)]));s&&Object.keys(c).every(l=>l==="name")||r.push({type:a,fields:c})}}return r}var E1=/^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|ref|ref_src|_hsenc|_hsmi|igshid|yclid)$/i;function ts(e){let t;try{t=new URL(e)}catch{return e}t.hash="";for(let r of[...t.searchParams.keys()])E1.test(r)&&t.searchParams.delete(r);return t.pathname.length>1&&t.pathname.endsWith("/")&&(t.pathname=t.pathname.replace(/\/+$/,"")),t.href}var C1=80,R1=.2,A1=.25;function T1(e,t,r){let n=e.doc,o=[...Array.from(r.querySelectorAll("a[href]")),...Array.from(n.querySelectorAll("a[href]"))],i=new Set,s=[];for(let a of o){let c=a.href;if(!/^https?:\/\//i.test(c)||!t.shown(a))continue;let l=ts(c);if(i.has(l))continue;i.add(l);let u=z(e.redact(Pe(a,"link")),80);if(u&&s.push({text:u,url:c}),s.length>=C1)break}return s}function P1(e,t){let r=C(t.toLowerCase()).split(" ").filter(Boolean),n=e.findIndex(s=>/^#+ /.test(s)&&r.every(a=>s.toLowerCase().includes(a)));if(n<0)return null;let o=/^#+/.exec(e[n])[0].length,i=e.findIndex((s,a)=>a>n&&/^#+ /.test(s)&&/^#+/.exec(s)[0].length<=o);return e.slice(n,i<0?void 0:i)}function rs(e,t,r){let n=[],o=0;for(let i of t){let s=e.count(`${i}
`);if(o+s>r)break;n.push(i),o+=s}return n}function ns(e,t){let r=t.links.map(o=>`[${o.text}](${o.url})`).join(`
`),n=JSON.stringify({og:t.og,jsonLd:t.jsonLd,contacts:t.contacts});return e.count([t.url,t.title,t.description,t.main,t.tables.join(`

`),r,n].join(`
`))}function os(e,t){let r=e.doc,n=new ke(e),o=tu(r,n),i=ru(o,n),s=i.lines.map(b=>e.redact(b));t&&(s=P1(s,t)??s);let a=s.flatMap(b=>/^\(table (\d+)\)$/.exec(b)?.[1]??[]).map(Number),c=gr.pageText,l={url:r.URL,title:e.redact(C(r.title)),description:e.redact(su(r)),og:Object.fromEntries(Object.entries(au(r)).map(([b,v])=>[b,e.redact(v)])),jsonLd:cu(r,e.redact),contacts:ou(r,e.redact(ie(r.body??r.documentElement)))},u=T1(e,n,o),p=rs(e,u.map(b=>`[${b.text}](${b.url})`),c*R1).map((b,v)=>u[v]),d=a.map(b=>e.redact(i.tables[b-1]??"")),f=d.map(b=>rs(e,b.split(`
`),c*A1/Math.max(1,d.length)).join(`
`)),h=ns(e,{...l,main:"",tables:f,links:p}),w=rs(e,s,Math.max(0,c-h-8)).join(`
`),y={...l,main:w,tables:f,links:p};return{...y,hash:qn(C(s.join(`
`).toLowerCase())),tokens:ns(e,y)}}var Br=class{constructor(t){this.startUrl=t}numberOf=new WeakMap;byNumber=new Map;next=1;last=null;number(t){let r=this.numberOf.get(t);if(r!==void 0)return r;let n=this.next++;return this.numberOf.set(t,n),this.byNumber.set(n,new WeakRef(t)),n}element(t){let r=this.byNumber.get(t)?.deref()??null;return r?.isConnected?r:null}numbered(t){return this.numberOf.get(t)??null}};var pr={quietMs:300,maxMs:3e3,afterNavigationMs:8e3,pollMs:50},I1='[aria-busy="true"], [role="progressbar"]:not([aria-valuenow]), progress:not([value])';function M1(e){let t=new ke(e);return Array.from(e.doc.querySelectorAll(I1)).some(r=>t.shown(r))}function is(e,t){let r=t.quietMs??pr.quietMs,n=t.maxMs??(t.afterNavigation?pr.afterNavigationMs:pr.maxMs),o=e.now(),i=o,s=e.doc.defaultView?.MutationObserver??MutationObserver,a=new s(()=>{i=e.now()});return a.observe(e.doc.documentElement,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),new Promise(c=>{let l=()=>{let u=e.now(),p=u-i>=r&&e.doc.readyState!=="loading"&&!M1(e);if(p||u-o>=n){a.disconnect(),c({quiet:p,ms:u-o});return}setTimeout(l,pr.pollMs)};setTimeout(l,pr.pollMs)})}var L1={secret:"password",payment:"payment",purchase:"purchase",account:"account_security",sign_in:"sign_in",captcha:"captcha",file:"file",download:"file"};function ss(e){let t=[];for(let r of e){let n=new Set;for(let o of r.flags){let i=L1[o];i&&!n.has(i)&&(n.add(i),t.push({reason:i,el:r.n}))}}return t}var O1=/recaptcha|hcaptcha\.com|challenges\.cloudflare\.com|turnstile|arkoselabs|funcaptcha/i,N1=".g-recaptcha, .h-captcha, .cf-turnstile, [data-sitekey]",lu=/\b(just a moment|attention required|checking your browser|verify you are (a )?human|i'?m not a robot)\b/i,D1=/(^|\.)(stripe\.com|stripe\.network|braintreegateway\.com|braintree-api\.com|adyen\.com|adyenpayments\.com|paypal\.com|paypalobjects\.com)$/i,H1=/\b(checkout|check out|payment details|place (your )?order|order review|review your order|billing)\b/i,B1=/^(accounts\.google\.com|login\.microsoftonline\.com|login\.live\.com|appleid\.apple\.com)$/i,F1=/\b(security settings|change (your )?password|delete (your )?account|close (your )?account|two[- ]step verification|two[- ]factor)\b/i;function U1(e){return Array.from(e.querySelectorAll("iframe[src], frame[src]")).flatMap(t=>{try{return[new URL(t.getAttribute("src"),e.baseURI).href]}catch{return[]}})}function $1(e){let t=Array.from(e.querySelectorAll('h1, h2, [role="heading"]')).slice(0,6);return C([e.title,...t.map(r=>r.textContent??"")].join(" | "))}function j1(e){for(let t of Array.from(e.querySelectorAll('input[type="password"]'))){let r=t.closest("form")??t.parentElement;if(!r)continue;let o=Array.from(r.querySelectorAll('button, input[type="submit"], [role="button"]')).map(i=>i.textContent||i.value||"").join(" ");if(Gn.test(o))return!0}return!1}function Fr(e){let t=new Set,r=U1(e),n=$1(e),o=e.defaultView?.location.hostname??"",i=C((e.body?.textContent??"").slice(0,4e3));return(r.some(s=>O1.test(s))||e.querySelector(N1)||lu.test(n)||zn.test(n)||lu.test(i))&&t.add("captcha"),r.some(s=>D1.test(new URL(s).hostname))&&t.add("payment"),H1.test(n)&&t.add("purchase"),(B1.test(o)||j1(e)||/\bchoose an account\b/i.test(n))&&t.add("sign_in"),F1.test(n)&&t.add("account_security"),[...t].map(s=>({reason:s,el:null}))}var G1=new Set(["button","link","checkbox","radio","switch","option","menuitem","menuitemcheckbox","menuitemradio","textbox","searchbox","slider","spinbutton","heading","tab"]),z1=new Set(["P","DIV","LI","TR","TD","TH","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","UL","OL","TABLE","FORM","FIELDSET","LEGEND","DD","DT","DL","HEADER","FOOTER","MAIN","NAV","ASIDE","BLOCKQUOTE","PRE","FIGURE","FIGCAPTION","DETAILS","BR","HR","LABEL","BODY"]),W1=300;function K1(e){if(e.hasAttribute("onclick"))return!0;let t=e.getAttribute("tabindex");if(t!==null&&Number(t)>=0)return!0;let r=e.ownerDocument.defaultView;if(r?.getComputedStyle(e).cursor!=="pointer")return!1;let o=e.parentElement;return!o||r?.getComputedStyle(o).cursor!=="pointer"}var V1="a[href],button,input,select,textarea,[role],[contenteditable],[onclick],[tabindex]";function du(e){let t=new ke(e),r=[],n=null,o=[],i=0,s=()=>{let l=z(C(o.join("")),W1);l&&r.push({kind:"text",text:l,y:i}),o=[]},a=(l,u)=>{if(Ct(l))return;if(l.nodeType===3){if(u||!l.textContent?.trim())return;o.length===0&&(i=l.parentElement?e.rect(l.parentElement).y:0),o.push(l.textContent);return}if(l.nodeType!==1){if(l.nodeType===9||l.nodeType===11)for(let y of Dt(l))a(y,u);return}let p=l;if(cr.has(p.tagName)||!t.shown(p))return;let d=Ie(p);d===null&&K1(p)&&!p.querySelector(V1)&&(d="clickable");let f=d==="clickable"||Pd(d);if(f&&t.visible(p)){s();let y=z(Pe(p,d)||(d==="clickable"?ie(p):""),80);if(d==="heading"&&(n=z(y,80)),r.push({kind:"el",found:{el:p,role:d,name:y,rect:e.rect(p),heading:d==="heading"?null:n}}),G1.has(d)||d==="clickable"||p.tagName==="SELECT"||p.tagName==="TEXTAREA")return}let h=z1.has(p.tagName);h&&s();let w=u||p.tagName==="LABEL"||f&&$n(d);for(let y of Dt(p))a(y,w);h&&s()},c=e.doc.body??e.doc.documentElement;return a(c,!1),s(),r}function Xn(e){return`${e.role} ${JSON.stringify(e.name)}`}function uu(e,t,r){if(e===null)return null;let n=new Map(t.map(a=>[a.n,Xn(a)])),o=t.filter(a=>e.labels.get(a.n)!==Xn(a)).map(a=>({n:a.n,text:Xn(a)})),i=[...e.labels].filter(([a,c])=>n.get(a)!==c).map(([a,c])=>({n:a,text:c})),s=r.filter(a=>!e.texts.has(a)).slice(0,5);return{added:o,removed:i,text:s}}function pu(e,t,r){return{labels:new Map(e.map(n=>[n.n,Xn(n)])),texts:new Set(t),shown:new Set(r)}}function q1(e,t){return e.inView?0:e.y<0?-e.y:Math.max(0,e.y-t)}function fu(e,t){return e.map((r,n)=>[n,q1(r,t)]).sort((r,n)=>r[1]-n[1]||r[0]-n[0]).map(([r])=>r)}function mu(e,t){let r=new Set,n=0,o=0,i=c=>{e[c].y<0?n++:o++},s=t.headerCost,a=fu(e,t.height).filter(c=>e[c].kind==="el");for(let c of a){let l=e[c];r.size<t.maxElements&&s+l.cost<=t.maxTokens&&(!t.viewportOnly||l.inView)?(r.add(c),s+=l.cost):i(c)}for(let c of fu(e,t.height)){let l=e[c];l.kind!=="text"||t.viewportOnly&&!l.inView||s+l.cost>t.maxTokens||(r.add(c),s+=l.cost)}return{kept:e.filter((c,l)=>r.has(l)),above:n,below:o}}var Jn=e=>e.replace(/[\r\n\u2028\u2029]+/g," "),as=e=>JSON.stringify(Jn(e));function X1(e,t){try{let r=new URL(e),n=t&&r.origin===t.origin?`${r.pathname}${r.search}`:r.href;return n.length<=200?n:null}catch{return null}}function hu(e,t){let r=[`[${e.n}] ${e.role} ${as(e.name)}`];e.value!==null&&r.push(e.value==="hidden"?"value=hidden":`value=${as(e.value)}`),e.checked!==null&&r.push(jn.has(e.role)?e.checked?"checked":"unchecked":e.checked?"selected":""),e.disabled&&r.push("disabled");let n=e.href?X1(e.href,t):null;n&&r.push(`href=${n}`);let o=e.flags.filter(i=>i!=="download");return o.length>0&&r.push(`flags=${o.join(",")}`),r.filter(Boolean).join(" ")}function gu(e){return`text: ${Jn(e)}`}function J1(e){let t=[];for(let n of e.added.slice(0,8))t.push(`+ [${n.n}] ${Jn(n.text)}`);e.added.length>8&&t.push(`+ ${e.added.length-8} more`);for(let n of e.text)t.push(`+ text ${as(z(n,80))}`);let r=e.removed.slice(0,12).map(n=>`[${n.n}]`);return r.length>0&&t.push(`- ${r.join(" ")}${e.removed.length>12?` and ${e.removed.length-12} more`:""}`),`changed: ${t.length>0?t.join("; "):"nothing"}`}function cs(e){let t=e.url;try{let i=new URL(e.url);t=`${i.host}${i.pathname}`}catch{}let r=e.view,n=[r.below>0?`${r.below} more elements below`:"",r.above>0?`${r.above} more elements above`:""],o=[`page: ${Jn(z(e.title,80))} | ${z(t,120)} | step ${e.step} of ${e.steps}`,[`view: ${r.width}x${r.height}, top ${r.topPct}% of ${r.heightPct}%`,...n.filter(Boolean)].join("; ")];return e.focus!==null&&o.push(`focus: [${e.focus}]`),e.changed!==null&&o.push(J1(e.changed)),o}var Y1=80;function Z1(e,t){return xe(e)?e.value:e.tagName==="SELECT"?Array.from(e.selectedOptions??[]).map(n=>C(n.text)).join(", "):lr(e)?ie(e):t==="slider"||t==="spinbutton"?e.getAttribute("aria-valuetext")??e.getAttribute("aria-valuenow"):t==="textbox"||t==="searchbox"?ie(e):null}function Q1(e,t){return jn.has(t)?e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true":t==="option"||t==="tab"?e.tagName==="OPTION"?e.selected:e.getAttribute("aria-selected")==="true":null}function e0(e){if(e.disabled===!0||e.getAttribute("aria-disabled")==="true")return!0;let t=e.closest("fieldset[disabled]");return t!==null&&!t.querySelector(":scope > legend")?.contains(e)}function t0(e,t){if(t!=="link"||!("href"in e))return null;let r=String(e.href);return/^https?:\/\//i.test(r)?r:null}function bu(e,t,r){let n=e.viewport(),o=Bt(t.el,t.role,t.name),i=o.includes("secret")||o.includes("payment"),s=i?null:Z1(t.el,t.role),a=i?"hidden":s?z(e.redact(C(s)),Y1):null,c=t.rect;return{n:r,role:t.role,name:e.redact(t.name),value:a,checked:Q1(t.el,t.role),disabled:e0(t.el),heading:t.heading===null?null:e.redact(t.heading),inView:c.x<n.width&&c.x+c.width>0&&c.y<n.height&&c.y+c.height>0,href:t0(t.el,t.role),flags:o}}var r0=24,wu={width:120,height:80};function n0(e){let t=e.viewport();return[...e.doc.querySelectorAll("canvas")].some(r=>{let n=e.rect(r);return n.width>=wu.width&&n.height>=wu.height&&n.y<t.height&&n.y+n.height>0&&n.x<t.width&&n.x+n.width>0})}function Yn(e,t,r){let n=e.viewport(),o=(()=>{try{return new URL(e.doc.URL)}catch{return null}})(),i=[];for(let b of du(e))if(b.kind==="el"){let v=bu(e,b.found,t.number(b.found.el)),E=hu(v,o);i.push({kind:"el",e:v,y:b.found.rect.y,inView:v.inView,line:E,cost:e.count(`${E}
`)})}else{let v=e.redact(b.text),E=gu(v),T=b.y>=0&&b.y<n.height;i.push({kind:"text",text:v,y:b.y,inView:T,line:E,cost:e.count(`${E}
`)})}let s=i.flatMap(b=>b.kind==="el"?[b.e]:[]),a=i.flatMap(b=>b.kind==="text"?[b.text]:[]),c=ur(e.doc),l={url:e.doc.URL,title:e.redact(e.doc.title),step:r.step,steps:r.steps,view:{width:n.width,height:n.height,topPct:n.height>0?Math.round(n.scrollY/n.height*100):0,heightPct:n.height>0?Math.round(n.scrollHeight/n.height*100):100,above:0,below:0},focus:c?t.numbered(c):null,changed:uu(t.last,s,a)},u=e.count(cs(l).join(`
`))+r0,{kept:p,above:d,below:f}=mu(i,{height:n.height,maxElements:gr.snapshotElements,maxTokens:gr.snapshotText,headerCost:u,viewportOnly:r.viewportOnly});l.view.above=d,l.view.below=f;let h=p.flatMap(b=>b.kind==="el"?[b.e]:[]),w=p.map(b=>b.kind==="el"?{el:b.e.n}:{text:b.text}),y=[...cs(l),...p.map(b=>b.line)].join(`
`);return t.last=pu(s,a,h.map(b=>b.n)),{...l,elements:h,lines:w,signature:qn(s.map(b=>`${b.role}:${b.name}`).join(`
`)),findings:[...Fr(e.doc),...ss(s)],canvas:n0(e),text:y,tokens:e.count(y)}}var o0=15e3;function ls(e){let t=Fi(e.doc,e.env),r=new Br(e.startUrl),n=null,o=()=>e.layer?.()??(n??=Hr(e.doc,t.now)),i=async s=>{switch(s.type){case"read":if(s.read==="text")return os(t,s.section);if(s.read==="snapshot")return Yn(t,r,{step:0,steps:0,viewportOnly:!1});throw new D("refused");case"snapshot":return Yn(t,r,s);case"do":return Ki({env:t,session:r,...e.go?{go:e.go}:{}},s.step);case"settle":return is(t,{afterNavigation:s.afterNavigation});case"marks":{if(!s.show)return Vn(o()),{count:0};let a=[...r.last?.shown??[]].flatMap(l=>{let u=r.element(l);return u?[{n:l,rect:t.rect(u)}]:[]}),c=t.viewport();return{count:qi(o(),a,{width:c.width,height:c.height},s.grid)}}case"picture":return Xi(Ji(t,s.width));default:throw new D("refused")}};return{env:t,session:r,async handle(s){let a,c=new Promise((l,u)=>{a=setTimeout(()=>u(new D("timeout")),o0)});try{let l=await Promise.race([i(s),c]);return{id:s.id,ok:!0,type:s.type,result:l}}catch(l){return{id:s.id,ok:!1,type:s.type,error:l instanceof D?l.code:"internal"}}finally{clearTimeout(a)}},dispose(){n?.remove(),n=null}}}function ds(e,t,r={}){let n=r.trusted??(l=>!0),o=l=>u=>{!n(u)||Ad(u)||t(l)},i=o("pointer"),s=o("key"),c=[e.defaultView,...Array.from(e.querySelectorAll("iframe")).map(l=>Dr(l)?.defaultView)].filter(l=>l!=null);for(let l of c)l.addEventListener("pointerdown",i,!0),l.addEventListener("keydown",s,!0);return()=>{for(let l of c)l.removeEventListener("pointerdown",i,!0),l.removeEventListener("keydown",s,!0)}}function _e(e){return/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[a-z]{2,}$/i.test(e.trim())}function me(e){return e.trim().toLowerCase()}function mt(e,t){let r=new Set(e.map(me)),n=new Set(t.map(me));return r.size===n.size&&[...r].every(o=>n.has(o))}function Me(e,t){let r=new Set(t.map(me));return e.filter(n=>!r.has(me(n)))}function I(e,t){let r=e[t];return typeof r=="string"?r:null}function At(e,t){let r=e[t];return typeof r=="number"&&Number.isFinite(r)?r:null}function Ft(e,t){return e[t]===!0}function Ye(e,t){let r=e[t];return Array.isArray(r)?r.filter(n=>typeof n=="string"):[]}function Ue(e){let t=At(e,"account");return t!==null&&Number.isInteger(t)&&t>=0&&t<10?t:0}function _(e={}){return{held:!0,fail:null,data:e}}function g(e,t={}){return{held:!1,fail:e,data:t}}function $e(e){return{held:!1,fail:null,data:{navigate:e}}}var M={field:3e3,page:8e3,saved:12e3,poll:50};async function O(e,t,r){let n=e.now()+r;for(;;){let o=t();if(o!==null)return o;if(e.now()>=n)return null;await e.sleep(M.poll)}}async function Ur(e,t,r,n,o){if(o().some(s=>me(s)===me(r)))return null;await e.type(t,r,!0),await e.key(t,"Enter");let i=await O(e,()=>{let s=o(),a=Me(s,n);return a.length>0?a:s.some(c=>me(c)===me(r))?[]:null},M.field);return i===null?g("timeout"):i.length>0?g("check",{strangers:i}):null}var xu=[['button, input[type="button"], input[type="submit"], input[type="reset"]',"button"],["a[href]","link"],['input[type="checkbox"]',"checkbox"],['input[type="radio"]',"radio"],["select, input[list]","combobox"],['textarea, input:not([type]), input[type="text"], input[type="email"], input[type="search"], input[type="tel"], input[type="url"], [contenteditable="true"], [contenteditable=""]',"textbox"],["tr","row"],["td","gridcell"],["li","listitem"],["dialog","dialog"],["main","main"],["h1, h2, h3, h4, h5, h6","heading"]];function vu(e){let t=e.getAttribute("role")?.trim().split(/\s+/)[0];if(t)return t;for(let[r,n]of xu)if(e.matches(r))return n;return""}var Zn=e=>e.replace(/\s+/g," ").trim().toLowerCase();function yu(e){let t=e.ownerDocument,r=e.getAttribute("aria-label");if(r)return r;let n=e.getAttribute("aria-labelledby");if(n)return n.split(/\s+/).map(s=>t.getElementById(s)?.textContent??"").join(" ");let o=e.getAttribute("id"),i=o?t.querySelector(`label[for="${CSS.escape(o)}"]`):null;return i?.textContent?i.textContent:e.getAttribute("title")??e.getAttribute("placeholder")??e.textContent??""}function ku(e,t){let r=Zn(e),n=Zn(t);return r===n||r.startsWith(n)&&!new RegExp("\\p{L}","u").test(r.charAt(n.length))}function _u(e){if(e.closest('[hidden], [aria-hidden="true"]'))return!1;let t=e.ownerDocument.defaultView?.getComputedStyle(e);return!t||t.display!=="none"&&t.visibility!=="hidden"}function i0(e,t){let r=xu.filter(([,n])=>n===t).map(([n])=>n);return[...e.querySelectorAll([`[role="${t}"]`,...r].join(", "))].filter(n=>vu(n)===t)}function s0(e,t){let r=[...e.querySelectorAll("*")].filter(n=>ku(n.textContent??"",t));return r.filter(n=>!r.some(o=>o!==n&&n.contains(o)))}function k(e,t){let r=s=>t.label?s.filter(a=>ku(yu(a),t.label)):s,n=[];t.role?(n=r(i0(e,t.role)),n.length===0&&t.selector&&(n=[...e.querySelectorAll(t.selector)])):t.selector?n=r([...e.querySelectorAll(t.selector)]):t.label&&(n=s0(e,t.label));let o=n.filter(_u);if(!t.label)return o;let i=o.filter(s=>Zn(yu(s))===Zn(t.label));return[...i,...o.filter(s=>!i.includes(s))]}async function ne(e,t,r,n){let o=k(t,r)[0];if(o)return o;let i=await e.pick(n),s=i===null?null:e.elementOf(i);return!s||!t.contains(s)||!_u(s)||r.role&&vu(s)!==r.role?null:s}function he(e){let t=e.tagName.toLowerCase();return t==="textarea"?"textarea":t==="input"?"input":e instanceof e.ownerDocument.defaultView.HTMLElement&&e.isContentEditable||e.getAttribute("contenteditable")==="true"||e.getAttribute("contenteditable")===""?"editable":null}function J(e){let t=he(e);if(t==="input"||t==="textarea")return e.value;let r=e.innerText;return typeof r=="string"&&r!==""?r:e.textContent??""}var Se=e=>e.replace(/\s+/g,""),a0=(e,t)=>{e.ownerDocument.execCommand?.("insertText",!1,t)},c0=(e,t)=>{let r=e.ownerDocument.defaultView,n=new r.DataTransfer;n.setData("text/plain",t),e.dispatchEvent(new r.ClipboardEvent("paste",{clipboardData:n,bubbles:!0,cancelable:!0,composed:!0}))},l0=(e,t)=>{let r=e.ownerDocument.defaultView,n={inputType:"insertText",data:t,bubbles:!0,composed:!0};e.dispatchEvent(new r.InputEvent("beforeinput",{...n,cancelable:!0}))&&(u0(e,t),e.dispatchEvent(new r.InputEvent("input",n)))},d0=(e,t)=>{let r=e.ownerDocument.defaultView,n=he(e);if(n!=="input"&&n!=="textarea")return;let o=e,i=n==="input"?r.HTMLInputElement.prototype:r.HTMLTextAreaElement.prototype,s=o.selectionStart??o.value.length,a=o.selectionEnd??s,c=o.value.slice(0,s)+t+o.value.slice(a);Object.getOwnPropertyDescriptor(i,"value")?.set?.call(o,c),o.setSelectionRange?.(s+t.length,s+t.length),e.dispatchEvent(new r.Event("input",{bubbles:!0,composed:!0}))};function u0(e,t){let r=he(e);if(r==="input"||r==="textarea"){let c=e;c.setRangeText(t,c.selectionStart??0,c.selectionEnd??0,"end");return}let n=e.ownerDocument,o=n.getSelection();if(!o||o.rangeCount===0)return;let i=o.getRangeAt(0);if(!e.contains(i.startContainer))return;i.deleteContents();let s=n.createDocumentFragment();t.split(`
`).forEach((c,l)=>{l>0&&s.append(n.createElement("br")),c&&s.append(n.createTextNode(c))});let a=s.lastChild;i.insertNode(s),a&&i.setStartAfter(a),i.collapse(!0),o.removeAllRanges(),o.addRange(i)}function $r(e,t,r,n){for(let o of[a0,c0,l0,d0])if(n(),o(e,t),r())return!0;return!1}function Ze(e,t){let r=new Map;for(let n of e){if(r.has(n.key))throw new Error(`hook ${n.key} is named twice`);r.set(n.key,n)}for(let n of t)if(!r.has(n))throw new Error(`hook ${n} is missing`);for(let n of r.keys())if(!t.includes(n))throw new Error(`hook ${n} is never used`);return Object.fromEntries(r)}function Qe(e,t){return e.replace(/\{(\w+)\}/g,(r,n)=>{let o=t[n];if(o===void 0)throw new Error(`route value ${n} is missing`);return String(o)})}var Su=[{key:"editor_route",route:"/calendar/u/{account}/r/eventedit",role:null,label:null,selector:null,observed:"unknown",how:"the event editor's address, which also takes the template route's text, dates, ctz, details and location; widely used, not documented by Google; to observe"},{key:"event_route",route:"/calendar/u/{account}/r/eventedit/{eid}",role:null,label:null,selector:null,observed:"unknown",how:"one saved event in the editor by its id, to observe"},{key:"sign_in",route:null,role:null,label:null,selector:'input[name="identifier"], input[type="password"]',observed:"unknown",how:"Google's sign in form fields, to observe"},{key:"title",route:null,role:"textbox",label:"Title",selector:null,observed:"unknown",how:"the editor's title field by its ARIA label, to observe"},{key:"start_date",route:null,role:null,label:null,selector:'[aria-label="Start date"]',observed:"unknown",how:"the start date field by its ARIA label, to observe"},{key:"start_time",route:null,role:null,label:null,selector:'[aria-label="Start time"]',observed:"unknown",how:"the start time field by its ARIA label, to observe"},{key:"end_time",route:null,role:null,label:null,selector:'[aria-label="End time"]',observed:"unknown",how:"the end time field by its ARIA label, to observe"},{key:"end_date",route:null,role:null,label:null,selector:'[aria-label="End date"]',observed:"unknown",how:"the end date field by its ARIA label, to observe"},{key:"all_day",route:null,role:"checkbox",label:"All day",selector:null,observed:"unknown",how:"the All day box, to observe"},{key:"guests_field",route:null,role:null,label:"Guests",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the guest field by its ARIA label, to observe"},{key:"guest_chip",route:null,role:null,label:null,selector:"[data-email]",observed:"unknown",how:"a guest row holding its address in an attribute, to observe"},{key:"save",route:null,role:"button",label:"Save",selector:null,observed:"unknown",how:"the editor's Save button by its label, to observe"},{key:"invite_dialog",route:null,role:"alertdialog",label:null,selector:'[role="dialog"]',observed:"unknown",how:"the question whether to send invitations, asked on Save with guests; to observe"},{key:"invite_send",route:null,role:"button",label:"Send",selector:null,observed:"unknown",how:"the invitation question's Send button, to observe"},{key:"invite_skip",route:null,role:"button",label:"Don't send",selector:null,observed:"unknown",how:"the invitation question's Don't send button, to observe"},{key:"saved_toast",route:null,role:null,label:"Event saved",selector:null,observed:"unknown",how:"the toast after Save, to observe"},{key:"event_id",route:null,role:null,label:null,selector:'[data-eventid], a[href*="/r/eventedit/"]',observed:"unknown",how:"a saved event's id in an attribute or in the link of the saved note, to observe"},{key:"delete",route:null,role:"button",label:"Delete event",selector:null,observed:"unknown",how:"the editor's Delete event button, to observe"},{key:"deleted_toast",route:null,role:null,label:"Event deleted",selector:null,observed:"unknown",how:"the toast after Delete, to observe"}];var f0=["editor_route","event_route","sign_in","title","start_date","start_time","end_time","end_date","all_day","guests_field","guest_chip","save","invite_dialog","invite_send","invite_skip","saved_toast","event_id","delete","deleted_toast"],H=Ze(Su,f0),jr="calendar.google.com";var Cu=`https://${jr}`,m0=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/,h0=/^(UTC|[A-Z][A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){1,2})$/,g0=/^[A-Za-z0-9_=-]{1,200}$/;function Qn(e){let t;try{t=new URL(e)}catch{return null}if(t.hostname!==jr)return null;let r=/^\/calendar\/(?:u\/(\d+)\/)?/.exec(t.pathname);return r?Number(r[1]??0):null}function Eu(e,t){let r=m0.exec(e);if(!r)throw new Error("not a local time");if(t&&r[4]===void 0)throw new Error("a time is missing");return{date:`${r[1]}${r[2]}${r[3]}`,time:r[4]===void 0?null:`${r[4]}${r[5]}${r[6]??"00"}`}}function b0(e){return new Date(Date.UTC(Number(e.slice(0,4)),Number(e.slice(4,6))-1,Number(e.slice(6,8))+1)).toISOString().slice(0,10).replace(/-/g,"")}function us(e){let t=Eu(e.start,!e.allDay),r=Eu(e.end,!e.allDay);if(e.allDay){if(r.date<t.date)throw new Error("the event ends before it starts");return`${t.date}/${b0(r.date)}`}let n=`${t.date}T${t.time}`,o=`${r.date}T${r.time}`;if(o<=n)throw new Error("the event ends before it starts");return`${n}/${o}`}function ps(e){return Qe(H.editor_route.route,{account:e})}function eo(e,t){if(!h0.test(t.zone))throw new Error("not a zone name");let r=new URLSearchParams({text:t.title,dates:us(t),ctz:t.zone});return t.details.trim()&&r.set("details",t.details),t.where.trim()&&r.set("location",t.where),`${Cu}${ps(e)}?${r.toString()}`}function to(e,t){if(!g0.test(t))throw new Error("not an event id");return Cu+Qe(H.event_route.route,{account:e,eid:t})}var Ru=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];function Au(e){let t=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(e);return t?{y:Number(t[1]),mo:Number(t[2]),d:Number(t[3]),h:Number(t[4]??0),mi:Number(t[5]??0)}:null}function fs(e,t){let r=Au(t);if(!r)return!1;let n=e.toLowerCase(),o=/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/.exec(n);if(o)return Number(o[1])===r.mo&&Number(o[2])===r.d&&Number(o[3])===r.y;let i=Ru.filter(c=>new RegExp(`\\b${c}`).test(n));if(i.length!==1||i[0]!==Ru[r.mo-1]||(n.match(/\b\d{4}\b/g)??[]).some(c=>Number(c)!==r.y))return!1;let a=(n.replace(/\b\d{4}\b/g,"").match(/\b\d{1,2}\b/g)??[]).map(Number);return a.length===1&&a[0]===r.d}function ms(e,t){let r=Au(t);if(!r)return!1;let n=e.toLowerCase().replace(/[\s.]/g,""),o=/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/.exec(n);if(!o)return!1;let i=Number(o[1]),s=Number(o[2]??0);if(o[3]===void 0&&o[2]===void 0)return!1;if(o[3]!==void 0){if(i<1||i>12)return!1;i=i%12+(o[3]==="pm"?12:0)}return i===r.h&&s===r.mi}function Tu(e){let t=I(e,"title"),r=I(e,"start"),n=I(e,"end"),o=I(e,"zone");return!t||!r||!n||!o||t.length>200?null:{title:t,start:r,end:n,zone:o,allDay:Ft(e,"allDay"),where:I(e,"where")??"",details:I(e,"details")??""}}var Pu=e=>e.location.hostname==="accounts.google.com"||k(e,H.sign_in).length>0,Iu=async e=>{if(Pu(e.doc))return g("sign_in");let t=Qn(e.doc.location.href);return t===null?g("wrong_state"):_({account:t})},Mu=async(e,t)=>{let r=Tu(t);if(!r)return g("check");let n;try{n=eo(Ue(t),r)}catch{return g("check")}if(Pu(e.doc))return g("sign_in");let o=e.doc.location;if(o.hostname!==jr||o.pathname!==ps(Ue(t)))return $e(n);let i=await O(e,()=>k(e.doc,H.title)[0]??null,M.page);return i?J(i)===r.title?_({}):g("check"):g("hook_missed")},zr=e=>k(e,H.guest_chip).map(t=>t.getAttribute("data-email")??"").filter(Boolean),Lu=async(e,t)=>{let r=Ye(t,"guests");if(r.some(i=>!_e(i)))return g("check",{refused:"not_address"});let n=Me(zr(e.doc),r);if(n.length>0)return g("check",{strangers:n});if(r.length>0){let i=await ne(e,e.doc,H.guests_field,"the Add guests field of the event editor");if(!i)return g("hook_missed");for(let s of r){let a=await Ur(e,i,s,r,()=>zr(e.doc));if(a)return a}}let o=zr(e.doc);return mt(o,r)?_({guests:o}):g("check",{strangers:Me(o,r)})},Gr=(e,t)=>{let r=k(e,H[t])[0];return r?J(r):null},Ou=async(e,t)=>{let r=Tu(t);if(!r)return g("check");if(Gr(e.doc,"title")!==r.title)return g("check",{field:"title"});let n=Gr(e.doc,"start_date");if(n===null)return g("hook_missed");if(!fs(n,r.start))return g("check",{field:"start_date"});let o=Gr(e.doc,"end_date");if(o!==null&&o.trim()!==""&&!fs(o,r.end))return g("check",{field:"end_date"});if(r.allDay){let a=k(e.doc,H.all_day)[0];return(a?a.checked===!0||a.getAttribute("aria-checked")==="true":!1)?_({}):g("check",{field:"all_day"})}let i=Gr(e.doc,"start_time"),s=Gr(e.doc,"end_time");return i===null||s===null?g("hook_missed"):ms(i,r.start)?ms(s,r.end)?_({}):g("check",{field:"end_time"}):g("check",{field:"start_time"})};async function Du(e,t){let r=k(e.doc,H.invite_dialog)[0];if(!r)return null;let n=t?await ne(e,r,H.invite_send,"the Send button of the invitations question"):k(r,H.invite_skip)[0];return n?(await e.click(n),"answered"):"missed"}var Hu=async(e,t,r)=>{let n=k(e.doc,H.title)[0];if(!n)return g("wrong_state");if(r.pressed.has(n))return g("check",{refused:"already_pressed"});let o=Ye(t,"guests");if(o.some(u=>!_e(u)))return g("check",{refused:"not_address"});let i=zr(e.doc);if(!mt(i,o))return g("check",{strangers:Me(i,o)});let s=Ft(t,"invite")&&o.length>0;if(s&&!Ft(t,"confirmed"))return g("check",{refused:"not_confirmed"});let a=await ne(e,e.doc,H.save,"the Save button of the event editor");if(!a)return g("hook_missed");r.pressed.add(n),await e.click(a);let c=await O(e,()=>k(e.doc,H.invite_dialog).length>0?"ask":k(e.doc,H.saved_toast).length>0||!n.isConnected?"saved":null,M.page);return c===null?g("timeout",{pressed:!0}):c==="saved"?_({invited:!1,asked:!1}):await Du(e,s)==="missed"?g("hook_missed",{pressed:!0}):_({invited:s,asked:!0})},Nu=/\/r\/eventedit\/([A-Za-z0-9_=-]+)/,Bu=async(e,t)=>{if(!await O(e,()=>k(e.doc,H.saved_toast).length>0||k(e.doc,H.title).length===0?!0:null,M.page))return g("timeout");let n=e.doc.location,o=Nu.exec(n.pathname)?.[1]??new URLSearchParams(n.search).get("eid"),i=I(t,"title")??"",s=k(e.doc,H.event_id),a=p=>p.getAttribute("data-eventid")??Nu.exec(p.getAttribute("href")??"")?.[1]??null,c=s.find(p=>p.hasAttribute("data-eventid")&&(p.textContent??"").trim()===i.trim()),l=s.filter(p=>!p.hasAttribute("data-eventid")),u=c?a(c):l.length===1?a(l[0]):null;return _({eventId:o??u})},Fu=async(e,t)=>{let r=I(t,"eventId"),n=I(t,"title");if(!r||!n)return g("check");let o;try{o=to(Ue(t),r)}catch{return g("check")}if(e.doc.location.pathname!==new URL(o).pathname)return $e(o);let i=await O(e,()=>k(e.doc,H.title)[0]??null,M.page);if(!i)return g("hook_missed");if(J(i)!==n)return g("wrong_state");let s=await ne(e,e.doc,H.delete,"the Delete event button of the event editor");return s?(await e.click(s),await Du(e,!1),await O(e,()=>k(e.doc,H.deleted_toast).length>0||!i.isConnected?!0:null,M.page)?_({}):g("timeout")):g("hook_missed")};var Uu={account:Iu,open_editor:Mu,guests:Lu,check:Ou,save:Hu,saved:Bu,delete:Fu};var $u=typeof Intl<"u"&&"Segmenter"in Intl?new Intl.Segmenter(void 0,{granularity:"grapheme"}):null;function ht(e){if(!$u)return[...e].length;let t=0;for(let r of $u.segment(e))t++;return t}var ju=[{key:"doc_route",route:"/document/d/{id}/edit",role:null,label:null,selector:null,observed:"unknown",how:"a document's editor address, to observe"},{key:"text_target",route:null,role:null,label:null,selector:"iframe.docs-texteventtarget-iframe",observed:"unknown",how:"the hidden frame Docs takes keystrokes through, widely reported by extension authors; to observe"},{key:"target_editable",route:null,role:null,label:null,selector:'[contenteditable="true"], [contenteditable=""]',observed:"unknown",how:"the editable inside the text event target, which may mirror the selection for copy and input methods; to observe"},{key:"canvas_tile",route:null,role:null,label:null,selector:"canvas.kix-canvas-tile-content",observed:"unknown",how:"the canvas tiles Docs draws its pages on, widely reported by extension authors; the change preview keeps its boxes relative to them (8.4); to observe"},{key:"selection_boxes",route:null,role:null,label:null,selector:".kix-canvas-tile-selection rect",observed:"unknown",how:"the boxes of Docs' own selection overlay above the canvas, reported by extension authors; the change preview reads them while code selects each change (8.4); to observe"}];var y0=["doc_route","text_target","target_editable","canvas_tile","selection_boxes"],gt=Ze(ju,y0),Gu="docs.google.com";function Ut(e){let t=Qe(gt.doc_route.route,{id:"ID"}).replace("ID","[\\w-]+");return e.location.hostname===Gu&&new RegExp(`^/document/(?:u/\\d+/)?${t.slice(10)}`).test(e.location.pathname)}function et(e){let t=e.querySelector(gt.text_target.selector);if(!(t&&t.tagName==="IFRAME"))return null;let r=null;try{r=t.contentDocument}catch{return null}let n=r?.defaultView,o=r?.querySelector(gt.target_editable.selector);return r&&n&&o?{win:n,doc:r,editable:o}:null}var ro=e=>e.editable.textContent??"";function $t(e){e.win.focus(),e.editable.focus()}function Y(e,t,r){let n={key:t,code:t,shiftKey:r,bubbles:!0,cancelable:!0,composed:!0};e.editable.dispatchEvent(new e.win.KeyboardEvent("keydown",n)),e.editable.dispatchEvent(new e.win.KeyboardEvent("keyup",n))}function Wr(e,t){for(let r=0;r<t;r++)Y(e,"ArrowLeft",!0)}async function no(e,t,r,n){let o=null,i=s=>{let a=s.clipboardData?.getData("text/plain")??"";a&&(o=a)};t.win.addEventListener("copy",i);try{r?.();let s=e.now()+n;for(;o===null&&e.now()<s;)await e.sleep(50);return o}finally{t.win.removeEventListener("copy",i)}}var fr=e=>({x:e.left,y:e.top,width:e.width,height:e.height});function oo(e,t){let r=Math.max(e.x,t.x),n=Math.max(e.y,t.y),o=Math.min(e.x+e.width,t.x+t.width),i=Math.min(e.y+e.height,t.y+t.height);return o>r&&i>n?{x:r,y:n,width:o-r,height:i-n}:null}function io(e,t){if(e.width<=2){let r=e.x+e.width/2;if(r<t.x||r>t.x+t.width)return null;let n=Math.max(e.y,t.y),o=Math.min(e.y+e.height,t.y+t.height);return o>n?{...e,y:n,height:o-n}:null}return oo(e,t)}function so(e){if(e.length===0)return null;let t=Math.min(...e.map(i=>i.x)),r=Math.min(...e.map(i=>i.y)),n=Math.max(...e.map(i=>i.x+i.width)),o=Math.max(...e.map(i=>i.y+i.height));return{x:t,y:r,width:n-t,height:o-r}}function jt(e){let t=[];for(let r of[...e].filter(n=>n.height>0).sort((n,o)=>n.y-o.y||n.x-o.x)){let n=t[t.length-1];if(n&&Math.abs(n.y-r.y)<=1&&Math.abs(n.y+n.height-r.y-r.height)<=1&&r.x<=n.x+n.width+1){let o=Math.max(n.x+n.width,r.x+r.width);n.width=o-n.x}else t.push({...r})}return t}function Gt(e){let t=0,r=0,n=e;for(;n!==n.parent;){let o=n.frameElement;if(!o)break;let i=o.getBoundingClientRect(),s=o.ownerDocument.defaultView.getComputedStyle(o);t+=i.left+o.clientLeft+parseFloat(s.paddingLeft||"0"),r+=i.top+o.clientTop+parseFloat(s.paddingTop||"0"),n=n.parent}return{x:t,y:r}}function ao(e){let t=e.ownerDocument,r=t.defaultView,n=s=>{let a=Gt(s.ownerDocument.defaultView),c=s.getBoundingClientRect();return s.clientWidth===0&&s.clientHeight===0?{x:c.left+a.x,y:c.top+a.y,width:c.width,height:c.height}:{x:c.left+s.clientLeft+a.x,y:c.top+s.clientTop+a.y,width:s.clientWidth,height:s.clientHeight}},o=n(e);for(let s=e.parentElement;s&&o;s=s.parentElement){let a=r.getComputedStyle(s);/(auto|scroll|hidden|clip)/.test(`${a.overflowX}${a.overflowY}`)&&s!==t.documentElement&&s!==t.body&&(o=oo(o,n(s)))}for(let s=r;o&&s!==s.parent&&s.frameElement;s=s.parent)o=oo(o,n(s.frameElement));let i=r.top??r;return o&&oo(o,{x:0,y:0,width:i.innerWidth,height:i.innerHeight})}var x0=400,v0=16,Ku=e=>[...e.querySelectorAll(gt.selection_boxes.selector)].map(t=>fr(t.getBoundingClientRect())).filter(t=>t.width>0&&t.height>0),co=e=>e.map(t=>`${Math.round(t.x)},${Math.round(t.y)},${Math.round(t.width)}`).join(";");async function zu(e,t,r){let n=e.now()+x0;for(;;){let o=Ku(t);if(o.length>0&&co(o)!==r)return o;if(e.now()>=n)return[];await e.sleep(v0)}}function Wu(e,t){let r=[...e.querySelectorAll(gt.canvas_tile.selector)],n=[];for(let o of t){let i=o.x+o.width/2,s=o.y+o.height/2,a=r.find(l=>{let u=l.getBoundingClientRect();return i>=u.left&&i<=u.right&&s>=u.top&&s<=u.bottom});if(!a)continue;let c=a.getBoundingClientRect();n.push({tile:a,dx:o.x-c.left,dy:o.y-c.top,width:o.width,height:o.height})}return n}async function hs(e,t,r,n){let o=e.doc,i=h=>ht(r.slice(0,h)),s=i(r.length),a=co(Ku(o));for(let h=0;h<s;h++)Y(t,"ArrowLeft",!0);let c=jt(await zu(e,o,a));if(Y(t,"ArrowRight",!1),c.length===0)return null;a=co(c);let l=Wu(o,c),u=s,p=n.map(()=>[]),d=!0,f=n.map((h,w)=>({c:h,i:w})).sort((h,w)=>w.c.after.start-h.c.after.start);for(let{c:h,i:w}of f){let y=r.slice(h.after.start,h.after.end),b=y.length-y.trimStart().length,v=b===y.length;if(v&&!h.old.trim())continue;let E=i(h.after.start+b),T=v?E+1:i(h.after.end-(y.length-y.trimEnd().length)),$=v&&E>=s;if($&&([E,T]=[s-1,s]),E<0||T<=E)continue;for(;u<T;u++)Y(t,"ArrowRight",!1);for(;u>T;u--)Y(t,"ArrowLeft",!1);for(let se=u;se>E;se--)Y(t,"ArrowLeft",!0);let W=jt(await zu(e,o,a));if(Y(t,"ArrowLeft",!1),u=E,W.length===0){d=!1;break}a=co(W);let Z=Wu(o,W),U=Z[0];v?U&&(p[w]=[{...U,dx:$?U.dx+U.width-1:U.dx-1,width:2}]):p[w]=Z}for(;u<s;u++)Y(t,"ArrowRight",!1);return d?{changes:p,whole:l}:null}var gs=e=>{let t=e.getBoundingClientRect();return`${Math.round(t.width)}x${Math.round(t.height)}`};function bs(e,t,r){let n=new Map;for(let o of[...e.flat(),...t])n.set(o.tile,gs(o.tile));return{boxes:e,whole:t,olds:r,sizes:n,caretMoved:!1}}var Vu=e=>{let t=e.tile.getBoundingClientRect();return{x:t.left+e.dx,y:t.top+e.dy,width:e.width,height:e.height}};function qu(e,t,r,n,o){let i=()=>[...e.sizes.keys()];return{docs:[r,t.doc],root:n,keyEdits:!0,owns:s=>{let a=s;return!!a&&(a===t.doc||a.ownerDocument===t.doc||a===t.editable)},alive:()=>t.editable.isConnected&&i().every(s=>s.isConnected),olds:()=>e.olds,isOriginal:()=>!1,clip:()=>so(i().map(s=>ao(s)).filter(s=>s!==null)),measure(){let s=i().some(a=>e.sizes.get(a)!==gs(a));return s&&!e.caretMoved&&o(),e.boxes.map(a=>s?[]:a.map(Vu))},whole:()=>i().some(s=>e.sizes.get(s)!==gs(s))?[]:e.whole.map(Vu)}}var k0=`
.coere-rw{position:absolute;inset:0;pointer-events:none}
.coere-rw-box{position:absolute;border-radius:3px;background:rgba(82,103,247,.22);box-shadow:inset 0 -2px 0 ${Je.color}}
.coere-rw-bar{position:absolute;border-radius:1px;background:${Je.color}}
.coere-rw-tip{position:absolute;pointer-events:auto;max-width:320px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 10px;border-radius:8px;background:#fff;color:#1f1f1f;border:1px solid rgba(0,0,0,.12);box-shadow:0 4px 16px rgba(0,0,0,.14);font:13px/18px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.coere-rw-was{color:#5f6368;text-decoration:line-through;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.coere-rw-tip button{all:unset;flex:none;cursor:pointer;padding:3px 8px;border-radius:6px;font-weight:600;color:${Je.color}}
.coere-rw-tip button:hover{background:rgba(82,103,247,.1)}
.coere-rw-tip button:focus-visible{outline:2px solid ${Je.color};outline-offset:1px}
:host([data-theme='dark']) .coere-rw-tip{background:#202124;color:#e8eaed;border-color:rgba(255,255,255,.14)}:host([data-theme='dark']) .coere-rw-was{color:#9aa0a6}:host([data-theme='dark']) .coere-rw-tip button{color:#aab6ff}
`,lo=2;function Xu(e,t){let r=e.ownerDocument,n=r.createElement("style");n.textContent=k0;let o=r.createElement("div");o.className="coere-rw",o.setAttribute("aria-hidden","true");let i=r.createElement("div");i.className="coere-rw-tip",i.hidden=!0,e.append(n,o,i);let s=[],a=null,c=!1;i.addEventListener("pointerenter",()=>c=!0),i.addEventListener("pointerleave",()=>{c=!1,l()});let l=()=>{i.hidden=!0,a=null};function u(p){let d=t.olds()[p]??"";if(!d.trim()&&!t.goBack)return l();if(a!==p){if(i.replaceChildren(),d.trim()){let E=r.createElement("span");E.className="coere-rw-was",E.textContent=d.trim(),i.append(E)}if(t.goBack){let E=r.createElement("button");E.type="button",E.textContent=t.goBack,E.addEventListener("click",T=>{l(),t.onGoBack(p)}),i.append(E)}a=p}i.hidden=!1;let f=s[p][0],h=r.defaultView,w=Math.min(320,i.offsetWidth||200),y=i.offsetHeight||32,b=Math.max(8,Math.min(f.x,h.innerWidth-w-8)),v=f.y-y-6>=4?f.y-y-6:f.y+f.height+6;i.style.left=`${b}px`,i.style.top=`${v}px`}return{draw(p,d){return s=p.map(f=>f.map(h=>d?io(h,d):h).filter(h=>h!==null)),o.replaceChildren(...s.flat().map(f=>{let h=r.createElement("div");return h.className=f.width<=2?"coere-rw-bar":"coere-rw-box",h.style.cssText=`left:${f.x}px;top:${f.y}px;width:${f.width}px;height:${f.height}px`,h})),a!==null&&!s[a]?.length?l():a!==null&&u(a),s},hover(p,d){let f=s.findIndex(h=>h.some(w=>p>=w.x-lo&&p<=w.x+w.width+lo&&d>=w.y-lo&&d<=w.y+w.height+lo));f>=0?u(f):c||l()},remove(){n.remove(),o.remove(),i.remove()}}}var _0=e=>e.ctrlKey||e.metaKey?["v","x"].includes(e.key.toLowerCase()):e.key.length===1||e.key==="Backspace"||e.key==="Delete"||e.key==="Enter",S0=e=>(e.ctrlKey||e.metaKey)&&!e.altKey&&["z","y"].includes(e.key.toLowerCase()),E0=250;function Ju(e,t){let r=[],n=null,o=e.docs[0].defaultView,i=()=>{n===null&&(n=o.requestAnimationFrame(()=>{n=null,t.redraw()}))},s=(h,w,y,b=!0)=>{let v={capture:b,passive:w!=="keydown"};h.addEventListener(w,y,v),r.push(()=>h.removeEventListener(w,y,v))};for(let h of e.docs){let w=h.defaultView;w&&(s(w,"scroll",i),s(w,"resize",i),s(h,"input",i),s(h,"pointermove",y=>{let b=y,v=Gt(w);t.hover(b.clientX+v.x,b.clientY+v.y)}),s(h,"beforeinput",y=>{let b=y;e.owns(b.target)&&(b.inputType.startsWith("history")?t.undone():t.edited())}),s(h,"keydown",y=>{let b=y;if(!b.isComposing){if(b.key==="Escape"&&e.owns(b.target)){b.preventDefault(),b.stopImmediatePropagation(),t.escape();return}!e.keyEdits||!e.owns(b.target)||(S0(b)?setTimeout(t.undone,60):_0(b)&&t.edited())}}),s(h,"paste",y=>{e.owns(y.target)&&t.edited()}))}let a=o.visualViewport;a&&(s(a,"resize",i,!1),s(a,"scroll",i,!1));let c=e.docs[0].fonts;c?.addEventListener&&s(c,"loadingdone",i,!1);let l=e.root.ownerDocument.defaultView?.MutationObserver??MutationObserver,u=new l(i);u.observe(e.root,{subtree:!0,childList:!0,characterData:!0}),r.push(()=>u.disconnect());let p=e.root.ownerDocument.defaultView?.ResizeObserver;if(p){let h=new p(i);h.observe(e.root),r.push(()=>h.disconnect())}let d="",f=o.setInterval(()=>{let h=e.root.getBoundingClientRect(),w=`${h.left},${h.top},${h.width},${h.height}`;w!==d&&i(),d=w},E0);return r.push(()=>o.clearInterval(f)),()=>{n!==null&&o.cancelAnimationFrame(n);for(let h of r.splice(0))h()}}function uo(e,t){let r=!0,n=!1,o=Xu(t.layer(),{olds:()=>e.olds(),goBack:e.revertOne?t.goBackLabel:null,onGoBack:d=>{if(!r||!e.revertOne||!p.quiet(()=>e.revertOne(d)))return;let h=e.olds().length;h===0||e.isOriginal()?u("reverted"):(t.emit({type:"rewrite",end:null,left:h}),i())}});function i(){if(!r)return;if(t.alive&&!t.alive())return l();if(!e.alive())return u("accepted");let d=e.measure();if(!d)return u(e.isOriginal()?"reverted":"accepted");let f=e.clip(),h=o.draw(d,f),w=(e.whole?.()??[]).map(y=>f?io(y,f):y).filter(y=>y!==null);t.anchor(so([...h.flat(),...w]))}let s=Ju(e,{redraw:()=>{n||i()},edited:()=>{n||u("accepted")},undone:()=>{n||i()},escape:()=>t.emit({type:"press",press:{kind:"rewrite",button:"go_back"}}),hover:(d,f)=>o.hover(d,f)}),a=e.docs[0].defaultView,c=a.setInterval(()=>{t.alive&&!t.alive()&&l()},1e3);function l(){r=!1,a.clearInterval(c),s(),o.remove(),t.anchor(null)}function u(d){r&&(l(),t.emit({type:"rewrite",end:d,left:e.olds().length}))}let p={stop(){r&&l()},redraw:i,quiet(d){n=!0;try{return d()}finally{n=!1}}};return i(),p}function po(e,t,r,n){t.pasteWatch?.();let o=s=>{i(),setTimeout(()=>{n(),e.preview?.emit({type:"press",press:{kind:"rewrite",button:"pasted"}})},80)},i=()=>{r.removeEventListener("paste",o,!0),t.pasteWatch===i&&(t.pasteWatch=null)};r.addEventListener("paste",o,!0),t.pasteWatch=i}async function bt(e,t,r){return r==="mirror"?ro(t):r==="copy"?await no(e,t,()=>t.doc.execCommand("copy"),200)??"":null}function C0(e){$t(e);let t=e.doc.createRange();t.selectNodeContents(e.editable);let r=e.doc.getSelection();r?.removeAllRanges(),r?.addRange(t)}function R0(e,t){let r=new e.win.DataTransfer;r.setData("text/plain",t),e.editable.dispatchEvent(new e.win.ClipboardEvent("paste",{clipboardData:r,bubbles:!0,cancelable:!0,composed:!0}))}async function Kr(e,t,r,n,o){C0(t),t.doc.execCommand("insertText",!1,o);let i=await bt(e,t,r);if(i===null||i!==n)return"insert";R0(t,o);let s=await bt(e,t,r);return s!==null&&s!==n?"paste":null}var ws=e=>{e.preview?.ctl.stop(),e.preview=null},Zu=async(e,t,r)=>{let n=r.docs;if(!n?.replacement||!e.preview||!Ut(e.doc))return g("wrong_state");let o=et(e.doc);if(!o)return g("hook_missed");ws(r);let i=n.replacement,s=It(n.text,i),a=await hs(e,o,i,s),c=bs(a?.changes??s.map(()=>[]),a?.whole??[],s.map(w=>w.old)),l=e.doc.querySelector(gt.canvas_tile.selector)?.parentElement??e.doc.body,u=!1,p=()=>{u||c.caretMoved||(u=!0,hs(e,o,i,s).then(w=>{u=!1,!(!w||c.caretMoved)&&(Object.assign(c,bs(w.changes,w.whole,c.olds),{caretMoved:c.caretMoved}),h.redraw())}))},d=w=>{c.caretMoved=!0},f=[[e.doc,"pointerdown"],[o.doc,"keydown"],[o.doc,"pointerdown"]];for(let[w,y]of f)w.addEventListener(y,d,!0);let h=uo(qu(c,o,e.doc,l,p),e.preview);return r.preview={ctl:{...h,stop(){for(let[w,y]of f)w.removeEventListener(y,d,!0);h.stop()}},field:null},_({changes:s.length,drawn:a!==null})},Qu=async(e,t,r)=>(ws(r),_({}));async function fo(e,t,r,n){return Wr(t,n),bt(e,t,r)}function Yu(e){let t=/Mac/i.test(e.win.navigator.platform),r={key:"z",code:"KeyZ",ctrlKey:!t,metaKey:t,bubbles:!0,cancelable:!0,composed:!0};e.editable.dispatchEvent(new e.win.KeyboardEvent("keydown",r)),e.editable.dispatchEvent(new e.win.KeyboardEvent("keyup",r))}var ep=async(e,t,r)=>{let n=r.docs;if(ws(r),!n?.replacement||!Ut(e.doc))return g("wrong_state");let o=et(e.doc);if(!o)return g("hook_missed");let i=n.text,s=n.replacement,[a,c]=[ht(i),ht(s)],l=(u,p)=>(r.docs={...n,replacement:null},_({via:u,checked:p}));return $t(o),n.read===null?(Yu(o),l("undo",!1)):await fo(e,o,n.read,c)!==s?(Y(o,"ArrowRight",!1),g("wrong_state",{changed:!0})):(Y(o,"ArrowRight",!1),Yu(o),await e.sleep(30),await bt(e,o,n.read)===i||(Y(o,"ArrowRight",!1),await fo(e,o,n.read,a)===i)?l("undo",!0):(Y(o,"ArrowRight",!1),await fo(e,o,n.read,c)!==s?(Y(o,"ArrowRight",!1),g("check")):await Kr(e,o,n.read,s,i)?await fo(e,o,n.read,a)===i?l("insert",!0):g("check"):g("not_replaced",{via:"clipboard"})))},tp=async(e,t,r)=>{let n=r.docs,o=I(t,"text");if(!n||!o||!Ut(e.doc))return g("wrong_state");let i=et(e.doc);return i?(po(e,r,i.doc,()=>r.docs={...n,replacement:o}),_({})):g("hook_missed")},rp=async e=>{let t=et(e.doc);return t?($t(t),_({})):g("hook_missed")};var np=4e3,A0=async(e,t,r)=>{if(!Ut(e.doc))return g("wrong_state");let n=et(e.doc);if(!n)return g("hook_missed");let o=Math.min(Math.max(At(t,"waitCopyMs")??0,0),6e4),i="mirror",s=o>0?"":ro(n);if(!s){i=o>0?null:"copy";let c=o>0?null:()=>{$t(n),n.doc.execCommand("copy")};s=await no(e,n,c,o>0?o:200)??""}if(!s)return g("no_selection",{ask:"copy"});if(s.length>np)return g("check",{refused:"too_long"});r.preview?.ctl.stop(),r.preview=null,r.pasteWatch?.(),r.docs={text:s,read:i,replacement:null};let a=ye(s);return _({text:a,redacted:a!==s,via:i??"person_copy"})},T0=async(e,t,r)=>{let n=r.docs,o=I(t,"text");if(!n||!Ut(e.doc))return g("wrong_state");if(!o||o.length>np*2)return g("check");let i=et(e.doc);if(!i)return g("hook_missed");let s=await bt(e,i,n.read);if(s!==null&&s!==n.text)return g("wrong_state",{changed:!0});let a=await Kr(e,i,n.read,n.text,o);return a?(n.replacement=o,_({via:a,readable:n.read!==null})):g("not_replaced",{via:"clipboard"})};async function op(e,t,r,n){Wr(t,n);let o=await bt(e,t,r);return Y(t,"ArrowRight",!1),o}var P0=async(e,t,r)=>{let n=r.docs;if(!n?.replacement)return g("wrong_state");if(n.read===null)return g("check",{ask:!0});let o=et(e.doc);return o?await op(e,o,n.read,ht(n.replacement))===n.replacement?_({}):g("check"):g("hook_missed")},I0=async(e,t,r)=>{let n=r.docs;if(!n?.replacement)return g("wrong_state");if(n.read===null)return g("not_replaced",{via:"clipboard"});let o=et(e.doc);if(!o)return g("hook_missed");if(Wr(o,ht(n.replacement)),await bt(e,o,n.read)!==n.replacement)return Y(o,"ArrowRight",!1),g("wrong_state",{changed:!0});if(!await Kr(e,o,n.read,n.replacement,n.text))return g("not_replaced",{via:"clipboard"});let i=await op(e,o,n.read,ht(n.text));return r.docs={...n,replacement:null},i===n.text?_({}):g("check")},ip={read_selection:A0,replace_selection:T0,check_replace:P0,undo:I0,show_changes:Zu,go_back:ep,end_preview:Qu,watch_paste:tp,focus_text:rp};var sp=[{key:"text_field",route:null,role:null,label:null,selector:'textarea, input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"]',observed:"standard",how:"the HTML standard's text fields, whose selection is read from selectionStart and selectionEnd; no site to observe"},{key:"editable",route:null,role:null,label:null,selector:'[contenteditable]:not([contenteditable="false"])',observed:"standard",how:"a contenteditable editor, whose selection is the DOM selection inside it; no site to observe"}];var L0=["text_field","editable"],mo=Ze(sp,L0);function ve(e){let t=he(e);return t==="input"||t==="textarea"?e.value:e.textContent??""}function mr(e,t){let r=he(e);return r==="input"||r==="textarea"?ve(e)===t:Se(ve(e))===Se(t)}function ys(e,t,r){let n=e.ownerDocument,o=n.createRange(),i=n.createTreeWalker(e,4),s=0,a=!1;o.selectNodeContents(e);for(let c=i.nextNode();c;c=i.nextNode()){let l=s+c.data.length;if(!a&&(t<l||t===l&&t===r)&&(o.setStart(c,t-s),a=!0),a&&r<=l)return o.setEnd(c,r-s),o;s=l}return o}function O0(e,t,r){e.focus();let n=he(e);if(n==="input"||n==="textarea"){e.setSelectionRange(t,r);return}let o=e.ownerDocument.getSelection();o?.removeAllRanges(),o?.addRange(ys(e,t,r))}function N0(e,t){let r=he(e);if(r!=="input"&&r!=="textarea"||ve(e)===t)return;let n=e.ownerDocument.defaultView,o=r==="input"?n.HTMLInputElement.prototype:n.HTMLTextAreaElement.prototype;Object.getOwnPropertyDescriptor(o,"value")?.set?.call(e,t),e.dispatchEvent(new n.Event("input",{bubbles:!0,composed:!0}))}function zt(e,t){let r=e.before.slice(0,e.start)+t+e.before.slice(e.end),n=()=>{N0(e.el,e.before),O0(e.el,e.start,e.end)};return $r(e.el,t,()=>mr(e.el,r),n)}var D0=new Set(["\u200B","\u200C","\u200D","\u2060","\uFEFF","\xAD"]),cp=e=>/^\s$/u.test(e)||D0.has(e);function xs(e){let t=[],r=e.ownerDocument.createTreeWalker(e,4);for(let n=r.nextNode();n;n=r.nextNode()){let o=0;for(let i of n.data)cp(i)||t.push({node:n,at:o,len:i.length}),o+=i.length}return t}function wt(e){let t="";for(let r of e)cp(r)||(t+=r);return t}function ap(e,t){return[...wt(e.slice(0,t))].length}function lp(e,t,r,n,o){let i=e.createRange();return i.setStart(t,r),i.setEnd(t,n),[...i.getClientRects()].map(s=>({...fr(s),x:s.left+o.x,y:s.top+o.y}))}function vs(e,t,r){let n=xs(e),o=[...wt(t)];if(n.length!==o.length||n.some((a,c)=>a.node.data.slice(a.at,a.at+a.len)!==o[c]))return null;let i=e.ownerDocument,s=Gt(i.defaultView);return r.map(a=>{let c=ap(t,a.start),l=ap(t,a.end);if(l<=c)return H0(i,n,c,s);let u=[],p=c;for(;p<l;){let d=n[p].node,f=p;for(;f+1<l&&n[f+1].node===d;)f++;u.push(...lp(i,d,n[p].at,n[f].at+n[f].len,s)),p=f+1}return jt(u)})}function H0(e,t,r,n){let o=t[r],i=t[r-1],s=o??i;if(!s)return[];let a=lp(e,s.node,s.at,s.at+s.len,n)[0];return a?[{x:(o?a.x:a.x+a.width)-1,y:a.y,width:2,height:a.height}]:[]}var B0=["direction","fontStyle","fontVariant","fontWeight","fontStretch","fontSize","fontSizeAdjust","lineHeight","fontFamily","fontFeatureSettings","fontKerning","fontVariationSettings","textAlign","textTransform","textIndent","letterSpacing","wordSpacing","tabSize","wordBreak","overflowWrap","hyphens","textRendering","paddingTop","paddingRight","paddingBottom","paddingLeft","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"];function ks(e,t,r){let n=e.ownerDocument.defaultView,o=n.getComputedStyle(e),i=e.tagName==="TEXTAREA",s=(r instanceof ShadowRoot,r.ownerDocument),a=s.createElement("div"),c=a.style;for(let b of B0)c.setProperty(b.replace(/[A-Z]/g,v=>`-${v.toLowerCase()}`),o.getPropertyValue(b.replace(/[A-Z]/g,v=>`-${v.toLowerCase()}`)));let l=e.getBoundingClientRect(),u=Gt(n),p=parseFloat(o.paddingLeft)+parseFloat(o.paddingRight),d=parseFloat(o.paddingTop)+parseFloat(o.paddingBottom);c.position="absolute",c.visibility="hidden",c.pointerEvents="none",c.boxSizing="content-box",c.borderStyle="solid",c.borderColor="transparent",c.margin="0",c.left=`${l.left+u.x}px`,c.top=`${l.top+u.y}px`,c.width=`${Math.max(0,e.clientWidth-p)}px`,c.overflow="hidden",i?(c.whiteSpace=o.whiteSpace==="normal"?"pre-wrap":o.whiteSpace,c.height="auto"):(c.whiteSpace="pre",c.height=`${Math.max(0,e.clientHeight-d)}px`,c.display="flex",c.alignItems="center");let f=s.createElement("span");f.style.whiteSpace="inherit",a.append(f);let h=e.value,w=[],y=0;for(let b of t){f.append(s.createTextNode(h.slice(y,b.start)));let v=s.createElement("span");v.textContent=b.end>b.start?h.slice(b.start,b.end):"\u200B",f.append(v),w.push(v),y=Math.max(y,b.end)}f.append(s.createTextNode(`${h.slice(y)}\u200B`)),r.append(a);try{let b=e.scrollLeft,v=e.scrollTop;return w.map((E,T)=>{let $=[...E.getClientRects()].map(U=>({...fr(U),x:U.left-b,y:U.top-v})),W=t[T];if(W.end>W.start)return jt($);let Z=$[0];return Z?[{x:Z.x-1,y:Z.y,width:2,height:Z.height}]:[]})}finally{a.remove()}}function up(e,t,r,n,o,i){let s=t.slice(0,r)+i+t.slice(n),a=It(o,i).map(c=>({start:r+c.after.start,end:r+c.after.end,old:c.old,now:c.now}));return{el:e,original:t,expected:s,changes:a,reverts:0,start:r,end:n}}var ho=e=>{let t=he(e);return t==="input"||t==="textarea"};function F0(e,t){let r=t.slice(e.start,e.end),n=r.length-r.trimStart().length;return n<r.length?{start:e.start+n,end:e.end-(r.length-r.trimEnd().length)}:e.old.trim()?{start:e.start+n,end:e.start+n}:null}function dp(e,t,r){let n=xs(e),o=t.slice(0,r),i=[...wt(o)].length,s=o.length-o.trimEnd().length,a=new Map,c=0,l=e.ownerDocument.createTreeWalker(e,4);for(let f=l.nextNode();f;f=l.nextNode())a.set(f,c),c+=f.data.length;let u=(f,h)=>a.get(n[f].node)+n[f].at+(h?n[f].len:0),p=i>0?u(i-1,!0):0,d=i<n.length?u(i,!1):c;return Math.min(p+s,d)}function pp(e,t){let r=e.el,n=r.ownerDocument;return{docs:[n.defaultView?.top?.document??n,n].filter((i,s,a)=>a.indexOf(i)===s),root:r,keyEdits:!1,owns:i=>i instanceof n.defaultView.Node&&(i===r||r.contains(i)),alive:()=>r.isConnected,olds:()=>e.changes.map(i=>i.old),clip:()=>ao(r),isOriginal:()=>ho(r)?r.value===e.original:wt(ve(r))===wt(e.original),measure(){let i=e.changes.map(l=>F0(l,e.expected)),s=i.filter(l=>l!==null),a;if(ho(r)?a=r.value===e.expected?ks(r,s,t()):null:a=vs(r,e.expected,s),!a)return null;let c=0;return i.map(l=>l?a[c++]:[])},whole(){let i=e.expected.length-(e.original.length-e.end),s=[{start:e.start,end:i}];return(ho(r)?r.value===e.expected?ks(r,s,t()):null:vs(r,e.expected,s))?.[0]??[]},revertOne(i){let s=e.changes[i];if(!s)return!1;let a=ve(r),c=ho(r),l=c?s.start:dp(r,e.expected,s.start),u=c?s.end:dp(r,e.expected,s.end);if(!zt({el:r,start:l,end:u,before:a,text:a.slice(l,u)},s.old))return!1;let p=s.old.length-(s.end-s.start);return e.expected=e.expected.slice(0,s.start)+s.old+e.expected.slice(s.end),e.changes=e.changes.filter((d,f)=>f!==i).map(d=>d.start>=s.end?{...d,start:d.start+p,end:d.end+p}:d),e.reverts+=1,!0}}}var wo=e=>{let t=he(e);return t==="input"||t==="textarea"},go=(e,t)=>ve(e)===t,bo=(e,t)=>wo(e)?ve(e)===t:wt(ve(e))===wt(t);function mp(e){let t=e.el;if(t.focus(),wo(t)){t.setSelectionRange(e.start,e.end,e.backward?"backward":"forward");return}let r=t.ownerDocument.getSelection(),n=ys(t,e.start,e.end);r&&(e.backward?r.setBaseAndExtent(n.endContainer,n.endOffset,n.startContainer,n.startOffset):r.setBaseAndExtent(n.startContainer,n.startOffset,n.endContainer,n.endOffset))}function fp(e,t){let r=e.ownerDocument.defaultView;return e.dispatchEvent(new r.InputEvent("beforeinput",{inputType:t,bubbles:!0,cancelable:!0,composed:!0}))}var _s=e=>{e.preview?.ctl.stop(),e.preview=null},hp=async(e,t,r)=>{let n=r.replaced;if(!n||!e.preview||!n.held.el.isConnected)return g("wrong_state");_s(r);let o=n.held,i=up(o.el,o.before,o.start,o.end,o.source??o.text,n.text),s=e.preview,a=uo(pp(i,()=>s.layer()),s);return r.preview={ctl:a,field:i},_({changes:i.changes.length})},gp=async(e,t,r)=>(_s(r),_({}));function U0(e,t){return{start:e.start,end:Math.max(e.start,t.length-(e.before.length-e.end))}}var bp=async(e,t,r)=>{let n=r.replaced,o=r.preview?.field??null;if(!n||!n.held.el.isConnected)return g("wrong_state");let i=n.held,s=i.el,a=s.ownerDocument;_s(r);let c=(f,h=!0)=>(mp(i),r.replaced=null,_({via:f,exact:h}));if(go(s,i.before))return c("none");let l=o?.expected??i.before.slice(0,i.start)+n.text+i.before.slice(i.end);if(!bo(s,l))return g("wrong_state",{changed:!0});if((o?.reverts??0)===0){s.focus();let f=!fp(s,"historyUndo");if(f||a.execCommand("undo"),go(s,i.before))return c("undo");if(bo(s,l)||(f?fp(s,"historyRedo"):a.execCommand("redo")),!bo(s,l))return g("check")}let u=ve(s),p=U0(i,u),d=wo(s)?i.text:i.source??i.text;if(zt({el:s,start:p.start,end:p.end,before:u,text:u.slice(p.start,p.end)},d),go(s,i.before))return c("insert");if(wo(s)){let f=a.defaultView,h=he(s)==="input"?f.HTMLInputElement.prototype:f.HTMLTextAreaElement.prototype;if(Object.getOwnPropertyDescriptor(h,"value")?.set?.call(s,i.before),s.dispatchEvent(new f.Event("input",{bubbles:!0,composed:!0})),go(s,i.before))return c("value")}return bo(s,i.before)?c("insert",!1):g("check")},wp=async(e,t,r)=>{let n=r.held,o=I(t,"text");return!n||!o||!n.el.isConnected?g("wrong_state"):(po(e,r,n.el.ownerDocument,()=>r.replaced={held:n,text:o}),_({}))},yp=async(e,t,r)=>{let n=r.held;return!n||!n.el.isConnected?g("wrong_state"):(mp(n),_({}))};var xp=4e3;function $0(e){let t=e.activeElement;for(;;){let r=t?.shadowRoot?.activeElement??(t?.tagName==="IFRAME"?j0(t)?.activeElement:null);if(!r)return t;t=r}}function j0(e){try{return e.contentDocument}catch{return null}}function G0(e){let t=$0(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA")){let d=Bt(t,Ie(t),Pe(t,Ie(t)));if(d.includes("secret")||d.includes("payment"))return"secret"}if(t?.matches(mo.text_field.selector)){let d=t,f=d.selectionStart??0,h=d.selectionEnd??0;return h>f?{el:d,start:f,end:h,before:d.value,text:d.value.slice(f,h),backward:d.selectionDirection==="backward"}:null}let r=(t?.ownerDocument??e).getSelection();if(!r||r.isCollapsed||r.rangeCount===0)return null;let n=r.getRangeAt(0),o=n.commonAncestorContainer,i=(o.nodeType===1?o:o.parentElement)?.closest(mo.editable.selector);if(!i)return null;let s=n.cloneRange();s.selectNodeContents(i),s.setEnd(n.startContainer,n.startOffset);let a=s.toString().length,c=n.toString(),l=r.toString(),u=l&&l.replace(/\s+/g,"")===c.replace(/\s+/g,"")?l:c,p=r.anchorNode===n.endContainer&&r.anchorOffset===n.endOffset&&!n.collapsed;return{el:i,start:a,end:a+c.length,before:ve(i),text:c,source:u,backward:p}}var z0=async(e,t,r)=>{let n=G0(e.doc);if(n==="secret")return g("no_selection",{refused:"secret"});if(!n)return g("no_selection");let o=n.source??n.text;if(o.length>xp)return g("check",{refused:"too_long"});r.preview?.ctl.stop(),r.preview=null,r.pasteWatch?.(),r.held=n,r.replaced=null;let i=ye(o);return _({text:i,redacted:i!==o,kind:n.el.matches(mo.text_field.selector)?"text_field":"editable"})},W0=async(e,t,r)=>{let n=r.held,o=I(t,"text");return!n||!n.el.isConnected?g("wrong_state"):!o||o.length>xp*2?g("check"):mr(n.el,n.before)?zt(n,o)?(r.replaced={held:n,text:o},_({})):g("not_replaced"):g("wrong_state",{changed:!0})},vp=(e,t)=>e.before.slice(0,e.start)+t+e.before.slice(e.end),K0=async(e,t,r)=>{let n=r.replaced;return n?mr(n.held.el,vp(n.held,n.text))?_({}):g("check"):g("wrong_state")},V0=async(e,t,r)=>{let n=r.replaced;if(!n||!n.held.el.isConnected)return g("wrong_state");let o=vp(n.held,n.text);if(!mr(n.held.el,o))return g("wrong_state",{changed:!0});let i={...n.held,end:n.held.start+n.text.length,before:ve(n.held.el),text:n.text};return zt(i,n.held.text)?(r.replaced=null,mr(n.held.el,n.held.before)?_({}):g("check")):g("not_replaced")},kp={read_selection:z0,replace_selection:W0,check_replace:K0,undo:V0,show_changes:hp,go_back:bp,end_preview:gp,watch_paste:wp,focus_text:yp};var _p=[{key:"mailbox_route",route:"/mail/u/{account}/",role:null,label:null,selector:null,observed:"unknown",how:"Gmail's own address for an account, reported by users; to observe in milestone L"},{key:"search_route",route:"/mail/u/{account}/#search/{query}",role:null,label:null,selector:null,observed:"unknown",how:"Gmail writes the same hash when the person searches, reported by users; to observe"},{key:"drafts_route",route:"/mail/u/{account}/#drafts",role:null,label:null,selector:null,observed:"unknown",how:"the Drafts folder's hash, reported by users; to observe"},{key:"compose_route",route:"/mail/u/{account}/?view=cm&fs=1&tf=1",role:null,label:null,selector:null,observed:"unknown",how:"full window compose with an empty address, reported by users (Simon Willison's note); to observe"},{key:"sign_in",route:null,role:null,label:null,selector:'input[name="identifier"], input[type="password"]',observed:"unknown",how:"Google's sign in form fields, to observe"},{key:"main",route:null,role:"main",label:null,selector:null,observed:"unknown",how:"the message list's ARIA region, to observe"},{key:"row",route:null,role:"row",label:null,selector:null,observed:"unknown",how:"one conversation per ARIA row in the main list, to observe"},{key:"person",route:null,role:null,label:null,selector:"[email]",observed:"unknown",how:"a sender's name carrying its address in an email attribute, reported by users; to observe"},{key:"row_parts",route:null,role:null,label:null,selector:"span[data-thread-subject], .bog, span[data-snippet], .y2",observed:"unknown",how:"a row's subject and snippet spans by position, to observe"},{key:"message",route:null,role:"listitem",label:null,selector:null,observed:"unknown",how:"one message of an open thread per ARIA list item, to observe"},{key:"message_body",route:null,role:null,label:null,selector:'div[data-message-body], .a3s, div[dir="ltr"]',observed:"unknown",how:"a message's body block, to observe"},{key:"quote",route:null,role:null,label:null,selector:"blockquote, .gmail_quote",observed:"unknown",how:"quoted earlier mail inside a message, dropped when read; to observe"},{key:"when",route:null,role:null,label:null,selector:"[title]",observed:"unknown",how:"a row's or message's date with the full date in its title, to observe"},{key:"compose",route:null,role:"dialog",label:null,selector:"form",observed:"unknown",how:"the compose window around the subject field, to observe"},{key:"to_field",route:null,role:null,label:"To recipients",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the To field by its ARIA label, to observe"},{key:"cc_open",route:null,role:null,label:"Add Cc recipients",selector:"[aria-label]",observed:"unknown",how:"the Cc link that opens the Cc field, to observe"},{key:"cc_field",route:null,role:null,label:"Cc recipients",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the Cc field by its ARIA label, to observe"},{key:"chip",route:null,role:null,label:null,selector:"[data-hovercard-id], [email]",observed:"unknown",how:"a recipient chip holding its address in an attribute, to observe"},{key:"suggestion",route:null,role:"option",label:null,selector:null,observed:"unknown",how:"Gmail's own autocomplete rows under a recipients field, to observe"},{key:"subject",route:null,role:null,label:null,selector:'input[name="subjectbox"]',observed:"unknown",how:"the subject input by its name, reported by users; to observe"},{key:"body",route:null,role:"textbox",label:"Message Body",selector:'div[aria-label="Message Body"]',observed:"unknown",how:"the editable body by its ARIA label, reported by users; to observe"},{key:"saved_mark",route:null,role:null,label:"Draft saved",selector:null,observed:"unknown",how:"the mark the compose footer shows after autosave, to observe"},{key:"save_close",route:null,role:"button",label:"Save & close",selector:null,observed:"unknown",how:"the full window compose's close button, to observe"},{key:"send",route:null,role:"button",label:"Send",selector:null,observed:"unknown",how:"the compose's button whose label starts with Send, to observe"},{key:"discard",route:null,role:"button",label:"Discard draft",selector:null,observed:"unknown",how:"the compose's trash button, to observe"},{key:"sent_toast",route:null,role:null,label:"Message sent",selector:null,observed:"unknown",how:"the toast after a send, to observe"},{key:"undo",route:null,role:"link",label:"Undo",selector:null,observed:"unknown",how:"the toast's Undo link, shown for the time the person set in Gmail; to observe"},{key:"undone_mark",route:null,role:null,label:"Sending undone",selector:null,observed:"unknown",how:"the toast after Undo, to observe"}];var X0=["mailbox_route","search_route","drafts_route","compose_route","sign_in","main","row","person","row_parts","message","message_body","quote","when","compose","to_field","cc_open","cc_field","chip","suggestion","subject","body","saved_mark","save_close","send","discard","sent_toast","undo","undone_mark"],S=Ze(_p,X0),tt="mail.google.com";var Sp=()=>({pressed:new WeakSet,held:null,replaced:null,docs:null,preview:null,pasteWatch:null}),je={short:200,snippet:300,body:1200},rt=(e,t)=>{let r=e.replace(/\s+/g," ").trim();return r.length<=t?r:r.slice(0,t)};var J0=/(?:^|[\s<(])([^\s@<>,;"()]+@[^\s@<>,;"()]+\.[a-z]{2,})/i;function Y0(e){for(let r of["data-address","data-hovercard-id","email"]){let n=e.getAttribute(r);if(n)return n}return[...e.querySelectorAll("*")].find(r=>r.children.length===0&&_e(r.textContent??""))?.textContent?.trim()??J0.exec(e.textContent??"")?.[1]??""}function Z0(e){let t=Y0(e);if(!_e(t))return null;let r=(e.textContent??"").replace(t,"").replace(/[<>()]/g," ");return{name:rt(r,je.short),address:t}}async function Ep(e,t,r){if(!r.trim()||r.length>60)return g("check");let n=await ne(e,t,S.to_field,"the To field of the open compose window");if(!n)return g("hook_missed");let o=k(t,S.chip).length;await e.type(n,r,!0);let i=await O(e,()=>{let a=k(e.doc,S.suggestion).filter(c=>!c.matches(S.chip.selector));return a.length>0?a:null},M.field)??[],s=[];for(let a of i){let c=Z0(a);c&&!s.some(l=>me(l.address)===me(c.address))&&s.push(c)}return await e.type(n,"",!0),await e.key(n,"Escape"),k(t,S.chip).length!==o?g("check",{refused:"chip_added"}):_({matches:s.slice(0,8)})}var Q0=new Set(["DIV","P","LI","TR","BLOCKQUOTE","H1","H2","H3","H4","H5","H6","PRE","SECTION"]);function Cp(e,t=null){let r=[],n=o=>{if(o.nodeType===3){r.push(o.data);return}if(o.nodeType!==1)return;let i=o;if(t&&i.matches(t))return;if(i.tagName==="BR"){r.push(`
`);return}let s=Q0.has(i.tagName);s&&r.push(`
`),i.childNodes.forEach(n),s&&r.push(`
`)};return e.childNodes.forEach(n),r.join("").split(`
`).map(o=>o.replace(/\s+/g," ").trim()).filter(Boolean).join(`
`)}function Rp(e,t){return e.length<=t?e:e.slice(0,t)}var Ss=`https://${tt}`;function yo(e){let t;try{t=new URL(e)}catch{return null}if(t.hostname!==tt)return null;let r=/^\/mail\/(?:u\/(\d+)\/)?/.exec(t.pathname);return r?Number(r[1]??0):null}function Es(e){return`#search/${encodeURIComponent(e).replace(/%20/g,"+")}`}function xo(e,t){return Ss+Qe(S.search_route.route,{account:e,query:Es(t).slice(8)})}function vo(e){return Ss+Qe(S.compose_route.route,{account:e})}function ko(e){return Ss+Qe(S.drafts_route.route,{account:e})}function Wt(e){return Qe(S.mailbox_route.route,{account:e})}function _o(e){return e.location.hostname==="accounts.google.com"||k(e,S.sign_in).length>0}var Ap=async e=>{if(_o(e.doc))return g("sign_in");let t=yo(e.doc.location.href);return t===null?g("wrong_state"):_({account:t})},ev=(e,t)=>{let r=n=>decodeURIComponent(n.replace(/\+/g," "));return r(e)===r(t)},Tp=async(e,t)=>{let r=I(t,"query");if(!r||r.length>200)return g("check");if(_o(e.doc))return g("sign_in");let n=Ue(t),o=e.doc.location;if(!(o.hostname===tt&&o.pathname===Wt(n)&&!o.search.includes("view=")))return $e(xo(n,r));let s=Es(r);return ev(o.hash,s)||(o.hash=s,await e.sleep(M.poll)),await O(e,()=>k(e.doc,S.main)[0]??null,M.page)?_({}):g("hook_missed")};function tv(e,t){let r=k(e,S.person)[0],n=k(e,S.row_parts),o=k(e,S.when);return{index:t,sender:rt(r?.getAttribute("name")??r?.textContent??"",je.short),from:r?.getAttribute("email")??"",subject:ye(rt(n[0]?.textContent??"",je.short)),snippet:ye(rt((n[1]?.textContent??"").replace(/^\s*-\s*/,""),je.snippet)),date:o.at(-1)?.getAttribute("title")??""}}var Pp=async(e,t)=>{let r=k(e.doc,S.main)[0];if(!r)return g("hook_missed");let n=Math.min(Math.max(At(t,"limit")??3,1),10);return _({rows:k(r,S.row).slice(0,n).map(tv)})};function rv(e){let t=k(e,S.person)[0],r=k(e,S.message_body)[0];return{from:t?.getAttribute("email")??"",sender:rt(t?.getAttribute("name")??t?.textContent??"",je.short),date:k(e,S.when)[0]?.getAttribute("title")??"",body:r?ye(Rp(Cp(r,S.quote.selector),je.body)):""}}var Ip=async(e,t)=>{let r=k(e.doc,S.main)[0],n=r?k(r,S.row)[At(t,"row")??0]:void 0;if(!n)return g("wrong_state");let o=e.doc.location.hash;await e.click(n);let i=await O(e,()=>{let c=k(e.doc,S.message).filter(l=>k(l,S.person).length>0);return c.length>0?c:null},M.page);if(!i)return g("timeout");let s=I(t,"from"),a=i.map(rv).filter(c=>!s||me(c.from)===me(s));return e.doc.location.hash!==o&&(e.doc.location.hash=o),_({messages:a.slice(0,5)})};function Ge(e){let t=[S.subject,S.body,S.to_field];return k(e,S.compose).find(r=>t.some(n=>k(r,n).length>0))??null}function hr(e){return k(e,S.chip).map(t=>t.getAttribute("data-hovercard-id")??t.getAttribute("email")??"").filter(Boolean)}var Mp=async(e,t)=>{if(_o(e.doc))return g("sign_in");let r=Ue(t),n=e.doc.location;return n.hostname===tt&&n.pathname===Wt(r)&&new URLSearchParams(n.search).get("view")==="cm"?await O(e,()=>Ge(e.doc),M.page)?_({}):$e(`https://${tt}${Wt(r)}`):$e(vo(r))};async function nv(e,t,r,n){let o=k(t,S.cc_field)[0];if(!o){let i=await ne(e,t,S.cc_open,"the Cc link of the open compose window");if(!i)return g("hook_missed");await e.click(i),o=await O(e,()=>k(t,S.cc_field)[0]??null,M.field)??void 0}if(!o)return g("hook_missed");for(let i of r){let s=await Ur(e,o,i,n,()=>hr(t));if(s)return s}return null}var Lp=async(e,t)=>{let r=Ge(e.doc);if(!r)return g("wrong_state");let n=I(t,"lookup");if(n!==null)return Ep(e,r,n);let o=Ye(t,"to"),i=Ye(t,"cc"),s=[...o,...i];if(o.length===0||s.some(u=>!_e(u)))return g("check",{refused:"not_address"});let a=Me(hr(r),s);if(a.length>0)return g("check",{strangers:a});let c=await ne(e,r,S.to_field,"the To field of the open compose window");if(!c)return g("hook_missed");for(let u of o){let p=await Ur(e,c,u,s,()=>hr(r));if(p)return p}if(i.length>0){let u=await nv(e,r,i,s);if(u)return u}let l=hr(r);return mt(l,s)?_({chips:l}):g("check",{strangers:Me(l,s)})},Op=async(e,t)=>{let r=I(t,"text");if(r===null||r.length>250)return g("check");let n=Ge(e.doc);if(!n)return g("wrong_state");let o=await ne(e,n,S.subject,"the Subject field of the open compose window");if(!o)return g("hook_missed");let i=J(o).trim();return t.ifEmpty===!0&&i!==""?_({kept:i}):(await e.type(o,r,!0),J(o)===r?_({}):g("check"))},Np=async(e,t)=>{let r=I(t,"text");if(!r||r.length>4e3)return g("check");let n=Ge(e.doc);if(!n)return g("wrong_state");let o=await ne(e,n,S.body,"the message body of the open compose window");return o?(await e.type(o,r,!0),Se(J(o))===Se(r)?_({}):g("check")):g("hook_missed")};async function Dp(e,t){let r=await ne(e,t,S.discard,"the Discard draft button of the open compose window");return r?(await e.click(r),await O(e,()=>t.isConnected?null:!0,M.page)?_({}):g("timeout")):g("hook_missed")}var Hp=async(e,t)=>{let r=I(t,"subject");if(!r)return g("check");let n=Ge(e.doc);if(n){let l=k(n,S.subject)[0];return l&&J(l)===r?Dp(e,n):g("wrong_state")}let o=Ue(t),i=e.doc.location;if(i.hostname!==tt||i.pathname!==Wt(o)||i.search.includes("view="))return $e(ko(o));i.hash!=="#drafts"&&(i.hash="#drafts");let s=await O(e,()=>k(e.doc,S.main)[0]??null,M.page);if(!s)return g("hook_missed");let a=k(s,S.row).filter(l=>(k(l,S.row_parts)[0]?.textContent??"").trim()===r);if(a.length!==1)return g("check",{matches:a.length});await e.click(a[0]);let c=await O(e,()=>Ge(e.doc),M.page);return c?Dp(e,c):g("timeout")};var Bp=async e=>{let t=Ge(e.doc);if(!t)return g("wrong_state");if(!await O(e,()=>k(t,S.saved_mark)[0]??null,M.saved))return g("timeout");let n=k(t,S.save_close)[0];return n&&await e.click(n),_({saved:!0,closed:n!==void 0})},Fp=async(e,t,r)=>{if(!Ft(t,"confirmed"))return g("check",{refused:"not_confirmed"});let n=Ge(e.doc);if(!n)return g("wrong_state");if(r.pressed.has(n))return g("check",{refused:"already_pressed"});let o=Ye(t,"to"),i=[...o,...Ye(t,"cc")];if(o.length===0||i.some(u=>!_e(u)))return g("check",{refused:"not_address"});let s=hr(n);if(!mt(s,i))return g("check",{strangers:Me(s,i)});let a=k(n,S.body)[0];if(!a||J(a).trim()==="")return g("check",{refused:"empty_body"});let c=await ne(e,n,S.send,"the Send button of the open compose window");return c?(r.pressed.add(n),await e.click(c),await O(e,()=>!n.isConnected||k(e.doc,S.sent_toast).length>0?!0:null,M.page)?_({pressed:!0}):g("timeout",{pressed:!0})):g("hook_missed")},Up=async e=>await O(e,()=>k(e.doc,S.sent_toast)[0]??null,M.page)?_({undo:k(e.doc,S.undo).length>0}):g("timeout"),$p=async e=>{let t=k(e.doc,S.undo)[0];return t?(await e.click(t),await O(e,()=>k(e.doc,S.undone_mark).length>0||Ge(e.doc)?!0:null,M.page)?_({}):g("timeout")):g("timeout",{gone:!0})};var jp={account:Ap,search:Tp,read_results:Pp,read_thread:Ip,compose:Mp,to:Lp,subject:Op,body:Np,save_draft:Bp,send:Fp,sent:Up,discard:Hp,undo_send:$p};function Gp(e,t){let r=Sp();return async n=>{let o=t[n.recipe],i=o&&Object.hasOwn(o,n.step)?o[n.step]:void 0;if(!i)return g("wrong_state");try{return await i(e,n.args,r)}catch{return g("hook_missed")}}}var zp=[{key:"google_title",route:null,role:null,label:null,selector:'#search a h3, #rso a h3, [role="main"] a h3',observed:"unknown",how:"a result's title as a heading inside its link on Google's results page, to observe in milestone L"},{key:"google_block",route:null,role:null,label:null,selector:"[data-hveid], .g, .MjjYud",observed:"unknown",how:"the block around one Google result, to observe"},{key:"google_snippet",route:null,role:null,label:null,selector:"[data-sncf], .VwiC3b",observed:"unknown",how:"a Google result's snippet, to observe"},{key:"bing_title",route:null,role:null,label:null,selector:"#b_results li.b_algo h2 a",observed:"unknown",how:"a Bing result's title link, to observe"},{key:"bing_block",route:null,role:null,label:null,selector:"li.b_algo",observed:"unknown",how:"the block around one Bing result, to observe"},{key:"bing_snippet",route:null,role:null,label:null,selector:".b_caption p",observed:"unknown",how:"a Bing result's snippet, to observe"},{key:"ddg_title",route:null,role:null,label:null,selector:'a[data-testid="result-title-a"]',observed:"unknown",how:"a DuckDuckGo result's title link, to observe"},{key:"ddg_block",route:null,role:null,label:null,selector:'article[data-testid="result"]',observed:"unknown",how:"the block around one DuckDuckGo result, to observe"},{key:"ddg_snippet",route:null,role:null,label:null,selector:'[data-result="snippet"]',observed:"unknown",how:"a DuckDuckGo result's snippet, to observe"}];var sv=["google_title","google_block","google_snippet","bing_title","bing_block","bing_snippet","ddg_title","ddg_block","ddg_snippet"],nt=Ze(zp,sv);var av={google:{title:nt.google_title,block:nt.google_block,snippet:nt.google_snippet},bing:{title:nt.bing_title,block:nt.bing_block,snippet:nt.bing_snippet},duckduckgo:{title:nt.ddg_title,block:nt.ddg_block,snippet:nt.ddg_snippet}};function Cs(e){return/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(e)?"google":/^(www\.)?bing\.com$/.test(e)?"bing":/^(html\.|www\.)?duckduckgo\.com$/.test(e)?"duckduckgo":null}function Rs(e,t){let r;try{r=new URL(e,t)}catch{return null}if(r.hostname===t.hostname&&r.pathname==="/url"){let n=r.searchParams.get("q")??r.searchParams.get("url");return n?Rs(n,t):null}return r.protocol!=="https:"&&r.protocol!=="http:"||r.hostname===t.hostname||Cs(r.hostname)!==null?null:r.href.length<=2e3?r.href:null}function cv(e,t){let r=e.closest(t.block.selector);for(let n=r;n;n=n.parentElement?.closest(t.block.selector)??null)if(k(n,t.snippet).length>0)return n;return r}var lv=async(e,t)=>{if(Fr(e.doc).some(a=>a.reason==="captcha"))return g("wrong_state",{human_check:!0});let r=new URL(e.doc.location.href),n=Cs(r.hostname);if(!n)return g("wrong_state");let o=av[n],i=Math.min(Math.max(At(t,"limit")??10,1),20),s=[];for(let a of k(e.doc,o.title)){let c=a.tagName==="A"?a:a.closest("a"),l=c?Rs(c.getAttribute("href")??"",r):null;if(!l||s.some(d=>d.url===l))continue;let u=cv(a,o),p=u?k(u,o.snippet)[0]?.textContent??"":"";if(s.push({title:ye(rt(a.textContent??"",je.short)),url:l,snippet:ye(rt(p,je.snippet))}),s.length===i)break}return _({engine:n,rows:s})},Wp={read_results:lv};async function dv(e){let t=e.ownerDocument.defaultView;e.scrollIntoView?.({block:"center",inline:"center"});let r=e.getBoundingClientRect(),n={bubbles:!0,cancelable:!0,composed:!0,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0},o=t.PointerEvent??t.MouseEvent;e.dispatchEvent(new o("pointerover",n)),e.dispatchEvent(new o("pointerdown",n)),e.dispatchEvent(new t.MouseEvent("mousedown",n)),e instanceof t.HTMLElement&&e.focus(),e.dispatchEvent(new o("pointerup",n)),e.dispatchEvent(new t.MouseEvent("mouseup",n)),e.dispatchEvent(new t.MouseEvent("click",n))}function uv(e){let t=he(e);if(e.focus(),t==="input"||t==="textarea"){e.select();return}let r=e.ownerDocument.getSelection();if(!r)return;let n=e.ownerDocument.createRange();n.selectNodeContents(e),r.removeAllRanges(),r.addRange(n)}async function pv(e,t,r){let n=J(e),o=()=>r?Se(J(e))===Se(t):Se(J(e))!==Se(n)&&Se(J(e)).includes(Se(t));return r?$r(e,t,o,()=>uv(e)):(e.focus(),$r(e,t,o,()=>{}))}var fv={Enter:"Enter",Escape:"Escape",Tab:"Tab",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",PageDown:"PageDown",PageUp:"PageUp",Backspace:"Backspace"};async function mv(e,t){let r=e.ownerDocument.defaultView,n={key:t,code:fv[t],bubbles:!0,cancelable:!0,composed:!0};e.dispatchEvent(new r.KeyboardEvent("keydown",n)),e.dispatchEvent(new r.KeyboardEvent("keyup",n))}function As(e,t,r,n){return{...n?{preview:n}:{},doc:e,pick:t,elementOf:r,click:dv,type:pv,key:mv,sleep:o=>new Promise(i=>setTimeout(i,o)),now:()=>Date.now()}}var hv={gmail:jp,calendar:Uu,docs:ip,field:kp,search:Wp};function Kp(e){return Gp(e,hv)}var Tt={width:816,margin:96,lineHeight:22,top:96};function Ts(e,t,r=Tt.width-2*Tt.margin){let n=[],o=Tt.top,i=0;for(let s of e.split(`
`)){let a=0;for(;;){let c=s.length;if(t(s.slice(a,c))>r){let l=a;for(;l<s.length&&t(s.slice(a,l+1))<=r;)l+=1;let u=s.lastIndexOf(" ",l);c=u>a?u+1:Math.max(l,a+1)}if(n.push({from:i+a,to:i+c,y:o}),o+=Tt.lineHeight,c>=s.length)break;a=c}i+=s.length+1}return n}var Vp="15px Arial, Helvetica, sans-serif";function Ps(e,t){if(e==="tinymce"){let r=document.querySelector("iframe.tox-edit-area__iframe").contentDocument;return{doc:r,root:r.body}}if(e==="gmail")return{doc:document,root:document.querySelector('[aria-label="Message Body"]')};if(e==="prosemirror")return{doc:document,root:document.querySelector(".ProseMirror")};if(e==="quill")return{doc:document,root:document.querySelector(".ql-editor")};if(e==="notion"){let r=[...document.querySelectorAll(".notion-text-block [contenteditable]")].find(n=>(n.textContent??"").includes(t));return{doc:document,root:r}}return{doc:document,root:document.getElementById("editor")}}function qp(e,t){let r=e.ownerDocument.createTreeWalker(e,NodeFilter.SHOW_TEXT);for(let n=r.nextNode();n;n=r.nextNode()){let o=n.data.indexOf(t);if(o>=0)return{node:n,at:o}}return null}var Is=e=>e==="textarea"||e==="input";function gv(e,t,r){let n=getComputedStyle(e),o=document.createElement("canvas").getContext("2d");o.font=`${n.fontSize} ${n.fontFamily}`;let i=o.measureText("M").width,s=e.getBoundingClientRect(),a=s.left+e.clientLeft+parseFloat(n.paddingLeft)-e.scrollLeft,c=Math.floor((e.clientWidth-parseFloat(n.paddingLeft)-parseFloat(n.paddingRight))/i),l=e.tagName==="INPUT"?parseFloat(n.fontSize)*1.2:parseFloat(n.lineHeight),u=e.tagName==="INPUT"?s.top+e.clientTop+(e.clientHeight-l)/2:s.top+e.clientTop+parseFloat(n.paddingTop)-e.scrollTop,p=[],d=0;for(let y of e.value.split(`
`)){let b=0;for(;e.tagName==="TEXTAREA"&&y.length-b>c;){let v=y.lastIndexOf(" ",b+c),E=v>b?v+1:b+c;p.push([d+b,d+E]),b=E}p.push([d+b,d+y.length]),d+=y.length+1}let f=o.measureText("M"),h=f.fontBoundingBoxAscent+f.fontBoundingBoxDescent,w=[];return p.forEach(([y,b],v)=>{let E=Math.max(y,t),T=Math.min(b,r);T>E&&w.push({x:a+(E-y)*i,y:u+v*l+(l-h)/2,width:(T-E)*i,height:h})}),w}var bv={select(e,t){if(Is(e)){let s=document.getElementById("editor"),a=s.value.indexOf(t);return s.focus(),s.setSelectionRange(a,a+t.length),a>=0}let{doc:r,root:n}=Ps(e,t),o=qp(n,t);if(!o)return!1;n.focus();let i=r.createRange();return i.setStart(o.node,o.at),i.setEnd(o.node,o.at+t.length),r.getSelection().removeAllRanges(),r.getSelection().addRange(i),!0},rects(e,t,r,n){if(Is(e)){let p=document.getElementById("editor"),d=p.value.indexOf(t);return gv(p,d+r,d+r+n)}let{doc:o,root:i}=Ps(e,t),s=qp(i,t);if(!s)return[];let a=o.createRange();a.setStart(s.node,s.at+r),a.setEnd(s.node,s.at+r+n);let c=o.defaultView?.frameElement?.getBoundingClientRect(),l=c?c.left+o.defaultView.frameElement.clientLeft:0,u=c?c.top+o.defaultView.frameElement.clientTop:0;return[...a.getClientRects()].map(p=>({x:p.left+l,y:p.top+u,width:p.width,height:p.height}))},docsRects(e,t,r){let n=document.querySelector("canvas.kix-canvas-tile-content"),o=document.createElement("canvas").getContext("2d");o.font=Vp;let i=a=>o.measureText(a).width,s=n.getBoundingClientRect();return Ts(e,i).filter(a=>a.to>t&&a.from<r).map(a=>{let c=Math.max(a.from,t),l=Math.min(a.to,r);return{x:s.left+Tt.margin+i(e.slice(a.from,c)),y:s.top+a.y,width:i(e.slice(c,l)),height:Tt.lineHeight}})},text(e,t){return Is(e)?document.getElementById("editor").value:Ps(e,t).root.textContent??""}};window.RewriteTruth=bv;function Xp(e,t,r){let n=a=>a===void 0?a:structuredClone(a),o=a=>({get(c){let l=e.stores[a]??{};if(c==null)return Promise.resolve(n(l));let u=typeof c=="string"?[c]:Array.isArray(c)?c:Object.keys(c),p=typeof c=="object"&&!Array.isArray(c)?c:{},d={};for(let f of u)f in l?d[f]=n(l[f]):f in p&&(d[f]=p[f]);return Promise.resolve(d)},set(c){return e.write(a,n(c)),Promise.resolve()},remove(c){return e.remove(a,typeof c=="string"?[c]:c),Promise.resolve()},clear(){return e.remove(a,Object.keys(e.stores[a]??{})),Promise.resolve()},onChanged:Kt(c=>e.watchStorage((l,u)=>u===a&&c(n(l))))}),i={runtime:{id:"coere",lastError:void 0,getURL:a=>r+a.replace(/^\//,""),getManifest:()=>({version:"2.0.0",name:"Coere"}),sendMessage:async a=>n(await e.handle(n(a),t)),connect:()=>yv(),onMessage:Kt(a=>e.listen(t,(c,l,u)=>a(n(c),l,u))),onConnect:Kt(()=>()=>{})},storage:{local:o("local"),session:o("session"),sync:o("sync"),onChanged:Kt(a=>e.watchStorage((c,l)=>a(n(c),l)))},i18n:{getUILanguage:()=>"en-US",getMessage:()=>""},tabs:{sendMessage:(a,c)=>e.tell(n(c)),query:async()=>[],create:async()=>({})}},s=wv(i);Object.assign(window,{chrome:s,browser:s})}function wv(e){let t=()=>new Proxy(()=>Promise.resolve(void 0),{get:(n,o)=>typeof o=="string"&&/^on[A-Z]/.test(o)?Kt(()=>()=>{}):o==="then"?void 0:t()}),r=n=>new Proxy(n,{get(o,i){if(i in o){let s=Reflect.get(o,i);return s&&typeof s=="object"&&!Array.isArray(s)&&!("addListener"in s)?r(s):s}if(!(typeof i!="string"||i==="then"))return/^on[A-Z]/.test(i)?Kt(()=>()=>{}):t()}});return r(e)}function Kt(e){let t=new Map;return{addListener(r){t.set(r,e(r))},removeListener(r){t.get(r)?.(),t.delete(r)},hasListener:r=>t.has(r)}}function yv(){let e=Kt(()=>()=>{});return{name:"",postMessage:()=>{},disconnect:()=>{},onMessage:e,onDisconnect:e}}var Vr=window,Jp=parent.__demo,xv=frameElement.dataset.tab??"";Vr.chrome?.runtime?.sendMessage||Xp(Jp.world,xv,Jp.assets);window.parent=window;var vv=Element.prototype.attachShadow;Element.prototype.attachShadow=function(e){return vv.call(this,this.localName==="coere-layer"?{...e,mode:"open"}:e)};var kv=window.fetch.bind(window);window.fetch=async(e,t)=>{let r=new URL(typeof e=="string"?e:e instanceof URL?e.href:e.url,location.href),n=/\/mail\/u\/\d+\/sync\/(\w+)$/.exec(r.pathname),o=/\/document\/d\/([\w-]+)\/save$/.exec(r.pathname);if(!n&&!o)return kv(e,t);let i=(()=>{try{return JSON.parse(String(t?.body??"{}"))}catch{return{}}})(),s=o?{id:o[1],saved:!0}:n[1]==="undo"?{id:i.id,undone:!0}:{id:i.id,savedAt:Date.now()};return new Response(JSON.stringify(s),{status:200,headers:{"content-type":"application/json"}})};function _v(e){let t={heard:new Set,closed:new Set},r={heard:new Set,closed:new Set},n=!0,o=(i,s,a)=>({name:qr,sender:a,postMessage(c){if(!n)return;let l=structuredClone(c);setTimeout(()=>n&&s.heard.forEach(u=>u(l)),0)},disconnect(){n&&(n=!1,setTimeout(()=>s.closed.forEach(c=>c()),0))},onMessage:{addListener:c=>void i.heard.add(c)},onDisconnect:{addListener:c=>void i.closed.add(c)}});return{page:o(t,r),worker:o(r,t,{tab:{id:e},frameId:0})}}var Ms=new _n;Ms.local.set(Sr,{..._r,on:!0,level:"autonomous",grantedAt:1});var Sv=0,Yp=()=>`demo${++Sv}`,Ev=Vr.chrome.runtime;function Cv(e,t){let r=new URL(t),n={href:r.href,origin:r.origin,protocol:r.protocol,host:r.host,hostname:r.hostname,pathname:r.pathname,search:r.search,hash:r.hash,toString:()=>r.href};return new Proxy(e,{get(o,i){if(i==="location")return n;let s=Reflect.get(o,i,o);return typeof s=="function"?s.bind(o):s}})}function Rv(e){let t=null,r=()=>t??=Hr(document),n=ls({doc:document,startUrl:location.href,layer:r}),o=async u=>{let p=await n.handle({id:"pick",type:"snapshot",step:0,steps:0,viewportOnly:!1});return p.ok&&p.type==="snapshot"?l.pick(u,p.result.elements):null},i=null,s=null,a={layer:()=>r().root,emit:u=>l.emit(u),anchor:u=>{i=u,s?.()},goBackLabel:x.GO_BACK,alive:()=>t!==null},c=Kp(As(Cv(document,Vr.__demoAddress??location.href),o,u=>n.session.element(u),a)),l=Nc({connect:()=>e,kit:{handle:u=>n.handle(u),dispose:()=>{n.dispose(),t?.remove(),t=null}},overlay:u=>Ed(r().root,/Mac/i.test(navigator.platform),u,void 0,{box:()=>i,listen:p=>s=p}),recipes:c,watchPerson:u=>ds(document,u)})}var Av={queryTabs:async()=>[],inject:async e=>(setTimeout(()=>{let{page:t,worker:r}=_v(e);Rv(t),Ls.hub.offer(r)},0),!0),capture:async()=>null,granted:async()=>!0,tabActive:async()=>!0},Ls=new vn({router:Ms,chrome:Av,brain:Ns(e=>Ev.sendMessage(e),Yp),policies:Lc,now:()=>Date.now(),newId:Yp}),Zp=null,Tv=0;async function Pv(e=null){Zp??=(await Ms.createTab(Vr.__demoAddress??location.href)).id;let t=++Tv,r={runId:`rewrite-demo-${t}`,surface:e?"menu":"shortcut",convId:`conv-demo-${t}`,line:"",plan:{kind:"text_rewrite",target:"",fields:[{name:"how",value:""},...e?[{name:"mode",value:e}]:[]],confirm:!0},tabId:Zp,model:null,origin:null};return Ls.start(r)}Vr.__rewrite={start:Pv,manager:Ls};})();
