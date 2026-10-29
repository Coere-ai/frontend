"use strict";(()=>{var Mf=Object.defineProperty;var Ho=(e,t)=>{for(var r in t)Mf(e,r,{get:t[r],enumerable:!0})};var nn="coere.actions.page";function Lf(e){return{ok:!1,failure:e==="aborted"?"aborted":"network",usdMicros:0}}function Of(e,t){async function r(o,i){try{return await e({ch:"coere",type:"engine.call",id:t(),method:o,args:i})}catch{return{id:"",ok:!1,error:{code:"engine_unreachable",message:"engine is not reachable"}}}}return{call:r,answer:o=>async i=>{let s=await r(o,i);return s.ok?s.result:Lf(s.error.code)}}}function ta(e,t){let{call:r,answer:n}=Of(e,t);return{"memory.act.step":n("memory.act.step"),"memory.act.see":n("memory.act.see"),"memory.act.write":n("memory.act.write"),"memory.act.pick":n("memory.act.pick"),"memory.act.check":n("memory.act.check"),"memory.act.context":async o=>{let i=await r("memory.act.context",o);if(!i.ok)throw new Error(i.error.code);return i.result},"memory.act.form":n("memory.act.form"),"memory.act.abort":async o=>{await r("memory.act.abort",o)},"memory.act.log":async o=>{await r("memory.act.log",o)}}}var on={bolt:{steps:40,calls:50,screenshots:8,askAtMicros:5e4,wallMs:36e4,callMs:2e4},pro:{steps:30,calls:40,screenshots:8,askAtMicros:5e5,wallMs:48e4,callMs:45e3},ultra:{steps:30,calls:40,screenshots:8,askAtMicros:12e5,wallMs:6e5,callMs:9e4}};var se={estimateAskMicros:25e4,estimateOverShare:.5,takeoverMs:10*6e4,undoMs:10*6e4,rewriteUndoMs:3e4,resultBarMs:6e3,screenshotGapMs:1e3,taskPreviewMs:3e3,workerPreviewMs:2e3,workerPageMs:3e3,workersPerHost:2,searchGapMs:8e3,dryReads:8,linksPerSite:2,historyRows:500,continueMs:30*6e4};var ra=["click","type","select","check","key","scroll","wait","navigate","extract","look","ask","done","fail"],na=["Enter","Escape","Tab","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageDown","PageUp","Backspace"];function oa(e,t={}){return{action:e,el:null,mark:null,point:null,text:null,replace:null,option:null,on:null,key:null,dir:null,by:null,ms:null,for:null,url:null,what:null,question:null,choices:null,summary:null,reason:null,target:"",expect:"",note:null,...t}}var Xe={waitMs:3e3,extractChars:600,noteChars:120,choices:4},ia=["navigate","scroll","click","type","extract","done","fail"];var sa=["Organization","Person","Event","Product","ContactPoint"];var Cr={pageText:3e3,snapshotText:2500,snapshotElements:150,picture:1300,stepTurn:6e3,historySteps:6};var aa=["email_draft","calendar_add","text_rewrite","form_fill","page_click","web_research","job_apply"];var Nf=[["captcha",/\b(re|h)?captcha\b|turnstile|verify (that )?you are (a )?human|i'?m not a robot|i am not a robot/i],["purchase",/\b(buy|pay( now)?|place (your )?order|check ?out|subscribe|donate|send money|transfer|trade|purchase|complete (your )?order)\b/i],["account_security",/\b(delete|close|deactivate) (my |your )?account\b|\b(change|reset) (your )?password\b|\b(two|2)[- ]step|\b(two|2)[- ]factor|\b2fa\b|\brecovery\b|security settings|sign out (of all devices|everywhere)/i],["sign_in",/\b(sign ?in|log ?in|sign ?up|create (an )?account|choose an account)\b/i],["file",/\b(upload|download|install|add to chrome|attach (a )?file)\b/i]],Df=new Set(["radio","option","textbox","searchbox","combobox","listbox","spinbutton"]),Hf=/\b(password|passcode|pin|security (question|answer)|one[- ]time (code|password)|verification code|otp)\b/i,Ff=/\b(card number|credit card|debit card|cvv|cvc|expiry|expiration|iban|routing|ssn|social security|passport( number)?|tax id)\b/i,Bf={secret:"password",payment:"payment",purchase:"purchase",account:"account_security",sign_in:"sign_in",captcha:"captcha",file:"file",download:"file"},Fo=/^(chrome|chrome-extension|edge|about|devtools|view-source|file):|^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)/i,Uf=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,$f=/\b(?:https?:\/\/|www\.)[^\s"'<>]+/gi,Bo=/^(to|cc|bcc|recipients?|guests?|add guests|invite|share with|people)\b/i,jf=/\b(submit|finish (attempt|quiz|test)|end attempt|delete|publish|send for review)\b/i,Gf=/^send\b(?!\s+money)/i,zf=/\b(coere|cori|ai assistant|assistant|ai agent)('s)? (instructions?|note|command|task)\b|\bignore (the|all|any|previous|prior|your|earlier|above) (questions?|instructions?|task|request|rules)\b/i,Wf=/\b(coere|cori)\s*:\s*\w|\b(coere|cori) instructions?\b|\b(note|message|instructions?) (to|for) (any|the|an) (ai )?(assistant|agent|model)\b/i,Kf=/\b(gender|race|ethnicity|veteran|disability|sexual orientation|equal (employment )?opportunity)\b/i,Vf=new Set(["click","type","select","check","key","navigate"]),Qt=e=>e.toLowerCase().replace(/\s+/g," ").trim(),Uo=e=>{try{return new URL(e).origin}catch{return null}},an=e=>(e.match(Uf)??[]).map(t=>t.toLowerCase());function qf(e,t){for(let o of e.flags){let i=Bf[o];if(i)return i}let r=`${e.name} ${e.heading??""}`;if(t.action==="type"||t.action==="select"){if(Hf.test(r))return"password";if(Ff.test(r))return"payment"}let n=Df.has(e.role);for(let[o,i]of Nf)if((!n||o==="captcha")&&i.test(e.name))return o;return null}function Yf(e){if(/\b\d{3}-\d{2}-\d{4}\b/.test(e))return!0;for(let t of e.match(/\d[\d -]{11,22}\d/g)??[]){let r=t.replace(/\D/g,"");if(r.length<13||r.length>19)continue;let n=0;for(let o=0;o<r.length;o++){let i=Number(r[r.length-1-o]);o%2===1&&(i=i*2>9?i*2-9:i*2),n+=i}if(n%10===0)return!0}return!1}function ca(e){return Qt([e.line,...Object.values(e.fields),...e.named,...e.given].join(" "))}function Jf(e,t){let r=ca(t),n=new Set(t.named.map(i=>i.toLowerCase()));return an(e).some(i=>!n.has(i)&&!r.includes(i))?!0:(e.match($f)??[]).map(i=>i.replace(/[.,;:!?)\]]+$/,"")).some(i=>!r.includes(Qt(i)))}function Xf(e,t){let r=t.snapshot?.elements.some(o=>o.href===e)??!1,n=t.sites.some(o=>e===o||e===`${o}/`);return r||n||e===t.url}function Zf(e){let{step:t,element:r}=e;if(!ia.includes(t.action))return{kind:"stop",reason:"outside_vocabulary"};let n=Qt(r?.name??"");return t.action==="click"&&!/^(next( page)?|more|load more|show more|older|newer|previous|\d{1,3}|reject all|necessary only|only necessary|decline|close)$/.test(n)?{kind:"stop",reason:"outside_vocabulary"}:t.action==="type"&&r?.role!=="searchbox"&&!/search/.test(n)?{kind:"stop",reason:"outside_vocabulary"}:null}function Qf(e){let t=["to","cc","who"].flatMap(n=>an(e.fields[n]??"")),r=(e.snapshot?.elements??[]).filter(n=>Bo.test(n.heading??"")||Bo.test(n.name)).flatMap(n=>an(`${n.name} ${n.value??""}`));return[...new Set([...t,...r])]}var sn=(e,t)=>e.test(t.line);function em(e){let{step:t,element:r}=e,n=(l,d=null)=>({kind:"confirm",why:l,address:d}),o=r?.name??"",i=t.action==="click"&&Gf.test(o.trim());if(i||t.action==="click"&&/\b(send invitations?|invite)\b/i.test(o)){let l=new Set(e.named.map(p=>p.toLowerCase())),d=Qf(e).find(p=>!l.has(p));if(d!==void 0)return n("unnamed_recipient",d)}if(i&&e.kind==="email_draft"&&e.fields.send!=="yes"||i&&e.kind!=="email_draft"&&!sn(/\bsend\b/i,e))return n("send_not_asked");let s=r?.flags.some(l=>l==="submit"||l==="irreversible")??!1;if(t.action==="click"&&(s||jf.test(o))&&!i&&!(/\bdelete\b/i.test(o)?sn(/\b(delete|remove)\b/i,e):/\bpublish\b/i.test(o)?sn(/\b(publish|post)\b/i,e):e.fields.submit==="yes"||sn(/\bsubmit\b/i,e)))return n("irreversible");let a=t.action==="navigate"?t.url:t.action==="click"?r?.href??null:null,c=a===null?null:Uo(a);return c!==null&&!e.worker&&!e.sites.includes(c)?n("leaves_sites",new URL(c).host):null}function tm(e){let{step:t,element:r}=e,n=s=>({kind:"stop",reason:s}),o=Uo(e.url);if(Fo.test(e.url)||o!==null&&e.blocked.includes(o))return n("blocked_site");if(!Vf.has(t.action))return null;let i=e.snapshot?.findings.find(s=>s.el===null);if(i)return n(i.reason);if(r&&zf.test(r.name))return n("injection");if(r){let a=e.snapshot?.findings.find(c=>c.el===r.n)?.reason??qf(r,t);if(a)return n(a)}if(t.action==="navigate"){let s=t.url??"";if(!/^https?:\/\//i.test(s)||Fo.test(s))return n("outside_vocabulary");let a=Uo(s);if(a!==null&&e.blocked.includes(a))return n("blocked_site");if(!Xf(s,e))return n("injection")}if(t.action==="click"&&r?.href&&Fo.test(r.href))return n("blocked_site");if(t.action==="type"){let s=t.text??"";if(Yf(s))return n("payment");if(Jf(s,e)||(e.kind==="email_draft"||e.kind==="calendar_add")&&r&&Bo.test(r.name)&&!ca(e).includes(Qt(s)))return n("injection")}return null}function rm(e,t){let r=(e.snapshot?.text??"").split(`
`).filter(i=>Wf.test(i)).map(Qt);if(r.length===0)return!1;let n=t.kind==="confirm"?t.address:null;if(n!==null&&r.some(i=>i.includes(n.toLowerCase())))return!0;let o=Qt(e.element?.name??"").split(/[^a-z]+/).filter(i=>i.length>=4);return r.some(i=>o.some(s=>new RegExp(`\\b${s}`).test(i)))}var nm=new Set(["click","navigate","select","check"]),$o=e=>{let t=e.worker?Zf(e):null;if(t)return t;let r=tm(e);if(r)return r;let n=em(e);if(n&&rm(e,n))return{kind:"stop",reason:"injection"};if(n)return n;let o=nm.has(e.step.action)||e.step.action==="key"&&e.step.key==="Enter";return e.level==="review"&&!e.allowedForTask&&!e.worker&&o?{kind:"review"}:{kind:"go"}},jo=e=>Kf.test(`${e.name} ${e.heading??""}`);var la=["fresh_snapshot","tier_up","ask","end_stuck"],om=8,im=3,sm=(e,t)=>e.url===t.url&&e.signature===t.signature&&e.action===t.action&&e.target===t.target;function am(e){let[t,r]=e.slice(-2);return t!==void 0&&r!==void 0&&sm(t,r)}function cm(e){let t=e.slice(-om),r=new Map;for(let n of t){let o=`${n.signature}
${n.notes}`,i=(r.get(o)??0)+1;if(i>=im)return!0;r.set(o,i)}return!1}function lm(e){let t=e.slice(-2);return t.length===2&&t.every(r=>!r.held)}function dm(e){return am(e)?"stuck":cm(e)?"loop":lm(e)?"failing":null}var Go=(e,t)=>{let r=dm(e);return r===null?{trouble:null,next:null}:{trouble:r,next:la[Math.min(Math.max(t,0),la.length-1)]??"end_stuck"}};function zo(e){let t=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(e);if(t)return`${t[2]}/${t[1]}/${t[3]}`;let r=e.replace(/[^\d+]/g,"");return/^\+?\d{7,15}$/.test(r)&&r!==e?r:null}var um=["chatgpt","claude","gemini","deepseek","kimi","perplexity","grok","copilot","meta_ai"];function Wo(e){return typeof e=="string"&&um.includes(e)}var Vo="COERE RAW EXPORT",ua="=".repeat(64),pa=["platform","platform_name","id","title","project","url","created","updated","messages","branch","hidden_messages_left_out","captured_at","adapter"],fa=pa.length+2;var i_=new Intl.Segmenter(void 0,{granularity:"grapheme"});var tS=Array.from({length:256},(e,t)=>t.toString(16).padStart(2,"0"));var wS=new RegExp("\\p{Mn}","gu");var SS=new Intl.Segmenter(void 0,{granularity:"word"}),ES=new RegExp("[_./:\\-#+@]*[\\p{L}\\p{N}\\p{M}\\p{Cf}]+(?:(?:[_./:\\-#+@]+|['\u2019\xB7]|(?<=\\p{N})[,;](?=\\p{N}))[\\p{L}\\p{N}\\p{M}\\p{Cf}]+)*[_./:\\-#+@]*","gu");var CS=new RegExp("[\\p{Ll}\\p{N}]\\p{M}*\\p{Lu}|\\p{Lu}\\p{M}*\\p{Lu}\\p{M}*\\p{Ll}\\p{M}*\\p{Ll}","u"),RS=new RegExp("(?<=[\\p{Ll}\\p{N}]\\p{M}*)(?=\\p{Lu})|(?<=\\p{Lu}\\p{M}*)(?=\\p{Lu}\\p{M}*\\p{Ll}\\p{M}*\\p{Ll})","gu");var Em=`a about above after again all also am an and any are as at be because been before being
below between both but by can could did do does doing dont down during each few for from further had has
have having he her here hers him his how i if im in into is isnt it its itself ive just let me more most
my no nor not now of off on once only or other our ours out over own same she should so some such than
that thats the their theirs them then there these they this those through to too under until up very
was we were what when where which while who whom why will with would you your yours`,Cm=`al algo algunos ante antes como con contra cual cuando de del desde donde durante el ella ellas
ellos en entre era es esa ese eso esta estaba estan estas este esto estos fue ha hay la las le les lo los
mas me mi mis muy nada ni no nos nosotros o otra otro para pero poco por porque que quien se sea ser si
sin sobre son su sus tambien te tiene todo todos tu tus un una uno unos usted y ya yo`,Rm=`\u7684 \u4E86 \u662F \u5728 \u548C \u4E0E \u53CA \u6216 \u4E5F \u5C31 \u90FD \u800C \u7740 \u628A \u88AB \u8BA9 \u7ED9 \u5BF9 \u4ECE \u5230 \u4E3A \u4EE5 \u4E4B \u5176 \u4F46 \u5E76 \u5F88 \u5417 \u5462 \u5427 \u554A \u5440 \u4E48 \u8FD9 \u90A3 \u8FD9\u4E2A \u90A3\u4E2A
\u4E00\u4E2A \u6211\u4EEC \u4F60\u4EEC \u4ED6\u4EEC \u4EC0\u4E48 \u600E\u4E48 \u5982\u4F55 \u53EF\u4EE5 \u6CA1\u6709 \u306E \u306F \u304C \u3092 \u306B \u3067 \u3068 \u3082 \u3078 \u3084 \u304B\u3089 \u307E\u3067`,Tm=new Set([Em,Cm,Rm].flatMap(e=>e.split(/\s+/)));var LS=new RegExp("^(?:\\p{M}|\\u200d)","u");var HS=new Intl.Segmenter(void 0,{granularity:"sentence"});var Mm=`remember remembered remembering remind reminds reminded recall please pls plz kindly
help helps helped helping thanks thank thx ty hey hi hello hiya yo ok okay yes yeah yep nope sure
just really actually basically literally also maybe perhaps probably
want wants wanted wanna need needs needed know knows knew think thinks thought
tell tells told show shows showed give gives gave ask asks asked say says said saying
lets going gonna get gets got gotten like likes liked try trying tried see look looks
something anything everything someone anyone thing things stuff way ways lot lots bit
e.g i.e eg ie etc`,Lm="recuerda recuerdame recordar favor gracias hola ayuda ayudame ayudar quiero necesito dime puedes podrias",Om=`\u6211 \u4F60 \u4ED6 \u5979 \u5B83 \u6211\u4EEC \u4F60\u4EEC \u4ED6\u4EEC \u5979\u4EEC \u54B1\u4EEC \u6211\u60F3 \u60F3\u8981 \u60F3 \u8981 \u8BF7 \u8BF7\u95EE \u5E2E \u5E2E\u6211 \u5E2E\u52A9 \u8BA9 \u4E00\u4E0B \u4E00\u4E9B \u5173\u4E8E \u544A\u8BC9 \u8BB0\u5F97 \u8BB0\u4F4F \u8C22\u8C22 \u4F60\u597D
\u79C1 \u50D5 \u304A\u9858\u3044 \u304F\u3060\u3055\u3044 \u3057\u3066 \u307E\u3059 \u3067\u3059 \u3059\u308B \u3053\u306E \u305D\u306E \u3042\u306E \u3053\u308C \u305D\u308C`,Nm=new Set([Mm,Lm,Om].flatMap(e=>e.split(/\s+/))),Dm=new Set("mr mrs ms mx dr prof sir jr sr st".split(" ")),Hm=new Set("e.g i.e mr mrs ms mx dr prof sr jr st vs approx inc ltd".split(" "));var gE=new RegExp("^\\p{N}$","u"),bE=new RegExp("\\p{N}","u");function Xo(e,t){return`COERE TRANSFER part ${e} of ${t}. Contents, oldest first:`}var ka=Vo,RC=`${ka}
`;function jm(e){return e>=55296&&e<=56319}function Gm(e){return e>=56320&&e<=57343}function Zo(e,t=0,r=e.length){let n=0;for(let o=t;o<r;o+=1){let i=e.charCodeAt(o);i<128?n+=1:i<2048?n+=2:jm(i)&&o+1<r&&Gm(e.charCodeAt(o+1))?(n+=4,o+=1):n+=3}return n}var qm=5*1024*1024,_a=99999,BC=Zo(Xo(_a,_a))+1;var Jm=/^[A-Za-z0-9:_.-]{1,160}$/;var Xm=/(^|[^a-z0-9])(sk-ant-|coere_app_|coere_dev_)/i;function Zm(e){return Jm.test(e)&&!Xm.test(e)}function Qo(e){return Zm(e)}var Qm=["run.start","run.page","run.inventory","run.plan","run.fetch","run.retry","run.wait","run.concurrency","run.large_chat","run.error","run.pause","run.resume","run.cancel","run.attention","run.verify","run.metrics","run.done","engine.call","engine.upsert","engine.error","index.batch","index.done","index.verify","search.run","recall.open","recall.close","recall.insert","transfer.plan","transfer.start","transfer.blocked","transfer.insert","transfer.result","extractall.start","extractall.answer","extractall.control","extractall.done","import.start","import.done","folder.connect","folder.permission","folder.write","zip.build","worker.start","adapter.selftest","memory.plan","memory.call","memory.job","memory.batch","memory.capture","memory.queue","memory.consolidate","memory.verify","memory.export","memory.import","memory.stop","memory.reconcile","memory.rebuild","memory.forget","memory.classify","memory.triage","memory.retain","memory.audit","memory.doc","memory.link","memory.section","memory.vectors","memory.migrate","memory.build","memory.route","memory.context","memory.scan","memory.forget_topic","cori.answer","cori.feedback"],bR=new Set(Qm);var Sa={$comment:"One entry per platform. Code reads this file and never hardcodes a platform name. Capabilities start as unknown and are filled by the M0 spike and kept fresh by the live canary. Host evidence lives in docs/site-notes.md.",platforms:[{id:"chatgpt",name:"ChatGPT",tier:1,hosts:["chatgpt.com"],newChatUrl:"https://chatgpt.com/",logo:"icons/platforms/chatgpt.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"yes",pasteLimitChars:null},exportImport:"zip-conversations-json"},{id:"claude",name:"Claude",tier:1,hosts:["claude.ai"],newChatUrl:"https://claude.ai/new",logo:"icons/platforms/claude.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"yes",pasteLimitChars:null},exportImport:"zip-conversations-json"},{id:"gemini",name:"Gemini",tier:1,hosts:["gemini.google.com"],newChatUrl:"https://gemini.google.com/app",logo:"icons/platforms/gemini.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"no",pasteLimitChars:null},exportImport:"unknown"},{id:"deepseek",name:"DeepSeek",tier:2,hosts:["chat.deepseek.com"],newChatUrl:"https://chat.deepseek.com/",logo:"icons/platforms/deepseek.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"kimi",name:"Kimi",tier:2,hosts:["www.kimi.com"],newChatUrl:"https://www.kimi.com/",logo:"icons/platforms/kimi.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"perplexity",name:"Perplexity",tier:2,hosts:["www.perplexity.ai"],newChatUrl:"https://www.perplexity.ai/",logo:"icons/platforms/perplexity.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"grok",name:"Grok",tier:2,hosts:["grok.com"],newChatUrl:"https://grok.com/",logo:"icons/platforms/grok.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"copilot",name:"Copilot",tier:2,hosts:["copilot.microsoft.com","copilot.com"],newChatUrl:"https://copilot.microsoft.com/",logo:"icons/platforms/copilot.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"meta_ai",name:"Meta AI",tier:2,hosts:["www.meta.ai"],newChatUrl:"https://www.meta.ai/",logo:"icons/platforms/meta_ai.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"}]};var Ea=Sa.platforms.map(e=>{if(!Wo(e.id))throw new Error(`platforms.json has an unknown id: ${e.id}`);return e}),th=new Map(Ea.map(e=>[e.id,e]));function ee(e){let t=th.get(e);if(!t)throw new Error(`No platform with id ${e}`);return t}var te=class extends Error{constructor(t,r){super(`${t}: ${r}`),this.name="ConfigError"}};function rh(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Be(e,t){if(!rh(e))throw new te(t,"must be an object");return e}function Ue(e,t,r){for(let n of Object.keys(e))if(!t.includes(n))throw new te(`${r}.${n}`,"is not a known key")}function ut(e,t){if(typeof e!="string"||e.trim()==="")throw new te(t,"must be a non empty string");return e}function Ze(e,t,r){if(typeof e!="string"||!t.includes(e))throw new te(r,`must be one of ${t.join(", ")}`);return e}function Tr(e,t){if(!Array.isArray(e))throw new te(t,"must be an array");return e}function tr(e,t){let r=ut(e,t);try{new RegExp(r)}catch{throw new te(t,"is not a valid regular expression")}return r}var un=["live","logged-out","reference","owner-prior","none"];var nh=["name","match","verified","note"];function Ca(e){return e===void 0?[]:Tr(e,"config.temporaryUrl").map((t,r)=>{let n=`config.temporaryUrl[${r}]`,o=Be(t,n);Ue(o,nh,n);let i={name:ut(o.name,`${n}.name`),match:tr(o.match,`${n}.match`),verified:Ze(o.verified,un,`${n}.verified`)};if(o.note!==void 0&&(i.note=ut(o.note,`${n}.note`)),i.match==="")throw new te(`${n}.match`,"must not be empty");return i})}var Ar=["composer","composerShell","sendButton","message","messageContent","userMessage","assistantMessage","scrollContainer","sidebarLink","title","temporaryChat","streamingIndicator","rateLimitBanner","loggedOut"],oh=["user","assistant","system","tool"],ih=["execCommand","paste","beforeinput","value"],Ra=["execCommand","paste","beforeinput"],sh=["sync","twoStep"],ah="twoStep",ch=["$comment","anchors","roles","urls","insertOrder","sendHook","temporaryUrl"],lh=["name","selector","verified","deep","note"];function Y(e){let t=Be(e,"config");return Ue(t,ch,"config"),{anchors:dh(t.anchors===void 0?{}:t.anchors),roles:t.roles===void 0?{by:"anchors"}:ph(t.roles),urls:fh(t.urls),insertOrder:t.insertOrder===void 0?[...Ra]:mh(t.insertOrder),sendHook:t.sendHook===void 0?ah:Ze(t.sendHook,sh,"config.sendHook"),temporaryUrl:Ca(t.temporaryUrl)}}function dh(e){let t=Be(e,"config.anchors");Ue(t,Ar,"config.anchors");let r={};for(let n of Ar){let o=`config.anchors.${n}`,i=t[n]===void 0?[]:Tr(t[n],o);r[n]=i.map((a,c)=>uh(a,`${o}[${c}]`));let s=new Set;for(let a of r[n]){if(s.has(a.name))throw new te(o,`has two strategies named "${a.name}"`);s.add(a.name)}}return r}function uh(e,t){let r=Be(e,t);Ue(r,lh,t);let n={name:ut(r.name,`${t}.name`),selector:ut(r.selector,`${t}.selector`),verified:Ze(r.verified,un,`${t}.verified`)};if(r.deep!==void 0){if(typeof r.deep!="boolean")throw new te(`${t}.deep`,"must be true or false");n.deep=r.deep}return r.note!==void 0&&(n.note=ut(r.note,`${t}.note`)),n}function ph(e){let t=Be(e,"config.roles"),r=Ze(t.by,["attribute","anchors"],"config.roles.by");if(r==="anchors")return Ue(t,["by"],"config.roles"),{by:r};Ue(t,["by","attribute","values"],"config.roles");let n={};for(let[o,i]of Object.entries(Be(t.values,"config.roles.values")))n[o]=Ze(i,oh,`config.roles.values.${o}`);return{by:r,attribute:ut(t.attribute,"config.roles.attribute"),values:n}}function fh(e){let t=Be(e,"config.urls");Ue(t,["chatPath","newChatPath","projectPath"],"config.urls");let r={chatPath:tr(t.chatPath,"config.urls.chatPath"),newChatPath:tr(t.newChatPath,"config.urls.newChatPath")};return t.projectPath!==void 0&&(r.projectPath=tr(t.projectPath,"config.urls.projectPath")),r}function mh(e){let t=Tr(e,"config.insertOrder");if(t.length===0)throw new te("config.insertOrder","needs at least one strategy");let r=t.map((n,o)=>Ze(n,ih,`config.insertOrder[${o}]`));if(new Set(r).size!==r.length)throw new te("config.insertOrder","repeats a strategy");return r}var Ia={$comment:"Per site limits measured live and refreshed by the live canary. Null means not measured. Nothing here may be assumed. Gemini: the logged out box kept the first 32,000 characters of a longer insert on 2026-10-20 (docs/site-notes.md).",measuredAt:"2026-10-20",sites:{chatgpt:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},claude:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},gemini:{pasteLimitChars:32e3,tokenLimit:null,source:"measured"},deepseek:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},kimi:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},perplexity:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},grok:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},copilot:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},meta_ai:{pasteLimitChars:null,tokenLimit:null,source:"unknown"}}};var Ah=["pasteLimitChars","tokenLimit","source"],Ph=["pasteLimitChars","tokenLimit"];function Ih(e,t){if(e===null)return null;if(typeof e!="number"||!Number.isInteger(e)||e<0)throw new te(t,"must be null or a whole number of at least 0");return e}function Mh(e,t){let r=`limits.sites.${t}`,n=Be(e,r);Ue(n,Ah,r);let[o,i]=Ph.map(s=>Ih(n[s],`${r}.${s}`));return{pasteLimitChars:o??null,tokenLimit:i??null,source:Ze(n.source,["unknown","measured"],`${r}.source`)}}var Lh=Ia.sites;function re(e){return Mh(Lh[e],e)}var Ma={$comment:"ChatGPT. The cloud browser never got past Cloudflare (docs/site-notes.md), so nothing here was watched in a signed in browser for this build. Strategies marked reference follow ChatGPT's current markup as the maintained open source exporter pionxzh/chatgpt-exporter and similar tools read it: the ProseMirror composer at #prompt-textarea, one element per message carrying data-message-author-role, and the stop button while a reply streams. Owner-prior strategies stay as fallbacks. Chats live at /c/<uuid>, also under a project or GPT at /g/<id>/c/<uuid>.",anchors:{composer:[{name:"reference: prompt textarea id",selector:"#prompt-textarea[contenteditable='true']",verified:"reference",note:"ProseMirror editor, chatgpt-exporter"},{name:"owner-prior: prompt textarea id",selector:"#prompt-textarea",verified:"owner-prior"},{name:"owner-prior: ProseMirror editor",selector:"div[contenteditable='true'].ProseMirror",verified:"owner-prior"},{name:"owner-prior: textarea with data-id",selector:"textarea[data-id]",verified:"owner-prior"}],composerShell:[{name:"reference: unified composer form",selector:"form[data-type='unified-composer']",verified:"reference"},{name:"reference: form around the composer",selector:"form:has(#prompt-textarea)",verified:"reference"}],sendButton:[{name:"reference: send button test id",selector:"button[data-testid='send-button']",verified:"reference"},{name:"reference: composer submit button",selector:"#composer-submit-button",verified:"reference"}],message:[{name:"owner-prior: author role attribute",selector:"[data-message-author-role]",verified:"owner-prior",note:"chatgpt-exporter reads messages the same way"}],messageContent:[{name:"reference: assistant markdown",selector:".markdown",verified:"reference"},{name:"reference: user text",selector:".whitespace-pre-wrap",verified:"reference"}],userMessage:[{name:"owner-prior: user author role",selector:"[data-message-author-role='user']",verified:"owner-prior"}],assistantMessage:[{name:"reference: assistant author role",selector:"[data-message-author-role='assistant']",verified:"reference"}],sidebarLink:[{name:"reference: history link",selector:"nav a[href*='/c/']",verified:"reference"}],streamingIndicator:[{name:"reference: stop button test id",selector:"button[data-testid='stop-button']",verified:"reference"}],loggedOut:[{name:"reference: log in button",selector:"button[data-testid='login-button']",verified:"reference"}],title:[{name:"owner-prior: page heading",selector:"main h1",verified:"owner-prior",note:"Usually absent; the kit falls back to document.title, which ChatGPT sets to the chat's title."}]},roles:{by:"attribute",attribute:"data-message-author-role",values:{user:"user",assistant:"assistant"}},urls:{newChatPath:"^/(?:g/[^/]+/?)?$",chatPath:"^/(?:g/[^/]+/)?c/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",projectPath:"^/g/(?<id>g-p-[^/]+)/project"},sendHook:"twoStep",temporaryUrl:[{name:"temporary chat flag",match:"[?&]temporary-chat=true(?:&|$)",verified:"none",note:"ChatGPT's own links open a temporary chat at /?temporary-chat=true. Unverified on the live site."}]};var Nh={info:ee("chatgpt"),config:Y(Ma),version:"0.1.0",dataSource:null,limits:re("chatgpt")};var La={$comment:"Claude. The cloud browser never got past Cloudflare (docs/site-notes.md), so nothing here was watched in a signed in browser for this build. Strategies marked reference follow claude.ai's current markup as maintained open source exporters (socketteer/Claude-Conversation-Exporter and others) read it: the ProseMirror composer, data-testid='user-message' for the person's turns, font-claude-response inside a data-is-streaming wrapper for replies, which reads true while a reply streams. Owner-prior strategies stay as fallbacks. Chats live at /chat/<uuid>, projects at /project/<uuid>.",anchors:{composer:[{name:"reference: chat input ProseMirror",selector:"[data-testid='chat-input'] div[contenteditable='true'].ProseMirror",verified:"reference"},{name:"owner-prior: ProseMirror editor",selector:"div[contenteditable='true'].ProseMirror",verified:"owner-prior"},{name:"owner-prior: editable textbox",selector:"div[contenteditable='true'][role='textbox']",verified:"owner-prior"},{name:"owner-prior: editable inside a fieldset",selector:"fieldset div[contenteditable='true']",verified:"owner-prior"}],composerShell:[{name:"reference: fieldset around the composer",selector:"fieldset:has(div[contenteditable='true'].ProseMirror)",verified:"reference"}],sendButton:[{name:"reference: send message label",selector:"button[aria-label='Send message'], button[aria-label='Send Message']",verified:"reference"}],userMessage:[{name:"owner-prior: user message test id",selector:"[data-testid='user-message']",verified:"owner-prior"}],assistantMessage:[{name:"reference: streaming wrapper",selector:"div[data-is-streaming]",verified:"reference",note:"Wraps each reply; holds font-claude-response inside."},{name:"reference: response font",selector:".font-claude-response",verified:"reference"}],messageContent:[{name:"reference: response body",selector:".font-claude-response",verified:"reference"}],sidebarLink:[{name:"reference: recents link",selector:"a[href^='/chat/']",verified:"reference"}],streamingIndicator:[{name:"reference: reply streaming",selector:"div[data-is-streaming='true']",verified:"reference"}],title:[{name:"owner-prior: chat menu trigger",selector:"button[data-testid='chat-menu-trigger']",verified:"owner-prior"}]},urls:{newChatPath:"^/new$",chatPath:"^/chat/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",projectPath:"^/project/(?<id>[0-9a-f-]{36})"},sendHook:"twoStep",temporaryUrl:[{name:"incognito flag",match:"[?&]incognito(?:=[^&]*)?(?:&|$)",verified:"none",note:"Claude opens an incognito chat at /new?incognito. Unverified on the live site."}]};var Hh={info:ee("claude"),config:Y(La),version:"0.1.0",dataSource:null,limits:re("claude")};var Oa={$comment:"Copilot. Nothing here is verified: logged out, copilot.com shows a sign in landing page with no composer (docs/site-notes.md, docs/evidence/m0/probe-copilot.json). The composer is owner-prior, from the owner's older extension, never checked for this build; the owner's bare contenteditable fallback is left to the kit's generic finder. The owner's message selectors (div[data-content='user-message'], div[data-content='ai-message'], cib-message) are left out: the owner gave no user selector, and reading roles from those values would be a guess. newChatPath is the owner's new chat URL. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"owner-prior: user input textarea",selector:"textarea#userInput",verified:"owner-prior"},{name:"owner-prior: textarea with placeholder",selector:"textarea[placeholder]",verified:"owner-prior"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},sendHook:"twoStep"};var Bh={info:ee("copilot"),config:Y(Oa),version:"0.1.0",dataSource:null,limits:re("copilot")};var Na={$comment:"DeepSeek. Nothing here is verified: logged out, the site moves to /sign_in (docs/site-notes.md, docs/evidence/m0/probe-deepseek.json). The composer is owner-prior, from the owner's older extension, never checked for this build; the owner's bare textarea fallback is left to the kit's generic finder. The owner's message selectors (div._4f9bf79, div.ds-markdown, div[class*='message']) are left out: with no user selector, every message would read as hidden. newChatPath is the owner's new chat URL. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"owner-prior: chat input textarea",selector:"textarea#chat-input",verified:"owner-prior"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},sendHook:"twoStep"};var $h={info:ee("deepseek"),config:Y(Na),version:"0.1.0",dataSource:null,limits:re("deepseek")};var Da={$comment:"Gemini. The composer, its box, the /app path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-gemini.json). Strategies marked reference follow Gemini's current markup as maintained open source clients and exporters read it: one user-query element per prompt and one model-response per reply, with the text in .query-text and message-content, and the stop button while a reply streams. They were not watched in a signed in browser for this build. Insert: execCommand kept lines and the draft, paste and beforeinput did nothing, so execCommand is the only one tried. Chats live at /app/<hex>, or /u/<n>/app/<hex> on a second Google account.",anchors:{composer:[{name:"logged-out: Quill editor by label",selector:"div.ql-editor[contenteditable='true'][role='textbox'][aria-label='Enter a prompt for Gemini']",verified:"logged-out",note:"The label is English. The off screen div.ql-clipboard has no role, so it never matches."},{name:"logged-out: Quill editor in rich-textarea",selector:"rich-textarea div.ql-editor[contenteditable='true'][role='textbox']",verified:"logged-out"}],composerShell:[{name:"logged-out: input area fieldset",selector:"fieldset.input-area-fieldset",verified:"logged-out",note:"660 by 64 px when empty."},{name:"logged-out: input-area-v2",selector:"input-area-v2",verified:"logged-out",note:"The element that paints the box: 32 px radius, shadow, same size as the fieldset."}],message:[{name:"owner-prior: message list",selector:"user-query, model-response",verified:"owner-prior",note:"The owner's list also named message-content, which sits inside model-response and was read twice."}],messageContent:[{name:"reference: query text",selector:".query-text",verified:"reference"},{name:"reference: message content",selector:"message-content",verified:"reference"}],userMessage:[{name:"owner-prior: user-query",selector:"user-query",verified:"owner-prior"}],assistantMessage:[{name:"reference: model-response",selector:"model-response",verified:"reference"}],sidebarLink:[{name:"reference: conversation link",selector:"a[href*='/app/']",verified:"reference"}],streamingIndicator:[{name:"reference: stop response button",selector:"button[aria-label='Stop response']",verified:"reference"}],title:[{name:"owner-prior: conversation title test id",selector:"[data-test-id='conversation-title']",verified:"owner-prior"},{name:"reference: selected conversation in the sidebar",selector:".conversation.selected .conversation-title",verified:"reference"}]},urls:{newChatPath:"^/(?:u/\\d+/)?app/?$",chatPath:"^/(?:u/\\d+/)?app/(?<id>[0-9a-f]{8,})",projectPath:"^/(?:u/\\d+/)?gem/(?<id>[^/]+)"},insertOrder:["execCommand"],sendHook:"twoStep"};var Gh={info:ee("gemini"),config:Y(Da),version:"0.1.0",dataSource:null,limits:re("gemini")};var Ha={$comment:"Grok. The composer, its box, Submit, the / path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-grok.json). The page shows a plain textarea first and swaps in the TipTap editor about a second later; the textarea stays in the page, hidden. Insert: execCommand and paste kept lines and the draft, beforeinput did nothing. The owner's Grok textarea selector is owner-prior; the owner's bare textarea and contenteditable fallbacks are left to the kit's generic finder, and the owner's message selectors (div.message-bubble, [data-testid='message'], div.response-content-markdown) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: TipTap editor by label",selector:"div.ProseMirror[contenteditable][aria-label='Ask Grok anything']",verified:"logged-out",note:"Its role is combobox, not textbox. The label is English."},{name:"logged-out: editor in chat input",selector:"[data-testid='chat-input'] [contenteditable]",verified:"logged-out"},{name:"owner-prior: Grok textarea",selector:"textarea[aria-label*='Grok' i]",verified:"owner-prior"}],composerShell:[{name:"logged-out: query bar",selector:"div.query-bar",verified:"logged-out",note:"752 by 102 px, 24 px radius, border and shadow."}],sendButton:[{name:"logged-out: chat submit",selector:"[data-testid='chat-submit']",verified:"logged-out",note:"Labeled Submit. Disabled while the box is empty."}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["execCommand","paste"],sendHook:"twoStep"};var Wh={info:ee("grok"),config:Y(Ha),version:"0.1.0",dataSource:null,limits:re("grok")};var Fa={$comment:"Kimi. The composer, its box, the / path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-kimi.json); the composer appears 6 to 15 seconds after load. Insert: paste kept lines and the draft, execCommand lost line breaks and broke the draft, beforeinput doubled the text, so paste is the only one tried. Kimi also restores the last tab's draft in a new tab. The owner's message selectors (div[class*='segment'], div[class*='markdown']) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: Lexical chat input editor",selector:"div.chat-input-editor[contenteditable='true'][role='textbox'][data-lexical-editor='true']",verified:"logged-out"},{name:"logged-out: chat input editor",selector:"div.chat-input-editor[contenteditable='true']",verified:"logged-out"}],composerShell:[{name:"logged-out: chat editor content",selector:"div.chat-editor-content",verified:"logged-out",note:"768 by 114 px, 24 px radius, border and shadow."},{name:"logged-out: chat editor test id",selector:"div.chat-editor[data-testid='chat-editor']",verified:"logged-out"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["paste"],sendHook:"twoStep"};var Vh={info:ee("kimi"),config:Y(Fa),version:"0.1.0",dataSource:null,limits:re("kimi")};var Ba={$comment:"Meta AI. The composer, Send, the sign in marker, the / path and the value insert were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-meta_ai.json). Logged out, the composer is a one line text input behind a sign in dialog, inside a wrapper named logged-out-composer-input, so the logged in composer may be a different element. Insert: only the value setter reached the input, so it goes first; the default order follows for whatever the logged in composer turns out to be. The box has only utility class names, so the kit's generic box finder applies. The owner's selectors for Meta AI were bare contenteditable, textarea and div[dir='auto'], left to the kit's generic finders. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: composer input in its slot",selector:"div[data-slot='logged-out-composer-input'] input[type='text']",verified:"logged-out"},{name:"logged-out: composer input by label",selector:"input[type='text'][aria-label='Ask Meta AI']",verified:"logged-out",note:"The label is English."}],sendButton:[{name:"logged-out: Send label",selector:"[aria-label='Send']",verified:"logged-out",note:"Disabled while the box is empty."}],loggedOut:[{name:"logged-out: logged out composer slot",selector:"[data-slot='logged-out-composer-input']",verified:"logged-out"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["value","execCommand","paste","beforeinput"],sendHook:"twoStep"};var Yh={info:ee("meta_ai"),config:Y(Ba),version:"0.1.0",dataSource:null,limits:re("meta_ai")};var Ua={$comment:"Perplexity. The logged out strategies and the insert order come from the probe's first run (docs/site-notes.md), whose JSON was overwritten by a later run that met a human check, so the notes call them unconfirmed until the owner's pass. Insert: paste kept lines and the draft, execCommand lost line breaks and broke the draft, beforeinput doubled the text, so paste is the only one tried. The owner's #ask-input and textarea selectors are owner-prior; the owner's bare contenteditable and textarea fallbacks are left to the kit's generic finder, and the owner's message selectors (div.prose, [data-testid='answer'], div[class*='query']) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: Lexical ask input",selector:"div#ask-input[contenteditable='true'][role='textbox']",verified:"logged-out",note:"First probe run only."},{name:"owner-prior: ask input id",selector:"#ask-input",verified:"owner-prior"},{name:"owner-prior: ask textarea",selector:"textarea[placeholder*='Ask' i]",verified:"owner-prior"}],composerShell:[{name:"logged-out: raised box",selector:"div[data-appearance='raised']",verified:"logged-out",note:"First probe run only. 640 by 118 px, 16 px radius."}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["paste"],sendHook:"twoStep"};var Xh={info:ee("perplexity"),config:Y(Ua),version:"0.1.0",dataSource:null,limits:re("perplexity")};function J(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ir(e){return typeof e=="string"&&Qo(e)}function Mr(e){return typeof e=="number"&&Number.isFinite(e)&&e>=0}function fn(e){return typeof e=="number"&&Number.isSafeInteger(e)&&e>=0}function ke(e,t){return typeof t=="string"&&e.includes(t)}var Or="coere.browser_use",ii=["autonomous","review"],si=["bolt","pro","ultra"],Lr={on:!1,level:"autonomous",model:"bolt",blocked:[],grantedAt:null},eg=/^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+$/;function Ga(e){if(!J(e)||typeof e.on!="boolean")return{...Lr,blocked:[]};let t=Array.isArray(e.blocked)?[...new Set(e.blocked.filter(r=>typeof r=="string"&&eg.test(r)))]:[];return{on:e.on,level:ke(ii,e.level)?e.level:Lr.level,model:ke(si,e.model)?e.model:Lr.model,blocked:t,grantedAt:Mr(e.grantedAt)?e.grantedAt:null}}var ai=["https://mail.google.com/*","https://calendar.google.com/*"];var mI=5*6e4,za="Coere",Wa="blue";var hI=Object.keys({start:!0,resume:!0});var gI=Object.keys({retry:!0,resume:!0,pause_all:!0,resume_all:!0,cancel_all:!0,clear:!0});async function ci(e,t,r){let n=await e.getTab(t);if(!n)return r;if(r!==null){let o=await e.groupWindow(r);if(o!==null&&o!==n.windowId||o!==null&&await tg(e,t,r))return r}return await rg(e,t)??r}async function tg(e,t,r){try{return await e.groupTab(t,r),!0}catch{return!1}}async function rg(e,t){try{let r=await e.groupTab(t,null);return await e.updateGroup(r,{title:za,color:Wa,collapsed:!1}).catch(()=>{}),r}catch{return null}}var ui={gmail:{pattern:"https://mail.google.com/*",account:/^https:\/\/mail\.google\.com\/mail\/u\/(\d)\//,home:e=>`https://mail.google.com/mail/u/${e}/`},calendar:{pattern:"https://calendar.google.com/*",account:/^https:\/\/calendar\.google\.com\/calendar\/u\/(\d)\//,home:e=>`https://calendar.google.com/calendar/u/${e}/r`}},Ka="coere.actions.own_tabs",li="coere.actions.group";function di(e,t){let r=ui[e].account.exec(t);return r?Number(r[1]):null}async function ng(e){let t=await e.sessionGet(Ka);return J(t)?Object.fromEntries(Object.entries(t).filter(([r,n])=>(r==="gmail"||r==="calendar")&&fn(n))):{}}async function mn(e,t,r){let n=await ng(e),o=await t.queryTabs([ui[r].pattern]),i=o.find(u=>u.id===n[r]),a=o.filter(u=>u.id!==n[r]).map(u=>di(r,u.url)).find(u=>u!==null)??di(r,i?.url??"")??0,c=await e.sessionGet(li),l=typeof c=="number"?c:null;if(i&&di(r,i.url)===a){let u=await ci(e,i.id,l);return await e.sessionSet(li,u),{tabId:i.id,groupId:u,account:a,opened:!1}}let d=await e.createTab(ui[r].home(a),{active:!0});if(d.id===void 0)throw new Error("tab not opened");let p=await ci(e,d.id,l);return await e.sessionSet(li,p),await e.sessionSet(Ka,{...n,[r]:d.id}),{tabId:d.id,groupId:p,account:a,opened:!0}}async function hn(e,t,r,n=o=>new Promise(i=>setTimeout(i,o))){let o=e.now()+r;for(;;){let i=await e.getTab(t);if(!i)return!1;if(!i.loading)return!0;if(e.now()>=o)return!1;await n(100)}}var og="actions-page.js",Va={load:15e3,connect:5e3},gn=class{waiting=new Map;offer(t){if(t.name!==nn)return!1;let r=t.sender?.tab?.id,n=r===void 0||t.sender?.frameId!==0?void 0:this.waiting.get(r);return!n||r===void 0?(t.disconnect(),!0):(this.waiting.delete(r),n(t),!0)}expect(t,r){return new Promise(n=>{let o=setTimeout(()=>{this.waiting.get(t)===i&&this.waiting.delete(t),n(null)},r),i=s=>{clearTimeout(o),n(s)};this.waiting.set(t,i)})}};async function qa(e,t,r,n){if(!await hn(e,n,Va.load))return"closed";let o=r.expect(n,Va.connect);return await t.inject(n,og)?await o??"no_port":"no_permission"}function wn(e,t,r){return{runId:e.runId,parentId:e.parentId,worker:e.worker,convId:e.convId,kind:e.kind,site:e.site,level:e.level,model:e.model,outcome:t?.outcome??null,reason:t?.reason??null,steps:e.step,startedAt:e.startedAt,endedAt:r}}function Ya(e,t,r){return{runId:e.runId,step:e.step,at:r,kind:e.kind,site:e.site,action:t.action,role:t.role.slice(0,40),tier:t.tier,level:e.level,allowed:t.allowed,outcome:t.outcome,model:t.byModel?e.model:"none"}}var bn=class{constructor(t){this.brain=t}chain=Promise.resolve();run(t,r=null){return this.write({run:t,steps:[],...r?{planCall:r}:{}})}step(t){return this.write({run:null,steps:[t]})}write(t){return this.chain=this.chain.then(()=>this.brain["memory.act.log"](t)).catch(()=>{}),this.chain}};var A={};Ho(A,{ALLOW:()=>cg,ALLOWED_STARTING:()=>dg,ALLOW_LINE:()=>ag,ALLOW_TITLE:()=>sg,CANCEL:()=>mg,CANCELLED:()=>qg,CAPTCHA:()=>Hg,GMAIL_SIGN_IN:()=>Dg,INJECTION:()=>Ng,KEEP_GOING:()=>Lg,KEEP_GOING_LINE:()=>Mg,NEED_OK:()=>ig,NEED_TO_LOOK:()=>Og,NOT_NOW:()=>lg,NO_UNDO_INVITES:()=>Rg,NO_UNDO_SENT:()=>Cg,ON_IT:()=>Kg,ON_IT_RESEARCH:()=>Vg,PLAN_LINES:()=>yg,PLAN_TITLE:()=>pg,REFUSED:()=>Wg,RESULT_CHIP_WORDS:()=>Eg,RESUME:()=>Fg,SOMETHING_ELSE:()=>gg,START:()=>fg,STARTING:()=>bg,STARTING_LINK:()=>wg,STOP:()=>hg,STOPPED_OFF:()=>Ig,SUBMIT_QUIZ:()=>zg,TASK_STATUS:()=>kg,allowSendTo:()=>$g,alwaysAllowOn:()=>ug,answered:()=>Ag,emptyFields:()=>Pg,findEmailsWith:()=>xg,foundTwo:()=>jg,needsYou:()=>Ug,noAddressFor:()=>Gg,noUndoOn:()=>Tg,resultTitle:()=>_g,workOn:()=>vg});var ig="I need your OK to use your browser for this.",sg="Allow Coere browser use",ag="Cori works in a Coere tab group and you can stop it anytime.",cg="Allow",lg="Not now",dg="Allowed. Starting now.",ug=e=>`Always allow on ${e}`,pg="Here's my plan",fg="Start",mg="Cancel",hg="Stop",gg="Something else",bg="Got it, starting the task",wg="here",yg={openGmail:"Open Gmail",openCalendar:"Open Google Calendar",writeEmail:"Write the email in your style",saveDraft:"Save it as a draft",send:"Send it",addEvent:"Add the event",saveEvent:"Save it to your calendar",rewrite:"Rewrite it in your style",readPage:"Read the page",workOnPage:"Work on the page step by step",readForm:"Read the form",readJob:"Read the job",fillFromMemory:"Fill it in from your memory",reviewFirst:"Show you every answer before anything is sent"},xg=e=>`Find your recent emails with ${e}`,vg=e=>`Work on ${e}`,kg={running:"Working",waiting:"Waiting for you",taken_over:"You have control",done:"Done",form_sent:"Form sent",form_filled:"Filled, not sent",stopped:"Stopped",stuck:"I got stuck"};function _g(e,t){return e==="sent"?t?`Sent to ${t}`:"Sent":Sg[e]}var Sg={draft_saved:"Draft saved in Gmail",event_added:"Event added to your calendar",rewritten:"Rewritten",kept:"Kept the original",done:"Done",form_sent:"Form sent",form_filled:"Filled, not sent",stopped:"Stopped",stuck:"I got stuck"},Eg={open:"Open",openDraft:"Open draft",delete_draft:"Delete draft",undo_send:"Undo send",delete_event:"Delete event",undo:"Undo",clear:"Clear",try_pro:"Try with Pro"},Cg="It's sent now, so there's no undo.",Rg="The invitations are out. Delete event sends a cancellation.",Tg=e=>`Cori can't undo this on ${e}.`,Ag=(e,t)=>`Answered ${e} of ${t} questions`,Pg=e=>`Left ${e} ${e===1?"field":"fields"} empty, since your memory has nothing for ${e===1?"it":"them"}.`,Ig="Stopped. Coere Browser Use is off.",Mg="This is taking longer than usual. Keep going?",Lg="Keep going",Og="I need to see this page. Press Coere's toolbar button to let me look.",Ng="This page asked me to do something you didn't ask for. I stopped.",Dg="Gmail wants you to sign in first.",Hg="This page wants to check you're a person. Finish that, then press Resume.",Fg="Resume",Bg={password:"a password",payment:"payment details",purchase:"a purchase",account_security:"your account settings",captcha:"a check that you are a person",sign_in:"signing in",file:"a file",blocked_site:"a site you blocked"},Ug=e=>`This step needs you: ${Bg[e]}. I stopped here.`,$g=e=>`Allow Cori to send to ${e}?`,jg=e=>`You said ${e}. I found two. Is it this one?`,Gg=e=>`I couldn't find an address for ${e}. What is it?`,zg="Allow Cori to submit this quiz?",Wg={busy:"I'm already working on a task like this. Stop it first, or wait until it's done.",blocked_site:"That site is on your blocked list, so I won't work there.",not_ready:"I can't do that kind of task yet.",no_plan:"I couldn't work out a plan for that. Try saying it another way."},Kg="Sure, here's what I'll do.",Vg="Sure, I'll look into it.",qg="Okay, I won't do that.";var y={};Ho(y,{ACCEPT:()=>vb,ALLOW:()=>gb,ALLOW_FOR_TASK:()=>bb,ALLOW_SAVE_EVENT:()=>fb,ALLOW_SEND_GMAIL:()=>pb,CLOSE:()=>Ab,CONTROLLED:()=>Yg,COPY:()=>Hb,DID_IT_GO_IN:()=>Rb,FIELD_LABELS:()=>wb,GO_BACK:()=>Ib,GO_TO_CHAT:()=>eb,HAND_BACK:()=>Qg,LOOKS_GOOD:()=>Pb,MENU_ASK:()=>Bb,MENU_REWRITE:()=>Fb,MODE_GRAMMAR:()=>Za,MODE_IMPROVE:()=>Xa,MODE_REWRITE:()=>Ja,MORE_FORMAL:()=>Sb,NOTHING_TO_CHANGE:()=>Mb,REWRITING:()=>xb,REWRITTEN:()=>Eb,SHORTER:()=>_b,SITE_NAMES:()=>yb,STEP_LINES:()=>ob,STOP:()=>tb,TAKE_OVER:()=>Zg,TRY_AGAIN:()=>kb,UNDO:()=>Cb,WAITING_FOR_YOU:()=>nb,WORKING_ON_TASK:()=>Xg,YES:()=>Tb,YOU_HAVE_CONTROL:()=>rb,allowChoose:()=>ub,allowFill:()=>db,allowInvite:()=>mb,allowOpenHost:()=>lb,allowOpenLink:()=>cb,allowPress:()=>ab,allowSubmit:()=>hb,answeringQuestion:()=>ib,controlledWorker:()=>Jg,copiedPaste:()=>Nb,modeName:()=>Lb,pasteLine:()=>Db,pressCopy:()=>Ob,readingHost:()=>sb});var Yg="Controlled by Cori",Jg=e=>`Controlled by Cori, worker ${e}`,Xg="Working on task",Zg="Take over",Qg="Hand back",eb="Go to chat",tb="Stop",rb="You have control",nb="Waiting for you",ob={openGmail:"Opening Gmail",findEmails:"Finding your recent emails",writeEmail:"Writing the email",fillEmail:"Filling in the email",saveDraft:"Saving the draft",send:"Sending",openCalendar:"Opening Google Calendar",writeEvent:"Writing the event",saveEvent:"Saving the event",rewrite:"Rewriting in your style",look:"Looking at the page"},ib=(e,t)=>`Answering question ${e} of ${t}`,sb=e=>`Reading ${e}`,ab=(e,t)=>`Allow Cori to press ${e} in ${t}`,cb=(e,t)=>`Allow Cori to open ${e} in ${t}`,lb=e=>`Allow Cori to open ${e}`,db=(e,t)=>`Allow Cori to fill in ${e} ${e===1?"field":"fields"} in ${t}`,ub=(e,t)=>`Allow Cori to choose ${e} in ${t}`,pb="Allow Cori to press Send in Gmail",fb="Allow Cori to save this event in Google Calendar",mb=e=>`Allow Cori to send invitations to ${e}`,hb=e=>`Allow Cori to submit this form in ${e}`,gb="Allow",bb="Allow for this task",wb={to:"To",cc:"Cc",subject:"Subject",body:"Message",title:"Title",when:"When",where:"Where",guests:"Guests",address:"Address"},yb={gmail:"Gmail",calendar:"Google Calendar",docs:"Google Docs"},xb="Rewriting in your style",vb="Accept",kb="Try again",_b="Shorter",Sb="More formal",Eb="Rewritten",Cb="Undo",Rb="Did it go in right?",Tb="Yes",Ab="Close",Pb="Looks good",Ib="Go back",Mb="Nothing to change",Ja="Rewrite",Xa="Improve",Za="Fix grammar only";function Lb(e){return e==="grammar"?Za:e==="improve"?Xa:Ja}var pi=(e,t)=>`${e?"Cmd":"Ctrl"}+${t}`,Ob=e=>`Press ${pi(e,"C")} so I can read your selection.`,Nb=e=>`Copied. Press ${pi(e,"V")} to replace your selection.`,Db=e=>`Copy it, then press ${pi(e,"V")} over your selection.`,Hb="Copy",Fb="Rewrite with Cori",Bb="Ask Cori";var C={};Ho(C,{CAPTCHA_FIRST:()=>gw,COPIED:()=>ew,COPY:()=>Qb,COPY_TITLE:()=>zb,DONE:()=>Xb,FILL_IN:()=>Zb,FILL_TITLE:()=>Gb,FROM_LINE:()=>sw,FROM_YOU:()=>lw,GO_ON:()=>Jb,MENU_FILL:()=>kw,NOT_NOW:()=>Yb,NOT_SENT:()=>vw,ON_PAGE:()=>cw,PAGE_ERRORS:()=>nw,PAGE_STUCK:()=>ww,REQUIRED:()=>rw,REVIEW_TITLE:()=>jb,SECTION_BLANK:()=>Kb,SECTION_FILLED:()=>Wb,SECTION_YOURS:()=>Vb,SHOW_ME:()=>tw,SIGN_IN_FIRST:()=>hw,STEP_LINES:()=>fw,SUBMIT:()=>qb,WHY:()=>dw,applyOn:()=>pw,fillOn:()=>uw,filledCount:()=>yw,filling:()=>mw,fromMemory:()=>iw,leftCount:()=>xw,pageOf:()=>ow,personLed:()=>bw,writtenFrom:()=>aw});var jb="Check before you send",Gb="Check what Cori will fill in",zb="Your details to copy",Wb="Filled",Kb="Left blank",Vb="Left for you",qb="Submit",Yb="Not now",Jb="Go on",Xb="Done",Zb="Fill in",Qb="Copy",ew="Copied",tw="Show me",rw="Required",nw="The form says",ow=e=>`Page ${e}`,iw=e=>`From memory: ${e}`,sw="From your request",aw=e=>`Written by Cori from ${e} ${e===1?"memory":"memories"}. Read it first.`,cw="Already on the page",lw="You put this in",dw={no_memory:"Memory has nothing for this",two_fit:"Two answers fit. Choose one.",no_option:"None of the choices matches what memory has",not_written:"I couldn't write this from what I know",sensitive:"This one is yours to answer",file:"Add your file here",secret:"Coere never fills passwords or codes",payment:"Coere never fills card or ID numbers",consent:"You agree to this yourself",person_led:"Copy it in yourself",not_held:"The page didn't take this. Check it"},uw=e=>`Fill this form on ${e}`,pw=e=>`Apply on ${e}`,fw={read:"Reading the form",job:"Reading the job",next:"Going to the next page",back:"Going back a page",review:"Waiting for you to check",submit:"Sending the form"},mw=e=>`Filling in ${e}`,hw="Sign in or create your account yourself, then press Hand back.",gw="This page wants to check you're a person. Finish that, then press Hand back.",bw=e=>`${e} doesn't allow tools to apply for you. Here are your details to copy.`,ww="This page won't go on yet. Check what it says, then answer here.",yw=e=>`Filled ${e} ${e===1?"field":"fields"}.`,xw=e=>`${e} left for you.`,vw="Not sent. Check it and press Submit when you are ready.",kw="Fill with Coere";var St=e=>{let{lines:t=[],...r}=e;return{name:null,chips:[],undoUntil:null,reason:null,...r,lines:t.slice(0,3)}},fi=e=>`${y.FIELD_LABELS.to}: ${e}`,mi=e=>`${y.FIELD_LABELS.subject}: ${e}`;function Qa(e,t,r){return St({outcome:"draft_saved",lines:[fi(e),mi(t)],chips:["open","delete_draft"],undoUntil:r})}function ec(e,t,r,n){return St(n===null?{outcome:"sent",name:e,lines:[fi(t),mi(r),A.NO_UNDO_SENT],chips:["open"]}:{outcome:"sent",name:e,lines:[fi(t),mi(r)],chips:["open","undo_send"],undoUntil:n})}function tc(e,t,r,n){return St({outcome:"event_added",lines:[e,t,...r?[A.NO_UNDO_INVITES]:[]],chips:["open","delete_event"],undoUntil:n})}function Et(e,t=[]){return St({outcome:e,lines:t})}function rc(e,t){return St({outcome:"done",lines:[...t,A.noUndoOn(e)],chips:["open"]})}function me(e,t=[],r=!0){return St({outcome:"stuck",lines:t,chips:e==="bolt"&&r?["open","try_pro"]:["open"],reason:"stuck"})}function Me(e,t=[],r={chips:[],undoUntil:null}){let n=e==="off"?[A.STOPPED_OFF]:[];return St({outcome:"stopped",reason:e,lines:[...n,...t],chips:r.chips,undoUntil:r.undoUntil})}var nc=e=>A.resultTitle(e.outcome,e.name);var B=class extends Error{constructor(r){super(r.outcome);this.result=r}};function Ct(e){return Me("forbidden",[e==="captcha"?A.CAPTCHA:A.needsYou(e)])}var je=()=>Me("injection",[A.INJECTION]);function hi(e,t,r){return e.fail==="sign_in"?new B(Me("forbidden",[r])):e.fail==="check"&&Array.isArray(e.data.strangers)&&e.data.strangers.length>0?new B(je()):new B(me(t,[],e.data.pressed!==!0))}function Qe(e,t,r){if(!e.held)throw hi(e,t,r);return e}var _w=["read","snapshot","do","settle","marks","overlay","recipe","picture","form"],Sw=["stale_element","not_found","refused","timeout","detached","internal"],Ew=["take_over","hand_back","go_to_chat","stop"],Cw=["accept","try_again","shorter","more_formal","close","undo","yes","looks_good","go_back","mode_rewrite","mode_improve","mode_grammar","copy","pasted"],Rw=["allow","allow_task","stop"];function ic(e){return!J(e)||typeof e.id!="string"||typeof e.ok!="boolean"||!_w.includes(e.type)?null:e.ok?"result"in e?e:null:Sw.includes(e.error)?e:null}function Tw(e){if(!J(e))return null;if(e.kind==="bar"&&ke(Ew,e.button))return{kind:"bar",button:e.button};if(e.kind==="rewrite"&&ke(Cw,e.button))return{kind:"rewrite",button:e.button};if(e.kind!=="card"||typeof e.step!="number"||!Number.isInteger(e.step))return null;let t=Aw(e.edited);return ke(Rw,e.choice)?{kind:"card",step:e.step,choice:e.choice,edited:t}:typeof e.choice=="number"&&Number.isInteger(e.choice)&&e.choice>=0?{kind:"card",step:e.step,choice:e.choice,edited:t}:null}function Aw(e){if(!J(e))return{};let t=Object.entries(e).filter(r=>r[0].length<=40&&typeof r[1]=="string");return Object.fromEntries(t.slice(0,120).map(([r,n])=>[r,n.slice(0,4e3)]))}function sc(e){if(!J(e))return null;if(e.type==="person"&&(e.input==="pointer"||e.input==="key"))return{type:"person",input:e.input};if(e.type==="navigated"&&typeof e.url=="string")return{type:"navigated",url:e.url};if(e.type==="rewrite"&&(e.end==="accepted"||e.end==="reverted"||e.end===null)&&Number.isInteger(e.left)&&e.left>=0)return{type:"rewrite",end:e.end,left:e.left};if(e.type!=="press")return null;let t=Tw(e.press);return t?{type:"press",press:t}:null}function ac(e){if(!J(e)||e.type!=="pick"||typeof e.id!="string"||typeof e.description!="string"||!Array.isArray(e.candidates))return null;let t=e.candidates.filter(r=>J(r)&&Number.isInteger(r.n)&&typeof r.role=="string"&&typeof r.name=="string"&&(r.heading===null||typeof r.heading=="string")).slice(0,20);return{type:"pick",id:e.id,description:e.description.slice(0,200),candidates:t}}var oc=e=>e.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>1);function yn(e,t){let r=new Set(oc(e));return t.map(n=>({e:n,score:oc(`${n.name} ${n.role}`).filter(o=>r.has(o)).length})).filter(n=>n.score>0).sort((n,o)=>o.score-n.score).slice(0,20).map(({e:n})=>({n:n.n,role:n.role,name:n.name,heading:n.heading}))}var Rt=class extends Error{constructor(r){super(r);this.code=r}},xn=class{constructor(t,r){this.port=t;this.handlers=r;t.onMessage.addListener(n=>this.receive(n)),t.onDisconnect.addListener(()=>this.closed())}waiting=new Map;next=0;open=!0;get isOpen(){return this.open}call(t,r,n){if(!this.open)return Promise.reject(new Rt("detached"));let o=`p${++this.next}`;return new Promise((i,s)=>{let a=setTimeout(()=>{this.waiting.delete(o),s(new Rt("timeout"))},n);this.waiting.set(o,{resolve:i,reject:s,timer:a});try{this.port.postMessage({...r,id:o,type:t})}catch{this.closed()}})}close(){if(this.open){try{this.port.disconnect()}catch{}this.closed()}}receive(t){let r=ic(t);if(r){let i=this.waiting.get(r.id);if(!i)return;this.waiting.delete(r.id),clearTimeout(i.timer),r.ok?i.resolve(r.result):i.reject(new Rt(r.error));return}let n=ac(t);if(n){this.handlers.onPick(n.description,n.candidates).catch(()=>null).then(i=>{let s=i!==null&&n.candidates.some(c=>c.n===i),a={type:"picked",id:n.id,n:s?i:null};this.open&&this.port.postMessage(a)});return}let o=sc(t);o&&this.handlers.onEvent(o)}closed(){if(this.open){this.open=!1;for(let t of this.waiting.values())clearTimeout(t.timer),t.reject(new Rt("detached"));this.waiting.clear(),this.handlers.onClose()}}};var Pw=new Set(["running","waiting","taken_over"]),he=e=>Pw.has(e.status);function vn(e,t){if(!he(e))return e;switch(t.type){case"step":return e.status==="taken_over"?e:{...e,status:"running",step:t.step,tier:t.tier,pending:null};case"wait":return e.status==="taken_over"?e:{...e,status:"waiting",pending:t.pending};case"answered":return e.status==="waiting"?{...e,status:"running",pending:null}:e;case"take_over":return{...e,status:"taken_over",pending:null};case"hand_back":return e.status==="taken_over"?{...e,status:"running"}:e;case"spent":return Number.isFinite(t.micros)&&t.micros>0?{...e,spentMicros:e.spentMicros+Math.round(t.micros)}:e;case"screenshot":return{...e,screenshots:e.screenshots+1};case"tab":return{...e,tabId:t.tabId,groupId:t.groupId};case"end":return{...e,status:t.status,pending:null};case"restarted":return{...e,status:"stopped",pending:null}}}function cc(e){return{runId:e.runId,kind:e.kind,site:e.site,tabId:e.tabId,groupId:null,parentId:e.parentId??null,worker:e.worker??null,convId:e.convId,level:e.level,model:e.model,step:0,tier:e.tier,status:"running",pending:null,spentMicros:0,screenshots:0,startedAt:e.now}}var lc=(e,t=!1)=>({site:e,stepLine:"",card:null,rewrite:null,result:null,cardOnly:t,hidden:!1});function Iw(e,t){return t.result?"result":e.status==="taken_over"?"taken_over":e.status==="waiting"?"waiting":"working"}function dc(e,t,r){let n=t.result!==null;return{visible:!t.hidden&&(t.cardOnly?t.rewrite!==null:!n||r||t.rewrite!==null),glow:e.status==="taken_over"?"still":"working",bar:{mode:Iw(e,t),step:t.stepLine,worker:e.worker,result:t.result?nc(t.result):null},card:t.hidden||n||e.status!=="waiting"?null:t.card,rewrite:t.hidden?null:t.rewrite,rewriteAt:null,cardOnly:t.cardOnly}}function gi(e,t){return t.result===null&&e.status==="waiting"?t.card:null}function bi(e,t){return{runId:e.runId,site:t.site,status:e.status,step:t.stepLine,preview:null,result:t.result}}var de=class extends Error{constructor(r){super(r);this.reason=r}},Nr=class extends Error{},Mw="The person took over the page and handed it back. Keep every answer and field they changed, and carry on from the page as it is now.",kn=class{constructor(t,r,n,o,i,s,a){this.deps=t;this.state=r;this.view=n;this.line=o;this.plan=i;this.budget=s;this.origin=a}link=null;allowedForTask=!1;undo=null;notes=[];handedBack=!1;handBacks=0;calls=0;resultShowing=!1;blocked=[];given=[];stopReason=null;card=null;edits={};rewrite=null;resume=[];interrupts=new Set;takenAt=0;get stopped(){return this.stopReason}get actCall(){return{runId:this.state.runId,worker:this.state.worker,model:this.state.model}}get fields(){return Object.fromEntries(this.plan.fields.map(t=>[t.name,t.value]))}async event(t){this.state=vn(this.state,t),await this.deps.store.put(this.state),await this.redraw(),this.deps.publish(this)}async redraw(){this.link?.isOpen&&await this.link.call("overlay",{state:dc(this.state,this.view,this.resultShowing)},3e3).catch(()=>{})}async checkpoint(){for(;this.state.status==="taken_over"&&this.stopReason===null;)await new Promise(t=>this.resume.push(t));if(this.stopReason!==null)throw new de(this.stopReason);if(this.budget.overWall(this.deps.now())&&this.stop("budget"),this.stopReason!==null)throw new de(this.stopReason)}interrupted(){let t=()=>{},r=new Promise(n=>t=n);return this.interrupts.add(t),{done:r,off:()=>this.interrupts.delete(t)}}cut(){for(let t of this.interrupts)t();this.interrupts.clear(),this.deps.brain["memory.act.abort"]({runId:this.state.runId})}stop(t){if(!(this.stopReason!==null||!he(this.state))){this.stopReason=t,this.cut(),this.card?.reject(new de(t)),this.card=null,this.rewrite?.reject(new de(t)),this.rewrite=null;for(let r of this.resume.splice(0))r()}}async takeOver(){if(!he(this.state)||this.state.status==="taken_over"||this.view.cardOnly)return!1;this.cut(),this.card?.reject(new Nr),this.card=null,this.takenAt=this.deps.now(),await this.event({type:"take_over"});let t=this.takenAt;return setTimeout(()=>{this.state.status==="taken_over"&&this.takenAt===t&&this.stop("takeover_timeout")},se.takeoverMs),!0}async handBack(){if(this.state.status!=="taken_over")return!1;this.handedBack=!0,this.handBacks+=1,this.notes.push(Mw),await this.event({type:"hand_back"});for(let t of this.resume.splice(0))t();return!0}waitForAnswer(t){return this.stopReason!==null?Promise.reject(new de(this.stopReason)):new Promise((r,n)=>{this.card={step:t,resolve:r,reject:n}})}answer(t,r,n={}){if(!this.card||this.card.step!==t)return!1;let o=this.card;return this.card=null,this.edits=n,o.resolve(r),!0}takeEdits(){let t=this.edits;return this.edits={},t}waitForRewrite(){return this.stopReason!==null?Promise.reject(new de(this.stopReason)):new Promise((t,r)=>this.rewrite={resolve:t,reject:r})}pressRewrite(t){let r=this.rewrite;this.rewrite=null,r?.resolve(t)}};var Dr={"mail.google.com":{recipe:"gmail",site:{name:y.SITE_NAMES.gmail,icon:"gmail"}},"calendar.google.com":{recipe:"calendar",site:{name:y.SITE_NAMES.calendar,icon:"calendar"}},"docs.google.com":{recipe:"docs",site:{name:y.SITE_NAMES.docs,icon:"docs"}}};function Ge(e){try{return new URL(e).hostname.toLowerCase()||null}catch{return null}}function or(e){try{let t=new URL(e);return t.protocol==="https:"||t.protocol==="http:"?`${t.protocol}//${t.hostname.toLowerCase()}`:null}catch{return null}}function uc(e){let t=Ge(e)??"";return t==="docs.google.com"&&/^https:\/\/docs\.google\.com\/forms\//.test(e)?{name:"Google Forms",icon:"globe"}:Dr[t]?.site??{name:t,icon:"globe"}}function pc(e){return Object.values(Dr).find(t=>t.site.name===e)?.site??{name:e,icon:"globe"}}function fc(e){return Dr[Ge(e)??""]?.recipe??null}var mc=Dr["mail.google.com"].site,hc=Dr["calendar.google.com"].site;var ae={quick:5e3,settle:1e4,recipe:3e4},wi=class extends Error{};async function U(e,t,r=e.state.tier){await e.checkpoint(),e.view={...e.view,stepLine:t},await e.event({type:"step",step:e.state.step+1,tier:r})}async function Le(e,t){let r=await qa(e.deps.router,e.deps.chrome,e.deps.hub,t);if(r==="closed")throw new de("tab_closed");if(r==="no_permission")throw new de("no_permission");if(r==="no_port")throw new wi("no_port");e.link=new xn(r,{onEvent:n=>e.deps.onPageEvent(e,n),onPick:(n,o)=>Fw(e,n,o),onClose:()=>void Lw(e,t)}),await e.redraw()}async function Lw(e,t){let r=()=>e.state.status==="taken_over"&&e.stopped===null&&e.state.tabId===t&&!e.link?.isOpen;!r()||!await hn(e.deps.router,t,Ow)||r()&&await Le(e,t).catch(()=>{})}var Ow=15e3;async function W(e,t,r,n=ae.quick,o=!1){return o||await e.checkpoint(),e.link?.isOpen||await Le(e,e.state.tabId),e.link.call(t,r,n)}var Nw=e=>!e.held&&e.fail===null&&typeof e.data.navigate=="string"?e.data.navigate:null;async function Tt(e,t,r,n=!1){for(let o=0;o<3;o++){let i=await W(e,"recipe",{call:t},ae.recipe,n),s=Nw(i);if(s===null)return i;if(Ge(s)!==r||!s.startsWith("https://"))return{held:!1,fail:"check",data:{}};e.link?.close(),await e.deps.router.updateTab(e.state.tabId,{url:s})}return{held:!1,fail:"timeout",data:{}}}var Dw=()=>({ok:!1,failure:"aborted",usdMicros:0}),Hw=()=>({ok:!1,failure:"timeout",usdMicros:0});async function ge(e,t){for(;;){await e.checkpoint();let r=e.interrupted(),n,o=new Promise(s=>n=setTimeout(()=>s(Hw()),e.budget.callMs));e.calls+=1;let i=await Promise.race([t(),r.done.then(()=>Dw()),o]);if(clearTimeout(n),r.off(),i.usdMicros>0&&await e.event({type:"spent",micros:i.usdMicros}),!(!i.ok&&i.failure==="aborted"&&e.stopped===null&&e.state.status==="taken_over")){if(e.stopped!==null)throw new de(e.stopped);return i}}}async function Fw(e,t,r){if(r.length===0)return null;let n=await ge(e,()=>e.deps.brain["memory.act.pick"]({...e.actCall,description:t,candidates:r}));return n.ok?n.n:null}async function j(e,t,r){for(;;){await e.checkpoint(),e.view={...e.view,card:{...t,step:e.state.step}};let n=e.waitForAnswer(e.state.step);await e.event({type:"wait",pending:r});try{let o=await n;return e.view={...e.view,card:null},await e.event({type:"answered"}),o==="stop"&&e.stop("person"),o==="allow_task"&&(e.allowedForTask=!0),await e.checkpoint(),o}catch(o){if(e.view={...e.view,card:null},!(o instanceof Nr))throw o}}}function G(e,t){e.deps.audit.step(Ya(e.state,t,e.deps.now()))}var ir=e=>e instanceof Rt&&e.code==="detached";var gc=40,Bw=/@|https?:|www\.|\b(ignore|instead|instruction|cori|coere|assistant|system|you must|always|never)\b/i;function sr(e){let t=e.replace(/\s+/g," ").trim(),r=t.length>gc?`${t.slice(0,gc-3).trimEnd()}...`:t;return Bw.test(t)?`"${r.replace(/"/g,"'")}"`:r}function bc(e,t,r){let n=sr(t?.name||e.target);switch(e.action){case"navigate":return y.allowOpenHost(Ge(e.url??"")??r.name);case"type":return y.allowFill(1,r.name);case"select":return y.allowChoose(sr(e.option??""),r.name);case"click":return t?.flags.includes("submit")?y.allowSubmit(r.name):t?.role==="link"?y.allowOpenLink(n,r.name):y.allowPress(n,r.name);default:return y.allowPress(n,r.name)}}function wc(e,t,r,n){switch(e){case"unnamed_recipient":return A.allowSendTo(n??"");case"send_not_asked":return y.ALLOW_SEND_GMAIL;case"leaves_sites":return y.allowOpenHost(Ge(t.url??"")??r.name);case"irreversible":return y.allowSubmit(r.name)}}function X(e){return{step:e.step,site:e.site,line:e.line,reason:e.reason??null,fields:e.fields??[],allowForTask:e.allowForTask,choices:e.choices??[]}}function yc(e,t=3){return e.split(/\r?\n/).filter(r=>r.trim()!=="").slice(0,t).join(`
`)}var Oe=(e,t,r=!1)=>({label:e,value:t,editable:r});var vc=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,mt=e=>[...new Set((e.match(vc)??[]).map(t=>t.toLowerCase()))];function ar(e){return e.replace(vc," ").split(/,|;|\band\b|&/i).map(t=>t.trim()).filter(t=>t.length>0&&t.length<=60)}var xc=e=>e.toLowerCase().replace(/\s+/g," ").trim(),Uw=new Set(["professor","prof","dr","doctor","mr","mrs","ms","miss","mx","coach"]);function _n(e,t){let r=xc(e).replace(/\./g,"").split(" "),n=r.length>1?r.filter(s=>!Uw.has(s)):r,o=t.filter(s=>s.address!==null&&n.every(a=>xc(s.name).split(" ").includes(a))),i=new Set;return o.flatMap(s=>{let a=mt(s.address??"")[0];return a===void 0||i.has(a)?[]:(i.add(a),[{name:s.name,address:a}])})}function kc(e){let t=Array.isArray(e.data.matches)?e.data.matches:[],r=new Set;return t.flatMap(n=>{let o=n;return typeof o.address!="string"||mt(o.address).length!==1||r.has(o.address.toLowerCase())?[]:(r.add(o.address.toLowerCase()),[{name:typeof o.name=="string"?o.name.trim():"",address:o.address.toLowerCase()}])})}async function cr(e,t,r){if(r.length===1)return r[0];if(r.length===0)throw new B(Me(null,[A.noAddressFor(t)]));let n=await j(e,X({step:e.state.step,site:e.view.site,line:A.foundTwo(t),allowForTask:!1,choices:r.slice(0,4).map(o=>o.address)}),{verb:"type",role:"textbox",site:e.state.site});if(typeof n!="number"||!r[n])throw new B(Me("person"));return r[n]}var be=e=>({kind:e.kind,target:e.target,fields:e.fields.map(t=>({name:t.name,value:t.value}))});function lr(e){return{person:{name:"",timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,today:new Date(e).toISOString().slice(0,10)},style:[],facts:[],people:[],form:{}}}var $w="mail.google.com",jw=1200,ce=(e,t,r={})=>Tt(e,{recipe:"gmail",step:t,args:r},$w),ht=(e,t)=>Qe(t,e.state.model,A.GMAIL_SIGN_IN);async function _c(e,t,r,n,o){let i=new Set(mt(e.line)),s=mt(n).filter(l=>i.has(l)).map(l=>({name:l,address:l})),a=ar(n);s.length===0&&a.length===0&&n.trim()!==""&&a.push(n.trim());for(let l of a){let d=_n(l,t.people);if(d.length>0){s.push(await cr(e,l,d));continue}o.open||ht(e,await ce(e,"compose",{account:r})),o.open=!0,s.push(await cr(e,l,kc(ht(e,await ce(e,"to",{lookup:l})))))}let c=new Set;return s.filter(l=>!c.has(l.address)&&c.add(l.address))}async function Gw(e,t,r){if(!(await ce(e,"search",{query:`to:${t.address}`,account:r})).held)return[];let o=(await ce(e,"read_results",{limit:3})).data.rows,i=[];for(let[s,a]of(Array.isArray(o)?o:[]).slice(0,3).entries()){if(s>0&&!(await ce(e,"search",{query:`to:${t.address}`,account:r})).held)break;let c=await ce(e,"read_thread",{row:s}),d=(Array.isArray(c.data.messages)?c.data.messages:[]).filter(u=>typeof u.body=="string"&&String(u.from).toLowerCase()!==t.address),p=typeof a.subject=="string"?a.subject:"";for(let u of d.slice(0,1))i.push({subject:p,text:String(u.body).slice(0,jw)})}return i}var zw=/^\s*(reply|respond|write back)\b|\breply to\b/i;async function Ww(e,t){let r=mt(e.fields.to??"")[0],n=r?`from:${r}`:`in:inbox ${e.plan.target}`.slice(0,200);if(!(await ce(e,"search",{query:n,account:t})).held)return null;let o=(await ce(e,"read_results",{limit:1})).data.rows,i=Array.isArray(o)?o[0]:void 0;if(!i)return null;let s=await ce(e,"read_thread",{row:0}),c=(Array.isArray(s.data.messages)?s.data.messages:[]).at(-1),l=typeof c?.from=="string"?mt(c.from)[0]:void 0;if(!c||l===void 0||r!==void 0&&l!==r)return null;let d=typeof i.subject=="string"?i.subject:"";return{to:{name:typeof c.sender=="string"?c.sender:l,address:l},subject:d,source:typeof c.body=="string"?c.body:""}}async function Sc(e){let t=/^(yes|true)$/i.test(e.fields.send??"");await U(e,y.STEP_LINES.openGmail,"recipe");let r=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"email",plan:be(e.plan),names:ar(e.fields.to??""),sensitive:!1}).catch(()=>lr(e.deps.now())),n=await mn(e.deps.router,e.deps.chrome,"gmail");await e.event({type:"tab",tabId:n.tabId,groupId:n.groupId}),await Le(e,n.tabId);let o=Number(ht(e,await ce(e,"account")).data.account??n.account)||0;G(e,{action:"navigate",role:"page",tier:"recipe",allowed:!1,outcome:"held",byModel:!1});let i={open:!1},s=zw.test(e.line)?await Ww(e,o):null,a=s?[s.to]:await _c(e,r,o,e.fields.to??"",i),c=(await _c(e,r,o,e.fields.cc??"",i)).filter(pe=>!a.some(fe=>fe.address===pe.address)),l=a[0]??await cr(e,e.fields.to??"",[]),d=a.map(pe=>pe.address),p=c.map(pe=>pe.address);await U(e,y.STEP_LINES.findEmails);let u=s?[]:await Gw(e,l,o);await U(e,y.STEP_LINES.writeEmail);let f=await ge(e,()=>e.deps.brain["memory.act.write"]({...e.actCall,request:{kind:"email",line:e.line,plan:be(e.plan),person:r.person,style:r.style,facts:r.facts,samples:u,recipient:{name:l.name,address:l.address},source:s?.source??""}}));if(!f.ok&&f.failure==="injected")return je();if(!f.ok||f.written.kind!=="email")return me(e.state.model);let h=s&&!/^re:/i.test(f.written.email.subject)&&s.subject?{...f.written.email,subject:`Re: ${s.subject}`}:f.written.email,w=e.state.level==="review"&&!e.allowedForTask,x=[Oe(y.FIELD_LABELS.to,d.join(", ")),...p.length?[Oe(y.FIELD_LABELS.cc,p.join(", "))]:[]],b=[...x,Oe(y.FIELD_LABELS.subject,h.subject,!0),Oe(y.FIELD_LABELS.body,h.body,!0)],v=w&&await j(e,X({step:0,site:e.view.site,line:y.allowFill(b.length,e.view.site.name),fields:b,allowForTask:!0}),{verb:"type",role:"textbox",site:e.state.site})!=="stop",E=e.takeEdits(),P={subject:E[y.FIELD_LABELS.subject]??h.subject,body:E[y.FIELD_LABELS.body]??h.body};await U(e,y.STEP_LINES.fillEmail),ht(e,await ce(e,"compose",{account:o})),ht(e,await ce(e,"to",{to:d,cc:p}));let q=ht(e,await ce(e,"subject",{text:P.subject,...e.handedBack?{ifEmpty:!0}:{}}));if(typeof q.data.kept=="string"&&(P.subject=q.data.kept),ht(e,await ce(e,"body",{text:P.body})),G(e,{action:"type",role:"textbox",tier:"recipe",allowed:v,outcome:"held",byModel:!1}),!t)return await U(e,y.STEP_LINES.saveDraft),ht(e,await ce(e,"save_draft")),G(e,{action:"click",role:"button",tier:"recipe",allowed:!1,outcome:"held",byModel:!1}),e.undo={kind:"draft",subject:P.subject,account:o},Qa(d.join(", "),P.subject,e.deps.now()+se.undoMs);let Q=X({step:0,site:e.view.site,line:y.ALLOW_SEND_GMAIL,fields:[...x,Oe(y.FIELD_LABELS.subject,P.subject),Oe(y.FIELD_LABELS.body,yc(P.body))],allowForTask:!0}),ie=e.state.level==="review"&&!e.allowedForTask&&await j(e,Q,{verb:"click",role:"button",site:e.state.site})!=="stop";await U(e,y.STEP_LINES.send),ht(e,await ce(e,"send",{confirmed:!0,to:d,cc:p})),G(e,{action:"click",role:"button",tier:"recipe",allowed:ie,outcome:"held",byModel:!1});let V=await ce(e,"sent");return e.undo=V.data.undo===!0?{kind:"send"}:null,ec(l.name,d.join(", "),P.subject,V.data.undo===!0?e.deps.now()+yi:null)}var yi=3e4;function Kw(e,t){let r=t.reason==="no_permission"?[A.NEED_TO_LOOK]:[];return e.undo?.kind!=="send"?Me(t.reason,r):Me(t.reason,r,{chips:["open","undo_send"],undoUntil:e.deps.now()+yi})}function Vw(e,t){return t instanceof B?t.result:t instanceof de?Kw(e,t):me(e.state.model)}var qw=e=>e.outcome==="stuck"?"stuck":e.outcome==="stopped"?"stopped":"done";async function Ec(e,t,r){let n;try{n=await r(t)}catch(s){n=Vw(t,s)}t.view={...t.view,result:n,card:null},t.resultShowing=!0,await t.event({type:"end",status:qw(n)}).catch(()=>{}),await e.writeEnd(t,n);let o=t.deps.now(),i=n.undoUntil===null?0:Math.max(0,n.undoUntil-o);setTimeout(()=>{t.resultShowing=!1,t.redraw().then(()=>{t.view.rewrite?.state!=="done"&&t.link?.close()})},se.resultBarMs),t.view.rewrite?.state==="done"&&setTimeout(()=>t.link?.close(),Math.max(i,se.resultBarMs)),e.forget(t.state.runId,Math.max(i,se.undoMs))}var Cc=(e,t)=>({type:"task",runId:e.runId,site:e.site,result:t});async function Rc(e,t){try{let r={role:"cori",text:`${A.STARTING} ${A.STARTING_LINK}`,blocks:[Cc(t,null)],runId:t.runId},{conv:n,n:o}=await e["memory.chat.append"]({convId:t.convId,startedOn:"dashboard",fresh:!1,turn:r});return{convId:n.id,n:o}}catch{return null}}async function Tc(e,t,r,n){t&&await e["memory.chat.update"]({convId:t.convId,n:t.n,blocks:[Cc(r,n)]}).catch(()=>{})}var Yw="calendar.google.com",Hr=A.needsYou("sign_in"),dr=(e,t,r={})=>Tt(e,{recipe:"calendar",step:t,args:r},Yw);function Ac(e){let t=new Date(e.start);if(Number.isNaN(t.getTime()))return e.start;let r={weekday:"short",month:"short",day:"numeric"};return t.toLocaleString("en-US",e.allDay?r:{...r,hour:"numeric",minute:"2-digit"})}var Jw=[[/\b(new york|eastern|et|est|edt|boston|miami)\b/,"America/New_York"],[/\b(chicago|central|ct|cst|cdt|austin|dallas)\b/,"America/Chicago"],[/\b(denver|mountain|mt|mst|mdt)\b/,"America/Denver"],[/\b(los angeles|pacific|pt|pst|pdt|san francisco|seattle|california)\b/,"America/Los_Angeles"],[/\b(london|uk|bst)\b/,"Europe/London"],[/\b(utc|gmt)\b/,"UTC"]];function Xw(e){let t=e.toLowerCase();return/\b(time|zone|et|pt|ct|mt|est|pst|cst|mst|edt|pdt|cdt|mdt|utc|gmt|bst)\b/.test(t)?Jw.find(([r])=>r.test(t))?.[1]??null:null}async function Zw(e,t){let r=[];for(let n of ar(e.fields.who??""))r.push(await cr(e,n,_n(n,t)));return r}async function Qw(e,t,r){let n=new Set(r.map(o=>o.address));for(let o of t.filter(i=>!n.has(i.toLowerCase())))await j(e,X({step:0,site:e.view.site,line:A.allowSendTo(o),allowForTask:!1}),{verb:"type",role:"textbox",site:e.state.site})}async function Pc(e){await U(e,y.STEP_LINES.openCalendar,"recipe");let t=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"event",plan:be(e.plan),names:ar(e.fields.who??""),sensitive:!1}).catch(()=>lr(e.deps.now())),r=await Zw(e,t.people),n=Xw(e.line)??t.person.timeZone;await U(e,y.STEP_LINES.writeEvent);let o=await ge(e,()=>e.deps.brain["memory.act.write"]({...e.actCall,request:{kind:"event",line:e.line,plan:be(e.plan),person:{...t.person,timeZone:n},style:t.style,facts:t.facts,samples:[],recipient:{name:r[0]?.name??"",address:r[0]?.address??""},source:""}}));if(!o.ok&&o.failure==="injected")return je();if(!o.ok||o.written.kind!=="event")return me(e.state.model);let i=o.written.event,s=[...new Set([...r.map(x=>x.address),...i.guests.map(x=>x.toLowerCase())])];await Qw(e,s,r);let a=[Oe(y.FIELD_LABELS.title,i.title),Oe(y.FIELD_LABELS.when,Ac(i)),...i.where?[Oe(y.FIELD_LABELS.where,i.where)]:[],...s.length?[Oe(y.FIELD_LABELS.guests,s.join(", "))]:[]],l=e.state.level==="review"&&!e.allowedForTask&&await j(e,X({step:0,site:e.view.site,line:y.ALLOW_SAVE_EVENT,fields:a,allowForTask:!0}),{verb:"click",role:"button",site:e.state.site})!=="stop",d=await mn(e.deps.router,e.deps.chrome,"calendar");await e.event({type:"tab",tabId:d.tabId,groupId:d.groupId}),await Le(e,d.tabId);let p=Number(Qe(await dr(e,"account"),e.state.model,Hr).data.account??d.account)||0,u={title:i.title,start:i.start,end:i.end,zone:n,allDay:i.allDay,where:i.where,details:i.details};Qe(await dr(e,"open_editor",{account:p,...u}),e.state.model,Hr),s.length>0&&Qe(await dr(e,"guests",{guests:s}),e.state.model,Hr),Qe(await dr(e,"check",u),e.state.model,Hr),G(e,{action:"type",role:"textbox",tier:"recipe",allowed:l,outcome:"held",byModel:!1}),await U(e,y.STEP_LINES.saveEvent);let f=Qe(await dr(e,"save",{guests:s,invite:s.length>0,confirmed:!0}),e.state.model,Hr);G(e,{action:"click",role:"button",tier:"recipe",allowed:l,outcome:"held",byModel:!1});let h=await dr(e,"saved",{title:i.title}),w=typeof h.data.eventId=="string"?h.data.eventId:null;return e.undo=w?{kind:"event",eventId:w,account:p}:null,tc(i.title,Ac(i),f.data.invited===!0,e.deps.now()+se.undoMs)}var xi=new Set(["single","multiple","dropdown","scale","combobox"]);var ey=null,ty=()=>ey??=new RegExp([String.raw`\b(gender|sex|pronouns?|race|racial|ethnicity|ethnic|hispanic|latin[oax]|veterans?|military (spouse|status|service)|armed forces`,String.raw`disability|disabled|chronic (illness|conditions?)|medical (conditions?|history)|health (conditions?|status)|pregnan\w*`,String.raw`sexual orientation|transgender|lgbt\w*|religio\w*|marital status|married`,String.raw`convicted|conviction|felony|misdemeanou?r|criminal|arrest(ed)?|background check`,String.raw`national origin|country of birth|place of birth|age|years of age|how old`,String.raw`union member\w*|self[- ]identif\w*|equal (employment )?opportunity|eeo\w*|demographic\w*)\b`].join("|"),"i"),ry=/\b(equal (employment )?opportunity|eeo\w*|voluntary (self[- ]identification|disclosures?)|self[- ]identif\w*|demographic\w*|diversity|veteran|disability)\b/i,Ic=/^(wom[ae]n|m[ae]n|male|female|non[- ]?binary|genderqueer|transgender|cisgender|he\/him|she\/her|they\/them|(i am|i'm) (a |not a )?(protected )?veteran.*|asian|black( or african american)?|white|hispanic or latino|native hawaiian.*|american indian.*|two or more races|yes, i have a disability.*|no, i (do not|don't) have a disability.*|decline to self[- ]identify|i (do not|don't) wish to answer)$/i,ny=/\b(date of birth|birth ?date|birthday|dob)\b/i,Mc=/\b(password|passcode|passphrase|pin|security (question|answer|code)|one[- ]time (code|password)|verification code|2fa|otp)\b/i,Lc=/\b(card ?number|credit card|debit card|cvv|cvc|csc|expiry|expiration date|iban|routing( number)?|bank account|account number|sort code|swift|ssn|social security|social insurance|passport( number)?|tax id|tin|national id|driver'?s licen[cs]e( number)?)\b/i,oy=/\b(current-password|new-password|one-time-code)\b/,iy=/\bcc-/;function Oc(e,t="",r=[],n="form"){if(ty().test(e)||ry.test(t)||n==="apply"&&ny.test(e))return!0;let o=r.map(i=>i.trim()).filter(Boolean);return o.filter(i=>Ic.test(i)).length>=Math.min(2,o.length)&&o.some(i=>Ic.test(i))}function Sn(e,t){return e.kind==="file"?"file":e.kind==="password"||oy.test(e.autocomplete)||Mc.test(e.label)?"secret":e.kind==="payment"||iy.test(e.autocomplete)||Lc.test(e.label)?"payment":Oc(e.label,e.section,e.options,t)?"sensitive":e.kind==="consent"?"consent":null}function vi(e){return Mc.test(e)?"password":Lc.test(e)||/\b(my|your|the|a) card\b|\bcard (in|details|info)\b|\b(copay|pay|payment)\b/i.test(e)?"payment":null}var Nc=120;function sy(e){if(!e)return"";switch(e.kind){case"memory":return C.fromMemory(e.text.slice(0,160));case"line":return C.FROM_LINE;case"written":return C.writtenFrom(e.facts);case"page":return C.ON_PAGE;case"person":return C.FROM_YOU}}function ay(e,t){let r=e.plan,n=r.chosen.length>0?r.chosen.join(", "):r.value,o=r.status==="yours";return{id:e.field.id,label:e.field.label.slice(0,Nc)||e.field.name.slice(0,Nc),value:n,options:xi.has(e.field.kind)?e.field.options:[],multiple:e.field.kind==="multiple",note:r.why?C.WHY[r.why]:sy(r.source),page:e.page,required:e.field.required,editable:!t&&!o}}function ur(e,t,r,n){let o=t==="copy",i=e.map(s=>({k:s,row:ay(s,o)}));return{mode:t,filled:i.filter(({k:s})=>s.plan.status==="fill"||s.plan.status==="kept").map(s=>s.row),blank:i.filter(({k:s})=>s.plan.status==="blank").map(s=>s.row),yours:i.filter(({k:s})=>s.plan.status==="yours").map(s=>s.row),errors:r.slice(0,5),canSubmit:n}}function pr(e,t){let r=t.mode==="review"?y.allowSubmit(e.name):t.mode==="fill"?y.allowFill(t.filled.length,e.name):C.personLed(e.name);return{...X({step:0,site:e,line:r,allowForTask:t.mode==="fill",reason:t.mode==="review"?C.REVIEW_TITLE:null}),form:t}}function Dc(e,t){let r=new Map;for(let[n,o]of Object.entries(e)){let i=/^f(\d+)$/.exec(n)?.[1],s=i===void 0?void 0:t.find(c=>c.field.id===Number(i));if(!s||s.plan.status==="yours")continue;let a=o.trim();if(xi.has(s.field.kind)){let c=a.split(/\s*,\s*/).filter(Boolean),l=s.field.options.filter(d=>c.includes(d));(l.length>0||a==="")&&r.set(s.field.id,{value:"",chosen:l})}else r.set(s.field.id,{value:a,chosen:[]})}return r}async function At(e,t,r=ae.quick){return await W(e,"form",{call:t},r)}async function Re(e){return await W(e,"settle",{afterNavigation:!1},ae.settle).catch(()=>{}),At(e,{op:"read"})}function cy(e){return e.kind==="single"||e.kind==="scale"?{action:"check",role:"radio"}:e.kind==="multiple"?{action:"check",role:"checkbox"}:e.kind==="dropdown"||e.kind==="combobox"?{action:"select",role:"combobox"}:{action:"type",role:"textbox"}}async function En(e,t,r,n,o,i){if(Sn(t,o)!==null)return!1;await U(e,C.filling(t.label.slice(0,40)||t.name.slice(0,40)),"recipe");let s=await At(e,{op:"fill",id:t.id,value:r,chosen:n},ae.settle).catch(()=>({held:!1,error:""}));if(!s.held||s.error){let a=n.length===0?zo(r):null;a!==null&&(s=await At(e,{op:"fill",id:t.id,value:a,chosen:n},ae.settle).catch(()=>({held:!1,error:""})))}return G(e,{...cy(t),tier:"recipe",allowed:i,outcome:s.held?"held":"failed_check",byModel:!1}),s.held&&!s.error}function Fr(e,t,r){for(let n of e){let o=t.fields.find(p=>p.id===n.field.id);if(!o)continue;let i=o.value.trim(),s=o.chosen,a=n.plan.chosen.length>0?n.plan.chosen.join("|"):n.plan.value,c=s.length>0?s.join("|"):i,l=r.has(n.field.id);(n.plan.status==="fill"?c!==a&&(l||c!==""):c!==""&&n.plan.status==="blank")&&(n.plan={...n.plan,status:"kept",value:i,chosen:s,source:{kind:"person"},why:null})}}function ki(e,t,r,n,o){let i=[];for(let s of t.fields){let a=e.find(p=>p.field.id===s.id),c=r.find(p=>p.id===s.id),l=Sn(s,o),d=c&&l?{...c,status:"yours",value:"",chosen:[],source:null,why:l}:c;if(a)a.field=s;else if(d){let p={field:s,plan:d,page:n};e.push(p),i.push(p)}}return i}async function Dt(e,t,r){await U(e,t==="next"?C.STEP_LINES.next:C.STEP_LINES.back,"recipe");let n=!1,o=await At(e,{op:"go",to:t}).catch(s=>({moved:n=ir(s)}));if(G(e,{action:"click",role:"button",tier:"recipe",allowed:!1,outcome:o.moved?"held":"failed_check",byModel:!1}),!o.moved)return{moved:!1,page:r};await W(e,"settle",{afterNavigation:n},ae.settle).catch(()=>{});let i=await Re(e);return{moved:i.signature!==r.signature||i.url!==r.url,page:i}}function Hc(e){let t=e.filter(n=>n.plan.status==="fill").length,r=e.filter(n=>n.plan.status==="yours"||n.plan.status==="blank"&&n.field.required).length;return[C.filledCount(t),...r>0?[C.leftCount(r)]:[]]}var fr=(e,t=[])=>({outcome:"form_filled",name:null,lines:[...Hc(e),...t].slice(0,3),chips:["open"],undoUntil:null,reason:null}),Cn=e=>({outcome:"form_sent",name:null,lines:Hc(e),chips:["open"],undoUntil:null,reason:null});var ly=2;async function Rn(e,t,r,n,o){let i=Dc(t,r);if(i.size===0)return;for(let[l,d]of i){let p=r.find(u=>u.field.id===l);p.plan={...p.plan,status:d.value||d.chosen.length?"fill":"blank",value:d.value,chosen:d.chosen,source:{kind:"person"},why:d.value||d.chosen.length?null:p.plan.why}}if(!o.fillNow)return;let s=[...new Set([...i.keys()].map(l=>r.find(d=>d.field.id===l).page))].sort((l,d)=>d-l),a=n,c=await Re(e);for(let l of s){for(;a>l;){let d=await Dt(e,"back",c);if(!d.moved)break;c=d.page,a-=1}for(let d of r.filter(p=>p.page===a&&i.has(p.field.id)&&p.plan.status==="fill"))await En(e,d.field,d.plan.value,d.plan.chosen,o.mode,!0)&&o.ours.add(d.field.id)}for(;a<n&&(await Dt(e,"next",await Re(e))).moved;)a+=1}var _i=e=>[...e.errors,...e.fields.filter(t=>t.error).map(t=>`${t.label}: ${t.error}`)];async function Fc(e,t,r,n){let o=t,i=_i(t);for(let s=0;s<ly;s++){await U(e,C.STEP_LINES.review,"recipe");let a=await j(e,pr(e.view.site,ur(r.kept,"review",i,o.buttons.submit)),{verb:"click",role:"button",site:e.state.site});if(Fr(r.kept,await Re(e),r.ours),await Rn(e,e.takeEdits(),r.kept,r.pageNo,{mode:r.mode,ours:r.ours,fillNow:!0}),a!=="allow"||!o.buttons.submit)return fr(r.kept,[C.NOT_SENT]);await U(e,C.STEP_LINES.submit,"recipe");let c=await At(e,{op:"submit"}).catch(d=>({pressed:ir(d)}));if(G(e,{action:"click",role:"button",tier:"recipe",allowed:!0,outcome:c.pressed?"held":"failed_check",byModel:!1}),!c.pressed)return fr(r.kept,[C.NOT_SENT]);await W(e,"settle",{afterNavigation:!0},ae.settle).catch(()=>{}),o=await Re(e),o.gate==="captcha"&&(e.view={...e.view,stepLine:C.CAPTCHA_FIRST},await e.takeOver(),await e.checkpoint(),o=await Re(e));let l=o.signature!==n[r.pageNo-1]&&!o.buttons.submit;if(o.sent||l&&_i(o).length===0)return Cn(r.kept);i=_i(o)}return fr(r.kept,[C.NOT_SENT])}var dy=12,uy=3,Uc=e=>({id:e,status:"blank",value:"",chosen:[],source:null,why:"no_memory",candidates:[]});async function Bc(e,t){let r=t;for(let n=0;n<uy;n++){if(r.speaks)throw new B(je());if(r.gate===null)return r;e.view={...e.view,stepLine:r.gate==="captcha"?C.CAPTCHA_FIRST:C.SIGN_IN_FIRST},await e.takeOver(),await e.checkpoint(),r=await Re(e)}throw r.speaks?new B(je()):new B(Ct(r.gate==="captcha"?"captcha":"sign_in"))}async function py(e,t,r,n){let o=[];if(t.fields.length>0){let i=await ge(e,()=>e.deps.brain["memory.act.form"]({...e.actCall,mode:r,line:e.line,plan:be(e.plan),fields:t.fields,ours:[],job:n}));ki(o,t,i.ok?i.plans:t.fields.map(s=>Uc(s.id)),1,r)}return await j(e,pr(e.view.site,ur(o,"copy",[],!1)),{verb:"ask",role:"",site:e.state.site}),{outcome:"done",name:null,lines:[C.personLed(e.view.site.name)],chips:["open"],undoUntil:null,reason:null}}async function fy(e,t,r){let n=await ge(e,()=>e.deps.brain["memory.act.form"]({...e.actCall,mode:r.mode,line:e.line,plan:be(e.plan),fields:t.fields,ours:[...r.ours],job:r.job})),o=ki(r.kept,t,n.ok?n.plans:t.fields.map(c=>Uc(c.id)),r.pageNo,r.mode),i=e.state.level==="review"&&!e.allowedForTask;i&&o.some(c=>c.plan.status==="fill")&&(await j(e,pr(e.view.site,ur(o,"fill",[],!1)),{verb:"type",role:"textbox",site:e.state.site}),await Rn(e,e.takeEdits(),r.kept,r.pageNo,{mode:r.mode,ours:r.ours,fillNow:!1}));let s=e.handBacks;for(let c of o)e.handBacks!==s&&(Fr(r.kept,await Re(e),r.ours),s=e.handBacks),c.plan.status==="fill"&&(await En(e,c.field,c.plan.value,c.plan.chosen,r.mode,i)?r.ours.add(c.field.id):c.plan={...c.plan,status:"blank",why:"not_held"});let a=await Re(e);return e.handBacks!==s&&Fr(r.kept,a,r.ours),a}async function Si(e){let t=e.state.kind==="job_apply"?"apply":"form",r=vi([e.line,e.fields.details??"",e.fields.fields??""].join(" "));if(r)throw new B(Ct(r));await Le(e,e.state.tabId),await U(e,t==="apply"?C.STEP_LINES.job:C.STEP_LINES.read,"recipe");let n=await Bc(e,await Re(e));n.app!=="generic"&&n.appName&&(e.view={...e.view,site:{...e.view.site,name:n.appName}});let o=t==="apply"&&!n.personLed?await At(e,{op:"job"}).catch(()=>null):null,i={mode:t,job:o,kept:[],ours:new Set,pageNo:1},s=[];for(let a=0;a<dy;a++){if(n=await Bc(e,n),n.personLed)return py(e,n,t,o);if(n.sent&&i.kept.length>0)return Cn(i.kept);if(n.fields.length===0&&n.buttons.next){n=(await Dt(e,"next",n)).page;continue}if(s[i.pageNo-1]=n.signature,n=await fy(e,n,i),!n.buttons.next||n.buttons.submit)break;e.state.level==="review"&&!e.allowedForTask&&await j(e,X({step:0,site:e.view.site,line:y.allowPress("Next",e.view.site.name),allowForTask:!0}),{verb:"click",role:"button",site:e.state.site});let c=await Dt(e,"next",n);if(c.moved)n=c.page;else{await j(e,pr(e.view.site,ur(i.kept,"review",[C.PAGE_STUCK,...n.errors,...n.fields.filter(d=>d.error).map(d=>`${d.label}: ${d.error}`)],!1)),{verb:"ask",role:"",site:e.state.site}),await Rn(e,e.takeEdits(),i.kept,i.pageNo,{mode:t,ours:i.ours,fillNow:!0});let l=await Dt(e,"next",await Re(e));if(!l.moved)return fr(i.kept,[C.PAGE_STUCK]);n=l.page}i.pageNo+=1}return Fc(e,n,i,s)}var my=new Set(["click","type","select","check"]);async function $c(e,t,r){let n=t.el??t.mark,o=n===null?void 0:r.elements.find(a=>a.n===n);if(o||!my.has(t.action))return o??null;let i=yn(t.target,r.elements);if(i.length===0)return null;let s=await ge(e,()=>e.deps.brain["memory.act.pick"]({...e.actCall,description:t.target,candidates:i}));return s.ok&&s.n!==null?r.elements.find(a=>a.n===s.n)??null:null}async function jc(e,t,r,n,o,i){if(t.action==="navigate"){let c=new Set([i,...n.elements.flatMap(l=>l.href?[l.href]:[])]);if(!t.url||!c.has(t.url))throw new B(je())}let s=e.deps.policies.guard({step:t,element:r,snapshot:n,kind:e.state.kind,level:e.state.level,tier:e.state.tier,line:e.line,fields:e.fields,url:n.url,sites:o,blocked:e.blocked,named:mt(e.line),given:e.given,worker:e.state.worker!==null,allowedForTask:e.allowedForTask}),a={verb:t.action,role:r?.role??"",site:e.state.site};switch(s.kind){case"go":return!1;case"stop":throw new B(s.reason==="injection"||s.reason==="outside_vocabulary"?je():Ct(s.reason));case"confirm":return await j(e,X({step:0,site:e.view.site,line:wc(s.why,t,e.view.site,s.address),allowForTask:!1}),a),!0;case"review":return await j(e,X({step:0,site:e.view.site,line:bc(t,r,e.view.site),allowForTask:!0}),a),!0}}function hy(e){let t=e.changed;return t?[...t.added.map(r=>`+ ${r.text}`),...t.removed.map(r=>`- ${r.text}`),...t.text].join(`
`):""}async function Gc(e,t,r){if(t.action==="navigate")return e.link?.close(),await e.deps.router.updateTab(e.state.tabId,{url:t.url}),!0;let n=r?{...t,el:r.n,mark:null}:t,o=await W(e,"do",{step:n},ae.settle).catch(a=>{if(ir(a))return{ran:!0,checked:null,navigated:!0};throw a});if(await W(e,"settle",{afterNavigation:o.navigated},ae.settle).catch(()=>{}),!o.ran||o.checked===!1)return!1;if(o.checked===!0||o.navigated||!t.expect)return!0;let i=await W(e,"snapshot",{step:e.state.step,steps:e.state.step,viewportOnly:!0}),s=await ge(e,()=>e.deps.brain["memory.act.check"]({...e.actCall,expect:t.expect,diff:hy(i)}));return!(s.ok&&s.verdict==="failed")}var zc=(e,t)=>{let r=or(t);return r===null||e.blocked.includes(r)};var Ei=e=>e.elements.length===0||e.canvas===!0;async function Wc(e,t){let r=e.deps.now(),n={steps:e.state.step,calls:e.calls,spentMicros:e.state.spentMicros,screenshots:e.state.screenshots};if(!e.budget.mayShoot(n,r))return null;let o=await e.deps.router.getTab(e.state.tabId);if(!o||!await e.deps.chrome.tabActive(e.state.tabId))return null;await W(e,"marks",{show:!0,grid:Ei(t)}),e.view={...e.view,hidden:!0},await e.redraw();try{let i=await e.deps.chrome.capture(o.windowId,70);return e.budget.shot(r),i&&await e.event({type:"screenshot"}),i}finally{e.view={...e.view,hidden:!1},await e.redraw(),await W(e,"marks",{show:!1,grid:!1}).catch(()=>{})}}var gy="Your last two steps changed nothing. Try another way.",by=new Set(["click","type","select","check","key","scroll","navigate"]),wy=new Set(["type","select","check"]);function yy(e){let t=2166136261;for(let r of e.join(`
`))t=Math.imul(t^r.charCodeAt(0),16777619)>>>0;return t.toString(36)}async function xy(e){let t={steps:e.state.step,calls:e.calls,spentMicros:e.state.spentMicros,screenshots:e.state.screenshots},r=e.budget.ask(t);r&&(await j(e,X({step:0,site:e.view.site,line:A.KEEP_GOING_LINE,allowForTask:!1,choices:[A.KEEP_GOING]}),{verb:"ask",role:"",site:e.state.site}),e.budget.grant(r))}async function vy(e,t){if(t.next==="end_stuck")throw new B(me(e.state.model));return t.next==="ask"&&await j(e,X({step:0,site:e.view.site,line:A.KEEP_GOING_LINE,allowForTask:!1,choices:[A.KEEP_GOING]}),{verb:"ask",role:"",site:e.state.site}),{hint:t.next==="fresh_snapshot"?gy:"",tier:t.next==="tier_up"?"vision":"snapshot"}}async function ky(e,t){switch(t.action){case"done":return rc(e.view.site.name,[]);case"fail":throw new B(me(e.state.model));case"look":return"look";case"ask":{let r=(t.choices??[]).slice(0,Xe.choices).map(sr),n=await j(e,X({step:0,site:e.view.site,line:sr(t.question??""),allowForTask:!1,choices:r}),{verb:"ask",role:"",site:e.state.site});return e.notes.push(typeof n=="number"?`The person chose ${r[n]??""}`:"The person said go on"),null}case"extract":{let r=await W(e,"read",{read:"text",section:t.what},ae.settle);return"main"in r&&e.notes.push(r.main.slice(0,Xe.extractChars)),null}case"wait":return t.for?await W(e,"settle",{afterNavigation:!1},ae.settle):await new Promise(r=>setTimeout(r,Math.min(Math.max(t.ms??0,0),Xe.waitMs))),null;default:return null}}var _y=(e,t,r,n)=>({url:e.url,signature:e.signature,action:t.action,target:t.target,held:r,notes:yy(n)});async function Sy(e){if(e.state.kind!=="form_fill")return[];let t=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"form",plan:be(e.plan),names:[],sensitive:!1}).catch(()=>null),r=Object.entries(t?.form??{}).filter(([,n])=>n.trim()!=="");return e.given=r.map(([,n])=>n),r.map(([n,o])=>`The person's ${n.replace(/_/g," ")}: ${o}`.slice(0,Xe.noteChars))}async function Kc(e){await Le(e,e.state.tabId);let t=await Sy(e),r=(await e.deps.router.getTab(e.state.tabId))?.url??"",n=[or(r)].filter(l=>l!==null),o=[],i=[],[s,a,c]=[0,"","snapshot"];for(;;){await xy(e),await U(e,e.view.stepLine,c),await W(e,"settle",{afterNavigation:!1},ae.settle).catch(()=>{});let l=await W(e,"snapshot",{step:e.state.step,steps:on[e.state.model].steps,viewportOnly:c==="vision"});if(zc(e,l.url))throw new B(Ct("blocked_site"));let d=l.findings.find(b=>b.el===null&&(b.reason==="captcha"||b.reason==="sign_in"));if(d)throw new B(Ct(d.reason));let p={goal:e.plan.target||e.line,line:e.line,plan:be(e.plan),notes:[...t,...e.notes.slice(-8)],history:i.slice(-6),hint:a,page:l.text},u=c==="vision"?await Wc(e,l):null,f=await ge(e,()=>u?e.deps.brain["memory.act.see"]({...e.actCall,request:{...p,marks:l.elements.filter(b=>b.inView).length,grid:Ei(l)},image:u}):e.deps.brain["memory.act.step"]({...e.actCall,request:p}));[a,c]=["","snapshot"];let h=f.ok?f.step:oa("wait"),w=f.ok;if(f.ok){e.view={...e.view,stepLine:h.action==="look"?y.STEP_LINES.look:sr(h.target)};let b=await ky(e,h);if(b==="look")c="vision";else if(b)return b;if(by.has(h.action)){let v=await $c(e,h,l);if(v&&wy.has(h.action)&&e.deps.policies.skip(v)){e.notes.push("Skipped an equal opportunity question; leave it empty."),G(e,{action:h.action,role:v.role,tier:"snapshot",allowed:!1,outcome:"refused",byModel:!0});continue}let E=await jc(e,h,v,l,n,r);w=await Gc(e,h,v),G(e,{action:h.action,role:v?.role??"",tier:u?"vision":"snapshot",allowed:E,outcome:w?"held":"failed_check",byModel:!0})}h.note&&e.notes.push(h.note.slice(0,Xe.noteChars))}o.push(_y(l,h,w,e.notes)),i.push({step:e.state.step,action:h.action,target:h.target.slice(0,80),held:w});let x=e.deps.policies.loop(o,s);x.trouble&&(s+=1,{hint:a,tier:c}=await vy(e,x))}}var Vc=/^cori_[a-z0-9]{8,32}$/;var Ey="cori",Cy="chat";function qc(e,t){let r=new URL(e);return r.searchParams.set("tab",Ey),Vc.test(t)&&r.searchParams.set(Cy,t),r.toString()}var Ry=new Set(["delete_draft","undo_send","delete_event","undo"]);function Ty(e,t){switch(e.kind){case"draft":return{recipe:"gmail",step:"discard",args:{subject:t??e.subject,account:e.account}};case"send":return{recipe:"gmail",step:"undo_send",args:{}};case"event":return{recipe:"calendar",step:"delete",args:{eventId:e.eventId,title:t??"",account:e.account}};case"rewrite":return{recipe:e.recipe,step:"undo",args:{}}}}var Ay=e=>e.filter(t=>!Ry.has(t));async function Yc(e,t){let r=e.view.result;if(!e.undo||!r||r.undoUntil===null||t>r.undoUntil)return!1;let n=e.undo;e.undo=null;let o=n.kind==="event"?r.lines[0]??null:null,i=await e.deps.router.getTab(e.state.tabId),s={held:!1,fail:"wrong_state",data:{}};return i&&(s=await Tt(e,Ty(n,o),Ge(i.url??"")??"",!0).catch(()=>s)),e.view={...e.view,result:{...r,chips:Ay(r.chips),undoUntil:null}},s.held}async function Jc(e,t){let r=e.deps.router,n=t.origin===null?null:await r.getTab(t.origin);if(n){await r.updateTab(n.id,{active:!0}).catch(()=>{}),await r.focusWindow(n.windowId).catch(()=>{});return}await Py(r,t.state.convId)}async function Py(e,t){let r=qc(e.getURL("console.html"),t),n=(await e.pageTabs()).find(o=>o.documentUrl?.startsWith(e.getURL("console.html")));if(!n){await e.createTab(r,{active:!0});return}await e.updateTab(n.tabId,{active:!0,url:r}).catch(()=>{}),await e.focusWindow(n.windowId).catch(()=>{})}async function Xc(e,t){let r=e.session(t);if(!r)return!1;let n=await Yc(r,e.deps.now());return e.publish(r),await r.redraw(),n}async function Zc(e,t,r){if(r.type==="navigated")return;if(r.type==="rewrite"){r.end&&he(t.state)&&t.pressRewrite(r.end==="accepted"?"page_accepted":"page_reverted");return}if(r.type==="person"){let o=t.state.status==="waiting"&&(t.view.card?.form?.mode==="review"||t.view.card?.form?.mode==="copy");he(t.state)&&t.state.status!=="taken_over"&&!o&&await t.takeOver();return}let n=r.press;if(n.kind==="card"){t.answer(n.step,n.choice,n.edited);return}if(n.kind==="bar"){n.button==="take_over"?await t.takeOver():n.button==="hand_back"?await t.handBack():n.button==="stop"?t.stop("person"):await Jc(e,t);return}if(he(t.state)){t.pressRewrite(n.button);return}n.button==="undo"&&await Xc(e,t.state.runId),(n.button==="close"||n.button==="undo")&&(t.view={...t.view,rewrite:null},await t.redraw(),t.link?.close())}var Iy=50,My=320,Tn=class{constructor(t){this.send=t}timers=new Map;watch(t,r){let n=t.state.runId;clearInterval(this.timers.get(n)),this.timers.delete(n),!(!r||!he(t.state))&&(this.take(t),this.timers.set(n,setInterval(()=>he(t.state)?void this.take(t):this.watch(t,!1),se.taskPreviewMs)))}stopAll(){for(let t of this.timers.values())clearInterval(t);this.timers.clear()}async take(t){let r=await t.deps.router.getTab(t.state.tabId);if(!r)return;let o=await t.deps.chrome.tabActive(t.state.tabId)?await t.deps.chrome.capture(r.windowId,Iy):await this.sketch(t);o&&this.send({runId:t.state.runId,worker:t.state.worker,image:o,at:t.deps.now()})}async sketch(t){return t.link?.isOpen?(await W(t,"picture",{width:My},5e3,!0).catch(()=>null))?.dataUrl??null:null}};function Qc(e,t,r,n){let o=e.length,i=t.length,s=o+i,a=s+1,c=new Int32Array(2*s+3),l=[],d=-1;for(let p=0;p<=Math.min(s,n);p++){l.push(c.slice(a-p-1,a+p+2));for(let u=-p;u<=p;u+=2){let h=u===-p||u!==p&&c[a+u-1]<c[a+u+1]?c[a+u+1]:c[a+u-1]+1,w=h-u;for(;h<o&&w<i&&r(e[h],t[w]);)h++,w++;if(c[a+u]=h,h>=o&&w>=i){d=p;break}}if(d>=0)break}return d<0?null:Ly(l,o,i)}function Ly(e,t,r){let n=[],o=t,i=r;for(let s=e.length-1;s>=0;s--){let a=e[s],c=s+1,l=o-i,d=l===-s||l!==s&&a[c+l-1]<a[c+l+1],p=d?l+1:l-1,u=s===0?0:a[c+p],f=s===0?0:u-p;for(;o>u&&i>f;)o--,i--,n.push({kind:"keep",a:o,b:i});s>0&&(d?n.push({kind:"add",a:o,b:--i}):n.push({kind:"remove",a:--o,b:i}))}return n.reverse()}var Oy=/([\p{L}\p{M}\p{N}]+(?:['’ʼ-][\p{L}\p{M}\p{N}]+)*)|(\s+)|([\s\S])/gu;function An(e){let t=[];for(let r of e.matchAll(Oy)){let n=r.index;t.push({text:r[0],start:n,end:n+r[0].length,kind:r[1]?"word":r[2]?"space":"mark"})}return t}var Ci=8e3,Ny=1500,el=(e,t)=>[{before:{start:0,end:e.length},after:{start:0,end:t.length},old:e,now:t}];function Ht(e,t,r=!0){if(e===t)return[];if(e.length>Ci||t.length>Ci)return el(e,t);let n=An(e),o=An(t),i=Qc(n,o,(d,p)=>d.text===p.text,Ny);if(!i)return el(e,t);let s=[],a=null,c=0,l=0;for(let d of i){if(d.kind==="keep"){a&&s.push(a),a=null,c=d.a+1,l=d.b+1;continue}a??={a0:c,a1:c,b0:l,b1:l},d.kind==="remove"?a.a1=c=d.a+1:a.b1=l=d.b+1}return a&&s.push(a),(r?Dy(s,n,o):s).map(d=>Hy(d,n,o,e,t))}function Dy(e,t,r){let n=[];for(let o of e){let i=n[n.length-1],s=i?o.a0-i.a1:-1,a=i?o.b0-i.b1:-1;i&&s===1&&a===1&&t[i.a1]?.kind==="space"&&r[i.b1]?.kind==="space"?(i.a1=o.a1,i.b1=o.b1):n.push({...o})}return n}function tl(e,t,r,n){let o=t<e.length?e[t].start:n,i=r>t?e[r-1].end:o;return{start:o,end:i}}function Hy(e,t,r,n,o){let i=tl(t,e.a0,e.a1,n.length),s=tl(r,e.b0,e.b1,o.length);return{before:i,after:s,old:n.slice(i.start,i.end),now:o.slice(s.start,s.end)}}var ol=["rewrite","improve","grammar"],Fy=/\b(grammar|grammatical|spelling|spell ?check|typos?|punctuation|proofread\w*)\b/i,rl=/\b(improve|polish|clean (?:it |this |that )?up|clearer|tighten|refine|better)\b/i,nl=/\b(rewrite|re-write|reword|rephrase|paraphrase|shorter|longer|formal|casual|friendlier|simpler)\b/i,By=/\b(only|just)\b/i,il=e=>typeof e=="string"&&ol.includes(e);function Ri(e,t){let r=t.find(s=>s.name==="mode")?.value;if(il(r))return r;let n=[e,...t.filter(s=>s.name==="how").map(s=>s.value)].join(" ").trim();if(n==="")return null;let o=Fy.test(n),i=rl.test(n)||nl.test(n);return o&&(By.test(n)||!i)?"grammar":rl.test(n)&&!nl.test(n)?"improve":"rewrite"}var Ti={rewrite:"Rewrite this in my voice. Keep its meaning, names and numbers.",improve:"Improve this: clearer and smoother, in my voice. Keep its meaning, names and numbers.",grammar:"Fix only the spelling, grammar and punctuation. Keep every other word and the word order."};async function _e(e,t){e.view={...e.view,rewrite:t},await e.redraw(),e.deps.publish(e)}var Ai=10*6e4,Uy=new Set(["go_back","undo"]),sl=new Set(["looks_good","yes","page_accepted","accept"]);async function $y(e){let t=null,r=new Promise(n=>t=setTimeout(()=>n("page_accepted"),Ai));try{for(;;){let n=await Promise.race([e.waitForRewrite(),r]);if(Uy.has(n)||sl.has(n)||n==="page_reverted")return n}}finally{t&&clearTimeout(t)}}async function Pn(e,t,r){let n=r.readable?await t("show_changes"):null,o=typeof n?.data.changes=="number"?n.data.changes:0;await _e(e,{state:r.readable?"review":"check",original:r.source,rewrite:r.text,undoLeft:null,mode:r.mode,changes:o});let i=await $y(e);if(i==="page_reverted")return await t("end_preview"),await _e(e,null),Et("kept");if(sl.has(i))return await t("end_preview"),await _e(e,null),Et("rewritten");let s=await t("go_back");return await _e(e,null),G(e,{action:"type",role:"textbox",tier:"recipe",allowed:!0,outcome:s.held?"held":"failed_check",byModel:!1}),s.held?Et("kept"):me(e.state.model,[],!1)}var jy=12;async function Pi(e,t,r){let n=Ht(r.source,r.text).map(a=>({old:a.old.trim(),now:a.now.trim()})).filter(a=>a.old||a.now).slice(0,jy);await t("watch_paste",{text:r.text});let o={original:r.source,rewrite:r.text,undoLeft:null,mode:r.mode,edits:n};await _e(e,{state:"paste",...o});let i=null,s=new Promise(a=>i=setTimeout(()=>a("close"),Ai));try{for(;;){let a=await Promise.race([e.waitForRewrite(),s]);if(a==="copy")await t("focus_text"),await _e(e,{state:"copied",...o});else{if(a==="pasted")return G(e,{action:"type",role:"textbox",tier:"recipe",allowed:!0,outcome:"held",byModel:!1}),await Pn(e,t,{source:r.source,text:r.text,mode:r.mode,readable:!0});if(a==="close")return await _e(e,null),Et("kept")}}}finally{i&&clearTimeout(i)}}var Gy={mode_rewrite:"rewrite",mode_improve:"improve",mode_grammar:"grammar"},zy=(e,t)=>({...e,fields:[...e.fields.filter(r=>r.name!=="mode"),{name:"mode",value:t}]}),In=(e,t,r,n={})=>({state:e,original:t,rewrite:"",undoLeft:null,mode:r,...n});async function Wy(e,t){let r=Ri(e.line,e.plan.fields);if(r)return r;for(await _e(e,In("picker",t,null));;){let n=await e.waitForRewrite(),o=Gy[n];if(o)return o;if(n==="close")throw e.stop("person"),new de("person")}}async function al(e){let t=(await e.deps.router.getTab(e.state.tabId))?.url??"",r=fc(t)==="docs"?"docs":"field",n=Ge(t)??"",o=(h,w={})=>Tt(e,{recipe:r,step:h,args:w},n);await Le(e,e.state.tabId),await U(e,y.REWRITING,"recipe");let i=await o("read_selection");if(!i.held&&i.fail==="no_selection"&&i.data.ask==="copy"&&(await _e(e,In("working","",null)),i=await o("read_selection",{waitCopyMs:Ky})),!i.held||typeof i.data.text!="string")throw hi(i,e.state.model,"");let s=i.data.text,a=await Wy(e,s);await _e(e,In("working",s,a));let c=await e.deps.brain["memory.act.context"]({runId:e.state.runId,kind:"rewrite",plan:be(e.plan),names:[],sensitive:!1}).catch(()=>lr(e.deps.now())),l=a==="grammar"?{...e.actCall,model:"bolt"}:e.actCall,d=e.line.trim()||Ti[a],p=await ge(e,()=>e.deps.brain["memory.act.write"]({...l,request:{kind:"rewrite",line:d,plan:zy(be(e.plan),a),person:c.person,style:c.style,facts:[],samples:[],recipient:{name:"",address:""},source:s}}));if(!p.ok||p.written.kind!=="rewrite")return me(e.state.model);let u=p.written.rewrite.text;if(u===s)return await _e(e,In("none",s,a)),await Promise.race([new Promise(h=>setTimeout(h,Vy)),e.waitForRewrite().catch(()=>{})]),await _e(e,null),Et("kept",[y.NOTHING_TO_CHANGE]);if(i.data.via==="person_copy")return Pi(e,o,{source:s,text:u,mode:a});let f=await o("replace_selection",{text:u});return f.fail==="not_replaced"?Pi(e,o,{source:s,text:u,mode:a}):(Qe(f,e.state.model,""),G(e,{action:"type",role:"textbox",tier:"recipe",allowed:!0,outcome:"held",byModel:!1}),Pn(e,o,{source:s,text:u,mode:a,readable:(await o("check_replace")).held}))}var Ky=25e3,Vy=4e3;var Mn=class{constructor(t,r,n){this.startedAt=r;this.counted=n;this.base=on[t]}base;grants={steps:0,calls:0,spend:0};lastShot=Number.NEGATIVE_INFINITY;ask(t){return this.counted.steps&&t.steps>=this.base.steps*(1+this.grants.steps)?"steps":t.calls>=this.base.calls*(1+this.grants.calls)?"calls":t.spentMicros>=this.base.askAtMicros*(1+this.grants.spend)?"spend":null}grant(t){this.grants={...this.grants,[t]:this.grants[t]+1}}overWall(t){return t-this.startedAt>=this.base.wallMs}get callMs(){return this.base.callMs}mayShoot(t,r){return t.screenshots<this.base.screenshots&&r-this.lastShot>=se.screenshotGapMs}shot(t){this.lastShot=t}};var Ii={email_draft:mc,calendar_add:hc},qy={email_draft:"https://mail.google.com",calendar_add:"https://calendar.google.com"};async function Yy(e,t,r,n){let o=Ii[t];if(o)return n.blocked.includes(qy[t])?"blocked_site":{site:o,tabId:r.origin??0,tier:"recipe"};if(r.tabId===null)return"no_permission";let i=await e.deps.router.getTab(r.tabId),s=or(i?.url??"");return!i||s===null?"no_permission":n.blocked.includes(s)?"blocked_site":{site:uc(i.url??""),tabId:i.id,tier:t==="text_rewrite"?"recipe":"snapshot"}}async function cl(e,t,r){let n=t.plan.kind,o=await Yy(e,n,t,r);if(typeof o=="string")return{refused:o};let i=Ii[n]!==void 0;if(e.live().some(p=>i?p.state.kind===n:p.state.tabId===o.tabId&&Ii[p.state.kind]===void 0))return{refused:"busy"};let a=e.deps.now(),c=t.model??r.model,l=cc({runId:t.runId,kind:n,site:o.site.name,tabId:o.tabId,convId:t.convId,level:r.level,model:c,tier:o.tier,now:a}),d=new kn({router:e.deps.router,chrome:e.deps.chrome,hub:e.hub,store:e.store,brain:e.deps.brain,policies:e.deps.policies,audit:e.audit,publish:p=>e.publish(p),onPageEvent:(p,u)=>e.pageEvent(p,u),now:()=>e.deps.now()},l,lc(o.site,n==="text_rewrite"),t.line,t.plan,new Mn(c,a,{steps:!i&&n!=="text_rewrite"}),t.origin);return d.blocked=r.blocked,{session:d}}var Mi="coere.actions.runs",Jy=["running","waiting","taken_over","done","stopped","stuck"],Xy=["recipe","snapshot","vision"],Li=e=>typeof e=="string"&&e.length<=200,Zy=e=>e===null||Ir(e);function Qy(e){if(e===null)return null;if(!(!J(e)||!ke(ra,e.verb)||!Li(e.role)||!Li(e.site)))return{verb:e.verb,role:e.role,site:e.site}}function ex(e){if(!J(e)||!Ir(e.runId)||!Ir(e.convId)||!Zy(e.parentId)||!ke(aa,e.kind)||!Li(e.site)||!fn(e.tabId)||!(e.groupId===null||typeof e.groupId=="number")||!(e.worker===null||Mr(e.worker))||!ke(ii,e.level)||!ke(si,e.model)||!ke(Jy,e.status)||!ke(Xy,e.tier)||![e.step,e.spentMicros,e.screenshots,e.startedAt].every(Mr))return null;let t=Qy(e.pending);return t===void 0?null:{runId:e.runId,kind:e.kind,site:e.site,tabId:e.tabId,groupId:e.groupId,parentId:e.parentId,worker:e.worker,convId:e.convId,level:e.level,model:e.model,step:e.step,tier:e.tier,status:e.status,pending:t,spentMicros:e.spentMicros,screenshots:e.screenshots,startedAt:e.startedAt}}var Ln=class{constructor(t){this.area=t}chain=Promise.resolve();async all(){let t=(await this.area.get(Mi))[Mi];return J(t)?Object.values(t).flatMap(r=>ex(r)??[]):[]}async get(t){return(await this.all()).find(r=>r.runId===t)??null}put(t){return this.edit(r=>r.set(t.runId,t))}drop(t){return this.edit(r=>r.delete(t))}edit(t){let r=this.chain.then(async()=>{let n=new Map((await this.all()).map(o=>[o.runId,o]));t(n),await this.area.set({[Mi]:Object.fromEntries(n)})});return this.chain=r.catch(()=>{}),r}};var tx={email_draft:Sc,calendar_add:Pc,text_rewrite:al,form_fill:Si,job_apply:Si,page_click:Kc},On=class{constructor(t){this.deps=t;this.store=new Ln(t.router.sessionArea),this.audit=new bn(t.brain),this.previews=new Tn(r=>this.broadcast({ch:"coere",type:"actions.preview",...r},null))}hub=new gn;store;audit;sessions=new Map;requests=new Map;held=new Map;turns=new Map;previews;session(t){return this.sessions.get(t)}live(){return[...this.sessions.values()].filter(t=>he(t.state))}async start(t){let r=Ga((await this.deps.router.localArea.get(Or))[Or]);if(!r.on)return this.held.set(t.runId,t),{started:!1,refused:"off"};let n=tx[t.plan.kind];if(!n)return{started:!1,refused:"not_ready"};if(t.plan.kind==="email_draft"||t.plan.kind==="calendar_add"){let s=t.plan.kind==="email_draft"?ai[0]:ai[1];if(!await this.deps.chrome.granted([s]))return{started:!1,refused:"no_permission"}}let o=await cl(this,t,r);if("refused"in o)return{started:!1,refused:o.refused};let i=o.session;return this.sessions.set(t.runId,i),this.requests.set(t.runId,t),await this.store.put(i.state),this.audit.run(wn(i.state,null,null),t.plan.call??null),this.deps.history&&this.turns.set(t.runId,Rc(this.deps.history,i.state)),this.publish(i),Ec(this,i,n),{started:!0,state:i.state}}broadcast(t,r){this.deps.router.broadcast(t).catch(()=>{}),r!==null&&this.deps.router.sendToTab(r,t).catch(()=>{})}publish(t){this.broadcast({ch:"coere",type:"actions.state",state:t.state,task:bi(t.state,t.view),card:gi(t.state,t.view),result:t.view.result,grid:null},t.origin)}pageEvent(t,r){Zc(this,t,r)}writeEnd(t,r){let n=this.deps.history,o=this.turns.get(t.state.runId);return n&&o&&o.then(i=>Tc(n,i,t.state,r)),this.audit.run(wn(t.state,r,this.deps.now()))}forget(t,r=se.undoMs){setTimeout(()=>{this.sessions.delete(t),this.requests.delete(t),this.turns.delete(t),this.store.drop(t)},r)}stop(t,r){let n=this.sessions.get(t);return!n||!he(n.state)?!1:(n.stop(r),!0)}stopAll(t){for(let r of this.live())r.stop(t)}tabClosed(t){for(let r of this.live())r.state.tabId===t&&r.stop("tab_closed")}request(t){return this.requests.get(t)}takeHeld(t){let r=this.held.get(t);return this.held.delete(t),r}hasHeld(t){return this.held.has(t)}async recover(){for(let t of await this.store.all()){if(!he(t)){await this.store.drop(t.runId);continue}let r=vn(t,{type:"restarted"}),n=Me("restarted");await this.store.put(r),this.audit.run(wn(r,n,this.deps.now())),this.broadcast({ch:"coere",type:"actions.state",state:r,task:{runId:r.runId,site:pc(r.site),status:r.status,step:"",preview:null,result:n},card:null,result:n,grid:null},null),this.forget(r.runId,se.resultBarMs)}}get(t){let r=this.sessions.get(t);return r?{state:r.state,task:bi(r.state,r.view),card:gi(r.state,r.view),grid:null}:null}};var ll={guard:$o,loop:Go,skip:jo};var Nn=class{constructor(t){this.tabs=t}byId=new Map;failing=!1;next=500;join(t,r){if(this.failing)throw new Error("fake tabs.group failed");if(r!==null&&!this.byId.has(r))throw new Error(`No group with id: ${r}.`);let n=r??this.next++;return r===null&&this.byId.set(n,{id:n,windowId:t.windowId}),t.groupId!==n&&this.leave(t),t.groupId=n,n}windowOf(t){return this.byId.get(t)?.windowId??null}look(t,r){if(this.failing)throw new Error("fake tabGroups.update failed");let n=this.byId.get(t);if(!n)throw new Error(`No group with id: ${t}.`);Object.assign(n,r)}leave(t){let r=t.groupId;t.groupId=null,this.dropIfEmpty(r)}dropIfEmpty(t){t!==null&&!this.tabs.some(r=>r.groupId===t)&&this.byId.delete(t)}};function dl(e){let t=r=>typeof r=="string"?[r]:r;return{get:async r=>Object.fromEntries(t(r).flatMap(n=>e.has(n)?[[n,JSON.parse(JSON.stringify(e.get(n)))]]:[])),set:async r=>{for(let[n,o]of Object.entries(r))e.set(n,JSON.parse(JSON.stringify(o)))},remove:async r=>{for(let n of t(r))e.delete(n)}}}var Dn=class{extensionId="fakeextensionidaaaaaaaaaaaaaaaaa";tabs=[];session=new Map;local=new Map;sentToTabs=[];broadcasts=[];focused=[];created=[];reloaded=[];removed=[];tabGroups=new Nn(this.tabs);answers=new Map;activeId;deaf=new Set;windows=[1];failCreate=!1;popup="popup.html";popupCalls=[];failSetPopup=!1;popupOpens=0;failOpenPopup=!1;t=1e6;nextId=100;sessionArea=dl(this.session);localArea=dl(this.local);getURL(t){return`chrome-extension://${this.extensionId}/${t}`}now(){return this.t}async pageTabs(){let t=`chrome-extension://${this.extensionId}/`;return this.tabs.filter(r=>r.url.startsWith(t)).map(r=>({tabId:r.id,windowId:r.windowId,documentUrl:r.url}))}async broadcast(t){this.broadcasts.push(t)}async createTab(t,r={}){if(this.failCreate)throw new Error("fake tabs.create failed");this.created.push({url:t,options:r});let n={id:this.nextId++,windowId:r.windowId??1,url:t,active:r.active??!0,discarded:!1,frozen:!1,autoDiscardable:!0,groupId:null};if(n.active){for(let o of this.tabs)o.active=!1;this.activeId=n.id}return this.tabs.push(n),{id:n.id,windowId:n.windowId}}async updateTab(t,r){let n=this.tab(t);if(r.url&&(n.url=r.url),r.autoDiscardable!==void 0&&(n.autoDiscardable=r.autoDiscardable),r.active){for(let o of this.tabs)o.active=o===n;this.activeId=n.id}return{id:n.id,windowId:n.windowId}}async getTab(t){let r=this.tabs.find(n=>n.id===t);return r?{id:r.id,windowId:r.windowId,...r.url?{url:r.url}:{},...r.pendingUrl?{pendingUrl:r.pendingUrl}:{},...r.loading?{loading:!0}:{},discarded:r.discarded,frozen:r.frozen}:null}async reloadTab(t){this.tab(t).discarded=!1,this.reloaded.push(t)}async removeTab(t){let{groupId:r}=this.tab(t);this.tabs.splice(this.tabs.findIndex(n=>n.id===t),1),this.removed.push(t),this.tabGroups.dropIfEmpty(r)}get groups(){return this.tabGroups.byId}set failGroups(t){this.tabGroups.failing=t}async groupTab(t,r){return this.tabGroups.join(this.tab(t),r)}async groupWindow(t){return this.tabGroups.windowOf(t)}async updateGroup(t,r){this.tabGroups.look(t,r)}async normalWindows(){return[...this.windows]}async undiscardableTabs(t){let r=t.map(n=>new URL(n.replace("/*","/")).host);return this.tabs.filter(n=>!n.autoDiscardable&&n.url.startsWith("https://")&&r.includes(new URL(n.url).host)).map(n=>n.id)}async focusWindow(t){this.focused.push(t)}async activeTabId(){return this.activeId}async sendToTab(t,r){if(this.deaf.has(t)||!this.tabs.some(n=>n.id===t))throw new Error("Could not establish connection. Receiving end does not exist.");return this.sentToTabs.push({tabId:t,message:r}),this.answers.get(t)?.(r)}async sessionGet(t){return this.session.get(t)}async sessionSet(t,r){this.session.set(t,r)}async setActionPopup(t){if(this.failSetPopup)throw new Error("fake action.setPopup failed");this.popupCalls.push(t),this.popup=t}async openActionPopup(){if(this.failOpenPopup)throw new Error("fake action.openPopup failed");this.popupOpens++}openSite(t){let r=this.nextId++;return this.tabs.push({id:r,windowId:1,url:t,active:!1,discarded:!1,frozen:!1,autoDiscardable:!0,groupId:null}),r}ungroup(t){this.tabGroups.leave(this.tab(t))}tab(t){let r=this.tabs.find(n=>n.id===t);if(!r)throw new Error(`No tab with id: ${t}.`);return r}};var rx=["read","snapshot","do","settle","marks","overlay","recipe","picture","form"],nx=e=>J(e)&&typeof e.id=="string"&&rx.includes(e.type)?e:null,ox=e=>e.visible&&(e.bar.mode==="working"||e.bar.mode==="waiting");function ul(e){let t=e.connect(),r=!0,n=null,o=null,i=0,s=new Map,a=p=>{r&&t.postMessage(p)},c=p=>{n??=e.overlay(f=>a({type:"press",press:f})),n.draw(p);let u=ox(p);u&&!o&&(o=e.watchPerson(f=>a({type:"person",input:f}))),!u&&o&&(o(),o=null)};async function l(p){if(p.type==="overlay")return c(p.state),{id:p.id,ok:!0,type:"overlay",result:{drawn:!0}};if(p.type==="form"){if(!e.forms)return{id:p.id,ok:!1,type:"form",error:"refused"};try{return{id:p.id,ok:!0,type:"form",result:await e.forms(p.call)}}catch(u){let f=u.code;return{id:p.id,ok:!1,type:"form",error:typeof f=="string"?f:"internal"}}}if(p.type!=="recipe")return e.kit.handle(p);if(!e.recipes)return{id:p.id,ok:!1,type:"recipe",error:"refused"};try{return{id:p.id,ok:!0,type:"recipe",result:await e.recipes(p.call)}}catch{return{id:p.id,ok:!1,type:"recipe",error:"internal"}}}let d=()=>{if(r){r=!1,o?.(),n?.remove(),e.kit.dispose();for(let p of s.values())p(null);s.clear()}};return t.onMessage.addListener(p=>{if(J(p)&&p.type==="picked"&&typeof p.id=="string"){s.get(p.id)?.(typeof p.n=="number"?p.n:null),s.delete(p.id);return}let u=nx(p);u&&l(u).then(a)}),t.onDisconnect.addListener(d),{emit:a,pick(p,u){let f=yn(p,u);if(!r||f.length===0)return Promise.resolve(null);let h=`k${++i}`,w={type:"pick",id:h,description:p,candidates:f};return new Promise(x=>{s.set(h,x),a(w)})},stop(){try{t.disconnect()}catch{}d()}}}var zn,I,gl,ix,Pt,pl,bl,wl,Oi,Fn,Br,yl,Hi,Ni,Di,sx,$n={},jn=[],ax=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Wn=Array.isArray;function gt(e,t){for(var r in t)e[r]=t[r];return e}function Fi(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ze(e,t,r){var n,o,i,s={};for(i in t)i=="key"?n=t[i]:i=="ref"?o=t[i]:s[i]=t[i];if(arguments.length>2&&(s.children=arguments.length>3?zn.call(arguments,2):r),typeof e=="function"&&e.defaultProps!=null)for(i in e.defaultProps)s[i]===void 0&&(s[i]=e.defaultProps[i]);return Bn(e,s,n,o,null)}function Bn(e,t,r,n,o){var i={type:e,props:t,key:r,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++gl,__i:-1,__u:0};return o==null&&I.vnode!=null&&I.vnode(i),i}function O(e){return e.children}function Un(e,t){this.props=e,this.context=t}function Ft(e,t){if(t==null)return e.__?Ft(e.__,e.__i+1):null;for(var r;t<e.__k.length;t++)if((r=e.__k[t])!=null&&r.__e!=null)return r.__e;return typeof e.type=="function"?Ft(e):null}function cx(e){if(e.__P&&e.__d){var t=e.__v,r=t.__e,n=[],o=[],i=gt({},t);i.__v=t.__v+1,I.vnode&&I.vnode(i),Bi(e.__P,i,t,e.__n,e.__P.namespaceURI,32&t.__u?[r]:null,n,r??Ft(t),!!(32&t.__u),o),i.__v=t.__v,i.__.__k[i.__i]=i,Sl(n,i,o),t.__e=t.__=null,i.__e!=r&&xl(i)}}function xl(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),xl(e)}function fl(e){(!e.__d&&(e.__d=!0)&&Pt.push(e)&&!Gn.__r++||pl!=I.debounceRendering)&&((pl=I.debounceRendering)||bl)(Gn)}function Gn(){try{for(var e,t=1;Pt.length;)Pt.length>t&&Pt.sort(wl),e=Pt.shift(),t=Pt.length,cx(e)}finally{Pt.length=Gn.__r=0}}function vl(e,t,r,n,o,i,s,a,c,l,d){var p,u,f,h,w,x,b=n&&n.__k||jn,v=t.length;for(c=lx(r,t,b,c,v),p=0;p<v;p++)(f=r.__k[p])!=null&&(u=f.__i!=-1&&b[f.__i]||$n,f.__i=p,x=Bi(e,f,u,o,i,s,a,c,l,d),h=f.__e,f.ref&&u.ref!=f.ref&&(u.ref&&Ui(u.ref,null,f),d.push(f.ref,f.__c||h,f)),w==null&&h!=null&&(w=h),4&f.__u?(c=kl(f,c,e),u.__e&&(u.__e=null)):typeof f.type=="function"&&x!==void 0?c=x:h&&(c=h.nextSibling),f.__u&=-7);return r.__e=w,c}function lx(e,t,r,n,o){var i,s,a,c,l,d=r.length,p=d,u=0;for(e.__k=new Array(o),i=0;i<o;i++)(s=t[i])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[i]=Bn(null,s,null,null,null):Wn(s)?s=e.__k[i]=Bn(O,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[i]=Bn(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[i]=s,c=i+u,s.__=e,s.__b=e.__b+1,a=null,(l=s.__i=dx(s,r,c,p))!=-1&&(p--,(a=r[l])&&(a.__u|=2)),a==null||a.__v==null?(l==-1&&(o>d?u--:o<d&&u++),typeof s.type!="function"&&(s.__u|=4)):l!=c&&(l==c-1?u--:l==c+1?u++:(l>c?u--:u++,s.__u|=4))):e.__k[i]=null;if(p)for(i=0;i<d;i++)(a=r[i])!=null&&(2&a.__u)==0&&(a.__e==n&&(n=Ft(a)),Cl(a,a));return n}function kl(e,t,r){var n,o;if(typeof e.type=="function"){for(n=e.__k,o=0;n&&o<n.length;o++)n[o]&&(n[o].__=e,t=kl(n[o],t,r));return t}e.__e!=t&&(t&&e.type&&!t.parentNode&&(t=Ft(e)),t=r.insertBefore(e.__e,t||null));do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function dx(e,t,r,n){var o,i,s,a=e.key,c=e.type,l=t[r],d=l!=null&&(2&l.__u)==0;if(l===null&&a==null||d&&a==l.key&&c==l.type)return r;if(n>(d?1:0)){for(o=r-1,i=r+1;o>=0||i<t.length;)if((l=t[s=o>=0?o--:i++])!=null&&(2&l.__u)==0&&a==l.key&&c==l.type)return s}return-1}function ml(e,t,r){t[0]=="-"?e.setProperty(t,r??""):e[t]=r==null?"":typeof r!="number"||ax.test(t)?r:r+"px"}function Hn(e,t,r,n,o){var i,s;e:if(t=="style")if(typeof r=="string")e.style.cssText=r;else{if(typeof n=="string"&&(e.style.cssText=n=""),n)for(t in n)r&&t in r||ml(e.style,t,"");if(r)for(t in r)n&&r[t]==n[t]||ml(e.style,t,r[t])}else if(t[0]=="o"&&t[1]=="n")i=t!=(t=t.replace(yl,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+i]=r,r?n?r[Br]=n[Br]:(r[Br]=Hi,e.addEventListener(t,i?Di:Ni,i)):e.removeEventListener(t,i?Di:Ni,i);else{if(o=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=r??"";break e}catch{}typeof r=="function"||(r==null||r===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&r==1?"":r))}}function hl(e){return function(t){if(this.l){var r=this.l[t.type+e];if(t[Fn]==null)t[Fn]=Hi++;else if(t[Fn]<r[Br])return;return r(I.event?I.event(t):t)}}}function Bi(e,t,r,n,o,i,s,a,c,l){var d,p,u,f,h,w,x,b,v,E,P,q,Q,ie,V,pe,fe=t.type;if(t.constructor!==void 0)return null;128&r.__u&&(c=!!(32&r.__u),i=[a=t.__e=r.__e]),(d=I.__b)&&d(t);e:if(typeof fe=="function"){p=s.length;try{if(v=t.props,E=fe.prototype&&fe.prototype.render,P=(d=fe.contextType)&&n[d.__c],q=d?P?P.props.value:d.__:n,r.__c?b=(u=t.__c=r.__c).__=u.__E:(E?t.__c=u=new fe(v,q):(t.__c=u=new Un(v,q),u.constructor=fe,u.render=px),P&&P.sub(u),u.state||(u.state={}),u.__n=n,f=u.__d=!0,u.__h=[],u._sb=[]),E&&u.__s==null&&(u.__s=u.state),E&&fe.getDerivedStateFromProps!=null&&(u.__s==u.state&&(u.__s=gt({},u.__s)),gt(u.__s,fe.getDerivedStateFromProps(v,u.__s))),h=u.props,w=u.state,u.__v=t,f)E&&fe.getDerivedStateFromProps==null&&u.componentWillMount!=null&&u.componentWillMount(),E&&u.componentDidMount!=null&&u.__h.push(u.componentDidMount);else{if(E&&fe.getDerivedStateFromProps==null&&v!==h&&u.componentWillReceiveProps!=null&&u.componentWillReceiveProps(v,q),t.__v==r.__v||!u.__e&&u.shouldComponentUpdate!=null&&u.shouldComponentUpdate(v,u.__s,q)===!1){t.__v!=r.__v&&(u.props=v,u.state=u.__s,u.__d=!1),t.__e=r.__e,t.__k=r.__k,t.__k.some(function(dt){dt&&(dt.__=t)}),jn.push.apply(u.__h,u._sb),u._sb=[],u.__h.length&&s.push(u),a=Ft(r);break e}u.componentWillUpdate!=null&&u.componentWillUpdate(v,u.__s,q),E&&u.componentDidUpdate!=null&&u.__h.push(function(){u.componentDidUpdate(h,w,x)})}if(u.context=q,u.props=v,u.__P=e,u.__e=!1,Q=I.__r,ie=0,E)u.state=u.__s,u.__d=!1,Q&&Q(t),d=u.render(u.props,u.state,u.context),jn.push.apply(u.__h,u._sb),u._sb=[];else do u.__d=!1,Q&&Q(t),d=u.render(u.props,u.state,u.context),u.state=u.__s;while(u.__d&&++ie<25);u.state=u.__s,u.getChildContext!=null&&(n=gt(gt({},n),u.getChildContext())),E&&!f&&u.getSnapshotBeforeUpdate!=null&&(x=u.getSnapshotBeforeUpdate(h,w)),V=d!=null&&d.type===O&&d.key==null?El(d.props.children):d,a=vl(e,Wn(V)?V:[V],t,r,n,o,i,s,a,c,l),u.base=t.__e,t.__u&=-161,u.__h.length&&s.push(u),b&&(u.__E=u.__=null)}catch(dt){if(s.length=p,t.__v=null,c||i!=null){if(dt.then){for(t.__u|=c?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;i!=null&&(i[i.indexOf(a)]=null),t.__e=a}else if(i!=null)for(pe=i.length;pe--;)Fi(i[pe])}else t.__e=r.__e;t.__k==null&&(t.__k=r.__k||[]),dt.then||_l(t),I.__e(dt,t,r)}}else i==null&&t.__v==r.__v?(t.__k=r.__k,t.__e=r.__e):a=t.__e=ux(r.__e,t,r,n,o,i,s,c,l);return(d=I.diffed)&&d(t),128&t.__u?void 0:a}function _l(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(_l))}function Sl(e,t,r){for(var n=0;n<r.length;n++)Ui(r[n],r[++n],r[++n]);I.__c&&I.__c(t,e),e.some(function(o){try{e=o.__h,o.__h=[],e.some(function(i){i.call(o)})}catch(i){I.__e(i,o.__v)}})}function El(e){return typeof e!="object"||e==null||e.__b>0?e:Wn(e)?e.map(El):e.constructor!==void 0?null:gt({},e)}function ux(e,t,r,n,o,i,s,a,c){var l,d,p,u,f,h,w,x=r.props||$n,b=t.props,v=t.type;if(v=="svg"?o="http://www.w3.org/2000/svg":v=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),i!=null){for(l=0;l<i.length;l++)if((f=i[l])&&"setAttribute"in f==!!v&&(v?f.localName==v:f.nodeType==3)){e=f,i[l]=null;break}}if(e==null){if(v==null)return document.createTextNode(b);e=document.createElementNS(o,v,b.is&&b),a&&(I.__m&&I.__m(t,i),a=!1),i=null}if(v==null)x===b||a&&e.data==b||(e.data=b);else{if(i=v=="textarea"&&b.defaultValue!=null?null:i&&zn.call(e.childNodes),!a&&i!=null)for(x={},l=0;l<e.attributes.length;l++)x[(f=e.attributes[l]).name]=f.value;for(l in x)f=x[l],l=="dangerouslySetInnerHTML"?p=f:l=="children"||l in b||l=="value"&&"defaultValue"in b||l=="checked"&&"defaultChecked"in b||Hn(e,l,null,f,o);for(l in b)f=b[l],l=="children"?u=f:l=="dangerouslySetInnerHTML"?d=f:l=="value"?h=f:l=="checked"?w=f:a&&typeof f!="function"||x[l]===f||Hn(e,l,f,x[l],o);if(d)a||p&&(d.__html==p.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),t.__k=[];else if(p&&(e.innerHTML=""),vl(t.type=="template"?e.content:e,Wn(u)?u:[u],t,r,n,v=="foreignObject"?"http://www.w3.org/1999/xhtml":o,i,s,i?i[0]:r.__k&&Ft(r,0),a,c),i!=null)for(l=i.length;l--;)Fi(i[l]);a&&v!="textarea"||(l="value",v=="progress"&&h==null?e.removeAttribute("value"):h!=null&&(h!==e[l]||v=="progress"&&!h||v=="option"&&h!=x[l])&&Hn(e,l,h,x[l],o),l="checked",w!=null&&w!=e[l]&&Hn(e,l,w,x[l],o))}return e}function Ui(e,t,r){try{if(typeof e=="function"){var n=typeof e.__u=="function";n&&e.__u(),n&&t==null||(e.__u=e(t))}else e.current=t}catch(o){I.__e(o,r)}}function Cl(e,t,r){var n,o;if(I.unmount&&I.unmount(e),(n=e.ref)&&(n.current&&n.current!=e.__e||Ui(n,null,t)),(n=e.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(i){I.__e(i,t)}n.base=n.__P=n.__n=null}if(n=e.__k)for(o=0;o<n.length;o++)n[o]&&Cl(n[o],t,r||typeof e.type!="function");r||Fi(e.__e),e.__c=e.__=e.__e=void 0}function px(e,t,r){return this.constructor(e,r)}function $i(e,t,r){var n,o,i,s;t==document&&(t=document.documentElement),I.__&&I.__(e,t),o=(n=typeof r=="function")?null:r&&r.__k||t.__k,i=[],s=[],Bi(t,e=(!n&&r||t).__k=ze(O,null,[e]),o||$n,$n,t.namespaceURI,!n&&r?[r]:o?null:t.firstChild?zn.call(t.childNodes):null,i,!n&&r?r:o?o.__e:t.firstChild,n,s),Sl(i,e,s),e.props.children=null}zn=jn.slice,I={__e:function(e,t,r,n){for(var o,i,s;t=t.__;)if((o=t.__c)&&!o.__)try{if((i=o.constructor)&&i.getDerivedStateFromError!=null&&(o.setState(i.getDerivedStateFromError(e)),s=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(e,n||{}),s=o.__d),s)return o.__E=o}catch(a){e=a}throw e}},gl=0,ix=function(e){return e!=null&&e.constructor===void 0},Un.prototype.setState=function(e,t){var r;r=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=gt({},this.state),typeof e=="function"&&(e=e(gt({},r),this.props)),e&&gt(r,e),e!=null&&this.__v&&(t&&this._sb.push(t),fl(this))},Un.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),fl(this))},Un.prototype.render=O,Pt=[],bl=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,wl=function(e,t){return e.__v.__b-t.__v.__b},Gn.__r=0,Oi=Math.random().toString(8),Fn="__d"+Oi,Br="__a"+Oi,yl=/(PointerCapture)$|Capture$/i,Hi=0,Ni=hl(!1),Di=hl(!0),sx=0;var fx=0;function m(e,t,r,n,o,i){t||(t={});var s,a,c=t;if("ref"in c)for(a in c={},t)a=="ref"?s=t[a]:c[a]=t[a];var l={type:e,props:c,key:r,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--fx,__i:-1,__u:0,__source:o,__self:i};if(typeof e=="function"&&(s=e.defaultProps))for(a in s)c[a]===void 0&&(c[a]=s[a]);return I.vnode&&I.vnode(l),l}var mx=["top","right","bottom","left"],hx=["tl","tr","br","bl"];function ji({mode:e}){return m("div",{class:"coere-act-glow","data-mode":e,"aria-hidden":"true",children:[mx.map(t=>m("span",{class:"coere-act-glow-edge","data-edge":t},t)),hx.map(t=>m("span",{class:"coere-act-glow-corner","data-corner":t},t))]})}var mr,z,Gi,Rl,Vn=0,Nl=[],K=I,Tl=K.__b,Al=K.__r,Pl=K.diffed,Il=K.__c,Ml=K.unmount,Ll=K.__;function qn(e,t){K.__h&&K.__h(z,e,Vn||t),Vn=0;var r=z.__H||(z.__H={__:[],__h:[]});return e>=r.__.length&&r.__.push({}),r.__[e]}function et(e){return Vn=1,gx(Hl,e)}function gx(e,t,r){var n=qn(mr++,2);if(n.t=e,!n.__c&&(n.__=[r?r(t):Hl(void 0,t),function(a){var c=n.__N?n.__N[0]:n.__[0],l=n.t(c,a);c!==l&&(n.__N=[l,n.__[1]],n.__c.setState({}))}],n.__c=z,!z.__f)){var o=function(a,c,l){if(!n.__c.__H)return!0;var d=!1,p=n.__c.props!==a;if(n.__c.__H.__.some(function(f){if(f.__N){d=!0;var h=f.__[0];f.__=f.__N,f.__N=void 0,h!==f.__[0]&&(p=!0)}}),i){var u=i.call(this,a,c,l);return d?u||p:u}return!d||p};z.__f=!0;var i=z.shouldComponentUpdate,s=z.componentWillUpdate;z.componentWillUpdate=function(a,c,l){if(this.__e){var d=i;i=void 0,o(a,c,l),i=d}s&&s.call(this,a,c,l)},z.shouldComponentUpdate=o}return n.__N||n.__}function tt(e,t){var r=qn(mr++,3);!K.__s&&Wi(r.__H,t)&&(r.__=e,r.u=t,z.__H.__h.push(r))}function Dl(e,t){var r=qn(mr++,4);!K.__s&&Wi(r.__H,t)&&(r.__=e,r.u=t,z.__h.push(r))}function hr(e){return Vn=5,Ur(function(){return{current:e}},[])}function Ur(e,t){var r=qn(mr++,7);return Wi(r.__H,t)&&(r.__=e(),r.__H=t,r.__h=e),r.__}function bx(){for(var e;e=Nl.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Kn),t.__h.some(zi),t.__h=[]}catch(r){t.__h=[],K.__e(r,e.__v)}}}K.__b=function(e){z=null,Tl&&Tl(e)},K.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Ll&&Ll(e,t)},K.__r=function(e){Al&&Al(e),mr=0;var t=(z=e.__c).__H;t&&(Gi===z?(t.__h=[],z.__h=[],t.__.some(function(r){r.__N&&(r.__=r.__N),r.u=r.__N=void 0})):(t.__h.some(Kn),t.__h.some(zi),t.__h=[],mr=0)),Gi=z},K.diffed=function(e){Pl&&Pl(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(Nl.push(t)!==1&&Rl===K.requestAnimationFrame||((Rl=K.requestAnimationFrame)||wx)(bx)),t.__H.__.some(function(r){r.u&&(r.__H=r.u,r.u=void 0)})),Gi=z=null},K.__c=function(e,t){t.some(function(r){try{r.__h.some(Kn),r.__h=r.__h.filter(function(n){return!n.__||zi(n)})}catch(n){t.some(function(o){o.__h&&(o.__h=[])}),t=[],K.__e(n,r.__v)}}),Il&&Il(e,t)},K.unmount=function(e){Ml&&Ml(e);var t,r=e.__c;r&&r.__H&&(r.__H.__.some(function(n){try{Kn(n)}catch(o){t=o}}),r.__H=void 0,t&&K.__e(t,r.__v))};var Ol=typeof requestAnimationFrame=="function";function wx(e){var t,r=function(){clearTimeout(n),Ol&&cancelAnimationFrame(t),setTimeout(e)},n=setTimeout(r,35);Ol&&(t=requestAnimationFrame(r))}function Kn(e){var t=z,r=e.__c;typeof r=="function"&&(e.__c=void 0,r()),z=t}function zi(e){var t=z;e.__c=e.__(),z=t}function Wi(e,t){return!e||e.length!==t.length||t.some(function(r,n){return r!==e[n]})}function Hl(e,t){return typeof t=="function"?t(e):t}function bt(...e){return e.filter(Boolean).join(" ")}var Fl=0;function yx(e){return Fl+=1,`${e}-${Fl.toString(36)}`}function we(e){let[t]=et(()=>yx(e));return t}var Bl={kind:"button",svg:{tag:"svg",attrs:{viewBox:"0 0 256 256",class:"coere-cori-art",style:"--coere-cori-o-seat:128px 234px;--coere-cori-o-floor:128px 237px;--coere-cori-o-tuft:124.92px 62.04px;--coere-cori-tilt-dx:-91.3px;--coere-cori-look-k:0.8;--coere-cori-u:1"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"96",cy:"88",r:"200",fx:"88",fy:"80"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.3","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.58","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"0.84","stop-color":"#485bd9"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#3f50c0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"128",cy:"173.2",r:"111.2"},children:[{tag:"stop",attrs:{offset:"0.93","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-256",y:"-256",width:"768",height:"768"},children:[{tag:"rect",attrs:{x:"-256",y:"-256",width:"768",height:"768",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-sheen"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff","stop-opacity":"0.34"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.8"},children:[]},{tag:"stop",attrs:{offset:"0.4","stop-color":"#a2adfb","stop-opacity":"0.45"},children:[]},{tag:"stop",attrs:{offset:"0.75","stop-color":"#a2adfb","stop-opacity":"0.12"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-eye",x1:"0",y1:"0",x2:"0",y2:"1"},children:[{tag:"stop",attrs:{offset:"0.55","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eef0fe"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floor"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#080e24","stop-opacity":"0.2",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:var(--coere-cori-floor-o, 0.2)"},children:[]},{tag:"stop",attrs:{offset:"0.6","stop-color":"#080e24","stop-opacity":"0.08",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:calc(var(--coere-cori-floor-o, 0.2) * 0.4)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#080e24","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floorglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#5267f7","stop-opacity":"0.3",style:"stop-opacity:var(--coere-cori-glow-o, 0.3)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#5267f7","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-lr",gradientUnits:"userSpaceOnUse",x1:"72",y1:"82",x2:"240",y2:"234"},children:[{tag:"stop",attrs:{offset:"0.38","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.92","stop-color":"#fff"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim",gradientUnits:"userSpaceOnUse",x1:"49.6",y1:"0",x2:"240",y2:"0"},children:[{tag:"stop",attrs:{offset:"0.1","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.86","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#000"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim-v",gradientUnits:"userSpaceOnUse",x1:"0",y1:"136",x2:"0",y2:"234"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.7","stop-color":"#fff"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-mask-ul",gradientUnits:"userSpaceOnUse",cx:"16",cy:"134.08",r:"117.6"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#fff","stop-opacity":"0.6"},children:[]},{tag:"stop",attrs:{offset:"0.8","stop-color":"#fff","stop-opacity":"0.13"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#fff","stop-opacity":"0"},children:[]}]},{tag:"mask",attrs:{id:"m-lr",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-lr)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim-v",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim)",mask:"url(#m-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-ul",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-ul)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z"},children:[]}]},{tag:"filter",attrs:{id:"f-core",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"12.19"},children:[]}]},{tag:"filter",attrs:{id:"f-rim",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"2.38"},children:[]}]},{tag:"filter",attrs:{id:"f-lit",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"4"},children:[]}]}]},{tag:"g",attrs:{class:"b-shadow"},children:[{tag:"g",attrs:{class:"b-shadow-pose"},children:[{tag:"ellipse",attrs:{cx:"128",cy:"237",rx:"100",ry:"8",fill:"url(#g-floor)"},children:[]},{tag:"ellipse",attrs:{cx:"132",cy:"236",rx:"62",ry:"4.96",fill:"url(#g-floorglow)"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#2d3b8e","stroke-width":"46.08",opacity:"0.5",filter:"url(#f-core)",mask:"url(#m-lr)"},children:[]},{tag:"ellipse",attrs:{cx:"138",cy:"208.2",rx:"67.2",ry:"41.28",fill:"url(#g-glow)",opacity:"0.5"},children:[]},{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#bdc5fc","stroke-width":"14",opacity:"0.7",filter:"url(#f-rim)",mask:"url(#m-rim)"},children:[]},{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#cbd1fd","stroke-width":"12.8",opacity:"0.38",filter:"url(#f-lit)",mask:"url(#m-ul)"},children:[]},{tag:"ellipse",attrs:{cx:"92",cy:"112",rx:"74",ry:"54",transform:"rotate(-32 92 112)",fill:"url(#g-sheen)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 58.49 97.96 C 58.69 97.49 59.3 96.07 59.7 95.13 C 60.1 94.18 60.48 93.23 60.91 92.29 C 61.33 91.36 61.78 90.44 62.25 89.52 C 62.72 88.61 63.2 87.7 63.72 86.82 C 64.23 85.93 64.78 85.06 65.36 84.22 C 65.93 83.37 66.51 82.5 67.18 81.74 C 67.86 80.97 68.63 80.28 69.42 79.64 C 70.22 79 71.08 78.45 71.94 77.89 C 72.8 77.33 73.7 76.84 74.57 76.28 C 75.43 75.72 76.28 75.14 77.11 74.54 C 77.94 73.94 78.75 73.31 79.55 72.66 C 80.34 72.01 81.12 71.34 81.87 70.64 C 82.62 69.94 83.36 69.22 84.06 68.47 C 84.75 67.72 85.42 66.93 86.06 66.13 C 86.7 65.33 87.29 64.49 87.9 63.66 C 88.5 62.83 89.09 61.99 89.68 61.15 C 90.28 60.32 90.87 59.48 91.47 58.64 C 92.06 57.81 92.66 56.97 93.25 56.14 C 93.85 55.3 94.44 54.46 95.04 53.63 C 95.63 52.79 96.23 51.95 96.83 51.12 C 97.42 50.28 98.02 49.44 98.61 48.61 C 99.21 47.77 99.8 46.93 100.4 46.1 C 100.99 45.26 101.59 44.42 102.18 43.59 C 102.78 42.75 103.37 41.91 103.97 41.08 C 104.56 40.24 105.11 39.36 105.75 38.57 C 106.4 37.77 107.05 36.94 107.83 36.3 C 108.62 35.67 109.55 35.12 110.49 34.75 C 111.43 34.38 112.47 34.16 113.48 34.09 C 114.49 34.03 115.55 34.12 116.53 34.35 C 117.51 34.59 118.5 34.99 119.36 35.51 C 120.23 36.03 121.05 36.7 121.72 37.45 C 122.39 38.2 122.97 39.09 123.38 40.01 C 123.8 40.92 124.05 41.94 124.21 42.94 C 124.38 43.94 124.34 44.99 124.37 46.01 C 124.41 47.03 124.24 48.11 124.42 49.09 C 124.61 50.07 124.82 51.33 125.48 51.9 C 126.13 52.46 127.4 52.59 128.34 52.46 C 129.27 52.34 130.25 51.71 131.1 51.17 C 131.96 50.62 132.73 49.91 133.47 49.21 C 134.21 48.5 134.86 47.7 135.55 46.94 C 136.23 46.17 136.9 45.39 137.58 44.62 C 138.26 43.85 138.93 43.08 139.61 42.31 C 140.29 41.53 140.96 40.76 141.64 39.99 C 142.32 39.22 143 38.45 143.67 37.67 C 144.35 36.9 145.03 36.13 145.7 35.36 C 146.38 34.59 147.06 33.81 147.73 33.04 C 148.41 32.27 149.09 31.5 149.77 30.73 C 150.44 29.96 151.12 29.18 151.8 28.41 C 152.47 27.64 153.15 26.87 153.83 26.1 C 154.5 25.32 155.16 24.53 155.86 23.78 C 156.56 23.03 157.23 22.24 158.02 21.6 C 158.81 20.95 159.66 20.35 160.57 19.92 C 161.48 19.5 162.49 19.19 163.49 19.04 C 164.48 18.88 165.54 18.87 166.54 19.01 C 167.54 19.14 168.56 19.43 169.48 19.84 C 170.4 20.26 171.29 20.82 172.06 21.48 C 172.82 22.13 173.52 22.93 174.07 23.77 C 174.62 24.61 175.07 25.58 175.36 26.54 C 175.65 27.51 175.81 28.56 175.82 29.57 C 175.82 30.58 175.62 31.61 175.4 32.6 C 175.17 33.6 174.79 34.56 174.47 35.53 C 174.15 36.51 173.81 37.48 173.48 38.45 C 173.15 39.42 172.82 40.4 172.49 41.37 C 172.16 42.34 171.83 43.31 171.5 44.28 C 171.17 45.26 170.84 46.23 170.51 47.2 C 170.18 48.17 169.85 49.15 169.52 50.12 C 169.19 51.09 168.86 52.06 168.53 53.03 C 168.2 54.01 167.87 54.98 167.54 55.95 C 167.21 56.92 166.82 57.88 166.56 58.87 C 166.3 59.86 166.04 60.87 165.98 61.88 C 165.92 62.89 165.96 63.97 166.22 64.94 C 166.49 65.9 166.99 66.85 167.57 67.68 C 168.15 68.5 168.9 69.24 169.68 69.9 C 170.46 70.56 171.34 71.11 172.23 71.62 C 173.12 72.13 174.13 72.42 175.01 72.94 C 175.89 73.46 176.71 74.08 177.48 74.74 C 178.26 75.4 179 76.12 179.67 76.9 C 180.33 77.68 180.89 78.55 181.45 79.4 C 182.02 80.26 182.56 81.13 183.07 82.02 C 183.58 82.91 184.05 83.82 184.52 84.74 C 184.98 85.65 185.44 86.57 185.86 87.51 C 186.28 88.44 186.65 89.36 187.06 90.34 C 187.48 91.33 188.14 92.89 188.35 93.4 L 188.35 110.2 L 58.49 114.76 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"ellipse",attrs:{cx:"92",cy:"112",rx:"74",ry:"54",transform:"rotate(-32 92 112)",fill:"url(#g-sheen)"},children:[]},{tag:"circle",attrs:{cx:"115.48",cy:"40.32",r:"24.39",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"167.26",cy:"25.86",r:"25.87",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"114.23",cy:"44.19",r:"21.34",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"165.1",cy:"29.59",r:"22.64",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 97.93 79.45 C 97.17 79.61 96.12 80.04 95.23 80.35 C 94.34 80.66 93.46 80.99 92.58 81.33 C 91.71 81.67 90.84 82.02 89.98 82.38 C 89.12 82.75 88.27 83.12 87.43 83.51 C 86.58 83.9 85.75 84.31 84.92 84.72 C 84.09 85.14 83.27 85.57 82.46 86.01 C 81.65 86.45 80.85 86.9 80.05 87.37 C 79.26 87.83 78.47 88.31 77.69 88.8 C 76.91 89.29 76.14 89.79 75.38 90.31 C 74.62 90.82 73.86 91.35 73.12 91.89 C 72.37 92.43 71.63 92.98 70.9 93.55 C 70.17 94.11 69.45 94.69 68.73 95.28 C 68.02 95.87 67.31 96.47 66.62 97.08 C 65.92 97.69 65.23 98.32 64.55 98.96 C 63.87 99.59 63.19 100.24 62.53 100.91 C 61.86 101.57 61.21 102.24 60.56 102.93 C 59.91 103.61 59.27 104.31 58.64 105.02 C 58.01 105.73 57.22 106.55 56.77 107.19 C 56.33 107.83 56.1 108.28 56 108.87 C 55.89 109.45 55.96 110.15 56.16 110.71 C 56.37 111.27 56.77 111.84 57.23 112.22 C 57.68 112.6 58.32 112.9 58.9 113 C 59.49 113.1 60.19 113.04 60.75 112.84 C 61.31 112.63 61.59 112.17 62.26 111.77 C 62.93 111.37 63.92 110.87 64.75 110.44 C 65.57 110.02 66.4 109.61 67.21 109.21 C 68.03 108.81 68.84 108.43 69.64 108.04 C 70.43 107.66 71.23 107.29 72 106.92 C 72.78 106.55 73.54 106.19 74.29 105.82 C 75.04 105.45 75.78 105.08 76.5 104.7 C 77.23 104.33 77.94 103.95 78.63 103.56 C 79.33 103.16 80.01 102.77 80.68 102.35 C 81.35 101.94 82.01 101.52 82.66 101.08 C 83.31 100.64 83.94 100.19 84.57 99.73 C 85.2 99.26 85.83 98.78 86.45 98.28 C 87.07 97.78 87.68 97.27 88.29 96.74 C 88.91 96.21 89.52 95.67 90.14 95.12 C 90.76 94.56 91.38 93.99 92.01 93.42 C 92.64 92.84 93.27 92.25 93.91 91.66 C 94.56 91.06 95.21 90.46 95.88 89.86 C 96.55 89.26 97.24 88.65 97.93 88.06 C 98.63 87.46 99.46 86.73 100.08 86.27 C 100.7 85.81 101.24 85.71 101.64 85.28 C 102.05 84.84 102.37 84.22 102.5 83.63 C 102.63 83.05 102.6 82.35 102.42 81.79 C 102.24 81.22 101.86 80.63 101.42 80.22 C 100.98 79.82 100.36 79.5 99.78 79.37 C 99.2 79.24 98.69 79.29 97.93 79.45 Z",fill:"#ffffff",opacity:"0.94"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:112px 168.32px"},children:[{tag:"rect",attrs:{x:"96",width:"32",height:"57.6",rx:"16",y:"128",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{class:"b-blink",style:"transform-origin:163.2px 168.32px"},children:[{tag:"rect",attrs:{x:"147.2",width:"32",height:"57.6",rx:"16",y:"128",fill:"url(#g-eye)"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 100 140.8 L 124 156.8 L 100 172.8",fill:"none",stroke:"#ffffff","stroke-width":"12.77","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 175.2 140.8 L 151.2 156.8 L 175.2 172.8",fill:"none",stroke:"#ffffff","stroke-width":"12.77","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 95.04 160.46 C 95.04 134.68 128.96 134.68 128.96 160.46",fill:"none",stroke:"#ffffff","stroke-width":"13.44","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 146.24 160.46 C 146.24 134.68 180.16 134.68 180.16 160.46",fill:"none",stroke:"#ffffff","stroke-width":"13.44","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"108.16",width:"32",height:"49.54",rx:"16",y:"116.03",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"159.36",width:"32",height:"46.08",rx:"16",y:"117.76",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"95.36",width:"33.28",height:"59.9",rx:"16.64",y:"126.85",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"148.16",width:"30.08",height:"28.8",rx:"15.04",y:"135.49",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 95.04 161.95 C 95.04 180.26 128.96 180.26 128.96 161.95",fill:"none",stroke:"#ffffff","stroke-width":"11.56","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 146.24 161.95 C 146.24 180.26 180.16 180.26 180.16 161.95",fill:"none",stroke:"#ffffff","stroke-width":"11.56","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"smile"},children:[{tag:"path",attrs:{d:"M 123.52 203.52 C 130.56 212.48 144.64 212.48 151.68 203.52",fill:"none",stroke:"#243074","stroke-width":"8.32","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"ellipse",attrs:{cx:"137.6",cy:"209.72",rx:"10.14",ry:"11.83",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"open"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-open"},children:[{tag:"path",attrs:{d:"M 120.7 201.49 C 120.7 225.48 154.5 225.48 154.5 201.49 Z"},children:[]}]},{tag:"path",attrs:{d:"M 120.7 201.49 C 120.7 225.48 154.5 225.48 154.5 201.49 Z",fill:"#243074",stroke:"#243074","stroke-width":"4.58","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"137.6",cy:"219.57",rx:"10.48",ry:"7.1",fill:"#7585f9","clip-path":"url(#clip-mouth-open)"},children:[]}]},{tag:"g",attrs:{"data-mouth":"hmm"},children:[{tag:"ellipse",attrs:{cx:"144.36",cy:"207.46",rx:"7.6",ry:"8.45",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:137.6px 203.52px"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-talk"},children:[{tag:"path",attrs:{d:"M 123.52 208.48 A 14.08 9.01 0 1 0 151.68 208.48 A 14.08 9.01 0 1 0 123.52 208.48 Z"},children:[]}]},{tag:"path",attrs:{d:"M 123.52 208.48 A 14.08 9.01 0 1 0 151.68 208.48 A 14.08 9.01 0 1 0 123.52 208.48 Z",fill:"#243074",stroke:"#243074","stroke-width":"4.58","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"137.6",cy:"214.78",rx:"9.86",ry:"4.06",fill:"#7585f9","clip-path":"url(#clip-mouth-talk)"},children:[]}]}]},{tag:"g",attrs:{"data-mouth":"wavy"},children:[{tag:"path",attrs:{d:"M 121.41 204.52 C 122.08 204 124.11 201.8 125.46 201.4 C 126.81 201 128.15 201.39 129.5 202.13 C 130.85 202.87 132.2 204.85 133.55 205.81 C 134.9 206.77 136.25 207.9 137.6 207.9 C 138.95 207.9 140.3 206.77 141.65 205.81 C 143 204.85 144.35 202.87 145.7 202.13 C 147.05 201.39 148.39 201 149.74 201.4 C 151.09 201.8 153.12 204 153.79 204.52",fill:"none",stroke:"#243074","stroke-width":"7.65","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"sleep"},children:[{tag:"ellipse",attrs:{cx:"137.6",cy:"207.46",rx:"5.63",ry:"4.79",fill:"#243074"},children:[]}]}]}]}]}]},{tag:"g",attrs:{"data-fx":"sparkles"},children:[{tag:"path",attrs:{class:"b-spark b-spark-1",d:"M 230 35 Q 233.36 52.64 251 56 Q 233.36 59.36 230 77 Q 226.64 59.36 209 56 Q 226.64 52.64 230 35 Z",fill:"#5267f7"},children:[]}]},{tag:"g",attrs:{"data-fx":"question"},children:[{tag:"g",attrs:{class:"b-q"},children:[{tag:"path",attrs:{d:"M 216 26.2 C 216 13.6 241.8 13.6 241.8 26.2 C 241.8 35.8 228.9 35.8 228.9 46.6",fill:"none",stroke:"#5267f7","stroke-width":"11","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"circle",attrs:{cx:"228.9",cy:"58.6",r:"6.82",fill:"#5267f7"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"zzz"},children:[{tag:"g",attrs:{class:"b-z b-z-1"},children:[{tag:"path",attrs:{d:"M 206 18 H 236 L 206 48 H 236",fill:"none",stroke:"#5267f7","stroke-width":"10","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"work"},children:[{tag:"g",attrs:{class:"b-key b-key-1"},children:[{tag:"rect",attrs:{x:"196",y:"14",width:"40",height:"32",rx:"9.6",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"205.6",y:"21.68",width:"20.8",height:"6.4",rx:"3.2",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"path",attrs:{class:"b-fly b-fly-1",d:"M 30 34 Q 32.88 49.12 48 52 Q 32.88 54.88 30 70 Q 27.12 54.88 12 52 Q 27.12 49.12 30 34 Z",fill:"#5267f7",style:"--coere-cori-fly-x:-10px"},children:[]}]}]}};var Ul={kind:"full",svg:{tag:"svg",attrs:{viewBox:"0 0 256 256",class:"coere-cori-art",style:"--coere-cori-o-seat:128px 220px;--coere-cori-o-floor:128px 223px;--coere-cori-o-tuft:126px 66.02px;--coere-cori-tilt-dx:-72px;--coere-cori-look-k:1;--coere-cori-u:1"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"100",cy:"92",r:"178",fx:"92",fy:"84"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.3","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.58","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"0.84","stop-color":"#485bd9"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#3f50c0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"128",cy:"150.02",r:"84.02"},children:[{tag:"stop",attrs:{offset:"0.92","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-256",y:"-256",width:"768",height:"768"},children:[{tag:"rect",attrs:{x:"-256",y:"-256",width:"768",height:"768",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-sheen"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff","stop-opacity":"0.34"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.8"},children:[]},{tag:"stop",attrs:{offset:"0.4","stop-color":"#a2adfb","stop-opacity":"0.45"},children:[]},{tag:"stop",attrs:{offset:"0.75","stop-color":"#a2adfb","stop-opacity":"0.12"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-blush"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#bdc5fc"},children:[]},{tag:"stop",attrs:{offset:"0.5","stop-color":"#bdc5fc","stop-opacity":"0.7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#bdc5fc","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-eye",x1:"0",y1:"0",x2:"0",y2:"1"},children:[{tag:"stop",attrs:{offset:"0.55","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eef0fe"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floor"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#080e24","stop-opacity":"0.2",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:var(--coere-cori-floor-o, 0.2)"},children:[]},{tag:"stop",attrs:{offset:"0.6","stop-color":"#080e24","stop-opacity":"0.08",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:calc(var(--coere-cori-floor-o, 0.2) * 0.4)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#080e24","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floorglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#5267f7","stop-opacity":"0.3",style:"stop-opacity:var(--coere-cori-glow-o, 0.3)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#5267f7","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-lr",gradientUnits:"userSpaceOnUse",x1:"83",y1:"86",x2:"218",y2:"220"},children:[{tag:"stop",attrs:{offset:"0.38","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.92","stop-color":"#fff"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim",gradientUnits:"userSpaceOnUse",x1:"65",y1:"0",x2:"218",y2:"0"},children:[{tag:"stop",attrs:{offset:"0.1","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.86","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#000"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim-v",gradientUnits:"userSpaceOnUse",x1:"0",y1:"124",x2:"0",y2:"220"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.7","stop-color":"#fff"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-mask-ul",gradientUnits:"userSpaceOnUse",cx:"38",cy:"128.56",r:"94.5"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#fff","stop-opacity":"0.6"},children:[]},{tag:"stop",attrs:{offset:"0.8","stop-color":"#fff","stop-opacity":"0.13"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#fff","stop-opacity":"0"},children:[]}]},{tag:"mask",attrs:{id:"m-lr",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-lr)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim-v",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim)",mask:"url(#m-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-ul",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-ul)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z"},children:[]}]},{tag:"filter",attrs:{id:"f-core",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"12.19"},children:[]}]},{tag:"filter",attrs:{id:"f-rim",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"1.7"},children:[]}]},{tag:"filter",attrs:{id:"f-lit",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"4"},children:[]}]}]},{tag:"g",attrs:{class:"b-shadow"},children:[{tag:"g",attrs:{class:"b-shadow-pose"},children:[{tag:"ellipse",attrs:{cx:"128",cy:"223",rx:"84",ry:"10",fill:"url(#g-floor)"},children:[]},{tag:"ellipse",attrs:{cx:"132",cy:"222",rx:"52.08",ry:"6.2",fill:"url(#g-floorglow)"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#2d3b8e","stroke-width":"46.08",opacity:"0.5",filter:"url(#f-core)",mask:"url(#m-lr)"},children:[]},{tag:"ellipse",attrs:{cx:"138",cy:"196.9",rx:"54",ry:"36.96",fill:"url(#g-glow)",opacity:"0.5"},children:[]},{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#bdc5fc","stroke-width":"10",opacity:"0.7",filter:"url(#f-rim)",mask:"url(#m-rim)"},children:[]},{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#cbd1fd","stroke-width":"12.8",opacity:"0.38",filter:"url(#f-lit)",mask:"url(#m-ul)"},children:[]},{tag:"ellipse",attrs:{cx:"96",cy:"112",rx:"62",ry:"46",transform:"rotate(-32 96 112)",fill:"url(#g-sheen)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 81.27 89.4 C 81.42 89.07 81.87 88.07 82.18 87.4 C 82.48 86.73 82.76 86.05 83.08 85.39 C 83.4 84.73 83.74 84.08 84.08 83.44 C 84.43 82.79 84.78 82.14 85.16 81.52 C 85.54 80.89 85.95 80.28 86.37 79.68 C 86.79 79.08 87.2 78.47 87.68 77.92 C 88.17 77.37 88.71 76.87 89.28 76.41 C 89.84 75.95 90.43 75.51 91.06 75.15 C 91.69 74.78 92.39 74.54 93.05 74.2 C 93.7 73.87 94.34 73.51 94.97 73.14 C 95.6 72.76 96.22 72.36 96.82 71.94 C 97.42 71.52 98.01 71.08 98.57 70.61 C 99.14 70.15 99.68 69.66 100.21 69.15 C 100.73 68.63 101.23 68.09 101.7 67.54 C 102.18 66.98 102.61 66.39 103.04 65.79 C 103.47 65.2 103.86 64.58 104.27 63.97 C 104.68 63.36 105.09 62.75 105.5 62.14 C 105.9 61.53 106.31 60.92 106.72 60.31 C 107.13 59.7 107.54 59.09 107.94 58.48 C 108.35 57.87 108.76 57.26 109.17 56.65 C 109.57 56.05 109.98 55.44 110.39 54.83 C 110.8 54.22 111.21 53.61 111.61 53 C 112.02 52.39 112.43 51.78 112.84 51.17 C 113.25 50.56 113.61 49.91 114.06 49.34 C 114.52 48.77 114.99 48.18 115.57 47.74 C 116.15 47.31 116.83 46.95 117.52 46.73 C 118.2 46.51 118.97 46.4 119.69 46.42 C 120.41 46.44 121.16 46.58 121.83 46.83 C 122.51 47.08 123.17 47.47 123.73 47.93 C 124.28 48.39 124.78 48.97 125.15 49.58 C 125.52 50.19 125.79 50.9 125.95 51.61 C 126.12 52.31 126.12 53.06 126.14 53.79 C 126.16 54.53 126 55.27 126.07 55.99 C 126.14 56.71 126.14 57.61 126.53 58.11 C 126.93 58.6 127.77 58.95 128.43 58.97 C 129.08 58.99 129.84 58.56 130.47 58.21 C 131.11 57.86 131.69 57.38 132.23 56.89 C 132.77 56.4 133.23 55.82 133.71 55.27 C 134.2 54.72 134.66 54.15 135.13 53.59 C 135.61 53.03 136.08 52.47 136.55 51.91 C 137.03 51.35 137.5 50.79 137.97 50.23 C 138.45 49.67 138.92 49.11 139.4 48.55 C 139.87 47.99 140.34 47.43 140.82 46.87 C 141.29 46.31 141.76 45.75 142.24 45.19 C 142.71 44.63 143.18 44.07 143.66 43.51 C 144.13 42.95 144.6 42.39 145.08 41.83 C 145.55 41.27 146.02 40.71 146.5 40.15 C 146.97 39.59 147.41 39 147.92 38.47 C 148.43 37.94 148.94 37.39 149.54 36.99 C 150.14 36.58 150.82 36.25 151.51 36.04 C 152.2 35.83 152.96 35.73 153.68 35.75 C 154.4 35.76 155.15 35.9 155.83 36.14 C 156.51 36.38 157.19 36.74 157.76 37.18 C 158.33 37.62 158.86 38.18 159.27 38.78 C 159.68 39.37 160.01 40.06 160.21 40.76 C 160.42 41.45 160.51 42.21 160.49 42.94 C 160.47 43.66 160.27 44.39 160.08 45.1 C 159.89 45.8 159.58 46.48 159.34 47.17 C 159.09 47.86 158.84 48.55 158.59 49.24 C 158.34 49.93 158.1 50.62 157.85 51.31 C 157.6 52 157.35 52.69 157.1 53.38 C 156.85 54.07 156.61 54.76 156.36 55.45 C 156.11 56.14 155.86 56.83 155.61 57.52 C 155.37 58.21 155.12 58.9 154.87 59.59 C 154.62 60.28 154.36 60.96 154.12 61.66 C 153.89 62.35 153.61 63.04 153.44 63.75 C 153.28 64.46 153.1 65.2 153.13 65.91 C 153.15 66.63 153.31 67.38 153.59 68.04 C 153.87 68.7 154.3 69.34 154.79 69.87 C 155.28 70.4 155.9 70.83 156.52 71.22 C 157.13 71.61 157.82 71.89 158.47 72.22 C 159.13 72.55 159.82 72.81 160.44 73.18 C 161.07 73.55 161.68 73.96 162.23 74.44 C 162.78 74.92 163.26 75.5 163.72 76.06 C 164.19 76.62 164.6 77.23 165.02 77.83 C 165.44 78.43 165.86 79.03 166.23 79.66 C 166.61 80.29 166.88 80.87 167.26 81.61 C 167.65 82.35 168.33 83.69 168.55 84.11 L 168.55 96.11 L 81.27 101.4 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"ellipse",attrs:{cx:"96",cy:"112",rx:"62",ry:"46",transform:"rotate(-32 96 112)",fill:"url(#g-sheen)"},children:[]},{tag:"circle",attrs:{cx:"120.38",cy:"50.48",r:"17.16",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"154.9",cy:"40.29",r:"18.2",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"119.56",cy:"52.99",r:"13.86",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"153.5",cy:"42.71",r:"14.7",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 99.74 83.15 C 99.27 83.29 98.79 83.57 98.31 83.79 C 97.84 84.01 97.36 84.24 96.9 84.47 C 96.43 84.7 95.96 84.94 95.5 85.18 C 95.03 85.42 94.57 85.67 94.12 85.92 C 93.66 86.17 93.21 86.43 92.75 86.7 C 92.3 86.96 91.85 87.23 91.41 87.5 C 90.96 87.78 90.52 88.06 90.08 88.35 C 89.64 88.63 89.21 88.92 88.77 89.22 C 88.34 89.52 87.91 89.82 87.48 90.13 C 87.05 90.43 86.63 90.75 86.2 91.06 C 85.78 91.38 85.36 91.71 84.95 92.04 C 84.53 92.37 84.12 92.7 83.71 93.04 C 83.3 93.38 82.89 93.73 82.48 94.08 C 82.08 94.43 81.68 94.79 81.28 95.15 C 80.88 95.51 80.49 95.88 80.09 96.25 C 79.7 96.62 79.31 97 78.93 97.39 C 78.54 97.77 78.16 98.16 77.78 98.55 C 77.4 98.95 77.02 99.35 76.65 99.76 C 76.27 100.16 75.9 100.57 75.53 100.99 C 75.17 101.4 74.8 101.83 74.44 102.25 C 74.08 102.68 73.72 103.11 73.37 103.55 C 73.01 103.99 72.66 104.43 72.31 104.88 C 71.96 105.33 71.62 105.79 71.28 106.25 C 70.93 106.71 70.51 107.18 70.26 107.64 C 70.01 108.1 69.8 108.53 69.76 108.99 C 69.71 109.46 69.8 109.99 69.99 110.42 C 70.19 110.84 70.54 111.26 70.91 111.53 C 71.29 111.8 71.8 111.99 72.27 112.03 C 72.73 112.08 73.27 111.99 73.69 111.79 C 74.11 111.6 74.41 111.21 74.8 110.88 C 75.19 110.54 75.62 110.14 76.03 109.78 C 76.43 109.42 76.84 109.06 77.25 108.72 C 77.66 108.37 78.07 108.03 78.48 107.69 C 78.89 107.36 79.29 107.03 79.7 106.7 C 80.1 106.37 80.51 106.05 80.91 105.74 C 81.31 105.42 81.71 105.1 82.11 104.79 C 82.51 104.48 82.9 104.17 83.29 103.87 C 83.68 103.56 84.07 103.26 84.46 102.95 C 84.84 102.65 85.23 102.35 85.61 102.05 C 85.99 101.75 86.36 101.45 86.74 101.15 C 87.11 100.85 87.48 100.55 87.85 100.25 C 88.21 99.95 88.58 99.65 88.94 99.35 C 89.3 99.05 89.66 98.75 90.02 98.45 C 90.38 98.15 90.73 97.84 91.09 97.54 C 91.44 97.23 91.8 96.93 92.15 96.62 C 92.5 96.31 92.85 96.01 93.2 95.7 C 93.55 95.39 93.9 95.08 94.25 94.77 C 94.61 94.45 94.96 94.14 95.31 93.83 C 95.66 93.52 96.02 93.2 96.37 92.89 C 96.73 92.58 97.09 92.26 97.45 91.95 C 97.81 91.64 98.18 91.32 98.54 91.01 C 98.91 90.7 99.28 90.39 99.66 90.08 C 100.03 89.77 100.41 89.47 100.8 89.16 C 101.18 88.86 101.58 88.57 101.97 88.27 C 102.35 87.97 102.82 87.74 103.1 87.37 C 103.37 86.99 103.57 86.49 103.62 86.03 C 103.68 85.56 103.6 85.02 103.41 84.6 C 103.23 84.17 102.89 83.74 102.51 83.47 C 102.14 83.19 101.63 82.99 101.17 82.94 C 100.71 82.89 100.22 83.01 99.74 83.15 Z",fill:"#ffffff",opacity:"0.94"},children:[]},{tag:"circle",attrs:{cx:"113.33",cy:"83",r:"4.2",fill:"#ffffff",opacity:"0.85"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{class:"b-cheeks",opacity:"0.55"},children:[{tag:"ellipse",attrs:{cx:"93",cy:"173",rx:"13",ry:"7.5",fill:"url(#g-blush)"},children:[]},{tag:"ellipse",attrs:{cx:"173.08",cy:"173",rx:"11.96",ry:"7.5",fill:"url(#g-blush)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:117px 157.6px"},children:[{tag:"rect",attrs:{x:"107",width:"20",height:"38",rx:"10",y:"134",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"107",width:"20",height:"38",rx:"10",y:"131",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{class:"b-blink",style:"transform-origin:151px 157.28px"},children:[{tag:"rect",attrs:{x:"141.8",width:"18.4",height:"36.4",rx:"9.2",y:"134.8",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"141.8",width:"18.4",height:"36.4",rx:"9.2",y:"131.8",fill:"url(#g-eye)"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 109.5 140 L 124.5 150 L 109.5 160",fill:"none",stroke:"#ffffff","stroke-width":"7.98","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 158.5 140 L 143.5 150 L 158.5 160",fill:"none",stroke:"#ffffff","stroke-width":"7.98","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 106.4 152.29 C 106.4 136.18 127.6 136.18 127.6 152.29",fill:"none",stroke:"#ffffff","stroke-width":"8.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 140.4 152.29 C 140.4 136.18 161.6 136.18 161.6 152.29",fill:"none",stroke:"#ffffff","stroke-width":"8.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"114.6",width:"20",height:"32.68",rx:"10",y:"126.66",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"114.6",width:"20",height:"32.68",rx:"10",y:"123.66",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"149.4",width:"18.4",height:"29.12",rx:"9.2",y:"128.44",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"149.4",width:"18.4",height:"29.12",rx:"9.2",y:"125.44",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"106.6",width:"20.8",height:"39.52",rx:"10.4",y:"133.24",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"106.6",width:"20.8",height:"39.52",rx:"10.4",y:"130.24",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"142.35",width:"17.3",height:"18.2",rx:"8.65",y:"139.53",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"142.35",width:"17.3",height:"18.2",rx:"8.65",y:"136.53",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 106.4 153.54 C 106.4 164.98 127.6 164.98 127.6 153.54",fill:"none",stroke:"#ffffff","stroke-width":"7.22","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 140.4 153.28 C 140.4 164.73 161.6 164.73 161.6 153.28",fill:"none",stroke:"#ffffff","stroke-width":"7.22","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"smile"},children:[{tag:"path",attrs:{d:"M 127.5 182 C 130.75 186.6 137.25 186.6 140.5 182",fill:"none",stroke:"#243074","stroke-width":"4.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"ellipse",attrs:{cx:"134",cy:"184.86",rx:"4.68",ry:"5.46",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"open"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-open"},children:[{tag:"path",attrs:{d:"M 126.2 181.06 C 126.2 192.14 141.8 192.14 141.8 181.06 Z"},children:[]}]},{tag:"path",attrs:{d:"M 126.2 181.06 C 126.2 192.14 141.8 192.14 141.8 181.06 Z",fill:"#243074",stroke:"#243074","stroke-width":"2.42","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"134",cy:"189.41",rx:"4.84",ry:"3.28",fill:"#7585f9","clip-path":"url(#clip-mouth-open)"},children:[]}]},{tag:"g",attrs:{"data-mouth":"hmm"},children:[{tag:"ellipse",attrs:{cx:"137.12",cy:"183.82",rx:"3.51",ry:"3.9",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:134px 182px"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-talk"},children:[{tag:"path",attrs:{d:"M 127.5 184.29 A 6.5 4.16 0 1 0 140.5 184.29 A 6.5 4.16 0 1 0 127.5 184.29 Z"},children:[]}]},{tag:"path",attrs:{d:"M 127.5 184.29 A 6.5 4.16 0 1 0 140.5 184.29 A 6.5 4.16 0 1 0 127.5 184.29 Z",fill:"#243074",stroke:"#243074","stroke-width":"2.42","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"134",cy:"187.2",rx:"4.55",ry:"1.87",fill:"#7585f9","clip-path":"url(#clip-mouth-talk)"},children:[]}]}]},{tag:"g",attrs:{"data-mouth":"wavy"},children:[{tag:"path",attrs:{d:"M 126.53 183 C 126.84 182.76 127.77 181.74 128.39 181.56 C 129.02 181.37 129.64 181.56 130.26 181.9 C 130.89 182.24 131.51 183.15 132.13 183.6 C 132.75 184.04 133.38 184.56 134 184.56 C 134.62 184.56 135.25 184.04 135.87 183.6 C 136.49 183.15 137.11 182.24 137.74 181.9 C 138.36 181.56 138.98 181.37 139.61 181.56 C 140.23 181.74 141.16 182.76 141.47 183",fill:"none",stroke:"#243074","stroke-width":"4.05","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"sleep"},children:[{tag:"ellipse",attrs:{cx:"134",cy:"183.82",rx:"2.6",ry:"2.21",fill:"#243074"},children:[]}]}]}]}]}]},{tag:"g",attrs:{"data-fx":"sparkles"},children:[{tag:"path",attrs:{class:"b-spark b-spark-1",d:"M 36 82 Q 38.24 93.76 50 96 Q 38.24 98.24 36 110 Q 33.76 98.24 22 96 Q 33.76 93.76 36 82 Z",fill:"#5267f7"},children:[]},{tag:"path",attrs:{class:"b-spark b-spark-2",d:"M 224 88 Q 225.6 96.4 234 98 Q 225.6 99.6 224 108 Q 222.4 99.6 214 98 Q 222.4 96.4 224 88 Z",fill:"#8695f9"},children:[]},{tag:"path",attrs:{class:"b-spark b-spark-3",d:"M 204 36.5 Q 205.2 42.8 211.5 44 Q 205.2 45.2 204 51.5 Q 202.8 45.2 196.5 44 Q 202.8 42.8 204 36.5 Z",fill:"#5267f7"},children:[]}]},{tag:"g",attrs:{"data-fx":"thought"},children:[{tag:"g",attrs:{class:"b-dot b-dot-1"},children:[{tag:"circle",attrs:{cx:"190",cy:"62",r:"5.5",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"188.24",cy:"60.13",r:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-dot b-dot-2"},children:[{tag:"circle",attrs:{cx:"208",cy:"42",r:"7.5",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"205.6",cy:"39.45",r:"2.4",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-dot b-dot-3"},children:[{tag:"circle",attrs:{cx:"232",cy:"19",r:"10",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"228.8",cy:"15.6",r:"3.2",fill:"#ffffff",opacity:"0.85"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"question"},children:[{tag:"g",attrs:{class:"b-q"},children:[{tag:"path",attrs:{d:"M 206 34.84 C 206 23.92 228.36 23.92 228.36 34.84 C 228.36 43.16 217.18 43.16 217.18 52.52",fill:"none",stroke:"#5267f7","stroke-width":"7.5","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"circle",attrs:{cx:"217.18",cy:"62.92",r:"4.65",fill:"#5267f7"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"zzz"},children:[{tag:"g",attrs:{class:"b-z b-z-1"},children:[{tag:"path",attrs:{d:"M 188 62 H 201 L 188 75 H 201",fill:"none",stroke:"#5267f7","stroke-width":"5","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{class:"b-z b-z-2"},children:[{tag:"path",attrs:{d:"M 212 28 H 231 L 212 47 H 231",fill:"none",stroke:"#8695f9","stroke-width":"6","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"work"},children:[{tag:"g",attrs:{class:"b-key b-key-1"},children:[{tag:"rect",attrs:{x:"166",y:"50",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"171.28",y:"54.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-key b-key-2"},children:[{tag:"rect",attrs:{x:"194",y:"34",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"199.28",y:"38.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-key b-key-3"},children:[{tag:"rect",attrs:{x:"222",y:"54",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"227.28",y:"58.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"path",attrs:{class:"b-fly b-fly-1",d:"M 36 80 Q 37.92 90.08 48 92 Q 37.92 93.92 36 104 Q 34.08 93.92 24 92 Q 34.08 90.08 36 80 Z",fill:"#5267f7",style:"--coere-cori-fly-x:-10px"},children:[]},{tag:"path",attrs:{class:"b-fly b-fly-2",d:"M 58 44 Q 59.28 50.72 66 52 Q 59.28 53.28 58 60 Q 56.72 53.28 50 52 Q 56.72 50.72 58 44 Z",fill:"#8695f9",style:"--coere-cori-fly-x:-8px"},children:[]},{tag:"path",attrs:{class:"b-fly b-fly-3",d:"M 226 99 Q 227.44 106.56 235 108 Q 227.44 109.44 226 117 Q 224.56 109.44 217 108 Q 224.56 106.56 226 99 Z",fill:"#5267f7",style:"--coere-cori-fly-x:10px"},children:[]}]}]}};var $l={kind:"icon",svg:{tag:"svg",attrs:{viewBox:"0 0 24 24",class:"coere-cori-art",style:"--coere-cori-o-seat:12px 22.6px;--coere-cori-o-floor:12px 22.6px;--coere-cori-o-tuft:11.69px 6.6px;--coere-cori-tilt-dx:-8.53px;--coere-cori-look-k:0.12;--coere-cori-u:0.094"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"9",cy:"10",r:"16",fx:"8.4",fy:"9.4"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.32","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#485bd9"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"12",cy:"17.13",r:"10.53"},children:[{tag:"stop",attrs:{offset:"0.92","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-24",y:"-24",width:"72",height:"72"},children:[{tag:"rect",attrs:{x:"-24",y:"-24",width:"72",height:"72",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 12 6.6 C 18.36 6.6 22.6 11.64 22.6 19.2 C 22.6 21.17 20.67 22.6 18 22.6 C 15.6 22.6 14.4 22.6 12 22.6 C 9.6 22.6 8.4 22.6 6 22.6 C 3.33 22.6 1.4 21.17 1.4 19.2 C 1.4 11.64 5.64 6.6 12 6.6 Z"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 12 6.6 C 18.36 6.6 22.6 11.64 22.6 19.2 C 22.6 21.17 20.67 22.6 18 22.6 C 15.6 22.6 14.4 22.6 12 22.6 C 9.6 22.6 8.4 22.6 6 22.6 C 3.33 22.6 1.4 21.17 1.4 19.2 C 1.4 11.64 5.64 6.6 12 6.6 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"ellipse",attrs:{cx:"12.6",cy:"21.4",rx:"8",ry:"2.8",fill:"url(#g-glow)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 5.15 10.06 C 5.17 10.01 5.23 9.88 5.26 9.8 C 5.3 9.71 5.34 9.63 5.38 9.54 C 5.42 9.46 5.46 9.37 5.51 9.29 C 5.55 9.21 5.6 9.13 5.65 9.05 C 5.7 8.97 5.75 8.89 5.81 8.82 C 5.86 8.74 5.92 8.66 5.98 8.59 C 6.05 8.53 6.12 8.47 6.2 8.41 C 6.27 8.36 6.36 8.31 6.43 8.26 C 6.51 8.21 6.59 8.16 6.66 8.1 C 6.74 8.04 6.81 7.99 6.89 7.93 C 6.96 7.87 7.03 7.81 7.1 7.75 C 7.17 7.68 7.24 7.62 7.31 7.55 C 7.37 7.49 7.44 7.42 7.5 7.35 C 7.56 7.28 7.62 7.2 7.68 7.13 C 7.74 7.06 7.79 6.98 7.85 6.91 C 7.91 6.83 7.96 6.76 8.02 6.68 C 8.08 6.61 8.13 6.53 8.19 6.46 C 8.25 6.38 8.3 6.31 8.36 6.23 C 8.41 6.16 8.47 6.08 8.53 6.01 C 8.58 5.93 8.64 5.86 8.7 5.78 C 8.75 5.71 8.81 5.63 8.87 5.56 C 8.92 5.48 8.98 5.41 9.04 5.33 C 9.09 5.26 9.15 5.18 9.21 5.11 C 9.26 5.03 9.32 4.96 9.38 4.88 C 9.43 4.81 9.49 4.73 9.55 4.66 C 9.6 4.58 9.66 4.51 9.72 4.43 C 9.78 4.36 9.84 4.29 9.91 4.23 C 9.98 4.17 10.06 4.12 10.15 4.08 C 10.23 4.04 10.32 4.01 10.41 4 C 10.51 3.99 10.6 3.99 10.69 4 C 10.79 4.01 10.88 4.04 10.96 4.07 C 11.05 4.11 11.13 4.16 11.2 4.22 C 11.27 4.28 11.34 4.35 11.39 4.42 C 11.45 4.5 11.49 4.59 11.52 4.68 C 11.55 4.76 11.56 4.86 11.57 4.95 C 11.58 5.04 11.58 5.14 11.58 5.23 C 11.58 5.33 11.57 5.43 11.6 5.51 C 11.63 5.6 11.67 5.7 11.74 5.74 C 11.81 5.78 11.93 5.76 12.02 5.73 C 12.1 5.71 12.18 5.65 12.26 5.59 C 12.33 5.54 12.4 5.47 12.47 5.4 C 12.53 5.34 12.59 5.27 12.66 5.2 C 12.72 5.13 12.78 5.06 12.85 4.99 C 12.91 4.92 12.97 4.85 13.04 4.78 C 13.1 4.71 13.16 4.64 13.23 4.57 C 13.29 4.5 13.35 4.43 13.42 4.36 C 13.48 4.3 13.54 4.23 13.61 4.16 C 13.67 4.09 13.73 4.02 13.8 3.95 C 13.86 3.88 13.92 3.81 13.98 3.74 C 14.05 3.67 14.11 3.6 14.17 3.53 C 14.24 3.46 14.3 3.39 14.36 3.32 C 14.43 3.25 14.49 3.18 14.55 3.12 C 14.62 3.05 14.68 2.97 14.74 2.91 C 14.81 2.85 14.88 2.78 14.96 2.73 C 15.04 2.69 15.13 2.65 15.22 2.62 C 15.31 2.6 15.41 2.58 15.5 2.58 C 15.59 2.58 15.69 2.59 15.78 2.61 C 15.87 2.64 15.96 2.67 16.04 2.72 C 16.12 2.76 16.19 2.82 16.26 2.88 C 16.33 2.95 16.39 3.02 16.43 3.1 C 16.48 3.18 16.52 3.27 16.55 3.36 C 16.57 3.45 16.59 3.54 16.59 3.63 C 16.59 3.73 16.57 3.82 16.56 3.91 C 16.54 4 16.51 4.09 16.48 4.18 C 16.45 4.27 16.42 4.36 16.39 4.45 C 16.36 4.54 16.34 4.63 16.31 4.72 C 16.28 4.81 16.25 4.9 16.22 4.99 C 16.19 5.08 16.16 5.17 16.14 5.25 C 16.11 5.34 16.08 5.43 16.05 5.52 C 16.02 5.61 15.99 5.7 15.96 5.79 C 15.94 5.88 15.91 5.97 15.88 6.06 C 15.85 6.15 15.82 6.24 15.79 6.33 C 15.77 6.42 15.74 6.51 15.73 6.6 C 15.72 6.69 15.73 6.79 15.75 6.88 C 15.77 6.97 15.8 7.06 15.85 7.14 C 15.89 7.22 15.96 7.29 16.03 7.36 C 16.1 7.42 16.18 7.47 16.25 7.52 C 16.33 7.57 16.42 7.61 16.5 7.65 C 16.58 7.7 16.66 7.75 16.74 7.81 C 16.81 7.87 16.88 7.93 16.94 8 C 17 8.07 17.07 8.14 17.12 8.22 C 17.17 8.29 17.22 8.38 17.27 8.46 C 17.32 8.54 17.37 8.62 17.41 8.7 C 17.45 8.78 17.48 8.86 17.53 8.95 C 17.57 9.05 17.66 9.23 17.68 9.28 L 17.68 10.82 L 5.15 11.59 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"circle",attrs:{cx:"10.69",cy:"4.61",r:"2.23",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"15.74",cy:"3.28",r:"2.37",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"10.56",cy:"5",r:"1.93",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"15.52",cy:"3.65",r:"2.04",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 8.52 9.04 C 8.46 9.07 8.28 9.15 8.16 9.2 C 8.05 9.26 7.93 9.32 7.82 9.39 C 7.71 9.45 7.6 9.51 7.49 9.58 C 7.38 9.65 7.28 9.72 7.17 9.8 C 7.07 9.87 6.96 9.95 6.86 10.02 C 6.76 10.1 6.66 10.19 6.56 10.27 C 6.46 10.35 6.37 10.44 6.27 10.53 C 6.18 10.62 6.09 10.71 6 10.81 C 5.9 10.91 5.82 11 5.73 11.1 C 5.64 11.21 5.52 11.36 5.47 11.42",fill:"none",stroke:"#ffffff","stroke-width":"1.35","stroke-linecap":"round",opacity:"0.92"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:13px 16px"},children:[{tag:"rect",attrs:{x:"10",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"14",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 9.7 13.7 L 11.9 15.5 L 9.7 17.3",fill:"none",stroke:"#ffffff","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 16.3 13.7 L 14.1 15.5 L 16.3 17.3",fill:"none",stroke:"#ffffff","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 8 16 V 15 A 2 2 0 0 1 12 15 V 16 H 11 V 15 A 1 1 0 0 0 9 15 V 16 Z M 14 16 V 15 A 2 2 0 0 1 18 15 V 16 H 17 V 15 A 1 1 0 0 0 15 15 V 16 Z",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"11",y:"12",width:"2",height:"4",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"15",y:"12",width:"2",height:"4",rx:"1",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"10",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"14",y:"13",width:"2",height:"3",rx:"1",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 9 15 H 10 V 16 H 12 V 15 H 13 V 16.2 A 1 1 0 0 1 12 17 H 10 A 1 1 0 0 1 9 16.2 Z M 13.5 15 H 14.5 V 16 H 16.5 V 15 H 17.5 V 16.2 A 1 1 0 0 1 16.5 17 H 14.5 A 1 1 0 0 1 13.5 16.2 Z",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"rect",attrs:{x:"12.2",y:"19.4",width:"1.6",height:"1.6",rx:"0.8",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:13px 19.5px"},children:[{tag:"rect",attrs:{x:"12",y:"19.2",width:"2",height:"2",rx:"1",fill:"#243074"},children:[]}]}]}]}]}]}]}]}};function xx(e,t){return e.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g,(r,n,o)=>`url(${n}#${o}-${t}${n})`)}function $r(e,t){let r={};for(let[n,o]of Object.entries(e))n==="id"?r[n]=`${o}-${t}`:(n==="href"||n==="xlink:href")&&o.startsWith("#")?r[n]=`${o}-${t}`:r[n]=xx(o,t);return r}function jr(e,t){return e.children.map((r,n)=>ze(r.tag,{key:n,...$r(r.attrs,t)},...jr(r,t)))}function jl(e,t){let r={...$r(e.svg.attrs,t),"aria-hidden":"true",focusable:"false"};return ze("svg",r,...jr(e.svg,t))}function vx(e){return e<=32?$l:e<64?Bl:Ul}function gr(e){let{size:t,controller:r,mood:n="idle",label:o="Cori",tappable:i=!1}=e,s=we("coere-cori"),a=hr(null),c=vx(t),l=Ur(()=>jl(c,s),[c,s]);Dl(()=>{let u=a.current;return r&&u?r.attach(u):void 0},[r]);let d=r!==void 0,p=o===null?{"aria-hidden":"true"}:{role:"img","aria-label":o};return ze("span",{ref:a,class:bt("coere-cori",e.class),"data-art":c.kind,"data-mood":d?void 0:n,"data-tappable":i&&d?"":void 0,style:{width:`${t}px`,height:`${t}px`},onClick:i&&r?()=>r.react("cori"):void 0,...p},l)}function Gl(e){return{delay:4e3+e()*3e3,double:e()<.2}}var zl=e=>Number.isFinite(e)?Math.max(-1,Math.min(1,e)):0;function Wl(e){return e?{x:zl(e.x)*5+0,y:zl(e.y)*5+0}:{x:0,y:0}}var kx="(prefers-reduced-motion: reduce)",_x={matches:!1,addEventListener:()=>{},removeEventListener:()=>{}};function Kl(e=globalThis){return e.matchMedia?e.matchMedia(kx):_x}var Vl={cori:820,hop:620,wiggle:480,wake:520,blink:150};var Sx=540,Bt={talk:760,happy:1400,unsure:1600,coriFace:120,coriHappy:1200};function ql(e,t){switch(e){case"talk":return t?[{at:0,mood:"talking"},{at:Bt.talk,mood:"rest"}]:[{at:0,mood:"rest"}];case"happy":return[t?{at:0,mood:"happy",move:"hop"}:{at:0,mood:"happy"},{at:Bt.happy,mood:"rest"}];case"unsure":return[{at:0,mood:"confused"},{at:Bt.unsure,mood:"rest"}];case"cori":return t?[{at:0,mood:"poked",move:"cori"},{at:Bt.coriFace,mood:"happy"},{at:Bt.coriFace+Bt.coriHappy,mood:"rest"}]:[{at:0,mood:"happy"},{at:Bt.coriHappy,mood:"rest"}]}}function Yl(e){return e?[{at:0,mood:"rest",move:"wake"},{at:Sx,move:"blink"}]:[{at:0,mood:"rest"}]}function Jl(e,t){let r=new Map,n=null,o=()=>{if(n!==null&&e.clearTimeout(n),n=null,r.size===0||!t())return;let s=Math.min(...[...r.values()].map(a=>a.at));n=e.setTimeout(i,Math.max(0,s-e.now()))},i=()=>{n=null;let s=e.now(),a=[...r].filter(([,c])=>c.at<=s).sort((c,l)=>c[1].at-l[1].at);for(let[c,l]of a)r.get(c)===l&&(r.delete(c),l.run());o()};return{at(s,a,c){r.set(s,{at:e.now()+a,run:c}),o()},drop(...s){for(let a of s)r.delete(a);o()},clear(){r.clear(),o()},arm:o}}var Rx={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),now:()=>performance.now()},Tx={hidden:!1,addEventListener:()=>{},removeEventListener:()=>{}},Ax=["cori","hop","wiggle","wake"],Px=["cori","hop","wiggle","wake","blink"],Yn=e=>`is-${e}`;function Xl(e){let t=e.clock??Rx,r=e.random??Math.random,n=e.motion??Kl(),o=e.page??(typeof document>"u"?Tx:document),i=new Set,s="idle",a="idle",c={x:0,y:0},l=!1,d=()=>!n.matches,p=T=>i.forEach(T),u=Jl(t,()=>!l&&!o.hidden&&i.size>0),{at:f,drop:h}=u,w=T=>{a=T,p(ve=>ve.setAttribute("data-mood",T))},x=T=>{c=Wl(T),p(b)},b=T=>{T.style.setProperty("--coere-cori-look-x",`${c.x}px`),T.style.setProperty("--coere-cori-look-y",`${c.y}px`)},v=()=>p(T=>T.classList.remove(...Px.map(Yn).filter(ve=>T.classList.contains(ve)))),E=T=>{if(!d())return;let ve=(T==="blink"?[T]:Ax).map(Yn),Fe=[...i].filter(Je=>ve.some(If=>Je.classList.contains(If)));Fe.forEach(Je=>Je.classList.remove(...ve)),Fe[0]&&Fe[0].getBoundingClientRect(),p(Je=>Je.classList.add(Yn(T))),f(T==="blink"?"blink-end":"move-end",Vl[T],()=>p(Je=>Je.classList.remove(Yn(T))))},P=(T,ve=0)=>{let Fe=T[ve];if(!Fe)return;Fe.mood&&w(Fe.mood==="rest"?s:Fe.mood),Fe.move&&E(Fe.move);let Je=T[ve+1];Je?f("step",Je.at-Fe.at,()=>P(T,ve+1)):h("step")},q=()=>{a!=="sleeping"&&E("blink")},Q=()=>{if(!d())return h("blink");let{delay:T,double:ve}=Gl(r);f("blink",T,()=>{q(),ve&&f("blink-again",260,q),Q()})},ie=()=>{if(s!=="idle")return h("sleep");f("sleep",e.sleepAfterMs,()=>{s="sleeping",h("step"),w("sleeping")})},V=()=>{Q(),ie()},pe=()=>{u.clear(),w(s),v(),x(null)},fe=()=>{if(p(T=>T.toggleAttribute("data-alive",d())),d())return Q();h("blink","blink-again","blink-end","move-end","look"),v(),x(null)},dt=()=>{o.hidden?pe():i.size>0&&V()};return n.addEventListener("change",fe),o.addEventListener("visibilitychange",dt),{react(T){l||(s="idle",ie(),i.size>0&&P(ql(T,d())))},rest(T){l||(s=T,h("step"),w(T),(T==="thinking"||T==="working")&&E("wiggle"),ie())},look(T){l||!d()||(x(T),T?f("look",1200,()=>x(null)):h("look"))},poke(){l||(s==="sleeping"&&(s="idle",P(Yl(d()))),ie())},attach(T){if(l)return()=>{};let ve=i.size===0;return i.add(T),T.setAttribute("data-mood",a),T.toggleAttribute("data-alive",d()),b(T),ve&&!o.hidden&&V(),()=>{i.delete(T)&&i.size===0&&pe()}},dispose(){l||(l=!0,u.clear(),n.removeEventListener("change",fe),o.removeEventListener("visibilitychange",dt),i.clear())}}}function Ix({size:e=16,label:t,children:r,class:n,...o}){let i=t?{role:"img","aria-label":t}:{"aria-hidden":"true"};return m("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":"1.75","stroke-linecap":"round","stroke-linejoin":"round",focusable:"false",class:n?`coere-icon ${String(n)}`:"coere-icon",...i,...o,children:r})}function D(e,t){let r=n=>m(Ix,{...n,children:t()});return r.displayName=e,r}var Ki=D("CursorIcon",()=>m("path",{d:"M6 4.5l12 6.2-5.4 1.5-2.3 5.3z"})),Zl=D("ArrowUpRightIcon",()=>m("path",{d:"M8 16L16.5 7.5M9.5 7.5h7v7"})),Ql=D("GlobeIcon",()=>m(O,{children:[m("circle",{cx:"12",cy:"12",r:"7.75"}),m("path",{d:"M4.5 12h15M12 4.25c2.2 2.3 3.2 4.9 3.2 7.75S14.2 17.45 12 19.75C9.8 17.45 8.8 14.85 8.8 12S9.8 6.55 12 4.25z"})]})),Mx=D("PenIcon",()=>m("path",{d:"M14.5 6l3.5 3.5M5 19l1-4.5L15.8 4.7a1.5 1.5 0 012.1 0l1.4 1.4a1.5 1.5 0 010 2.1L9.5 18z"})),Lx=D("SendPlaneIcon",()=>m("path",{d:"M19.5 4.5L10.5 13.5M19.5 4.5l-5.5 15-3.5-6-6-3.5z"})),Ox=D("CalendarIcon",()=>m(O,{children:[m("rect",{x:"4.5",y:"5.5",width:"15",height:"14",rx:"2.25"}),m("path",{d:"M4.5 10h15M8.5 3.5v4M15.5 3.5v4"})]})),Nx=D("SaveIcon",()=>m("path",{d:"M4.5 13.5v4.25c0 .97.78 1.75 1.75 1.75h11.5c.97 0 1.75-.78 1.75-1.75V13.5M8.5 10l2.5 2.5 4.5-5"})),Dx=D("OpenIcon",()=>m(O,{children:[m("rect",{x:"4.5",y:"5",width:"15",height:"14",rx:"2.25"}),m("path",{d:"M4.5 9h15"})]}));function br(e){return!0}var Te=e=>t=>{br(t)&&e()};var Hx={working:["take_over","go_to_chat","stop"],waiting:["take_over","go_to_chat","stop"],taken_over:["hand_back","stop"],result:["go_to_chat"]},Fx={take_over:y.TAKE_OVER,hand_back:y.HAND_BACK,go_to_chat:y.GO_TO_CHAT,stop:y.STOP};function Bx(e){return e.mode==="taken_over"?y.YOU_HAVE_CONTROL:e.mode==="waiting"?y.WAITING_FOR_YOU:e.mode==="result"?e.result??"":e.step||y.WORKING_ON_TASK}function Vi({model:e,onPress:t}){let r=e.worker===null?y.CONTROLLED:y.controlledWorker(e.worker);return m("div",{class:"coere-act-bar",role:"region","aria-label":r,"data-mode":e.mode,children:[m("p",{class:"coere-act-bar-head",children:[m(Ki,{size:13}),m("span",{children:r})]}),m("div",{class:"coere-act-bar-row",children:[m(Ux,{resting:e.mode==="working"||e.mode==="waiting"}),m("p",{class:"coere-act-bar-step",role:"status","aria-live":"polite",children:Bx(e)}),m("div",{class:"coere-act-bar-buttons",children:Hx[e.mode].map(n=>m("button",{type:"button",class:"coere-act-bar-btn","data-button":n,onClick:Te(()=>t(n)),children:[m("span",{children:Fx[n]}),n==="go_to_chat"&&m(Zl,{size:14})]},n))})]})]})}function Ux({resting:e}){let t=Ur(()=>Xl({sleepAfterMs:Number.MAX_SAFE_INTEGER}),[]);return tt(()=>t.rest(e?"working":"idle"),[t,e]),tt(()=>()=>t.dispose(),[t]),m(gr,{size:28,controller:t,label:null,class:"coere-act-bar-cori"})}function ed({size:e=16,label:t,class:r}){let n=m("svg",{class:"coere-spinner-svg",viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":"2.5","stroke-linecap":"round","aria-hidden":"true",focusable:"false",children:[m("circle",{cx:"12",cy:"12",r:"9",opacity:"0.18"}),m("path",{d:"M21 12a9 9 0 00-9-9"})]});return t?m("span",{class:bt("coere-spinner",r),role:"status",children:[n,m("span",{class:"coere-sr-only",children:t})]}):m("span",{class:bt("coere-spinner",r),children:n})}function $({variant:e="secondary",size:t="md",icon:r,iconEnd:n,loading:o=!1,block:i=!1,type:s="button",disabled:a,class:c,children:l,...d}){return m("button",{type:s,class:bt("coere-btn",`coere-btn--${e}`,`coere-btn--${t}`,i&&"coere-btn--block",c),disabled:!!a||o,"aria-busy":o||void 0,...d,children:[o?m(ed,{size:t==="sm"?13:15}):r,l!=null&&m("span",{class:"coere-btn-label",children:l}),n]})}var td=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
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
`;var rd=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 65">
<defs><linearGradient id="fold" x1="50%" y1="8.6%" x2="50%" y2="100%"><stop offset="0" stop-color="#1a237e" stop-opacity=".2"/><stop offset="1" stop-color="#1a237e" stop-opacity=".02"/></linearGradient></defs>
<path fill="#4285f4" d="M29.375 0H4.406C1.983 0 0 1.994 0 4.432v56.136C0 63.006 1.983 65 4.406 65h38.188C45.017 65 47 63.006 47 60.568V17.727L29.375 0z"/>
<path fill="url(#fold)" d="M30.664 16.431L47 32.858V17.727z"/>
<path fill="#f1f1f1" d="M11.75 47.273h23.5v-2.955h-23.5zm0 5.909h17.625v-2.955H11.75zm0-20.682v2.955h23.5V32.5zm0 8.864h23.5v-2.955h-23.5z"/>
<path fill="#a1c2fa" d="M29.375 0v13.295c0 2.449 1.972 4.432 4.406 4.432H47z"/>
</svg>
`;var nd=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66">
<path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
<path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
<path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
<path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
<path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
</svg>`;var id=["svg","g","path","circle","ellipse","rect","line","polyline","polygon","defs","linearGradient","radialGradient","stop","clipPath","mask"],zx=new Map([...id,"viewBox","gradientTransform","gradientUnits","preserveAspectRatio","clipPathUnits","maskUnits","maskContentUnits","spreadMethod"].map(e=>[e.toLowerCase(),e])),Wx=new Set(id);function od(e){return zx.get(e.toLowerCase())??e}function Kx(e,t){let r=e.toLowerCase();if(r.startsWith("on")||r.startsWith("xmlns")||r==="style")return!1;if(r==="href"||r==="xlink:href")return t.startsWith("#");let n=t.match(/url\(([^)]*)\)/gi);return!n||n.every(o=>/^url\(\s*['"]?#/i.test(o))}function sd(e){let t=od(e.localName);if(!Wx.has(t))return null;let r={};for(let o of Array.from(e.attributes))Kx(o.name,o.value)&&(r[od(o.name)]=o.value);let n=[];for(let o of Array.from(e.children)){let i=sd(o);i&&n.push(i)}return{tag:t,attrs:r,children:n}}function ad(e){if(!e.trim())return null;let t=new DOMParser().parseFromString(e,"image/svg+xml"),r=t.documentElement;return!r||r.localName.toLowerCase()!=="svg"||t.getElementsByTagName("parsererror").length>0?null:sd(r)}var Vx={gmail:nd,calendar:td,docs:rd},qi=new Map;function qx(e){if(!qi.has(e)){let t=ad(Vx[e]);qi.set(e,t&&t.children.length>0?t:null)}return qi.get(e)??null}function Ut({icon:e,size:t=16}){let r=we("coere-site"),n=e==="globe"?null:qx(e);if(!n)return m(Ql,{size:t,class:"coere-act-site-globe"});let{width:o,height:i,...s}=n.attrs;return ze("svg",{...$r(s,r),class:"coere-act-site","data-site":e,width:t,height:t,"aria-hidden":"true",focusable:"false"},...jr(n,r))}var Yi=e=>`f${e.id}`;function cd({model:e,onAnswer:t}){let r=e.form,n=we("coere-act-form"),[o,i]=et({});tt(()=>i({}),[e.step]);let s=p=>Te(()=>t(p,o)),a=(p,u)=>i(f=>{let h={...f};return u===p.value?delete h[Yi(p)]:h[Yi(p)]=u,h}),c=new Set([...r.filled,...r.blank,...r.yours].map(p=>p.page)).size>1,l=(p,u)=>u.length===0?null:m("section",{class:"coere-act-form-part","aria-label":p,children:[m("h3",{class:"coere-act-form-head",children:[p," ",m("span",{class:"coere-act-form-count",children:u.length})]}),u.map(f=>m(Yx,{row:f,value:o[Yi(f)]??f.value,pages:c,copy:r.mode==="copy",onEdit:h=>a(f,h)},f.id))]}),d=r.mode==="fill"?C.FILL_IN:r.canSubmit?C.SUBMIT:C.GO_ON;return m("section",{class:"coere-act-card coere-act-review coere-act-form","aria-labelledby":n,children:[m("p",{id:n,class:"coere-act-card-title",children:[m(Ut,{icon:e.site.icon}),m("span",{children:r.mode==="review"?C.REVIEW_TITLE:r.mode==="fill"?C.FILL_TITLE:C.COPY_TITLE})]}),m("p",{class:"coere-act-card-line",children:e.line}),r.errors.length>0&&m("div",{class:"coere-act-form-errors",role:"alert",children:[m("strong",{children:C.PAGE_ERRORS}),m("ul",{children:r.errors.map(p=>m("li",{children:p},p))})]}),m("div",{class:"coere-act-form-body",children:[l(C.SECTION_FILLED,r.filled),l(C.SECTION_BLANK,r.blank),l(C.SECTION_YOURS,r.yours)]}),m("div",{class:"coere-act-actions",children:[r.mode!=="copy"&&m($,{variant:"primary",size:"sm",onClick:s("allow"),children:d}),r.mode==="review"&&m($,{size:"sm",onClick:s(0),children:C.NOT_NOW}),r.mode==="fill"&&e.allowForTask&&m($,{size:"sm",onClick:s("allow_task"),children:y.ALLOW_FOR_TASK}),r.mode==="copy"&&m($,{variant:"primary",size:"sm",onClick:s(0),children:C.DONE}),m($,{variant:"quiet",size:"sm",class:"coere-act-stop",onClick:s("stop"),children:y.STOP})]})]})}function Yx({row:e,value:t,pages:r,copy:n,onEdit:o}){let i=we("coere-act-form-field"),[s,a]=et(!1),c=t.length>60||t.includes(`
`),l=u=>o(u.currentTarget.value),d;e.editable?e.options.length>0&&!e.multiple?d=m("select",{id:i,class:"coere-act-input",value:t,onChange:l,children:[m("option",{value:"",children:""}),e.options.map(u=>m("option",{value:u,children:u},u))]}):c?d=m("textarea",{id:i,class:"coere-act-input",rows:4,value:t,onInput:l}):d=m("input",{id:i,class:"coere-act-input",type:"text",value:t,onInput:l}):d=m("span",{class:"coere-act-field-value",children:t});let p=Te(()=>{navigator.clipboard?.writeText(t).then(()=>a(!0))});return m("div",{class:"coere-act-form-row","data-long":c?"":void 0,children:[m("label",{class:"coere-act-field-label",for:e.editable?i:void 0,children:[e.label,e.required&&m("span",{class:"coere-act-form-req",children:[" ",C.REQUIRED]}),r&&m("span",{class:"coere-act-form-page",children:[" ",C.pageOf(e.page)]})]}),m("div",{class:"coere-act-form-value",children:[d,n&&t!==""&&m("button",{type:"button",class:"coere-act-chip",onClick:p,children:s?C.COPIED:C.COPY})]}),e.note&&m("p",{class:"coere-act-form-note",children:e.note})]})}function Ji({model:e,onAnswer:t}){return e.form?m(cd,{model:e,onAnswer:t}):m(Jx,{model:e,onAnswer:t})}function Jx({model:e,onAnswer:t}){let r=we("coere-act-review"),[n,o]=et({});tt(()=>o({}),[e.step]);let i=s=>Te(()=>t(s,n));return m("section",{class:"coere-act-card coere-act-review","aria-labelledby":r,children:[m("p",{id:r,class:"coere-act-card-title",children:[m(Ut,{icon:e.site.icon}),m("span",{children:e.line})]}),e.reason&&m("p",{class:"coere-act-card-line",children:e.reason}),e.fields.length>0&&m("div",{class:"coere-act-fields",children:e.fields.map(s=>m(Zx,{field:s,value:n[s.label]??s.value,onEdit:a=>o(c=>Xx(c,s,a))},s.label))}),e.choices.length>0?m("div",{class:"coere-act-chips",role:"group","aria-labelledby":r,children:e.choices.map((s,a)=>m("button",{type:"button",class:"coere-act-chip",onClick:i(a),children:s},s))}):null,m("div",{class:"coere-act-actions",children:[e.choices.length===0&&m($,{variant:"primary",size:"sm",onClick:i("allow"),children:y.ALLOW}),e.choices.length===0&&e.allowForTask&&m($,{size:"sm",onClick:i("allow_task"),children:y.ALLOW_FOR_TASK}),m($,{variant:"quiet",size:"sm",class:"coere-act-stop",onClick:i("stop"),children:y.STOP})]})]})}function Xx(e,t,r){let n={...e};return r===t.value?delete n[t.label]:n[t.label]=r,n}function Zx({field:e,value:t,onEdit:r}){let n=we("coere-act-field"),o=e.label===y.FIELD_LABELS.body;if(!e.editable)return m("div",{class:"coere-act-field","data-long":o?"":void 0,children:[m("span",{class:"coere-act-field-label",children:e.label}),m("span",{class:"coere-act-field-value",children:e.value})]});let i=s=>r(s.currentTarget.value);return m("div",{class:"coere-act-field is-editable","data-long":o?"":void 0,children:[m("label",{class:"coere-act-field-label",for:n,children:e.label}),o?m("textarea",{id:n,class:"coere-act-input",rows:5,value:t,onInput:i}):m("input",{id:n,class:"coere-act-input",type:"text",value:t,onInput:i})]})}function ld({label:e,size:t="md",type:r="button",class:n,children:o,...i}){return m("button",{type:r,"aria-label":e,title:e,class:bt("coere-icon-btn",`coere-icon-btn--${t}`,n),...i,children:o})}var t9=D("HomeIcon",()=>m(O,{children:[m("path",{d:"M4.25 10.5L12 4.25l7.75 6.25"}),m("path",{d:"M6.25 9v9.25c0 .69.56 1.25 1.25 1.25h9c.69 0 1.25-.56 1.25-1.25V9"}),m("path",{d:"M10 19.5v-4.25c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v4.25"})]})),Qx=D("SearchIcon",()=>m(O,{children:[m("circle",{cx:"11",cy:"11",r:"6.5"}),m("path",{d:"M20 20l-4.35-4.35"})]})),dd=D("CloseIcon",()=>m("path",{d:"M6.5 6.5l11 11M17.5 6.5l-11 11"})),r9=D("ChevronUpIcon",()=>m("path",{d:"M6.5 14.5L12 9l5.5 5.5"})),n9=D("ChevronDownIcon",()=>m("path",{d:"M6.5 9.5L12 15l5.5-5.5"})),o9=D("ChevronRightIcon",()=>m("path",{d:"M9.5 6.5L15 12l-5.5 5.5"})),i9=D("ChevronLeftIcon",()=>m("path",{d:"M14.5 6.5L9 12l5.5 5.5"})),s9=D("ExternalLinkIcon",()=>m(O,{children:[m("path",{d:"M14 4.5h5.5V10M19.5 4.5L11.5 12.5"}),m("path",{d:"M17.5 13.5v4.25a1.75 1.75 0 01-1.75 1.75h-9.5a1.75 1.75 0 01-1.75-1.75v-9.5A1.75 1.75 0 016.25 6.5h4.25"})]})),a9=D("MinimizeIcon",()=>m("path",{d:"M4.5 19.5L10 14M5.5 14H10v4.5M19.5 4.5L14 10M18.5 10H14V5.5"}));var ud=[["mode_rewrite",y.MODE_REWRITE],["mode_improve",y.MODE_IMPROVE],["mode_grammar",y.MODE_GRAMMAR]];function pd({onPress:e}){let t=hr(null);return tt(()=>{t.current?.querySelector("button")?.focus()},[]),m("div",{class:"coere-act-modes",ref:t,onKeyDown:n=>{let o=["1","2","3"].indexOf(n.key);o<0||!br(n)||(n.preventDefault(),n.stopPropagation(),e(ud[o][0]))},children:ud.map(([n,o],i)=>m($,{size:"sm",variant:i===0?"primary":"secondary",onClick:Te(()=>e(n)),children:[m("kbd",{"aria-hidden":"true",children:i+1}),o]},n))})}function fd({onPress:e}){return m("div",{class:"coere-act-review",children:[m(gr,{size:20,mood:"happy",label:null}),m($,{variant:"primary",size:"sm",onClick:Te(()=>e("looks_good")),children:y.LOOKS_GOOD}),m($,{size:"sm",onClick:Te(()=>e("go_back")),children:y.GO_BACK})]})}function e1(e,t){let r=e.ownerDocument,n=r.createElement("textarea");n.value=t,n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;left:-9999px;top:0;opacity:0",(e.parentElement??r.body).append(n),n.select();let o=r.execCommand?.("copy")===!0;n.remove(),o||r.defaultView?.navigator.clipboard?.writeText(t).catch(()=>{})}function md({text:e,edits:t,onPress:r}){let n=o=>{br(o)&&(e1(o.currentTarget,e),r("copy"))};return m(O,{children:[m("div",{class:"coere-act-rewrite-text",children:[m("p",{class:"coere-act-rewrite-now",children:e}),t.length>0&&m("ul",{class:"coere-act-edits",children:t.map((o,i)=>m("li",{class:"coere-act-edit",children:[o.old&&m("s",{children:o.old}),o.now&&m("ins",{children:o.now})]},i))})]}),m("div",{class:"coere-act-actions",children:m($,{variant:"primary",size:"sm",onClick:n,children:y.COPY})})]})}function Jn({model:e,mac:t,onPress:r}){let n=we("coere-act-rewrite"),o=a=>Te(()=>r(a)),i=a=>{a.key==="Escape"&&br(a)&&(a.stopPropagation(),r(e.state==="review"?"go_back":"close"))},s=e.mode?y.modeName(e.mode):y.MENU_REWRITE;return e.state==="review"?m("section",{class:"coere-act-card coere-act-rewrite","aria-label":s,"data-state":"review",onKeyDown:i,children:m(fd,{onPress:r})}):e.state==="picker"?m("section",{class:"coere-act-card coere-act-rewrite","aria-labelledby":n,"data-state":"picker",onKeyDown:i,children:[m("p",{id:n,class:"coere-act-card-title",children:y.MENU_REWRITE}),m(pd,{onPress:r})]}):m("section",{class:"coere-act-card coere-act-rewrite","aria-labelledby":n,"data-state":e.state,onKeyDown:i,children:[m("div",{class:"coere-act-rewrite-head",children:[m(gr,{size:20,mood:e.state==="working"?"working":"happy",label:null}),m("p",{id:n,class:"coere-act-card-title",role:"status",children:t1(e,t)}),m(ld,{label:y.CLOSE,size:"sm",onClick:o("close"),children:m(dd,{})})]}),e.state==="preview"&&m(O,{children:[m("div",{class:"coere-act-rewrite-text",children:[m("s",{class:"coere-act-rewrite-was",children:e.original}),m("p",{class:"coere-act-rewrite-now",children:e.rewrite})]}),m("div",{class:"coere-act-chips",children:[m("button",{type:"button",class:"coere-act-chip",onClick:o("shorter"),children:y.SHORTER}),m("button",{type:"button",class:"coere-act-chip",onClick:o("more_formal"),children:y.MORE_FORMAL})]}),m("div",{class:"coere-act-actions",children:[m($,{variant:"primary",size:"sm",onClick:o("accept"),children:y.ACCEPT}),m($,{size:"sm",onClick:o("try_again"),children:y.TRY_AGAIN})]})]}),(e.state==="paste"||e.state==="copied")&&m(md,{text:e.rewrite,edits:e.edits??[],onPress:r}),e.state==="check"&&m("div",{class:"coere-act-actions",children:[m($,{variant:"primary",size:"sm",onClick:o("yes"),children:y.YES}),m($,{size:"sm",onClick:o("undo"),children:y.UNDO})]}),e.state==="done"&&e.undoLeft!==null&&e.undoLeft>0&&m("div",{class:"coere-act-actions",children:m($,{size:"sm",onClick:o("undo"),children:y.UNDO})})]})}function t1(e,t){switch(e.state){case"working":return e.original?y.REWRITING:y.pressCopy(t);case"preview":return y.REWRITING;case"copied":return y.copiedPaste(t);case"paste":return y.pasteLine(t);case"check":return y.DID_IT_GO_IN;case"done":return y.REWRITTEN;case"none":return y.NOTHING_TO_CHANGE;case"picker":case"review":return y.MENU_REWRITE}}var r1=D("CheckIcon",()=>m("path",{d:"M5 12.5l4.5 4.5L19 7.5"})),T9=D("AlertIcon",()=>m(O,{children:[m("path",{d:"M10.4 4.9a1.85 1.85 0 013.2 0l6.95 12.1a1.85 1.85 0 01-1.6 2.75H5.05a1.85 1.85 0 01-1.6-2.75z"}),m("path",{d:"M12 9.75v3.5M12 16.25v.01"})]})),A9=D("InfoIcon",()=>m(O,{children:[m("circle",{cx:"12",cy:"12",r:"8.5"}),m("path",{d:"M12 11.25v4.75M12 8v.01"})]})),P9=D("ClockIcon",()=>m(O,{children:[m("circle",{cx:"12",cy:"12",r:"8.5"}),m("path",{d:"M12 7.5V12l3 2"})]})),n1=D("EyeIcon",()=>m(O,{children:[m("path",{d:"M2.75 12S6.1 5.75 12 5.75 21.25 12 21.25 12 17.9 18.25 12 18.25 2.75 12 2.75 12z"}),m("circle",{cx:"12",cy:"12",r:"2.75"})]}));var rt={color:"#5267f7",band:14,from:.55,to:.85,breathMs:2400,still:2,reduced:.7},We={maxWidth:560,gutter:16,bottom:16,stackBelow:480,radius:16},Xi={width:360,gap:8};function Zi(e,t,r=0){let n=Math.min(We.maxWidth,e.width-2*We.gutter),o=(e.width-n)/2;return{x:Math.min(Math.max(o+r,We.gutter),e.width-We.gutter-n),y:e.height-We.bottom-t,width:n,height:t,stacked:e.width<We.stackBelow}}function hd(e,t,r){let n=Math.min(Xi.width,e.width-2*We.gutter),o=Math.min(Math.max(t.x,We.gutter),e.width-We.gutter-n),i=t.y+t.height+Xi.gap,s=i+r<=e.height-We.gutter?i:Math.max(We.gutter,t.y-Xi.gap-r);return{x:o,y:s,width:n,height:r}}var Gr={cols:"ABCDEFGH",rows:6};function gd(e,t){let r=/^([A-H])([1-6])$/.exec(e);if(!r)return null;let n=t.width/Gr.cols.length,o=t.height/Gr.rows;return{x:Gr.cols.indexOf(r[1])*n,y:(Number(r[2])-1)*o,width:n,height:o}}function bd(e){let t=[];for(let r=1;r<=Gr.rows;r++)for(let n of Gr.cols)t.push({cell:`${n}${r}`,box:gd(`${n}${r}`,e)});return t}function Zn(e,t){let r=gd(e.cell,t),n=o=>Number.isFinite(o)&&o>=0&&o<=1;return!r||!n(e.x)||!n(e.y)?null:{x:Math.round(r.x+e.x*r.width),y:Math.round(r.y+e.y*r.height)}}var Xn={height:16,pad:8,digit:7};function wd(e,t){let r=[];for(let{n,rect:o}of e){if(!(o.x<t.width&&o.x+o.width>0&&o.y<t.height&&o.y+o.height>0))continue;let s=Xn.pad+String(n).length*Xn.digit,a={x:Math.min(Math.max(o.x,0),t.width-s),y:Math.min(Math.max(o.y,0),t.height-Xn.height),width:s,height:Xn.height};r.push({n,tag:a,outline:o})}return r}var o1=220,i1={review:52,picker:96,working:64,none:52};function Qi({state:e,mac:t,onPress:r,drag:n=0,onDrag:o}){let[i,s]=et(n),a=hr(null),c=f=>{let h=f.currentTarget;if(f.button!==0||f.target.closest("button, input, textarea, a"))return;let w=h.ownerDocument.defaultView??window,x={width:w.innerWidth,height:w.innerHeight},b=Zi(x,0);a.current={startX:f.clientX,from:i,limit:Math.max(0,b.x-Zi(x,0,-x.width).x)},h.setPointerCapture(f.pointerId)},l=f=>{let h=a.current;h&&s(Math.max(-h.limit,Math.min(h.limit,h.from+f.clientX-h.startX)))},d=()=>{a.current&&a.current.from!==i&&o?.(i),a.current=null},p=e.rewrite&&e.rewriteAt?s1(e.rewriteAt,i1[e.rewrite.state]??o1):null,u=e.cardOnly===!0;return m("div",{class:"coere-root coere-act-overlay","data-hidden":e.visible?void 0:"",children:[!u&&m(ji,{mode:e.glow}),m("div",{class:"coere-act-dock",style:{"--coere-act-x":`${i}px`},onPointerDown:c,onPointerMove:l,onPointerUp:d,onPointerCancel:d,children:[e.card&&m("div",{class:"coere-act-dock-card coere-enter","data-wide":e.card.form?"":void 0,children:m(Ji,{model:e.card,onAnswer:(f,h)=>r({kind:"card",step:e.card?.step??0,choice:f,edited:h})})}),e.rewrite&&!p&&m("div",{class:"coere-act-dock-card coere-enter",children:m(Jn,{model:e.rewrite,mac:t,onPress:f=>r({kind:"rewrite",button:f})})}),!u&&m(Vi,{model:e.bar,onPress:f=>r({kind:"bar",button:f})})]}),e.rewrite&&p&&m("div",{class:"coere-act-float coere-enter",style:{left:`${p.x}px`,top:`${p.y}px`,width:`${p.width}px`},children:m(Jn,{model:e.rewrite,mac:t,onPress:f=>r({kind:"rewrite",button:f})})})]})}function s1(e,t){let r={width:window.innerWidth,height:window.innerHeight};return hd(r,e,t)}var yd=`:root, :host, [data-theme='light'] { --coere-cori-floor: #080e24; --coere-cori-floor-o: 0.2; --coere-cori-glow-o: 0.3; }
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
`;var a1=`.coere-cori { position: relative; display: inline-block; flex: none; vertical-align: middle; line-height: 0; }
.coere-cori[data-tappable] { cursor: pointer; user-select: none; -webkit-user-select: none; }
`,xd=a1+yd;var vd=`/* Pill buttons. They press down a little, which reads as physical without being loud. */
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
`;var kd=`.coere-checkbox {
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
`;var _d=`/*
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
`;var Sd=`/*
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
`;var Ed=`.coere-kbd {
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
`;var Cd=`.coere-tabs {
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
`;var Rd=`.coere-toggle {
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
`;var Td=`.coere-empty {
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
`;var Ad=`.coere-progress {
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
`;var Pd=`.coere-spinner {
  display: inline-flex;
  flex: none;
  line-height: 0;
  vertical-align: middle;
}

.coere-spinner-svg {
  animation: coere-spin 700ms linear infinite;
}
`;var Id=`.coere-stat {
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
`;var Md=`/*
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
`;var Ld=`.coere-hl-mark {
  padding: 0 2px;
  margin: 0 -1px;
  border-radius: 4px;
  background: var(--coere-mark-bg);
  color: var(--coere-mark-fg);
  font-weight: 550;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
`;var Od=`/* The capsule card: lavender fill, a 1 px tint border, 16 px corners. */
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
`;var Nd=`.coere-results {
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
`;var Dd=`.coere-row {
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
`;var Hd=`/* Platform logos keep their own colors. Single color marks follow the text color. */
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
`;var Fd=`/*
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
`;var Bd=`/*
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
`;var Ud=`/*
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
`;var T1=[Hd,vd,_d,Sd,Rd,kd,Ed,Cd,Pd,Ad,Td,Id,Md,Ld,Od,Dd,Nd],$d=[Ud,Fd,Bd,...T1].join(`
`);var jd=`
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
`;var Gd=`
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
`;var zd=`
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
`;var Wd=`
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
`;var Kd=[zd,jd,Gd,Wd].join(`
`),es=[$d,xd,Kd].join(`
`);var ts=`
/* In the page's dock the card takes up to 460 px, for a label and a value on each row. */
.coere-act-dock-card[data-wide] {
  width: min(460px, 100%);
}

.coere-act-form {
  width: min(460px, calc(100vw - 32px));
  max-width: 100%;
  box-sizing: border-box;
}

.coere-act-form-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: min(52vh, 460px);
  margin: 0 -16px;
  padding: 2px 16px 4px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.coere-act-form-part {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coere-act-form-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-xs);
  font-weight: 650;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.coere-act-form-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--coere-radius-pill);
  background: var(--coere-fill-quiet);
  color: var(--coere-fg-muted);
  font-size: var(--coere-text-2xs);
  font-variant-numeric: tabular-nums;
}

.coere-act-form-row {
  display: grid;
  grid-template-columns: minmax(96px, 38%) minmax(0, 1fr);
  align-items: baseline;
  gap: 2px 10px;
  padding: 8px 10px;
  border-radius: var(--coere-radius-md);
  background: var(--coere-fill-quiet);
}

.coere-act-form-row[data-long] {
  grid-template-columns: minmax(0, 1fr);
}

.coere-act-form-row .coere-act-field-label {
  overflow-wrap: anywhere;
}

.coere-act-form-value {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.coere-act-form-value > .coere-act-input,
.coere-act-form-value > .coere-act-field-value {
  flex: 1 1 auto;
  min-width: 0;
}

.coere-act-form-value select.coere-act-input {
  height: 30px;
}

.coere-act-form-note {
  grid-column: 1 / -1;
  margin: 2px 0 0;
  color: var(--coere-fg-subtle);
  font-size: var(--coere-text-2xs);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.coere-act-form-req,
.coere-act-form-page {
  color: var(--coere-fg-subtle);
  font-size: var(--coere-text-2xs);
}

.coere-act-form-errors {
  padding: 8px 12px;
  border-left: 3px solid var(--coere-accent-text);
  border-radius: var(--coere-radius-sm);
  background: var(--coere-tint);
  font-size: var(--coere-text-xs);
}

.coere-act-form-errors ul {
  margin: 4px 0 0;
  padding-left: 18px;
}
`;var rs=`
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
`;var $t=(e,t,r)=>Math.min(r,Math.max(t,e));function Vd(e,t=100){if(e===void 0)return 1;let r=Number.parseFloat(e);return Number.isNaN(r)?null:e.trim().endsWith("%")?r/t:r}function A1(e){let[t="",r]=e.split("/"),n=t.split(/[\s,]+/).filter(Boolean);return r!==void 0?{parts:n,alpha:r.trim()}:{parts:n.slice(0,3),alpha:n[3]}}function qd(e,t){let r=$t(e,0,1),n=r<=.0031308?r*12.92:1.055*r**(1/2.4)-.055,o=Math.round(n*255);return{r:o,g:o,b:o,a:t}}function P1(e){let t=e.length<=4?[...e].map(n=>n+n).join(""):e;if(!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(t))return null;let r=n=>Number.parseInt(t.slice(n,n+2),16);return{r:r(0),g:r(2),b:r(4),a:t.length===8?r(6)/255:1}}function Yd(e){let t=e.trim().toLowerCase();if(t==="transparent")return{r:0,g:0,b:0,a:0};if(t.startsWith("#"))return P1(t.slice(1));let r=/^([a-z]+)\((.*)\)$/.exec(t);if(!r)return null;let[,n="",o=""]=r,i=n==="color"?/^\s*([a-z0-9-]+)\s+/.exec(o):null;if(n==="color"&&i?.[1]!=="srgb")return null;let{parts:s,alpha:a}=A1(i?o.slice(i[0].length):o),c=Vd(a);if(c===null)return null;if(n==="rgb"||n==="rgba"){let l=s.slice(0,3).map(f=>f.endsWith("%")?Number.parseFloat(f)/100*255:Number(f));if(l.length!==3||l.some(f=>Number.isNaN(f)))return null;let[d=0,p=0,u=0]=l;return{r:d,g:p,b:u,a:$t(c,0,1)}}if(n==="color"){let l=s.map(Number);if(l.length!==3||l.some(f=>Number.isNaN(f)))return null;let[d=0,p=0,u=0]=l.map(f=>Math.round($t(f,0,1)*255));return{r:d,g:p,b:u,a:$t(c,0,1)}}if(n==="oklch"||n==="oklab"){let l=Vd(s[0]);return l===null?null:qd(l**3,$t(c,0,1))}if(n==="lab"||n==="lch"){let l=Number.parseFloat(s[0]??"");if(Number.isNaN(l))return null;let d=(l+16)/116;return qd(l>8?d**3:l/903.3,$t(c,0,1))}return null}function ns(e){let t=$t(e,0,255)/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function Jd(e){let t=.2126*ns(e.r)+.7152*ns(e.g)+.0722*ns(e.b);return 1.05/(t+.05)>(t+.05)/.05}function Xd(e,t=Object.is){let r=e,n=new Set,o=i=>{if(!t(r,i)){r=i;for(let s of[...n])try{s(r)}catch{}}};return{get:()=>r,set:o,update:i=>o(i(r)),subscribe(i){return n.add(i),()=>n.delete(i)}}}var Zd=32,I1=5e3,M1=["class","style","data-theme","data-mode","data-color-mode","data-color-scheme"];function L1(e,t){return t?e===t||t.contains(e):!1}function*O1(e,t,r){let o=(typeof t.elementsFromPoint=="function"?t.elementsFromPoint(e.innerWidth-Zd,e.innerHeight-Zd):[]).find(i=>!L1(i,r));for(let i=o;i;i=i.parentElement)yield i;t.body&&(yield t.body),yield t.documentElement}function N1(e,t){let r=e.getComputedStyle(t.documentElement).colorScheme??"";return/\bdark\b/.test(r)?/\blight\b/.test(r)?e.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light":"dark":"light"}function Qd(e,t,r){for(let n of O1(e,t,r)){let o=Yd(e.getComputedStyle(n).backgroundColor);if(o&&o.a>=.5)return Jd(o)?"dark":"light"}return N1(e,t)}function eu(e,t,r){let n=Xd(Qd(e,t,r)),o=!1,i=()=>{o||(o=!0,e.requestAnimationFrame(()=>{o=!1,n.set(Qd(e,t,r))}))},s=new MutationObserver(i),a={attributes:!0,attributeFilter:M1};s.observe(t.documentElement,a),t.body&&s.observe(t.body,a),t.head&&s.observe(t.head,{childList:!0});let c=e.matchMedia?.("(prefers-color-scheme: dark)");c?.addEventListener("change",i);let l=e.setInterval(i,I1);return{get:n.get,subscribe:n.subscribe,refresh:i,stop(){s.disconnect(),c?.removeEventListener("change",i),e.clearInterval(l)}}}var os="coere.actions.bar";function D1(e){return typeof e!="object"||e===null||Array.isArray(e)?{}:Object.fromEntries(Object.entries(e).filter(t=>typeof t[1]=="number"&&Number.isFinite(t[1])))}function H1(e,t){let r=async()=>D1((await e.get(os))[os]);return{async read(){try{return(await r())[t]??0}catch{return 0}},async write(n){try{let o=await r();delete o[t];let i=Object.entries({...o,[t]:Math.round(n)}).slice(-50);await e.set({[os]:Object.fromEntries(i)})}catch{}}}}var tu=e=>H1(chrome.storage.local,e);function F1(e){let t=e.activeElement,r=t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement?t:null,n=e.getSelection(),o=r?r.getBoundingClientRect():n&&n.rangeCount>0?n.getRangeAt(0).getBoundingClientRect():null;return!o||o.width<=0||o.height<=0?null:{x:o.x,y:o.y,width:o.width,height:o.height}}function ru(e,t,r,n=tu(location.host),o=null){let i=e.ownerDocument,s=i.createElement("style");s.textContent=`${es}
${rs}
${ts}`;let a=i.createElement("div");e.append(s,a);let c=e.host,l=eu(i.defaultView??window,i,c);c.setAttribute("data-theme",l.get());let d=l.subscribe(w=>c.setAttribute("data-theme",w)),p=null,u=null,f=null,h=w=>{if(w.rewrite?u?.rewrite||(f=F1(i)):f=null,u=w,p===null)return;let x={...w,rewriteAt:w.rewriteAt??o?.box()??f};$i(ze(Qi,{state:x,mac:t,onPress:r,drag:p,onDrag:b=>void n.write(b)}),a)};return o?.listen(()=>{u?.rewrite&&h(u)}),n.read().then(w=>{p=w,u&&h(u)}),{draw:h,remove(){d(),l.stop(),$i(null,a),s.remove(),a.remove()}}}var nu="[redacted]",B1=[/(?<![\w-])sk-(?=[\w-]*\d)[\w-]{20,}/g,/(?<![A-Za-z0-9])AKIA[0-9A-Z]{16}(?![A-Za-z0-9])/g,/(?<![A-Za-z0-9])gh[pousr]_[A-Za-z0-9]{36,}/g,/(?<![A-Za-z0-9])xox[abprs]-[A-Za-z0-9-]{10,}/g,/(?<![A-Za-z0-9])AIza[\w-]{35}(?![\w-])/g,/(?<![\w-])eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g,/(?<![A-Za-z0-9])coere_(?:app|dev)_[A-Z2-7]{52}(?![A-Za-z0-9])/g,/-----BEGIN [A-Z ]*PRIVATE KEY-----(?:[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----|[\s\S]*$)/g];function U1(e){let t=0;for(let r=0;r<e.length;r++){let n=Number(e[e.length-1-r]);r%2===1&&(n=n*2>9?n*2-9:n*2),t+=n}return t%10===0}function $1(e,t,r){return/^\+|[()]/.test(e.slice(Math.max(0,t-1),t)+r)||/^\d{3}[ -]\d{3}[ -]\d{4}$/.test(r)}function j1(e){let t=[];for(let r of e.matchAll(/\b\d(?:[ -]?\d){12,18}\b/g))U1(r[0].replace(/[ -]/g,""))&&!$1(e,r.index,r[0])&&t.push([r.index,r.index+r[0].length]);return t}function G1(e){let t=e.slice(4)+e.slice(0,4),r=0;for(let n of t){let o=n>="A"&&n<="Z"?String(n.charCodeAt(0)-55):n;for(let i of o)r=(r*10+Number(i))%97}return r===1}function z1(e){let t=[];for(let r of e.matchAll(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){11,30}\b/g))for(let n=r.index+r[0].length;n-r.index>=15;n--)if(!/[A-Z0-9]/.test(e[n]??"")&&e[n-1]!==" "&&G1(e.slice(r.index,n).replace(/ /g,""))){t.push([r.index,n]);break}return t}function W1(e){let t=[];for(let r of e.matchAll(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g)){let n=e.slice(Math.max(0,r.index-40),r.index+r[0].length+20);/\bssn\b|social security/i.test(n)&&t.push([r.index,r.index+r[0].length])}return t}function K1(e){let t=[];for(let r of e.matchAll(/\b(?:password|passcode|pin)\b\s*(?:is\b\s*[:=]?|[:=])\s*(\S+)/dgi)){let[n]=r.indices?.[1]??[0],o=(r[1]??"").replace(/[.,;:!?)\]}'"]+$/,"");o!==""&&t.push([n,n+o.length])}return t}function Se(e){let t=[...j1(e),...z1(e),...W1(e),...K1(e)];for(let o of B1)for(let i of e.matchAll(o))t.push([i.index,i.index+i[0].length]);if(t.length===0)return e;t.sort((o,i)=>o[0]-i[0]||i[1]-o[1]);let r="",n=0;for(let[o,i]of t)i<=n||(r+=e.slice(n,Math.max(n,o))+(o>=n?nu:""),n=i);return r+e.slice(n)}var V1=/[A-Za-z]+|\d+|\n|[^\sA-Za-z\d]/g,q1=/^[A-Z]?[a-z]{0,11}$/;function Y1(e){let t=q1.test(e)&&/[aeiouy]/i.test(e);return Math.ceil(e.length/(t?4:2))}function is(e){let t=0;for(let r of e.matchAll(V1)){let n=r[0],o=n.charCodeAt(0);o>=65&&o<=90||o>=97&&o<=122?t+=Y1(n):o>=48&&o<=57?t+=Math.ceil(n.length/3)+1:t+=o>=11904?2:1}return t}function J1(e){let t=e.getBoundingClientRect(),r=t.x,n=t.y,o=e.ownerDocument.defaultView?.frameElement??null;for(;o;){let i=o.getBoundingClientRect();r+=i.x,n+=i.y,o=o.ownerDocument.defaultView?.frameElement??null}return{x:r,y:n,width:t.width,height:t.height}}function ss(e,t={}){let r=e.defaultView;return{doc:e,rect:J1,viewport:()=>({width:r?.innerWidth??0,height:r?.innerHeight??0,scrollY:r?.scrollY??0,scrollHeight:Math.max(e.documentElement.scrollHeight,e.body?.scrollHeight??0)}),redact:Se,count:is,now:()=>Date.now(),...t}}var H=class extends Error{constructor(r){super(r);this.code=r;this.name="KitError"}};var Qn=new WeakSet;function as(e){Qn.add(e)}function ou(e){Qn.delete(e)}function It(e){return e!=null&&Qn.has(e)}function iu(e){return e.composedPath().some(t=>t instanceof Object&&Qn.has(t))}var wr=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","HEAD","META","LINK","TITLE"]);function zr(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();if(t instanceof Object&&"host"in t&&t.host)return t.host;let r=(e.ownerDocument??e).defaultView?.frameElement;return e===e.ownerDocument?.documentElement&&r?r:null}function Wr(e){if(e.tagName!=="IFRAME"&&e.tagName!=="FRAME")return null;try{return e.contentDocument??null}catch{return null}}function jt(e){if(e instanceof Object&&"shadowRoot"in e&&e.shadowRoot)return Array.from(e.shadowRoot.childNodes);if(e.tagName==="SLOT"){let r=e.assignedNodes?.({flatten:!0})??[];if(r.length>0)return r}let t=e.tagName?Wr(e):null;return t?.body?[t.body]:Array.from(e.childNodes)}function R(e){return e.replace(/\s+/g," ").trim()}function Z(e,t){let r=Array.from(e);return r.length<=t?e:`${r.slice(0,t-1).join("")}\u2026`}var X1=new Set(["button","link","heading","option","tab","menuitem","menuitemcheckbox","menuitemradio","checkbox","radio","switch","treeitem"]);function ue(e){let t=[],r=n=>{if(n.nodeType===3){t.push(n.textContent??"");return}if(n.nodeType!==1)return;let o=n;if(o.getAttribute("aria-hidden")==="true"||o.hidden||["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","SELECT","TEXTAREA"].includes(o.tagName))return;if(o.tagName==="IMG"){t.push(` ${o.getAttribute("alt")??""} `);return}if(o.tagName==="INPUT")return;let i=o.ownerDocument.defaultView?.getComputedStyle(o);if(i?.display==="none"||i?.visibility==="hidden")return;let s=i?.display&&i.display!=="inline";s&&t.push(" ");for(let a of Array.from((o.shadowRoot??o).childNodes))r(a);s&&t.push(" ")};return r(e),R(t.join(""))}function Z1(e,t){let r=e.getRootNode();return R(t.split(/\s+/).map(n=>{let o=r.getElementById?.(n);return o?o.getAttribute("aria-label")??ue(o):""}).join(" "))}function Q1(e){let t=e.labels;if(t&&t.length>0)return R(Array.from(t).map(ue).join(" "));let r=e.closest("label");return r?ue(r):""}function Ne(e,t){let r=e.getAttribute("aria-labelledby");if(r){let i=Z1(e,r);if(i)return i}let n=R(e.getAttribute("aria-label")??"");if(n)return n;let o=e.tagName;if(o==="INPUT"||o==="SELECT"||o==="TEXTAREA"){let i=Q1(e);if(i)return i;let s=e.type;if(o==="INPUT"&&["button","submit","reset"].includes(s))return R(e.value)||(s==="reset"?"Reset":s==="submit"?"Submit":"");if(o==="INPUT"&&s==="image")return R(e.getAttribute("alt")??"")}if(t!==null&&X1.has(t)){let i=ue(e);if(i)return i}return o==="IMG"?R(e.getAttribute("alt")??""):R(e.getAttribute("title")??e.getAttribute("placeholder")??"")}var cs=new Set(["button","link","checkbox","radio","switch","tab","menuitem","menuitemcheckbox","menuitemradio","option","combobox","listbox","textbox","searchbox","slider","spinbutton","treeitem"]),e0=new Set([...cs,"heading","dialog","alertdialog","progressbar","img","none","presentation"]),su={checkbox:"checkbox",radio:"radio",button:"button",submit:"button",reset:"button",image:"button",range:"slider",number:"spinbutton",search:"searchbox",file:"button",color:"button"};function t0(e){let t=e.tagName;if(t==="A"||t==="AREA")return e.hasAttribute("href")?"link":null;if(t==="BUTTON"||t==="SUMMARY")return"button";if(t==="INPUT"){let n=(e.type||"text").toLowerCase();return n==="hidden"?null:su[n]??"textbox"}if(t==="TEXTAREA")return"textbox";if(t==="SELECT"){let n=e;return n.multiple||n.size>1?"listbox":"combobox"}if(t==="OPTION")return"option";if(/^H[1-6]$/.test(t))return"heading";if(t==="DIALOG")return"dialog";if(t==="PROGRESS")return"progressbar";if(t==="IMG")return"img";let r=e.getAttribute("contenteditable");return r!==null&&r!=="false"?"textbox":null}function De(e){let t=e.getAttribute("role")?.trim().split(/\s+/)[0]?.toLowerCase();return t&&e0.has(t)?t==="presentation"?"none":t:t0(e)}function au(e){return e!==null&&(cs.has(e)||e==="heading")}function eo(e){return e!==null&&cs.has(e)}var to=new Set(["checkbox","radio","switch","menuitemcheckbox","menuitemradio"]),cu=new Set(["textbox","searchbox","combobox","spinbutton"]);function Ee(e){if(e.tagName==="TEXTAREA")return!0;if(e.tagName!=="INPUT")return!1;let t=(e.type||"text").toLowerCase();return!(t in su)&&t!=="hidden"}function yr(e){let t=e.getAttribute("contenteditable");return t!==null&&t!=="false"}var Ae=class{constructor(t){this.env=t}styled=new Map;shown(t){let r=this.styled.get(t);if(r!==void 0)return r;let n=this.ownShown(t),o=zr(t),i=n&&(o===null||this.shown(o));return this.styled.set(t,i),i}visible(t){if(!this.shown(t))return!1;let r=this.env.rect(t);if(r.width<=1||r.height<=1)return!1;let n=this.env.viewport();return r.x+r.width>0&&r.y+n.scrollY+r.height>0}ownShown(t){if(t.hasAttribute("inert")||t.getAttribute("aria-hidden")==="true"||t.hidden)return!1;let r=t.ownerDocument.defaultView?.getComputedStyle(t);return r?r.display==="none"||r.visibility==="hidden"||r.visibility==="collapse"?!1:r.opacity===""||Number(r.opacity)>0:!0}};function r0(e,t){let r=e.rect(t),n=t.ownerDocument.defaultView?.frameElement,o=n?e.rect(n):{x:0,y:0};return{clientX:r.x-o.x+r.width/2,clientY:r.y-o.y+r.height/2}}function n0(e){typeof e.scrollIntoView=="function"&&e.scrollIntoView({block:"center",inline:"center"})}function Gt(e,t,r){r||n0(t);let n=t.ownerDocument.defaultView??window,o=r?{clientX:r.x,clientY:r.y}:r0(e,t),i={bubbles:!0,cancelable:!0,composed:!0,view:n,button:0,...o},s=n.PointerEvent,a=(l,d)=>s?new s(l,{...i,buttons:d,pointerId:1,pointerType:"mouse",isPrimary:!0}):new n.MouseEvent(l,{...i,buttons:d});t.dispatchEvent(a("pointerover",0)),t.dispatchEvent(new n.MouseEvent("mouseover",i)),t.dispatchEvent(a("pointerdown",1)),t.dispatchEvent(new n.MouseEvent("mousedown",{...i,buttons:1}))&&typeof t.focus=="function"&&t.focus({preventScroll:!0}),t.dispatchEvent(a("pointerup",0)),t.dispatchEvent(new n.MouseEvent("mouseup",i)),t.dispatchEvent(new n.MouseEvent("click",{...i,detail:1}))}var lu=/\b(password|passcode|passphrase|pin|security (question|answer|code)|one[- ]time (code|password)|verification code|2fa code|otp)\b/i,du=/\b(card ?number|credit card|debit card|cvv|cvc|csc|security code on|expiry|expiration|exp date|iban|routing( number)?|account number|sort code|swift|ssn|social security|passport( number)?|tax id|tin|national id|driver'?s licen[cs]e)\b/i,uu=/\b(buy|pay|pay now|place (your )?order|checkout|check out|subscribe|donate|send money|transfer|trade|purchase|complete (purchase|payment|order)|add payment)\b/i,pu=/\b(delete (my |your )?account|close (my |your )?account|deactivate|change (my |your )?password|reset password|two[- ]step|2[- ]?step|2fa|two[- ]factor|recovery (email|phone|code)|security settings|sign out of all|log ?out of all)\b/i,ro=/\b(sign ?in|log ?in|sign ?up|create (an |your )?account|register|continue with google|choose an account)\b/i,no=/\b(i'?m not a robot|verify (that )?you are (a )?human|are you human|human verification|captcha)\b/i,fu=/\b(submit|send|post|publish|apply|confirm|finish|complete|share|invite)\b/i,mu=/^(next|previous|prev|back|continue|search|go|filter|apply filters?|load more|show more|more|page \d+|\d+|[<>]+)$/i,hu=/\b(delete|remove|discard|erase|destroy|permanently|finish attempt|end attempt|submit (quiz|test|exam|attempt|all|answers)|turn in|hand in|unsubscribe|cancel (my |your )?(subscription|order|plan))\b/i,gu=/\.(exe|msi|dmg|pkg|deb|rpm|apk|ipa|crx|xpi|zip|rar|7z|tar|gz|iso|bat|sh|jar)(\?|#|$)/i,bu=/(^|\.)(chromewebstore\.google\.com|chrome\.google\.com|addons\.mozilla\.org|microsoftedge\.microsoft\.com|apps\.apple\.com|play\.google\.com)$/i;var ls=new Set(["secret","payment","purchase","account","sign_in","captcha","file","download"]),o0=/\b(current-password|new-password|one-time-code)\b/,i0=/\bcc-/;function s0(e,t){return[t,e.getAttribute("name"),e.id,e.getAttribute("placeholder")].filter(Boolean).join(" ").replace(/[_-]/g," ")}function a0(e,t){let r=[],n=e.getAttribute("autocomplete")??"",o=s0(e,t);return(e.type?.toLowerCase()==="password"||o0.test(n)||lu.test(o))&&r.push("secret"),(i0.test(n)||du.test(o))&&r.push("payment"),r}function c0(e){return e.tagName==="INPUT"?["submit","image"].includes(e.type):e.tagName!=="BUTTON"?!1:e.type==="submit"&&e.form!==null}function l0(e){if(e.tagName!=="A")return!1;if(e.hasAttribute("download"))return!0;let t=e.href;try{let r=new URL(t);return gu.test(r.pathname)||bu.test(r.hostname)}catch{return!1}}function d0(e,t){let r=[];return uu.test(t)&&r.push("purchase"),pu.test(t)&&r.push("account"),ro.test(t)&&r.push("sign_in"),no.test(t)&&r.push("captcha"),l0(e)&&r.push("download"),!mu.test(t.trim())&&(fu.test(t)||c0(e))&&r.push("submit"),hu.test(t)&&r.push("irreversible"),r}function zt(e,t,r){let n=new Set;if(e.tagName==="INPUT"&&e.type==="file"&&n.add("file"),Ee(e)||yr(e)||e.tagName==="SELECT"||t==="textbox"||t==="combobox")for(let o of a0(e,r))n.add(o);if(eo(t)&&!cu.has(t))for(let o of d0(e,r))n.add(o);return[...n]}function u0(e,t,r){let n=e.elementFromPoint?.(t,r)??null;for(let o=0;o<10&&n?.shadowRoot;o++){let i=n.shadowRoot.elementFromPoint(t,r);if(!i||i===n)break;n=i}for(let o=n;o;o=zr(o))if(It(o))return null;return n}function xr(e,t){let r=t.el??t.mark;if(r!==null){let n=e.session.element(r);if(!n)throw new H("stale_element");return n}if(t.point!==null){let n=Zn(t.point,e.env.viewport());if(!n)throw new H("refused");let o=u0(e.env.doc,n.x,n.y);if(!o)throw new H("not_found");return o}throw new H("not_found")}function p0(e){let t=new Set;for(let r=e,n=0;r&&n<6;r=zr(r),n++){let o=De(r);for(let i of zt(r,o,Ne(r,o)))t.add(i)}return[...t]}function wt(e){if(p0(e).some(t=>ls.has(t)))throw new H("refused")}var oo=e=>R(e).toLowerCase();function ds(e,t,r){let n=oo(r);for(let o of[i=>i===n,i=>i.startsWith(n),i=>i.includes(n)]){let i=e.filter(s=>o(oo(t(s))));if(i.length===1)return i[0];if(i.length>1)return null}return null}var f0=e=>new Promise(t=>setTimeout(t,e));async function m0(e,t){let r=new Ae(e),n=(t.getAttribute("aria-controls")??t.getAttribute("aria-owns")??"").split(/\s+/).filter(Boolean);for(let o=0;o<10;o++){let i=n.map(c=>e.doc.getElementById(c)).filter(c=>c!==null),a=(i.length>0?i:[e.doc.body]).flatMap(c=>Array.from(c.querySelectorAll('[role="option"]'))).filter(c=>r.visible(c));if(a.length>0)return a;await f0(50)}return[]}async function yu(e,t,r){if(t.tagName==="SELECT"){let i=t,s=ds(Array.from(i.options),c=>c.text,r);if(!s||s.disabled)throw new H("not_found");i.value=s.value,s.selected=!0;let a=t.ownerDocument.defaultView??window;return i.dispatchEvent(new a.Event("input",{bubbles:!0})),i.dispatchEvent(new a.Event("change",{bubbles:!0})),i.selectedIndex===s.index}De(t)!=="option"&&Gt(e,t);let n=De(t)==="option"?[t]:await m0(e,t),o=ds(n,i=>Ne(i,"option"),r);if(!o)throw new H("not_found");return wt(o),Gt(e,o),o.getAttribute("aria-selected")==="true"||oo(Ne(t,De(t))).includes(oo(r))}function wu(e){return e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true"||e.getAttribute("aria-pressed")==="true"}function xu(e,t,r){return wu(t)!==r&&Gt(e,t),wu(t)===r}var us=e=>Ee(e)?e.value:e.innerText??e.textContent??"";function vu(e,t,r,n){let o=us(e);if(Ee(e))return n?o===t:o===r+t;let i=R(n?t:r+t);return R(o)===i||R(e.textContent??"")===i}function h0(e,t){let r=e.ownerDocument;if(Ee(e)){let i=e.value.length;e.setSelectionRange(t?0:i,i);return}let n=r.createRange();n.selectNodeContents(e),t||n.collapse(!1);let o=r.getSelection();o?.removeAllRanges(),o?.addRange(n)}function g0(e,t){let r=e.ownerDocument;typeof r.execCommand=="function"&&r.execCommand("insertText",!1,t)}function b0(e,t){let r=e.ownerDocument.defaultView;if(!r?.DataTransfer||!r.ClipboardEvent)return;let n=new r.DataTransfer;n.setData("text/plain",t),e.dispatchEvent(new r.ClipboardEvent("paste",{clipboardData:n,bubbles:!0,cancelable:!0,composed:!0}))}function w0(e,t){let r=e.ownerDocument.defaultView??window,n={inputType:"insertText",data:t,bubbles:!0,composed:!0};if(e.dispatchEvent(new r.InputEvent("beforeinput",{...n,cancelable:!0}))){if(Ee(e))e.setRangeText(t,e.selectionStart??0,e.selectionEnd??0,"end");else{let o=e.ownerDocument.getSelection(),i=o&&o.rangeCount>0?o.getRangeAt(0):null;if(!i||!e.contains(i.startContainer))return;i.deleteContents();let s=e.ownerDocument.createDocumentFragment();t.split(`
`).forEach((a,c)=>{c>0&&s.append(e.ownerDocument.createElement("br")),a&&s.append(e.ownerDocument.createTextNode(a))}),i.insertNode(s)}e.dispatchEvent(new r.InputEvent("input",n))}}function y0(e,t,r,n){let o=e.ownerDocument.defaultView??window,i=e.tagName==="INPUT"?o.HTMLInputElement.prototype:o.HTMLTextAreaElement.prototype;Object.getOwnPropertyDescriptor(i,"value")?.set?.call(e,n?t:r+t),e.dispatchEvent(new o.Event("input",{bubbles:!0,composed:!0}))}var x0=new Set(["text","search","url","tel","password"]),v0=e=>e.tagName!=="INPUT"||x0.has(e.type);function ps(e,t,r){if(!Ee(e)&&!yr(e))return!1;let o=e.tagName==="INPUT"?t.replace(/\s*\n\s*/g," "):t;e.focus({preventScroll:!0});let i=us(e),s=v0(e)?[g0,b0,w0]:[],a=!1,c={replace:r,text:o};for(let l of s){if(h0(e,c.replace),l(e,c.text),a=vu(e,o,i,r))break;us(e)!==i&&(c={replace:!0,text:r?o:i+o})}return!a&&Ee(e)&&(y0(e,o,i,r),a=vu(e,o,i,r)),a&&Ee(e)&&e.dispatchEvent(new(e.ownerDocument.defaultView??window).Event("change",{bubbles:!0})),a}function vr(e){let t=e.activeElement;for(let r=0;r<20&&t;r++){let n=t.shadowRoot?.activeElement??Wr(t)?.activeElement??null;if(!n||n===t)break;t=n}return!t||t.tagName==="BODY"||t.tagName==="HTML"?null:t}var k0={Enter:"Enter",Escape:"Escape",Tab:"Tab",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",PageDown:"PageDown",PageUp:"PageUp",Backspace:"Backspace"},_0='a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';function S0(e,t){let r=Array.from(e.querySelectorAll(_0)),n=t?r.indexOf(t):-1;r[(n+1)%Math.max(1,r.length)]?.focus()}function ku(e,t){if(!na.includes(t))throw new H("refused");let r=vr(e)??e.body;r!==e.body&&wt(r);let n=r.ownerDocument.defaultView??window,o={key:t,code:k0[t],bubbles:!0,cancelable:!0,composed:!0};if(r.dispatchEvent(new n.KeyboardEvent("keydown",o))&&(t==="Tab"&&S0(r.ownerDocument,vr(e)),(t==="PageDown"||t==="PageUp")&&n.scrollBy?.(0,(t==="PageDown"?1:-1)*n.innerHeight*.85),t==="Backspace"&&Ee(r))){let s=r.selectionStart??r.value.length,a=r.selectionEnd??s;s===a&&s>0?r.setRangeText("",s-1,a,"end"):r.setRangeText("",s,a,"end"),r.dispatchEvent(new n.Event("input",{bubbles:!0}))}r.dispatchEvent(new n.KeyboardEvent("keyup",o))}function Su(e,t,r,n){let o=e.doc.defaultView,i=t??e.doc.scrollingElement??e.doc.documentElement,s=t?i.scrollTop:o?.scrollY??0,a=t?i.clientHeight:o?.innerHeight??0,l=n==="end"?r==="down"?i.scrollHeight:0:s+(r==="down"?1:-1)*a*.85;return t?t.scrollTop=l:o?.scrollTo?.({top:l,behavior:"instant"}),(t?i.scrollTop:o?.scrollY??0)!==s}var _u=e=>new Promise(t=>setTimeout(t,e));async function Eu(e,t,r){let n=Math.min(Math.max(t??Xe.waitMs,0),Xe.waitMs);if(r===null)return await _u(n),null;let o=R(r).toLowerCase(),i=e.now()+Xe.waitMs;for(;;){if(ue(e.doc.body).toLowerCase().includes(o))return!0;if(e.now()>=i)return!1;await _u(100)}}function E0(e){let t=new Set;for(let r of Array.from(e.querySelectorAll("a[href], area[href]")))t.add(io(r.href));return t}var io=e=>e.replace(/#.*$/,"");function Cu(e,t,r){let n;try{n=new URL(r,e.doc.baseURI)}catch{throw new H("refused")}if(n.protocol!=="https:"&&n.protocol!=="http:")throw new H("refused");let o=n.href;if(io(o)===io(t.startUrl)||E0(e.doc).has(io(o)))return o;throw new H("refused")}var Mt=(e=null,t=!1)=>({ran:!0,checked:e,navigated:t});function Tu(e){let t=e.tagName==="INPUT"?e.type:e.getAttribute("role")??"";return t==="radio"||t==="checkbox"?t:null}function Ru(e){return Tu(e)===null?null:e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true"}async function fs(e,t){let{env:r}=e;switch(t.action){case"click":{let n=xr(e,t);wt(n);let o=r.doc.URL,i=Ru(n);Gt(r,n,t.el===null&&t.mark===null&&t.point!==null?Zn(t.point,r.viewport())??void 0:void 0),await Promise.resolve();let s=Ru(n),a=i===null||s===null?null:Tu(n)==="radio"?s:s!==i;return Mt(a,r.doc.URL!==o)}case"type":{let n=xr(e,t);return wt(n),Mt(ps(n,t.text??"",t.replace??!1))}case"select":{let n=xr(e,t);return wt(n),Mt(await yu(r,n,t.option??""))}case"check":{let n=xr(e,t);return wt(n),Mt(xu(r,n,t.on??!0))}case"key":return ku(r.doc,t.key??""),Mt();case"scroll":{let n=t.el!==null||t.mark!==null?xr(e,t):null;return Mt(Su(r,n,t.dir??"down",t.by??"screen"))}case"wait":return Mt(await Eu(r,t.ms,t.for));case"navigate":{let n=Cu(r,e.session,t.url??"");return(e.go??(o=>r.doc.defaultView?.location.assign(o)))(n),Mt(null,!0)}default:throw new H("refused")}}var Au="coere-layer",C0="all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; contain: layout style;",R0=1e3;function Kr(e,t=()=>Date.now()){let r=e.createElement(Au);r.setAttribute("style",C0);let n=r.attachShadow({mode:"closed"});as(r),e.documentElement.append(r);let o=-1/0,i=null,s=()=>{i=null,!r.isConnected&&(o=t(),e.documentElement.append(r))},a=e.defaultView?.MutationObserver??MutationObserver,c=new a(()=>{if(r.isConnected||i!==null)return;let l=Math.max(0,o+R0-t());i=setTimeout(s,l)});return c.observe(e.documentElement,{childList:!0}),{host:r,root:n,remove(){c.disconnect(),i!==null&&clearTimeout(i),r.remove(),ou(r)}}}var Pu="coere-marks";function ms(e,t,r){let n=e.createElement("div");return n.setAttribute("style",`position:fixed;left:${t.x}px;top:${t.y}px;width:${t.width}px;height:${t.height}px;box-sizing:border-box;${r}`),n}var T0=`background:${rt.color};color:#fff;font:600 11px/16px system-ui,sans-serif;text-align:center;border-radius:4px;`,A0=`border:2px solid ${rt.color};border-radius:3px;`,P0=`border:1px dashed ${rt.color}88;color:${rt.color};font:600 12px/1 system-ui,sans-serif;padding:2px;`;function so(e){e.root.querySelector(`#${Pu}`)?.remove()}function hs(e,t,r,n){so(e);let o=e.host.ownerDocument,i=o.createElement("div");if(i.id=Pu,n)for(let{cell:a,box:c}of bd(r)){let l=ms(o,c,P0);l.textContent=a,i.append(l)}let s=wd(t,r);for(let a of s){i.append(ms(o,a.outline,A0));let c=ms(o,a.tag,T0);c.textContent=String(a.n),i.append(c)}return e.root.append(i),s.length}var I0="#e6e8ef";async function M0(e){let t=new Uint8Array(await e.arrayBuffer()),r="";for(let n=0;n<t.length;n+=32768)r+=String.fromCharCode(...t.subarray(n,n+32768));return`data:${e.type};base64,${btoa(r)}`}async function gs(e){let t=Math.max(1,e.width),r=Math.max(1,e.height),n=new OffscreenCanvas(t,r),o=n.getContext("2d");if(!o)throw new Error("no 2d context");o.fillStyle=e.background,o.fillRect(0,0,t,r);for(let s of e.ops){let a=s.box;s.kind==="rect"?(o.fillStyle=s.color,o.fillRect(a.x,a.y,a.width,a.height)):s.kind==="image"?(o.fillStyle=I0,o.beginPath(),o.roundRect(a.x,a.y,a.width,a.height,Math.min(6,a.width/4,a.height/4)),o.fill()):(o.fillStyle=s.color,o.font=`${s.size}px system-ui, sans-serif`,o.textBaseline="top",o.save(),o.beginPath(),o.rect(a.x,a.y,a.width,a.height),o.clip(),o.fillText(s.text,a.x,a.y),o.restore())}let i=await n.convertToBlob({type:"image/jpeg",quality:.6});return{dataUrl:await M0(i),width:t,height:r,sketch:!0}}var L0=800,O0=new Set(["IMG","VIDEO","CANVAS","SVG","svg","PICTURE","IFRAME","OBJECT","EMBED"]),Iu=e=>e===""||e==="transparent"||/rgba\([^)]*,\s*0\)$/.test(e);function N0(e){return R(Array.from(e.childNodes).filter(t=>t.nodeType===3).map(t=>t.textContent??"").join(" "))}function bs(e,t){let r=e.viewport(),n=r.width>0?t/r.width:1,o=new Ae(e),i=[],s=f=>f.ownerDocument.defaultView?.getComputedStyle(f),a=e.doc.body,c=a?s(a)?.backgroundColor??"":"",l=Iu(c)?"#ffffff":c,d=f=>({x:f.x*n,y:f.y*n,width:f.width*n,height:f.height*n}),p=f=>f.x<r.width&&f.y<r.height&&f.x+f.width>0&&f.y+f.height>0,u=f=>{if(i.length>=L0||f.nodeType!==1||It(f))return;let h=f;if(wr.has(h.tagName)||!o.shown(h))return;let w=e.rect(h),x=s(h);if(w.width>1&&w.height>1&&p(w)){if(O0.has(h.tagName)){i.push({kind:"image",box:d(w)});return}x&&!Iu(x.backgroundColor)&&h!==a&&i.push({kind:"rect",box:d(w),color:x.backgroundColor});let b=N0(h);if(b){let v=Math.min(20,Math.max(4,(parseFloat(x?.fontSize??"16")||16)*n));i.push({kind:"text",box:d(w),size:v,color:x?.color||"#111111",text:Z(b,120)})}}for(let b of jt(h))u(b)};return a&&u(a),{width:Math.round(t),height:Math.round(r.height*n),background:l,ops:i}}function ao(e){let t=3735928559,r=1103547991;for(let n=0;n<e.length;n++){let o=e.charCodeAt(n);t=Math.imul(t^o,2654435761),r=Math.imul(r^o,1597334677)}return t=Math.imul(t^t>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),r=Math.imul(r^r>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),(4294967296*(2097151&r)+(t>>>0)).toString(16).padStart(14,"0")}var D0=new Set(["NAV","FOOTER","ASIDE","DIALOG"]),H0=new Set(["navigation","banner","contentinfo","complementary","search","dialog","alertdialog"]),F0=/(^|[-_\s])(cookies?|consent|gdpr|banner|ads?|advert|advertisement|sponsor(ed)?|promo|newsletter|popup|modal|share|social|related|breadcrumbs?|menu|sidebar|footer|nav(bar)?|skip)($|[-_\s])/i;function ws(e){if(D0.has(e.tagName)||e.tagName==="HEADER"&&!e.closest('article, main, [role="main"]'))return!0;let t=e.getAttribute("role");if(t&&H0.has(t))return!0;let r=`${e.getAttribute("class")??""} ${e.id}`;return r.trim()!==""&&F0.test(r)}var B0="p, pre, li, td, blockquote, dd";function U0(e){let t=R(e.textContent??"").length;return t===0?1:Array.from(e.querySelectorAll("a")).reduce((n,o)=>n+R(o.textContent??"").length,0)/t}var $0=e=>{for(let t=e;t;t=t.parentElement)if(ws(t))return!0;return!1};function Mu(e,t){let r=e.body??e.documentElement,n=e.querySelector('main, [role="main"]')??(e.querySelectorAll("article").length===1?e.querySelector("article"):null);if(n&&t.shown(n)&&ue(n).length>=200)return n;let o=new Map;for(let a of Array.from(r.querySelectorAll(B0))){if(!t.shown(a)||$0(a))continue;let c=R(a.textContent??"");if(c.length<25)continue;let l=1+(c.match(/,/g)?.length??0)+Math.min(Math.floor(c.length/100),3),d=a.parentElement;d&&o.set(d,(o.get(d)??0)+l);let p=d?.parentElement;p&&o.set(p,(o.get(p)??0)+l/2)}let i=r,s=0;for(let[a,c]of o){let l=c*(1-U0(a));l>s&&(s=l,i=a)}return i}var j0=new Set(["P","DIV","SECTION","ARTICLE","MAIN","BLOCKQUOTE","PRE","FIGURE","FIGCAPTION","DL","DT","DD","FORM","FIELDSET","DETAILS","SUMMARY","ADDRESS","HEADER","UL","OL","BR","HR"]),G0=10,z0=50;function W0(e){return Array.from(e.querySelectorAll("tr")).slice(0,z0).map(r=>Array.from(r.children).map(n=>R(n.textContent??"").replace(/\t/g," ")).join("	")).filter(r=>r.replace(/\t/g,"").trim()!=="").join(`
`)}function Lu(e,t){let r=[],n=[],o=[],i="",s=()=>{let c=R(o.join(""));c&&r.push(i+c),(c||i==="")&&(i=""),o=[]},a=c=>{if(c.nodeType===3){o.push(c.textContent??"");return}if(c.nodeType!==1)return;let l=c;if(wr.has(l.tagName)||!t.shown(l)||l!==e&&ws(l))return;let d=/^H([1-6])$/.exec(l.tagName);if(d){s();let f=R(l.textContent??"");f&&r.push(`${"#".repeat(Number(d[1]))} ${Z(f,200)}`);return}if(l.tagName==="TABLE"){s();let f=W0(l);f&&n.length<G0&&(n.push(f),r.push(`(table ${n.length})`));return}if(l.tagName==="IMG"){let f=R(l.getAttribute("alt")??"");f&&o.push(` ${f} `);return}let p=l.tagName==="LI",u=p||j0.has(l.tagName);u&&s(),p&&(i="- ");for(let f of jt(l))a(f);u&&s()};return a(e),s(),{lines:r,tables:n}}var K0=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,V0=/(?:\+\d{1,3}[ .-]?)?(?:\(\d{2,4}\)[ .-]?)?\d{2,4}(?:[ .-]\d{2,4}){1,4}/g,q0=/^https?:\/\/(?:[a-z]+\.)?(?:linkedin\.com\/(?:in|company)\/|twitter\.com\/|x\.com\/|github\.com\/|mastodon\.social\/@)[^/?#]+/i,Ou=e=>e.replace(/\D/g,"").replace(/^1(?=\d{10}$)/,"");function ys(e,t){let r=new Set(e.map(t));return n=>{let o=t(n);!o||r.has(o)||e.length>=20||(r.add(o),e.push(n))}}function Nu(e,t){let r=[],n=[],o=[],i=ys(r,c=>c.toLowerCase()),s=ys(n,Ou),a=ys(o,c=>c.toLowerCase().replace(/\/$/,""));for(let c of Array.from(e.querySelectorAll("a[href]"))){let l=c.getAttribute("href")??"";if(/^mailto:/i.test(l))i(decodeURIComponent(l.slice(7).split("?")[0]??"").trim());else if(/^tel:/i.test(l))s(l.slice(4).trim());else{let d=q0.exec(c.href);d&&a(d[0])}}for(let c of t.matchAll(K0))i(c[0].replace(/\.$/,""));for(let c of t.matchAll(V0)){let l=Ou(c[0]).length;l>=7&&l<=15&&!/^\d{4}-\d{2}-\d{2}$/.test(c[0])&&s(c[0].trim())}return{emails:r,phones:n,profiles:o}}var Y0=20,Du=200,J0=new Set(sa);function Hu(e){return R(e.querySelector('meta[name="description" i]')?.getAttribute("content")??"")}function Fu(e){let t={};for(let r of Array.from(e.querySelectorAll('meta[property^="og:"]'))){let n=r.getAttribute("property"),o=R(r.getAttribute("content")??"");o&&!(n in t)&&Object.keys(t).length<20&&(t[n]=Z(o,Du))}return t}function X0(e){let t=e["@type"];return(Array.isArray(t)?t:[t]).filter(r=>typeof r=="string")}function xs(e){return e===null?"":typeof e!="object"?R(String(e)):Array.isArray(e)?e.map(xs).filter(Boolean).join(", "):typeof e.name=="string"?R(e.name):Object.entries(e).filter(([r])=>!r.startsWith("@")).map(([,r])=>typeof r=="object"?"":xs(r)).filter(Boolean).join(", ")}function Z0(e){let t={};for(let[r,n]of Object.entries(e)){if(r.startsWith("@"))continue;let o=xs(n);o&&(t[r]=Z(o,Du))}return t}function*vs(e,t=!1){if(Array.isArray(e))for(let r of e)yield*vs(r,t);else if(e&&typeof e=="object"){yield{node:e,nested:t};for(let[r,n]of Object.entries(e))typeof n=="object"&&(yield*vs(n,r!=="@graph"))}}function Bu(e,t){let r=[];for(let n of Array.from(e.querySelectorAll('script[type="application/ld+json" i]'))){let o;try{o=JSON.parse(n.textContent??"")}catch{continue}for(let{node:i,nested:s}of vs(o)){let a=X0(i).find(l=>J0.has(l));if(!a||r.length>=Y0)continue;let c=Object.fromEntries(Object.entries(Z0(i)).map(([l,d])=>[l,t(d)]));s&&Object.keys(c).every(l=>l==="name")||r.push({type:a,fields:c})}}return r}var Q0=/^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|ref|ref_src|_hsenc|_hsmi|igshid|yclid)$/i;function ks(e){let t;try{t=new URL(e)}catch{return e}t.hash="";for(let r of[...t.searchParams.keys()])Q0.test(r)&&t.searchParams.delete(r);return t.pathname.length>1&&t.pathname.endsWith("/")&&(t.pathname=t.pathname.replace(/\/+$/,"")),t.href}var ev=80,tv=.2,rv=.25;function nv(e,t,r){let n=e.doc,o=[...Array.from(r.querySelectorAll("a[href]")),...Array.from(n.querySelectorAll("a[href]"))],i=new Set,s=[];for(let a of o){let c=a.href;if(!/^https?:\/\//i.test(c)||!t.shown(a))continue;let l=ks(c);if(i.has(l))continue;i.add(l);let d=Z(e.redact(Ne(a,"link")),80);if(d&&s.push({text:d,url:c}),s.length>=ev)break}return s}function ov(e,t){let r=R(t.toLowerCase()).split(" ").filter(Boolean),n=e.findIndex(s=>/^#+ /.test(s)&&r.every(a=>s.toLowerCase().includes(a)));if(n<0)return null;let o=/^#+/.exec(e[n])[0].length,i=e.findIndex((s,a)=>a>n&&/^#+ /.test(s)&&/^#+/.exec(s)[0].length<=o);return e.slice(n,i<0?void 0:i)}function _s(e,t,r){let n=[],o=0;for(let i of t){let s=e.count(`${i}
`);if(o+s>r)break;n.push(i),o+=s}return n}function Ss(e,t){let r=t.links.map(o=>`[${o.text}](${o.url})`).join(`
`),n=JSON.stringify({og:t.og,jsonLd:t.jsonLd,contacts:t.contacts});return e.count([t.url,t.title,t.description,t.main,t.tables.join(`

`),r,n].join(`
`))}function Es(e,t){let r=e.doc,n=new Ae(e),o=Mu(r,n),i=Lu(o,n),s=i.lines.map(b=>e.redact(b));t&&(s=ov(s,t)??s);let a=s.flatMap(b=>/^\(table (\d+)\)$/.exec(b)?.[1]??[]).map(Number),c=Cr.pageText,l={url:r.URL,title:e.redact(R(r.title)),description:e.redact(Hu(r)),og:Object.fromEntries(Object.entries(Fu(r)).map(([b,v])=>[b,e.redact(v)])),jsonLd:Bu(r,e.redact),contacts:Nu(r,e.redact(ue(r.body??r.documentElement)))},d=nv(e,n,o),p=_s(e,d.map(b=>`[${b.text}](${b.url})`),c*tv).map((b,v)=>d[v]),u=a.map(b=>e.redact(i.tables[b-1]??"")),f=u.map(b=>_s(e,b.split(`
`),c*rv/Math.max(1,u.length)).join(`
`)),h=Ss(e,{...l,main:"",tables:f,links:p}),w=_s(e,s,Math.max(0,c-h-8)).join(`
`),x={...l,main:w,tables:f,links:p};return{...x,hash:ao(R(s.join(`
`).toLowerCase())),tokens:Ss(e,x)}}var Vr=class{constructor(t){this.startUrl=t}numberOf=new WeakMap;byNumber=new Map;next=1;last=null;number(t){let r=this.numberOf.get(t);if(r!==void 0)return r;let n=this.next++;return this.numberOf.set(t,n),this.byNumber.set(n,new WeakRef(t)),n}element(t){let r=this.byNumber.get(t)?.deref()??null;return r?.isConnected?r:null}numbered(t){return this.numberOf.get(t)??null}};var kr={quietMs:300,maxMs:3e3,afterNavigationMs:8e3,pollMs:50},iv='[aria-busy="true"], [role="progressbar"]:not([aria-valuenow]), progress:not([value])';function sv(e){let t=new Ae(e);return Array.from(e.doc.querySelectorAll(iv)).some(r=>t.shown(r))}function Cs(e,t){let r=t.quietMs??kr.quietMs,n=t.maxMs??(t.afterNavigation?kr.afterNavigationMs:kr.maxMs),o=e.now(),i=o,s=e.doc.defaultView?.MutationObserver??MutationObserver,a=new s(()=>{i=e.now()});return a.observe(e.doc.documentElement,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),new Promise(c=>{let l=()=>{let d=e.now(),p=d-i>=r&&e.doc.readyState!=="loading"&&!sv(e);if(p||d-o>=n){a.disconnect(),c({quiet:p,ms:d-o});return}setTimeout(l,kr.pollMs)};setTimeout(l,kr.pollMs)})}var av={secret:"password",payment:"payment",purchase:"purchase",account:"account_security",sign_in:"sign_in",captcha:"captcha",file:"file",download:"file"};function Rs(e){let t=[];for(let r of e){let n=new Set;for(let o of r.flags){let i=av[o];i&&!n.has(i)&&(n.add(i),t.push({reason:i,el:r.n}))}}return t}var cv=/recaptcha|hcaptcha\.com|challenges\.cloudflare\.com|turnstile|arkoselabs|funcaptcha/i,lv=".g-recaptcha, .h-captcha, .cf-turnstile, [data-sitekey]",Uu=/\b(just a moment|attention required|checking your browser|verify you are (a )?human|i'?m not a robot)\b/i,dv=/(^|\.)(stripe\.com|stripe\.network|braintreegateway\.com|braintree-api\.com|adyen\.com|adyenpayments\.com|paypal\.com|paypalobjects\.com)$/i,uv=/\b(checkout|check out|payment details|place (your )?order|order review|review your order|billing)\b/i,pv=/^(accounts\.google\.com|login\.microsoftonline\.com|login\.live\.com|appleid\.apple\.com)$/i,fv=/\b(security settings|change (your )?password|delete (your )?account|close (your )?account|two[- ]step verification|two[- ]factor)\b/i;function mv(e){return Array.from(e.querySelectorAll("iframe[src], frame[src]")).flatMap(t=>{try{return[new URL(t.getAttribute("src"),e.baseURI).href]}catch{return[]}})}function hv(e){let t=Array.from(e.querySelectorAll('h1, h2, [role="heading"]')).slice(0,6);return R([e.title,...t.map(r=>r.textContent??"")].join(" | "))}function gv(e){for(let t of Array.from(e.querySelectorAll('input[type="password"]'))){let r=t.closest("form")??t.parentElement;if(!r)continue;let o=Array.from(r.querySelectorAll('button, input[type="submit"], [role="button"]')).map(i=>i.textContent||i.value||"").join(" ");if(ro.test(o))return!0}return!1}function qr(e){let t=new Set,r=mv(e),n=hv(e),o=e.defaultView?.location.hostname??"",i=R((e.body?.textContent??"").slice(0,4e3));return(r.some(s=>cv.test(s))||e.querySelector(lv)||Uu.test(n)||no.test(n)||Uu.test(i))&&t.add("captcha"),r.some(s=>dv.test(new URL(s).hostname))&&t.add("payment"),uv.test(n)&&t.add("purchase"),(pv.test(o)||gv(e)||/\bchoose an account\b/i.test(n))&&t.add("sign_in"),fv.test(n)&&t.add("account_security"),[...t].map(s=>({reason:s,el:null}))}var bv=new Set(["button","link","checkbox","radio","switch","option","menuitem","menuitemcheckbox","menuitemradio","textbox","searchbox","slider","spinbutton","heading","tab"]),wv=new Set(["P","DIV","LI","TR","TD","TH","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","UL","OL","TABLE","FORM","FIELDSET","LEGEND","DD","DT","DL","HEADER","FOOTER","MAIN","NAV","ASIDE","BLOCKQUOTE","PRE","FIGURE","FIGCAPTION","DETAILS","BR","HR","LABEL","BODY"]),yv=300;function xv(e){if(e.hasAttribute("onclick"))return!0;let t=e.getAttribute("tabindex");if(t!==null&&Number(t)>=0)return!0;let r=e.ownerDocument.defaultView;if(r?.getComputedStyle(e).cursor!=="pointer")return!1;let o=e.parentElement;return!o||r?.getComputedStyle(o).cursor!=="pointer"}var vv="a[href],button,input,select,textarea,[role],[contenteditable],[onclick],[tabindex]";function $u(e){let t=new Ae(e),r=[],n=null,o=[],i=0,s=()=>{let l=Z(R(o.join("")),yv);l&&r.push({kind:"text",text:l,y:i}),o=[]},a=(l,d)=>{if(It(l))return;if(l.nodeType===3){if(d||!l.textContent?.trim())return;o.length===0&&(i=l.parentElement?e.rect(l.parentElement).y:0),o.push(l.textContent);return}if(l.nodeType!==1){if(l.nodeType===9||l.nodeType===11)for(let x of jt(l))a(x,d);return}let p=l;if(wr.has(p.tagName)||!t.shown(p))return;let u=De(p);u===null&&xv(p)&&!p.querySelector(vv)&&(u="clickable");let f=u==="clickable"||au(u);if(f&&t.visible(p)){s();let x=Z(Ne(p,u)||(u==="clickable"?ue(p):""),80);if(u==="heading"&&(n=Z(x,80)),r.push({kind:"el",found:{el:p,role:u,name:x,rect:e.rect(p),heading:u==="heading"?null:n}}),bv.has(u)||u==="clickable"||p.tagName==="SELECT"||p.tagName==="TEXTAREA")return}let h=wv.has(p.tagName);h&&s();let w=d||p.tagName==="LABEL"||f&&eo(u);for(let x of jt(p))a(x,w);h&&s()},c=e.doc.body??e.doc.documentElement;return a(c,!1),s(),r}function co(e){return`${e.role} ${JSON.stringify(e.name)}`}function ju(e,t,r){if(e===null)return null;let n=new Map(t.map(a=>[a.n,co(a)])),o=t.filter(a=>e.labels.get(a.n)!==co(a)).map(a=>({n:a.n,text:co(a)})),i=[...e.labels].filter(([a,c])=>n.get(a)!==c).map(([a,c])=>({n:a,text:c})),s=r.filter(a=>!e.texts.has(a)).slice(0,5);return{added:o,removed:i,text:s}}function Gu(e,t,r){return{labels:new Map(e.map(n=>[n.n,co(n)])),texts:new Set(t),shown:new Set(r)}}function kv(e,t){return e.inView?0:e.y<0?-e.y:Math.max(0,e.y-t)}function zu(e,t){return e.map((r,n)=>[n,kv(r,t)]).sort((r,n)=>r[1]-n[1]||r[0]-n[0]).map(([r])=>r)}function Wu(e,t){let r=new Set,n=0,o=0,i=c=>{e[c].y<0?n++:o++},s=t.headerCost,a=zu(e,t.height).filter(c=>e[c].kind==="el");for(let c of a){let l=e[c];r.size<t.maxElements&&s+l.cost<=t.maxTokens&&(!t.viewportOnly||l.inView)?(r.add(c),s+=l.cost):i(c)}for(let c of zu(e,t.height)){let l=e[c];l.kind!=="text"||t.viewportOnly&&!l.inView||s+l.cost>t.maxTokens||(r.add(c),s+=l.cost)}return{kept:e.filter((c,l)=>r.has(l)),above:n,below:o}}var lo=e=>e.replace(/[\r\n\u2028\u2029]+/g," "),Ts=e=>JSON.stringify(lo(e));function _v(e,t){try{let r=new URL(e),n=t&&r.origin===t.origin?`${r.pathname}${r.search}`:r.href;return n.length<=200?n:null}catch{return null}}function Ku(e,t){let r=[`[${e.n}] ${e.role} ${Ts(e.name)}`];e.value!==null&&r.push(e.value==="hidden"?"value=hidden":`value=${Ts(e.value)}`),e.checked!==null&&r.push(to.has(e.role)?e.checked?"checked":"unchecked":e.checked?"selected":""),e.disabled&&r.push("disabled");let n=e.href?_v(e.href,t):null;n&&r.push(`href=${n}`);let o=e.flags.filter(i=>i!=="download");return o.length>0&&r.push(`flags=${o.join(",")}`),r.filter(Boolean).join(" ")}function Vu(e){return`text: ${lo(e)}`}function Sv(e){let t=[];for(let n of e.added.slice(0,8))t.push(`+ [${n.n}] ${lo(n.text)}`);e.added.length>8&&t.push(`+ ${e.added.length-8} more`);for(let n of e.text)t.push(`+ text ${Ts(Z(n,80))}`);let r=e.removed.slice(0,12).map(n=>`[${n.n}]`);return r.length>0&&t.push(`- ${r.join(" ")}${e.removed.length>12?` and ${e.removed.length-12} more`:""}`),`changed: ${t.length>0?t.join("; "):"nothing"}`}function As(e){let t=e.url;try{let i=new URL(e.url);t=`${i.host}${i.pathname}`}catch{}let r=e.view,n=[r.below>0?`${r.below} more elements below`:"",r.above>0?`${r.above} more elements above`:""],o=[`page: ${lo(Z(e.title,80))} | ${Z(t,120)} | step ${e.step} of ${e.steps}`,[`view: ${r.width}x${r.height}, top ${r.topPct}% of ${r.heightPct}%`,...n.filter(Boolean)].join("; ")];return e.focus!==null&&o.push(`focus: [${e.focus}]`),e.changed!==null&&o.push(Sv(e.changed)),o}var Ev=80;function Cv(e,t){return Ee(e)?e.value:e.tagName==="SELECT"?Array.from(e.selectedOptions??[]).map(n=>R(n.text)).join(", "):yr(e)?ue(e):t==="slider"||t==="spinbutton"?e.getAttribute("aria-valuetext")??e.getAttribute("aria-valuenow"):t==="textbox"||t==="searchbox"?ue(e):null}function Rv(e,t){return to.has(t)?e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true":t==="option"||t==="tab"?e.tagName==="OPTION"?e.selected:e.getAttribute("aria-selected")==="true":null}function Tv(e){if(e.disabled===!0||e.getAttribute("aria-disabled")==="true")return!0;let t=e.closest("fieldset[disabled]");return t!==null&&!t.querySelector(":scope > legend")?.contains(e)}function Av(e,t){if(t!=="link"||!("href"in e))return null;let r=String(e.href);return/^https?:\/\//i.test(r)?r:null}function qu(e,t,r){let n=e.viewport(),o=zt(t.el,t.role,t.name),i=o.includes("secret")||o.includes("payment"),s=i?null:Cv(t.el,t.role),a=i?"hidden":s?Z(e.redact(R(s)),Ev):null,c=t.rect;return{n:r,role:t.role,name:e.redact(t.name),value:a,checked:Rv(t.el,t.role),disabled:Tv(t.el),heading:t.heading===null?null:e.redact(t.heading),inView:c.x<n.width&&c.x+c.width>0&&c.y<n.height&&c.y+c.height>0,href:Av(t.el,t.role),flags:o}}var Pv=24,Yu={width:120,height:80};function Iv(e){let t=e.viewport();return[...e.doc.querySelectorAll("canvas")].some(r=>{let n=e.rect(r);return n.width>=Yu.width&&n.height>=Yu.height&&n.y<t.height&&n.y+n.height>0&&n.x<t.width&&n.x+n.width>0})}function uo(e,t,r){let n=e.viewport(),o=(()=>{try{return new URL(e.doc.URL)}catch{return null}})(),i=[];for(let b of $u(e))if(b.kind==="el"){let v=qu(e,b.found,t.number(b.found.el)),E=Ku(v,o);i.push({kind:"el",e:v,y:b.found.rect.y,inView:v.inView,line:E,cost:e.count(`${E}
`)})}else{let v=e.redact(b.text),E=Vu(v),P=b.y>=0&&b.y<n.height;i.push({kind:"text",text:v,y:b.y,inView:P,line:E,cost:e.count(`${E}
`)})}let s=i.flatMap(b=>b.kind==="el"?[b.e]:[]),a=i.flatMap(b=>b.kind==="text"?[b.text]:[]),c=vr(e.doc),l={url:e.doc.URL,title:e.redact(e.doc.title),step:r.step,steps:r.steps,view:{width:n.width,height:n.height,topPct:n.height>0?Math.round(n.scrollY/n.height*100):0,heightPct:n.height>0?Math.round(n.scrollHeight/n.height*100):100,above:0,below:0},focus:c?t.numbered(c):null,changed:ju(t.last,s,a)},d=e.count(As(l).join(`
`))+Pv,{kept:p,above:u,below:f}=Wu(i,{height:n.height,maxElements:Cr.snapshotElements,maxTokens:Cr.snapshotText,headerCost:d,viewportOnly:r.viewportOnly});l.view.above=u,l.view.below=f;let h=p.flatMap(b=>b.kind==="el"?[b.e]:[]),w=p.map(b=>b.kind==="el"?{el:b.e.n}:{text:b.text}),x=[...As(l),...p.map(b=>b.line)].join(`
`);return t.last=Gu(s,a,h.map(b=>b.n)),{...l,elements:h,lines:w,signature:ao(s.map(b=>`${b.role}:${b.name}`).join(`
`)),findings:[...qr(e.doc),...Rs(s)],canvas:Iv(e),text:x,tokens:e.count(x)}}var Mv=15e3;function Ps(e){let t=ss(e.doc,e.env),r=new Vr(e.startUrl),n=null,o=()=>e.layer?.()??(n??=Kr(e.doc,t.now)),i=async s=>{switch(s.type){case"read":if(s.read==="text")return Es(t,s.section);if(s.read==="snapshot")return uo(t,r,{step:0,steps:0,viewportOnly:!1});throw new H("refused");case"snapshot":return uo(t,r,s);case"do":return fs({env:t,session:r,...e.go?{go:e.go}:{}},s.step);case"settle":return Cs(t,{afterNavigation:s.afterNavigation});case"marks":{if(!s.show)return so(o()),{count:0};let a=[...r.last?.shown??[]].flatMap(l=>{let d=r.element(l);return d?[{n:l,rect:t.rect(d)}]:[]}),c=t.viewport();return{count:hs(o(),a,{width:c.width,height:c.height},s.grid)}}case"picture":return gs(bs(t,s.width));default:throw new H("refused")}};return{env:t,session:r,async handle(s){let a,c=new Promise((l,d)=>{a=setTimeout(()=>d(new H("timeout")),Mv)});try{let l=await Promise.race([i(s),c]);return{id:s.id,ok:!0,type:s.type,result:l}}catch(l){return{id:s.id,ok:!1,type:s.type,error:l instanceof H?l.code:"internal"}}finally{clearTimeout(a)}},dispose(){n?.remove(),n=null}}}function Is(e,t,r={}){let n=r.trusted??(l=>!0),o=l=>d=>{!n(d)||iu(d)||t(l)},i=o("pointer"),s=o("key"),c=[e.defaultView,...Array.from(e.querySelectorAll("iframe")).map(l=>Wr(l)?.defaultView)].filter(l=>l!=null);for(let l of c)l.addEventListener("pointerdown",i,!0),l.addEventListener("keydown",s,!0);return()=>{for(let l of c)l.removeEventListener("pointerdown",i,!0),l.removeEventListener("keydown",s,!0)}}function Pe(e){return/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[a-z]{2,}$/i.test(e.trim())}function ye(e){return e.trim().toLowerCase()}function yt(e,t){let r=new Set(e.map(ye)),n=new Set(t.map(ye));return r.size===n.size&&[...r].every(o=>n.has(o))}function He(e,t){let r=new Set(t.map(ye));return e.filter(n=>!r.has(ye(n)))}function M(e,t){let r=e[t];return typeof r=="string"?r:null}function Lt(e,t){let r=e[t];return typeof r=="number"&&Number.isFinite(r)?r:null}function Wt(e,t){return e[t]===!0}function nt(e,t){let r=e[t];return Array.isArray(r)?r.filter(n=>typeof n=="string"):[]}function Ke(e){let t=Lt(e,"account");return t!==null&&Number.isInteger(t)&&t>=0&&t<10?t:0}function _(e={}){return{held:!0,fail:null,data:e}}function g(e,t={}){return{held:!1,fail:e,data:t}}function Ve(e){return{held:!1,fail:null,data:{navigate:e}}}var L={field:3e3,page:8e3,saved:12e3,poll:50};async function N(e,t,r){let n=e.now()+r;for(;;){let o=t();if(o!==null)return o;if(e.now()>=n)return null;await e.sleep(L.poll)}}async function Yr(e,t,r,n,o){if(o().some(s=>ye(s)===ye(r)))return null;await e.type(t,r,!0),await e.key(t,"Enter");let i=await N(e,()=>{let s=o(),a=He(s,n);return a.length>0?a:s.some(c=>ye(c)===ye(r))?[]:null},L.field);return i===null?g("timeout"):i.length>0?g("check",{strangers:i}):null}var Xu=[['button, input[type="button"], input[type="submit"], input[type="reset"]',"button"],["a[href]","link"],['input[type="checkbox"]',"checkbox"],['input[type="radio"]',"radio"],["select, input[list]","combobox"],['textarea, input:not([type]), input[type="text"], input[type="email"], input[type="search"], input[type="tel"], input[type="url"], [contenteditable="true"], [contenteditable=""]',"textbox"],["tr","row"],["td","gridcell"],["li","listitem"],["dialog","dialog"],["main","main"],["h1, h2, h3, h4, h5, h6","heading"]];function Zu(e){let t=e.getAttribute("role")?.trim().split(/\s+/)[0];if(t)return t;for(let[r,n]of Xu)if(e.matches(r))return n;return""}var po=e=>e.replace(/\s+/g," ").trim().toLowerCase();function Ju(e){let t=e.ownerDocument,r=e.getAttribute("aria-label");if(r)return r;let n=e.getAttribute("aria-labelledby");if(n)return n.split(/\s+/).map(s=>t.getElementById(s)?.textContent??"").join(" ");let o=e.getAttribute("id"),i=o?t.querySelector(`label[for="${CSS.escape(o)}"]`):null;return i?.textContent?i.textContent:e.getAttribute("title")??e.getAttribute("placeholder")??e.textContent??""}function Qu(e,t){let r=po(e),n=po(t);return r===n||r.startsWith(n)&&!new RegExp("\\p{L}","u").test(r.charAt(n.length))}function ep(e){if(e.closest('[hidden], [aria-hidden="true"]'))return!1;let t=e.ownerDocument.defaultView?.getComputedStyle(e);return!t||t.display!=="none"&&t.visibility!=="hidden"}function Lv(e,t){let r=Xu.filter(([,n])=>n===t).map(([n])=>n);return[...e.querySelectorAll([`[role="${t}"]`,...r].join(", "))].filter(n=>Zu(n)===t)}function Ov(e,t){let r=[...e.querySelectorAll("*")].filter(n=>Qu(n.textContent??"",t));return r.filter(n=>!r.some(o=>o!==n&&n.contains(o)))}function k(e,t){let r=s=>t.label?s.filter(a=>Qu(Ju(a),t.label)):s,n=[];t.role?(n=r(Lv(e,t.role)),n.length===0&&t.selector&&(n=[...e.querySelectorAll(t.selector)])):t.selector?n=r([...e.querySelectorAll(t.selector)]):t.label&&(n=Ov(e,t.label));let o=n.filter(ep);if(!t.label)return o;let i=o.filter(s=>po(Ju(s))===po(t.label));return[...i,...o.filter(s=>!i.includes(s))]}async function le(e,t,r,n){let o=k(t,r)[0];if(o)return o;let i=await e.pick(n),s=i===null?null:e.elementOf(i);return!s||!t.contains(s)||!ep(s)||r.role&&Zu(s)!==r.role?null:s}function xe(e){let t=e.tagName.toLowerCase();return t==="textarea"?"textarea":t==="input"?"input":e instanceof e.ownerDocument.defaultView.HTMLElement&&e.isContentEditable||e.getAttribute("contenteditable")==="true"||e.getAttribute("contenteditable")===""?"editable":null}function ne(e){let t=xe(e);if(t==="input"||t==="textarea")return e.value;let r=e.innerText;return typeof r=="string"&&r!==""?r:e.textContent??""}var Ie=e=>e.replace(/\s+/g,""),Nv=(e,t)=>{e.ownerDocument.execCommand?.("insertText",!1,t)},Dv=(e,t)=>{let r=e.ownerDocument.defaultView,n=new r.DataTransfer;n.setData("text/plain",t),e.dispatchEvent(new r.ClipboardEvent("paste",{clipboardData:n,bubbles:!0,cancelable:!0,composed:!0}))},Hv=(e,t)=>{let r=e.ownerDocument.defaultView,n={inputType:"insertText",data:t,bubbles:!0,composed:!0};e.dispatchEvent(new r.InputEvent("beforeinput",{...n,cancelable:!0}))&&(Bv(e,t),e.dispatchEvent(new r.InputEvent("input",n)))},Fv=(e,t)=>{let r=e.ownerDocument.defaultView,n=xe(e);if(n!=="input"&&n!=="textarea")return;let o=e,i=n==="input"?r.HTMLInputElement.prototype:r.HTMLTextAreaElement.prototype,s=o.selectionStart??o.value.length,a=o.selectionEnd??s,c=o.value.slice(0,s)+t+o.value.slice(a);Object.getOwnPropertyDescriptor(i,"value")?.set?.call(o,c),o.setSelectionRange?.(s+t.length,s+t.length),e.dispatchEvent(new r.Event("input",{bubbles:!0,composed:!0}))};function Bv(e,t){let r=xe(e);if(r==="input"||r==="textarea"){let c=e;c.setRangeText(t,c.selectionStart??0,c.selectionEnd??0,"end");return}let n=e.ownerDocument,o=n.getSelection();if(!o||o.rangeCount===0)return;let i=o.getRangeAt(0);if(!e.contains(i.startContainer))return;i.deleteContents();let s=n.createDocumentFragment();t.split(`
`).forEach((c,l)=>{l>0&&s.append(n.createElement("br")),c&&s.append(n.createTextNode(c))});let a=s.lastChild;i.insertNode(s),a&&i.setStartAfter(a),i.collapse(!0),o.removeAllRanges(),o.addRange(i)}function Jr(e,t,r,n){for(let o of[Nv,Dv,Hv,Fv])if(n(),o(e,t),r())return!0;return!1}function ot(e,t){let r=new Map;for(let n of e){if(r.has(n.key))throw new Error(`hook ${n.key} is named twice`);r.set(n.key,n)}for(let n of t)if(!r.has(n))throw new Error(`hook ${n} is missing`);for(let n of r.keys())if(!t.includes(n))throw new Error(`hook ${n} is never used`);return Object.fromEntries(r)}function it(e,t){return e.replace(/\{(\w+)\}/g,(r,n)=>{let o=t[n];if(o===void 0)throw new Error(`route value ${n} is missing`);return String(o)})}var tp=[{key:"editor_route",route:"/calendar/u/{account}/r/eventedit",role:null,label:null,selector:null,observed:"unknown",how:"the event editor's address, which also takes the template route's text, dates, ctz, details and location; widely used, not documented by Google; to observe"},{key:"event_route",route:"/calendar/u/{account}/r/eventedit/{eid}",role:null,label:null,selector:null,observed:"unknown",how:"one saved event in the editor by its id, to observe"},{key:"sign_in",route:null,role:null,label:null,selector:'input[name="identifier"], input[type="password"]',observed:"unknown",how:"Google's sign in form fields, to observe"},{key:"title",route:null,role:"textbox",label:"Title",selector:null,observed:"unknown",how:"the editor's title field by its ARIA label, to observe"},{key:"start_date",route:null,role:null,label:null,selector:'[aria-label="Start date"]',observed:"unknown",how:"the start date field by its ARIA label, to observe"},{key:"start_time",route:null,role:null,label:null,selector:'[aria-label="Start time"]',observed:"unknown",how:"the start time field by its ARIA label, to observe"},{key:"end_time",route:null,role:null,label:null,selector:'[aria-label="End time"]',observed:"unknown",how:"the end time field by its ARIA label, to observe"},{key:"end_date",route:null,role:null,label:null,selector:'[aria-label="End date"]',observed:"unknown",how:"the end date field by its ARIA label, to observe"},{key:"all_day",route:null,role:"checkbox",label:"All day",selector:null,observed:"unknown",how:"the All day box, to observe"},{key:"guests_field",route:null,role:null,label:"Guests",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the guest field by its ARIA label, to observe"},{key:"guest_chip",route:null,role:null,label:null,selector:"[data-email]",observed:"unknown",how:"a guest row holding its address in an attribute, to observe"},{key:"save",route:null,role:"button",label:"Save",selector:null,observed:"unknown",how:"the editor's Save button by its label, to observe"},{key:"invite_dialog",route:null,role:"alertdialog",label:null,selector:'[role="dialog"]',observed:"unknown",how:"the question whether to send invitations, asked on Save with guests; to observe"},{key:"invite_send",route:null,role:"button",label:"Send",selector:null,observed:"unknown",how:"the invitation question's Send button, to observe"},{key:"invite_skip",route:null,role:"button",label:"Don't send",selector:null,observed:"unknown",how:"the invitation question's Don't send button, to observe"},{key:"saved_toast",route:null,role:null,label:"Event saved",selector:null,observed:"unknown",how:"the toast after Save, to observe"},{key:"event_id",route:null,role:null,label:null,selector:'[data-eventid], a[href*="/r/eventedit/"]',observed:"unknown",how:"a saved event's id in an attribute or in the link of the saved note, to observe"},{key:"delete",route:null,role:"button",label:"Delete event",selector:null,observed:"unknown",how:"the editor's Delete event button, to observe"},{key:"deleted_toast",route:null,role:null,label:"Event deleted",selector:null,observed:"unknown",how:"the toast after Delete, to observe"}];var $v=["editor_route","event_route","sign_in","title","start_date","start_time","end_time","end_date","all_day","guests_field","guest_chip","save","invite_dialog","invite_send","invite_skip","saved_toast","event_id","delete","deleted_toast"],F=ot(tp,$v),Xr="calendar.google.com";var np=`https://${Xr}`,jv=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/,Gv=/^(UTC|[A-Z][A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){1,2})$/,zv=/^[A-Za-z0-9_=-]{1,200}$/;function fo(e){let t;try{t=new URL(e)}catch{return null}if(t.hostname!==Xr)return null;let r=/^\/calendar\/(?:u\/(\d+)\/)?/.exec(t.pathname);return r?Number(r[1]??0):null}function rp(e,t){let r=jv.exec(e);if(!r)throw new Error("not a local time");if(t&&r[4]===void 0)throw new Error("a time is missing");return{date:`${r[1]}${r[2]}${r[3]}`,time:r[4]===void 0?null:`${r[4]}${r[5]}${r[6]??"00"}`}}function Wv(e){return new Date(Date.UTC(Number(e.slice(0,4)),Number(e.slice(4,6))-1,Number(e.slice(6,8))+1)).toISOString().slice(0,10).replace(/-/g,"")}function Ms(e){let t=rp(e.start,!e.allDay),r=rp(e.end,!e.allDay);if(e.allDay){if(r.date<t.date)throw new Error("the event ends before it starts");return`${t.date}/${Wv(r.date)}`}let n=`${t.date}T${t.time}`,o=`${r.date}T${r.time}`;if(o<=n)throw new Error("the event ends before it starts");return`${n}/${o}`}function Ls(e){return it(F.editor_route.route,{account:e})}function mo(e,t){if(!Gv.test(t.zone))throw new Error("not a zone name");let r=new URLSearchParams({text:t.title,dates:Ms(t),ctz:t.zone});return t.details.trim()&&r.set("details",t.details),t.where.trim()&&r.set("location",t.where),`${np}${Ls(e)}?${r.toString()}`}function ho(e,t){if(!zv.test(t))throw new Error("not an event id");return np+it(F.event_route.route,{account:e,eid:t})}var op=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];function ip(e){let t=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(e);return t?{y:Number(t[1]),mo:Number(t[2]),d:Number(t[3]),h:Number(t[4]??0),mi:Number(t[5]??0)}:null}function Os(e,t){let r=ip(t);if(!r)return!1;let n=e.toLowerCase(),o=/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/.exec(n);if(o)return Number(o[1])===r.mo&&Number(o[2])===r.d&&Number(o[3])===r.y;let i=op.filter(c=>new RegExp(`\\b${c}`).test(n));if(i.length!==1||i[0]!==op[r.mo-1]||(n.match(/\b\d{4}\b/g)??[]).some(c=>Number(c)!==r.y))return!1;let a=(n.replace(/\b\d{4}\b/g,"").match(/\b\d{1,2}\b/g)??[]).map(Number);return a.length===1&&a[0]===r.d}function Ns(e,t){let r=ip(t);if(!r)return!1;let n=e.toLowerCase().replace(/[\s.]/g,""),o=/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/.exec(n);if(!o)return!1;let i=Number(o[1]),s=Number(o[2]??0);if(o[3]===void 0&&o[2]===void 0)return!1;if(o[3]!==void 0){if(i<1||i>12)return!1;i=i%12+(o[3]==="pm"?12:0)}return i===r.h&&s===r.mi}function sp(e){let t=M(e,"title"),r=M(e,"start"),n=M(e,"end"),o=M(e,"zone");return!t||!r||!n||!o||t.length>200?null:{title:t,start:r,end:n,zone:o,allDay:Wt(e,"allDay"),where:M(e,"where")??"",details:M(e,"details")??""}}var ap=e=>e.location.hostname==="accounts.google.com"||k(e,F.sign_in).length>0,cp=async e=>{if(ap(e.doc))return g("sign_in");let t=fo(e.doc.location.href);return t===null?g("wrong_state"):_({account:t})},lp=async(e,t)=>{let r=sp(t);if(!r)return g("check");let n;try{n=mo(Ke(t),r)}catch{return g("check")}if(ap(e.doc))return g("sign_in");let o=e.doc.location;if(o.hostname!==Xr||o.pathname!==Ls(Ke(t)))return Ve(n);let i=await N(e,()=>k(e.doc,F.title)[0]??null,L.page);return i?ne(i)===r.title?_({}):g("check"):g("hook_missed")},Qr=e=>k(e,F.guest_chip).map(t=>t.getAttribute("data-email")??"").filter(Boolean),dp=async(e,t)=>{let r=nt(t,"guests");if(r.some(i=>!Pe(i)))return g("check",{refused:"not_address"});let n=He(Qr(e.doc),r);if(n.length>0)return g("check",{strangers:n});if(r.length>0){let i=await le(e,e.doc,F.guests_field,"the Add guests field of the event editor");if(!i)return g("hook_missed");for(let s of r){let a=await Yr(e,i,s,r,()=>Qr(e.doc));if(a)return a}}let o=Qr(e.doc);return yt(o,r)?_({guests:o}):g("check",{strangers:He(o,r)})},Zr=(e,t)=>{let r=k(e,F[t])[0];return r?ne(r):null},up=async(e,t)=>{let r=sp(t);if(!r)return g("check");if(Zr(e.doc,"title")!==r.title)return g("check",{field:"title"});let n=Zr(e.doc,"start_date");if(n===null)return g("hook_missed");if(!Os(n,r.start))return g("check",{field:"start_date"});let o=Zr(e.doc,"end_date");if(o!==null&&o.trim()!==""&&!Os(o,r.end))return g("check",{field:"end_date"});if(r.allDay){let a=k(e.doc,F.all_day)[0];return(a?a.checked===!0||a.getAttribute("aria-checked")==="true":!1)?_({}):g("check",{field:"all_day"})}let i=Zr(e.doc,"start_time"),s=Zr(e.doc,"end_time");return i===null||s===null?g("hook_missed"):Ns(i,r.start)?Ns(s,r.end)?_({}):g("check",{field:"end_time"}):g("check",{field:"start_time"})};async function fp(e,t){let r=k(e.doc,F.invite_dialog)[0];if(!r)return null;let n=t?await le(e,r,F.invite_send,"the Send button of the invitations question"):k(r,F.invite_skip)[0];return n?(await e.click(n),"answered"):"missed"}var mp=async(e,t,r)=>{let n=k(e.doc,F.title)[0];if(!n)return g("wrong_state");if(r.pressed.has(n))return g("check",{refused:"already_pressed"});let o=nt(t,"guests");if(o.some(d=>!Pe(d)))return g("check",{refused:"not_address"});let i=Qr(e.doc);if(!yt(i,o))return g("check",{strangers:He(i,o)});let s=Wt(t,"invite")&&o.length>0;if(s&&!Wt(t,"confirmed"))return g("check",{refused:"not_confirmed"});let a=await le(e,e.doc,F.save,"the Save button of the event editor");if(!a)return g("hook_missed");r.pressed.add(n),await e.click(a);let c=await N(e,()=>k(e.doc,F.invite_dialog).length>0?"ask":k(e.doc,F.saved_toast).length>0||!n.isConnected?"saved":null,L.page);return c===null?g("timeout",{pressed:!0}):c==="saved"?_({invited:!1,asked:!1}):await fp(e,s)==="missed"?g("hook_missed",{pressed:!0}):_({invited:s,asked:!0})},pp=/\/r\/eventedit\/([A-Za-z0-9_=-]+)/,hp=async(e,t)=>{if(!await N(e,()=>k(e.doc,F.saved_toast).length>0||k(e.doc,F.title).length===0?!0:null,L.page))return g("timeout");let n=e.doc.location,o=pp.exec(n.pathname)?.[1]??new URLSearchParams(n.search).get("eid"),i=M(t,"title")??"",s=k(e.doc,F.event_id),a=p=>p.getAttribute("data-eventid")??pp.exec(p.getAttribute("href")??"")?.[1]??null,c=s.find(p=>p.hasAttribute("data-eventid")&&(p.textContent??"").trim()===i.trim()),l=s.filter(p=>!p.hasAttribute("data-eventid")),d=c?a(c):l.length===1?a(l[0]):null;return _({eventId:o??d})},gp=async(e,t)=>{let r=M(t,"eventId"),n=M(t,"title");if(!r||!n)return g("check");let o;try{o=ho(Ke(t),r)}catch{return g("check")}if(e.doc.location.pathname!==new URL(o).pathname)return Ve(o);let i=await N(e,()=>k(e.doc,F.title)[0]??null,L.page);if(!i)return g("hook_missed");if(ne(i)!==n)return g("wrong_state");let s=await le(e,e.doc,F.delete,"the Delete event button of the event editor");return s?(await e.click(s),await fp(e,!1),await N(e,()=>k(e.doc,F.deleted_toast).length>0||!i.isConnected?!0:null,L.page)?_({}):g("timeout")):g("hook_missed")};var bp={account:cp,open_editor:lp,guests:dp,check:up,save:mp,saved:hp,delete:gp};var wp=typeof Intl<"u"&&"Segmenter"in Intl?new Intl.Segmenter(void 0,{granularity:"grapheme"}):null;function xt(e){if(!wp)return[...e].length;let t=0;for(let r of wp.segment(e))t++;return t}var yp=[{key:"doc_route",route:"/document/d/{id}/edit",role:null,label:null,selector:null,observed:"unknown",how:"a document's editor address, to observe"},{key:"text_target",route:null,role:null,label:null,selector:"iframe.docs-texteventtarget-iframe",observed:"unknown",how:"the hidden frame Docs takes keystrokes through, widely reported by extension authors; to observe"},{key:"target_editable",route:null,role:null,label:null,selector:'[contenteditable="true"], [contenteditable=""]',observed:"unknown",how:"the editable inside the text event target, which may mirror the selection for copy and input methods; to observe"},{key:"canvas_tile",route:null,role:null,label:null,selector:"canvas.kix-canvas-tile-content",observed:"unknown",how:"the canvas tiles Docs draws its pages on, widely reported by extension authors; the change preview keeps its boxes relative to them (8.4); to observe"},{key:"selection_boxes",route:null,role:null,label:null,selector:".kix-canvas-tile-selection rect",observed:"unknown",how:"the boxes of Docs' own selection overlay above the canvas, reported by extension authors; the change preview reads them while code selects each change (8.4); to observe"}];var Vv=["doc_route","text_target","target_editable","canvas_tile","selection_boxes"],vt=ot(yp,Vv),xp="docs.google.com";function Kt(e){let t=it(vt.doc_route.route,{id:"ID"}).replace("ID","[\\w-]+");return e.location.hostname===xp&&new RegExp(`^/document/(?:u/\\d+/)?${t.slice(10)}`).test(e.location.pathname)}function st(e){let t=e.querySelector(vt.text_target.selector);if(!(t&&t.tagName==="IFRAME"))return null;let r=null;try{r=t.contentDocument}catch{return null}let n=r?.defaultView,o=r?.querySelector(vt.target_editable.selector);return r&&n&&o?{win:n,doc:r,editable:o}:null}var go=e=>e.editable.textContent??"";function Vt(e){e.win.focus(),e.editable.focus()}function oe(e,t,r){let n={key:t,code:t,shiftKey:r,bubbles:!0,cancelable:!0,composed:!0};e.editable.dispatchEvent(new e.win.KeyboardEvent("keydown",n)),e.editable.dispatchEvent(new e.win.KeyboardEvent("keyup",n))}function en(e,t){for(let r=0;r<t;r++)oe(e,"ArrowLeft",!0)}async function bo(e,t,r,n){let o=null,i=s=>{let a=s.clipboardData?.getData("text/plain")??"";a&&(o=a)};t.win.addEventListener("copy",i);try{r?.();let s=e.now()+n;for(;o===null&&e.now()<s;)await e.sleep(50);return o}finally{t.win.removeEventListener("copy",i)}}var _r=e=>({x:e.left,y:e.top,width:e.width,height:e.height});function wo(e,t){let r=Math.max(e.x,t.x),n=Math.max(e.y,t.y),o=Math.min(e.x+e.width,t.x+t.width),i=Math.min(e.y+e.height,t.y+t.height);return o>r&&i>n?{x:r,y:n,width:o-r,height:i-n}:null}function yo(e,t){if(e.width<=2){let r=e.x+e.width/2;if(r<t.x||r>t.x+t.width)return null;let n=Math.max(e.y,t.y),o=Math.min(e.y+e.height,t.y+t.height);return o>n?{...e,y:n,height:o-n}:null}return wo(e,t)}function xo(e){if(e.length===0)return null;let t=Math.min(...e.map(i=>i.x)),r=Math.min(...e.map(i=>i.y)),n=Math.max(...e.map(i=>i.x+i.width)),o=Math.max(...e.map(i=>i.y+i.height));return{x:t,y:r,width:n-t,height:o-r}}function qt(e){let t=[];for(let r of[...e].filter(n=>n.height>0).sort((n,o)=>n.y-o.y||n.x-o.x)){let n=t[t.length-1];if(n&&Math.abs(n.y-r.y)<=1&&Math.abs(n.y+n.height-r.y-r.height)<=1&&r.x<=n.x+n.width+1){let o=Math.max(n.x+n.width,r.x+r.width);n.width=o-n.x}else t.push({...r})}return t}function Yt(e){let t=0,r=0,n=e;for(;n!==n.parent;){let o=n.frameElement;if(!o)break;let i=o.getBoundingClientRect(),s=o.ownerDocument.defaultView.getComputedStyle(o);t+=i.left+o.clientLeft+parseFloat(s.paddingLeft||"0"),r+=i.top+o.clientTop+parseFloat(s.paddingTop||"0"),n=n.parent}return{x:t,y:r}}function vo(e){let t=e.ownerDocument,r=t.defaultView,n=s=>{let a=Yt(s.ownerDocument.defaultView),c=s.getBoundingClientRect();return s.clientWidth===0&&s.clientHeight===0?{x:c.left+a.x,y:c.top+a.y,width:c.width,height:c.height}:{x:c.left+s.clientLeft+a.x,y:c.top+s.clientTop+a.y,width:s.clientWidth,height:s.clientHeight}},o=n(e);for(let s=e.parentElement;s&&o;s=s.parentElement){let a=r.getComputedStyle(s);/(auto|scroll|hidden|clip)/.test(`${a.overflowX}${a.overflowY}`)&&s!==t.documentElement&&s!==t.body&&(o=wo(o,n(s)))}for(let s=r;o&&s!==s.parent&&s.frameElement;s=s.parent)o=wo(o,n(s.frameElement));let i=r.top??r;return o&&wo(o,{x:0,y:0,width:i.innerWidth,height:i.innerHeight})}var qv=400,Yv=16,_p=e=>[...e.querySelectorAll(vt.selection_boxes.selector)].map(t=>_r(t.getBoundingClientRect())).filter(t=>t.width>0&&t.height>0),ko=e=>e.map(t=>`${Math.round(t.x)},${Math.round(t.y)},${Math.round(t.width)}`).join(";");async function vp(e,t,r){let n=e.now()+qv;for(;;){let o=_p(t);if(o.length>0&&ko(o)!==r)return o;if(e.now()>=n)return[];await e.sleep(Yv)}}function kp(e,t){let r=[...e.querySelectorAll(vt.canvas_tile.selector)],n=[];for(let o of t){let i=o.x+o.width/2,s=o.y+o.height/2,a=r.find(l=>{let d=l.getBoundingClientRect();return i>=d.left&&i<=d.right&&s>=d.top&&s<=d.bottom});if(!a)continue;let c=a.getBoundingClientRect();n.push({tile:a,dx:o.x-c.left,dy:o.y-c.top,width:o.width,height:o.height})}return n}async function Ds(e,t,r,n){let o=e.doc,i=h=>xt(r.slice(0,h)),s=i(r.length),a=ko(_p(o));for(let h=0;h<s;h++)oe(t,"ArrowLeft",!0);let c=qt(await vp(e,o,a));if(oe(t,"ArrowRight",!1),c.length===0)return null;a=ko(c);let l=kp(o,c),d=s,p=n.map(()=>[]),u=!0,f=n.map((h,w)=>({c:h,i:w})).sort((h,w)=>w.c.after.start-h.c.after.start);for(let{c:h,i:w}of f){let x=r.slice(h.after.start,h.after.end),b=x.length-x.trimStart().length,v=b===x.length;if(v&&!h.old.trim())continue;let E=i(h.after.start+b),P=v?E+1:i(h.after.end-(x.length-x.trimEnd().length)),q=v&&E>=s;if(q&&([E,P]=[s-1,s]),E<0||P<=E)continue;for(;d<P;d++)oe(t,"ArrowRight",!1);for(;d>P;d--)oe(t,"ArrowLeft",!1);for(let pe=d;pe>E;pe--)oe(t,"ArrowLeft",!0);let Q=qt(await vp(e,o,a));if(oe(t,"ArrowLeft",!1),d=E,Q.length===0){u=!1;break}a=ko(Q);let ie=kp(o,Q),V=ie[0];v?V&&(p[w]=[{...V,dx:q?V.dx+V.width-1:V.dx-1,width:2}]):p[w]=ie}for(;d<s;d++)oe(t,"ArrowRight",!1);return u?{changes:p,whole:l}:null}var Hs=e=>{let t=e.getBoundingClientRect();return`${Math.round(t.width)}x${Math.round(t.height)}`};function Fs(e,t,r){let n=new Map;for(let o of[...e.flat(),...t])n.set(o.tile,Hs(o.tile));return{boxes:e,whole:t,olds:r,sizes:n,caretMoved:!1}}var Sp=e=>{let t=e.tile.getBoundingClientRect();return{x:t.left+e.dx,y:t.top+e.dy,width:e.width,height:e.height}};function Ep(e,t,r,n,o){let i=()=>[...e.sizes.keys()];return{docs:[r,t.doc],root:n,keyEdits:!0,owns:s=>{let a=s;return!!a&&(a===t.doc||a.ownerDocument===t.doc||a===t.editable)},alive:()=>t.editable.isConnected&&i().every(s=>s.isConnected),olds:()=>e.olds,isOriginal:()=>!1,clip:()=>xo(i().map(s=>vo(s)).filter(s=>s!==null)),measure(){let s=i().some(a=>e.sizes.get(a)!==Hs(a));return s&&!e.caretMoved&&o(),e.boxes.map(a=>s?[]:a.map(Sp))},whole:()=>i().some(s=>e.sizes.get(s)!==Hs(s))?[]:e.whole.map(Sp)}}var Jv=`
.coere-rw{position:absolute;inset:0;pointer-events:none}
.coere-rw-box{position:absolute;border-radius:3px;background:rgba(82,103,247,.22);box-shadow:inset 0 -2px 0 ${rt.color}}
.coere-rw-bar{position:absolute;border-radius:1px;background:${rt.color}}
.coere-rw-tip{position:absolute;pointer-events:auto;max-width:320px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 10px;border-radius:8px;background:#fff;color:#1f1f1f;border:1px solid rgba(0,0,0,.12);box-shadow:0 4px 16px rgba(0,0,0,.14);font:13px/18px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.coere-rw-was{color:#5f6368;text-decoration:line-through;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.coere-rw-tip button{all:unset;flex:none;cursor:pointer;padding:3px 8px;border-radius:6px;font-weight:600;color:${rt.color}}
.coere-rw-tip button:hover{background:rgba(82,103,247,.1)}
.coere-rw-tip button:focus-visible{outline:2px solid ${rt.color};outline-offset:1px}
:host([data-theme='dark']) .coere-rw-tip{background:#202124;color:#e8eaed;border-color:rgba(255,255,255,.14)}:host([data-theme='dark']) .coere-rw-was{color:#9aa0a6}:host([data-theme='dark']) .coere-rw-tip button{color:#aab6ff}
`,_o=2;function Cp(e,t){let r=e.ownerDocument,n=r.createElement("style");n.textContent=Jv;let o=r.createElement("div");o.className="coere-rw",o.setAttribute("aria-hidden","true");let i=r.createElement("div");i.className="coere-rw-tip",i.hidden=!0,e.append(n,o,i);let s=[],a=null,c=!1;i.addEventListener("pointerenter",()=>c=!0),i.addEventListener("pointerleave",()=>{c=!1,l()});let l=()=>{i.hidden=!0,a=null};function d(p){let u=t.olds()[p]??"";if(!u.trim()&&!t.goBack)return l();if(a!==p){if(i.replaceChildren(),u.trim()){let E=r.createElement("span");E.className="coere-rw-was",E.textContent=u.trim(),i.append(E)}if(t.goBack){let E=r.createElement("button");E.type="button",E.textContent=t.goBack,E.addEventListener("click",P=>{l(),t.onGoBack(p)}),i.append(E)}a=p}i.hidden=!1;let f=s[p][0],h=r.defaultView,w=Math.min(320,i.offsetWidth||200),x=i.offsetHeight||32,b=Math.max(8,Math.min(f.x,h.innerWidth-w-8)),v=f.y-x-6>=4?f.y-x-6:f.y+f.height+6;i.style.left=`${b}px`,i.style.top=`${v}px`}return{draw(p,u){return s=p.map(f=>f.map(h=>u?yo(h,u):h).filter(h=>h!==null)),o.replaceChildren(...s.flat().map(f=>{let h=r.createElement("div");return h.className=f.width<=2?"coere-rw-bar":"coere-rw-box",h.style.cssText=`left:${f.x}px;top:${f.y}px;width:${f.width}px;height:${f.height}px`,h})),a!==null&&!s[a]?.length?l():a!==null&&d(a),s},hover(p,u){let f=s.findIndex(h=>h.some(w=>p>=w.x-_o&&p<=w.x+w.width+_o&&u>=w.y-_o&&u<=w.y+w.height+_o));f>=0?d(f):c||l()},remove(){n.remove(),o.remove(),i.remove()}}}var Xv=e=>e.ctrlKey||e.metaKey?["v","x"].includes(e.key.toLowerCase()):e.key.length===1||e.key==="Backspace"||e.key==="Delete"||e.key==="Enter",Zv=e=>(e.ctrlKey||e.metaKey)&&!e.altKey&&["z","y"].includes(e.key.toLowerCase()),Qv=250;function Rp(e,t){let r=[],n=null,o=e.docs[0].defaultView,i=()=>{n===null&&(n=o.requestAnimationFrame(()=>{n=null,t.redraw()}))},s=(h,w,x,b=!0)=>{let v={capture:b,passive:w!=="keydown"};h.addEventListener(w,x,v),r.push(()=>h.removeEventListener(w,x,v))};for(let h of e.docs){let w=h.defaultView;w&&(s(w,"scroll",i),s(w,"resize",i),s(h,"input",i),s(h,"pointermove",x=>{let b=x,v=Yt(w);t.hover(b.clientX+v.x,b.clientY+v.y)}),s(h,"beforeinput",x=>{let b=x;e.owns(b.target)&&(b.inputType.startsWith("history")?t.undone():t.edited())}),s(h,"keydown",x=>{let b=x;if(!b.isComposing){if(b.key==="Escape"&&e.owns(b.target)){b.preventDefault(),b.stopImmediatePropagation(),t.escape();return}!e.keyEdits||!e.owns(b.target)||(Zv(b)?setTimeout(t.undone,60):Xv(b)&&t.edited())}}),s(h,"paste",x=>{e.owns(x.target)&&t.edited()}))}let a=o.visualViewport;a&&(s(a,"resize",i,!1),s(a,"scroll",i,!1));let c=e.docs[0].fonts;c?.addEventListener&&s(c,"loadingdone",i,!1);let l=e.root.ownerDocument.defaultView?.MutationObserver??MutationObserver,d=new l(i);d.observe(e.root,{subtree:!0,childList:!0,characterData:!0}),r.push(()=>d.disconnect());let p=e.root.ownerDocument.defaultView?.ResizeObserver;if(p){let h=new p(i);h.observe(e.root),r.push(()=>h.disconnect())}let u="",f=o.setInterval(()=>{let h=e.root.getBoundingClientRect(),w=`${h.left},${h.top},${h.width},${h.height}`;w!==u&&i(),u=w},Qv);return r.push(()=>o.clearInterval(f)),()=>{n!==null&&o.cancelAnimationFrame(n);for(let h of r.splice(0))h()}}function So(e,t){let r=!0,n=!1,o=Cp(t.layer(),{olds:()=>e.olds(),goBack:e.revertOne?t.goBackLabel:null,onGoBack:u=>{if(!r||!e.revertOne||!p.quiet(()=>e.revertOne(u)))return;let h=e.olds().length;h===0||e.isOriginal()?d("reverted"):(t.emit({type:"rewrite",end:null,left:h}),i())}});function i(){if(!r)return;if(t.alive&&!t.alive())return l();if(!e.alive())return d("accepted");let u=e.measure();if(!u)return d(e.isOriginal()?"reverted":"accepted");let f=e.clip(),h=o.draw(u,f),w=(e.whole?.()??[]).map(x=>f?yo(x,f):x).filter(x=>x!==null);t.anchor(xo([...h.flat(),...w]))}let s=Rp(e,{redraw:()=>{n||i()},edited:()=>{n||d("accepted")},undone:()=>{n||i()},escape:()=>t.emit({type:"press",press:{kind:"rewrite",button:"go_back"}}),hover:(u,f)=>o.hover(u,f)}),a=e.docs[0].defaultView,c=a.setInterval(()=>{t.alive&&!t.alive()&&l()},1e3);function l(){r=!1,a.clearInterval(c),s(),o.remove(),t.anchor(null)}function d(u){r&&(l(),t.emit({type:"rewrite",end:u,left:e.olds().length}))}let p={stop(){r&&l()},redraw:i,quiet(u){n=!0;try{return u()}finally{n=!1}}};return i(),p}function Eo(e,t,r,n){t.pasteWatch?.();let o=s=>{i(),setTimeout(()=>{n(),e.preview?.emit({type:"press",press:{kind:"rewrite",button:"pasted"}})},80)},i=()=>{r.removeEventListener("paste",o,!0),t.pasteWatch===i&&(t.pasteWatch=null)};r.addEventListener("paste",o,!0),t.pasteWatch=i}async function kt(e,t,r){return r==="mirror"?go(t):r==="copy"?await bo(e,t,()=>t.doc.execCommand("copy"),200)??"":null}function ek(e){Vt(e);let t=e.doc.createRange();t.selectNodeContents(e.editable);let r=e.doc.getSelection();r?.removeAllRanges(),r?.addRange(t)}function tk(e,t){let r=new e.win.DataTransfer;r.setData("text/plain",t),e.editable.dispatchEvent(new e.win.ClipboardEvent("paste",{clipboardData:r,bubbles:!0,cancelable:!0,composed:!0}))}async function tn(e,t,r,n,o){ek(t),t.doc.execCommand("insertText",!1,o);let i=await kt(e,t,r);if(i===null||i!==n)return"insert";tk(t,o);let s=await kt(e,t,r);return s!==null&&s!==n?"paste":null}var Bs=e=>{e.preview?.ctl.stop(),e.preview=null},Ap=async(e,t,r)=>{let n=r.docs;if(!n?.replacement||!e.preview||!Kt(e.doc))return g("wrong_state");let o=st(e.doc);if(!o)return g("hook_missed");Bs(r);let i=n.replacement,s=Ht(n.text,i),a=await Ds(e,o,i,s),c=Fs(a?.changes??s.map(()=>[]),a?.whole??[],s.map(w=>w.old)),l=e.doc.querySelector(vt.canvas_tile.selector)?.parentElement??e.doc.body,d=!1,p=()=>{d||c.caretMoved||(d=!0,Ds(e,o,i,s).then(w=>{d=!1,!(!w||c.caretMoved)&&(Object.assign(c,Fs(w.changes,w.whole,c.olds),{caretMoved:c.caretMoved}),h.redraw())}))},u=w=>{c.caretMoved=!0},f=[[e.doc,"pointerdown"],[o.doc,"keydown"],[o.doc,"pointerdown"]];for(let[w,x]of f)w.addEventListener(x,u,!0);let h=So(Ep(c,o,e.doc,l,p),e.preview);return r.preview={ctl:{...h,stop(){for(let[w,x]of f)w.removeEventListener(x,u,!0);h.stop()}},field:null},_({changes:s.length,drawn:a!==null})},Pp=async(e,t,r)=>(Bs(r),_({}));async function Co(e,t,r,n){return en(t,n),kt(e,t,r)}function Tp(e){let t=/Mac/i.test(e.win.navigator.platform),r={key:"z",code:"KeyZ",ctrlKey:!t,metaKey:t,bubbles:!0,cancelable:!0,composed:!0};e.editable.dispatchEvent(new e.win.KeyboardEvent("keydown",r)),e.editable.dispatchEvent(new e.win.KeyboardEvent("keyup",r))}var Ip=async(e,t,r)=>{let n=r.docs;if(Bs(r),!n?.replacement||!Kt(e.doc))return g("wrong_state");let o=st(e.doc);if(!o)return g("hook_missed");let i=n.text,s=n.replacement,[a,c]=[xt(i),xt(s)],l=(d,p)=>(r.docs={...n,replacement:null},_({via:d,checked:p}));return Vt(o),n.read===null?(Tp(o),l("undo",!1)):await Co(e,o,n.read,c)!==s?(oe(o,"ArrowRight",!1),g("wrong_state",{changed:!0})):(oe(o,"ArrowRight",!1),Tp(o),await e.sleep(30),await kt(e,o,n.read)===i||(oe(o,"ArrowRight",!1),await Co(e,o,n.read,a)===i)?l("undo",!0):(oe(o,"ArrowRight",!1),await Co(e,o,n.read,c)!==s?(oe(o,"ArrowRight",!1),g("check")):await tn(e,o,n.read,s,i)?await Co(e,o,n.read,a)===i?l("insert",!0):g("check"):g("not_replaced",{via:"clipboard"})))},Mp=async(e,t,r)=>{let n=r.docs,o=M(t,"text");if(!n||!o||!Kt(e.doc))return g("wrong_state");let i=st(e.doc);return i?(Eo(e,r,i.doc,()=>r.docs={...n,replacement:o}),_({})):g("hook_missed")},Lp=async e=>{let t=st(e.doc);return t?(Vt(t),_({})):g("hook_missed")};var Op=4e3,rk=async(e,t,r)=>{if(!Kt(e.doc))return g("wrong_state");let n=st(e.doc);if(!n)return g("hook_missed");let o=Math.min(Math.max(Lt(t,"waitCopyMs")??0,0),6e4),i="mirror",s=o>0?"":go(n);if(!s){i=o>0?null:"copy";let c=o>0?null:()=>{Vt(n),n.doc.execCommand("copy")};s=await bo(e,n,c,o>0?o:200)??""}if(!s)return g("no_selection",{ask:"copy"});if(s.length>Op)return g("check",{refused:"too_long"});r.preview?.ctl.stop(),r.preview=null,r.pasteWatch?.(),r.docs={text:s,read:i,replacement:null};let a=Se(s);return _({text:a,redacted:a!==s,via:i??"person_copy"})},nk=async(e,t,r)=>{let n=r.docs,o=M(t,"text");if(!n||!Kt(e.doc))return g("wrong_state");if(!o||o.length>Op*2)return g("check");let i=st(e.doc);if(!i)return g("hook_missed");let s=await kt(e,i,n.read);if(s!==null&&s!==n.text)return g("wrong_state",{changed:!0});let a=await tn(e,i,n.read,n.text,o);return a?(n.replacement=o,_({via:a,readable:n.read!==null})):g("not_replaced",{via:"clipboard"})};async function Np(e,t,r,n){en(t,n);let o=await kt(e,t,r);return oe(t,"ArrowRight",!1),o}var ok=async(e,t,r)=>{let n=r.docs;if(!n?.replacement)return g("wrong_state");if(n.read===null)return g("check",{ask:!0});let o=st(e.doc);return o?await Np(e,o,n.read,xt(n.replacement))===n.replacement?_({}):g("check"):g("hook_missed")},ik=async(e,t,r)=>{let n=r.docs;if(!n?.replacement)return g("wrong_state");if(n.read===null)return g("not_replaced",{via:"clipboard"});let o=st(e.doc);if(!o)return g("hook_missed");if(en(o,xt(n.replacement)),await kt(e,o,n.read)!==n.replacement)return oe(o,"ArrowRight",!1),g("wrong_state",{changed:!0});if(!await tn(e,o,n.read,n.replacement,n.text))return g("not_replaced",{via:"clipboard"});let i=await Np(e,o,n.read,xt(n.text));return r.docs={...n,replacement:null},i===n.text?_({}):g("check")},Dp={read_selection:rk,replace_selection:nk,check_replace:ok,undo:ik,show_changes:Ap,go_back:Ip,end_preview:Pp,watch_paste:Mp,focus_text:Lp};var Hp=[{key:"text_field",route:null,role:null,label:null,selector:'textarea, input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"]',observed:"standard",how:"the HTML standard's text fields, whose selection is read from selectionStart and selectionEnd; no site to observe"},{key:"editable",route:null,role:null,label:null,selector:'[contenteditable]:not([contenteditable="false"])',observed:"standard",how:"a contenteditable editor, whose selection is the DOM selection inside it; no site to observe"}];var ak=["text_field","editable"],Ro=ot(Hp,ak);function Ce(e){let t=xe(e);return t==="input"||t==="textarea"?e.value:e.textContent??""}function Sr(e,t){let r=xe(e);return r==="input"||r==="textarea"?Ce(e)===t:Ie(Ce(e))===Ie(t)}function Us(e,t,r){let n=e.ownerDocument,o=n.createRange(),i=n.createTreeWalker(e,4),s=0,a=!1;o.selectNodeContents(e);for(let c=i.nextNode();c;c=i.nextNode()){let l=s+c.data.length;if(!a&&(t<l||t===l&&t===r)&&(o.setStart(c,t-s),a=!0),a&&r<=l)return o.setEnd(c,r-s),o;s=l}return o}function ck(e,t,r){e.focus();let n=xe(e);if(n==="input"||n==="textarea"){e.setSelectionRange(t,r);return}let o=e.ownerDocument.getSelection();o?.removeAllRanges(),o?.addRange(Us(e,t,r))}function lk(e,t){let r=xe(e);if(r!=="input"&&r!=="textarea"||Ce(e)===t)return;let n=e.ownerDocument.defaultView,o=r==="input"?n.HTMLInputElement.prototype:n.HTMLTextAreaElement.prototype;Object.getOwnPropertyDescriptor(o,"value")?.set?.call(e,t),e.dispatchEvent(new n.Event("input",{bubbles:!0,composed:!0}))}function Jt(e,t){let r=e.before.slice(0,e.start)+t+e.before.slice(e.end),n=()=>{lk(e.el,e.before),ck(e.el,e.start,e.end)};return Jr(e.el,t,()=>Sr(e.el,r),n)}var dk=new Set(["\u200B","\u200C","\u200D","\u2060","\uFEFF","\xAD"]),Bp=e=>/^\s$/u.test(e)||dk.has(e);function $s(e){let t=[],r=e.ownerDocument.createTreeWalker(e,4);for(let n=r.nextNode();n;n=r.nextNode()){let o=0;for(let i of n.data)Bp(i)||t.push({node:n,at:o,len:i.length}),o+=i.length}return t}function _t(e){let t="";for(let r of e)Bp(r)||(t+=r);return t}function Fp(e,t){return[..._t(e.slice(0,t))].length}function Up(e,t,r,n,o){let i=e.createRange();return i.setStart(t,r),i.setEnd(t,n),[...i.getClientRects()].map(s=>({..._r(s),x:s.left+o.x,y:s.top+o.y}))}function js(e,t,r){let n=$s(e),o=[..._t(t)];if(n.length!==o.length||n.some((a,c)=>a.node.data.slice(a.at,a.at+a.len)!==o[c]))return null;let i=e.ownerDocument,s=Yt(i.defaultView);return r.map(a=>{let c=Fp(t,a.start),l=Fp(t,a.end);if(l<=c)return uk(i,n,c,s);let d=[],p=c;for(;p<l;){let u=n[p].node,f=p;for(;f+1<l&&n[f+1].node===u;)f++;d.push(...Up(i,u,n[p].at,n[f].at+n[f].len,s)),p=f+1}return qt(d)})}function uk(e,t,r,n){let o=t[r],i=t[r-1],s=o??i;if(!s)return[];let a=Up(e,s.node,s.at,s.at+s.len,n)[0];return a?[{x:(o?a.x:a.x+a.width)-1,y:a.y,width:2,height:a.height}]:[]}var pk=["direction","fontStyle","fontVariant","fontWeight","fontStretch","fontSize","fontSizeAdjust","lineHeight","fontFamily","fontFeatureSettings","fontKerning","fontVariationSettings","textAlign","textTransform","textIndent","letterSpacing","wordSpacing","tabSize","wordBreak","overflowWrap","hyphens","textRendering","paddingTop","paddingRight","paddingBottom","paddingLeft","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"];function Gs(e,t,r){let n=e.ownerDocument.defaultView,o=n.getComputedStyle(e),i=e.tagName==="TEXTAREA",s=(r instanceof ShadowRoot,r.ownerDocument),a=s.createElement("div"),c=a.style;for(let b of pk)c.setProperty(b.replace(/[A-Z]/g,v=>`-${v.toLowerCase()}`),o.getPropertyValue(b.replace(/[A-Z]/g,v=>`-${v.toLowerCase()}`)));let l=e.getBoundingClientRect(),d=Yt(n),p=parseFloat(o.paddingLeft)+parseFloat(o.paddingRight),u=parseFloat(o.paddingTop)+parseFloat(o.paddingBottom);c.position="absolute",c.visibility="hidden",c.pointerEvents="none",c.boxSizing="content-box",c.borderStyle="solid",c.borderColor="transparent",c.margin="0",c.left=`${l.left+d.x}px`,c.top=`${l.top+d.y}px`,c.width=`${Math.max(0,e.clientWidth-p)}px`,c.overflow="hidden",i?(c.whiteSpace=o.whiteSpace==="normal"?"pre-wrap":o.whiteSpace,c.height="auto"):(c.whiteSpace="pre",c.height=`${Math.max(0,e.clientHeight-u)}px`,c.display="flex",c.alignItems="center");let f=s.createElement("span");f.style.whiteSpace="inherit",a.append(f);let h=e.value,w=[],x=0;for(let b of t){f.append(s.createTextNode(h.slice(x,b.start)));let v=s.createElement("span");v.textContent=b.end>b.start?h.slice(b.start,b.end):"\u200B",f.append(v),w.push(v),x=Math.max(x,b.end)}f.append(s.createTextNode(`${h.slice(x)}\u200B`)),r.append(a);try{let b=e.scrollLeft,v=e.scrollTop;return w.map((E,P)=>{let q=[...E.getClientRects()].map(V=>({..._r(V),x:V.left-b,y:V.top-v})),Q=t[P];if(Q.end>Q.start)return qt(q);let ie=q[0];return ie?[{x:ie.x-1,y:ie.y,width:2,height:ie.height}]:[]})}finally{a.remove()}}function jp(e,t,r,n,o,i){let s=t.slice(0,r)+i+t.slice(n),a=Ht(o,i).map(c=>({start:r+c.after.start,end:r+c.after.end,old:c.old,now:c.now}));return{el:e,original:t,expected:s,changes:a,reverts:0,start:r,end:n}}var To=e=>{let t=xe(e);return t==="input"||t==="textarea"};function fk(e,t){let r=t.slice(e.start,e.end),n=r.length-r.trimStart().length;return n<r.length?{start:e.start+n,end:e.end-(r.length-r.trimEnd().length)}:e.old.trim()?{start:e.start+n,end:e.start+n}:null}function $p(e,t,r){let n=$s(e),o=t.slice(0,r),i=[..._t(o)].length,s=o.length-o.trimEnd().length,a=new Map,c=0,l=e.ownerDocument.createTreeWalker(e,4);for(let f=l.nextNode();f;f=l.nextNode())a.set(f,c),c+=f.data.length;let d=(f,h)=>a.get(n[f].node)+n[f].at+(h?n[f].len:0),p=i>0?d(i-1,!0):0,u=i<n.length?d(i,!1):c;return Math.min(p+s,u)}function Gp(e,t){let r=e.el,n=r.ownerDocument;return{docs:[n.defaultView?.top?.document??n,n].filter((i,s,a)=>a.indexOf(i)===s),root:r,keyEdits:!1,owns:i=>i instanceof n.defaultView.Node&&(i===r||r.contains(i)),alive:()=>r.isConnected,olds:()=>e.changes.map(i=>i.old),clip:()=>vo(r),isOriginal:()=>To(r)?r.value===e.original:_t(Ce(r))===_t(e.original),measure(){let i=e.changes.map(l=>fk(l,e.expected)),s=i.filter(l=>l!==null),a;if(To(r)?a=r.value===e.expected?Gs(r,s,t()):null:a=js(r,e.expected,s),!a)return null;let c=0;return i.map(l=>l?a[c++]:[])},whole(){let i=e.expected.length-(e.original.length-e.end),s=[{start:e.start,end:i}];return(To(r)?r.value===e.expected?Gs(r,s,t()):null:js(r,e.expected,s))?.[0]??[]},revertOne(i){let s=e.changes[i];if(!s)return!1;let a=Ce(r),c=To(r),l=c?s.start:$p(r,e.expected,s.start),d=c?s.end:$p(r,e.expected,s.end);if(!Jt({el:r,start:l,end:d,before:a,text:a.slice(l,d)},s.old))return!1;let p=s.old.length-(s.end-s.start);return e.expected=e.expected.slice(0,s.start)+s.old+e.expected.slice(s.end),e.changes=e.changes.filter((u,f)=>f!==i).map(u=>u.start>=s.end?{...u,start:u.start+p,end:u.end+p}:u),e.reverts+=1,!0}}}var Io=e=>{let t=xe(e);return t==="input"||t==="textarea"},Ao=(e,t)=>Ce(e)===t,Po=(e,t)=>Io(e)?Ce(e)===t:_t(Ce(e))===_t(t);function Wp(e){let t=e.el;if(t.focus(),Io(t)){t.setSelectionRange(e.start,e.end,e.backward?"backward":"forward");return}let r=t.ownerDocument.getSelection(),n=Us(t,e.start,e.end);r&&(e.backward?r.setBaseAndExtent(n.endContainer,n.endOffset,n.startContainer,n.startOffset):r.setBaseAndExtent(n.startContainer,n.startOffset,n.endContainer,n.endOffset))}function zp(e,t){let r=e.ownerDocument.defaultView;return e.dispatchEvent(new r.InputEvent("beforeinput",{inputType:t,bubbles:!0,cancelable:!0,composed:!0}))}var zs=e=>{e.preview?.ctl.stop(),e.preview=null},Kp=async(e,t,r)=>{let n=r.replaced;if(!n||!e.preview||!n.held.el.isConnected)return g("wrong_state");zs(r);let o=n.held,i=jp(o.el,o.before,o.start,o.end,o.source??o.text,n.text),s=e.preview,a=So(Gp(i,()=>s.layer()),s);return r.preview={ctl:a,field:i},_({changes:i.changes.length})},Vp=async(e,t,r)=>(zs(r),_({}));function mk(e,t){return{start:e.start,end:Math.max(e.start,t.length-(e.before.length-e.end))}}var qp=async(e,t,r)=>{let n=r.replaced,o=r.preview?.field??null;if(!n||!n.held.el.isConnected)return g("wrong_state");let i=n.held,s=i.el,a=s.ownerDocument;zs(r);let c=(f,h=!0)=>(Wp(i),r.replaced=null,_({via:f,exact:h}));if(Ao(s,i.before))return c("none");let l=o?.expected??i.before.slice(0,i.start)+n.text+i.before.slice(i.end);if(!Po(s,l))return g("wrong_state",{changed:!0});if((o?.reverts??0)===0){s.focus();let f=!zp(s,"historyUndo");if(f||a.execCommand("undo"),Ao(s,i.before))return c("undo");if(Po(s,l)||(f?zp(s,"historyRedo"):a.execCommand("redo")),!Po(s,l))return g("check")}let d=Ce(s),p=mk(i,d),u=Io(s)?i.text:i.source??i.text;if(Jt({el:s,start:p.start,end:p.end,before:d,text:d.slice(p.start,p.end)},u),Ao(s,i.before))return c("insert");if(Io(s)){let f=a.defaultView,h=xe(s)==="input"?f.HTMLInputElement.prototype:f.HTMLTextAreaElement.prototype;if(Object.getOwnPropertyDescriptor(h,"value")?.set?.call(s,i.before),s.dispatchEvent(new f.Event("input",{bubbles:!0,composed:!0})),Ao(s,i.before))return c("value")}return Po(s,i.before)?c("insert",!1):g("check")},Yp=async(e,t,r)=>{let n=r.held,o=M(t,"text");return!n||!o||!n.el.isConnected?g("wrong_state"):(Eo(e,r,n.el.ownerDocument,()=>r.replaced={held:n,text:o}),_({}))},Jp=async(e,t,r)=>{let n=r.held;return!n||!n.el.isConnected?g("wrong_state"):(Wp(n),_({}))};var Xp=4e3;function hk(e){let t=e.activeElement;for(;;){let r=t?.shadowRoot?.activeElement??(t?.tagName==="IFRAME"?gk(t)?.activeElement:null);if(!r)return t;t=r}}function gk(e){try{return e.contentDocument}catch{return null}}function bk(e){let t=hk(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA")){let u=zt(t,De(t),Ne(t,De(t)));if(u.includes("secret")||u.includes("payment"))return"secret"}if(t?.matches(Ro.text_field.selector)){let u=t,f=u.selectionStart??0,h=u.selectionEnd??0;return h>f?{el:u,start:f,end:h,before:u.value,text:u.value.slice(f,h),backward:u.selectionDirection==="backward"}:null}let r=(t?.ownerDocument??e).getSelection();if(!r||r.isCollapsed||r.rangeCount===0)return null;let n=r.getRangeAt(0),o=n.commonAncestorContainer,i=(o.nodeType===1?o:o.parentElement)?.closest(Ro.editable.selector);if(!i)return null;let s=n.cloneRange();s.selectNodeContents(i),s.setEnd(n.startContainer,n.startOffset);let a=s.toString().length,c=n.toString(),l=r.toString(),d=l&&l.replace(/\s+/g,"")===c.replace(/\s+/g,"")?l:c,p=r.anchorNode===n.endContainer&&r.anchorOffset===n.endOffset&&!n.collapsed;return{el:i,start:a,end:a+c.length,before:Ce(i),text:c,source:d,backward:p}}var wk=async(e,t,r)=>{let n=bk(e.doc);if(n==="secret")return g("no_selection",{refused:"secret"});if(!n)return g("no_selection");let o=n.source??n.text;if(o.length>Xp)return g("check",{refused:"too_long"});r.preview?.ctl.stop(),r.preview=null,r.pasteWatch?.(),r.held=n,r.replaced=null;let i=Se(o);return _({text:i,redacted:i!==o,kind:n.el.matches(Ro.text_field.selector)?"text_field":"editable"})},yk=async(e,t,r)=>{let n=r.held,o=M(t,"text");return!n||!n.el.isConnected?g("wrong_state"):!o||o.length>Xp*2?g("check"):Sr(n.el,n.before)?Jt(n,o)?(r.replaced={held:n,text:o},_({})):g("not_replaced"):g("wrong_state",{changed:!0})},Zp=(e,t)=>e.before.slice(0,e.start)+t+e.before.slice(e.end),xk=async(e,t,r)=>{let n=r.replaced;return n?Sr(n.held.el,Zp(n.held,n.text))?_({}):g("check"):g("wrong_state")},vk=async(e,t,r)=>{let n=r.replaced;if(!n||!n.held.el.isConnected)return g("wrong_state");let o=Zp(n.held,n.text);if(!Sr(n.held.el,o))return g("wrong_state",{changed:!0});let i={...n.held,end:n.held.start+n.text.length,before:Ce(n.held.el),text:n.text};return Jt(i,n.held.text)?(r.replaced=null,Sr(n.held.el,n.held.before)?_({}):g("check")):g("not_replaced")},Qp={read_selection:wk,replace_selection:yk,check_replace:xk,undo:vk,show_changes:Kp,go_back:qp,end_preview:Vp,watch_paste:Yp,focus_text:Jp};var ef=[{key:"mailbox_route",route:"/mail/u/{account}/",role:null,label:null,selector:null,observed:"unknown",how:"Gmail's own address for an account, reported by users; to observe in milestone L"},{key:"search_route",route:"/mail/u/{account}/#search/{query}",role:null,label:null,selector:null,observed:"unknown",how:"Gmail writes the same hash when the person searches, reported by users; to observe"},{key:"drafts_route",route:"/mail/u/{account}/#drafts",role:null,label:null,selector:null,observed:"unknown",how:"the Drafts folder's hash, reported by users; to observe"},{key:"compose_route",route:"/mail/u/{account}/?view=cm&fs=1&tf=1",role:null,label:null,selector:null,observed:"unknown",how:"full window compose with an empty address, reported by users (Simon Willison's note); to observe"},{key:"sign_in",route:null,role:null,label:null,selector:'input[name="identifier"], input[type="password"]',observed:"unknown",how:"Google's sign in form fields, to observe"},{key:"main",route:null,role:"main",label:null,selector:null,observed:"unknown",how:"the message list's ARIA region, to observe"},{key:"row",route:null,role:"row",label:null,selector:null,observed:"unknown",how:"one conversation per ARIA row in the main list, to observe"},{key:"person",route:null,role:null,label:null,selector:"[email]",observed:"unknown",how:"a sender's name carrying its address in an email attribute, reported by users; to observe"},{key:"row_parts",route:null,role:null,label:null,selector:"span[data-thread-subject], .bog, span[data-snippet], .y2",observed:"unknown",how:"a row's subject and snippet spans by position, to observe"},{key:"message",route:null,role:"listitem",label:null,selector:null,observed:"unknown",how:"one message of an open thread per ARIA list item, to observe"},{key:"message_body",route:null,role:null,label:null,selector:'div[data-message-body], .a3s, div[dir="ltr"]',observed:"unknown",how:"a message's body block, to observe"},{key:"quote",route:null,role:null,label:null,selector:"blockquote, .gmail_quote",observed:"unknown",how:"quoted earlier mail inside a message, dropped when read; to observe"},{key:"when",route:null,role:null,label:null,selector:"[title]",observed:"unknown",how:"a row's or message's date with the full date in its title, to observe"},{key:"compose",route:null,role:"dialog",label:null,selector:"form",observed:"unknown",how:"the compose window around the subject field, to observe"},{key:"to_field",route:null,role:null,label:"To recipients",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the To field by its ARIA label, to observe"},{key:"cc_open",route:null,role:null,label:"Add Cc recipients",selector:"[aria-label]",observed:"unknown",how:"the Cc link that opens the Cc field, to observe"},{key:"cc_field",route:null,role:null,label:"Cc recipients",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the Cc field by its ARIA label, to observe"},{key:"chip",route:null,role:null,label:null,selector:"[data-hovercard-id], [email]",observed:"unknown",how:"a recipient chip holding its address in an attribute, to observe"},{key:"suggestion",route:null,role:"option",label:null,selector:null,observed:"unknown",how:"Gmail's own autocomplete rows under a recipients field, to observe"},{key:"subject",route:null,role:null,label:null,selector:'input[name="subjectbox"]',observed:"unknown",how:"the subject input by its name, reported by users; to observe"},{key:"body",route:null,role:"textbox",label:"Message Body",selector:'div[aria-label="Message Body"]',observed:"unknown",how:"the editable body by its ARIA label, reported by users; to observe"},{key:"saved_mark",route:null,role:null,label:"Draft saved",selector:null,observed:"unknown",how:"the mark the compose footer shows after autosave, to observe"},{key:"save_close",route:null,role:"button",label:"Save & close",selector:null,observed:"unknown",how:"the full window compose's close button, to observe"},{key:"send",route:null,role:"button",label:"Send",selector:null,observed:"unknown",how:"the compose's button whose label starts with Send, to observe"},{key:"discard",route:null,role:"button",label:"Discard draft",selector:null,observed:"unknown",how:"the compose's trash button, to observe"},{key:"sent_toast",route:null,role:null,label:"Message sent",selector:null,observed:"unknown",how:"the toast after a send, to observe"},{key:"undo",route:null,role:"link",label:"Undo",selector:null,observed:"unknown",how:"the toast's Undo link, shown for the time the person set in Gmail; to observe"},{key:"undone_mark",route:null,role:null,label:"Sending undone",selector:null,observed:"unknown",how:"the toast after Undo, to observe"}];var _k=["mailbox_route","search_route","drafts_route","compose_route","sign_in","main","row","person","row_parts","message","message_body","quote","when","compose","to_field","cc_open","cc_field","chip","suggestion","subject","body","saved_mark","save_close","send","discard","sent_toast","undo","undone_mark"],S=ot(ef,_k),at="mail.google.com";var tf=()=>({pressed:new WeakSet,held:null,replaced:null,docs:null,preview:null,pasteWatch:null}),qe={short:200,snippet:300,body:1200},ct=(e,t)=>{let r=e.replace(/\s+/g," ").trim();return r.length<=t?r:r.slice(0,t)};var Sk=/(?:^|[\s<(])([^\s@<>,;"()]+@[^\s@<>,;"()]+\.[a-z]{2,})/i;function Ek(e){for(let r of["data-address","data-hovercard-id","email"]){let n=e.getAttribute(r);if(n)return n}return[...e.querySelectorAll("*")].find(r=>r.children.length===0&&Pe(r.textContent??""))?.textContent?.trim()??Sk.exec(e.textContent??"")?.[1]??""}function Ck(e){let t=Ek(e);if(!Pe(t))return null;let r=(e.textContent??"").replace(t,"").replace(/[<>()]/g," ");return{name:ct(r,qe.short),address:t}}async function rf(e,t,r){if(!r.trim()||r.length>60)return g("check");let n=await le(e,t,S.to_field,"the To field of the open compose window");if(!n)return g("hook_missed");let o=k(t,S.chip).length;await e.type(n,r,!0);let i=await N(e,()=>{let a=k(e.doc,S.suggestion).filter(c=>!c.matches(S.chip.selector));return a.length>0?a:null},L.field)??[],s=[];for(let a of i){let c=Ck(a);c&&!s.some(l=>ye(l.address)===ye(c.address))&&s.push(c)}return await e.type(n,"",!0),await e.key(n,"Escape"),k(t,S.chip).length!==o?g("check",{refused:"chip_added"}):_({matches:s.slice(0,8)})}var Rk=new Set(["DIV","P","LI","TR","BLOCKQUOTE","H1","H2","H3","H4","H5","H6","PRE","SECTION"]);function nf(e,t=null){let r=[],n=o=>{if(o.nodeType===3){r.push(o.data);return}if(o.nodeType!==1)return;let i=o;if(t&&i.matches(t))return;if(i.tagName==="BR"){r.push(`
`);return}let s=Rk.has(i.tagName);s&&r.push(`
`),i.childNodes.forEach(n),s&&r.push(`
`)};return e.childNodes.forEach(n),r.join("").split(`
`).map(o=>o.replace(/\s+/g," ").trim()).filter(Boolean).join(`
`)}function of(e,t){return e.length<=t?e:e.slice(0,t)}var Ws=`https://${at}`;function Mo(e){let t;try{t=new URL(e)}catch{return null}if(t.hostname!==at)return null;let r=/^\/mail\/(?:u\/(\d+)\/)?/.exec(t.pathname);return r?Number(r[1]??0):null}function Ks(e){return`#search/${encodeURIComponent(e).replace(/%20/g,"+")}`}function Lo(e,t){return Ws+it(S.search_route.route,{account:e,query:Ks(t).slice(8)})}function Oo(e){return Ws+it(S.compose_route.route,{account:e})}function No(e){return Ws+it(S.drafts_route.route,{account:e})}function Xt(e){return it(S.mailbox_route.route,{account:e})}function Do(e){return e.location.hostname==="accounts.google.com"||k(e,S.sign_in).length>0}var sf=async e=>{if(Do(e.doc))return g("sign_in");let t=Mo(e.doc.location.href);return t===null?g("wrong_state"):_({account:t})},Tk=(e,t)=>{let r=n=>decodeURIComponent(n.replace(/\+/g," "));return r(e)===r(t)},af=async(e,t)=>{let r=M(t,"query");if(!r||r.length>200)return g("check");if(Do(e.doc))return g("sign_in");let n=Ke(t),o=e.doc.location;if(!(o.hostname===at&&o.pathname===Xt(n)&&!o.search.includes("view=")))return Ve(Lo(n,r));let s=Ks(r);return Tk(o.hash,s)||(o.hash=s,await e.sleep(L.poll)),await N(e,()=>k(e.doc,S.main)[0]??null,L.page)?_({}):g("hook_missed")};function Ak(e,t){let r=k(e,S.person)[0],n=k(e,S.row_parts),o=k(e,S.when);return{index:t,sender:ct(r?.getAttribute("name")??r?.textContent??"",qe.short),from:r?.getAttribute("email")??"",subject:Se(ct(n[0]?.textContent??"",qe.short)),snippet:Se(ct((n[1]?.textContent??"").replace(/^\s*-\s*/,""),qe.snippet)),date:o.at(-1)?.getAttribute("title")??""}}var cf=async(e,t)=>{let r=k(e.doc,S.main)[0];if(!r)return g("hook_missed");let n=Math.min(Math.max(Lt(t,"limit")??3,1),10);return _({rows:k(r,S.row).slice(0,n).map(Ak)})};function Pk(e){let t=k(e,S.person)[0],r=k(e,S.message_body)[0];return{from:t?.getAttribute("email")??"",sender:ct(t?.getAttribute("name")??t?.textContent??"",qe.short),date:k(e,S.when)[0]?.getAttribute("title")??"",body:r?Se(of(nf(r,S.quote.selector),qe.body)):""}}var lf=async(e,t)=>{let r=k(e.doc,S.main)[0],n=r?k(r,S.row)[Lt(t,"row")??0]:void 0;if(!n)return g("wrong_state");let o=e.doc.location.hash;await e.click(n);let i=await N(e,()=>{let c=k(e.doc,S.message).filter(l=>k(l,S.person).length>0);return c.length>0?c:null},L.page);if(!i)return g("timeout");let s=M(t,"from"),a=i.map(Pk).filter(c=>!s||ye(c.from)===ye(s));return e.doc.location.hash!==o&&(e.doc.location.hash=o),_({messages:a.slice(0,5)})};function Ye(e){let t=[S.subject,S.body,S.to_field];return k(e,S.compose).find(r=>t.some(n=>k(r,n).length>0))??null}function Er(e){return k(e,S.chip).map(t=>t.getAttribute("data-hovercard-id")??t.getAttribute("email")??"").filter(Boolean)}var df=async(e,t)=>{if(Do(e.doc))return g("sign_in");let r=Ke(t),n=e.doc.location;return n.hostname===at&&n.pathname===Xt(r)&&new URLSearchParams(n.search).get("view")==="cm"?await N(e,()=>Ye(e.doc),L.page)?_({}):Ve(`https://${at}${Xt(r)}`):Ve(Oo(r))};async function Ik(e,t,r,n){let o=k(t,S.cc_field)[0];if(!o){let i=await le(e,t,S.cc_open,"the Cc link of the open compose window");if(!i)return g("hook_missed");await e.click(i),o=await N(e,()=>k(t,S.cc_field)[0]??null,L.field)??void 0}if(!o)return g("hook_missed");for(let i of r){let s=await Yr(e,o,i,n,()=>Er(t));if(s)return s}return null}var uf=async(e,t)=>{let r=Ye(e.doc);if(!r)return g("wrong_state");let n=M(t,"lookup");if(n!==null)return rf(e,r,n);let o=nt(t,"to"),i=nt(t,"cc"),s=[...o,...i];if(o.length===0||s.some(d=>!Pe(d)))return g("check",{refused:"not_address"});let a=He(Er(r),s);if(a.length>0)return g("check",{strangers:a});let c=await le(e,r,S.to_field,"the To field of the open compose window");if(!c)return g("hook_missed");for(let d of o){let p=await Yr(e,c,d,s,()=>Er(r));if(p)return p}if(i.length>0){let d=await Ik(e,r,i,s);if(d)return d}let l=Er(r);return yt(l,s)?_({chips:l}):g("check",{strangers:He(l,s)})},pf=async(e,t)=>{let r=M(t,"text");if(r===null||r.length>250)return g("check");let n=Ye(e.doc);if(!n)return g("wrong_state");let o=await le(e,n,S.subject,"the Subject field of the open compose window");if(!o)return g("hook_missed");let i=ne(o).trim();return t.ifEmpty===!0&&i!==""?_({kept:i}):(await e.type(o,r,!0),ne(o)===r?_({}):g("check"))},ff=async(e,t)=>{let r=M(t,"text");if(!r||r.length>4e3)return g("check");let n=Ye(e.doc);if(!n)return g("wrong_state");let o=await le(e,n,S.body,"the message body of the open compose window");return o?(await e.type(o,r,!0),Ie(ne(o))===Ie(r)?_({}):g("check")):g("hook_missed")};async function mf(e,t){let r=await le(e,t,S.discard,"the Discard draft button of the open compose window");return r?(await e.click(r),await N(e,()=>t.isConnected?null:!0,L.page)?_({}):g("timeout")):g("hook_missed")}var hf=async(e,t)=>{let r=M(t,"subject");if(!r)return g("check");let n=Ye(e.doc);if(n){let l=k(n,S.subject)[0];return l&&ne(l)===r?mf(e,n):g("wrong_state")}let o=Ke(t),i=e.doc.location;if(i.hostname!==at||i.pathname!==Xt(o)||i.search.includes("view="))return Ve(No(o));i.hash!=="#drafts"&&(i.hash="#drafts");let s=await N(e,()=>k(e.doc,S.main)[0]??null,L.page);if(!s)return g("hook_missed");let a=k(s,S.row).filter(l=>(k(l,S.row_parts)[0]?.textContent??"").trim()===r);if(a.length!==1)return g("check",{matches:a.length});await e.click(a[0]);let c=await N(e,()=>Ye(e.doc),L.page);return c?mf(e,c):g("timeout")};var gf=async e=>{let t=Ye(e.doc);if(!t)return g("wrong_state");if(!await N(e,()=>k(t,S.saved_mark)[0]??null,L.saved))return g("timeout");let n=k(t,S.save_close)[0];return n&&await e.click(n),_({saved:!0,closed:n!==void 0})},bf=async(e,t,r)=>{if(!Wt(t,"confirmed"))return g("check",{refused:"not_confirmed"});let n=Ye(e.doc);if(!n)return g("wrong_state");if(r.pressed.has(n))return g("check",{refused:"already_pressed"});let o=nt(t,"to"),i=[...o,...nt(t,"cc")];if(o.length===0||i.some(d=>!Pe(d)))return g("check",{refused:"not_address"});let s=Er(n);if(!yt(s,i))return g("check",{strangers:He(s,i)});let a=k(n,S.body)[0];if(!a||ne(a).trim()==="")return g("check",{refused:"empty_body"});let c=await le(e,n,S.send,"the Send button of the open compose window");return c?(r.pressed.add(n),await e.click(c),await N(e,()=>!n.isConnected||k(e.doc,S.sent_toast).length>0?!0:null,L.page)?_({pressed:!0}):g("timeout",{pressed:!0})):g("hook_missed")},wf=async e=>await N(e,()=>k(e.doc,S.sent_toast)[0]??null,L.page)?_({undo:k(e.doc,S.undo).length>0}):g("timeout"),yf=async e=>{let t=k(e.doc,S.undo)[0];return t?(await e.click(t),await N(e,()=>k(e.doc,S.undone_mark).length>0||Ye(e.doc)?!0:null,L.page)?_({}):g("timeout")):g("timeout",{gone:!0})};var xf={account:sf,search:af,read_results:cf,read_thread:lf,compose:df,to:uf,subject:pf,body:ff,save_draft:gf,send:bf,sent:wf,discard:hf,undo_send:yf};function vf(e,t){let r=tf();return async n=>{let o=t[n.recipe],i=o&&Object.hasOwn(o,n.step)?o[n.step]:void 0;if(!i)return g("wrong_state");try{return await i(e,n.args,r)}catch{return g("hook_missed")}}}var kf=[{key:"google_title",route:null,role:null,label:null,selector:'#search a h3, #rso a h3, [role="main"] a h3',observed:"unknown",how:"a result's title as a heading inside its link on Google's results page, to observe in milestone L"},{key:"google_block",route:null,role:null,label:null,selector:"[data-hveid], .g, .MjjYud",observed:"unknown",how:"the block around one Google result, to observe"},{key:"google_snippet",route:null,role:null,label:null,selector:"[data-sncf], .VwiC3b",observed:"unknown",how:"a Google result's snippet, to observe"},{key:"bing_title",route:null,role:null,label:null,selector:"#b_results li.b_algo h2 a",observed:"unknown",how:"a Bing result's title link, to observe"},{key:"bing_block",route:null,role:null,label:null,selector:"li.b_algo",observed:"unknown",how:"the block around one Bing result, to observe"},{key:"bing_snippet",route:null,role:null,label:null,selector:".b_caption p",observed:"unknown",how:"a Bing result's snippet, to observe"},{key:"ddg_title",route:null,role:null,label:null,selector:'a[data-testid="result-title-a"]',observed:"unknown",how:"a DuckDuckGo result's title link, to observe"},{key:"ddg_block",route:null,role:null,label:null,selector:'article[data-testid="result"]',observed:"unknown",how:"the block around one DuckDuckGo result, to observe"},{key:"ddg_snippet",route:null,role:null,label:null,selector:'[data-result="snippet"]',observed:"unknown",how:"a DuckDuckGo result's snippet, to observe"}];var Ok=["google_title","google_block","google_snippet","bing_title","bing_block","bing_snippet","ddg_title","ddg_block","ddg_snippet"],lt=ot(kf,Ok);var Nk={google:{title:lt.google_title,block:lt.google_block,snippet:lt.google_snippet},bing:{title:lt.bing_title,block:lt.bing_block,snippet:lt.bing_snippet},duckduckgo:{title:lt.ddg_title,block:lt.ddg_block,snippet:lt.ddg_snippet}};function Vs(e){return/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(e)?"google":/^(www\.)?bing\.com$/.test(e)?"bing":/^(html\.|www\.)?duckduckgo\.com$/.test(e)?"duckduckgo":null}function qs(e,t){let r;try{r=new URL(e,t)}catch{return null}if(r.hostname===t.hostname&&r.pathname==="/url"){let n=r.searchParams.get("q")??r.searchParams.get("url");return n?qs(n,t):null}return r.protocol!=="https:"&&r.protocol!=="http:"||r.hostname===t.hostname||Vs(r.hostname)!==null?null:r.href.length<=2e3?r.href:null}function Dk(e,t){let r=e.closest(t.block.selector);for(let n=r;n;n=n.parentElement?.closest(t.block.selector)??null)if(k(n,t.snippet).length>0)return n;return r}var Hk=async(e,t)=>{if(qr(e.doc).some(a=>a.reason==="captcha"))return g("wrong_state",{human_check:!0});let r=new URL(e.doc.location.href),n=Vs(r.hostname);if(!n)return g("wrong_state");let o=Nk[n],i=Math.min(Math.max(Lt(t,"limit")??10,1),20),s=[];for(let a of k(e.doc,o.title)){let c=a.tagName==="A"?a:a.closest("a"),l=c?qs(c.getAttribute("href")??"",r):null;if(!l||s.some(u=>u.url===l))continue;let d=Dk(a,o),p=d?k(d,o.snippet)[0]?.textContent??"":"";if(s.push({title:Se(ct(a.textContent??"",qe.short)),url:l,snippet:Se(ct(p,qe.snippet))}),s.length===i)break}return _({engine:n,rows:s})},_f={read_results:Hk};async function Fk(e){let t=e.ownerDocument.defaultView;e.scrollIntoView?.({block:"center",inline:"center"});let r=e.getBoundingClientRect(),n={bubbles:!0,cancelable:!0,composed:!0,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0},o=t.PointerEvent??t.MouseEvent;e.dispatchEvent(new o("pointerover",n)),e.dispatchEvent(new o("pointerdown",n)),e.dispatchEvent(new t.MouseEvent("mousedown",n)),e instanceof t.HTMLElement&&e.focus(),e.dispatchEvent(new o("pointerup",n)),e.dispatchEvent(new t.MouseEvent("mouseup",n)),e.dispatchEvent(new t.MouseEvent("click",n))}function Bk(e){let t=xe(e);if(e.focus(),t==="input"||t==="textarea"){e.select();return}let r=e.ownerDocument.getSelection();if(!r)return;let n=e.ownerDocument.createRange();n.selectNodeContents(e),r.removeAllRanges(),r.addRange(n)}async function Uk(e,t,r){let n=ne(e),o=()=>r?Ie(ne(e))===Ie(t):Ie(ne(e))!==Ie(n)&&Ie(ne(e)).includes(Ie(t));return r?Jr(e,t,o,()=>Bk(e)):(e.focus(),Jr(e,t,o,()=>{}))}var $k={Enter:"Enter",Escape:"Escape",Tab:"Tab",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",PageDown:"PageDown",PageUp:"PageUp",Backspace:"Backspace"};async function jk(e,t){let r=e.ownerDocument.defaultView,n={key:t,code:$k[t],bubbles:!0,cancelable:!0,composed:!0};e.dispatchEvent(new r.KeyboardEvent("keydown",n)),e.dispatchEvent(new r.KeyboardEvent("keyup",n))}function Ys(e,t,r,n){return{...n?{preview:n}:{},doc:e,pick:t,elementOf:r,click:Fk,type:Uk,key:jk,sleep:o=>new Promise(i=>setTimeout(i,o)),now:()=>Date.now()}}var Gk={gmail:xf,calendar:bp,docs:Dp,field:Qp,search:_f};function Sf(e){return vf(e,Gk)}var Ot={width:816,margin:96,lineHeight:22,top:96};function Js(e,t,r=Ot.width-2*Ot.margin){let n=[],o=Ot.top,i=0;for(let s of e.split(`
`)){let a=0;for(;;){let c=s.length;if(t(s.slice(a,c))>r){let l=a;for(;l<s.length&&t(s.slice(a,l+1))<=r;)l+=1;let d=s.lastIndexOf(" ",l);c=d>a?d+1:Math.max(l,a+1)}if(n.push({from:i+a,to:i+c,y:o}),o+=Ot.lineHeight,c>=s.length)break;a=c}i+=s.length+1}return n}var Ef="15px Arial, Helvetica, sans-serif";function Xs(e,t){if(e==="tinymce"){let r=document.querySelector("iframe.tox-edit-area__iframe").contentDocument;return{doc:r,root:r.body}}if(e==="gmail")return{doc:document,root:document.querySelector('[aria-label="Message Body"]')};if(e==="prosemirror")return{doc:document,root:document.querySelector(".ProseMirror")};if(e==="quill")return{doc:document,root:document.querySelector(".ql-editor")};if(e==="notion"){let r=[...document.querySelectorAll(".notion-text-block [contenteditable]")].find(n=>(n.textContent??"").includes(t));return{doc:document,root:r}}return{doc:document,root:document.getElementById("editor")}}function Cf(e,t){let r=e.ownerDocument.createTreeWalker(e,NodeFilter.SHOW_TEXT);for(let n=r.nextNode();n;n=r.nextNode()){let o=n.data.indexOf(t);if(o>=0)return{node:n,at:o}}return null}var Zs=e=>e==="textarea"||e==="input";function zk(e,t,r){let n=getComputedStyle(e),o=document.createElement("canvas").getContext("2d");o.font=`${n.fontSize} ${n.fontFamily}`;let i=o.measureText("M").width,s=e.getBoundingClientRect(),a=s.left+e.clientLeft+parseFloat(n.paddingLeft)-e.scrollLeft,c=Math.floor((e.clientWidth-parseFloat(n.paddingLeft)-parseFloat(n.paddingRight))/i),l=e.tagName==="INPUT"?parseFloat(n.fontSize)*1.2:parseFloat(n.lineHeight),d=e.tagName==="INPUT"?s.top+e.clientTop+(e.clientHeight-l)/2:s.top+e.clientTop+parseFloat(n.paddingTop)-e.scrollTop,p=[],u=0;for(let x of e.value.split(`
`)){let b=0;for(;e.tagName==="TEXTAREA"&&x.length-b>c;){let v=x.lastIndexOf(" ",b+c),E=v>b?v+1:b+c;p.push([u+b,u+E]),b=E}p.push([u+b,u+x.length]),u+=x.length+1}let f=o.measureText("M"),h=f.fontBoundingBoxAscent+f.fontBoundingBoxDescent,w=[];return p.forEach(([x,b],v)=>{let E=Math.max(x,t),P=Math.min(b,r);P>E&&w.push({x:a+(E-x)*i,y:d+v*l+(l-h)/2,width:(P-E)*i,height:h})}),w}var Wk={select(e,t){if(Zs(e)){let s=document.getElementById("editor"),a=s.value.indexOf(t);return s.focus(),s.setSelectionRange(a,a+t.length),a>=0}let{doc:r,root:n}=Xs(e,t),o=Cf(n,t);if(!o)return!1;n.focus();let i=r.createRange();return i.setStart(o.node,o.at),i.setEnd(o.node,o.at+t.length),r.getSelection().removeAllRanges(),r.getSelection().addRange(i),!0},rects(e,t,r,n){if(Zs(e)){let p=document.getElementById("editor"),u=p.value.indexOf(t);return zk(p,u+r,u+r+n)}let{doc:o,root:i}=Xs(e,t),s=Cf(i,t);if(!s)return[];let a=o.createRange();a.setStart(s.node,s.at+r),a.setEnd(s.node,s.at+r+n);let c=o.defaultView?.frameElement?.getBoundingClientRect(),l=c?c.left+o.defaultView.frameElement.clientLeft:0,d=c?c.top+o.defaultView.frameElement.clientTop:0;return[...a.getClientRects()].map(p=>({x:p.left+l,y:p.top+d,width:p.width,height:p.height}))},docsRects(e,t,r){let n=document.querySelector("canvas.kix-canvas-tile-content"),o=document.createElement("canvas").getContext("2d");o.font=Ef;let i=a=>o.measureText(a).width,s=n.getBoundingClientRect();return Js(e,i).filter(a=>a.to>t&&a.from<r).map(a=>{let c=Math.max(a.from,t),l=Math.min(a.to,r);return{x:s.left+Ot.margin+i(e.slice(a.from,c)),y:s.top+a.y,width:i(e.slice(c,l)),height:Ot.lineHeight}})},text(e,t){return Zs(e)?document.getElementById("editor").value:Xs(e,t).root.textContent??""}};window.RewriteTruth=Wk;function Rf(e,t,r){let n=a=>a===void 0?a:structuredClone(a),o=a=>({get(c){let l=e.stores[a]??{};if(c==null)return Promise.resolve(n(l));let d=typeof c=="string"?[c]:Array.isArray(c)?c:Object.keys(c),p=typeof c=="object"&&!Array.isArray(c)?c:{},u={};for(let f of d)f in l?u[f]=n(l[f]):f in p&&(u[f]=p[f]);return Promise.resolve(u)},set(c){return e.write(a,n(c)),Promise.resolve()},remove(c){return e.remove(a,typeof c=="string"?[c]:c),Promise.resolve()},clear(){return e.remove(a,Object.keys(e.stores[a]??{})),Promise.resolve()},onChanged:Zt(c=>e.watchStorage((l,d)=>d===a&&c(n(l)),t))}),i={runtime:{id:"coere",lastError:void 0,getURL:a=>r+a.replace(/^\//,""),getManifest:()=>({version:"2.0.0",name:"Coere"}),sendMessage:async a=>n(await e.handle(n(a),t)),connect:()=>Vk(),onMessage:Zt(a=>e.listen(t,(c,l,d)=>a(n(c),l,d))),onConnect:Zt(()=>()=>{})},storage:{local:o("local"),session:o("session"),sync:o("sync"),onChanged:Zt(a=>e.watchStorage((c,l)=>a(n(c),l),t))},i18n:{getUILanguage:()=>"en-US",getMessage:()=>""},tabs:{sendMessage:(a,c)=>e.tell(n(c)),query:async()=>[],create:async()=>({})}};navigator.clipboard&&Object.defineProperty(navigator.clipboard,"writeText",{value:()=>Promise.resolve(),configurable:!0});let s=Kk(i);Object.assign(window,{chrome:s,browser:s})}function Kk(e){let t=()=>new Proxy(()=>Promise.resolve(void 0),{get:(n,o)=>typeof o=="string"&&/^on[A-Z]/.test(o)?Zt(()=>()=>{}):o==="then"?void 0:t()}),r=n=>new Proxy(n,{get(o,i){if(i in o){let s=Reflect.get(o,i);return s&&typeof s=="object"&&!Array.isArray(s)&&!("addListener"in s)?r(s):s}if(!(typeof i!="string"||i==="then"))return/^on[A-Z]/.test(i)?Zt(()=>()=>{}):t()}});return r(e)}function Zt(e){let t=new Map;return{addListener(r){t.set(r,e(r))},removeListener(r){t.get(r)?.(),t.delete(r)},hasListener:r=>t.has(r)}}function Vk(){let e=Zt(()=>()=>{});return{name:"",postMessage:()=>{},disconnect:()=>{},onMessage:e,onDisconnect:e}}var rn=window,Tf=parent.__demo,qk=frameElement.dataset.tab??"";rn.chrome?.runtime?.sendMessage||Rf(Tf.world,qk,Tf.assets);window.parent=window;var Yk=Element.prototype.attachShadow;Element.prototype.attachShadow=function(e){return Yk.call(this,this.localName==="coere-layer"?{...e,mode:"open"}:e)};var Jk=window.fetch.bind(window);window.fetch=async(e,t)=>{let r=new URL(typeof e=="string"?e:e instanceof URL?e.href:e.url,location.href),n=/\/mail\/u\/\d+\/sync\/(\w+)$/.exec(r.pathname),o=/\/document\/d\/([\w-]+)\/save$/.exec(r.pathname);if(!n&&!o)return Jk(e,t);let i=(()=>{try{return JSON.parse(String(t?.body??"{}"))}catch{return{}}})(),s=o?{id:o[1],saved:!0}:n[1]==="undo"?{id:i.id,undone:!0}:{id:i.id,savedAt:Date.now()};return new Response(JSON.stringify(s),{status:200,headers:{"content-type":"application/json"}})};function Xk(e){let t={heard:new Set,closed:new Set},r={heard:new Set,closed:new Set},n=!0,o=(i,s,a)=>({name:nn,sender:a,postMessage(c){if(!n)return;let l=structuredClone(c);setTimeout(()=>n&&s.heard.forEach(d=>d(l)),0)},disconnect(){n&&(n=!1,setTimeout(()=>s.closed.forEach(c=>c()),0))},onMessage:{addListener:c=>void i.heard.add(c)},onDisconnect:{addListener:c=>void i.closed.add(c)}});return{page:o(t,r),worker:o(r,t,{tab:{id:e},frameId:0})}}var Qs=new Dn;Qs.local.set(Or,{...Lr,on:!0,level:"autonomous",grantedAt:1});var Zk=0,Af=()=>`demo${++Zk}`,Qk=rn.chrome.runtime;function e2(e,t){let r=new URL(t),n={href:r.href,origin:r.origin,protocol:r.protocol,host:r.host,hostname:r.hostname,pathname:r.pathname,search:r.search,hash:r.hash,toString:()=>r.href};return new Proxy(e,{get(o,i){if(i==="location")return n;let s=Reflect.get(o,i,o);return typeof s=="function"?s.bind(o):s}})}function t2(e){let t=null,r=()=>t??=Kr(document),n=Ps({doc:document,startUrl:location.href,layer:r}),o=async d=>{let p=await n.handle({id:"pick",type:"snapshot",step:0,steps:0,viewportOnly:!1});return p.ok&&p.type==="snapshot"?l.pick(d,p.result.elements):null},i=null,s=null,a={layer:()=>r().root,emit:d=>l.emit(d),anchor:d=>{i=d,s?.()},goBackLabel:y.GO_BACK,alive:()=>t!==null},c=Sf(Ys(e2(document,rn.__demoAddress??location.href),o,d=>n.session.element(d),a)),l=ul({connect:()=>e,kit:{handle:d=>n.handle(d),dispose:()=>{n.dispose(),t?.remove(),t=null}},overlay:d=>ru(r().root,/Mac/i.test(navigator.platform),d,void 0,{box:()=>i,listen:p=>s=p}),recipes:c,watchPerson:d=>Is(document,d)})}var r2={queryTabs:async()=>[],inject:async e=>(setTimeout(()=>{let{page:t,worker:r}=Xk(e);t2(t),ea.hub.offer(r)},0),!0),capture:async()=>null,granted:async()=>!0,tabActive:async()=>!0},ea=new On({router:Qs,chrome:r2,brain:ta(e=>Qk.sendMessage(e),Af),policies:ll,now:()=>Date.now(),newId:Af}),Pf=null,n2=0;async function o2(e=null){Pf??=(await Qs.createTab(rn.__demoAddress??location.href)).id;let t=++n2,r={runId:`rewrite-demo-${t}`,surface:e?"menu":"shortcut",convId:`conv-demo-${t}`,line:"",plan:{kind:"text_rewrite",target:"",fields:[{name:"how",value:""},...e?[{name:"mode",value:e}]:[]],confirm:!0},tabId:Pf,model:null,origin:null};return ea.start(r)}rn.__rewrite={start:o2,manager:ea};})();
