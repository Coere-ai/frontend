"use strict";(()=>{var od=Object.defineProperty;var Xn=(e,t)=>{for(var r in t)od(e,r,{get:t[r],enumerable:!0})};var Jn=["Enter","Escape","Tab","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","PageDown","PageUp","Backspace"];var or={waitMs:3e3,extractChars:600,noteChars:120,choices:4};var Yn=["Organization","Person","Event","Product","ContactPoint"];var Ot={pageText:3e3,snapshotText:2500,snapshotElements:150,picture:1300,stepTurn:6e3,historySteps:6};var Zn="coere.actions.page";var C={};Xn(C,{ACCEPT:()=>Pd,ALLOW:()=>Ed,ALLOW_FOR_TASK:()=>Sd,ALLOW_SAVE_EVENT:()=>kd,ALLOW_SEND_GMAIL:()=>vd,CLOSE:()=>Bd,CONTROLLED:()=>nd,COPY:()=>Vd,DID_IT_GO_IN:()=>Dd,FIELD_LABELS:()=>Ad,GO_BACK:()=>Fd,GO_TO_CHAT:()=>ld,HAND_BACK:()=>cd,LOOKS_GOOD:()=>$d,MENU_ASK:()=>qd,MENU_REWRITE:()=>Kd,MODE_GRAMMAR:()=>ti,MODE_IMPROVE:()=>ei,MODE_REWRITE:()=>Qn,MORE_FORMAL:()=>Ld,NOTHING_TO_CHANGE:()=>Ud,REWRITING:()=>Rd,REWRITTEN:()=>Od,SHORTER:()=>Id,SITE_NAMES:()=>Td,STEP_LINES:()=>fd,STOP:()=>dd,TAKE_OVER:()=>ad,TRY_AGAIN:()=>Md,UNDO:()=>Nd,WAITING_FOR_YOU:()=>pd,WORKING_ON_TASK:()=>sd,YES:()=>Hd,YOU_HAVE_CONTROL:()=>ud,allowChoose:()=>wd,allowFill:()=>xd,allowInvite:()=>_d,allowOpenHost:()=>yd,allowOpenLink:()=>bd,allowPress:()=>gd,allowSubmit:()=>Cd,answeringQuestion:()=>md,controlledWorker:()=>id,copiedPaste:()=>Gd,modeName:()=>jd,pasteLine:()=>Wd,pressCopy:()=>zd,readingHost:()=>hd});var nd="Controlled by Cori",id=e=>`Controlled by Cori, worker ${e}`,sd="Working on task",ad="Take over",cd="Hand back",ld="Go to chat",dd="Stop",ud="You have control",pd="Waiting for you",fd={openGmail:"Opening Gmail",findEmails:"Finding your recent emails",writeEmail:"Writing the email",fillEmail:"Filling in the email",saveDraft:"Saving the draft",send:"Sending",openCalendar:"Opening Google Calendar",writeEvent:"Writing the event",saveEvent:"Saving the event",rewrite:"Rewriting in your style",look:"Looking at the page"},md=(e,t)=>`Answering question ${e} of ${t}`,hd=e=>`Reading ${e}`,gd=(e,t)=>`Allow Cori to press ${e} in ${t}`,bd=(e,t)=>`Allow Cori to open ${e} in ${t}`,yd=e=>`Allow Cori to open ${e}`,xd=(e,t)=>`Allow Cori to fill in ${e} ${e===1?"field":"fields"} in ${t}`,wd=(e,t)=>`Allow Cori to choose ${e} in ${t}`,vd="Allow Cori to press Send in Gmail",kd="Allow Cori to save this event in Google Calendar",_d=e=>`Allow Cori to send invitations to ${e}`,Cd=e=>`Allow Cori to submit this form in ${e}`,Ed="Allow",Sd="Allow for this task",Ad={to:"To",cc:"Cc",subject:"Subject",body:"Message",title:"Title",when:"When",where:"Where",guests:"Guests",address:"Address"},Td={gmail:"Gmail",calendar:"Google Calendar",docs:"Google Docs"},Rd="Rewriting in your style",Pd="Accept",Md="Try again",Id="Shorter",Ld="More formal",Od="Rewritten",Nd="Undo",Dd="Did it go in right?",Hd="Yes",Bd="Close",$d="Looks good",Fd="Go back",Ud="Nothing to change",Qn="Rewrite",ei="Improve",ti="Fix grammar only";function jd(e){return e==="grammar"?ti:e==="improve"?ei:Qn}var mo=(e,t)=>`${e?"Cmd":"Ctrl"}+${t}`,zd=e=>`Press ${mo(e,"C")} so I can read your selection.`,Gd=e=>`Copied. Press ${mo(e,"V")} to replace your selection.`,Wd=e=>`Copy it, then press ${mo(e,"V")} over your selection.`,Vd="Copy",Kd="Rewrite with Cori",qd="Ask Cori";var F={};Xn(F,{CAPTCHA_FIRST:()=>Eu,COPIED:()=>lu,COPY:()=>cu,COPY_TITLE:()=>Qd,DONE:()=>su,FILL_IN:()=>au,FILL_TITLE:()=>Zd,FROM_LINE:()=>hu,FROM_YOU:()=>yu,GO_ON:()=>iu,MENU_FILL:()=>Mu,NOT_NOW:()=>nu,NOT_SENT:()=>Pu,ON_PAGE:()=>bu,PAGE_ERRORS:()=>pu,PAGE_STUCK:()=>Au,REQUIRED:()=>uu,REVIEW_TITLE:()=>Yd,SECTION_BLANK:()=>tu,SECTION_FILLED:()=>eu,SECTION_YOURS:()=>ru,SHOW_ME:()=>du,SIGN_IN_FIRST:()=>Cu,STEP_LINES:()=>ku,SUBMIT:()=>ou,WHY:()=>xu,applyOn:()=>vu,fillOn:()=>wu,filledCount:()=>Tu,filling:()=>_u,fromMemory:()=>mu,leftCount:()=>Ru,pageOf:()=>fu,personLed:()=>Su,writtenFrom:()=>gu});var Yd="Check before you send",Zd="Check what Cori will fill in",Qd="Your details to copy",eu="Filled",tu="Left blank",ru="Left for you",ou="Submit",nu="Not now",iu="Go on",su="Done",au="Fill in",cu="Copy",lu="Copied",du="Show me",uu="Required",pu="The form says",fu=e=>`Page ${e}`,mu=e=>`From memory: ${e}`,hu="From your request",gu=e=>`Written by Cori from ${e} ${e===1?"memory":"memories"}. Read it first.`,bu="Already on the page",yu="You put this in",xu={no_memory:"Memory has nothing for this",two_fit:"Two answers fit. Choose one.",no_option:"None of the choices matches what memory has",not_written:"I couldn't write this from what I know",sensitive:"This one is yours to answer",file:"Add your file here",secret:"Coere never fills passwords or codes",payment:"Coere never fills card or ID numbers",consent:"You agree to this yourself",person_led:"Copy it in yourself",not_held:"The page didn't take this. Check it"},wu=e=>`Fill this form on ${e}`,vu=e=>`Apply on ${e}`,ku={read:"Reading the form",job:"Reading the job",next:"Going to the next page",back:"Going back a page",review:"Waiting for you to check",submit:"Sending the form"},_u=e=>`Filling in ${e}`,Cu="Sign in or create your account yourself, then press Hand back.",Eu="This page wants to check you're a person. Finish that, then press Hand back.",Su=e=>`${e} doesn't allow tools to apply for you. Here are your details to copy.`,Au="This page won't go on yet. Check what it says, then answer here.",Tu=e=>`Filled ${e} ${e===1?"field":"fields"}.`,Ru=e=>`${e} left for you.`,Pu="Not sent. Check it and press Submit when you are ready.",Mu="Fill with Coere";var ri="[redacted]",Iu=[/(?<![\w-])sk-(?=[\w-]*\d)[\w-]{20,}/g,/(?<![A-Za-z0-9])AKIA[0-9A-Z]{16}(?![A-Za-z0-9])/g,/(?<![A-Za-z0-9])gh[pousr]_[A-Za-z0-9]{36,}/g,/(?<![A-Za-z0-9])xox[abprs]-[A-Za-z0-9-]{10,}/g,/(?<![A-Za-z0-9])AIza[\w-]{35}(?![\w-])/g,/(?<![\w-])eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g,/(?<![A-Za-z0-9])coere_(?:app|dev)_[A-Z2-7]{52}(?![A-Za-z0-9])/g,/-----BEGIN [A-Z ]*PRIVATE KEY-----(?:[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----|[\s\S]*$)/g];function Lu(e){let t=0;for(let r=0;r<e.length;r++){let o=Number(e[e.length-1-r]);r%2===1&&(o=o*2>9?o*2-9:o*2),t+=o}return t%10===0}function Ou(e,t,r){return/^\+|[()]/.test(e.slice(Math.max(0,t-1),t)+r)||/^\d{3}[ -]\d{3}[ -]\d{4}$/.test(r)}function Nu(e){let t=[];for(let r of e.matchAll(/\b\d(?:[ -]?\d){12,18}\b/g))Lu(r[0].replace(/[ -]/g,""))&&!Ou(e,r.index,r[0])&&t.push([r.index,r.index+r[0].length]);return t}function Du(e){let t=e.slice(4)+e.slice(0,4),r=0;for(let o of t){let n=o>="A"&&o<="Z"?String(o.charCodeAt(0)-55):o;for(let i of n)r=(r*10+Number(i))%97}return r===1}function Hu(e){let t=[];for(let r of e.matchAll(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){11,30}\b/g))for(let o=r.index+r[0].length;o-r.index>=15;o--)if(!/[A-Z0-9]/.test(e[o]??"")&&e[o-1]!==" "&&Du(e.slice(r.index,o).replace(/ /g,""))){t.push([r.index,o]);break}return t}function Bu(e){let t=[];for(let r of e.matchAll(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g)){let o=e.slice(Math.max(0,r.index-40),r.index+r[0].length+20);/\bssn\b|social security/i.test(o)&&t.push([r.index,r.index+r[0].length])}return t}function $u(e){let t=[];for(let r of e.matchAll(/\b(?:password|passcode|pin)\b\s*(?:is\b\s*[:=]?|[:=])\s*(\S+)/dgi)){let[o]=r.indices?.[1]??[0],n=(r[1]??"").replace(/[.,;:!?)\]}'"]+$/,"");n!==""&&t.push([o,o+n.length])}return t}function ne(e){let t=[...Nu(e),...Hu(e),...Bu(e),...$u(e)];for(let n of Iu)for(let i of e.matchAll(n))t.push([i.index,i.index+i[0].length]);if(t.length===0)return e;t.sort((n,i)=>n[0]-i[0]||i[1]-n[1]);let r="",o=0;for(let[n,i]of t)i<=o||(r+=e.slice(o,Math.max(o,n))+(n>=o?ri:""),o=i);return r+e.slice(o)}var Fu=/[A-Za-z]+|\d+|\n|[^\sA-Za-z\d]/g,Uu=/^[A-Z]?[a-z]{0,11}$/;function ju(e){let t=Uu.test(e)&&/[aeiouy]/i.test(e);return Math.ceil(e.length/(t?4:2))}function ho(e){let t=0;for(let r of e.matchAll(Fu)){let o=r[0],n=o.charCodeAt(0);n>=65&&n<=90||n>=97&&n<=122?t+=ju(o):n>=48&&n<=57?t+=Math.ceil(o.length/3)+1:t+=n>=11904?2:1}return t}function zu(e){let t=e.getBoundingClientRect(),r=t.x,o=t.y,n=e.ownerDocument.defaultView?.frameElement??null;for(;n;){let i=n.getBoundingClientRect();r+=i.x,o+=i.y,n=n.ownerDocument.defaultView?.frameElement??null}return{x:r,y:o,width:t.width,height:t.height}}function go(e,t={}){let r=e.defaultView;return{doc:e,rect:zu,viewport:()=>({width:r?.innerWidth??0,height:r?.innerHeight??0,scrollY:r?.scrollY??0,scrollHeight:Math.max(e.documentElement.scrollHeight,e.body?.scrollHeight??0)}),redact:ne,count:ho,now:()=>Date.now(),...t}}var Se={color:"#5267f7",band:14,from:.55,to:.85,breathMs:2400,still:2,reduced:.7},ge={maxWidth:560,gutter:16,bottom:16,stackBelow:480,radius:16},bo={width:360,gap:8};function yo(e,t,r=0){let o=Math.min(ge.maxWidth,e.width-2*ge.gutter),n=(e.width-o)/2;return{x:Math.min(Math.max(n+r,ge.gutter),e.width-ge.gutter-o),y:e.height-ge.bottom-t,width:o,height:t,stacked:e.width<ge.stackBelow}}function oi(e,t,r){let o=Math.min(bo.width,e.width-2*ge.gutter),n=Math.min(Math.max(t.x,ge.gutter),e.width-ge.gutter-o),i=t.y+t.height+bo.gap,s=i+r<=e.height-ge.gutter?i:Math.max(ge.gutter,t.y-bo.gap-r);return{x:n,y:s,width:o,height:r}}var Nt={cols:"ABCDEFGH",rows:6};function ni(e,t){let r=/^([A-H])([1-6])$/.exec(e);if(!r)return null;let o=t.width/Nt.cols.length,n=t.height/Nt.rows;return{x:Nt.cols.indexOf(r[1])*o,y:(Number(r[2])-1)*n,width:o,height:n}}function ii(e){let t=[];for(let r=1;r<=Nt.rows;r++)for(let o of Nt.cols)t.push({cell:`${o}${r}`,box:ni(`${o}${r}`,e)});return t}function sr(e,t){let r=ni(e.cell,t),o=n=>Number.isFinite(n)&&n>=0&&n<=1;return!r||!o(e.x)||!o(e.y)?null:{x:Math.round(r.x+e.x*r.width),y:Math.round(r.y+e.y*r.height)}}var ir={height:16,pad:8,digit:7};function si(e,t){let r=[];for(let{n:o,rect:n}of e){if(!(n.x<t.width&&n.x+n.width>0&&n.y<t.height&&n.y+n.height>0))continue;let s=ir.pad+String(o).length*ir.digit,a={x:Math.min(Math.max(n.x,0),t.width-s),y:Math.min(Math.max(n.y,0),t.height-ir.height),width:s,height:ir.height};r.push({n:o,tag:a,outline:n})}return r}var L=class extends Error{constructor(r){super(r);this.code=r;this.name="KitError"}};var ar=new WeakSet;function xo(e){ar.add(e)}function ai(e){ar.delete(e)}function Je(e){return e!=null&&ar.has(e)}function ci(e){return e.composedPath().some(t=>t instanceof Object&&ar.has(t))}var yt=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","HEAD","META","LINK","TITLE"]);function Dt(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();if(t instanceof Object&&"host"in t&&t.host)return t.host;let r=(e.ownerDocument??e).defaultView?.frameElement;return e===e.ownerDocument?.documentElement&&r?r:null}function Ht(e){if(e.tagName!=="IFRAME"&&e.tagName!=="FRAME")return null;try{return e.contentDocument??null}catch{return null}}function et(e){if(e instanceof Object&&"shadowRoot"in e&&e.shadowRoot)return Array.from(e.shadowRoot.childNodes);if(e.tagName==="SLOT"){let r=e.assignedNodes?.({flatten:!0})??[];if(r.length>0)return r}let t=e.tagName?Ht(e):null;return t?.body?[t.body]:Array.from(e.childNodes)}function E(e){return e.replace(/\s+/g," ").trim()}function U(e,t){let r=Array.from(e);return r.length<=t?e:`${r.slice(0,t-1).join("")}\u2026`}var Gu=new Set(["button","link","heading","option","tab","menuitem","menuitemcheckbox","menuitemradio","checkbox","radio","switch","treeitem"]);function Z(e){let t=[],r=o=>{if(o.nodeType===3){t.push(o.textContent??"");return}if(o.nodeType!==1)return;let n=o;if(n.getAttribute("aria-hidden")==="true"||n.hidden||["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","SELECT","TEXTAREA"].includes(n.tagName))return;if(n.tagName==="IMG"){t.push(` ${n.getAttribute("alt")??""} `);return}if(n.tagName==="INPUT")return;let i=n.ownerDocument.defaultView?.getComputedStyle(n);if(i?.display==="none"||i?.visibility==="hidden")return;let s=i?.display&&i.display!=="inline";s&&t.push(" ");for(let a of Array.from((n.shadowRoot??n).childNodes))r(a);s&&t.push(" ")};return r(e),E(t.join(""))}function Wu(e,t){let r=e.getRootNode();return E(t.split(/\s+/).map(o=>{let n=r.getElementById?.(o);return n?n.getAttribute("aria-label")??Z(n):""}).join(" "))}function Vu(e){let t=e.labels;if(t&&t.length>0)return E(Array.from(t).map(Z).join(" "));let r=e.closest("label");return r?Z(r):""}function pe(e,t){let r=e.getAttribute("aria-labelledby");if(r){let i=Wu(e,r);if(i)return i}let o=E(e.getAttribute("aria-label")??"");if(o)return o;let n=e.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"){let i=Vu(e);if(i)return i;let s=e.type;if(n==="INPUT"&&["button","submit","reset"].includes(s))return E(e.value)||(s==="reset"?"Reset":s==="submit"?"Submit":"");if(n==="INPUT"&&s==="image")return E(e.getAttribute("alt")??"")}if(t!==null&&Gu.has(t)){let i=Z(e);if(i)return i}return n==="IMG"?E(e.getAttribute("alt")??""):E(e.getAttribute("title")??e.getAttribute("placeholder")??"")}var wo=new Set(["button","link","checkbox","radio","switch","tab","menuitem","menuitemcheckbox","menuitemradio","option","combobox","listbox","textbox","searchbox","slider","spinbutton","treeitem"]),Ku=new Set([...wo,"heading","dialog","alertdialog","progressbar","img","none","presentation"]),li={checkbox:"checkbox",radio:"radio",button:"button",submit:"button",reset:"button",image:"button",range:"slider",number:"spinbutton",search:"searchbox",file:"button",color:"button"};function qu(e){let t=e.tagName;if(t==="A"||t==="AREA")return e.hasAttribute("href")?"link":null;if(t==="BUTTON"||t==="SUMMARY")return"button";if(t==="INPUT"){let o=(e.type||"text").toLowerCase();return o==="hidden"?null:li[o]??"textbox"}if(t==="TEXTAREA")return"textbox";if(t==="SELECT"){let o=e;return o.multiple||o.size>1?"listbox":"combobox"}if(t==="OPTION")return"option";if(/^H[1-6]$/.test(t))return"heading";if(t==="DIALOG")return"dialog";if(t==="PROGRESS")return"progressbar";if(t==="IMG")return"img";let r=e.getAttribute("contenteditable");return r!==null&&r!=="false"?"textbox":null}function fe(e){let t=e.getAttribute("role")?.trim().split(/\s+/)[0]?.toLowerCase();return t&&Ku.has(t)?t==="presentation"?"none":t:qu(e)}function di(e){return e!==null&&(wo.has(e)||e==="heading")}function cr(e){return e!==null&&wo.has(e)}var lr=new Set(["checkbox","radio","switch","menuitemcheckbox","menuitemradio"]),ui=new Set(["textbox","searchbox","combobox","spinbutton"]);function ie(e){if(e.tagName==="TEXTAREA")return!0;if(e.tagName!=="INPUT")return!1;let t=(e.type||"text").toLowerCase();return!(t in li)&&t!=="hidden"}function xt(e){let t=e.getAttribute("contenteditable");return t!==null&&t!=="false"}var ce=class{constructor(t){this.env=t}styled=new Map;shown(t){let r=this.styled.get(t);if(r!==void 0)return r;let o=this.ownShown(t),n=Dt(t),i=o&&(n===null||this.shown(n));return this.styled.set(t,i),i}visible(t){if(!this.shown(t))return!1;let r=this.env.rect(t);if(r.width<=1||r.height<=1)return!1;let o=this.env.viewport();return r.x+r.width>0&&r.y+o.scrollY+r.height>0}ownShown(t){if(t.hasAttribute("inert")||t.getAttribute("aria-hidden")==="true"||t.hidden)return!1;let r=t.ownerDocument.defaultView?.getComputedStyle(t);return r?r.display==="none"||r.visibility==="hidden"||r.visibility==="collapse"?!1:r.opacity===""||Number(r.opacity)>0:!0}};function Xu(e,t){let r=e.rect(t),o=t.ownerDocument.defaultView?.frameElement,n=o?e.rect(o):{x:0,y:0};return{clientX:r.x-n.x+r.width/2,clientY:r.y-n.y+r.height/2}}function Ju(e){typeof e.scrollIntoView=="function"&&e.scrollIntoView({block:"center",inline:"center"})}function tt(e,t,r){r||Ju(t);let o=t.ownerDocument.defaultView??window,n=r?{clientX:r.x,clientY:r.y}:Xu(e,t),i={bubbles:!0,cancelable:!0,composed:!0,view:o,button:0,...n},s=o.PointerEvent,a=(l,p)=>s?new s(l,{...i,buttons:p,pointerId:1,pointerType:"mouse",isPrimary:!0}):new o.MouseEvent(l,{...i,buttons:p});t.dispatchEvent(a("pointerover",0)),t.dispatchEvent(new o.MouseEvent("mouseover",i)),t.dispatchEvent(a("pointerdown",1)),t.dispatchEvent(new o.MouseEvent("mousedown",{...i,buttons:1}))&&typeof t.focus=="function"&&t.focus({preventScroll:!0}),t.dispatchEvent(a("pointerup",0)),t.dispatchEvent(new o.MouseEvent("mouseup",i)),t.dispatchEvent(new o.MouseEvent("click",{...i,detail:1}))}var pi=/\b(password|passcode|passphrase|pin|security (question|answer|code)|one[- ]time (code|password)|verification code|2fa code|otp)\b/i,fi=/\b(card ?number|credit card|debit card|cvv|cvc|csc|security code on|expiry|expiration|exp date|iban|routing( number)?|account number|sort code|swift|ssn|social security|passport( number)?|tax id|tin|national id|driver'?s licen[cs]e)\b/i,mi=/\b(buy|pay|pay now|place (your )?order|checkout|check out|subscribe|donate|send money|transfer|trade|purchase|complete (purchase|payment|order)|add payment)\b/i,hi=/\b(delete (my |your )?account|close (my |your )?account|deactivate|change (my |your )?password|reset password|two[- ]step|2[- ]?step|2fa|two[- ]factor|recovery (email|phone|code)|security settings|sign out of all|log ?out of all)\b/i,dr=/\b(sign ?in|log ?in|sign ?up|create (an |your )?account|register|continue with google|choose an account)\b/i,ur=/\b(i'?m not a robot|verify (that )?you are (a )?human|are you human|human verification|captcha)\b/i,gi=/\b(submit|send|post|publish|apply|confirm|finish|complete|share|invite)\b/i,bi=/^(next|previous|prev|back|continue|search|go|filter|apply filters?|load more|show more|more|page \d+|\d+|[<>]+)$/i,yi=/\b(delete|remove|discard|erase|destroy|permanently|finish attempt|end attempt|submit (quiz|test|exam|attempt|all|answers)|turn in|hand in|unsubscribe|cancel (my |your )?(subscription|order|plan))\b/i,xi=/\.(exe|msi|dmg|pkg|deb|rpm|apk|ipa|crx|xpi|zip|rar|7z|tar|gz|iso|bat|sh|jar)(\?|#|$)/i,wi=/(^|\.)(chromewebstore\.google\.com|chrome\.google\.com|addons\.mozilla\.org|microsoftedge\.microsoft\.com|apps\.apple\.com|play\.google\.com)$/i;var vo=new Set(["secret","payment","purchase","account","sign_in","captcha","file","download"]),Yu=/\b(current-password|new-password|one-time-code)\b/,Zu=/\bcc-/;function Qu(e,t){return[t,e.getAttribute("name"),e.id,e.getAttribute("placeholder")].filter(Boolean).join(" ").replace(/[_-]/g," ")}function ep(e,t){let r=[],o=e.getAttribute("autocomplete")??"",n=Qu(e,t);return(e.type?.toLowerCase()==="password"||Yu.test(o)||pi.test(n))&&r.push("secret"),(Zu.test(o)||fi.test(n))&&r.push("payment"),r}function tp(e){return e.tagName==="INPUT"?["submit","image"].includes(e.type):e.tagName!=="BUTTON"?!1:e.type==="submit"&&e.form!==null}function rp(e){if(e.tagName!=="A")return!1;if(e.hasAttribute("download"))return!0;let t=e.href;try{let r=new URL(t);return xi.test(r.pathname)||wi.test(r.hostname)}catch{return!1}}function op(e,t){let r=[];return mi.test(t)&&r.push("purchase"),hi.test(t)&&r.push("account"),dr.test(t)&&r.push("sign_in"),ur.test(t)&&r.push("captcha"),rp(e)&&r.push("download"),!bi.test(t.trim())&&(gi.test(t)||tp(e))&&r.push("submit"),yi.test(t)&&r.push("irreversible"),r}function rt(e,t,r){let o=new Set;if(e.tagName==="INPUT"&&e.type==="file"&&o.add("file"),ie(e)||xt(e)||e.tagName==="SELECT"||t==="textbox"||t==="combobox")for(let n of ep(e,r))o.add(n);if(cr(t)&&!ui.has(t))for(let n of op(e,r))o.add(n);return[...o]}function np(e,t,r){let o=e.elementFromPoint?.(t,r)??null;for(let n=0;n<10&&o?.shadowRoot;n++){let i=o.shadowRoot.elementFromPoint(t,r);if(!i||i===o)break;o=i}for(let n=o;n;n=Dt(n))if(Je(n))return null;return o}function wt(e,t){let r=t.el??t.mark;if(r!==null){let o=e.session.element(r);if(!o)throw new L("stale_element");return o}if(t.point!==null){let o=sr(t.point,e.env.viewport());if(!o)throw new L("refused");let n=np(e.env.doc,o.x,o.y);if(!n)throw new L("not_found");return n}throw new L("not_found")}function ip(e){let t=new Set;for(let r=e,o=0;r&&o<6;r=Dt(r),o++){let n=fe(r);for(let i of rt(r,n,pe(r,n)))t.add(i)}return[...t]}function $e(e){if(ip(e).some(t=>vo.has(t)))throw new L("refused")}var pr=e=>E(e).toLowerCase();function ko(e,t,r){let o=pr(r);for(let n of[i=>i===o,i=>i.startsWith(o),i=>i.includes(o)]){let i=e.filter(s=>n(pr(t(s))));if(i.length===1)return i[0];if(i.length>1)return null}return null}var sp=e=>new Promise(t=>setTimeout(t,e));async function ap(e,t){let r=new ce(e),o=(t.getAttribute("aria-controls")??t.getAttribute("aria-owns")??"").split(/\s+/).filter(Boolean);for(let n=0;n<10;n++){let i=o.map(c=>e.doc.getElementById(c)).filter(c=>c!==null),a=(i.length>0?i:[e.doc.body]).flatMap(c=>Array.from(c.querySelectorAll('[role="option"]'))).filter(c=>r.visible(c));if(a.length>0)return a;await sp(50)}return[]}async function ki(e,t,r){if(t.tagName==="SELECT"){let i=t,s=ko(Array.from(i.options),c=>c.text,r);if(!s||s.disabled)throw new L("not_found");i.value=s.value,s.selected=!0;let a=t.ownerDocument.defaultView??window;return i.dispatchEvent(new a.Event("input",{bubbles:!0})),i.dispatchEvent(new a.Event("change",{bubbles:!0})),i.selectedIndex===s.index}fe(t)!=="option"&&tt(e,t);let o=fe(t)==="option"?[t]:await ap(e,t),n=ko(o,i=>pe(i,"option"),r);if(!n)throw new L("not_found");return $e(n),tt(e,n),n.getAttribute("aria-selected")==="true"||pr(pe(t,fe(t))).includes(pr(r))}function vi(e){return e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true"||e.getAttribute("aria-pressed")==="true"}function _i(e,t,r){return vi(t)!==r&&tt(e,t),vi(t)===r}var _o=e=>ie(e)?e.value:e.innerText??e.textContent??"";function Ci(e,t,r,o){let n=_o(e);if(ie(e))return o?n===t:n===r+t;let i=E(o?t:r+t);return E(n)===i||E(e.textContent??"")===i}function cp(e,t){let r=e.ownerDocument;if(ie(e)){let i=e.value.length;e.setSelectionRange(t?0:i,i);return}let o=r.createRange();o.selectNodeContents(e),t||o.collapse(!1);let n=r.getSelection();n?.removeAllRanges(),n?.addRange(o)}function lp(e,t){let r=e.ownerDocument;typeof r.execCommand=="function"&&r.execCommand("insertText",!1,t)}function dp(e,t){let r=e.ownerDocument.defaultView;if(!r?.DataTransfer||!r.ClipboardEvent)return;let o=new r.DataTransfer;o.setData("text/plain",t),e.dispatchEvent(new r.ClipboardEvent("paste",{clipboardData:o,bubbles:!0,cancelable:!0,composed:!0}))}function up(e,t){let r=e.ownerDocument.defaultView??window,o={inputType:"insertText",data:t,bubbles:!0,composed:!0};if(e.dispatchEvent(new r.InputEvent("beforeinput",{...o,cancelable:!0}))){if(ie(e))e.setRangeText(t,e.selectionStart??0,e.selectionEnd??0,"end");else{let n=e.ownerDocument.getSelection(),i=n&&n.rangeCount>0?n.getRangeAt(0):null;if(!i||!e.contains(i.startContainer))return;i.deleteContents();let s=e.ownerDocument.createDocumentFragment();t.split(`
`).forEach((a,c)=>{c>0&&s.append(e.ownerDocument.createElement("br")),a&&s.append(e.ownerDocument.createTextNode(a))}),i.insertNode(s)}e.dispatchEvent(new r.InputEvent("input",o))}}function pp(e,t,r,o){let n=e.ownerDocument.defaultView??window,i=e.tagName==="INPUT"?n.HTMLInputElement.prototype:n.HTMLTextAreaElement.prototype;Object.getOwnPropertyDescriptor(i,"value")?.set?.call(e,o?t:r+t),e.dispatchEvent(new n.Event("input",{bubbles:!0,composed:!0}))}var fp=new Set(["text","search","url","tel","password"]),mp=e=>e.tagName!=="INPUT"||fp.has(e.type);function Co(e,t,r){if(!ie(e)&&!xt(e))return!1;let n=e.tagName==="INPUT"?t.replace(/\s*\n\s*/g," "):t;e.focus({preventScroll:!0});let i=_o(e),s=mp(e)?[lp,dp,up]:[],a=!1,c={replace:r,text:n};for(let l of s){if(cp(e,c.replace),l(e,c.text),a=Ci(e,n,i,r))break;_o(e)!==i&&(c={replace:!0,text:r?n:i+n})}return!a&&ie(e)&&(pp(e,n,i,r),a=Ci(e,n,i,r)),a&&ie(e)&&e.dispatchEvent(new(e.ownerDocument.defaultView??window).Event("change",{bubbles:!0})),a}function vt(e){let t=e.activeElement;for(let r=0;r<20&&t;r++){let o=t.shadowRoot?.activeElement??Ht(t)?.activeElement??null;if(!o||o===t)break;t=o}return!t||t.tagName==="BODY"||t.tagName==="HTML"?null:t}var hp={Enter:"Enter",Escape:"Escape",Tab:"Tab",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",PageDown:"PageDown",PageUp:"PageUp",Backspace:"Backspace"},gp='a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';function bp(e,t){let r=Array.from(e.querySelectorAll(gp)),o=t?r.indexOf(t):-1;r[(o+1)%Math.max(1,r.length)]?.focus()}function Ei(e,t){if(!Jn.includes(t))throw new L("refused");let r=vt(e)??e.body;r!==e.body&&$e(r);let o=r.ownerDocument.defaultView??window,n={key:t,code:hp[t],bubbles:!0,cancelable:!0,composed:!0};if(r.dispatchEvent(new o.KeyboardEvent("keydown",n))&&(t==="Tab"&&bp(r.ownerDocument,vt(e)),(t==="PageDown"||t==="PageUp")&&o.scrollBy?.(0,(t==="PageDown"?1:-1)*o.innerHeight*.85),t==="Backspace"&&ie(r))){let s=r.selectionStart??r.value.length,a=r.selectionEnd??s;s===a&&s>0?r.setRangeText("",s-1,a,"end"):r.setRangeText("",s,a,"end"),r.dispatchEvent(new o.Event("input",{bubbles:!0}))}r.dispatchEvent(new o.KeyboardEvent("keyup",n))}function Ai(e,t,r,o){let n=e.doc.defaultView,i=t??e.doc.scrollingElement??e.doc.documentElement,s=t?i.scrollTop:n?.scrollY??0,a=t?i.clientHeight:n?.innerHeight??0,l=o==="end"?r==="down"?i.scrollHeight:0:s+(r==="down"?1:-1)*a*.85;return t?t.scrollTop=l:n?.scrollTo?.({top:l,behavior:"instant"}),(t?i.scrollTop:n?.scrollY??0)!==s}var Si=e=>new Promise(t=>setTimeout(t,e));async function Ti(e,t,r){let o=Math.min(Math.max(t??or.waitMs,0),or.waitMs);if(r===null)return await Si(o),null;let n=E(r).toLowerCase(),i=e.now()+or.waitMs;for(;;){if(Z(e.doc.body).toLowerCase().includes(n))return!0;if(e.now()>=i)return!1;await Si(100)}}function yp(e){let t=new Set;for(let r of Array.from(e.querySelectorAll("a[href], area[href]")))t.add(fr(r.href));return t}var fr=e=>e.replace(/#.*$/,"");function Ri(e,t,r){let o;try{o=new URL(r,e.doc.baseURI)}catch{throw new L("refused")}if(o.protocol!=="https:"&&o.protocol!=="http:")throw new L("refused");let n=o.href;if(fr(n)===fr(t.startUrl)||yp(e.doc).has(fr(n)))return n;throw new L("refused")}var Ye=(e=null,t=!1)=>({ran:!0,checked:e,navigated:t});function Mi(e){let t=e.tagName==="INPUT"?e.type:e.getAttribute("role")??"";return t==="radio"||t==="checkbox"?t:null}function Pi(e){return Mi(e)===null?null:e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true"}async function Eo(e,t){let{env:r}=e;switch(t.action){case"click":{let o=wt(e,t);$e(o);let n=r.doc.URL,i=Pi(o);tt(r,o,t.el===null&&t.mark===null&&t.point!==null?sr(t.point,r.viewport())??void 0:void 0),await Promise.resolve();let s=Pi(o),a=i===null||s===null?null:Mi(o)==="radio"?s:s!==i;return Ye(a,r.doc.URL!==n)}case"type":{let o=wt(e,t);return $e(o),Ye(Co(o,t.text??"",t.replace??!1))}case"select":{let o=wt(e,t);return $e(o),Ye(await ki(r,o,t.option??""))}case"check":{let o=wt(e,t);return $e(o),Ye(_i(r,o,t.on??!0))}case"key":return Ei(r.doc,t.key??""),Ye();case"scroll":{let o=t.el!==null||t.mark!==null?wt(e,t):null;return Ye(Ai(r,o,t.dir??"down",t.by??"screen"))}case"wait":return Ye(await Ti(r,t.ms,t.for));case"navigate":{let o=Ri(r,e.session,t.url??"");return(e.go??(n=>r.doc.defaultView?.location.assign(n)))(o),Ye(null,!0)}default:throw new L("refused")}}var Ii="coere-layer",xp="all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; contain: layout style;",wp=1e3;function Bt(e,t=()=>Date.now()){let r=e.createElement(Ii);r.setAttribute("style",xp);let o=r.attachShadow({mode:"closed"});xo(r),e.documentElement.append(r);let n=-1/0,i=null,s=()=>{i=null,!r.isConnected&&(n=t(),e.documentElement.append(r))},a=e.defaultView?.MutationObserver??MutationObserver,c=new a(()=>{if(r.isConnected||i!==null)return;let l=Math.max(0,n+wp-t());i=setTimeout(s,l)});return c.observe(e.documentElement,{childList:!0}),{host:r,root:o,remove(){c.disconnect(),i!==null&&clearTimeout(i),r.remove(),ai(r)}}}var Li="coere-marks";function So(e,t,r){let o=e.createElement("div");return o.setAttribute("style",`position:fixed;left:${t.x}px;top:${t.y}px;width:${t.width}px;height:${t.height}px;box-sizing:border-box;${r}`),o}var vp=`background:${Se.color};color:#fff;font:600 11px/16px system-ui,sans-serif;text-align:center;border-radius:4px;`,kp=`border:2px solid ${Se.color};border-radius:3px;`,_p=`border:1px dashed ${Se.color}88;color:${Se.color};font:600 12px/1 system-ui,sans-serif;padding:2px;`;function mr(e){e.root.querySelector(`#${Li}`)?.remove()}function Ao(e,t,r,o){mr(e);let n=e.host.ownerDocument,i=n.createElement("div");if(i.id=Li,o)for(let{cell:a,box:c}of ii(r)){let l=So(n,c,_p);l.textContent=a,i.append(l)}let s=si(t,r);for(let a of s){i.append(So(n,a.outline,kp));let c=So(n,a.tag,vp);c.textContent=String(a.n),i.append(c)}return e.root.append(i),s.length}var Cp="#e6e8ef";async function Ep(e){let t=new Uint8Array(await e.arrayBuffer()),r="";for(let o=0;o<t.length;o+=32768)r+=String.fromCharCode(...t.subarray(o,o+32768));return`data:${e.type};base64,${btoa(r)}`}async function To(e){let t=Math.max(1,e.width),r=Math.max(1,e.height),o=new OffscreenCanvas(t,r),n=o.getContext("2d");if(!n)throw new Error("no 2d context");n.fillStyle=e.background,n.fillRect(0,0,t,r);for(let s of e.ops){let a=s.box;s.kind==="rect"?(n.fillStyle=s.color,n.fillRect(a.x,a.y,a.width,a.height)):s.kind==="image"?(n.fillStyle=Cp,n.beginPath(),n.roundRect(a.x,a.y,a.width,a.height,Math.min(6,a.width/4,a.height/4)),n.fill()):(n.fillStyle=s.color,n.font=`${s.size}px system-ui, sans-serif`,n.textBaseline="top",n.save(),n.beginPath(),n.rect(a.x,a.y,a.width,a.height),n.clip(),n.fillText(s.text,a.x,a.y),n.restore())}let i=await o.convertToBlob({type:"image/jpeg",quality:.6});return{dataUrl:await Ep(i),width:t,height:r,sketch:!0}}var Sp=800,Ap=new Set(["IMG","VIDEO","CANVAS","SVG","svg","PICTURE","IFRAME","OBJECT","EMBED"]),Oi=e=>e===""||e==="transparent"||/rgba\([^)]*,\s*0\)$/.test(e);function Tp(e){return E(Array.from(e.childNodes).filter(t=>t.nodeType===3).map(t=>t.textContent??"").join(" "))}function Ro(e,t){let r=e.viewport(),o=r.width>0?t/r.width:1,n=new ce(e),i=[],s=u=>u.ownerDocument.defaultView?.getComputedStyle(u),a=e.doc.body,c=a?s(a)?.backgroundColor??"":"",l=Oi(c)?"#ffffff":c,p=u=>({x:u.x*o,y:u.y*o,width:u.width*o,height:u.height*o}),m=u=>u.x<r.width&&u.y<r.height&&u.x+u.width>0&&u.y+u.height>0,d=u=>{if(i.length>=Sp||u.nodeType!==1||Je(u))return;let g=u;if(yt.has(g.tagName)||!n.shown(g))return;let y=e.rect(g),x=s(g);if(y.width>1&&y.height>1&&m(y)){if(Ap.has(g.tagName)){i.push({kind:"image",box:p(y)});return}x&&!Oi(x.backgroundColor)&&g!==a&&i.push({kind:"rect",box:p(y),color:x.backgroundColor});let b=Tp(g);if(b){let w=Math.min(20,Math.max(4,(parseFloat(x?.fontSize??"16")||16)*o));i.push({kind:"text",box:p(y),size:w,color:x?.color||"#111111",text:U(b,120)})}}for(let b of et(g))d(b)};return a&&d(a),{width:Math.round(t),height:Math.round(r.height*o),background:l,ops:i}}function hr(e){let t=3735928559,r=1103547991;for(let o=0;o<e.length;o++){let n=e.charCodeAt(o);t=Math.imul(t^n,2654435761),r=Math.imul(r^n,1597334677)}return t=Math.imul(t^t>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),r=Math.imul(r^r>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),(4294967296*(2097151&r)+(t>>>0)).toString(16).padStart(14,"0")}var Rp=new Set(["NAV","FOOTER","ASIDE","DIALOG"]),Pp=new Set(["navigation","banner","contentinfo","complementary","search","dialog","alertdialog"]),Mp=/(^|[-_\s])(cookies?|consent|gdpr|banner|ads?|advert|advertisement|sponsor(ed)?|promo|newsletter|popup|modal|share|social|related|breadcrumbs?|menu|sidebar|footer|nav(bar)?|skip)($|[-_\s])/i;function Po(e){if(Rp.has(e.tagName)||e.tagName==="HEADER"&&!e.closest('article, main, [role="main"]'))return!0;let t=e.getAttribute("role");if(t&&Pp.has(t))return!0;let r=`${e.getAttribute("class")??""} ${e.id}`;return r.trim()!==""&&Mp.test(r)}var Ip="p, pre, li, td, blockquote, dd";function Lp(e){let t=E(e.textContent??"").length;return t===0?1:Array.from(e.querySelectorAll("a")).reduce((o,n)=>o+E(n.textContent??"").length,0)/t}var Op=e=>{for(let t=e;t;t=t.parentElement)if(Po(t))return!0;return!1};function Ni(e,t){let r=e.body??e.documentElement,o=e.querySelector('main, [role="main"]')??(e.querySelectorAll("article").length===1?e.querySelector("article"):null);if(o&&t.shown(o)&&Z(o).length>=200)return o;let n=new Map;for(let a of Array.from(r.querySelectorAll(Ip))){if(!t.shown(a)||Op(a))continue;let c=E(a.textContent??"");if(c.length<25)continue;let l=1+(c.match(/,/g)?.length??0)+Math.min(Math.floor(c.length/100),3),p=a.parentElement;p&&n.set(p,(n.get(p)??0)+l);let m=p?.parentElement;m&&n.set(m,(n.get(m)??0)+l/2)}let i=r,s=0;for(let[a,c]of n){let l=c*(1-Lp(a));l>s&&(s=l,i=a)}return i}var Np=new Set(["P","DIV","SECTION","ARTICLE","MAIN","BLOCKQUOTE","PRE","FIGURE","FIGCAPTION","DL","DT","DD","FORM","FIELDSET","DETAILS","SUMMARY","ADDRESS","HEADER","UL","OL","BR","HR"]),Dp=10,Hp=50;function Bp(e){return Array.from(e.querySelectorAll("tr")).slice(0,Hp).map(r=>Array.from(r.children).map(o=>E(o.textContent??"").replace(/\t/g," ")).join("	")).filter(r=>r.replace(/\t/g,"").trim()!=="").join(`
`)}function Di(e,t){let r=[],o=[],n=[],i="",s=()=>{let c=E(n.join(""));c&&r.push(i+c),(c||i==="")&&(i=""),n=[]},a=c=>{if(c.nodeType===3){n.push(c.textContent??"");return}if(c.nodeType!==1)return;let l=c;if(yt.has(l.tagName)||!t.shown(l)||l!==e&&Po(l))return;let p=/^H([1-6])$/.exec(l.tagName);if(p){s();let u=E(l.textContent??"");u&&r.push(`${"#".repeat(Number(p[1]))} ${U(u,200)}`);return}if(l.tagName==="TABLE"){s();let u=Bp(l);u&&o.length<Dp&&(o.push(u),r.push(`(table ${o.length})`));return}if(l.tagName==="IMG"){let u=E(l.getAttribute("alt")??"");u&&n.push(` ${u} `);return}let m=l.tagName==="LI",d=m||Np.has(l.tagName);d&&s(),m&&(i="- ");for(let u of et(l))a(u);d&&s()};return a(e),s(),{lines:r,tables:o}}var $p=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,Fp=/(?:\+\d{1,3}[ .-]?)?(?:\(\d{2,4}\)[ .-]?)?\d{2,4}(?:[ .-]\d{2,4}){1,4}/g,Up=/^https?:\/\/(?:[a-z]+\.)?(?:linkedin\.com\/(?:in|company)\/|twitter\.com\/|x\.com\/|github\.com\/|mastodon\.social\/@)[^/?#]+/i,Hi=e=>e.replace(/\D/g,"").replace(/^1(?=\d{10}$)/,"");function Mo(e,t){let r=new Set(e.map(t));return o=>{let n=t(o);!n||r.has(n)||e.length>=20||(r.add(n),e.push(o))}}function Bi(e,t){let r=[],o=[],n=[],i=Mo(r,c=>c.toLowerCase()),s=Mo(o,Hi),a=Mo(n,c=>c.toLowerCase().replace(/\/$/,""));for(let c of Array.from(e.querySelectorAll("a[href]"))){let l=c.getAttribute("href")??"";if(/^mailto:/i.test(l))i(decodeURIComponent(l.slice(7).split("?")[0]??"").trim());else if(/^tel:/i.test(l))s(l.slice(4).trim());else{let p=Up.exec(c.href);p&&a(p[0])}}for(let c of t.matchAll($p))i(c[0].replace(/\.$/,""));for(let c of t.matchAll(Fp)){let l=Hi(c[0]).length;l>=7&&l<=15&&!/^\d{4}-\d{2}-\d{2}$/.test(c[0])&&s(c[0].trim())}return{emails:r,phones:o,profiles:n}}var jp=20,$i=200,zp=new Set(Yn);function Fi(e){return E(e.querySelector('meta[name="description" i]')?.getAttribute("content")??"")}function Ui(e){let t={};for(let r of Array.from(e.querySelectorAll('meta[property^="og:"]'))){let o=r.getAttribute("property"),n=E(r.getAttribute("content")??"");n&&!(o in t)&&Object.keys(t).length<20&&(t[o]=U(n,$i))}return t}function Gp(e){let t=e["@type"];return(Array.isArray(t)?t:[t]).filter(r=>typeof r=="string")}function Io(e){return e===null?"":typeof e!="object"?E(String(e)):Array.isArray(e)?e.map(Io).filter(Boolean).join(", "):typeof e.name=="string"?E(e.name):Object.entries(e).filter(([r])=>!r.startsWith("@")).map(([,r])=>typeof r=="object"?"":Io(r)).filter(Boolean).join(", ")}function Wp(e){let t={};for(let[r,o]of Object.entries(e)){if(r.startsWith("@"))continue;let n=Io(o);n&&(t[r]=U(n,$i))}return t}function*Lo(e,t=!1){if(Array.isArray(e))for(let r of e)yield*Lo(r,t);else if(e&&typeof e=="object"){yield{node:e,nested:t};for(let[r,o]of Object.entries(e))typeof o=="object"&&(yield*Lo(o,r!=="@graph"))}}function ji(e,t){let r=[];for(let o of Array.from(e.querySelectorAll('script[type="application/ld+json" i]'))){let n;try{n=JSON.parse(o.textContent??"")}catch{continue}for(let{node:i,nested:s}of Lo(n)){let a=Gp(i).find(l=>zp.has(l));if(!a||r.length>=jp)continue;let c=Object.fromEntries(Object.entries(Wp(i)).map(([l,p])=>[l,t(p)]));s&&Object.keys(c).every(l=>l==="name")||r.push({type:a,fields:c})}}return r}var Vp=/^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|ref|ref_src|_hsenc|_hsmi|igshid|yclid)$/i;function Oo(e){let t;try{t=new URL(e)}catch{return e}t.hash="";for(let r of[...t.searchParams.keys()])Vp.test(r)&&t.searchParams.delete(r);return t.pathname.length>1&&t.pathname.endsWith("/")&&(t.pathname=t.pathname.replace(/\/+$/,"")),t.href}var Kp=80,qp=.2,Xp=.25;function Jp(e,t,r){let o=e.doc,n=[...Array.from(r.querySelectorAll("a[href]")),...Array.from(o.querySelectorAll("a[href]"))],i=new Set,s=[];for(let a of n){let c=a.href;if(!/^https?:\/\//i.test(c)||!t.shown(a))continue;let l=Oo(c);if(i.has(l))continue;i.add(l);let p=U(e.redact(pe(a,"link")),80);if(p&&s.push({text:p,url:c}),s.length>=Kp)break}return s}function Yp(e,t){let r=E(t.toLowerCase()).split(" ").filter(Boolean),o=e.findIndex(s=>/^#+ /.test(s)&&r.every(a=>s.toLowerCase().includes(a)));if(o<0)return null;let n=/^#+/.exec(e[o])[0].length,i=e.findIndex((s,a)=>a>o&&/^#+ /.test(s)&&/^#+/.exec(s)[0].length<=n);return e.slice(o,i<0?void 0:i)}function No(e,t,r){let o=[],n=0;for(let i of t){let s=e.count(`${i}
`);if(n+s>r)break;o.push(i),n+=s}return o}function Do(e,t){let r=t.links.map(n=>`[${n.text}](${n.url})`).join(`
`),o=JSON.stringify({og:t.og,jsonLd:t.jsonLd,contacts:t.contacts});return e.count([t.url,t.title,t.description,t.main,t.tables.join(`

`),r,o].join(`
`))}function Ho(e,t){let r=e.doc,o=new ce(e),n=Ni(r,o),i=Di(n,o),s=i.lines.map(b=>e.redact(b));t&&(s=Yp(s,t)??s);let a=s.flatMap(b=>/^\(table (\d+)\)$/.exec(b)?.[1]??[]).map(Number),c=Ot.pageText,l={url:r.URL,title:e.redact(E(r.title)),description:e.redact(Fi(r)),og:Object.fromEntries(Object.entries(Ui(r)).map(([b,w])=>[b,e.redact(w)])),jsonLd:ji(r,e.redact),contacts:Bi(r,e.redact(Z(r.body??r.documentElement)))},p=Jp(e,o,n),m=No(e,p.map(b=>`[${b.text}](${b.url})`),c*qp).map((b,w)=>p[w]),d=a.map(b=>e.redact(i.tables[b-1]??"")),u=d.map(b=>No(e,b.split(`
`),c*Xp/Math.max(1,d.length)).join(`
`)),g=Do(e,{...l,main:"",tables:u,links:m}),y=No(e,s,Math.max(0,c-g-8)).join(`
`),x={...l,main:y,tables:u,links:m};return{...x,hash:hr(E(s.join(`
`).toLowerCase())),tokens:Do(e,x)}}var $t=class{constructor(t){this.startUrl=t}numberOf=new WeakMap;byNumber=new Map;next=1;last=null;number(t){let r=this.numberOf.get(t);if(r!==void 0)return r;let o=this.next++;return this.numberOf.set(t,o),this.byNumber.set(o,new WeakRef(t)),o}element(t){let r=this.byNumber.get(t)?.deref()??null;return r?.isConnected?r:null}numbered(t){return this.numberOf.get(t)??null}};var kt={quietMs:300,maxMs:3e3,afterNavigationMs:8e3,pollMs:50},Zp='[aria-busy="true"], [role="progressbar"]:not([aria-valuenow]), progress:not([value])';function Qp(e){let t=new ce(e);return Array.from(e.doc.querySelectorAll(Zp)).some(r=>t.shown(r))}function Bo(e,t){let r=t.quietMs??kt.quietMs,o=t.maxMs??(t.afterNavigation?kt.afterNavigationMs:kt.maxMs),n=e.now(),i=n,s=e.doc.defaultView?.MutationObserver??MutationObserver,a=new s(()=>{i=e.now()});return a.observe(e.doc.documentElement,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),new Promise(c=>{let l=()=>{let p=e.now(),m=p-i>=r&&e.doc.readyState!=="loading"&&!Qp(e);if(m||p-n>=o){a.disconnect(),c({quiet:m,ms:p-n});return}setTimeout(l,kt.pollMs)};setTimeout(l,kt.pollMs)})}var ef={secret:"password",payment:"payment",purchase:"purchase",account:"account_security",sign_in:"sign_in",captcha:"captcha",file:"file",download:"file"};function $o(e){let t=[];for(let r of e){let o=new Set;for(let n of r.flags){let i=ef[n];i&&!o.has(i)&&(o.add(i),t.push({reason:i,el:r.n}))}}return t}var tf=/recaptcha|hcaptcha\.com|challenges\.cloudflare\.com|turnstile|arkoselabs|funcaptcha/i,rf=".g-recaptcha, .h-captcha, .cf-turnstile, [data-sitekey]",zi=/\b(just a moment|attention required|checking your browser|verify you are (a )?human|i'?m not a robot)\b/i,of=/(^|\.)(stripe\.com|stripe\.network|braintreegateway\.com|braintree-api\.com|adyen\.com|adyenpayments\.com|paypal\.com|paypalobjects\.com)$/i,nf=/\b(checkout|check out|payment details|place (your )?order|order review|review your order|billing)\b/i,sf=/^(accounts\.google\.com|login\.microsoftonline\.com|login\.live\.com|appleid\.apple\.com)$/i,af=/\b(security settings|change (your )?password|delete (your )?account|close (your )?account|two[- ]step verification|two[- ]factor)\b/i;function cf(e){return Array.from(e.querySelectorAll("iframe[src], frame[src]")).flatMap(t=>{try{return[new URL(t.getAttribute("src"),e.baseURI).href]}catch{return[]}})}function lf(e){let t=Array.from(e.querySelectorAll('h1, h2, [role="heading"]')).slice(0,6);return E([e.title,...t.map(r=>r.textContent??"")].join(" | "))}function df(e){for(let t of Array.from(e.querySelectorAll('input[type="password"]'))){let r=t.closest("form")??t.parentElement;if(!r)continue;let n=Array.from(r.querySelectorAll('button, input[type="submit"], [role="button"]')).map(i=>i.textContent||i.value||"").join(" ");if(dr.test(n))return!0}return!1}function Ft(e){let t=new Set,r=cf(e),o=lf(e),n=e.defaultView?.location.hostname??"",i=E((e.body?.textContent??"").slice(0,4e3));return(r.some(s=>tf.test(s))||e.querySelector(rf)||zi.test(o)||ur.test(o)||zi.test(i))&&t.add("captcha"),r.some(s=>of.test(new URL(s).hostname))&&t.add("payment"),nf.test(o)&&t.add("purchase"),(sf.test(n)||df(e)||/\bchoose an account\b/i.test(o))&&t.add("sign_in"),af.test(o)&&t.add("account_security"),[...t].map(s=>({reason:s,el:null}))}var uf=new Set(["button","link","checkbox","radio","switch","option","menuitem","menuitemcheckbox","menuitemradio","textbox","searchbox","slider","spinbutton","heading","tab"]),pf=new Set(["P","DIV","LI","TR","TD","TH","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","UL","OL","TABLE","FORM","FIELDSET","LEGEND","DD","DT","DL","HEADER","FOOTER","MAIN","NAV","ASIDE","BLOCKQUOTE","PRE","FIGURE","FIGCAPTION","DETAILS","BR","HR","LABEL","BODY"]),ff=300;function mf(e){if(e.hasAttribute("onclick"))return!0;let t=e.getAttribute("tabindex");if(t!==null&&Number(t)>=0)return!0;let r=e.ownerDocument.defaultView;if(r?.getComputedStyle(e).cursor!=="pointer")return!1;let n=e.parentElement;return!n||r?.getComputedStyle(n).cursor!=="pointer"}var hf="a[href],button,input,select,textarea,[role],[contenteditable],[onclick],[tabindex]";function Gi(e){let t=new ce(e),r=[],o=null,n=[],i=0,s=()=>{let l=U(E(n.join("")),ff);l&&r.push({kind:"text",text:l,y:i}),n=[]},a=(l,p)=>{if(Je(l))return;if(l.nodeType===3){if(p||!l.textContent?.trim())return;n.length===0&&(i=l.parentElement?e.rect(l.parentElement).y:0),n.push(l.textContent);return}if(l.nodeType!==1){if(l.nodeType===9||l.nodeType===11)for(let x of et(l))a(x,p);return}let m=l;if(yt.has(m.tagName)||!t.shown(m))return;let d=fe(m);d===null&&mf(m)&&!m.querySelector(hf)&&(d="clickable");let u=d==="clickable"||di(d);if(u&&t.visible(m)){s();let x=U(pe(m,d)||(d==="clickable"?Z(m):""),80);if(d==="heading"&&(o=U(x,80)),r.push({kind:"el",found:{el:m,role:d,name:x,rect:e.rect(m),heading:d==="heading"?null:o}}),uf.has(d)||d==="clickable"||m.tagName==="SELECT"||m.tagName==="TEXTAREA")return}let g=pf.has(m.tagName);g&&s();let y=p||m.tagName==="LABEL"||u&&cr(d);for(let x of et(m))a(x,y);g&&s()},c=e.doc.body??e.doc.documentElement;return a(c,!1),s(),r}function gr(e){return`${e.role} ${JSON.stringify(e.name)}`}function Wi(e,t,r){if(e===null)return null;let o=new Map(t.map(a=>[a.n,gr(a)])),n=t.filter(a=>e.labels.get(a.n)!==gr(a)).map(a=>({n:a.n,text:gr(a)})),i=[...e.labels].filter(([a,c])=>o.get(a)!==c).map(([a,c])=>({n:a,text:c})),s=r.filter(a=>!e.texts.has(a)).slice(0,5);return{added:n,removed:i,text:s}}function Vi(e,t,r){return{labels:new Map(e.map(o=>[o.n,gr(o)])),texts:new Set(t),shown:new Set(r)}}function gf(e,t){return e.inView?0:e.y<0?-e.y:Math.max(0,e.y-t)}function Ki(e,t){return e.map((r,o)=>[o,gf(r,t)]).sort((r,o)=>r[1]-o[1]||r[0]-o[0]).map(([r])=>r)}function qi(e,t){let r=new Set,o=0,n=0,i=c=>{e[c].y<0?o++:n++},s=t.headerCost,a=Ki(e,t.height).filter(c=>e[c].kind==="el");for(let c of a){let l=e[c];r.size<t.maxElements&&s+l.cost<=t.maxTokens&&(!t.viewportOnly||l.inView)?(r.add(c),s+=l.cost):i(c)}for(let c of Ki(e,t.height)){let l=e[c];l.kind!=="text"||t.viewportOnly&&!l.inView||s+l.cost>t.maxTokens||(r.add(c),s+=l.cost)}return{kept:e.filter((c,l)=>r.has(l)),above:o,below:n}}var br=e=>e.replace(/[\r\n\u2028\u2029]+/g," "),Fo=e=>JSON.stringify(br(e));function bf(e,t){try{let r=new URL(e),o=t&&r.origin===t.origin?`${r.pathname}${r.search}`:r.href;return o.length<=200?o:null}catch{return null}}function Xi(e,t){let r=[`[${e.n}] ${e.role} ${Fo(e.name)}`];e.value!==null&&r.push(e.value==="hidden"?"value=hidden":`value=${Fo(e.value)}`),e.checked!==null&&r.push(lr.has(e.role)?e.checked?"checked":"unchecked":e.checked?"selected":""),e.disabled&&r.push("disabled");let o=e.href?bf(e.href,t):null;o&&r.push(`href=${o}`);let n=e.flags.filter(i=>i!=="download");return n.length>0&&r.push(`flags=${n.join(",")}`),r.filter(Boolean).join(" ")}function Ji(e){return`text: ${br(e)}`}function yf(e){let t=[];for(let o of e.added.slice(0,8))t.push(`+ [${o.n}] ${br(o.text)}`);e.added.length>8&&t.push(`+ ${e.added.length-8} more`);for(let o of e.text)t.push(`+ text ${Fo(U(o,80))}`);let r=e.removed.slice(0,12).map(o=>`[${o.n}]`);return r.length>0&&t.push(`- ${r.join(" ")}${e.removed.length>12?` and ${e.removed.length-12} more`:""}`),`changed: ${t.length>0?t.join("; "):"nothing"}`}function Uo(e){let t=e.url;try{let i=new URL(e.url);t=`${i.host}${i.pathname}`}catch{}let r=e.view,o=[r.below>0?`${r.below} more elements below`:"",r.above>0?`${r.above} more elements above`:""],n=[`page: ${br(U(e.title,80))} | ${U(t,120)} | step ${e.step} of ${e.steps}`,[`view: ${r.width}x${r.height}, top ${r.topPct}% of ${r.heightPct}%`,...o.filter(Boolean)].join("; ")];return e.focus!==null&&n.push(`focus: [${e.focus}]`),e.changed!==null&&n.push(yf(e.changed)),n}var xf=80;function wf(e,t){return ie(e)?e.value:e.tagName==="SELECT"?Array.from(e.selectedOptions??[]).map(o=>E(o.text)).join(", "):xt(e)?Z(e):t==="slider"||t==="spinbutton"?e.getAttribute("aria-valuetext")??e.getAttribute("aria-valuenow"):t==="textbox"||t==="searchbox"?Z(e):null}function vf(e,t){return lr.has(t)?e.tagName==="INPUT"?e.checked:e.getAttribute("aria-checked")==="true":t==="option"||t==="tab"?e.tagName==="OPTION"?e.selected:e.getAttribute("aria-selected")==="true":null}function kf(e){if(e.disabled===!0||e.getAttribute("aria-disabled")==="true")return!0;let t=e.closest("fieldset[disabled]");return t!==null&&!t.querySelector(":scope > legend")?.contains(e)}function _f(e,t){if(t!=="link"||!("href"in e))return null;let r=String(e.href);return/^https?:\/\//i.test(r)?r:null}function Yi(e,t,r){let o=e.viewport(),n=rt(t.el,t.role,t.name),i=n.includes("secret")||n.includes("payment"),s=i?null:wf(t.el,t.role),a=i?"hidden":s?U(e.redact(E(s)),xf):null,c=t.rect;return{n:r,role:t.role,name:e.redact(t.name),value:a,checked:vf(t.el,t.role),disabled:kf(t.el),heading:t.heading===null?null:e.redact(t.heading),inView:c.x<o.width&&c.x+c.width>0&&c.y<o.height&&c.y+c.height>0,href:_f(t.el,t.role),flags:n}}var Cf=24,Zi={width:120,height:80};function Ef(e){let t=e.viewport();return[...e.doc.querySelectorAll("canvas")].some(r=>{let o=e.rect(r);return o.width>=Zi.width&&o.height>=Zi.height&&o.y<t.height&&o.y+o.height>0&&o.x<t.width&&o.x+o.width>0})}function yr(e,t,r){let o=e.viewport(),n=(()=>{try{return new URL(e.doc.URL)}catch{return null}})(),i=[];for(let b of Gi(e))if(b.kind==="el"){let w=Yi(e,b.found,t.number(b.found.el)),A=Xi(w,n);i.push({kind:"el",e:w,y:b.found.rect.y,inView:w.inView,line:A,cost:e.count(`${A}
`)})}else{let w=e.redact(b.text),A=Ji(w),$=b.y>=0&&b.y<o.height;i.push({kind:"text",text:w,y:b.y,inView:$,line:A,cost:e.count(`${A}
`)})}let s=i.flatMap(b=>b.kind==="el"?[b.e]:[]),a=i.flatMap(b=>b.kind==="text"?[b.text]:[]),c=vt(e.doc),l={url:e.doc.URL,title:e.redact(e.doc.title),step:r.step,steps:r.steps,view:{width:o.width,height:o.height,topPct:o.height>0?Math.round(o.scrollY/o.height*100):0,heightPct:o.height>0?Math.round(o.scrollHeight/o.height*100):100,above:0,below:0},focus:c?t.numbered(c):null,changed:Wi(t.last,s,a)},p=e.count(Uo(l).join(`
`))+Cf,{kept:m,above:d,below:u}=qi(i,{height:o.height,maxElements:Ot.snapshotElements,maxTokens:Ot.snapshotText,headerCost:p,viewportOnly:r.viewportOnly});l.view.above=d,l.view.below=u;let g=m.flatMap(b=>b.kind==="el"?[b.e]:[]),y=m.map(b=>b.kind==="el"?{el:b.e.n}:{text:b.text}),x=[...Uo(l),...m.map(b=>b.line)].join(`
`);return t.last=Vi(s,a,g.map(b=>b.n)),{...l,elements:g,lines:y,signature:hr(s.map(b=>`${b.role}:${b.name}`).join(`
`)),findings:[...Ft(e.doc),...$o(s)],canvas:Ef(e),text:x,tokens:e.count(x)}}var Sf=15e3;function jo(e){let t=go(e.doc,e.env),r=new $t(e.startUrl),o=null,n=()=>e.layer?.()??(o??=Bt(e.doc,t.now)),i=async s=>{switch(s.type){case"read":if(s.read==="text")return Ho(t,s.section);if(s.read==="snapshot")return yr(t,r,{step:0,steps:0,viewportOnly:!1});throw new L("refused");case"snapshot":return yr(t,r,s);case"do":return Eo({env:t,session:r,...e.go?{go:e.go}:{}},s.step);case"settle":return Bo(t,{afterNavigation:s.afterNavigation});case"marks":{if(!s.show)return mr(n()),{count:0};let a=[...r.last?.shown??[]].flatMap(l=>{let p=r.element(l);return p?[{n:l,rect:t.rect(p)}]:[]}),c=t.viewport();return{count:Ao(n(),a,{width:c.width,height:c.height},s.grid)}}case"picture":return To(Ro(t,s.width));default:throw new L("refused")}};return{env:t,session:r,async handle(s){let a,c=new Promise((l,p)=>{a=setTimeout(()=>p(new L("timeout")),Sf)});try{let l=await Promise.race([i(s),c]);return{id:s.id,ok:!0,type:s.type,result:l}}catch(l){return{id:s.id,ok:!1,type:s.type,error:l instanceof L?l.code:"internal"}}finally{clearTimeout(a)}},dispose(){o?.remove(),o=null}}}function zo(e,t,r={}){let o=r.trusted??(l=>!0),n=l=>p=>{!o(p)||ci(p)||t(l)},i=n("pointer"),s=n("key"),c=[e.defaultView,...Array.from(e.querySelectorAll("iframe")).map(l=>Ht(l)?.defaultView)].filter(l=>l!=null);for(let l of c)l.addEventListener("pointerdown",i,!0),l.addEventListener("keydown",s,!0);return()=>{for(let l of c)l.removeEventListener("pointerdown",i,!0),l.removeEventListener("keydown",s,!0)}}function le(e){return/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[a-z]{2,}$/i.test(e.trim())}function ee(e){return e.trim().toLowerCase()}function Fe(e,t){let r=new Set(e.map(ee)),o=new Set(t.map(ee));return r.size===o.size&&[...r].every(n=>o.has(n))}function me(e,t){let r=new Set(t.map(ee));return e.filter(o=>!r.has(ee(o)))}function R(e,t){let r=e[t];return typeof r=="string"?r:null}function Ze(e,t){let r=e[t];return typeof r=="number"&&Number.isFinite(r)?r:null}function ot(e,t){return e[t]===!0}function Ae(e,t){let r=e[t];return Array.isArray(r)?r.filter(o=>typeof o=="string"):[]}function be(e){let t=Ze(e,"account");return t!==null&&Number.isInteger(t)&&t>=0&&t<10?t:0}function k(e={}){return{held:!0,fail:null,data:e}}function h(e,t={}){return{held:!1,fail:e,data:t}}function ye(e){return{held:!1,fail:null,data:{navigate:e}}}var P={field:3e3,page:8e3,saved:12e3,poll:50};async function M(e,t,r){let o=e.now()+r;for(;;){let n=t();if(n!==null)return n;if(e.now()>=o)return null;await e.sleep(P.poll)}}async function Ut(e,t,r,o,n){if(n().some(s=>ee(s)===ee(r)))return null;await e.type(t,r,!0),await e.key(t,"Enter");let i=await M(e,()=>{let s=n(),a=me(s,o);return a.length>0?a:s.some(c=>ee(c)===ee(r))?[]:null},P.field);return i===null?h("timeout"):i.length>0?h("check",{strangers:i}):null}var es=[['button, input[type="button"], input[type="submit"], input[type="reset"]',"button"],["a[href]","link"],['input[type="checkbox"]',"checkbox"],['input[type="radio"]',"radio"],["select, input[list]","combobox"],['textarea, input:not([type]), input[type="text"], input[type="email"], input[type="search"], input[type="tel"], input[type="url"], [contenteditable="true"], [contenteditable=""]',"textbox"],["tr","row"],["td","gridcell"],["li","listitem"],["dialog","dialog"],["main","main"],["h1, h2, h3, h4, h5, h6","heading"]];function ts(e){let t=e.getAttribute("role")?.trim().split(/\s+/)[0];if(t)return t;for(let[r,o]of es)if(e.matches(r))return o;return""}var xr=e=>e.replace(/\s+/g," ").trim().toLowerCase();function Qi(e){let t=e.ownerDocument,r=e.getAttribute("aria-label");if(r)return r;let o=e.getAttribute("aria-labelledby");if(o)return o.split(/\s+/).map(s=>t.getElementById(s)?.textContent??"").join(" ");let n=e.getAttribute("id"),i=n?t.querySelector(`label[for="${CSS.escape(n)}"]`):null;return i?.textContent?i.textContent:e.getAttribute("title")??e.getAttribute("placeholder")??e.textContent??""}function rs(e,t){let r=xr(e),o=xr(t);return r===o||r.startsWith(o)&&!new RegExp("\\p{L}","u").test(r.charAt(o.length))}function os(e){if(e.closest('[hidden], [aria-hidden="true"]'))return!1;let t=e.ownerDocument.defaultView?.getComputedStyle(e);return!t||t.display!=="none"&&t.visibility!=="hidden"}function Af(e,t){let r=es.filter(([,o])=>o===t).map(([o])=>o);return[...e.querySelectorAll([`[role="${t}"]`,...r].join(", "))].filter(o=>ts(o)===t)}function Tf(e,t){let r=[...e.querySelectorAll("*")].filter(o=>rs(o.textContent??"",t));return r.filter(o=>!r.some(n=>n!==o&&o.contains(n)))}function v(e,t){let r=s=>t.label?s.filter(a=>rs(Qi(a),t.label)):s,o=[];t.role?(o=r(Af(e,t.role)),o.length===0&&t.selector&&(o=[...e.querySelectorAll(t.selector)])):t.selector?o=r([...e.querySelectorAll(t.selector)]):t.label&&(o=Tf(e,t.label));let n=o.filter(os);if(!t.label)return n;let i=n.filter(s=>xr(Qi(s))===xr(t.label));return[...i,...n.filter(s=>!i.includes(s))]}async function X(e,t,r,o){let n=v(t,r)[0];if(n)return n;let i=await e.pick(o),s=i===null?null:e.elementOf(i);return!s||!t.contains(s)||!os(s)||r.role&&ts(s)!==r.role?null:s}function te(e){let t=e.tagName.toLowerCase();return t==="textarea"?"textarea":t==="input"?"input":e instanceof e.ownerDocument.defaultView.HTMLElement&&e.isContentEditable||e.getAttribute("contenteditable")==="true"||e.getAttribute("contenteditable")===""?"editable":null}function z(e){let t=te(e);if(t==="input"||t==="textarea")return e.value;let r=e.innerText;return typeof r=="string"&&r!==""?r:e.textContent??""}var de=e=>e.replace(/\s+/g,""),Rf=(e,t)=>{e.ownerDocument.execCommand?.("insertText",!1,t)},Pf=(e,t)=>{let r=e.ownerDocument.defaultView,o=new r.DataTransfer;o.setData("text/plain",t),e.dispatchEvent(new r.ClipboardEvent("paste",{clipboardData:o,bubbles:!0,cancelable:!0,composed:!0}))},Mf=(e,t)=>{let r=e.ownerDocument.defaultView,o={inputType:"insertText",data:t,bubbles:!0,composed:!0};e.dispatchEvent(new r.InputEvent("beforeinput",{...o,cancelable:!0}))&&(Lf(e,t),e.dispatchEvent(new r.InputEvent("input",o)))},If=(e,t)=>{let r=e.ownerDocument.defaultView,o=te(e);if(o!=="input"&&o!=="textarea")return;let n=e,i=o==="input"?r.HTMLInputElement.prototype:r.HTMLTextAreaElement.prototype,s=n.selectionStart??n.value.length,a=n.selectionEnd??s,c=n.value.slice(0,s)+t+n.value.slice(a);Object.getOwnPropertyDescriptor(i,"value")?.set?.call(n,c),n.setSelectionRange?.(s+t.length,s+t.length),e.dispatchEvent(new r.Event("input",{bubbles:!0,composed:!0}))};function Lf(e,t){let r=te(e);if(r==="input"||r==="textarea"){let c=e;c.setRangeText(t,c.selectionStart??0,c.selectionEnd??0,"end");return}let o=e.ownerDocument,n=o.getSelection();if(!n||n.rangeCount===0)return;let i=n.getRangeAt(0);if(!e.contains(i.startContainer))return;i.deleteContents();let s=o.createDocumentFragment();t.split(`
`).forEach((c,l)=>{l>0&&s.append(o.createElement("br")),c&&s.append(o.createTextNode(c))});let a=s.lastChild;i.insertNode(s),a&&i.setStartAfter(a),i.collapse(!0),n.removeAllRanges(),n.addRange(i)}function jt(e,t,r,o){for(let n of[Rf,Pf,Mf,If])if(o(),n(e,t),r())return!0;return!1}function Te(e,t){let r=new Map;for(let o of e){if(r.has(o.key))throw new Error(`hook ${o.key} is named twice`);r.set(o.key,o)}for(let o of t)if(!r.has(o))throw new Error(`hook ${o} is missing`);for(let o of r.keys())if(!t.includes(o))throw new Error(`hook ${o} is never used`);return Object.fromEntries(r)}function Re(e,t){return e.replace(/\{(\w+)\}/g,(r,o)=>{let n=t[o];if(n===void 0)throw new Error(`route value ${o} is missing`);return String(n)})}var ns=[{key:"editor_route",route:"/calendar/u/{account}/r/eventedit",role:null,label:null,selector:null,observed:"unknown",how:"the event editor's address, which also takes the template route's text, dates, ctz, details and location; widely used, not documented by Google; to observe"},{key:"event_route",route:"/calendar/u/{account}/r/eventedit/{eid}",role:null,label:null,selector:null,observed:"unknown",how:"one saved event in the editor by its id, to observe"},{key:"sign_in",route:null,role:null,label:null,selector:'input[name="identifier"], input[type="password"]',observed:"unknown",how:"Google's sign in form fields, to observe"},{key:"title",route:null,role:"textbox",label:"Title",selector:null,observed:"unknown",how:"the editor's title field by its ARIA label, to observe"},{key:"start_date",route:null,role:null,label:null,selector:'[aria-label="Start date"]',observed:"unknown",how:"the start date field by its ARIA label, to observe"},{key:"start_time",route:null,role:null,label:null,selector:'[aria-label="Start time"]',observed:"unknown",how:"the start time field by its ARIA label, to observe"},{key:"end_time",route:null,role:null,label:null,selector:'[aria-label="End time"]',observed:"unknown",how:"the end time field by its ARIA label, to observe"},{key:"end_date",route:null,role:null,label:null,selector:'[aria-label="End date"]',observed:"unknown",how:"the end date field by its ARIA label, to observe"},{key:"all_day",route:null,role:"checkbox",label:"All day",selector:null,observed:"unknown",how:"the All day box, to observe"},{key:"guests_field",route:null,role:null,label:"Guests",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the guest field by its ARIA label, to observe"},{key:"guest_chip",route:null,role:null,label:null,selector:"[data-email]",observed:"unknown",how:"a guest row holding its address in an attribute, to observe"},{key:"save",route:null,role:"button",label:"Save",selector:null,observed:"unknown",how:"the editor's Save button by its label, to observe"},{key:"invite_dialog",route:null,role:"alertdialog",label:null,selector:'[role="dialog"]',observed:"unknown",how:"the question whether to send invitations, asked on Save with guests; to observe"},{key:"invite_send",route:null,role:"button",label:"Send",selector:null,observed:"unknown",how:"the invitation question's Send button, to observe"},{key:"invite_skip",route:null,role:"button",label:"Don't send",selector:null,observed:"unknown",how:"the invitation question's Don't send button, to observe"},{key:"saved_toast",route:null,role:null,label:"Event saved",selector:null,observed:"unknown",how:"the toast after Save, to observe"},{key:"event_id",route:null,role:null,label:null,selector:'[data-eventid], a[href*="/r/eventedit/"]',observed:"unknown",how:"a saved event's id in an attribute or in the link of the saved note, to observe"},{key:"delete",route:null,role:"button",label:"Delete event",selector:null,observed:"unknown",how:"the editor's Delete event button, to observe"},{key:"deleted_toast",route:null,role:null,label:"Event deleted",selector:null,observed:"unknown",how:"the toast after Delete, to observe"}];var Nf=["editor_route","event_route","sign_in","title","start_date","start_time","end_time","end_date","all_day","guests_field","guest_chip","save","invite_dialog","invite_send","invite_skip","saved_toast","event_id","delete","deleted_toast"],N=Te(ns,Nf),zt="calendar.google.com";var ss=`https://${zt}`,Df=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/,Hf=/^(UTC|[A-Z][A-Za-z_]+(?:\/[A-Za-z0-9_+-]+){1,2})$/,Bf=/^[A-Za-z0-9_=-]{1,200}$/;function wr(e){let t;try{t=new URL(e)}catch{return null}if(t.hostname!==zt)return null;let r=/^\/calendar\/(?:u\/(\d+)\/)?/.exec(t.pathname);return r?Number(r[1]??0):null}function is(e,t){let r=Df.exec(e);if(!r)throw new Error("not a local time");if(t&&r[4]===void 0)throw new Error("a time is missing");return{date:`${r[1]}${r[2]}${r[3]}`,time:r[4]===void 0?null:`${r[4]}${r[5]}${r[6]??"00"}`}}function $f(e){return new Date(Date.UTC(Number(e.slice(0,4)),Number(e.slice(4,6))-1,Number(e.slice(6,8))+1)).toISOString().slice(0,10).replace(/-/g,"")}function Go(e){let t=is(e.start,!e.allDay),r=is(e.end,!e.allDay);if(e.allDay){if(r.date<t.date)throw new Error("the event ends before it starts");return`${t.date}/${$f(r.date)}`}let o=`${t.date}T${t.time}`,n=`${r.date}T${r.time}`;if(n<=o)throw new Error("the event ends before it starts");return`${o}/${n}`}function Wo(e){return Re(N.editor_route.route,{account:e})}function vr(e,t){if(!Hf.test(t.zone))throw new Error("not a zone name");let r=new URLSearchParams({text:t.title,dates:Go(t),ctz:t.zone});return t.details.trim()&&r.set("details",t.details),t.where.trim()&&r.set("location",t.where),`${ss}${Wo(e)}?${r.toString()}`}function kr(e,t){if(!Bf.test(t))throw new Error("not an event id");return ss+Re(N.event_route.route,{account:e,eid:t})}var as=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];function cs(e){let t=/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(e);return t?{y:Number(t[1]),mo:Number(t[2]),d:Number(t[3]),h:Number(t[4]??0),mi:Number(t[5]??0)}:null}function Vo(e,t){let r=cs(t);if(!r)return!1;let o=e.toLowerCase(),n=/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/.exec(o);if(n)return Number(n[1])===r.mo&&Number(n[2])===r.d&&Number(n[3])===r.y;let i=as.filter(c=>new RegExp(`\\b${c}`).test(o));if(i.length!==1||i[0]!==as[r.mo-1]||(o.match(/\b\d{4}\b/g)??[]).some(c=>Number(c)!==r.y))return!1;let a=(o.replace(/\b\d{4}\b/g,"").match(/\b\d{1,2}\b/g)??[]).map(Number);return a.length===1&&a[0]===r.d}function Ko(e,t){let r=cs(t);if(!r)return!1;let o=e.toLowerCase().replace(/[\s.]/g,""),n=/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/.exec(o);if(!n)return!1;let i=Number(n[1]),s=Number(n[2]??0);if(n[3]===void 0&&n[2]===void 0)return!1;if(n[3]!==void 0){if(i<1||i>12)return!1;i=i%12+(n[3]==="pm"?12:0)}return i===r.h&&s===r.mi}function ls(e){let t=R(e,"title"),r=R(e,"start"),o=R(e,"end"),n=R(e,"zone");return!t||!r||!o||!n||t.length>200?null:{title:t,start:r,end:o,zone:n,allDay:ot(e,"allDay"),where:R(e,"where")??"",details:R(e,"details")??""}}var ds=e=>e.location.hostname==="accounts.google.com"||v(e,N.sign_in).length>0,us=async e=>{if(ds(e.doc))return h("sign_in");let t=wr(e.doc.location.href);return t===null?h("wrong_state"):k({account:t})},ps=async(e,t)=>{let r=ls(t);if(!r)return h("check");let o;try{o=vr(be(t),r)}catch{return h("check")}if(ds(e.doc))return h("sign_in");let n=e.doc.location;if(n.hostname!==zt||n.pathname!==Wo(be(t)))return ye(o);let i=await M(e,()=>v(e.doc,N.title)[0]??null,P.page);return i?z(i)===r.title?k({}):h("check"):h("hook_missed")},Wt=e=>v(e,N.guest_chip).map(t=>t.getAttribute("data-email")??"").filter(Boolean),fs=async(e,t)=>{let r=Ae(t,"guests");if(r.some(i=>!le(i)))return h("check",{refused:"not_address"});let o=me(Wt(e.doc),r);if(o.length>0)return h("check",{strangers:o});if(r.length>0){let i=await X(e,e.doc,N.guests_field,"the Add guests field of the event editor");if(!i)return h("hook_missed");for(let s of r){let a=await Ut(e,i,s,r,()=>Wt(e.doc));if(a)return a}}let n=Wt(e.doc);return Fe(n,r)?k({guests:n}):h("check",{strangers:me(n,r)})},Gt=(e,t)=>{let r=v(e,N[t])[0];return r?z(r):null},ms=async(e,t)=>{let r=ls(t);if(!r)return h("check");if(Gt(e.doc,"title")!==r.title)return h("check",{field:"title"});let o=Gt(e.doc,"start_date");if(o===null)return h("hook_missed");if(!Vo(o,r.start))return h("check",{field:"start_date"});let n=Gt(e.doc,"end_date");if(n!==null&&n.trim()!==""&&!Vo(n,r.end))return h("check",{field:"end_date"});if(r.allDay){let a=v(e.doc,N.all_day)[0];return(a?a.checked===!0||a.getAttribute("aria-checked")==="true":!1)?k({}):h("check",{field:"all_day"})}let i=Gt(e.doc,"start_time"),s=Gt(e.doc,"end_time");return i===null||s===null?h("hook_missed"):Ko(i,r.start)?Ko(s,r.end)?k({}):h("check",{field:"end_time"}):h("check",{field:"start_time"})};async function gs(e,t){let r=v(e.doc,N.invite_dialog)[0];if(!r)return null;let o=t?await X(e,r,N.invite_send,"the Send button of the invitations question"):v(r,N.invite_skip)[0];return o?(await e.click(o),"answered"):"missed"}var bs=async(e,t,r)=>{let o=v(e.doc,N.title)[0];if(!o)return h("wrong_state");if(r.pressed.has(o))return h("check",{refused:"already_pressed"});let n=Ae(t,"guests");if(n.some(p=>!le(p)))return h("check",{refused:"not_address"});let i=Wt(e.doc);if(!Fe(i,n))return h("check",{strangers:me(i,n)});let s=ot(t,"invite")&&n.length>0;if(s&&!ot(t,"confirmed"))return h("check",{refused:"not_confirmed"});let a=await X(e,e.doc,N.save,"the Save button of the event editor");if(!a)return h("hook_missed");r.pressed.add(o),await e.click(a);let c=await M(e,()=>v(e.doc,N.invite_dialog).length>0?"ask":v(e.doc,N.saved_toast).length>0||!o.isConnected?"saved":null,P.page);return c===null?h("timeout",{pressed:!0}):c==="saved"?k({invited:!1,asked:!1}):await gs(e,s)==="missed"?h("hook_missed",{pressed:!0}):k({invited:s,asked:!0})},hs=/\/r\/eventedit\/([A-Za-z0-9_=-]+)/,ys=async(e,t)=>{if(!await M(e,()=>v(e.doc,N.saved_toast).length>0||v(e.doc,N.title).length===0?!0:null,P.page))return h("timeout");let o=e.doc.location,n=hs.exec(o.pathname)?.[1]??new URLSearchParams(o.search).get("eid"),i=R(t,"title")??"",s=v(e.doc,N.event_id),a=m=>m.getAttribute("data-eventid")??hs.exec(m.getAttribute("href")??"")?.[1]??null,c=s.find(m=>m.hasAttribute("data-eventid")&&(m.textContent??"").trim()===i.trim()),l=s.filter(m=>!m.hasAttribute("data-eventid")),p=c?a(c):l.length===1?a(l[0]):null;return k({eventId:n??p})},xs=async(e,t)=>{let r=R(t,"eventId"),o=R(t,"title");if(!r||!o)return h("check");let n;try{n=kr(be(t),r)}catch{return h("check")}if(e.doc.location.pathname!==new URL(n).pathname)return ye(n);let i=await M(e,()=>v(e.doc,N.title)[0]??null,P.page);if(!i)return h("hook_missed");if(z(i)!==o)return h("wrong_state");let s=await X(e,e.doc,N.delete,"the Delete event button of the event editor");return s?(await e.click(s),await gs(e,!1),await M(e,()=>v(e.doc,N.deleted_toast).length>0||!i.isConnected?!0:null,P.page)?k({}):h("timeout")):h("hook_missed")};var ws={account:us,open_editor:ps,guests:fs,check:ms,save:bs,saved:ys,delete:xs};var vs=typeof Intl<"u"&&"Segmenter"in Intl?new Intl.Segmenter(void 0,{granularity:"grapheme"}):null;function Ue(e){if(!vs)return[...e].length;let t=0;for(let r of vs.segment(e))t++;return t}function ks(e,t,r,o){let n=e.length,i=t.length,s=n+i,a=s+1,c=new Int32Array(2*s+3),l=[],p=-1;for(let m=0;m<=Math.min(s,o);m++){l.push(c.slice(a-m-1,a+m+2));for(let d=-m;d<=m;d+=2){let g=d===-m||d!==m&&c[a+d-1]<c[a+d+1]?c[a+d+1]:c[a+d-1]+1,y=g-d;for(;g<n&&y<i&&r(e[g],t[y]);)g++,y++;if(c[a+d]=g,g>=n&&y>=i){p=m;break}}if(p>=0)break}return p<0?null:Ff(l,n,i)}function Ff(e,t,r){let o=[],n=t,i=r;for(let s=e.length-1;s>=0;s--){let a=e[s],c=s+1,l=n-i,p=l===-s||l!==s&&a[c+l-1]<a[c+l+1],m=p?l+1:l-1,d=s===0?0:a[c+m],u=s===0?0:d-m;for(;n>d&&i>u;)n--,i--,o.push({kind:"keep",a:n,b:i});s>0&&(p?o.push({kind:"add",a:n,b:--i}):o.push({kind:"remove",a:--n,b:i}))}return o.reverse()}var Uf=/([\p{L}\p{M}\p{N}]+(?:['’ʼ-][\p{L}\p{M}\p{N}]+)*)|(\s+)|([\s\S])/gu;function qo(e){let t=[];for(let r of e.matchAll(Uf)){let o=r.index;t.push({text:r[0],start:o,end:o+r[0].length,kind:r[1]?"word":r[2]?"space":"mark"})}return t}var _s=8e3,jf=1500,Cs=(e,t)=>[{before:{start:0,end:e.length},after:{start:0,end:t.length},old:e,now:t}];function _r(e,t,r=!0){if(e===t)return[];if(e.length>_s||t.length>_s)return Cs(e,t);let o=qo(e),n=qo(t),i=ks(o,n,(p,m)=>p.text===m.text,jf);if(!i)return Cs(e,t);let s=[],a=null,c=0,l=0;for(let p of i){if(p.kind==="keep"){a&&s.push(a),a=null,c=p.a+1,l=p.b+1;continue}a??={a0:c,a1:c,b0:l,b1:l},p.kind==="remove"?a.a1=c=p.a+1:a.b1=l=p.b+1}return a&&s.push(a),(r?zf(s,o,n):s).map(p=>Gf(p,o,n,e,t))}function zf(e,t,r){let o=[];for(let n of e){let i=o[o.length-1],s=i?n.a0-i.a1:-1,a=i?n.b0-i.b1:-1;i&&s===1&&a===1&&t[i.a1]?.kind==="space"&&r[i.b1]?.kind==="space"?(i.a1=n.a1,i.b1=n.b1):o.push({...n})}return o}function Es(e,t,r,o){let n=t<e.length?e[t].start:o,i=r>t?e[r-1].end:n;return{start:n,end:i}}function Gf(e,t,r,o,n){let i=Es(t,e.a0,e.a1,o.length),s=Es(r,e.b0,e.b1,n.length);return{before:i,after:s,old:o.slice(i.start,i.end),now:n.slice(s.start,s.end)}}var Ss=[{key:"doc_route",route:"/document/d/{id}/edit",role:null,label:null,selector:null,observed:"unknown",how:"a document's editor address, to observe"},{key:"text_target",route:null,role:null,label:null,selector:"iframe.docs-texteventtarget-iframe",observed:"unknown",how:"the hidden frame Docs takes keystrokes through, widely reported by extension authors; to observe"},{key:"target_editable",route:null,role:null,label:null,selector:'[contenteditable="true"], [contenteditable=""]',observed:"unknown",how:"the editable inside the text event target, which may mirror the selection for copy and input methods; to observe"},{key:"canvas_tile",route:null,role:null,label:null,selector:"canvas.kix-canvas-tile-content",observed:"unknown",how:"the canvas tiles Docs draws its pages on, widely reported by extension authors; the change preview keeps its boxes relative to them (8.4); to observe"},{key:"selection_boxes",route:null,role:null,label:null,selector:".kix-canvas-tile-selection rect",observed:"unknown",how:"the boxes of Docs' own selection overlay above the canvas, reported by extension authors; the change preview reads them while code selects each change (8.4); to observe"}];var Vf=["doc_route","text_target","target_editable","canvas_tile","selection_boxes"],je=Te(Ss,Vf),As="docs.google.com";function nt(e){let t=Re(je.doc_route.route,{id:"ID"}).replace("ID","[\\w-]+");return e.location.hostname===As&&new RegExp(`^/document/(?:u/\\d+/)?${t.slice(10)}`).test(e.location.pathname)}function Pe(e){let t=e.querySelector(je.text_target.selector);if(!(t&&t.tagName==="IFRAME"))return null;let r=null;try{r=t.contentDocument}catch{return null}let o=r?.defaultView,n=r?.querySelector(je.target_editable.selector);return r&&o&&n?{win:o,doc:r,editable:n}:null}var Cr=e=>e.editable.textContent??"";function it(e){e.win.focus(),e.editable.focus()}function G(e,t,r){let o={key:t,code:t,shiftKey:r,bubbles:!0,cancelable:!0,composed:!0};e.editable.dispatchEvent(new e.win.KeyboardEvent("keydown",o)),e.editable.dispatchEvent(new e.win.KeyboardEvent("keyup",o))}function Vt(e,t){for(let r=0;r<t;r++)G(e,"ArrowLeft",!0)}async function Er(e,t,r,o){let n=null,i=s=>{let a=s.clipboardData?.getData("text/plain")??"";a&&(n=a)};t.win.addEventListener("copy",i);try{r?.();let s=e.now()+o;for(;n===null&&e.now()<s;)await e.sleep(50);return n}finally{t.win.removeEventListener("copy",i)}}var _t=e=>({x:e.left,y:e.top,width:e.width,height:e.height});function Sr(e,t){let r=Math.max(e.x,t.x),o=Math.max(e.y,t.y),n=Math.min(e.x+e.width,t.x+t.width),i=Math.min(e.y+e.height,t.y+t.height);return n>r&&i>o?{x:r,y:o,width:n-r,height:i-o}:null}function Ar(e,t){if(e.width<=2){let r=e.x+e.width/2;if(r<t.x||r>t.x+t.width)return null;let o=Math.max(e.y,t.y),n=Math.min(e.y+e.height,t.y+t.height);return n>o?{...e,y:o,height:n-o}:null}return Sr(e,t)}function Tr(e){if(e.length===0)return null;let t=Math.min(...e.map(i=>i.x)),r=Math.min(...e.map(i=>i.y)),o=Math.max(...e.map(i=>i.x+i.width)),n=Math.max(...e.map(i=>i.y+i.height));return{x:t,y:r,width:o-t,height:n-r}}function st(e){let t=[];for(let r of[...e].filter(o=>o.height>0).sort((o,n)=>o.y-n.y||o.x-n.x)){let o=t[t.length-1];if(o&&Math.abs(o.y-r.y)<=1&&Math.abs(o.y+o.height-r.y-r.height)<=1&&r.x<=o.x+o.width+1){let n=Math.max(o.x+o.width,r.x+r.width);o.width=n-o.x}else t.push({...r})}return t}function at(e){let t=0,r=0,o=e;for(;o!==o.parent;){let n=o.frameElement;if(!n)break;let i=n.getBoundingClientRect(),s=n.ownerDocument.defaultView.getComputedStyle(n);t+=i.left+n.clientLeft+parseFloat(s.paddingLeft||"0"),r+=i.top+n.clientTop+parseFloat(s.paddingTop||"0"),o=o.parent}return{x:t,y:r}}function Rr(e){let t=e.ownerDocument,r=t.defaultView,o=s=>{let a=at(s.ownerDocument.defaultView),c=s.getBoundingClientRect();return s.clientWidth===0&&s.clientHeight===0?{x:c.left+a.x,y:c.top+a.y,width:c.width,height:c.height}:{x:c.left+s.clientLeft+a.x,y:c.top+s.clientTop+a.y,width:s.clientWidth,height:s.clientHeight}},n=o(e);for(let s=e.parentElement;s&&n;s=s.parentElement){let a=r.getComputedStyle(s);/(auto|scroll|hidden|clip)/.test(`${a.overflowX}${a.overflowY}`)&&s!==t.documentElement&&s!==t.body&&(n=Sr(n,o(s)))}for(let s=r;n&&s!==s.parent&&s.frameElement;s=s.parent)n=Sr(n,o(s.frameElement));let i=r.top??r;return n&&Sr(n,{x:0,y:0,width:i.innerWidth,height:i.innerHeight})}var Kf=400,qf=16,Ps=e=>[...e.querySelectorAll(je.selection_boxes.selector)].map(t=>_t(t.getBoundingClientRect())).filter(t=>t.width>0&&t.height>0),Pr=e=>e.map(t=>`${Math.round(t.x)},${Math.round(t.y)},${Math.round(t.width)}`).join(";");async function Ts(e,t,r){let o=e.now()+Kf;for(;;){let n=Ps(t);if(n.length>0&&Pr(n)!==r)return n;if(e.now()>=o)return[];await e.sleep(qf)}}function Rs(e,t){let r=[...e.querySelectorAll(je.canvas_tile.selector)],o=[];for(let n of t){let i=n.x+n.width/2,s=n.y+n.height/2,a=r.find(l=>{let p=l.getBoundingClientRect();return i>=p.left&&i<=p.right&&s>=p.top&&s<=p.bottom});if(!a)continue;let c=a.getBoundingClientRect();o.push({tile:a,dx:n.x-c.left,dy:n.y-c.top,width:n.width,height:n.height})}return o}async function Xo(e,t,r,o){let n=e.doc,i=g=>Ue(r.slice(0,g)),s=i(r.length),a=Pr(Ps(n));for(let g=0;g<s;g++)G(t,"ArrowLeft",!0);let c=st(await Ts(e,n,a));if(G(t,"ArrowRight",!1),c.length===0)return null;a=Pr(c);let l=Rs(n,c),p=s,m=o.map(()=>[]),d=!0,u=o.map((g,y)=>({c:g,i:y})).sort((g,y)=>y.c.after.start-g.c.after.start);for(let{c:g,i:y}of u){let x=r.slice(g.after.start,g.after.end),b=x.length-x.trimStart().length,w=b===x.length;if(w&&!g.old.trim())continue;let A=i(g.after.start+b),$=w?A+1:i(g.after.end-(x.length-x.trimEnd().length)),J=w&&A>=s;if(J&&([A,$]=[s-1,s]),A<0||$<=A)continue;for(;p<$;p++)G(t,"ArrowRight",!1);for(;p>$;p--)G(t,"ArrowLeft",!1);for(let He=p;He>A;He--)G(t,"ArrowLeft",!0);let Y=st(await Ts(e,n,a));if(G(t,"ArrowLeft",!1),p=A,Y.length===0){d=!1;break}a=Pr(Y);let Q=Rs(n,Y),q=Q[0];w?q&&(m[y]=[{...q,dx:J?q.dx+q.width-1:q.dx-1,width:2}]):m[y]=Q}for(;p<s;p++)G(t,"ArrowRight",!1);return d?{changes:m,whole:l}:null}var Jo=e=>{let t=e.getBoundingClientRect();return`${Math.round(t.width)}x${Math.round(t.height)}`};function Yo(e,t,r){let o=new Map;for(let n of[...e.flat(),...t])o.set(n.tile,Jo(n.tile));return{boxes:e,whole:t,olds:r,sizes:o,caretMoved:!1}}var Ms=e=>{let t=e.tile.getBoundingClientRect();return{x:t.left+e.dx,y:t.top+e.dy,width:e.width,height:e.height}};function Is(e,t,r,o,n){let i=()=>[...e.sizes.keys()];return{docs:[r,t.doc],root:o,keyEdits:!0,owns:s=>{let a=s;return!!a&&(a===t.doc||a.ownerDocument===t.doc||a===t.editable)},alive:()=>t.editable.isConnected&&i().every(s=>s.isConnected),olds:()=>e.olds,isOriginal:()=>!1,clip:()=>Tr(i().map(s=>Rr(s)).filter(s=>s!==null)),measure(){let s=i().some(a=>e.sizes.get(a)!==Jo(a));return s&&!e.caretMoved&&n(),e.boxes.map(a=>s?[]:a.map(Ms))},whole:()=>i().some(s=>e.sizes.get(s)!==Jo(s))?[]:e.whole.map(Ms)}}var Xf=`
.coere-rw{position:absolute;inset:0;pointer-events:none}
.coere-rw-box{position:absolute;border-radius:3px;background:rgba(82,103,247,.22);box-shadow:inset 0 -2px 0 ${Se.color}}
.coere-rw-bar{position:absolute;border-radius:1px;background:${Se.color}}
.coere-rw-tip{position:absolute;pointer-events:auto;max-width:320px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 10px;border-radius:8px;background:#fff;color:#1f1f1f;border:1px solid rgba(0,0,0,.12);box-shadow:0 4px 16px rgba(0,0,0,.14);font:13px/18px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.coere-rw-was{color:#5f6368;text-decoration:line-through;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.coere-rw-tip button{all:unset;flex:none;cursor:pointer;padding:3px 8px;border-radius:6px;font-weight:600;color:${Se.color}}
.coere-rw-tip button:hover{background:rgba(82,103,247,.1)}
.coere-rw-tip button:focus-visible{outline:2px solid ${Se.color};outline-offset:1px}
:host([data-theme='dark']) .coere-rw-tip{background:#202124;color:#e8eaed;border-color:rgba(255,255,255,.14)}:host([data-theme='dark']) .coere-rw-was{color:#9aa0a6}:host([data-theme='dark']) .coere-rw-tip button{color:#aab6ff}
`,Mr=2;function Ls(e,t){let r=e.ownerDocument,o=r.createElement("style");o.textContent=Xf;let n=r.createElement("div");n.className="coere-rw",n.setAttribute("aria-hidden","true");let i=r.createElement("div");i.className="coere-rw-tip",i.hidden=!0,e.append(o,n,i);let s=[],a=null,c=!1;i.addEventListener("pointerenter",()=>c=!0),i.addEventListener("pointerleave",()=>{c=!1,l()});let l=()=>{i.hidden=!0,a=null};function p(m){let d=t.olds()[m]??"";if(!d.trim()&&!t.goBack)return l();if(a!==m){if(i.replaceChildren(),d.trim()){let A=r.createElement("span");A.className="coere-rw-was",A.textContent=d.trim(),i.append(A)}if(t.goBack){let A=r.createElement("button");A.type="button",A.textContent=t.goBack,A.addEventListener("click",$=>{l(),t.onGoBack(m)}),i.append(A)}a=m}i.hidden=!1;let u=s[m][0],g=r.defaultView,y=Math.min(320,i.offsetWidth||200),x=i.offsetHeight||32,b=Math.max(8,Math.min(u.x,g.innerWidth-y-8)),w=u.y-x-6>=4?u.y-x-6:u.y+u.height+6;i.style.left=`${b}px`,i.style.top=`${w}px`}return{draw(m,d){return s=m.map(u=>u.map(g=>d?Ar(g,d):g).filter(g=>g!==null)),n.replaceChildren(...s.flat().map(u=>{let g=r.createElement("div");return g.className=u.width<=2?"coere-rw-bar":"coere-rw-box",g.style.cssText=`left:${u.x}px;top:${u.y}px;width:${u.width}px;height:${u.height}px`,g})),a!==null&&!s[a]?.length?l():a!==null&&p(a),s},hover(m,d){let u=s.findIndex(g=>g.some(y=>m>=y.x-Mr&&m<=y.x+y.width+Mr&&d>=y.y-Mr&&d<=y.y+y.height+Mr));u>=0?p(u):c||l()},remove(){o.remove(),n.remove(),i.remove()}}}var Jf=e=>e.ctrlKey||e.metaKey?["v","x"].includes(e.key.toLowerCase()):e.key.length===1||e.key==="Backspace"||e.key==="Delete"||e.key==="Enter",Yf=e=>(e.ctrlKey||e.metaKey)&&!e.altKey&&["z","y"].includes(e.key.toLowerCase()),Zf=250;function Os(e,t){let r=[],o=null,n=e.docs[0].defaultView,i=()=>{o===null&&(o=n.requestAnimationFrame(()=>{o=null,t.redraw()}))},s=(g,y,x,b=!0)=>{let w={capture:b,passive:y!=="keydown"};g.addEventListener(y,x,w),r.push(()=>g.removeEventListener(y,x,w))};for(let g of e.docs){let y=g.defaultView;y&&(s(y,"scroll",i),s(y,"resize",i),s(g,"input",i),s(g,"pointermove",x=>{let b=x,w=at(y);t.hover(b.clientX+w.x,b.clientY+w.y)}),s(g,"beforeinput",x=>{let b=x;e.owns(b.target)&&(b.inputType.startsWith("history")?t.undone():t.edited())}),s(g,"keydown",x=>{let b=x;if(!b.isComposing){if(b.key==="Escape"&&e.owns(b.target)){b.preventDefault(),b.stopImmediatePropagation(),t.escape();return}!e.keyEdits||!e.owns(b.target)||(Yf(b)?setTimeout(t.undone,60):Jf(b)&&t.edited())}}),s(g,"paste",x=>{e.owns(x.target)&&t.edited()}))}let a=n.visualViewport;a&&(s(a,"resize",i,!1),s(a,"scroll",i,!1));let c=e.docs[0].fonts;c?.addEventListener&&s(c,"loadingdone",i,!1);let l=e.root.ownerDocument.defaultView?.MutationObserver??MutationObserver,p=new l(i);p.observe(e.root,{subtree:!0,childList:!0,characterData:!0}),r.push(()=>p.disconnect());let m=e.root.ownerDocument.defaultView?.ResizeObserver;if(m){let g=new m(i);g.observe(e.root),r.push(()=>g.disconnect())}let d="",u=n.setInterval(()=>{let g=e.root.getBoundingClientRect(),y=`${g.left},${g.top},${g.width},${g.height}`;y!==d&&i(),d=y},Zf);return r.push(()=>n.clearInterval(u)),()=>{o!==null&&n.cancelAnimationFrame(o);for(let g of r.splice(0))g()}}function Ir(e,t){let r=!0,o=!1,n=Ls(t.layer(),{olds:()=>e.olds(),goBack:e.revertOne?t.goBackLabel:null,onGoBack:d=>{if(!r||!e.revertOne||!m.quiet(()=>e.revertOne(d)))return;let g=e.olds().length;g===0||e.isOriginal()?p("reverted"):(t.emit({type:"rewrite",end:null,left:g}),i())}});function i(){if(!r)return;if(t.alive&&!t.alive())return l();if(!e.alive())return p("accepted");let d=e.measure();if(!d)return p(e.isOriginal()?"reverted":"accepted");let u=e.clip(),g=n.draw(d,u),y=(e.whole?.()??[]).map(x=>u?Ar(x,u):x).filter(x=>x!==null);t.anchor(Tr([...g.flat(),...y]))}let s=Os(e,{redraw:()=>{o||i()},edited:()=>{o||p("accepted")},undone:()=>{o||i()},escape:()=>t.emit({type:"press",press:{kind:"rewrite",button:"go_back"}}),hover:(d,u)=>n.hover(d,u)}),a=e.docs[0].defaultView,c=a.setInterval(()=>{t.alive&&!t.alive()&&l()},1e3);function l(){r=!1,a.clearInterval(c),s(),n.remove(),t.anchor(null)}function p(d){r&&(l(),t.emit({type:"rewrite",end:d,left:e.olds().length}))}let m={stop(){r&&l()},redraw:i,quiet(d){o=!0;try{return d()}finally{o=!1}}};return i(),m}function Lr(e,t,r,o){t.pasteWatch?.();let n=s=>{i(),setTimeout(()=>{o(),e.preview?.emit({type:"press",press:{kind:"rewrite",button:"pasted"}})},80)},i=()=>{r.removeEventListener("paste",n,!0),t.pasteWatch===i&&(t.pasteWatch=null)};r.addEventListener("paste",n,!0),t.pasteWatch=i}async function ze(e,t,r){return r==="mirror"?Cr(t):r==="copy"?await Er(e,t,()=>t.doc.execCommand("copy"),200)??"":null}function Qf(e){it(e);let t=e.doc.createRange();t.selectNodeContents(e.editable);let r=e.doc.getSelection();r?.removeAllRanges(),r?.addRange(t)}function em(e,t){let r=new e.win.DataTransfer;r.setData("text/plain",t),e.editable.dispatchEvent(new e.win.ClipboardEvent("paste",{clipboardData:r,bubbles:!0,cancelable:!0,composed:!0}))}async function Kt(e,t,r,o,n){Qf(t),t.doc.execCommand("insertText",!1,n);let i=await ze(e,t,r);if(i===null||i!==o)return"insert";em(t,n);let s=await ze(e,t,r);return s!==null&&s!==o?"paste":null}var Zo=e=>{e.preview?.ctl.stop(),e.preview=null},Ds=async(e,t,r)=>{let o=r.docs;if(!o?.replacement||!e.preview||!nt(e.doc))return h("wrong_state");let n=Pe(e.doc);if(!n)return h("hook_missed");Zo(r);let i=o.replacement,s=_r(o.text,i),a=await Xo(e,n,i,s),c=Yo(a?.changes??s.map(()=>[]),a?.whole??[],s.map(y=>y.old)),l=e.doc.querySelector(je.canvas_tile.selector)?.parentElement??e.doc.body,p=!1,m=()=>{p||c.caretMoved||(p=!0,Xo(e,n,i,s).then(y=>{p=!1,!(!y||c.caretMoved)&&(Object.assign(c,Yo(y.changes,y.whole,c.olds),{caretMoved:c.caretMoved}),g.redraw())}))},d=y=>{c.caretMoved=!0},u=[[e.doc,"pointerdown"],[n.doc,"keydown"],[n.doc,"pointerdown"]];for(let[y,x]of u)y.addEventListener(x,d,!0);let g=Ir(Is(c,n,e.doc,l,m),e.preview);return r.preview={ctl:{...g,stop(){for(let[y,x]of u)y.removeEventListener(x,d,!0);g.stop()}},field:null},k({changes:s.length,drawn:a!==null})},Hs=async(e,t,r)=>(Zo(r),k({}));async function Or(e,t,r,o){return Vt(t,o),ze(e,t,r)}function Ns(e){let t=/Mac/i.test(e.win.navigator.platform),r={key:"z",code:"KeyZ",ctrlKey:!t,metaKey:t,bubbles:!0,cancelable:!0,composed:!0};e.editable.dispatchEvent(new e.win.KeyboardEvent("keydown",r)),e.editable.dispatchEvent(new e.win.KeyboardEvent("keyup",r))}var Bs=async(e,t,r)=>{let o=r.docs;if(Zo(r),!o?.replacement||!nt(e.doc))return h("wrong_state");let n=Pe(e.doc);if(!n)return h("hook_missed");let i=o.text,s=o.replacement,[a,c]=[Ue(i),Ue(s)],l=(p,m)=>(r.docs={...o,replacement:null},k({via:p,checked:m}));return it(n),o.read===null?(Ns(n),l("undo",!1)):await Or(e,n,o.read,c)!==s?(G(n,"ArrowRight",!1),h("wrong_state",{changed:!0})):(G(n,"ArrowRight",!1),Ns(n),await e.sleep(30),await ze(e,n,o.read)===i||(G(n,"ArrowRight",!1),await Or(e,n,o.read,a)===i)?l("undo",!0):(G(n,"ArrowRight",!1),await Or(e,n,o.read,c)!==s?(G(n,"ArrowRight",!1),h("check")):await Kt(e,n,o.read,s,i)?await Or(e,n,o.read,a)===i?l("insert",!0):h("check"):h("not_replaced",{via:"clipboard"})))},$s=async(e,t,r)=>{let o=r.docs,n=R(t,"text");if(!o||!n||!nt(e.doc))return h("wrong_state");let i=Pe(e.doc);return i?(Lr(e,r,i.doc,()=>r.docs={...o,replacement:n}),k({})):h("hook_missed")},Fs=async e=>{let t=Pe(e.doc);return t?(it(t),k({})):h("hook_missed")};var Us=4e3,tm=async(e,t,r)=>{if(!nt(e.doc))return h("wrong_state");let o=Pe(e.doc);if(!o)return h("hook_missed");let n=Math.min(Math.max(Ze(t,"waitCopyMs")??0,0),6e4),i="mirror",s=n>0?"":Cr(o);if(!s){i=n>0?null:"copy";let c=n>0?null:()=>{it(o),o.doc.execCommand("copy")};s=await Er(e,o,c,n>0?n:200)??""}if(!s)return h("no_selection",{ask:"copy"});if(s.length>Us)return h("check",{refused:"too_long"});r.preview?.ctl.stop(),r.preview=null,r.pasteWatch?.(),r.docs={text:s,read:i,replacement:null};let a=ne(s);return k({text:a,redacted:a!==s,via:i??"person_copy"})},rm=async(e,t,r)=>{let o=r.docs,n=R(t,"text");if(!o||!nt(e.doc))return h("wrong_state");if(!n||n.length>Us*2)return h("check");let i=Pe(e.doc);if(!i)return h("hook_missed");let s=await ze(e,i,o.read);if(s!==null&&s!==o.text)return h("wrong_state",{changed:!0});let a=await Kt(e,i,o.read,o.text,n);return a?(o.replacement=n,k({via:a,readable:o.read!==null})):h("not_replaced",{via:"clipboard"})};async function js(e,t,r,o){Vt(t,o);let n=await ze(e,t,r);return G(t,"ArrowRight",!1),n}var om=async(e,t,r)=>{let o=r.docs;if(!o?.replacement)return h("wrong_state");if(o.read===null)return h("check",{ask:!0});let n=Pe(e.doc);return n?await js(e,n,o.read,Ue(o.replacement))===o.replacement?k({}):h("check"):h("hook_missed")},nm=async(e,t,r)=>{let o=r.docs;if(!o?.replacement)return h("wrong_state");if(o.read===null)return h("not_replaced",{via:"clipboard"});let n=Pe(e.doc);if(!n)return h("hook_missed");if(Vt(n,Ue(o.replacement)),await ze(e,n,o.read)!==o.replacement)return G(n,"ArrowRight",!1),h("wrong_state",{changed:!0});if(!await Kt(e,n,o.read,o.replacement,o.text))return h("not_replaced",{via:"clipboard"});let i=await js(e,n,o.read,Ue(o.text));return r.docs={...o,replacement:null},i===o.text?k({}):h("check")},zs={read_selection:tm,replace_selection:rm,check_replace:om,undo:nm,show_changes:Ds,go_back:Bs,end_preview:Hs,watch_paste:$s,focus_text:Fs};var Gs=[{key:"text_field",route:null,role:null,label:null,selector:'textarea, input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"]',observed:"standard",how:"the HTML standard's text fields, whose selection is read from selectionStart and selectionEnd; no site to observe"},{key:"editable",route:null,role:null,label:null,selector:'[contenteditable]:not([contenteditable="false"])',observed:"standard",how:"a contenteditable editor, whose selection is the DOM selection inside it; no site to observe"}];var sm=["text_field","editable"],Nr=Te(Gs,sm);function se(e){let t=te(e);return t==="input"||t==="textarea"?e.value:e.textContent??""}function Ct(e,t){let r=te(e);return r==="input"||r==="textarea"?se(e)===t:de(se(e))===de(t)}function Qo(e,t,r){let o=e.ownerDocument,n=o.createRange(),i=o.createTreeWalker(e,4),s=0,a=!1;n.selectNodeContents(e);for(let c=i.nextNode();c;c=i.nextNode()){let l=s+c.data.length;if(!a&&(t<l||t===l&&t===r)&&(n.setStart(c,t-s),a=!0),a&&r<=l)return n.setEnd(c,r-s),n;s=l}return n}function am(e,t,r){e.focus();let o=te(e);if(o==="input"||o==="textarea"){e.setSelectionRange(t,r);return}let n=e.ownerDocument.getSelection();n?.removeAllRanges(),n?.addRange(Qo(e,t,r))}function cm(e,t){let r=te(e);if(r!=="input"&&r!=="textarea"||se(e)===t)return;let o=e.ownerDocument.defaultView,n=r==="input"?o.HTMLInputElement.prototype:o.HTMLTextAreaElement.prototype;Object.getOwnPropertyDescriptor(n,"value")?.set?.call(e,t),e.dispatchEvent(new o.Event("input",{bubbles:!0,composed:!0}))}function ct(e,t){let r=e.before.slice(0,e.start)+t+e.before.slice(e.end),o=()=>{cm(e.el,e.before),am(e.el,e.start,e.end)};return jt(e.el,t,()=>Ct(e.el,r),o)}var lm=new Set(["\u200B","\u200C","\u200D","\u2060","\uFEFF","\xAD"]),Vs=e=>/^\s$/u.test(e)||lm.has(e);function en(e){let t=[],r=e.ownerDocument.createTreeWalker(e,4);for(let o=r.nextNode();o;o=r.nextNode()){let n=0;for(let i of o.data)Vs(i)||t.push({node:o,at:n,len:i.length}),n+=i.length}return t}function Ge(e){let t="";for(let r of e)Vs(r)||(t+=r);return t}function Ws(e,t){return[...Ge(e.slice(0,t))].length}function Ks(e,t,r,o,n){let i=e.createRange();return i.setStart(t,r),i.setEnd(t,o),[...i.getClientRects()].map(s=>({..._t(s),x:s.left+n.x,y:s.top+n.y}))}function tn(e,t,r){let o=en(e),n=[...Ge(t)];if(o.length!==n.length||o.some((a,c)=>a.node.data.slice(a.at,a.at+a.len)!==n[c]))return null;let i=e.ownerDocument,s=at(i.defaultView);return r.map(a=>{let c=Ws(t,a.start),l=Ws(t,a.end);if(l<=c)return dm(i,o,c,s);let p=[],m=c;for(;m<l;){let d=o[m].node,u=m;for(;u+1<l&&o[u+1].node===d;)u++;p.push(...Ks(i,d,o[m].at,o[u].at+o[u].len,s)),m=u+1}return st(p)})}function dm(e,t,r,o){let n=t[r],i=t[r-1],s=n??i;if(!s)return[];let a=Ks(e,s.node,s.at,s.at+s.len,o)[0];return a?[{x:(n?a.x:a.x+a.width)-1,y:a.y,width:2,height:a.height}]:[]}var um=["direction","fontStyle","fontVariant","fontWeight","fontStretch","fontSize","fontSizeAdjust","lineHeight","fontFamily","fontFeatureSettings","fontKerning","fontVariationSettings","textAlign","textTransform","textIndent","letterSpacing","wordSpacing","tabSize","wordBreak","overflowWrap","hyphens","textRendering","paddingTop","paddingRight","paddingBottom","paddingLeft","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"];function rn(e,t,r){let o=e.ownerDocument.defaultView,n=o.getComputedStyle(e),i=e.tagName==="TEXTAREA",s=(r instanceof ShadowRoot,r.ownerDocument),a=s.createElement("div"),c=a.style;for(let b of um)c.setProperty(b.replace(/[A-Z]/g,w=>`-${w.toLowerCase()}`),n.getPropertyValue(b.replace(/[A-Z]/g,w=>`-${w.toLowerCase()}`)));let l=e.getBoundingClientRect(),p=at(o),m=parseFloat(n.paddingLeft)+parseFloat(n.paddingRight),d=parseFloat(n.paddingTop)+parseFloat(n.paddingBottom);c.position="absolute",c.visibility="hidden",c.pointerEvents="none",c.boxSizing="content-box",c.borderStyle="solid",c.borderColor="transparent",c.margin="0",c.left=`${l.left+p.x}px`,c.top=`${l.top+p.y}px`,c.width=`${Math.max(0,e.clientWidth-m)}px`,c.overflow="hidden",i?(c.whiteSpace=n.whiteSpace==="normal"?"pre-wrap":n.whiteSpace,c.height="auto"):(c.whiteSpace="pre",c.height=`${Math.max(0,e.clientHeight-d)}px`,c.display="flex",c.alignItems="center");let u=s.createElement("span");u.style.whiteSpace="inherit",a.append(u);let g=e.value,y=[],x=0;for(let b of t){u.append(s.createTextNode(g.slice(x,b.start)));let w=s.createElement("span");w.textContent=b.end>b.start?g.slice(b.start,b.end):"\u200B",u.append(w),y.push(w),x=Math.max(x,b.end)}u.append(s.createTextNode(`${g.slice(x)}\u200B`)),r.append(a);try{let b=e.scrollLeft,w=e.scrollTop;return y.map((A,$)=>{let J=[...A.getClientRects()].map(q=>({..._t(q),x:q.left-b,y:q.top-w})),Y=t[$];if(Y.end>Y.start)return st(J);let Q=J[0];return Q?[{x:Q.x-1,y:Q.y,width:2,height:Q.height}]:[]})}finally{a.remove()}}function Xs(e,t,r,o,n,i){let s=t.slice(0,r)+i+t.slice(o),a=_r(n,i).map(c=>({start:r+c.after.start,end:r+c.after.end,old:c.old,now:c.now}));return{el:e,original:t,expected:s,changes:a,reverts:0,start:r,end:o}}var Dr=e=>{let t=te(e);return t==="input"||t==="textarea"};function pm(e,t){let r=t.slice(e.start,e.end),o=r.length-r.trimStart().length;return o<r.length?{start:e.start+o,end:e.end-(r.length-r.trimEnd().length)}:e.old.trim()?{start:e.start+o,end:e.start+o}:null}function qs(e,t,r){let o=en(e),n=t.slice(0,r),i=[...Ge(n)].length,s=n.length-n.trimEnd().length,a=new Map,c=0,l=e.ownerDocument.createTreeWalker(e,4);for(let u=l.nextNode();u;u=l.nextNode())a.set(u,c),c+=u.data.length;let p=(u,g)=>a.get(o[u].node)+o[u].at+(g?o[u].len:0),m=i>0?p(i-1,!0):0,d=i<o.length?p(i,!1):c;return Math.min(m+s,d)}function Js(e,t){let r=e.el,o=r.ownerDocument;return{docs:[o.defaultView?.top?.document??o,o].filter((i,s,a)=>a.indexOf(i)===s),root:r,keyEdits:!1,owns:i=>i instanceof o.defaultView.Node&&(i===r||r.contains(i)),alive:()=>r.isConnected,olds:()=>e.changes.map(i=>i.old),clip:()=>Rr(r),isOriginal:()=>Dr(r)?r.value===e.original:Ge(se(r))===Ge(e.original),measure(){let i=e.changes.map(l=>pm(l,e.expected)),s=i.filter(l=>l!==null),a;if(Dr(r)?a=r.value===e.expected?rn(r,s,t()):null:a=tn(r,e.expected,s),!a)return null;let c=0;return i.map(l=>l?a[c++]:[])},whole(){let i=e.expected.length-(e.original.length-e.end),s=[{start:e.start,end:i}];return(Dr(r)?r.value===e.expected?rn(r,s,t()):null:tn(r,e.expected,s))?.[0]??[]},revertOne(i){let s=e.changes[i];if(!s)return!1;let a=se(r),c=Dr(r),l=c?s.start:qs(r,e.expected,s.start),p=c?s.end:qs(r,e.expected,s.end);if(!ct({el:r,start:l,end:p,before:a,text:a.slice(l,p)},s.old))return!1;let m=s.old.length-(s.end-s.start);return e.expected=e.expected.slice(0,s.start)+s.old+e.expected.slice(s.end),e.changes=e.changes.filter((d,u)=>u!==i).map(d=>d.start>=s.end?{...d,start:d.start+m,end:d.end+m}:d),e.reverts+=1,!0}}}var $r=e=>{let t=te(e);return t==="input"||t==="textarea"},Hr=(e,t)=>se(e)===t,Br=(e,t)=>$r(e)?se(e)===t:Ge(se(e))===Ge(t);function Zs(e){let t=e.el;if(t.focus(),$r(t)){t.setSelectionRange(e.start,e.end,e.backward?"backward":"forward");return}let r=t.ownerDocument.getSelection(),o=Qo(t,e.start,e.end);r&&(e.backward?r.setBaseAndExtent(o.endContainer,o.endOffset,o.startContainer,o.startOffset):r.setBaseAndExtent(o.startContainer,o.startOffset,o.endContainer,o.endOffset))}function Ys(e,t){let r=e.ownerDocument.defaultView;return e.dispatchEvent(new r.InputEvent("beforeinput",{inputType:t,bubbles:!0,cancelable:!0,composed:!0}))}var on=e=>{e.preview?.ctl.stop(),e.preview=null},Qs=async(e,t,r)=>{let o=r.replaced;if(!o||!e.preview||!o.held.el.isConnected)return h("wrong_state");on(r);let n=o.held,i=Xs(n.el,n.before,n.start,n.end,n.source??n.text,o.text),s=e.preview,a=Ir(Js(i,()=>s.layer()),s);return r.preview={ctl:a,field:i},k({changes:i.changes.length})},ea=async(e,t,r)=>(on(r),k({}));function fm(e,t){return{start:e.start,end:Math.max(e.start,t.length-(e.before.length-e.end))}}var ta=async(e,t,r)=>{let o=r.replaced,n=r.preview?.field??null;if(!o||!o.held.el.isConnected)return h("wrong_state");let i=o.held,s=i.el,a=s.ownerDocument;on(r);let c=(u,g=!0)=>(Zs(i),r.replaced=null,k({via:u,exact:g}));if(Hr(s,i.before))return c("none");let l=n?.expected??i.before.slice(0,i.start)+o.text+i.before.slice(i.end);if(!Br(s,l))return h("wrong_state",{changed:!0});if((n?.reverts??0)===0){s.focus();let u=!Ys(s,"historyUndo");if(u||a.execCommand("undo"),Hr(s,i.before))return c("undo");if(Br(s,l)||(u?Ys(s,"historyRedo"):a.execCommand("redo")),!Br(s,l))return h("check")}let p=se(s),m=fm(i,p),d=$r(s)?i.text:i.source??i.text;if(ct({el:s,start:m.start,end:m.end,before:p,text:p.slice(m.start,m.end)},d),Hr(s,i.before))return c("insert");if($r(s)){let u=a.defaultView,g=te(s)==="input"?u.HTMLInputElement.prototype:u.HTMLTextAreaElement.prototype;if(Object.getOwnPropertyDescriptor(g,"value")?.set?.call(s,i.before),s.dispatchEvent(new u.Event("input",{bubbles:!0,composed:!0})),Hr(s,i.before))return c("value")}return Br(s,i.before)?c("insert",!1):h("check")},ra=async(e,t,r)=>{let o=r.held,n=R(t,"text");return!o||!n||!o.el.isConnected?h("wrong_state"):(Lr(e,r,o.el.ownerDocument,()=>r.replaced={held:o,text:n}),k({}))},oa=async(e,t,r)=>{let o=r.held;return!o||!o.el.isConnected?h("wrong_state"):(Zs(o),k({}))};var na=4e3;function mm(e){let t=e.activeElement;for(;;){let r=t?.shadowRoot?.activeElement??(t?.tagName==="IFRAME"?hm(t)?.activeElement:null);if(!r)return t;t=r}}function hm(e){try{return e.contentDocument}catch{return null}}function gm(e){let t=mm(e);if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA")){let d=rt(t,fe(t),pe(t,fe(t)));if(d.includes("secret")||d.includes("payment"))return"secret"}if(t?.matches(Nr.text_field.selector)){let d=t,u=d.selectionStart??0,g=d.selectionEnd??0;return g>u?{el:d,start:u,end:g,before:d.value,text:d.value.slice(u,g),backward:d.selectionDirection==="backward"}:null}let r=(t?.ownerDocument??e).getSelection();if(!r||r.isCollapsed||r.rangeCount===0)return null;let o=r.getRangeAt(0),n=o.commonAncestorContainer,i=(n.nodeType===1?n:n.parentElement)?.closest(Nr.editable.selector);if(!i)return null;let s=o.cloneRange();s.selectNodeContents(i),s.setEnd(o.startContainer,o.startOffset);let a=s.toString().length,c=o.toString(),l=r.toString(),p=l&&l.replace(/\s+/g,"")===c.replace(/\s+/g,"")?l:c,m=r.anchorNode===o.endContainer&&r.anchorOffset===o.endOffset&&!o.collapsed;return{el:i,start:a,end:a+c.length,before:se(i),text:c,source:p,backward:m}}var bm=async(e,t,r)=>{let o=gm(e.doc);if(o==="secret")return h("no_selection",{refused:"secret"});if(!o)return h("no_selection");let n=o.source??o.text;if(n.length>na)return h("check",{refused:"too_long"});r.preview?.ctl.stop(),r.preview=null,r.pasteWatch?.(),r.held=o,r.replaced=null;let i=ne(n);return k({text:i,redacted:i!==n,kind:o.el.matches(Nr.text_field.selector)?"text_field":"editable"})},ym=async(e,t,r)=>{let o=r.held,n=R(t,"text");return!o||!o.el.isConnected?h("wrong_state"):!n||n.length>na*2?h("check"):Ct(o.el,o.before)?ct(o,n)?(r.replaced={held:o,text:n},k({})):h("not_replaced"):h("wrong_state",{changed:!0})},ia=(e,t)=>e.before.slice(0,e.start)+t+e.before.slice(e.end),xm=async(e,t,r)=>{let o=r.replaced;return o?Ct(o.held.el,ia(o.held,o.text))?k({}):h("check"):h("wrong_state")},wm=async(e,t,r)=>{let o=r.replaced;if(!o||!o.held.el.isConnected)return h("wrong_state");let n=ia(o.held,o.text);if(!Ct(o.held.el,n))return h("wrong_state",{changed:!0});let i={...o.held,end:o.held.start+o.text.length,before:se(o.held.el),text:o.text};return ct(i,o.held.text)?(r.replaced=null,Ct(o.held.el,o.held.before)?k({}):h("check")):h("not_replaced")},sa={read_selection:bm,replace_selection:ym,check_replace:xm,undo:wm,show_changes:Qs,go_back:ta,end_preview:ea,watch_paste:ra,focus_text:oa};var aa=[{key:"mailbox_route",route:"/mail/u/{account}/",role:null,label:null,selector:null,observed:"unknown",how:"Gmail's own address for an account, reported by users; to observe in milestone L"},{key:"search_route",route:"/mail/u/{account}/#search/{query}",role:null,label:null,selector:null,observed:"unknown",how:"Gmail writes the same hash when the person searches, reported by users; to observe"},{key:"drafts_route",route:"/mail/u/{account}/#drafts",role:null,label:null,selector:null,observed:"unknown",how:"the Drafts folder's hash, reported by users; to observe"},{key:"compose_route",route:"/mail/u/{account}/?view=cm&fs=1&tf=1",role:null,label:null,selector:null,observed:"unknown",how:"full window compose with an empty address, reported by users (Simon Willison's note); to observe"},{key:"sign_in",route:null,role:null,label:null,selector:'input[name="identifier"], input[type="password"]',observed:"unknown",how:"Google's sign in form fields, to observe"},{key:"main",route:null,role:"main",label:null,selector:null,observed:"unknown",how:"the message list's ARIA region, to observe"},{key:"row",route:null,role:"row",label:null,selector:null,observed:"unknown",how:"one conversation per ARIA row in the main list, to observe"},{key:"person",route:null,role:null,label:null,selector:"[email]",observed:"unknown",how:"a sender's name carrying its address in an email attribute, reported by users; to observe"},{key:"row_parts",route:null,role:null,label:null,selector:"span[data-thread-subject], .bog, span[data-snippet], .y2",observed:"unknown",how:"a row's subject and snippet spans by position, to observe"},{key:"message",route:null,role:"listitem",label:null,selector:null,observed:"unknown",how:"one message of an open thread per ARIA list item, to observe"},{key:"message_body",route:null,role:null,label:null,selector:'div[data-message-body], .a3s, div[dir="ltr"]',observed:"unknown",how:"a message's body block, to observe"},{key:"quote",route:null,role:null,label:null,selector:"blockquote, .gmail_quote",observed:"unknown",how:"quoted earlier mail inside a message, dropped when read; to observe"},{key:"when",route:null,role:null,label:null,selector:"[title]",observed:"unknown",how:"a row's or message's date with the full date in its title, to observe"},{key:"compose",route:null,role:"dialog",label:null,selector:"form",observed:"unknown",how:"the compose window around the subject field, to observe"},{key:"to_field",route:null,role:null,label:"To recipients",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the To field by its ARIA label, to observe"},{key:"cc_open",route:null,role:null,label:"Add Cc recipients",selector:"[aria-label]",observed:"unknown",how:"the Cc link that opens the Cc field, to observe"},{key:"cc_field",route:null,role:null,label:"Cc recipients",selector:'input[aria-label], [role="combobox"]',observed:"unknown",how:"the Cc field by its ARIA label, to observe"},{key:"chip",route:null,role:null,label:null,selector:"[data-hovercard-id], [email]",observed:"unknown",how:"a recipient chip holding its address in an attribute, to observe"},{key:"suggestion",route:null,role:"option",label:null,selector:null,observed:"unknown",how:"Gmail's own autocomplete rows under a recipients field, to observe"},{key:"subject",route:null,role:null,label:null,selector:'input[name="subjectbox"]',observed:"unknown",how:"the subject input by its name, reported by users; to observe"},{key:"body",route:null,role:"textbox",label:"Message Body",selector:'div[aria-label="Message Body"]',observed:"unknown",how:"the editable body by its ARIA label, reported by users; to observe"},{key:"saved_mark",route:null,role:null,label:"Draft saved",selector:null,observed:"unknown",how:"the mark the compose footer shows after autosave, to observe"},{key:"save_close",route:null,role:"button",label:"Save & close",selector:null,observed:"unknown",how:"the full window compose's close button, to observe"},{key:"send",route:null,role:"button",label:"Send",selector:null,observed:"unknown",how:"the compose's button whose label starts with Send, to observe"},{key:"discard",route:null,role:"button",label:"Discard draft",selector:null,observed:"unknown",how:"the compose's trash button, to observe"},{key:"sent_toast",route:null,role:null,label:"Message sent",selector:null,observed:"unknown",how:"the toast after a send, to observe"},{key:"undo",route:null,role:"link",label:"Undo",selector:null,observed:"unknown",how:"the toast's Undo link, shown for the time the person set in Gmail; to observe"},{key:"undone_mark",route:null,role:null,label:"Sending undone",selector:null,observed:"unknown",how:"the toast after Undo, to observe"}];var km=["mailbox_route","search_route","drafts_route","compose_route","sign_in","main","row","person","row_parts","message","message_body","quote","when","compose","to_field","cc_open","cc_field","chip","suggestion","subject","body","saved_mark","save_close","send","discard","sent_toast","undo","undone_mark"],_=Te(aa,km),Me="mail.google.com";var ca=()=>({pressed:new WeakSet,held:null,replaced:null,docs:null,preview:null,pasteWatch:null}),xe={short:200,snippet:300,body:1200},Ie=(e,t)=>{let r=e.replace(/\s+/g," ").trim();return r.length<=t?r:r.slice(0,t)};var _m=/(?:^|[\s<(])([^\s@<>,;"()]+@[^\s@<>,;"()]+\.[a-z]{2,})/i;function Cm(e){for(let r of["data-address","data-hovercard-id","email"]){let o=e.getAttribute(r);if(o)return o}return[...e.querySelectorAll("*")].find(r=>r.children.length===0&&le(r.textContent??""))?.textContent?.trim()??_m.exec(e.textContent??"")?.[1]??""}function Em(e){let t=Cm(e);if(!le(t))return null;let r=(e.textContent??"").replace(t,"").replace(/[<>()]/g," ");return{name:Ie(r,xe.short),address:t}}async function la(e,t,r){if(!r.trim()||r.length>60)return h("check");let o=await X(e,t,_.to_field,"the To field of the open compose window");if(!o)return h("hook_missed");let n=v(t,_.chip).length;await e.type(o,r,!0);let i=await M(e,()=>{let a=v(e.doc,_.suggestion).filter(c=>!c.matches(_.chip.selector));return a.length>0?a:null},P.field)??[],s=[];for(let a of i){let c=Em(a);c&&!s.some(l=>ee(l.address)===ee(c.address))&&s.push(c)}return await e.type(o,"",!0),await e.key(o,"Escape"),v(t,_.chip).length!==n?h("check",{refused:"chip_added"}):k({matches:s.slice(0,8)})}var Sm=new Set(["DIV","P","LI","TR","BLOCKQUOTE","H1","H2","H3","H4","H5","H6","PRE","SECTION"]);function da(e,t=null){let r=[],o=n=>{if(n.nodeType===3){r.push(n.data);return}if(n.nodeType!==1)return;let i=n;if(t&&i.matches(t))return;if(i.tagName==="BR"){r.push(`
`);return}let s=Sm.has(i.tagName);s&&r.push(`
`),i.childNodes.forEach(o),s&&r.push(`
`)};return e.childNodes.forEach(o),r.join("").split(`
`).map(n=>n.replace(/\s+/g," ").trim()).filter(Boolean).join(`
`)}function ua(e,t){return e.length<=t?e:e.slice(0,t)}var nn=`https://${Me}`;function Fr(e){let t;try{t=new URL(e)}catch{return null}if(t.hostname!==Me)return null;let r=/^\/mail\/(?:u\/(\d+)\/)?/.exec(t.pathname);return r?Number(r[1]??0):null}function sn(e){return`#search/${encodeURIComponent(e).replace(/%20/g,"+")}`}function Ur(e,t){return nn+Re(_.search_route.route,{account:e,query:sn(t).slice(8)})}function jr(e){return nn+Re(_.compose_route.route,{account:e})}function zr(e){return nn+Re(_.drafts_route.route,{account:e})}function lt(e){return Re(_.mailbox_route.route,{account:e})}function Gr(e){return e.location.hostname==="accounts.google.com"||v(e,_.sign_in).length>0}var pa=async e=>{if(Gr(e.doc))return h("sign_in");let t=Fr(e.doc.location.href);return t===null?h("wrong_state"):k({account:t})},Am=(e,t)=>{let r=o=>decodeURIComponent(o.replace(/\+/g," "));return r(e)===r(t)},fa=async(e,t)=>{let r=R(t,"query");if(!r||r.length>200)return h("check");if(Gr(e.doc))return h("sign_in");let o=be(t),n=e.doc.location;if(!(n.hostname===Me&&n.pathname===lt(o)&&!n.search.includes("view=")))return ye(Ur(o,r));let s=sn(r);return Am(n.hash,s)||(n.hash=s,await e.sleep(P.poll)),await M(e,()=>v(e.doc,_.main)[0]??null,P.page)?k({}):h("hook_missed")};function Tm(e,t){let r=v(e,_.person)[0],o=v(e,_.row_parts),n=v(e,_.when);return{index:t,sender:Ie(r?.getAttribute("name")??r?.textContent??"",xe.short),from:r?.getAttribute("email")??"",subject:ne(Ie(o[0]?.textContent??"",xe.short)),snippet:ne(Ie((o[1]?.textContent??"").replace(/^\s*-\s*/,""),xe.snippet)),date:n.at(-1)?.getAttribute("title")??""}}var ma=async(e,t)=>{let r=v(e.doc,_.main)[0];if(!r)return h("hook_missed");let o=Math.min(Math.max(Ze(t,"limit")??3,1),10);return k({rows:v(r,_.row).slice(0,o).map(Tm)})};function Rm(e){let t=v(e,_.person)[0],r=v(e,_.message_body)[0];return{from:t?.getAttribute("email")??"",sender:Ie(t?.getAttribute("name")??t?.textContent??"",xe.short),date:v(e,_.when)[0]?.getAttribute("title")??"",body:r?ne(ua(da(r,_.quote.selector),xe.body)):""}}var ha=async(e,t)=>{let r=v(e.doc,_.main)[0],o=r?v(r,_.row)[Ze(t,"row")??0]:void 0;if(!o)return h("wrong_state");let n=e.doc.location.hash;await e.click(o);let i=await M(e,()=>{let c=v(e.doc,_.message).filter(l=>v(l,_.person).length>0);return c.length>0?c:null},P.page);if(!i)return h("timeout");let s=R(t,"from"),a=i.map(Rm).filter(c=>!s||ee(c.from)===ee(s));return e.doc.location.hash!==n&&(e.doc.location.hash=n),k({messages:a.slice(0,5)})};function we(e){let t=[_.subject,_.body,_.to_field];return v(e,_.compose).find(r=>t.some(o=>v(r,o).length>0))??null}function Et(e){return v(e,_.chip).map(t=>t.getAttribute("data-hovercard-id")??t.getAttribute("email")??"").filter(Boolean)}var ga=async(e,t)=>{if(Gr(e.doc))return h("sign_in");let r=be(t),o=e.doc.location;return o.hostname===Me&&o.pathname===lt(r)&&new URLSearchParams(o.search).get("view")==="cm"?await M(e,()=>we(e.doc),P.page)?k({}):ye(`https://${Me}${lt(r)}`):ye(jr(r))};async function Pm(e,t,r,o){let n=v(t,_.cc_field)[0];if(!n){let i=await X(e,t,_.cc_open,"the Cc link of the open compose window");if(!i)return h("hook_missed");await e.click(i),n=await M(e,()=>v(t,_.cc_field)[0]??null,P.field)??void 0}if(!n)return h("hook_missed");for(let i of r){let s=await Ut(e,n,i,o,()=>Et(t));if(s)return s}return null}var ba=async(e,t)=>{let r=we(e.doc);if(!r)return h("wrong_state");let o=R(t,"lookup");if(o!==null)return la(e,r,o);let n=Ae(t,"to"),i=Ae(t,"cc"),s=[...n,...i];if(n.length===0||s.some(p=>!le(p)))return h("check",{refused:"not_address"});let a=me(Et(r),s);if(a.length>0)return h("check",{strangers:a});let c=await X(e,r,_.to_field,"the To field of the open compose window");if(!c)return h("hook_missed");for(let p of n){let m=await Ut(e,c,p,s,()=>Et(r));if(m)return m}if(i.length>0){let p=await Pm(e,r,i,s);if(p)return p}let l=Et(r);return Fe(l,s)?k({chips:l}):h("check",{strangers:me(l,s)})},ya=async(e,t)=>{let r=R(t,"text");if(r===null||r.length>250)return h("check");let o=we(e.doc);if(!o)return h("wrong_state");let n=await X(e,o,_.subject,"the Subject field of the open compose window");if(!n)return h("hook_missed");let i=z(n).trim();return t.ifEmpty===!0&&i!==""?k({kept:i}):(await e.type(n,r,!0),z(n)===r?k({}):h("check"))},xa=async(e,t)=>{let r=R(t,"text");if(!r||r.length>4e3)return h("check");let o=we(e.doc);if(!o)return h("wrong_state");let n=await X(e,o,_.body,"the message body of the open compose window");return n?(await e.type(n,r,!0),de(z(n))===de(r)?k({}):h("check")):h("hook_missed")};async function wa(e,t){let r=await X(e,t,_.discard,"the Discard draft button of the open compose window");return r?(await e.click(r),await M(e,()=>t.isConnected?null:!0,P.page)?k({}):h("timeout")):h("hook_missed")}var va=async(e,t)=>{let r=R(t,"subject");if(!r)return h("check");let o=we(e.doc);if(o){let l=v(o,_.subject)[0];return l&&z(l)===r?wa(e,o):h("wrong_state")}let n=be(t),i=e.doc.location;if(i.hostname!==Me||i.pathname!==lt(n)||i.search.includes("view="))return ye(zr(n));i.hash!=="#drafts"&&(i.hash="#drafts");let s=await M(e,()=>v(e.doc,_.main)[0]??null,P.page);if(!s)return h("hook_missed");let a=v(s,_.row).filter(l=>(v(l,_.row_parts)[0]?.textContent??"").trim()===r);if(a.length!==1)return h("check",{matches:a.length});await e.click(a[0]);let c=await M(e,()=>we(e.doc),P.page);return c?wa(e,c):h("timeout")};var ka=async e=>{let t=we(e.doc);if(!t)return h("wrong_state");if(!await M(e,()=>v(t,_.saved_mark)[0]??null,P.saved))return h("timeout");let o=v(t,_.save_close)[0];return o&&await e.click(o),k({saved:!0,closed:o!==void 0})},_a=async(e,t,r)=>{if(!ot(t,"confirmed"))return h("check",{refused:"not_confirmed"});let o=we(e.doc);if(!o)return h("wrong_state");if(r.pressed.has(o))return h("check",{refused:"already_pressed"});let n=Ae(t,"to"),i=[...n,...Ae(t,"cc")];if(n.length===0||i.some(p=>!le(p)))return h("check",{refused:"not_address"});let s=Et(o);if(!Fe(s,i))return h("check",{strangers:me(s,i)});let a=v(o,_.body)[0];if(!a||z(a).trim()==="")return h("check",{refused:"empty_body"});let c=await X(e,o,_.send,"the Send button of the open compose window");return c?(r.pressed.add(o),await e.click(c),await M(e,()=>!o.isConnected||v(e.doc,_.sent_toast).length>0?!0:null,P.page)?k({pressed:!0}):h("timeout",{pressed:!0})):h("hook_missed")},Ca=async e=>await M(e,()=>v(e.doc,_.sent_toast)[0]??null,P.page)?k({undo:v(e.doc,_.undo).length>0}):h("timeout"),Ea=async e=>{let t=v(e.doc,_.undo)[0];return t?(await e.click(t),await M(e,()=>v(e.doc,_.undone_mark).length>0||we(e.doc)?!0:null,P.page)?k({}):h("timeout")):h("timeout",{gone:!0})};var Sa={account:pa,search:fa,read_results:ma,read_thread:ha,compose:ga,to:ba,subject:ya,body:xa,save_draft:ka,send:_a,sent:Ca,discard:va,undo_send:Ea};function Aa(e,t){let r=ca();return async o=>{let n=t[o.recipe],i=n&&Object.hasOwn(n,o.step)?n[o.step]:void 0;if(!i)return h("wrong_state");try{return await i(e,o.args,r)}catch{return h("hook_missed")}}}var Ta=[{key:"google_title",route:null,role:null,label:null,selector:'#search a h3, #rso a h3, [role="main"] a h3',observed:"unknown",how:"a result's title as a heading inside its link on Google's results page, to observe in milestone L"},{key:"google_block",route:null,role:null,label:null,selector:"[data-hveid], .g, .MjjYud",observed:"unknown",how:"the block around one Google result, to observe"},{key:"google_snippet",route:null,role:null,label:null,selector:"[data-sncf], .VwiC3b",observed:"unknown",how:"a Google result's snippet, to observe"},{key:"bing_title",route:null,role:null,label:null,selector:"#b_results li.b_algo h2 a",observed:"unknown",how:"a Bing result's title link, to observe"},{key:"bing_block",route:null,role:null,label:null,selector:"li.b_algo",observed:"unknown",how:"the block around one Bing result, to observe"},{key:"bing_snippet",route:null,role:null,label:null,selector:".b_caption p",observed:"unknown",how:"a Bing result's snippet, to observe"},{key:"ddg_title",route:null,role:null,label:null,selector:'a[data-testid="result-title-a"]',observed:"unknown",how:"a DuckDuckGo result's title link, to observe"},{key:"ddg_block",route:null,role:null,label:null,selector:'article[data-testid="result"]',observed:"unknown",how:"the block around one DuckDuckGo result, to observe"},{key:"ddg_snippet",route:null,role:null,label:null,selector:'[data-result="snippet"]',observed:"unknown",how:"a DuckDuckGo result's snippet, to observe"}];var Lm=["google_title","google_block","google_snippet","bing_title","bing_block","bing_snippet","ddg_title","ddg_block","ddg_snippet"],Le=Te(Ta,Lm);var Om={google:{title:Le.google_title,block:Le.google_block,snippet:Le.google_snippet},bing:{title:Le.bing_title,block:Le.bing_block,snippet:Le.bing_snippet},duckduckgo:{title:Le.ddg_title,block:Le.ddg_block,snippet:Le.ddg_snippet}};function an(e){return/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(e)?"google":/^(www\.)?bing\.com$/.test(e)?"bing":/^(html\.|www\.)?duckduckgo\.com$/.test(e)?"duckduckgo":null}function cn(e,t){let r;try{r=new URL(e,t)}catch{return null}if(r.hostname===t.hostname&&r.pathname==="/url"){let o=r.searchParams.get("q")??r.searchParams.get("url");return o?cn(o,t):null}return r.protocol!=="https:"&&r.protocol!=="http:"||r.hostname===t.hostname||an(r.hostname)!==null?null:r.href.length<=2e3?r.href:null}function Nm(e,t){let r=e.closest(t.block.selector);for(let o=r;o;o=o.parentElement?.closest(t.block.selector)??null)if(v(o,t.snippet).length>0)return o;return r}var Dm=async(e,t)=>{if(Ft(e.doc).some(a=>a.reason==="captcha"))return h("wrong_state",{human_check:!0});let r=new URL(e.doc.location.href),o=an(r.hostname);if(!o)return h("wrong_state");let n=Om[o],i=Math.min(Math.max(Ze(t,"limit")??10,1),20),s=[];for(let a of v(e.doc,n.title)){let c=a.tagName==="A"?a:a.closest("a"),l=c?cn(c.getAttribute("href")??"",r):null;if(!l||s.some(d=>d.url===l))continue;let p=Nm(a,n),m=p?v(p,n.snippet)[0]?.textContent??"":"";if(s.push({title:ne(Ie(a.textContent??"",xe.short)),url:l,snippet:ne(Ie(m,xe.snippet))}),s.length===i)break}return k({engine:o,rows:s})},Ra={read_results:Dm};async function Hm(e){let t=e.ownerDocument.defaultView;e.scrollIntoView?.({block:"center",inline:"center"});let r=e.getBoundingClientRect(),o={bubbles:!0,cancelable:!0,composed:!0,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0},n=t.PointerEvent??t.MouseEvent;e.dispatchEvent(new n("pointerover",o)),e.dispatchEvent(new n("pointerdown",o)),e.dispatchEvent(new t.MouseEvent("mousedown",o)),e instanceof t.HTMLElement&&e.focus(),e.dispatchEvent(new n("pointerup",o)),e.dispatchEvent(new t.MouseEvent("mouseup",o)),e.dispatchEvent(new t.MouseEvent("click",o))}function Bm(e){let t=te(e);if(e.focus(),t==="input"||t==="textarea"){e.select();return}let r=e.ownerDocument.getSelection();if(!r)return;let o=e.ownerDocument.createRange();o.selectNodeContents(e),r.removeAllRanges(),r.addRange(o)}async function $m(e,t,r){let o=z(e),n=()=>r?de(z(e))===de(t):de(z(e))!==de(o)&&de(z(e)).includes(de(t));return r?jt(e,t,n,()=>Bm(e)):(e.focus(),jt(e,t,n,()=>{}))}var Fm={Enter:"Enter",Escape:"Escape",Tab:"Tab",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",PageDown:"PageDown",PageUp:"PageUp",Backspace:"Backspace"};async function Um(e,t){let r=e.ownerDocument.defaultView,o={key:t,code:Fm[t],bubbles:!0,cancelable:!0,composed:!0};e.dispatchEvent(new r.KeyboardEvent("keydown",o)),e.dispatchEvent(new r.KeyboardEvent("keyup",o))}function ln(e,t,r,o){return{...o?{preview:o}:{},doc:e,pick:t,elementOf:r,click:Hm,type:$m,key:Um,sleep:n=>new Promise(i=>setTimeout(i,n)),now:()=>Date.now()}}var jm={gmail:Sa,calendar:ws,docs:zs,field:sa,search:Ra};function Pa(e){return Aa(e,jm)}var zm=["chatgpt","claude","gemini","deepseek","kimi","perplexity","grok","copilot","meta_ai"];function dn(e){return typeof e=="string"&&zm.includes(e)}var pn="COERE RAW EXPORT",Ia="=".repeat(64),La=["platform","platform_name","id","title","project","url","created","updated","messages","branch","hidden_messages_left_out","captured_at","adapter"],Oa=La.length+2;var $_=new Intl.Segmenter(void 0,{granularity:"grapheme"});var NC=Array.from({length:256},(e,t)=>t.toString(16).padStart(2,"0"));var ZC=new RegExp("\\p{Mn}","gu");var nE=new Intl.Segmenter(void 0,{granularity:"word"}),iE=new RegExp("[_./:\\-#+@]*[\\p{L}\\p{N}\\p{M}\\p{Cf}]+(?:(?:[_./:\\-#+@]+|['\u2019\xB7]|(?<=\\p{N})[,;](?=\\p{N}))[\\p{L}\\p{N}\\p{M}\\p{Cf}]+)*[_./:\\-#+@]*","gu");var sE=new RegExp("[\\p{Ll}\\p{N}]\\p{M}*\\p{Lu}|\\p{Lu}\\p{M}*\\p{Lu}\\p{M}*\\p{Ll}\\p{M}*\\p{Ll}","u"),aE=new RegExp("(?<=[\\p{Ll}\\p{N}]\\p{M}*)(?=\\p{Lu})|(?<=\\p{Lu}\\p{M}*)(?=\\p{Lu}\\p{M}*\\p{Ll}\\p{M}*\\p{Ll})","gu");var oh=`a about above after again all also am an and any are as at be because been before being
below between both but by can could did do does doing dont down during each few for from further had has
have having he her here hers him his how i if im in into is isnt it its itself ive just let me more most
my no nor not now of off on once only or other our ours out over own same she should so some such than
that thats the their theirs them then there these they this those through to too under until up very
was we were what when where which while who whom why will with would you your yours`,nh=`al algo algunos ante antes como con contra cual cuando de del desde donde durante el ella ellas
ellos en entre era es esa ese eso esta estaba estan estas este esto estos fue ha hay la las le les lo los
mas me mi mis muy nada ni no nos nosotros o otra otro para pero poco por porque que quien se sea ser si
sin sobre son su sus tambien te tiene todo todos tu tus un una uno unos usted y ya yo`,ih=`\u7684 \u4E86 \u662F \u5728 \u548C \u4E0E \u53CA \u6216 \u4E5F \u5C31 \u90FD \u800C \u7740 \u628A \u88AB \u8BA9 \u7ED9 \u5BF9 \u4ECE \u5230 \u4E3A \u4EE5 \u4E4B \u5176 \u4F46 \u5E76 \u5F88 \u5417 \u5462 \u5427 \u554A \u5440 \u4E48 \u8FD9 \u90A3 \u8FD9\u4E2A \u90A3\u4E2A
\u4E00\u4E2A \u6211\u4EEC \u4F60\u4EEC \u4ED6\u4EEC \u4EC0\u4E48 \u600E\u4E48 \u5982\u4F55 \u53EF\u4EE5 \u6CA1\u6709 \u306E \u306F \u304C \u3092 \u306B \u3067 \u3068 \u3082 \u3078 \u3084 \u304B\u3089 \u307E\u3067`,sh=new Set([oh,nh,ih].flatMap(e=>e.split(/\s+/)));var fE=new RegExp("^(?:\\p{M}|\\u200d)","u");var bE=new Intl.Segmenter(void 0,{granularity:"sentence"});var dh=`remember remembered remembering remind reminds reminded recall please pls plz kindly
help helps helped helping thanks thank thx ty hey hi hello hiya yo ok okay yes yeah yep nope sure
just really actually basically literally also maybe perhaps probably
want wants wanted wanna need needs needed know knows knew think thinks thought
tell tells told show shows showed give gives gave ask asks asked say says said saying
lets going gonna get gets got gotten like likes liked try trying tried see look looks
something anything everything someone anyone thing things stuff way ways lot lots bit
e.g i.e eg ie etc`,uh="recuerda recuerdame recordar favor gracias hola ayuda ayudame ayudar quiero necesito dime puedes podrias",ph=`\u6211 \u4F60 \u4ED6 \u5979 \u5B83 \u6211\u4EEC \u4F60\u4EEC \u4ED6\u4EEC \u5979\u4EEC \u54B1\u4EEC \u6211\u60F3 \u60F3\u8981 \u60F3 \u8981 \u8BF7 \u8BF7\u95EE \u5E2E \u5E2E\u6211 \u5E2E\u52A9 \u8BA9 \u4E00\u4E0B \u4E00\u4E9B \u5173\u4E8E \u544A\u8BC9 \u8BB0\u5F97 \u8BB0\u4F4F \u8C22\u8C22 \u4F60\u597D
\u79C1 \u50D5 \u304A\u9858\u3044 \u304F\u3060\u3055\u3044 \u3057\u3066 \u307E\u3059 \u3067\u3059 \u3059\u308B \u3053\u306E \u305D\u306E \u3042\u306E \u3053\u308C \u305D\u308C`,fh=new Set([dh,uh,ph].flatMap(e=>e.split(/\s+/))),mh=new Set("mr mrs ms mx dr prof sir jr sr st".split(" ")),hh=new Set("e.g i.e mr mrs ms mx dr prof sr jr st vs approx inc ltd".split(" "));var JE=new RegExp("^\\p{N}$","u"),YE=new RegExp("\\p{N}","u");function gn(e,t){return`COERE TRANSFER part ${e} of ${t}. Contents, oldest first:`}var za=pn,aS=`${za}
`;function wh(e){return e>=55296&&e<=56319}function vh(e){return e>=56320&&e<=57343}function bn(e,t=0,r=e.length){let o=0;for(let n=t;n<r;n+=1){let i=e.charCodeAt(n);i<128?o+=1:i<2048?o+=2:wh(i)&&n+1<r&&vh(e.charCodeAt(n+1))?(o+=4,n+=1):o+=3}return o}var Sh=5*1024*1024,Ga=99999,xS=bn(gn(Ga,Ga))+1;var Th=["run.start","run.page","run.inventory","run.plan","run.fetch","run.retry","run.wait","run.concurrency","run.large_chat","run.error","run.pause","run.resume","run.cancel","run.attention","run.verify","run.metrics","run.done","engine.call","engine.upsert","engine.error","index.batch","index.done","index.verify","search.run","recall.open","recall.close","recall.insert","transfer.plan","transfer.start","transfer.blocked","transfer.insert","transfer.result","extractall.start","extractall.answer","extractall.control","extractall.done","import.start","import.done","folder.connect","folder.permission","folder.write","zip.build","worker.start","adapter.selftest","memory.plan","memory.call","memory.job","memory.batch","memory.capture","memory.queue","memory.consolidate","memory.verify","memory.export","memory.import","memory.stop","memory.reconcile","memory.rebuild","memory.forget","memory.classify","memory.triage","memory.retain","memory.audit","memory.doc","memory.link","memory.section","memory.vectors","memory.migrate","memory.build","memory.route","memory.context","memory.scan","memory.forget_topic","cori.answer","cori.feedback"],YS=new Set(Th);var Wa={$comment:"One entry per platform. Code reads this file and never hardcodes a platform name. Capabilities start as unknown and are filled by the M0 spike and kept fresh by the live canary. Host evidence lives in docs/site-notes.md.",platforms:[{id:"chatgpt",name:"ChatGPT",tier:1,hosts:["chatgpt.com"],newChatUrl:"https://chatgpt.com/",logo:"icons/platforms/chatgpt.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"yes",pasteLimitChars:null},exportImport:"zip-conversations-json"},{id:"claude",name:"Claude",tier:1,hosts:["claude.ai"],newChatUrl:"https://claude.ai/new",logo:"icons/platforms/claude.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"yes",pasteLimitChars:null},exportImport:"zip-conversations-json"},{id:"gemini",name:"Gemini",tier:1,hosts:["gemini.google.com"],newChatUrl:"https://gemini.google.com/app",logo:"icons/platforms/gemini.svg",capabilities:{bulkList:"yes",fetchOne:"yes",readPage:"yes",projects:"no",pasteLimitChars:null},exportImport:"unknown"},{id:"deepseek",name:"DeepSeek",tier:2,hosts:["chat.deepseek.com"],newChatUrl:"https://chat.deepseek.com/",logo:"icons/platforms/deepseek.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"kimi",name:"Kimi",tier:2,hosts:["www.kimi.com"],newChatUrl:"https://www.kimi.com/",logo:"icons/platforms/kimi.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"perplexity",name:"Perplexity",tier:2,hosts:["www.perplexity.ai"],newChatUrl:"https://www.perplexity.ai/",logo:"icons/platforms/perplexity.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"grok",name:"Grok",tier:2,hosts:["grok.com"],newChatUrl:"https://grok.com/",logo:"icons/platforms/grok.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"copilot",name:"Copilot",tier:2,hosts:["copilot.microsoft.com","copilot.com"],newChatUrl:"https://copilot.microsoft.com/",logo:"icons/platforms/copilot.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"},{id:"meta_ai",name:"Meta AI",tier:2,hosts:["www.meta.ai"],newChatUrl:"https://www.meta.ai/",logo:"icons/platforms/meta_ai.svg",capabilities:{bulkList:"unknown",fetchOne:"unknown",readPage:"unknown",projects:"unknown",pasteLimitChars:null},exportImport:"unknown"}]};var Va=Wa.platforms.map(e=>{if(!dn(e.id))throw new Error(`platforms.json has an unknown id: ${e.id}`);return e}),Mh=new Map(Va.map(e=>[e.id,e]));function W(e){let t=Mh.get(e);if(!t)throw new Error(`No platform with id ${e}`);return t}var V=class extends Error{constructor(t,r){super(`${t}: ${r}`),this.name="ConfigError"}};function Ih(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ve(e,t){if(!Ih(e))throw new V(t,"must be an object");return e}function ke(e,t,r){for(let o of Object.keys(e))if(!t.includes(o))throw new V(`${r}.${o}`,"is not a known key")}function We(e,t){if(typeof e!="string"||e.trim()==="")throw new V(t,"must be a non empty string");return e}function Oe(e,t,r){if(typeof e!="string"||!t.includes(e))throw new V(r,`must be one of ${t.join(", ")}`);return e}function Xt(e,t){if(!Array.isArray(e))throw new V(t,"must be an array");return e}function At(e,t){let r=We(e,t);try{new RegExp(r)}catch{throw new V(t,"is not a valid regular expression")}return r}var qr=["live","logged-out","reference","owner-prior","none"];var Lh=["name","match","verified","note"];function Ka(e){return e===void 0?[]:Xt(e,"config.temporaryUrl").map((t,r)=>{let o=`config.temporaryUrl[${r}]`,n=ve(t,o);ke(n,Lh,o);let i={name:We(n.name,`${o}.name`),match:At(n.match,`${o}.match`),verified:Oe(n.verified,qr,`${o}.verified`)};if(n.note!==void 0&&(i.note=We(n.note,`${o}.note`)),i.match==="")throw new V(`${o}.match`,"must not be empty");return i})}var Jt=["composer","composerShell","sendButton","message","messageContent","userMessage","assistantMessage","scrollContainer","sidebarLink","title","temporaryChat","streamingIndicator","rateLimitBanner","loggedOut"],Oh=["user","assistant","system","tool"],Nh=["execCommand","paste","beforeinput","value"],qa=["execCommand","paste","beforeinput"],Dh=["sync","twoStep"],Hh="twoStep",Bh=["$comment","anchors","roles","urls","insertOrder","sendHook","temporaryUrl"],$h=["name","selector","verified","deep","note"];function j(e){let t=ve(e,"config");return ke(t,Bh,"config"),{anchors:Fh(t.anchors===void 0?{}:t.anchors),roles:t.roles===void 0?{by:"anchors"}:jh(t.roles),urls:zh(t.urls),insertOrder:t.insertOrder===void 0?[...qa]:Gh(t.insertOrder),sendHook:t.sendHook===void 0?Hh:Oe(t.sendHook,Dh,"config.sendHook"),temporaryUrl:Ka(t.temporaryUrl)}}function Fh(e){let t=ve(e,"config.anchors");ke(t,Jt,"config.anchors");let r={};for(let o of Jt){let n=`config.anchors.${o}`,i=t[o]===void 0?[]:Xt(t[o],n);r[o]=i.map((a,c)=>Uh(a,`${n}[${c}]`));let s=new Set;for(let a of r[o]){if(s.has(a.name))throw new V(n,`has two strategies named "${a.name}"`);s.add(a.name)}}return r}function Uh(e,t){let r=ve(e,t);ke(r,$h,t);let o={name:We(r.name,`${t}.name`),selector:We(r.selector,`${t}.selector`),verified:Oe(r.verified,qr,`${t}.verified`)};if(r.deep!==void 0){if(typeof r.deep!="boolean")throw new V(`${t}.deep`,"must be true or false");o.deep=r.deep}return r.note!==void 0&&(o.note=We(r.note,`${t}.note`)),o}function jh(e){let t=ve(e,"config.roles"),r=Oe(t.by,["attribute","anchors"],"config.roles.by");if(r==="anchors")return ke(t,["by"],"config.roles"),{by:r};ke(t,["by","attribute","values"],"config.roles");let o={};for(let[n,i]of Object.entries(ve(t.values,"config.roles.values")))o[n]=Oe(i,Oh,`config.roles.values.${n}`);return{by:r,attribute:We(t.attribute,"config.roles.attribute"),values:o}}function zh(e){let t=ve(e,"config.urls");ke(t,["chatPath","newChatPath","projectPath"],"config.urls");let r={chatPath:At(t.chatPath,"config.urls.chatPath"),newChatPath:At(t.newChatPath,"config.urls.newChatPath")};return t.projectPath!==void 0&&(r.projectPath=At(t.projectPath,"config.urls.projectPath")),r}function Gh(e){let t=Xt(e,"config.insertOrder");if(t.length===0)throw new V("config.insertOrder","needs at least one strategy");let r=t.map((o,n)=>Oe(o,Nh,`config.insertOrder[${n}]`));if(new Set(r).size!==r.length)throw new V("config.insertOrder","repeats a strategy");return r}var Za={$comment:"Per site limits measured live and refreshed by the live canary. Null means not measured. Nothing here may be assumed. Gemini: the logged out box kept the first 32,000 characters of a longer insert on 2026-10-20 (docs/site-notes.md).",measuredAt:"2026-10-20",sites:{chatgpt:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},claude:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},gemini:{pasteLimitChars:32e3,tokenLimit:null,source:"measured"},deepseek:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},kimi:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},perplexity:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},grok:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},copilot:{pasteLimitChars:null,tokenLimit:null,source:"unknown"},meta_ai:{pasteLimitChars:null,tokenLimit:null,source:"unknown"}}};var ig=["pasteLimitChars","tokenLimit","source"],sg=["pasteLimitChars","tokenLimit"];function ag(e,t){if(e===null)return null;if(typeof e!="number"||!Number.isInteger(e)||e<0)throw new V(t,"must be null or a whole number of at least 0");return e}function cg(e,t){let r=`limits.sites.${t}`,o=ve(e,r);ke(o,ig,r);let[n,i]=sg.map(s=>ag(o[s],`${r}.${s}`));return{pasteLimitChars:n??null,tokenLimit:i??null,source:Oe(o.source,["unknown","measured"],`${r}.source`)}}var lg=Za.sites;function K(e){return cg(lg[e],e)}var Qa={$comment:"ChatGPT. The cloud browser never got past Cloudflare (docs/site-notes.md), so nothing here was watched in a signed in browser for this build. Strategies marked reference follow ChatGPT's current markup as the maintained open source exporter pionxzh/chatgpt-exporter and similar tools read it: the ProseMirror composer at #prompt-textarea, one element per message carrying data-message-author-role, and the stop button while a reply streams. Owner-prior strategies stay as fallbacks. Chats live at /c/<uuid>, also under a project or GPT at /g/<id>/c/<uuid>.",anchors:{composer:[{name:"reference: prompt textarea id",selector:"#prompt-textarea[contenteditable='true']",verified:"reference",note:"ProseMirror editor, chatgpt-exporter"},{name:"owner-prior: prompt textarea id",selector:"#prompt-textarea",verified:"owner-prior"},{name:"owner-prior: ProseMirror editor",selector:"div[contenteditable='true'].ProseMirror",verified:"owner-prior"},{name:"owner-prior: textarea with data-id",selector:"textarea[data-id]",verified:"owner-prior"}],composerShell:[{name:"reference: unified composer form",selector:"form[data-type='unified-composer']",verified:"reference"},{name:"reference: form around the composer",selector:"form:has(#prompt-textarea)",verified:"reference"}],sendButton:[{name:"reference: send button test id",selector:"button[data-testid='send-button']",verified:"reference"},{name:"reference: composer submit button",selector:"#composer-submit-button",verified:"reference"}],message:[{name:"owner-prior: author role attribute",selector:"[data-message-author-role]",verified:"owner-prior",note:"chatgpt-exporter reads messages the same way"}],messageContent:[{name:"reference: assistant markdown",selector:".markdown",verified:"reference"},{name:"reference: user text",selector:".whitespace-pre-wrap",verified:"reference"}],userMessage:[{name:"owner-prior: user author role",selector:"[data-message-author-role='user']",verified:"owner-prior"}],assistantMessage:[{name:"reference: assistant author role",selector:"[data-message-author-role='assistant']",verified:"reference"}],sidebarLink:[{name:"reference: history link",selector:"nav a[href*='/c/']",verified:"reference"}],streamingIndicator:[{name:"reference: stop button test id",selector:"button[data-testid='stop-button']",verified:"reference"}],loggedOut:[{name:"reference: log in button",selector:"button[data-testid='login-button']",verified:"reference"}],title:[{name:"owner-prior: page heading",selector:"main h1",verified:"owner-prior",note:"Usually absent; the kit falls back to document.title, which ChatGPT sets to the chat's title."}]},roles:{by:"attribute",attribute:"data-message-author-role",values:{user:"user",assistant:"assistant"}},urls:{newChatPath:"^/(?:g/[^/]+/?)?$",chatPath:"^/(?:g/[^/]+/)?c/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",projectPath:"^/g/(?<id>g-p-[^/]+)/project"},sendHook:"twoStep",temporaryUrl:[{name:"temporary chat flag",match:"[?&]temporary-chat=true(?:&|$)",verified:"none",note:"ChatGPT's own links open a temporary chat at /?temporary-chat=true. Unverified on the live site."}]};var ug={info:W("chatgpt"),config:j(Qa),version:"0.1.0",dataSource:null,limits:K("chatgpt")};var ec={$comment:"Claude. The cloud browser never got past Cloudflare (docs/site-notes.md), so nothing here was watched in a signed in browser for this build. Strategies marked reference follow claude.ai's current markup as maintained open source exporters (socketteer/Claude-Conversation-Exporter and others) read it: the ProseMirror composer, data-testid='user-message' for the person's turns, font-claude-response inside a data-is-streaming wrapper for replies, which reads true while a reply streams. Owner-prior strategies stay as fallbacks. Chats live at /chat/<uuid>, projects at /project/<uuid>.",anchors:{composer:[{name:"reference: chat input ProseMirror",selector:"[data-testid='chat-input'] div[contenteditable='true'].ProseMirror",verified:"reference"},{name:"owner-prior: ProseMirror editor",selector:"div[contenteditable='true'].ProseMirror",verified:"owner-prior"},{name:"owner-prior: editable textbox",selector:"div[contenteditable='true'][role='textbox']",verified:"owner-prior"},{name:"owner-prior: editable inside a fieldset",selector:"fieldset div[contenteditable='true']",verified:"owner-prior"}],composerShell:[{name:"reference: fieldset around the composer",selector:"fieldset:has(div[contenteditable='true'].ProseMirror)",verified:"reference"}],sendButton:[{name:"reference: send message label",selector:"button[aria-label='Send message'], button[aria-label='Send Message']",verified:"reference"}],userMessage:[{name:"owner-prior: user message test id",selector:"[data-testid='user-message']",verified:"owner-prior"}],assistantMessage:[{name:"reference: streaming wrapper",selector:"div[data-is-streaming]",verified:"reference",note:"Wraps each reply; holds font-claude-response inside."},{name:"reference: response font",selector:".font-claude-response",verified:"reference"}],messageContent:[{name:"reference: response body",selector:".font-claude-response",verified:"reference"}],sidebarLink:[{name:"reference: recents link",selector:"a[href^='/chat/']",verified:"reference"}],streamingIndicator:[{name:"reference: reply streaming",selector:"div[data-is-streaming='true']",verified:"reference"}],title:[{name:"owner-prior: chat menu trigger",selector:"button[data-testid='chat-menu-trigger']",verified:"owner-prior"}]},urls:{newChatPath:"^/new$",chatPath:"^/chat/(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",projectPath:"^/project/(?<id>[0-9a-f-]{36})"},sendHook:"twoStep",temporaryUrl:[{name:"incognito flag",match:"[?&]incognito(?:=[^&]*)?(?:&|$)",verified:"none",note:"Claude opens an incognito chat at /new?incognito. Unverified on the live site."}]};var fg={info:W("claude"),config:j(ec),version:"0.1.0",dataSource:null,limits:K("claude")};var tc={$comment:"Copilot. Nothing here is verified: logged out, copilot.com shows a sign in landing page with no composer (docs/site-notes.md, docs/evidence/m0/probe-copilot.json). The composer is owner-prior, from the owner's older extension, never checked for this build; the owner's bare contenteditable fallback is left to the kit's generic finder. The owner's message selectors (div[data-content='user-message'], div[data-content='ai-message'], cib-message) are left out: the owner gave no user selector, and reading roles from those values would be a guess. newChatPath is the owner's new chat URL. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"owner-prior: user input textarea",selector:"textarea#userInput",verified:"owner-prior"},{name:"owner-prior: textarea with placeholder",selector:"textarea[placeholder]",verified:"owner-prior"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},sendHook:"twoStep"};var hg={info:W("copilot"),config:j(tc),version:"0.1.0",dataSource:null,limits:K("copilot")};var rc={$comment:"DeepSeek. Nothing here is verified: logged out, the site moves to /sign_in (docs/site-notes.md, docs/evidence/m0/probe-deepseek.json). The composer is owner-prior, from the owner's older extension, never checked for this build; the owner's bare textarea fallback is left to the kit's generic finder. The owner's message selectors (div._4f9bf79, div.ds-markdown, div[class*='message']) are left out: with no user selector, every message would read as hidden. newChatPath is the owner's new chat URL. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"owner-prior: chat input textarea",selector:"textarea#chat-input",verified:"owner-prior"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},sendHook:"twoStep"};var bg={info:W("deepseek"),config:j(rc),version:"0.1.0",dataSource:null,limits:K("deepseek")};var oc={$comment:"Gemini. The composer, its box, the /app path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-gemini.json). Strategies marked reference follow Gemini's current markup as maintained open source clients and exporters read it: one user-query element per prompt and one model-response per reply, with the text in .query-text and message-content, and the stop button while a reply streams. They were not watched in a signed in browser for this build. Insert: execCommand kept lines and the draft, paste and beforeinput did nothing, so execCommand is the only one tried. Chats live at /app/<hex>, or /u/<n>/app/<hex> on a second Google account.",anchors:{composer:[{name:"logged-out: Quill editor by label",selector:"div.ql-editor[contenteditable='true'][role='textbox'][aria-label='Enter a prompt for Gemini']",verified:"logged-out",note:"The label is English. The off screen div.ql-clipboard has no role, so it never matches."},{name:"logged-out: Quill editor in rich-textarea",selector:"rich-textarea div.ql-editor[contenteditable='true'][role='textbox']",verified:"logged-out"}],composerShell:[{name:"logged-out: input area fieldset",selector:"fieldset.input-area-fieldset",verified:"logged-out",note:"660 by 64 px when empty."},{name:"logged-out: input-area-v2",selector:"input-area-v2",verified:"logged-out",note:"The element that paints the box: 32 px radius, shadow, same size as the fieldset."}],message:[{name:"owner-prior: message list",selector:"user-query, model-response",verified:"owner-prior",note:"The owner's list also named message-content, which sits inside model-response and was read twice."}],messageContent:[{name:"reference: query text",selector:".query-text",verified:"reference"},{name:"reference: message content",selector:"message-content",verified:"reference"}],userMessage:[{name:"owner-prior: user-query",selector:"user-query",verified:"owner-prior"}],assistantMessage:[{name:"reference: model-response",selector:"model-response",verified:"reference"}],sidebarLink:[{name:"reference: conversation link",selector:"a[href*='/app/']",verified:"reference"}],streamingIndicator:[{name:"reference: stop response button",selector:"button[aria-label='Stop response']",verified:"reference"}],title:[{name:"owner-prior: conversation title test id",selector:"[data-test-id='conversation-title']",verified:"owner-prior"},{name:"reference: selected conversation in the sidebar",selector:".conversation.selected .conversation-title",verified:"reference"}]},urls:{newChatPath:"^/(?:u/\\d+/)?app/?$",chatPath:"^/(?:u/\\d+/)?app/(?<id>[0-9a-f]{8,})",projectPath:"^/(?:u/\\d+/)?gem/(?<id>[^/]+)"},insertOrder:["execCommand"],sendHook:"twoStep"};var xg={info:W("gemini"),config:j(oc),version:"0.1.0",dataSource:null,limits:K("gemini")};var nc={$comment:"Grok. The composer, its box, Submit, the / path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-grok.json). The page shows a plain textarea first and swaps in the TipTap editor about a second later; the textarea stays in the page, hidden. Insert: execCommand and paste kept lines and the draft, beforeinput did nothing. The owner's Grok textarea selector is owner-prior; the owner's bare textarea and contenteditable fallbacks are left to the kit's generic finder, and the owner's message selectors (div.message-bubble, [data-testid='message'], div.response-content-markdown) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: TipTap editor by label",selector:"div.ProseMirror[contenteditable][aria-label='Ask Grok anything']",verified:"logged-out",note:"Its role is combobox, not textbox. The label is English."},{name:"logged-out: editor in chat input",selector:"[data-testid='chat-input'] [contenteditable]",verified:"logged-out"},{name:"owner-prior: Grok textarea",selector:"textarea[aria-label*='Grok' i]",verified:"owner-prior"}],composerShell:[{name:"logged-out: query bar",selector:"div.query-bar",verified:"logged-out",note:"752 by 102 px, 24 px radius, border and shadow."}],sendButton:[{name:"logged-out: chat submit",selector:"[data-testid='chat-submit']",verified:"logged-out",note:"Labeled Submit. Disabled while the box is empty."}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["execCommand","paste"],sendHook:"twoStep"};var vg={info:W("grok"),config:j(nc),version:"0.1.0",dataSource:null,limits:K("grok")};var ic={$comment:"Kimi. The composer, its box, the / path and the insert order were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-kimi.json); the composer appears 6 to 15 seconds after load. Insert: paste kept lines and the draft, execCommand lost line breaks and broke the draft, beforeinput doubled the text, so paste is the only one tried. Kimi also restores the last tab's draft in a new tab. The owner's message selectors (div[class*='segment'], div[class*='markdown']) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: Lexical chat input editor",selector:"div.chat-input-editor[contenteditable='true'][role='textbox'][data-lexical-editor='true']",verified:"logged-out"},{name:"logged-out: chat input editor",selector:"div.chat-input-editor[contenteditable='true']",verified:"logged-out"}],composerShell:[{name:"logged-out: chat editor content",selector:"div.chat-editor-content",verified:"logged-out",note:"768 by 114 px, 24 px radius, border and shadow."},{name:"logged-out: chat editor test id",selector:"div.chat-editor[data-testid='chat-editor']",verified:"logged-out"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["paste"],sendHook:"twoStep"};var _g={info:W("kimi"),config:j(ic),version:"0.1.0",dataSource:null,limits:K("kimi")};var sc={$comment:"Meta AI. The composer, Send, the sign in marker, the / path and the value insert were seen on the live page logged out (docs/site-notes.md, docs/evidence/m0/probe-meta_ai.json). Logged out, the composer is a one line text input behind a sign in dialog, inside a wrapper named logged-out-composer-input, so the logged in composer may be a different element. Insert: only the value setter reached the input, so it goes first; the default order follows for whatever the logged in composer turns out to be. The box has only utility class names, so the kit's generic box finder applies. The owner's selectors for Meta AI were bare contenteditable, textarea and div[dir='auto'], left to the kit's generic finders. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: composer input in its slot",selector:"div[data-slot='logged-out-composer-input'] input[type='text']",verified:"logged-out"},{name:"logged-out: composer input by label",selector:"input[type='text'][aria-label='Ask Meta AI']",verified:"logged-out",note:"The label is English."}],sendButton:[{name:"logged-out: Send label",selector:"[aria-label='Send']",verified:"logged-out",note:"Disabled while the box is empty."}],loggedOut:[{name:"logged-out: logged out composer slot",selector:"[data-slot='logged-out-composer-input']",verified:"logged-out"}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["value","execCommand","paste","beforeinput"],sendHook:"twoStep"};var Eg={info:W("meta_ai"),config:j(sc),version:"0.1.0",dataSource:null,limits:K("meta_ai")};var ac={$comment:"Perplexity. The logged out strategies and the insert order come from the probe's first run (docs/site-notes.md), whose JSON was overwritten by a later run that met a human check, so the notes call them unconfirmed until the owner's pass. Insert: paste kept lines and the draft, execCommand lost line breaks and broke the draft, beforeinput doubled the text, so paste is the only one tried. The owner's #ask-input and textarea selectors are owner-prior; the owner's bare contenteditable and textarea fallbacks are left to the kit's generic finder, and the owner's message selectors (div.prose, [data-testid='answer'], div[class*='query']) are left out: with no user selector, every message would read as hidden. No chat URL was observed, so chatPath is (?!), a pattern that never matches.",anchors:{composer:[{name:"logged-out: Lexical ask input",selector:"div#ask-input[contenteditable='true'][role='textbox']",verified:"logged-out",note:"First probe run only."},{name:"owner-prior: ask input id",selector:"#ask-input",verified:"owner-prior"},{name:"owner-prior: ask textarea",selector:"textarea[placeholder*='Ask' i]",verified:"owner-prior"}],composerShell:[{name:"logged-out: raised box",selector:"div[data-appearance='raised']",verified:"logged-out",note:"First probe run only. 640 by 118 px, 16 px radius."}]},urls:{newChatPath:"^/$",chatPath:"(?!)"},insertOrder:["paste"],sendHook:"twoStep"};var Ag={info:W("perplexity"),config:j(ac),version:"0.1.0",dataSource:null,limits:K("perplexity")};function Jr(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}var dc=e=>e.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>1);function uc(e,t){let r=new Set(dc(e));return t.map(o=>({e:o,score:dc(`${o.name} ${o.role}`).filter(n=>r.has(n)).length})).filter(o=>o.score>0).sort((o,n)=>n.score-o.score).slice(0,20).map(({e:o})=>({n:o.n,role:o.role,name:o.name,heading:o.heading}))}var Pg=["read","snapshot","do","settle","marks","overlay","recipe","picture","form"],Mg=e=>Jr(e)&&typeof e.id=="string"&&Pg.includes(e.type)?e:null,Ig=e=>e.visible&&(e.bar.mode==="working"||e.bar.mode==="waiting");function pc(e){let t=e.connect(),r=!0,o=null,n=null,i=0,s=new Map,a=m=>{r&&t.postMessage(m)},c=m=>{o??=e.overlay(u=>a({type:"press",press:u})),o.draw(m);let d=Ig(m);d&&!n&&(n=e.watchPerson(u=>a({type:"person",input:u}))),!d&&n&&(n(),n=null)};async function l(m){if(m.type==="overlay")return c(m.state),{id:m.id,ok:!0,type:"overlay",result:{drawn:!0}};if(m.type==="form"){if(!e.forms)return{id:m.id,ok:!1,type:"form",error:"refused"};try{return{id:m.id,ok:!0,type:"form",result:await e.forms(m.call)}}catch(d){let u=d.code;return{id:m.id,ok:!1,type:"form",error:typeof u=="string"?u:"internal"}}}if(m.type!=="recipe")return e.kit.handle(m);if(!e.recipes)return{id:m.id,ok:!1,type:"recipe",error:"refused"};try{return{id:m.id,ok:!0,type:"recipe",result:await e.recipes(m.call)}}catch{return{id:m.id,ok:!1,type:"recipe",error:"internal"}}}let p=()=>{if(r){r=!1,n?.(),o?.remove(),e.kit.dispose();for(let m of s.values())m(null);s.clear()}};return t.onMessage.addListener(m=>{if(Jr(m)&&m.type==="picked"&&typeof m.id=="string"){s.get(m.id)?.(typeof m.n=="number"?m.n:null),s.delete(m.id);return}let d=Mg(m);d&&l(d).then(a)}),t.onDisconnect.addListener(p),{emit:a,pick(m,d){let u=uc(m,d);if(!r||u.length===0)return Promise.resolve(null);let g=`k${++i}`,y={type:"pick",id:g,description:m,candidates:u};return new Promise(x=>{s.set(g,x),a(y)})},stop(){try{t.disconnect()}catch{}p()}}}var no,T,bc,Lg,Qe,fc,yc,xc,_n,Zr,Zt,wc,Sn,Cn,En,Og,to={},ro=[],Ng=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,io=Array.isArray;function qe(e,t){for(var r in t)e[r]=t[r];return e}function An(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function Ce(e,t,r){var o,n,i,s={};for(i in t)i=="key"?o=t[i]:i=="ref"?n=t[i]:s[i]=t[i];if(arguments.length>2&&(s.children=arguments.length>3?no.call(arguments,2):r),typeof e=="function"&&e.defaultProps!=null)for(i in e.defaultProps)s[i]===void 0&&(s[i]=e.defaultProps[i]);return Qr(e,s,o,n,null)}function Qr(e,t,r,o,n){var i={type:e,props:t,key:r,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:n??++bc,__i:-1,__u:0};return n==null&&T.vnode!=null&&T.vnode(i),i}function I(e){return e.children}function eo(e,t){this.props=e,this.context=t}function ut(e,t){if(t==null)return e.__?ut(e.__,e.__i+1):null;for(var r;t<e.__k.length;t++)if((r=e.__k[t])!=null&&r.__e!=null)return r.__e;return typeof e.type=="function"?ut(e):null}function Dg(e){if(e.__P&&e.__d){var t=e.__v,r=t.__e,o=[],n=[],i=qe({},t);i.__v=t.__v+1,T.vnode&&T.vnode(i),Tn(e.__P,i,t,e.__n,e.__P.namespaceURI,32&t.__u?[r]:null,o,r??ut(t),!!(32&t.__u),n),i.__v=t.__v,i.__.__k[i.__i]=i,Ec(o,i,n),t.__e=t.__=null,i.__e!=r&&vc(i)}}function vc(e){if((e=e.__)!=null&&e.__c!=null)return e.__e=e.__c.base=null,e.__k.some(function(t){if(t!=null&&t.__e!=null)return e.__e=e.__c.base=t.__e}),vc(e)}function mc(e){(!e.__d&&(e.__d=!0)&&Qe.push(e)&&!oo.__r++||fc!=T.debounceRendering)&&((fc=T.debounceRendering)||yc)(oo)}function oo(){try{for(var e,t=1;Qe.length;)Qe.length>t&&Qe.sort(xc),e=Qe.shift(),t=Qe.length,Dg(e)}finally{Qe.length=oo.__r=0}}function kc(e,t,r,o,n,i,s,a,c,l,p){var m,d,u,g,y,x,b=o&&o.__k||ro,w=t.length;for(c=Hg(r,t,b,c,w),m=0;m<w;m++)(u=r.__k[m])!=null&&(d=u.__i!=-1&&b[u.__i]||to,u.__i=m,x=Tn(e,u,d,n,i,s,a,c,l,p),g=u.__e,u.ref&&d.ref!=u.ref&&(d.ref&&Rn(d.ref,null,u),p.push(u.ref,u.__c||g,u)),y==null&&g!=null&&(y=g),4&u.__u?(c=_c(u,c,e),d.__e&&(d.__e=null)):typeof u.type=="function"&&x!==void 0?c=x:g&&(c=g.nextSibling),u.__u&=-7);return r.__e=y,c}function Hg(e,t,r,o,n){var i,s,a,c,l,p=r.length,m=p,d=0;for(e.__k=new Array(n),i=0;i<n;i++)(s=t[i])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[i]=Qr(null,s,null,null,null):io(s)?s=e.__k[i]=Qr(I,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[i]=Qr(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[i]=s,c=i+d,s.__=e,s.__b=e.__b+1,a=null,(l=s.__i=Bg(s,r,c,m))!=-1&&(m--,(a=r[l])&&(a.__u|=2)),a==null||a.__v==null?(l==-1&&(n>p?d--:n<p&&d++),typeof s.type!="function"&&(s.__u|=4)):l!=c&&(l==c-1?d--:l==c+1?d++:(l>c?d--:d++,s.__u|=4))):e.__k[i]=null;if(m)for(i=0;i<p;i++)(a=r[i])!=null&&(2&a.__u)==0&&(a.__e==o&&(o=ut(a)),Ac(a,a));return o}function _c(e,t,r){var o,n;if(typeof e.type=="function"){for(o=e.__k,n=0;o&&n<o.length;n++)o[n]&&(o[n].__=e,t=_c(o[n],t,r));return t}e.__e!=t&&(t&&e.type&&!t.parentNode&&(t=ut(e)),t=r.insertBefore(e.__e,t||null));do t=t&&t.nextSibling;while(t!=null&&t.nodeType==8);return t}function Bg(e,t,r,o){var n,i,s,a=e.key,c=e.type,l=t[r],p=l!=null&&(2&l.__u)==0;if(l===null&&a==null||p&&a==l.key&&c==l.type)return r;if(o>(p?1:0)){for(n=r-1,i=r+1;n>=0||i<t.length;)if((l=t[s=n>=0?n--:i++])!=null&&(2&l.__u)==0&&a==l.key&&c==l.type)return s}return-1}function hc(e,t,r){t[0]=="-"?e.setProperty(t,r??""):e[t]=r==null?"":typeof r!="number"||Ng.test(t)?r:r+"px"}function Yr(e,t,r,o,n){var i,s;e:if(t=="style")if(typeof r=="string")e.style.cssText=r;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)r&&t in r||hc(e.style,t,"");if(r)for(t in r)o&&r[t]==o[t]||hc(e.style,t,r[t])}else if(t[0]=="o"&&t[1]=="n")i=t!=(t=t.replace(wc,"$1")),s=t.toLowerCase(),t=s in e||t=="onFocusOut"||t=="onFocusIn"?s.slice(2):t.slice(2),e.l||(e.l={}),e.l[t+i]=r,r?o?r[Zt]=o[Zt]:(r[Zt]=Sn,e.addEventListener(t,i?En:Cn,i)):e.removeEventListener(t,i?En:Cn,i);else{if(n=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=r??"";break e}catch{}typeof r=="function"||(r==null||r===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&r==1?"":r))}}function gc(e){return function(t){if(this.l){var r=this.l[t.type+e];if(t[Zr]==null)t[Zr]=Sn++;else if(t[Zr]<r[Zt])return;return r(T.event?T.event(t):t)}}}function Tn(e,t,r,o,n,i,s,a,c,l){var p,m,d,u,g,y,x,b,w,A,$,J,Y,Q,q,He,ae=t.type;if(t.constructor!==void 0)return null;128&r.__u&&(c=!!(32&r.__u),i=[a=t.__e=r.__e]),(p=T.__b)&&p(t);e:if(typeof ae=="function"){m=s.length;try{if(w=t.props,A=ae.prototype&&ae.prototype.render,$=(p=ae.contextType)&&o[p.__c],J=p?$?$.props.value:p.__:o,r.__c?b=(d=t.__c=r.__c).__=d.__E:(A?t.__c=d=new ae(w,J):(t.__c=d=new eo(w,J),d.constructor=ae,d.render=Fg),$&&$.sub(d),d.state||(d.state={}),d.__n=o,u=d.__d=!0,d.__h=[],d._sb=[]),A&&d.__s==null&&(d.__s=d.state),A&&ae.getDerivedStateFromProps!=null&&(d.__s==d.state&&(d.__s=qe({},d.__s)),qe(d.__s,ae.getDerivedStateFromProps(w,d.__s))),g=d.props,y=d.state,d.__v=t,u)A&&ae.getDerivedStateFromProps==null&&d.componentWillMount!=null&&d.componentWillMount(),A&&d.componentDidMount!=null&&d.__h.push(d.componentDidMount);else{if(A&&ae.getDerivedStateFromProps==null&&w!==g&&d.componentWillReceiveProps!=null&&d.componentWillReceiveProps(w,J),t.__v==r.__v||!d.__e&&d.shouldComponentUpdate!=null&&d.shouldComponentUpdate(w,d.__s,J)===!1){t.__v!=r.__v&&(d.props=w,d.state=d.__s,d.__d=!1),t.__e=r.__e,t.__k=r.__k,t.__k.some(function(Be){Be&&(Be.__=t)}),ro.push.apply(d.__h,d._sb),d._sb=[],d.__h.length&&s.push(d),a=ut(r);break e}d.componentWillUpdate!=null&&d.componentWillUpdate(w,d.__s,J),A&&d.componentDidUpdate!=null&&d.__h.push(function(){d.componentDidUpdate(g,y,x)})}if(d.context=J,d.props=w,d.__P=e,d.__e=!1,Y=T.__r,Q=0,A)d.state=d.__s,d.__d=!1,Y&&Y(t),p=d.render(d.props,d.state,d.context),ro.push.apply(d.__h,d._sb),d._sb=[];else do d.__d=!1,Y&&Y(t),p=d.render(d.props,d.state,d.context),d.state=d.__s;while(d.__d&&++Q<25);d.state=d.__s,d.getChildContext!=null&&(o=qe(qe({},o),d.getChildContext())),A&&!u&&d.getSnapshotBeforeUpdate!=null&&(x=d.getSnapshotBeforeUpdate(g,y)),q=p!=null&&p.type===I&&p.key==null?Sc(p.props.children):p,a=kc(e,io(q)?q:[q],t,r,o,n,i,s,a,c,l),d.base=t.__e,t.__u&=-161,d.__h.length&&s.push(d),b&&(d.__E=d.__=null)}catch(Be){if(s.length=m,t.__v=null,c||i!=null){if(Be.then){for(t.__u|=c?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;i!=null&&(i[i.indexOf(a)]=null),t.__e=a}else if(i!=null)for(He=i.length;He--;)An(i[He])}else t.__e=r.__e;t.__k==null&&(t.__k=r.__k||[]),Be.then||Cc(t),T.__e(Be,t,r)}}else i==null&&t.__v==r.__v?(t.__k=r.__k,t.__e=r.__e):a=t.__e=$g(r.__e,t,r,o,n,i,s,c,l);return(p=T.diffed)&&p(t),128&t.__u?void 0:a}function Cc(e){e&&(e.__c&&(e.__c.__e=!0),e.__k&&e.__k.some(Cc))}function Ec(e,t,r){for(var o=0;o<r.length;o++)Rn(r[o],r[++o],r[++o]);T.__c&&T.__c(t,e),e.some(function(n){try{e=n.__h,n.__h=[],e.some(function(i){i.call(n)})}catch(i){T.__e(i,n.__v)}})}function Sc(e){return typeof e!="object"||e==null||e.__b>0?e:io(e)?e.map(Sc):e.constructor!==void 0?null:qe({},e)}function $g(e,t,r,o,n,i,s,a,c){var l,p,m,d,u,g,y,x=r.props||to,b=t.props,w=t.type;if(w=="svg"?n="http://www.w3.org/2000/svg":w=="math"?n="http://www.w3.org/1998/Math/MathML":n||(n="http://www.w3.org/1999/xhtml"),i!=null){for(l=0;l<i.length;l++)if((u=i[l])&&"setAttribute"in u==!!w&&(w?u.localName==w:u.nodeType==3)){e=u,i[l]=null;break}}if(e==null){if(w==null)return document.createTextNode(b);e=document.createElementNS(n,w,b.is&&b),a&&(T.__m&&T.__m(t,i),a=!1),i=null}if(w==null)x===b||a&&e.data==b||(e.data=b);else{if(i=w=="textarea"&&b.defaultValue!=null?null:i&&no.call(e.childNodes),!a&&i!=null)for(x={},l=0;l<e.attributes.length;l++)x[(u=e.attributes[l]).name]=u.value;for(l in x)u=x[l],l=="dangerouslySetInnerHTML"?m=u:l=="children"||l in b||l=="value"&&"defaultValue"in b||l=="checked"&&"defaultChecked"in b||Yr(e,l,null,u,n);for(l in b)u=b[l],l=="children"?d=u:l=="dangerouslySetInnerHTML"?p=u:l=="value"?g=u:l=="checked"?y=u:a&&typeof u!="function"||x[l]===u||Yr(e,l,u,x[l],n);if(p)a||m&&(p.__html==m.__html||p.__html==e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(m&&(e.innerHTML=""),kc(t.type=="template"?e.content:e,io(d)?d:[d],t,r,o,w=="foreignObject"?"http://www.w3.org/1999/xhtml":n,i,s,i?i[0]:r.__k&&ut(r,0),a,c),i!=null)for(l=i.length;l--;)An(i[l]);a&&w!="textarea"||(l="value",w=="progress"&&g==null?e.removeAttribute("value"):g!=null&&(g!==e[l]||w=="progress"&&!g||w=="option"&&g!=x[l])&&Yr(e,l,g,x[l],n),l="checked",y!=null&&y!=e[l]&&Yr(e,l,y,x[l],n))}return e}function Rn(e,t,r){try{if(typeof e=="function"){var o=typeof e.__u=="function";o&&e.__u(),o&&t==null||(e.__u=e(t))}else e.current=t}catch(n){T.__e(n,r)}}function Ac(e,t,r){var o,n;if(T.unmount&&T.unmount(e),(o=e.ref)&&(o.current&&o.current!=e.__e||Rn(o,null,t)),(o=e.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(i){T.__e(i,t)}o.base=o.__P=o.__n=null}if(o=e.__k)for(n=0;n<o.length;n++)o[n]&&Ac(o[n],t,r||typeof e.type!="function");r||An(e.__e),e.__c=e.__=e.__e=void 0}function Fg(e,t,r){return this.constructor(e,r)}function Pn(e,t,r){var o,n,i,s;t==document&&(t=document.documentElement),T.__&&T.__(e,t),n=(o=typeof r=="function")?null:r&&r.__k||t.__k,i=[],s=[],Tn(t,e=(!o&&r||t).__k=Ce(I,null,[e]),n||to,to,t.namespaceURI,!o&&r?[r]:n?null:t.firstChild?no.call(t.childNodes):null,i,!o&&r?r:n?n.__e:t.firstChild,o,s),Ec(i,e,s),e.props.children=null}no=ro.slice,T={__e:function(e,t,r,o){for(var n,i,s;t=t.__;)if((n=t.__c)&&!n.__)try{if((i=n.constructor)&&i.getDerivedStateFromError!=null&&(n.setState(i.getDerivedStateFromError(e)),s=n.__d),n.componentDidCatch!=null&&(n.componentDidCatch(e,o||{}),s=n.__d),s)return n.__E=n}catch(a){e=a}throw e}},bc=0,Lg=function(e){return e!=null&&e.constructor===void 0},eo.prototype.setState=function(e,t){var r;r=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=qe({},this.state),typeof e=="function"&&(e=e(qe({},r),this.props)),e&&qe(r,e),e!=null&&this.__v&&(t&&this._sb.push(t),mc(this))},eo.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),mc(this))},eo.prototype.render=I,Qe=[],yc=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,xc=function(e,t){return e.__v.__b-t.__v.__b},oo.__r=0,_n=Math.random().toString(8),Zr="__d"+_n,Zt="__a"+_n,wc=/(PointerCapture)$|Capture$/i,Sn=0,Cn=gc(!1),En=gc(!0),Og=0;var Ug=0;function f(e,t,r,o,n,i){t||(t={});var s,a,c=t;if("ref"in c)for(a in c={},t)a=="ref"?s=t[a]:c[a]=t[a];var l={type:e,props:c,key:r,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Ug,__i:-1,__u:0,__source:n,__self:i};if(typeof e=="function"&&(s=e.defaultProps))for(a in s)c[a]===void 0&&(c[a]=s[a]);return T.vnode&&T.vnode(l),l}var jg=["top","right","bottom","left"],zg=["tl","tr","br","bl"];function Mn({mode:e}){return f("div",{class:"coere-act-glow","data-mode":e,"aria-hidden":"true",children:[jg.map(t=>f("span",{class:"coere-act-glow-edge","data-edge":t},t)),zg.map(t=>f("span",{class:"coere-act-glow-corner","data-corner":t},t))]})}var Pt,H,In,Tc,ao=0,Dc=[],B=T,Rc=B.__b,Pc=B.__r,Mc=B.diffed,Ic=B.__c,Lc=B.unmount,Oc=B.__;function co(e,t){B.__h&&B.__h(H,e,ao||t),ao=0;var r=H.__H||(H.__H={__:[],__h:[]});return e>=r.__.length&&r.__.push({}),r.__[e]}function Ne(e){return ao=1,Gg(Bc,e)}function Gg(e,t,r){var o=co(Pt++,2);if(o.t=e,!o.__c&&(o.__=[r?r(t):Bc(void 0,t),function(a){var c=o.__N?o.__N[0]:o.__[0],l=o.t(c,a);c!==l&&(o.__N=[l,o.__[1]],o.__c.setState({}))}],o.__c=H,!H.__f)){var n=function(a,c,l){if(!o.__c.__H)return!0;var p=!1,m=o.__c.props!==a;if(o.__c.__H.__.some(function(u){if(u.__N){p=!0;var g=u.__[0];u.__=u.__N,u.__N=void 0,g!==u.__[0]&&(m=!0)}}),i){var d=i.call(this,a,c,l);return p?d||m:d}return!p||m};H.__f=!0;var i=H.shouldComponentUpdate,s=H.componentWillUpdate;H.componentWillUpdate=function(a,c,l){if(this.__e){var p=i;i=void 0,n(a,c,l),i=p}s&&s.call(this,a,c,l)},H.shouldComponentUpdate=n}return o.__N||o.__}function De(e,t){var r=co(Pt++,3);!B.__s&&On(r.__H,t)&&(r.__=e,r.u=t,H.__H.__h.push(r))}function Hc(e,t){var r=co(Pt++,4);!B.__s&&On(r.__H,t)&&(r.__=e,r.u=t,H.__h.push(r))}function Mt(e){return ao=5,Qt(function(){return{current:e}},[])}function Qt(e,t){var r=co(Pt++,7);return On(r.__H,t)&&(r.__=e(),r.__H=t,r.__h=e),r.__}function Wg(){for(var e;e=Dc.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(so),t.__h.some(Ln),t.__h=[]}catch(r){t.__h=[],B.__e(r,e.__v)}}}B.__b=function(e){H=null,Rc&&Rc(e)},B.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Oc&&Oc(e,t)},B.__r=function(e){Pc&&Pc(e),Pt=0;var t=(H=e.__c).__H;t&&(In===H?(t.__h=[],H.__h=[],t.__.some(function(r){r.__N&&(r.__=r.__N),r.u=r.__N=void 0})):(t.__h.some(so),t.__h.some(Ln),t.__h=[],Pt=0)),In=H},B.diffed=function(e){Mc&&Mc(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(Dc.push(t)!==1&&Tc===B.requestAnimationFrame||((Tc=B.requestAnimationFrame)||Vg)(Wg)),t.__H.__.some(function(r){r.u&&(r.__H=r.u,r.u=void 0)})),In=H=null},B.__c=function(e,t){t.some(function(r){try{r.__h.some(so),r.__h=r.__h.filter(function(o){return!o.__||Ln(o)})}catch(o){t.some(function(n){n.__h&&(n.__h=[])}),t=[],B.__e(o,r.__v)}}),Ic&&Ic(e,t)},B.unmount=function(e){Lc&&Lc(e);var t,r=e.__c;r&&r.__H&&(r.__H.__.some(function(o){try{so(o)}catch(n){t=n}}),r.__H=void 0,t&&B.__e(t,r.__v))};var Nc=typeof requestAnimationFrame=="function";function Vg(e){var t,r=function(){clearTimeout(o),Nc&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(r,35);Nc&&(t=requestAnimationFrame(r))}function so(e){var t=H,r=e.__c;typeof r=="function"&&(e.__c=void 0,r()),H=t}function Ln(e){var t=H;e.__c=e.__(),H=t}function On(e,t){return!e||e.length!==t.length||t.some(function(r,o){return r!==e[o]})}function Bc(e,t){return typeof t=="function"?t(e):t}function Xe(...e){return e.filter(Boolean).join(" ")}var $c=0;function Kg(e){return $c+=1,`${e}-${$c.toString(36)}`}function re(e){let[t]=Ne(()=>Kg(e));return t}var Fc={kind:"button",svg:{tag:"svg",attrs:{viewBox:"0 0 256 256",class:"coere-cori-art",style:"--coere-cori-o-seat:128px 234px;--coere-cori-o-floor:128px 237px;--coere-cori-o-tuft:124.92px 62.04px;--coere-cori-tilt-dx:-91.3px;--coere-cori-look-k:0.8;--coere-cori-u:1"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"96",cy:"88",r:"200",fx:"88",fy:"80"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.3","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.58","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"0.84","stop-color":"#485bd9"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#3f50c0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"128",cy:"173.2",r:"111.2"},children:[{tag:"stop",attrs:{offset:"0.93","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-256",y:"-256",width:"768",height:"768"},children:[{tag:"rect",attrs:{x:"-256",y:"-256",width:"768",height:"768",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-sheen"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff","stop-opacity":"0.34"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.8"},children:[]},{tag:"stop",attrs:{offset:"0.4","stop-color":"#a2adfb","stop-opacity":"0.45"},children:[]},{tag:"stop",attrs:{offset:"0.75","stop-color":"#a2adfb","stop-opacity":"0.12"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-eye",x1:"0",y1:"0",x2:"0",y2:"1"},children:[{tag:"stop",attrs:{offset:"0.55","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eef0fe"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floor"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#080e24","stop-opacity":"0.2",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:var(--coere-cori-floor-o, 0.2)"},children:[]},{tag:"stop",attrs:{offset:"0.6","stop-color":"#080e24","stop-opacity":"0.08",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:calc(var(--coere-cori-floor-o, 0.2) * 0.4)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#080e24","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floorglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#5267f7","stop-opacity":"0.3",style:"stop-opacity:var(--coere-cori-glow-o, 0.3)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#5267f7","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-lr",gradientUnits:"userSpaceOnUse",x1:"72",y1:"82",x2:"240",y2:"234"},children:[{tag:"stop",attrs:{offset:"0.38","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.92","stop-color":"#fff"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim",gradientUnits:"userSpaceOnUse",x1:"49.6",y1:"0",x2:"240",y2:"0"},children:[{tag:"stop",attrs:{offset:"0.1","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.86","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#000"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim-v",gradientUnits:"userSpaceOnUse",x1:"0",y1:"136",x2:"0",y2:"234"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.7","stop-color":"#fff"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-mask-ul",gradientUnits:"userSpaceOnUse",cx:"16",cy:"134.08",r:"117.6"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#fff","stop-opacity":"0.6"},children:[]},{tag:"stop",attrs:{offset:"0.8","stop-color":"#fff","stop-opacity":"0.13"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#fff","stop-opacity":"0"},children:[]}]},{tag:"mask",attrs:{id:"m-lr",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-lr)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim-v",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim)",mask:"url(#m-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-ul",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-ul)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z"},children:[]}]},{tag:"filter",attrs:{id:"f-core",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"12.19"},children:[]}]},{tag:"filter",attrs:{id:"f-rim",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"2.38"},children:[]}]},{tag:"filter",attrs:{id:"f-lit",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"4"},children:[]}]}]},{tag:"g",attrs:{class:"b-shadow"},children:[{tag:"g",attrs:{class:"b-shadow-pose"},children:[{tag:"ellipse",attrs:{cx:"128",cy:"237",rx:"100",ry:"8",fill:"url(#g-floor)"},children:[]},{tag:"ellipse",attrs:{cx:"132",cy:"236",rx:"62",ry:"4.96",fill:"url(#g-floorglow)"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#2d3b8e","stroke-width":"46.08",opacity:"0.5",filter:"url(#f-core)",mask:"url(#m-lr)"},children:[]},{tag:"ellipse",attrs:{cx:"138",cy:"208.2",rx:"67.2",ry:"41.28",fill:"url(#g-glow)",opacity:"0.5"},children:[]},{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#bdc5fc","stroke-width":"14",opacity:"0.7",filter:"url(#f-rim)",mask:"url(#m-rim)"},children:[]},{tag:"path",attrs:{d:"M 128 62 C 195.2 62 240 115.6 240 196 C 240 218.04 220.68 234 194 234 C 167.6 234 154.4 234 128 234 C 101.6 234 88.4 234 62 234 C 35.32 234 16 218.04 16 196 C 16 115.6 60.8 62 128 62 Z",fill:"none",stroke:"#cbd1fd","stroke-width":"12.8",opacity:"0.38",filter:"url(#f-lit)",mask:"url(#m-ul)"},children:[]},{tag:"ellipse",attrs:{cx:"92",cy:"112",rx:"74",ry:"54",transform:"rotate(-32 92 112)",fill:"url(#g-sheen)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 58.49 97.96 C 58.69 97.49 59.3 96.07 59.7 95.13 C 60.1 94.18 60.48 93.23 60.91 92.29 C 61.33 91.36 61.78 90.44 62.25 89.52 C 62.72 88.61 63.2 87.7 63.72 86.82 C 64.23 85.93 64.78 85.06 65.36 84.22 C 65.93 83.37 66.51 82.5 67.18 81.74 C 67.86 80.97 68.63 80.28 69.42 79.64 C 70.22 79 71.08 78.45 71.94 77.89 C 72.8 77.33 73.7 76.84 74.57 76.28 C 75.43 75.72 76.28 75.14 77.11 74.54 C 77.94 73.94 78.75 73.31 79.55 72.66 C 80.34 72.01 81.12 71.34 81.87 70.64 C 82.62 69.94 83.36 69.22 84.06 68.47 C 84.75 67.72 85.42 66.93 86.06 66.13 C 86.7 65.33 87.29 64.49 87.9 63.66 C 88.5 62.83 89.09 61.99 89.68 61.15 C 90.28 60.32 90.87 59.48 91.47 58.64 C 92.06 57.81 92.66 56.97 93.25 56.14 C 93.85 55.3 94.44 54.46 95.04 53.63 C 95.63 52.79 96.23 51.95 96.83 51.12 C 97.42 50.28 98.02 49.44 98.61 48.61 C 99.21 47.77 99.8 46.93 100.4 46.1 C 100.99 45.26 101.59 44.42 102.18 43.59 C 102.78 42.75 103.37 41.91 103.97 41.08 C 104.56 40.24 105.11 39.36 105.75 38.57 C 106.4 37.77 107.05 36.94 107.83 36.3 C 108.62 35.67 109.55 35.12 110.49 34.75 C 111.43 34.38 112.47 34.16 113.48 34.09 C 114.49 34.03 115.55 34.12 116.53 34.35 C 117.51 34.59 118.5 34.99 119.36 35.51 C 120.23 36.03 121.05 36.7 121.72 37.45 C 122.39 38.2 122.97 39.09 123.38 40.01 C 123.8 40.92 124.05 41.94 124.21 42.94 C 124.38 43.94 124.34 44.99 124.37 46.01 C 124.41 47.03 124.24 48.11 124.42 49.09 C 124.61 50.07 124.82 51.33 125.48 51.9 C 126.13 52.46 127.4 52.59 128.34 52.46 C 129.27 52.34 130.25 51.71 131.1 51.17 C 131.96 50.62 132.73 49.91 133.47 49.21 C 134.21 48.5 134.86 47.7 135.55 46.94 C 136.23 46.17 136.9 45.39 137.58 44.62 C 138.26 43.85 138.93 43.08 139.61 42.31 C 140.29 41.53 140.96 40.76 141.64 39.99 C 142.32 39.22 143 38.45 143.67 37.67 C 144.35 36.9 145.03 36.13 145.7 35.36 C 146.38 34.59 147.06 33.81 147.73 33.04 C 148.41 32.27 149.09 31.5 149.77 30.73 C 150.44 29.96 151.12 29.18 151.8 28.41 C 152.47 27.64 153.15 26.87 153.83 26.1 C 154.5 25.32 155.16 24.53 155.86 23.78 C 156.56 23.03 157.23 22.24 158.02 21.6 C 158.81 20.95 159.66 20.35 160.57 19.92 C 161.48 19.5 162.49 19.19 163.49 19.04 C 164.48 18.88 165.54 18.87 166.54 19.01 C 167.54 19.14 168.56 19.43 169.48 19.84 C 170.4 20.26 171.29 20.82 172.06 21.48 C 172.82 22.13 173.52 22.93 174.07 23.77 C 174.62 24.61 175.07 25.58 175.36 26.54 C 175.65 27.51 175.81 28.56 175.82 29.57 C 175.82 30.58 175.62 31.61 175.4 32.6 C 175.17 33.6 174.79 34.56 174.47 35.53 C 174.15 36.51 173.81 37.48 173.48 38.45 C 173.15 39.42 172.82 40.4 172.49 41.37 C 172.16 42.34 171.83 43.31 171.5 44.28 C 171.17 45.26 170.84 46.23 170.51 47.2 C 170.18 48.17 169.85 49.15 169.52 50.12 C 169.19 51.09 168.86 52.06 168.53 53.03 C 168.2 54.01 167.87 54.98 167.54 55.95 C 167.21 56.92 166.82 57.88 166.56 58.87 C 166.3 59.86 166.04 60.87 165.98 61.88 C 165.92 62.89 165.96 63.97 166.22 64.94 C 166.49 65.9 166.99 66.85 167.57 67.68 C 168.15 68.5 168.9 69.24 169.68 69.9 C 170.46 70.56 171.34 71.11 172.23 71.62 C 173.12 72.13 174.13 72.42 175.01 72.94 C 175.89 73.46 176.71 74.08 177.48 74.74 C 178.26 75.4 179 76.12 179.67 76.9 C 180.33 77.68 180.89 78.55 181.45 79.4 C 182.02 80.26 182.56 81.13 183.07 82.02 C 183.58 82.91 184.05 83.82 184.52 84.74 C 184.98 85.65 185.44 86.57 185.86 87.51 C 186.28 88.44 186.65 89.36 187.06 90.34 C 187.48 91.33 188.14 92.89 188.35 93.4 L 188.35 110.2 L 58.49 114.76 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"ellipse",attrs:{cx:"92",cy:"112",rx:"74",ry:"54",transform:"rotate(-32 92 112)",fill:"url(#g-sheen)"},children:[]},{tag:"circle",attrs:{cx:"115.48",cy:"40.32",r:"24.39",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"167.26",cy:"25.86",r:"25.87",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"114.23",cy:"44.19",r:"21.34",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"165.1",cy:"29.59",r:"22.64",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 97.93 79.45 C 97.17 79.61 96.12 80.04 95.23 80.35 C 94.34 80.66 93.46 80.99 92.58 81.33 C 91.71 81.67 90.84 82.02 89.98 82.38 C 89.12 82.75 88.27 83.12 87.43 83.51 C 86.58 83.9 85.75 84.31 84.92 84.72 C 84.09 85.14 83.27 85.57 82.46 86.01 C 81.65 86.45 80.85 86.9 80.05 87.37 C 79.26 87.83 78.47 88.31 77.69 88.8 C 76.91 89.29 76.14 89.79 75.38 90.31 C 74.62 90.82 73.86 91.35 73.12 91.89 C 72.37 92.43 71.63 92.98 70.9 93.55 C 70.17 94.11 69.45 94.69 68.73 95.28 C 68.02 95.87 67.31 96.47 66.62 97.08 C 65.92 97.69 65.23 98.32 64.55 98.96 C 63.87 99.59 63.19 100.24 62.53 100.91 C 61.86 101.57 61.21 102.24 60.56 102.93 C 59.91 103.61 59.27 104.31 58.64 105.02 C 58.01 105.73 57.22 106.55 56.77 107.19 C 56.33 107.83 56.1 108.28 56 108.87 C 55.89 109.45 55.96 110.15 56.16 110.71 C 56.37 111.27 56.77 111.84 57.23 112.22 C 57.68 112.6 58.32 112.9 58.9 113 C 59.49 113.1 60.19 113.04 60.75 112.84 C 61.31 112.63 61.59 112.17 62.26 111.77 C 62.93 111.37 63.92 110.87 64.75 110.44 C 65.57 110.02 66.4 109.61 67.21 109.21 C 68.03 108.81 68.84 108.43 69.64 108.04 C 70.43 107.66 71.23 107.29 72 106.92 C 72.78 106.55 73.54 106.19 74.29 105.82 C 75.04 105.45 75.78 105.08 76.5 104.7 C 77.23 104.33 77.94 103.95 78.63 103.56 C 79.33 103.16 80.01 102.77 80.68 102.35 C 81.35 101.94 82.01 101.52 82.66 101.08 C 83.31 100.64 83.94 100.19 84.57 99.73 C 85.2 99.26 85.83 98.78 86.45 98.28 C 87.07 97.78 87.68 97.27 88.29 96.74 C 88.91 96.21 89.52 95.67 90.14 95.12 C 90.76 94.56 91.38 93.99 92.01 93.42 C 92.64 92.84 93.27 92.25 93.91 91.66 C 94.56 91.06 95.21 90.46 95.88 89.86 C 96.55 89.26 97.24 88.65 97.93 88.06 C 98.63 87.46 99.46 86.73 100.08 86.27 C 100.7 85.81 101.24 85.71 101.64 85.28 C 102.05 84.84 102.37 84.22 102.5 83.63 C 102.63 83.05 102.6 82.35 102.42 81.79 C 102.24 81.22 101.86 80.63 101.42 80.22 C 100.98 79.82 100.36 79.5 99.78 79.37 C 99.2 79.24 98.69 79.29 97.93 79.45 Z",fill:"#ffffff",opacity:"0.94"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:112px 168.32px"},children:[{tag:"rect",attrs:{x:"96",width:"32",height:"57.6",rx:"16",y:"128",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{class:"b-blink",style:"transform-origin:163.2px 168.32px"},children:[{tag:"rect",attrs:{x:"147.2",width:"32",height:"57.6",rx:"16",y:"128",fill:"url(#g-eye)"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 100 140.8 L 124 156.8 L 100 172.8",fill:"none",stroke:"#ffffff","stroke-width":"12.77","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 175.2 140.8 L 151.2 156.8 L 175.2 172.8",fill:"none",stroke:"#ffffff","stroke-width":"12.77","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 95.04 160.46 C 95.04 134.68 128.96 134.68 128.96 160.46",fill:"none",stroke:"#ffffff","stroke-width":"13.44","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 146.24 160.46 C 146.24 134.68 180.16 134.68 180.16 160.46",fill:"none",stroke:"#ffffff","stroke-width":"13.44","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"108.16",width:"32",height:"49.54",rx:"16",y:"116.03",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"159.36",width:"32",height:"46.08",rx:"16",y:"117.76",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"95.36",width:"33.28",height:"59.9",rx:"16.64",y:"126.85",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"148.16",width:"30.08",height:"28.8",rx:"15.04",y:"135.49",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 95.04 161.95 C 95.04 180.26 128.96 180.26 128.96 161.95",fill:"none",stroke:"#ffffff","stroke-width":"11.56","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 146.24 161.95 C 146.24 180.26 180.16 180.26 180.16 161.95",fill:"none",stroke:"#ffffff","stroke-width":"11.56","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"smile"},children:[{tag:"path",attrs:{d:"M 123.52 203.52 C 130.56 212.48 144.64 212.48 151.68 203.52",fill:"none",stroke:"#243074","stroke-width":"8.32","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"ellipse",attrs:{cx:"137.6",cy:"209.72",rx:"10.14",ry:"11.83",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"open"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-open"},children:[{tag:"path",attrs:{d:"M 120.7 201.49 C 120.7 225.48 154.5 225.48 154.5 201.49 Z"},children:[]}]},{tag:"path",attrs:{d:"M 120.7 201.49 C 120.7 225.48 154.5 225.48 154.5 201.49 Z",fill:"#243074",stroke:"#243074","stroke-width":"4.58","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"137.6",cy:"219.57",rx:"10.48",ry:"7.1",fill:"#7585f9","clip-path":"url(#clip-mouth-open)"},children:[]}]},{tag:"g",attrs:{"data-mouth":"hmm"},children:[{tag:"ellipse",attrs:{cx:"144.36",cy:"207.46",rx:"7.6",ry:"8.45",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:137.6px 203.52px"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-talk"},children:[{tag:"path",attrs:{d:"M 123.52 208.48 A 14.08 9.01 0 1 0 151.68 208.48 A 14.08 9.01 0 1 0 123.52 208.48 Z"},children:[]}]},{tag:"path",attrs:{d:"M 123.52 208.48 A 14.08 9.01 0 1 0 151.68 208.48 A 14.08 9.01 0 1 0 123.52 208.48 Z",fill:"#243074",stroke:"#243074","stroke-width":"4.58","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"137.6",cy:"214.78",rx:"9.86",ry:"4.06",fill:"#7585f9","clip-path":"url(#clip-mouth-talk)"},children:[]}]}]},{tag:"g",attrs:{"data-mouth":"wavy"},children:[{tag:"path",attrs:{d:"M 121.41 204.52 C 122.08 204 124.11 201.8 125.46 201.4 C 126.81 201 128.15 201.39 129.5 202.13 C 130.85 202.87 132.2 204.85 133.55 205.81 C 134.9 206.77 136.25 207.9 137.6 207.9 C 138.95 207.9 140.3 206.77 141.65 205.81 C 143 204.85 144.35 202.87 145.7 202.13 C 147.05 201.39 148.39 201 149.74 201.4 C 151.09 201.8 153.12 204 153.79 204.52",fill:"none",stroke:"#243074","stroke-width":"7.65","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"sleep"},children:[{tag:"ellipse",attrs:{cx:"137.6",cy:"207.46",rx:"5.63",ry:"4.79",fill:"#243074"},children:[]}]}]}]}]}]},{tag:"g",attrs:{"data-fx":"sparkles"},children:[{tag:"path",attrs:{class:"b-spark b-spark-1",d:"M 230 35 Q 233.36 52.64 251 56 Q 233.36 59.36 230 77 Q 226.64 59.36 209 56 Q 226.64 52.64 230 35 Z",fill:"#5267f7"},children:[]}]},{tag:"g",attrs:{"data-fx":"question"},children:[{tag:"g",attrs:{class:"b-q"},children:[{tag:"path",attrs:{d:"M 216 26.2 C 216 13.6 241.8 13.6 241.8 26.2 C 241.8 35.8 228.9 35.8 228.9 46.6",fill:"none",stroke:"#5267f7","stroke-width":"11","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"circle",attrs:{cx:"228.9",cy:"58.6",r:"6.82",fill:"#5267f7"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"zzz"},children:[{tag:"g",attrs:{class:"b-z b-z-1"},children:[{tag:"path",attrs:{d:"M 206 18 H 236 L 206 48 H 236",fill:"none",stroke:"#5267f7","stroke-width":"10","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"work"},children:[{tag:"g",attrs:{class:"b-key b-key-1"},children:[{tag:"rect",attrs:{x:"196",y:"14",width:"40",height:"32",rx:"9.6",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"205.6",y:"21.68",width:"20.8",height:"6.4",rx:"3.2",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"path",attrs:{class:"b-fly b-fly-1",d:"M 30 34 Q 32.88 49.12 48 52 Q 32.88 54.88 30 70 Q 27.12 54.88 12 52 Q 27.12 49.12 30 34 Z",fill:"#5267f7",style:"--coere-cori-fly-x:-10px"},children:[]}]}]}};var Uc={kind:"full",svg:{tag:"svg",attrs:{viewBox:"0 0 256 256",class:"coere-cori-art",style:"--coere-cori-o-seat:128px 220px;--coere-cori-o-floor:128px 223px;--coere-cori-o-tuft:126px 66.02px;--coere-cori-tilt-dx:-72px;--coere-cori-look-k:1;--coere-cori-u:1"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"100",cy:"92",r:"178",fx:"92",fy:"84"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.3","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.58","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"0.84","stop-color":"#485bd9"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#3f50c0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"128",cy:"150.02",r:"84.02"},children:[{tag:"stop",attrs:{offset:"0.92","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-256",y:"-256",width:"768",height:"768"},children:[{tag:"rect",attrs:{x:"-256",y:"-256",width:"768",height:"768",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-sheen"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff","stop-opacity":"0.34"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.8"},children:[]},{tag:"stop",attrs:{offset:"0.4","stop-color":"#a2adfb","stop-opacity":"0.45"},children:[]},{tag:"stop",attrs:{offset:"0.75","stop-color":"#a2adfb","stop-opacity":"0.12"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-blush"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#bdc5fc"},children:[]},{tag:"stop",attrs:{offset:"0.5","stop-color":"#bdc5fc","stop-opacity":"0.7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#bdc5fc","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-eye",x1:"0",y1:"0",x2:"0",y2:"1"},children:[{tag:"stop",attrs:{offset:"0.55","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eef0fe"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floor"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#080e24","stop-opacity":"0.2",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:var(--coere-cori-floor-o, 0.2)"},children:[]},{tag:"stop",attrs:{offset:"0.6","stop-color":"#080e24","stop-opacity":"0.08",style:"stop-color:var(--coere-cori-floor, #080e24);stop-opacity:calc(var(--coere-cori-floor-o, 0.2) * 0.4)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#080e24","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-floorglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#5267f7","stop-opacity":"0.3",style:"stop-opacity:var(--coere-cori-glow-o, 0.3)"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#5267f7","stop-opacity":"0"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-lr",gradientUnits:"userSpaceOnUse",x1:"83",y1:"86",x2:"218",y2:"220"},children:[{tag:"stop",attrs:{offset:"0.38","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.92","stop-color":"#fff"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim",gradientUnits:"userSpaceOnUse",x1:"65",y1:"0",x2:"218",y2:"0"},children:[{tag:"stop",attrs:{offset:"0.1","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.86","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#000"},children:[]}]},{tag:"linearGradient",attrs:{id:"g-mask-rim-v",gradientUnits:"userSpaceOnUse",x1:"0",y1:"124",x2:"0",y2:"220"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.7","stop-color":"#fff"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-mask-ul",gradientUnits:"userSpaceOnUse",cx:"38",cy:"128.56",r:"94.5"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#fff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#fff","stop-opacity":"0.6"},children:[]},{tag:"stop",attrs:{offset:"0.8","stop-color":"#fff","stop-opacity":"0.13"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#fff","stop-opacity":"0"},children:[]}]},{tag:"mask",attrs:{id:"m-lr",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-lr)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim-v",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-rim",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-rim)",mask:"url(#m-rim-v)"},children:[]}]},{tag:"mask",attrs:{id:"m-ul",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"256",height:"256"},children:[{tag:"rect",attrs:{width:"256",height:"256",fill:"url(#g-mask-ul)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z"},children:[]}]},{tag:"filter",attrs:{id:"f-core",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"12.19"},children:[]}]},{tag:"filter",attrs:{id:"f-rim",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"1.7"},children:[]}]},{tag:"filter",attrs:{id:"f-lit",x:"-20%",y:"-20%",width:"140%",height:"140%","color-interpolation-filters":"sRGB"},children:[{tag:"feGaussianBlur",attrs:{stdDeviation:"4"},children:[]}]}]},{tag:"g",attrs:{class:"b-shadow"},children:[{tag:"g",attrs:{class:"b-shadow-pose"},children:[{tag:"ellipse",attrs:{cx:"128",cy:"223",rx:"84",ry:"10",fill:"url(#g-floor)"},children:[]},{tag:"ellipse",attrs:{cx:"132",cy:"222",rx:"52.08",ry:"6.2",fill:"url(#g-floorglow)"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#2d3b8e","stroke-width":"46.08",opacity:"0.5",filter:"url(#f-core)",mask:"url(#m-lr)"},children:[]},{tag:"ellipse",attrs:{cx:"138",cy:"196.9",rx:"54",ry:"36.96",fill:"url(#g-glow)",opacity:"0.5"},children:[]},{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#bdc5fc","stroke-width":"10",opacity:"0.7",filter:"url(#f-rim)",mask:"url(#m-rim)"},children:[]},{tag:"path",attrs:{d:"M 128 66 C 182 66 218 113.2 218 184 C 218 204.88 201.2 220 178 220 C 158 220 148 220 128 220 C 108 220 98 220 78 220 C 54.8 220 38 204.88 38 184 C 38 113.2 74 66 128 66 Z",fill:"none",stroke:"#cbd1fd","stroke-width":"12.8",opacity:"0.38",filter:"url(#f-lit)",mask:"url(#m-ul)"},children:[]},{tag:"ellipse",attrs:{cx:"96",cy:"112",rx:"62",ry:"46",transform:"rotate(-32 96 112)",fill:"url(#g-sheen)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 81.27 89.4 C 81.42 89.07 81.87 88.07 82.18 87.4 C 82.48 86.73 82.76 86.05 83.08 85.39 C 83.4 84.73 83.74 84.08 84.08 83.44 C 84.43 82.79 84.78 82.14 85.16 81.52 C 85.54 80.89 85.95 80.28 86.37 79.68 C 86.79 79.08 87.2 78.47 87.68 77.92 C 88.17 77.37 88.71 76.87 89.28 76.41 C 89.84 75.95 90.43 75.51 91.06 75.15 C 91.69 74.78 92.39 74.54 93.05 74.2 C 93.7 73.87 94.34 73.51 94.97 73.14 C 95.6 72.76 96.22 72.36 96.82 71.94 C 97.42 71.52 98.01 71.08 98.57 70.61 C 99.14 70.15 99.68 69.66 100.21 69.15 C 100.73 68.63 101.23 68.09 101.7 67.54 C 102.18 66.98 102.61 66.39 103.04 65.79 C 103.47 65.2 103.86 64.58 104.27 63.97 C 104.68 63.36 105.09 62.75 105.5 62.14 C 105.9 61.53 106.31 60.92 106.72 60.31 C 107.13 59.7 107.54 59.09 107.94 58.48 C 108.35 57.87 108.76 57.26 109.17 56.65 C 109.57 56.05 109.98 55.44 110.39 54.83 C 110.8 54.22 111.21 53.61 111.61 53 C 112.02 52.39 112.43 51.78 112.84 51.17 C 113.25 50.56 113.61 49.91 114.06 49.34 C 114.52 48.77 114.99 48.18 115.57 47.74 C 116.15 47.31 116.83 46.95 117.52 46.73 C 118.2 46.51 118.97 46.4 119.69 46.42 C 120.41 46.44 121.16 46.58 121.83 46.83 C 122.51 47.08 123.17 47.47 123.73 47.93 C 124.28 48.39 124.78 48.97 125.15 49.58 C 125.52 50.19 125.79 50.9 125.95 51.61 C 126.12 52.31 126.12 53.06 126.14 53.79 C 126.16 54.53 126 55.27 126.07 55.99 C 126.14 56.71 126.14 57.61 126.53 58.11 C 126.93 58.6 127.77 58.95 128.43 58.97 C 129.08 58.99 129.84 58.56 130.47 58.21 C 131.11 57.86 131.69 57.38 132.23 56.89 C 132.77 56.4 133.23 55.82 133.71 55.27 C 134.2 54.72 134.66 54.15 135.13 53.59 C 135.61 53.03 136.08 52.47 136.55 51.91 C 137.03 51.35 137.5 50.79 137.97 50.23 C 138.45 49.67 138.92 49.11 139.4 48.55 C 139.87 47.99 140.34 47.43 140.82 46.87 C 141.29 46.31 141.76 45.75 142.24 45.19 C 142.71 44.63 143.18 44.07 143.66 43.51 C 144.13 42.95 144.6 42.39 145.08 41.83 C 145.55 41.27 146.02 40.71 146.5 40.15 C 146.97 39.59 147.41 39 147.92 38.47 C 148.43 37.94 148.94 37.39 149.54 36.99 C 150.14 36.58 150.82 36.25 151.51 36.04 C 152.2 35.83 152.96 35.73 153.68 35.75 C 154.4 35.76 155.15 35.9 155.83 36.14 C 156.51 36.38 157.19 36.74 157.76 37.18 C 158.33 37.62 158.86 38.18 159.27 38.78 C 159.68 39.37 160.01 40.06 160.21 40.76 C 160.42 41.45 160.51 42.21 160.49 42.94 C 160.47 43.66 160.27 44.39 160.08 45.1 C 159.89 45.8 159.58 46.48 159.34 47.17 C 159.09 47.86 158.84 48.55 158.59 49.24 C 158.34 49.93 158.1 50.62 157.85 51.31 C 157.6 52 157.35 52.69 157.1 53.38 C 156.85 54.07 156.61 54.76 156.36 55.45 C 156.11 56.14 155.86 56.83 155.61 57.52 C 155.37 58.21 155.12 58.9 154.87 59.59 C 154.62 60.28 154.36 60.96 154.12 61.66 C 153.89 62.35 153.61 63.04 153.44 63.75 C 153.28 64.46 153.1 65.2 153.13 65.91 C 153.15 66.63 153.31 67.38 153.59 68.04 C 153.87 68.7 154.3 69.34 154.79 69.87 C 155.28 70.4 155.9 70.83 156.52 71.22 C 157.13 71.61 157.82 71.89 158.47 72.22 C 159.13 72.55 159.82 72.81 160.44 73.18 C 161.07 73.55 161.68 73.96 162.23 74.44 C 162.78 74.92 163.26 75.5 163.72 76.06 C 164.19 76.62 164.6 77.23 165.02 77.83 C 165.44 78.43 165.86 79.03 166.23 79.66 C 166.61 80.29 166.88 80.87 167.26 81.61 C 167.65 82.35 168.33 83.69 168.55 84.11 L 168.55 96.11 L 81.27 101.4 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"ellipse",attrs:{cx:"96",cy:"112",rx:"62",ry:"46",transform:"rotate(-32 96 112)",fill:"url(#g-sheen)"},children:[]},{tag:"circle",attrs:{cx:"120.38",cy:"50.48",r:"17.16",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"154.9",cy:"40.29",r:"18.2",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"119.56",cy:"52.99",r:"13.86",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"153.5",cy:"42.71",r:"14.7",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 99.74 83.15 C 99.27 83.29 98.79 83.57 98.31 83.79 C 97.84 84.01 97.36 84.24 96.9 84.47 C 96.43 84.7 95.96 84.94 95.5 85.18 C 95.03 85.42 94.57 85.67 94.12 85.92 C 93.66 86.17 93.21 86.43 92.75 86.7 C 92.3 86.96 91.85 87.23 91.41 87.5 C 90.96 87.78 90.52 88.06 90.08 88.35 C 89.64 88.63 89.21 88.92 88.77 89.22 C 88.34 89.52 87.91 89.82 87.48 90.13 C 87.05 90.43 86.63 90.75 86.2 91.06 C 85.78 91.38 85.36 91.71 84.95 92.04 C 84.53 92.37 84.12 92.7 83.71 93.04 C 83.3 93.38 82.89 93.73 82.48 94.08 C 82.08 94.43 81.68 94.79 81.28 95.15 C 80.88 95.51 80.49 95.88 80.09 96.25 C 79.7 96.62 79.31 97 78.93 97.39 C 78.54 97.77 78.16 98.16 77.78 98.55 C 77.4 98.95 77.02 99.35 76.65 99.76 C 76.27 100.16 75.9 100.57 75.53 100.99 C 75.17 101.4 74.8 101.83 74.44 102.25 C 74.08 102.68 73.72 103.11 73.37 103.55 C 73.01 103.99 72.66 104.43 72.31 104.88 C 71.96 105.33 71.62 105.79 71.28 106.25 C 70.93 106.71 70.51 107.18 70.26 107.64 C 70.01 108.1 69.8 108.53 69.76 108.99 C 69.71 109.46 69.8 109.99 69.99 110.42 C 70.19 110.84 70.54 111.26 70.91 111.53 C 71.29 111.8 71.8 111.99 72.27 112.03 C 72.73 112.08 73.27 111.99 73.69 111.79 C 74.11 111.6 74.41 111.21 74.8 110.88 C 75.19 110.54 75.62 110.14 76.03 109.78 C 76.43 109.42 76.84 109.06 77.25 108.72 C 77.66 108.37 78.07 108.03 78.48 107.69 C 78.89 107.36 79.29 107.03 79.7 106.7 C 80.1 106.37 80.51 106.05 80.91 105.74 C 81.31 105.42 81.71 105.1 82.11 104.79 C 82.51 104.48 82.9 104.17 83.29 103.87 C 83.68 103.56 84.07 103.26 84.46 102.95 C 84.84 102.65 85.23 102.35 85.61 102.05 C 85.99 101.75 86.36 101.45 86.74 101.15 C 87.11 100.85 87.48 100.55 87.85 100.25 C 88.21 99.95 88.58 99.65 88.94 99.35 C 89.3 99.05 89.66 98.75 90.02 98.45 C 90.38 98.15 90.73 97.84 91.09 97.54 C 91.44 97.23 91.8 96.93 92.15 96.62 C 92.5 96.31 92.85 96.01 93.2 95.7 C 93.55 95.39 93.9 95.08 94.25 94.77 C 94.61 94.45 94.96 94.14 95.31 93.83 C 95.66 93.52 96.02 93.2 96.37 92.89 C 96.73 92.58 97.09 92.26 97.45 91.95 C 97.81 91.64 98.18 91.32 98.54 91.01 C 98.91 90.7 99.28 90.39 99.66 90.08 C 100.03 89.77 100.41 89.47 100.8 89.16 C 101.18 88.86 101.58 88.57 101.97 88.27 C 102.35 87.97 102.82 87.74 103.1 87.37 C 103.37 86.99 103.57 86.49 103.62 86.03 C 103.68 85.56 103.6 85.02 103.41 84.6 C 103.23 84.17 102.89 83.74 102.51 83.47 C 102.14 83.19 101.63 82.99 101.17 82.94 C 100.71 82.89 100.22 83.01 99.74 83.15 Z",fill:"#ffffff",opacity:"0.94"},children:[]},{tag:"circle",attrs:{cx:"113.33",cy:"83",r:"4.2",fill:"#ffffff",opacity:"0.85"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{class:"b-cheeks",opacity:"0.55"},children:[{tag:"ellipse",attrs:{cx:"93",cy:"173",rx:"13",ry:"7.5",fill:"url(#g-blush)"},children:[]},{tag:"ellipse",attrs:{cx:"173.08",cy:"173",rx:"11.96",ry:"7.5",fill:"url(#g-blush)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:117px 157.6px"},children:[{tag:"rect",attrs:{x:"107",width:"20",height:"38",rx:"10",y:"134",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"107",width:"20",height:"38",rx:"10",y:"131",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{class:"b-blink",style:"transform-origin:151px 157.28px"},children:[{tag:"rect",attrs:{x:"141.8",width:"18.4",height:"36.4",rx:"9.2",y:"134.8",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"141.8",width:"18.4",height:"36.4",rx:"9.2",y:"131.8",fill:"url(#g-eye)"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 109.5 140 L 124.5 150 L 109.5 160",fill:"none",stroke:"#ffffff","stroke-width":"7.98","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 158.5 140 L 143.5 150 L 158.5 160",fill:"none",stroke:"#ffffff","stroke-width":"7.98","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 106.4 152.29 C 106.4 136.18 127.6 136.18 127.6 152.29",fill:"none",stroke:"#ffffff","stroke-width":"8.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 140.4 152.29 C 140.4 136.18 161.6 136.18 161.6 152.29",fill:"none",stroke:"#ffffff","stroke-width":"8.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"114.6",width:"20",height:"32.68",rx:"10",y:"126.66",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"114.6",width:"20",height:"32.68",rx:"10",y:"123.66",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"149.4",width:"18.4",height:"29.12",rx:"9.2",y:"128.44",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"149.4",width:"18.4",height:"29.12",rx:"9.2",y:"125.44",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"106.6",width:"20.8",height:"39.52",rx:"10.4",y:"133.24",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"106.6",width:"20.8",height:"39.52",rx:"10.4",y:"130.24",fill:"url(#g-eye)"},children:[]},{tag:"rect",attrs:{x:"142.35",width:"17.3",height:"18.2",rx:"8.65",y:"139.53",fill:"#313f98",opacity:"0.32"},children:[]},{tag:"rect",attrs:{x:"142.35",width:"17.3",height:"18.2",rx:"8.65",y:"136.53",fill:"url(#g-eye)"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 106.4 153.54 C 106.4 164.98 127.6 164.98 127.6 153.54",fill:"none",stroke:"#ffffff","stroke-width":"7.22","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 140.4 153.28 C 140.4 164.73 161.6 164.73 161.6 153.28",fill:"none",stroke:"#ffffff","stroke-width":"7.22","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"smile"},children:[{tag:"path",attrs:{d:"M 127.5 182 C 130.75 186.6 137.25 186.6 140.5 182",fill:"none",stroke:"#243074","stroke-width":"4.4","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"ellipse",attrs:{cx:"134",cy:"184.86",rx:"4.68",ry:"5.46",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"open"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-open"},children:[{tag:"path",attrs:{d:"M 126.2 181.06 C 126.2 192.14 141.8 192.14 141.8 181.06 Z"},children:[]}]},{tag:"path",attrs:{d:"M 126.2 181.06 C 126.2 192.14 141.8 192.14 141.8 181.06 Z",fill:"#243074",stroke:"#243074","stroke-width":"2.42","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"134",cy:"189.41",rx:"4.84",ry:"3.28",fill:"#7585f9","clip-path":"url(#clip-mouth-open)"},children:[]}]},{tag:"g",attrs:{"data-mouth":"hmm"},children:[{tag:"ellipse",attrs:{cx:"137.12",cy:"183.82",rx:"3.51",ry:"3.9",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:134px 182px"},children:[{tag:"clipPath",attrs:{id:"clip-mouth-talk"},children:[{tag:"path",attrs:{d:"M 127.5 184.29 A 6.5 4.16 0 1 0 140.5 184.29 A 6.5 4.16 0 1 0 127.5 184.29 Z"},children:[]}]},{tag:"path",attrs:{d:"M 127.5 184.29 A 6.5 4.16 0 1 0 140.5 184.29 A 6.5 4.16 0 1 0 127.5 184.29 Z",fill:"#243074",stroke:"#243074","stroke-width":"2.42","stroke-linejoin":"round"},children:[]},{tag:"ellipse",attrs:{cx:"134",cy:"187.2",rx:"4.55",ry:"1.87",fill:"#7585f9","clip-path":"url(#clip-mouth-talk)"},children:[]}]}]},{tag:"g",attrs:{"data-mouth":"wavy"},children:[{tag:"path",attrs:{d:"M 126.53 183 C 126.84 182.76 127.77 181.74 128.39 181.56 C 129.02 181.37 129.64 181.56 130.26 181.9 C 130.89 182.24 131.51 183.15 132.13 183.6 C 132.75 184.04 133.38 184.56 134 184.56 C 134.62 184.56 135.25 184.04 135.87 183.6 C 136.49 183.15 137.11 182.24 137.74 181.9 C 138.36 181.56 138.98 181.37 139.61 181.56 C 140.23 181.74 141.16 182.76 141.47 183",fill:"none",stroke:"#243074","stroke-width":"4.05","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-mouth":"sleep"},children:[{tag:"ellipse",attrs:{cx:"134",cy:"183.82",rx:"2.6",ry:"2.21",fill:"#243074"},children:[]}]}]}]}]}]},{tag:"g",attrs:{"data-fx":"sparkles"},children:[{tag:"path",attrs:{class:"b-spark b-spark-1",d:"M 36 82 Q 38.24 93.76 50 96 Q 38.24 98.24 36 110 Q 33.76 98.24 22 96 Q 33.76 93.76 36 82 Z",fill:"#5267f7"},children:[]},{tag:"path",attrs:{class:"b-spark b-spark-2",d:"M 224 88 Q 225.6 96.4 234 98 Q 225.6 99.6 224 108 Q 222.4 99.6 214 98 Q 222.4 96.4 224 88 Z",fill:"#8695f9"},children:[]},{tag:"path",attrs:{class:"b-spark b-spark-3",d:"M 204 36.5 Q 205.2 42.8 211.5 44 Q 205.2 45.2 204 51.5 Q 202.8 45.2 196.5 44 Q 202.8 42.8 204 36.5 Z",fill:"#5267f7"},children:[]}]},{tag:"g",attrs:{"data-fx":"thought"},children:[{tag:"g",attrs:{class:"b-dot b-dot-1"},children:[{tag:"circle",attrs:{cx:"190",cy:"62",r:"5.5",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"188.24",cy:"60.13",r:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-dot b-dot-2"},children:[{tag:"circle",attrs:{cx:"208",cy:"42",r:"7.5",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"205.6",cy:"39.45",r:"2.4",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-dot b-dot-3"},children:[{tag:"circle",attrs:{cx:"232",cy:"19",r:"10",fill:"#5267f7"},children:[]},{tag:"circle",attrs:{cx:"228.8",cy:"15.6",r:"3.2",fill:"#ffffff",opacity:"0.85"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"question"},children:[{tag:"g",attrs:{class:"b-q"},children:[{tag:"path",attrs:{d:"M 206 34.84 C 206 23.92 228.36 23.92 228.36 34.84 C 228.36 43.16 217.18 43.16 217.18 52.52",fill:"none",stroke:"#5267f7","stroke-width":"7.5","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"circle",attrs:{cx:"217.18",cy:"62.92",r:"4.65",fill:"#5267f7"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"zzz"},children:[{tag:"g",attrs:{class:"b-z b-z-1"},children:[{tag:"path",attrs:{d:"M 188 62 H 201 L 188 75 H 201",fill:"none",stroke:"#5267f7","stroke-width":"5","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{class:"b-z b-z-2"},children:[{tag:"path",attrs:{d:"M 212 28 H 231 L 212 47 H 231",fill:"none",stroke:"#8695f9","stroke-width":"6","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]}]},{tag:"g",attrs:{"data-fx":"work"},children:[{tag:"g",attrs:{class:"b-key b-key-1"},children:[{tag:"rect",attrs:{x:"166",y:"50",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"171.28",y:"54.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-key b-key-2"},children:[{tag:"rect",attrs:{x:"194",y:"34",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"199.28",y:"38.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"g",attrs:{class:"b-key b-key-3"},children:[{tag:"rect",attrs:{x:"222",y:"54",width:"22",height:"17.6",rx:"5.28",fill:"#5267f7"},children:[]},{tag:"rect",attrs:{x:"227.28",y:"58.22",width:"11.44",height:"3.52",rx:"1.76",fill:"#ffffff",opacity:"0.85"},children:[]}]},{tag:"path",attrs:{class:"b-fly b-fly-1",d:"M 36 80 Q 37.92 90.08 48 92 Q 37.92 93.92 36 104 Q 34.08 93.92 24 92 Q 34.08 90.08 36 80 Z",fill:"#5267f7",style:"--coere-cori-fly-x:-10px"},children:[]},{tag:"path",attrs:{class:"b-fly b-fly-2",d:"M 58 44 Q 59.28 50.72 66 52 Q 59.28 53.28 58 60 Q 56.72 53.28 50 52 Q 56.72 50.72 58 44 Z",fill:"#8695f9",style:"--coere-cori-fly-x:-8px"},children:[]},{tag:"path",attrs:{class:"b-fly b-fly-3",d:"M 226 99 Q 227.44 106.56 235 108 Q 227.44 109.44 226 117 Q 224.56 109.44 217 108 Q 224.56 106.56 226 99 Z",fill:"#5267f7",style:"--coere-cori-fly-x:10px"},children:[]}]}]}};var jc={kind:"icon",svg:{tag:"svg",attrs:{viewBox:"0 0 24 24",class:"coere-cori-art",style:"--coere-cori-o-seat:12px 22.6px;--coere-cori-o-floor:12px 22.6px;--coere-cori-o-tuft:11.69px 6.6px;--coere-cori-tilt-dx:-8.53px;--coere-cori-look-k:0.12;--coere-cori-u:0.094"},children:[{tag:"defs",attrs:{},children:[{tag:"radialGradient",attrs:{id:"g-body",gradientUnits:"userSpaceOnUse",cx:"9",cy:"10",r:"16",fx:"8.4",fy:"9.4"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#9ba7fa"},children:[]},{tag:"stop",attrs:{offset:"0.32","stop-color":"#7182f8"},children:[]},{tag:"stop",attrs:{offset:"0.62","stop-color":"#5267f7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#485bd9"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tuft-fade",gradientUnits:"userSpaceOnUse",cx:"12",cy:"17.13",r:"10.53"},children:[{tag:"stop",attrs:{offset:"0.92","stop-color":"#000"},children:[]},{tag:"stop",attrs:{offset:"0.99","stop-color":"#fff"},children:[]}]},{tag:"mask",attrs:{id:"m-tuft",maskUnits:"userSpaceOnUse",x:"-24",y:"-24",width:"72",height:"72"},children:[{tag:"rect",attrs:{x:"-24",y:"-24",width:"72",height:"72",fill:"url(#g-tuft-fade)"},children:[]}]},{tag:"clipPath",attrs:{id:"c-tuft"},children:[{tag:"use",attrs:{href:"#tuft-shape"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipcap"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#eaedfe","stop-opacity":"0.96"},children:[]},{tag:"stop",attrs:{offset:"0.42","stop-color":"#eaedfe","stop-opacity":"0.62"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#eaedfe","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-glow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#a2adfb","stop-opacity":"0.7"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#a2adfb","stop-opacity":"0"},children:[]}]},{tag:"radialGradient",attrs:{id:"g-tipglow"},children:[{tag:"stop",attrs:{offset:"0","stop-color":"#ffffff"},children:[]},{tag:"stop",attrs:{offset:"0.45","stop-color":"#ffffff","stop-opacity":"0.75"},children:[]},{tag:"stop",attrs:{offset:"1","stop-color":"#ffffff","stop-opacity":"0"},children:[]}]},{tag:"clipPath",attrs:{id:"c-body"},children:[{tag:"path",attrs:{d:"M 12 6.6 C 18.36 6.6 22.6 11.64 22.6 19.2 C 22.6 21.17 20.67 22.6 18 22.6 C 15.6 22.6 14.4 22.6 12 22.6 C 9.6 22.6 8.4 22.6 6 22.6 C 3.33 22.6 1.4 21.17 1.4 19.2 C 1.4 11.64 5.64 6.6 12 6.6 Z"},children:[]}]}]},{tag:"g",attrs:{class:"b-figure"},children:[{tag:"g",attrs:{class:"b-pose"},children:[{tag:"g",attrs:{class:"b-mood"},children:[{tag:"path",attrs:{d:"M 12 6.6 C 18.36 6.6 22.6 11.64 22.6 19.2 C 22.6 21.17 20.67 22.6 18 22.6 C 15.6 22.6 14.4 22.6 12 22.6 C 9.6 22.6 8.4 22.6 6 22.6 C 3.33 22.6 1.4 21.17 1.4 19.2 C 1.4 11.64 5.64 6.6 12 6.6 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-body)"},children:[{tag:"ellipse",attrs:{cx:"12.6",cy:"21.4",rx:"8",ry:"2.8",fill:"url(#g-glow)"},children:[]}]},{tag:"g",attrs:{mask:"url(#m-tuft)"},children:[{tag:"g",attrs:{class:"b-tuft"},children:[{tag:"g",attrs:{class:"b-tuft-mood"},children:[{tag:"g",attrs:{class:"b-tuft-pose"},children:[{tag:"path",attrs:{id:"tuft-shape",d:"M 5.15 10.06 C 5.17 10.01 5.23 9.88 5.26 9.8 C 5.3 9.71 5.34 9.63 5.38 9.54 C 5.42 9.46 5.46 9.37 5.51 9.29 C 5.55 9.21 5.6 9.13 5.65 9.05 C 5.7 8.97 5.75 8.89 5.81 8.82 C 5.86 8.74 5.92 8.66 5.98 8.59 C 6.05 8.53 6.12 8.47 6.2 8.41 C 6.27 8.36 6.36 8.31 6.43 8.26 C 6.51 8.21 6.59 8.16 6.66 8.1 C 6.74 8.04 6.81 7.99 6.89 7.93 C 6.96 7.87 7.03 7.81 7.1 7.75 C 7.17 7.68 7.24 7.62 7.31 7.55 C 7.37 7.49 7.44 7.42 7.5 7.35 C 7.56 7.28 7.62 7.2 7.68 7.13 C 7.74 7.06 7.79 6.98 7.85 6.91 C 7.91 6.83 7.96 6.76 8.02 6.68 C 8.08 6.61 8.13 6.53 8.19 6.46 C 8.25 6.38 8.3 6.31 8.36 6.23 C 8.41 6.16 8.47 6.08 8.53 6.01 C 8.58 5.93 8.64 5.86 8.7 5.78 C 8.75 5.71 8.81 5.63 8.87 5.56 C 8.92 5.48 8.98 5.41 9.04 5.33 C 9.09 5.26 9.15 5.18 9.21 5.11 C 9.26 5.03 9.32 4.96 9.38 4.88 C 9.43 4.81 9.49 4.73 9.55 4.66 C 9.6 4.58 9.66 4.51 9.72 4.43 C 9.78 4.36 9.84 4.29 9.91 4.23 C 9.98 4.17 10.06 4.12 10.15 4.08 C 10.23 4.04 10.32 4.01 10.41 4 C 10.51 3.99 10.6 3.99 10.69 4 C 10.79 4.01 10.88 4.04 10.96 4.07 C 11.05 4.11 11.13 4.16 11.2 4.22 C 11.27 4.28 11.34 4.35 11.39 4.42 C 11.45 4.5 11.49 4.59 11.52 4.68 C 11.55 4.76 11.56 4.86 11.57 4.95 C 11.58 5.04 11.58 5.14 11.58 5.23 C 11.58 5.33 11.57 5.43 11.6 5.51 C 11.63 5.6 11.67 5.7 11.74 5.74 C 11.81 5.78 11.93 5.76 12.02 5.73 C 12.1 5.71 12.18 5.65 12.26 5.59 C 12.33 5.54 12.4 5.47 12.47 5.4 C 12.53 5.34 12.59 5.27 12.66 5.2 C 12.72 5.13 12.78 5.06 12.85 4.99 C 12.91 4.92 12.97 4.85 13.04 4.78 C 13.1 4.71 13.16 4.64 13.23 4.57 C 13.29 4.5 13.35 4.43 13.42 4.36 C 13.48 4.3 13.54 4.23 13.61 4.16 C 13.67 4.09 13.73 4.02 13.8 3.95 C 13.86 3.88 13.92 3.81 13.98 3.74 C 14.05 3.67 14.11 3.6 14.17 3.53 C 14.24 3.46 14.3 3.39 14.36 3.32 C 14.43 3.25 14.49 3.18 14.55 3.12 C 14.62 3.05 14.68 2.97 14.74 2.91 C 14.81 2.85 14.88 2.78 14.96 2.73 C 15.04 2.69 15.13 2.65 15.22 2.62 C 15.31 2.6 15.41 2.58 15.5 2.58 C 15.59 2.58 15.69 2.59 15.78 2.61 C 15.87 2.64 15.96 2.67 16.04 2.72 C 16.12 2.76 16.19 2.82 16.26 2.88 C 16.33 2.95 16.39 3.02 16.43 3.1 C 16.48 3.18 16.52 3.27 16.55 3.36 C 16.57 3.45 16.59 3.54 16.59 3.63 C 16.59 3.73 16.57 3.82 16.56 3.91 C 16.54 4 16.51 4.09 16.48 4.18 C 16.45 4.27 16.42 4.36 16.39 4.45 C 16.36 4.54 16.34 4.63 16.31 4.72 C 16.28 4.81 16.25 4.9 16.22 4.99 C 16.19 5.08 16.16 5.17 16.14 5.25 C 16.11 5.34 16.08 5.43 16.05 5.52 C 16.02 5.61 15.99 5.7 15.96 5.79 C 15.94 5.88 15.91 5.97 15.88 6.06 C 15.85 6.15 15.82 6.24 15.79 6.33 C 15.77 6.42 15.74 6.51 15.73 6.6 C 15.72 6.69 15.73 6.79 15.75 6.88 C 15.77 6.97 15.8 7.06 15.85 7.14 C 15.89 7.22 15.96 7.29 16.03 7.36 C 16.1 7.42 16.18 7.47 16.25 7.52 C 16.33 7.57 16.42 7.61 16.5 7.65 C 16.58 7.7 16.66 7.75 16.74 7.81 C 16.81 7.87 16.88 7.93 16.94 8 C 17 8.07 17.07 8.14 17.12 8.22 C 17.17 8.29 17.22 8.38 17.27 8.46 C 17.32 8.54 17.37 8.62 17.41 8.7 C 17.45 8.78 17.48 8.86 17.53 8.95 C 17.57 9.05 17.66 9.23 17.68 9.28 L 17.68 10.82 L 5.15 11.59 Z",fill:"url(#g-body)"},children:[]},{tag:"g",attrs:{"clip-path":"url(#c-tuft)"},children:[{tag:"circle",attrs:{cx:"10.69",cy:"4.61",r:"2.23",fill:"url(#g-tipcap)"},children:[]},{tag:"circle",attrs:{cx:"15.74",cy:"3.28",r:"2.37",fill:"url(#g-tipcap)"},children:[]}]},{tag:"g",attrs:{class:"b-tips",opacity:"0"},children:[{tag:"circle",attrs:{cx:"10.56",cy:"5",r:"1.93",fill:"url(#g-tipglow)"},children:[]},{tag:"circle",attrs:{cx:"15.52",cy:"3.65",r:"2.04",fill:"url(#g-tipglow)"},children:[]}]}]}]}]}]},{tag:"path",attrs:{d:"M 8.52 9.04 C 8.46 9.07 8.28 9.15 8.16 9.2 C 8.05 9.26 7.93 9.32 7.82 9.39 C 7.71 9.45 7.6 9.51 7.49 9.58 C 7.38 9.65 7.28 9.72 7.17 9.8 C 7.07 9.87 6.96 9.95 6.86 10.02 C 6.76 10.1 6.66 10.19 6.56 10.27 C 6.46 10.35 6.37 10.44 6.27 10.53 C 6.18 10.62 6.09 10.71 6 10.81 C 5.9 10.91 5.82 11 5.73 11.1 C 5.64 11.21 5.52 11.36 5.47 11.42",fill:"none",stroke:"#ffffff","stroke-width":"1.35","stroke-linecap":"round",opacity:"0.92"},children:[]},{tag:"g",attrs:{class:"b-face"},children:[{tag:"g",attrs:{"data-eyes":"open"},children:[{tag:"g",attrs:{class:"b-blink",style:"transform-origin:13px 16px"},children:[{tag:"rect",attrs:{x:"10",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"14",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]}]}]},{tag:"g",attrs:{"data-eyes":"squeeze"},children:[{tag:"path",attrs:{d:"M 9.7 13.7 L 11.9 15.5 L 9.7 17.3",fill:"none",stroke:"#ffffff","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"},children:[]},{tag:"path",attrs:{d:"M 16.3 13.7 L 14.1 15.5 L 16.3 17.3",fill:"none",stroke:"#ffffff","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"},children:[]}]},{tag:"g",attrs:{"data-eyes":"happy"},children:[{tag:"path",attrs:{d:"M 8 16 V 15 A 2 2 0 0 1 12 15 V 16 H 11 V 15 A 1 1 0 0 0 9 15 V 16 Z M 14 16 V 15 A 2 2 0 0 1 18 15 V 16 H 17 V 15 A 1 1 0 0 0 15 15 V 16 Z",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"up"},children:[{tag:"rect",attrs:{x:"11",y:"12",width:"2",height:"4",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"15",y:"12",width:"2",height:"4",rx:"1",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"unsure"},children:[{tag:"rect",attrs:{x:"10",y:"13",width:"2",height:"5",rx:"1",fill:"#ffffff"},children:[]},{tag:"rect",attrs:{x:"14",y:"13",width:"2",height:"3",rx:"1",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-eyes":"closed"},children:[{tag:"path",attrs:{d:"M 9 15 H 10 V 16 H 12 V 15 H 13 V 16.2 A 1 1 0 0 1 12 17 H 10 A 1 1 0 0 1 9 16.2 Z M 13.5 15 H 14.5 V 16 H 16.5 V 15 H 17.5 V 16.2 A 1 1 0 0 1 16.5 17 H 14.5 A 1 1 0 0 1 13.5 16.2 Z",fill:"#ffffff"},children:[]}]},{tag:"g",attrs:{"data-mouth":"o"},children:[{tag:"rect",attrs:{x:"12.2",y:"19.4",width:"1.6",height:"1.6",rx:"0.8",fill:"#243074"},children:[]}]},{tag:"g",attrs:{"data-mouth":"talk"},children:[{tag:"g",attrs:{class:"b-talk",style:"transform-origin:13px 19.5px"},children:[{tag:"rect",attrs:{x:"12",y:"19.2",width:"2",height:"2",rx:"1",fill:"#243074"},children:[]}]}]}]}]}]}]}]}};function qg(e,t){return e.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g,(r,o,n)=>`url(${o}#${n}-${t}${o})`)}function er(e,t){let r={};for(let[o,n]of Object.entries(e))o==="id"?r[o]=`${n}-${t}`:(o==="href"||o==="xlink:href")&&n.startsWith("#")?r[o]=`${n}-${t}`:r[o]=qg(n,t);return r}function tr(e,t){return e.children.map((r,o)=>Ce(r.tag,{key:o,...er(r.attrs,t)},...tr(r,t)))}function zc(e,t){let r={...er(e.svg.attrs,t),"aria-hidden":"true",focusable:"false"};return Ce("svg",r,...tr(e.svg,t))}function Xg(e){return e<=32?jc:e<64?Fc:Uc}function It(e){let{size:t,controller:r,mood:o="idle",label:n="Cori",tappable:i=!1}=e,s=re("coere-cori"),a=Mt(null),c=Xg(t),l=Qt(()=>zc(c,s),[c,s]);Hc(()=>{let d=a.current;return r&&d?r.attach(d):void 0},[r]);let p=r!==void 0,m=n===null?{"aria-hidden":"true"}:{role:"img","aria-label":n};return Ce("span",{ref:a,class:Xe("coere-cori",e.class),"data-art":c.kind,"data-mood":p?void 0:o,"data-tappable":i&&p?"":void 0,style:{width:`${t}px`,height:`${t}px`},onClick:i&&r?()=>r.react("cori"):void 0,...m},l)}function Gc(e){return{delay:4e3+e()*3e3,double:e()<.2}}var Wc=e=>Number.isFinite(e)?Math.max(-1,Math.min(1,e)):0;function Vc(e){return e?{x:Wc(e.x)*5+0,y:Wc(e.y)*5+0}:{x:0,y:0}}var Jg="(prefers-reduced-motion: reduce)",Yg={matches:!1,addEventListener:()=>{},removeEventListener:()=>{}};function Kc(e=globalThis){return e.matchMedia?e.matchMedia(Jg):Yg}var qc={cori:820,hop:620,wiggle:480,wake:520,blink:150};var Zg=540,pt={talk:760,happy:1400,unsure:1600,coriFace:120,coriHappy:1200};function Xc(e,t){switch(e){case"talk":return t?[{at:0,mood:"talking"},{at:pt.talk,mood:"rest"}]:[{at:0,mood:"rest"}];case"happy":return[t?{at:0,mood:"happy",move:"hop"}:{at:0,mood:"happy"},{at:pt.happy,mood:"rest"}];case"unsure":return[{at:0,mood:"confused"},{at:pt.unsure,mood:"rest"}];case"cori":return t?[{at:0,mood:"poked",move:"cori"},{at:pt.coriFace,mood:"happy"},{at:pt.coriFace+pt.coriHappy,mood:"rest"}]:[{at:0,mood:"happy"},{at:pt.coriHappy,mood:"rest"}]}}function Jc(e){return e?[{at:0,mood:"rest",move:"wake"},{at:Zg,move:"blink"}]:[{at:0,mood:"rest"}]}function Yc(e,t){let r=new Map,o=null,n=()=>{if(o!==null&&e.clearTimeout(o),o=null,r.size===0||!t())return;let s=Math.min(...[...r.values()].map(a=>a.at));o=e.setTimeout(i,Math.max(0,s-e.now()))},i=()=>{o=null;let s=e.now(),a=[...r].filter(([,c])=>c.at<=s).sort((c,l)=>c[1].at-l[1].at);for(let[c,l]of a)r.get(c)===l&&(r.delete(c),l.run());n()};return{at(s,a,c){r.set(s,{at:e.now()+a,run:c}),n()},drop(...s){for(let a of s)r.delete(a);n()},clear(){r.clear(),n()},arm:n}}var tb={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),now:()=>performance.now()},rb={hidden:!1,addEventListener:()=>{},removeEventListener:()=>{}},ob=["cori","hop","wiggle","wake"],nb=["cori","hop","wiggle","wake","blink"],lo=e=>`is-${e}`;function Zc(e){let t=e.clock??tb,r=e.random??Math.random,o=e.motion??Kc(),n=e.page??(typeof document>"u"?rb:document),i=new Set,s="idle",a="idle",c={x:0,y:0},l=!1,p=()=>!o.matches,m=S=>i.forEach(S),d=Yc(t,()=>!l&&!n.hidden&&i.size>0),{at:u,drop:g}=d,y=S=>{a=S,m(oe=>oe.setAttribute("data-mood",S))},x=S=>{c=Vc(S),m(b)},b=S=>{S.style.setProperty("--coere-cori-look-x",`${c.x}px`),S.style.setProperty("--coere-cori-look-y",`${c.y}px`)},w=()=>m(S=>S.classList.remove(...nb.map(lo).filter(oe=>S.classList.contains(oe)))),A=S=>{if(!p())return;let oe=(S==="blink"?[S]:ob).map(lo),he=[...i].filter(Ee=>oe.some(rd=>Ee.classList.contains(rd)));he.forEach(Ee=>Ee.classList.remove(...oe)),he[0]&&he[0].getBoundingClientRect(),m(Ee=>Ee.classList.add(lo(S))),u(S==="blink"?"blink-end":"move-end",qc[S],()=>m(Ee=>Ee.classList.remove(lo(S))))},$=(S,oe=0)=>{let he=S[oe];if(!he)return;he.mood&&y(he.mood==="rest"?s:he.mood),he.move&&A(he.move);let Ee=S[oe+1];Ee?u("step",Ee.at-he.at,()=>$(S,oe+1)):g("step")},J=()=>{a!=="sleeping"&&A("blink")},Y=()=>{if(!p())return g("blink");let{delay:S,double:oe}=Gc(r);u("blink",S,()=>{J(),oe&&u("blink-again",260,J),Y()})},Q=()=>{if(s!=="idle")return g("sleep");u("sleep",e.sleepAfterMs,()=>{s="sleeping",g("step"),y("sleeping")})},q=()=>{Y(),Q()},He=()=>{d.clear(),y(s),w(),x(null)},ae=()=>{if(m(S=>S.toggleAttribute("data-alive",p())),p())return Y();g("blink","blink-again","blink-end","move-end","look"),w(),x(null)},Be=()=>{n.hidden?He():i.size>0&&q()};return o.addEventListener("change",ae),n.addEventListener("visibilitychange",Be),{react(S){l||(s="idle",Q(),i.size>0&&$(Xc(S,p())))},rest(S){l||(s=S,g("step"),y(S),(S==="thinking"||S==="working")&&A("wiggle"),Q())},look(S){l||!p()||(x(S),S?u("look",1200,()=>x(null)):g("look"))},poke(){l||(s==="sleeping"&&(s="idle",$(Jc(p()))),Q())},attach(S){if(l)return()=>{};let oe=i.size===0;return i.add(S),S.setAttribute("data-mood",a),S.toggleAttribute("data-alive",p()),b(S),oe&&!n.hidden&&q(),()=>{i.delete(S)&&i.size===0&&He()}},dispose(){l||(l=!0,d.clear(),o.removeEventListener("change",ae),n.removeEventListener("visibilitychange",Be),i.clear())}}}function ib({size:e=16,label:t,children:r,class:o,...n}){let i=t?{role:"img","aria-label":t}:{"aria-hidden":"true"};return f("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":"1.75","stroke-linecap":"round","stroke-linejoin":"round",focusable:"false",class:o?`coere-icon ${String(o)}`:"coere-icon",...i,...n,children:r})}function O(e,t){let r=o=>f(ib,{...o,children:t()});return r.displayName=e,r}var Nn=O("CursorIcon",()=>f("path",{d:"M6 4.5l12 6.2-5.4 1.5-2.3 5.3z"})),Qc=O("ArrowUpRightIcon",()=>f("path",{d:"M8 16L16.5 7.5M9.5 7.5h7v7"})),el=O("GlobeIcon",()=>f(I,{children:[f("circle",{cx:"12",cy:"12",r:"7.75"}),f("path",{d:"M4.5 12h15M12 4.25c2.2 2.3 3.2 4.9 3.2 7.75S14.2 17.45 12 19.75C9.8 17.45 8.8 14.85 8.8 12S9.8 6.55 12 4.25z"})]})),sb=O("PenIcon",()=>f("path",{d:"M14.5 6l3.5 3.5M5 19l1-4.5L15.8 4.7a1.5 1.5 0 012.1 0l1.4 1.4a1.5 1.5 0 010 2.1L9.5 18z"})),ab=O("SendPlaneIcon",()=>f("path",{d:"M19.5 4.5L10.5 13.5M19.5 4.5l-5.5 15-3.5-6-6-3.5z"})),cb=O("CalendarIcon",()=>f(I,{children:[f("rect",{x:"4.5",y:"5.5",width:"15",height:"14",rx:"2.25"}),f("path",{d:"M4.5 10h15M8.5 3.5v4M15.5 3.5v4"})]})),lb=O("SaveIcon",()=>f("path",{d:"M4.5 13.5v4.25c0 .97.78 1.75 1.75 1.75h11.5c.97 0 1.75-.78 1.75-1.75V13.5M8.5 10l2.5 2.5 4.5-5"})),db=O("OpenIcon",()=>f(I,{children:[f("rect",{x:"4.5",y:"5",width:"15",height:"14",rx:"2.25"}),f("path",{d:"M4.5 9h15"})]}));function Lt(e){return!0}var ue=e=>t=>{Lt(t)&&e()};var ub={working:["take_over","go_to_chat","stop"],waiting:["take_over","go_to_chat","stop"],taken_over:["hand_back","stop"],result:["go_to_chat"]},pb={take_over:C.TAKE_OVER,hand_back:C.HAND_BACK,go_to_chat:C.GO_TO_CHAT,stop:C.STOP};function fb(e){return e.mode==="taken_over"?C.YOU_HAVE_CONTROL:e.mode==="waiting"?C.WAITING_FOR_YOU:e.mode==="result"?e.result??"":e.step||C.WORKING_ON_TASK}function Dn({model:e,onPress:t}){let r=e.worker===null?C.CONTROLLED:C.controlledWorker(e.worker);return f("div",{class:"coere-act-bar",role:"region","aria-label":r,"data-mode":e.mode,children:[f("p",{class:"coere-act-bar-head",children:[f(Nn,{size:13}),f("span",{children:r})]}),f("div",{class:"coere-act-bar-row",children:[f(mb,{resting:e.mode==="working"||e.mode==="waiting"}),f("p",{class:"coere-act-bar-step",role:"status","aria-live":"polite",children:fb(e)}),f("div",{class:"coere-act-bar-buttons",children:ub[e.mode].map(o=>f("button",{type:"button",class:"coere-act-bar-btn","data-button":o,onClick:ue(()=>t(o)),children:[f("span",{children:pb[o]}),o==="go_to_chat"&&f(Qc,{size:14})]},o))})]})]})}function mb({resting:e}){let t=Qt(()=>Zc({sleepAfterMs:Number.MAX_SAFE_INTEGER}),[]);return De(()=>t.rest(e?"working":"idle"),[t,e]),De(()=>()=>t.dispose(),[t]),f(It,{size:28,controller:t,label:null,class:"coere-act-bar-cori"})}function tl({size:e=16,label:t,class:r}){let o=f("svg",{class:"coere-spinner-svg",viewBox:"0 0 24 24",width:e,height:e,fill:"none",stroke:"currentColor","stroke-width":"2.5","stroke-linecap":"round","aria-hidden":"true",focusable:"false",children:[f("circle",{cx:"12",cy:"12",r:"9",opacity:"0.18"}),f("path",{d:"M21 12a9 9 0 00-9-9"})]});return t?f("span",{class:Xe("coere-spinner",r),role:"status",children:[o,f("span",{class:"coere-sr-only",children:t})]}):f("span",{class:Xe("coere-spinner",r),children:o})}function D({variant:e="secondary",size:t="md",icon:r,iconEnd:o,loading:n=!1,block:i=!1,type:s="button",disabled:a,class:c,children:l,...p}){return f("button",{type:s,class:Xe("coere-btn",`coere-btn--${e}`,`coere-btn--${t}`,i&&"coere-btn--block",c),disabled:!!a||n,"aria-busy":n||void 0,...p,children:[n?f(tl,{size:t==="sm"?13:15}):r,l!=null&&f("span",{class:"coere-btn-label",children:l}),o]})}var rl=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
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
`;var ol=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 65">
<defs><linearGradient id="fold" x1="50%" y1="8.6%" x2="50%" y2="100%"><stop offset="0" stop-color="#1a237e" stop-opacity=".2"/><stop offset="1" stop-color="#1a237e" stop-opacity=".02"/></linearGradient></defs>
<path fill="#4285f4" d="M29.375 0H4.406C1.983 0 0 1.994 0 4.432v56.136C0 63.006 1.983 65 4.406 65h38.188C45.017 65 47 63.006 47 60.568V17.727L29.375 0z"/>
<path fill="url(#fold)" d="M30.664 16.431L47 32.858V17.727z"/>
<path fill="#f1f1f1" d="M11.75 47.273h23.5v-2.955h-23.5zm0 5.909h17.625v-2.955H11.75zm0-20.682v2.955h23.5V32.5zm0 8.864h23.5v-2.955h-23.5z"/>
<path fill="#a1c2fa" d="M29.375 0v13.295c0 2.449 1.972 4.432 4.406 4.432H47z"/>
</svg>
`;var nl=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66">
<path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
<path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
<path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
<path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
<path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
</svg>`;var sl=["svg","g","path","circle","ellipse","rect","line","polyline","polygon","defs","linearGradient","radialGradient","stop","clipPath","mask"],yb=new Map([...sl,"viewBox","gradientTransform","gradientUnits","preserveAspectRatio","clipPathUnits","maskUnits","maskContentUnits","spreadMethod"].map(e=>[e.toLowerCase(),e])),xb=new Set(sl);function il(e){return yb.get(e.toLowerCase())??e}function wb(e,t){let r=e.toLowerCase();if(r.startsWith("on")||r.startsWith("xmlns")||r==="style")return!1;if(r==="href"||r==="xlink:href")return t.startsWith("#");let o=t.match(/url\(([^)]*)\)/gi);return!o||o.every(n=>/^url\(\s*['"]?#/i.test(n))}function al(e){let t=il(e.localName);if(!xb.has(t))return null;let r={};for(let n of Array.from(e.attributes))wb(n.name,n.value)&&(r[il(n.name)]=n.value);let o=[];for(let n of Array.from(e.children)){let i=al(n);i&&o.push(i)}return{tag:t,attrs:r,children:o}}function cl(e){if(!e.trim())return null;let t=new DOMParser().parseFromString(e,"image/svg+xml"),r=t.documentElement;return!r||r.localName.toLowerCase()!=="svg"||t.getElementsByTagName("parsererror").length>0?null:al(r)}var vb={gmail:nl,calendar:rl,docs:ol},Hn=new Map;function kb(e){if(!Hn.has(e)){let t=cl(vb[e]);Hn.set(e,t&&t.children.length>0?t:null)}return Hn.get(e)??null}function ft({icon:e,size:t=16}){let r=re("coere-site"),o=e==="globe"?null:kb(e);if(!o)return f(el,{size:t,class:"coere-act-site-globe"});let{width:n,height:i,...s}=o.attrs;return Ce("svg",{...er(s,r),class:"coere-act-site","data-site":e,width:t,height:t,"aria-hidden":"true",focusable:"false"},...tr(o,r))}var Bn=e=>`f${e.id}`;function ll({model:e,onAnswer:t}){let r=e.form,o=re("coere-act-form"),[n,i]=Ne({});De(()=>i({}),[e.step]);let s=m=>ue(()=>t(m,n)),a=(m,d)=>i(u=>{let g={...u};return d===m.value?delete g[Bn(m)]:g[Bn(m)]=d,g}),c=new Set([...r.filled,...r.blank,...r.yours].map(m=>m.page)).size>1,l=(m,d)=>d.length===0?null:f("section",{class:"coere-act-form-part","aria-label":m,children:[f("h3",{class:"coere-act-form-head",children:[m," ",f("span",{class:"coere-act-form-count",children:d.length})]}),d.map(u=>f(_b,{row:u,value:n[Bn(u)]??u.value,pages:c,copy:r.mode==="copy",onEdit:g=>a(u,g)},u.id))]}),p=r.mode==="fill"?F.FILL_IN:r.canSubmit?F.SUBMIT:F.GO_ON;return f("section",{class:"coere-act-card coere-act-review coere-act-form","aria-labelledby":o,children:[f("p",{id:o,class:"coere-act-card-title",children:[f(ft,{icon:e.site.icon}),f("span",{children:r.mode==="review"?F.REVIEW_TITLE:r.mode==="fill"?F.FILL_TITLE:F.COPY_TITLE})]}),f("p",{class:"coere-act-card-line",children:e.line}),r.errors.length>0&&f("div",{class:"coere-act-form-errors",role:"alert",children:[f("strong",{children:F.PAGE_ERRORS}),f("ul",{children:r.errors.map(m=>f("li",{children:m},m))})]}),f("div",{class:"coere-act-form-body",children:[l(F.SECTION_FILLED,r.filled),l(F.SECTION_BLANK,r.blank),l(F.SECTION_YOURS,r.yours)]}),f("div",{class:"coere-act-actions",children:[r.mode!=="copy"&&f(D,{variant:"primary",size:"sm",onClick:s("allow"),children:p}),r.mode==="review"&&f(D,{size:"sm",onClick:s(0),children:F.NOT_NOW}),r.mode==="fill"&&e.allowForTask&&f(D,{size:"sm",onClick:s("allow_task"),children:C.ALLOW_FOR_TASK}),r.mode==="copy"&&f(D,{variant:"primary",size:"sm",onClick:s(0),children:F.DONE}),f(D,{variant:"quiet",size:"sm",class:"coere-act-stop",onClick:s("stop"),children:C.STOP})]})]})}function _b({row:e,value:t,pages:r,copy:o,onEdit:n}){let i=re("coere-act-form-field"),[s,a]=Ne(!1),c=t.length>60||t.includes(`
`),l=d=>n(d.currentTarget.value),p;e.editable?e.options.length>0&&!e.multiple?p=f("select",{id:i,class:"coere-act-input",value:t,onChange:l,children:[f("option",{value:"",children:""}),e.options.map(d=>f("option",{value:d,children:d},d))]}):c?p=f("textarea",{id:i,class:"coere-act-input",rows:4,value:t,onInput:l}):p=f("input",{id:i,class:"coere-act-input",type:"text",value:t,onInput:l}):p=f("span",{class:"coere-act-field-value",children:t});let m=ue(()=>{navigator.clipboard?.writeText(t).then(()=>a(!0))});return f("div",{class:"coere-act-form-row","data-long":c?"":void 0,children:[f("label",{class:"coere-act-field-label",for:e.editable?i:void 0,children:[e.label,e.required&&f("span",{class:"coere-act-form-req",children:[" ",F.REQUIRED]}),r&&f("span",{class:"coere-act-form-page",children:[" ",F.pageOf(e.page)]})]}),f("div",{class:"coere-act-form-value",children:[p,o&&t!==""&&f("button",{type:"button",class:"coere-act-chip",onClick:m,children:s?F.COPIED:F.COPY})]}),e.note&&f("p",{class:"coere-act-form-note",children:e.note})]})}function $n({model:e,onAnswer:t}){return e.form?f(ll,{model:e,onAnswer:t}):f(Cb,{model:e,onAnswer:t})}function Cb({model:e,onAnswer:t}){let r=re("coere-act-review"),[o,n]=Ne({});De(()=>n({}),[e.step]);let i=s=>ue(()=>t(s,o));return f("section",{class:"coere-act-card coere-act-review","aria-labelledby":r,children:[f("p",{id:r,class:"coere-act-card-title",children:[f(ft,{icon:e.site.icon}),f("span",{children:e.line})]}),e.reason&&f("p",{class:"coere-act-card-line",children:e.reason}),e.fields.length>0&&f("div",{class:"coere-act-fields",children:e.fields.map(s=>f(Sb,{field:s,value:o[s.label]??s.value,onEdit:a=>n(c=>Eb(c,s,a))},s.label))}),e.choices.length>0?f("div",{class:"coere-act-chips",role:"group","aria-labelledby":r,children:e.choices.map((s,a)=>f("button",{type:"button",class:"coere-act-chip",onClick:i(a),children:s},s))}):null,f("div",{class:"coere-act-actions",children:[e.choices.length===0&&f(D,{variant:"primary",size:"sm",onClick:i("allow"),children:C.ALLOW}),e.choices.length===0&&e.allowForTask&&f(D,{size:"sm",onClick:i("allow_task"),children:C.ALLOW_FOR_TASK}),f(D,{variant:"quiet",size:"sm",class:"coere-act-stop",onClick:i("stop"),children:C.STOP})]})]})}function Eb(e,t,r){let o={...e};return r===t.value?delete o[t.label]:o[t.label]=r,o}function Sb({field:e,value:t,onEdit:r}){let o=re("coere-act-field"),n=e.label===C.FIELD_LABELS.body;if(!e.editable)return f("div",{class:"coere-act-field","data-long":n?"":void 0,children:[f("span",{class:"coere-act-field-label",children:e.label}),f("span",{class:"coere-act-field-value",children:e.value})]});let i=s=>r(s.currentTarget.value);return f("div",{class:"coere-act-field is-editable","data-long":n?"":void 0,children:[f("label",{class:"coere-act-field-label",for:o,children:e.label}),n?f("textarea",{id:o,class:"coere-act-input",rows:5,value:t,onInput:i}):f("input",{id:o,class:"coere-act-input",type:"text",value:t,onInput:i})]})}function dl({label:e,size:t="md",type:r="button",class:o,children:n,...i}){return f("button",{type:r,"aria-label":e,title:e,class:Xe("coere-icon-btn",`coere-icon-btn--${t}`,o),...i,children:n})}var EP=O("HomeIcon",()=>f(I,{children:[f("path",{d:"M4.25 10.5L12 4.25l7.75 6.25"}),f("path",{d:"M6.25 9v9.25c0 .69.56 1.25 1.25 1.25h9c.69 0 1.25-.56 1.25-1.25V9"}),f("path",{d:"M10 19.5v-4.25c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v4.25"})]})),Ab=O("SearchIcon",()=>f(I,{children:[f("circle",{cx:"11",cy:"11",r:"6.5"}),f("path",{d:"M20 20l-4.35-4.35"})]})),ul=O("CloseIcon",()=>f("path",{d:"M6.5 6.5l11 11M17.5 6.5l-11 11"})),SP=O("ChevronUpIcon",()=>f("path",{d:"M6.5 14.5L12 9l5.5 5.5"})),AP=O("ChevronDownIcon",()=>f("path",{d:"M6.5 9.5L12 15l5.5-5.5"})),TP=O("ChevronRightIcon",()=>f("path",{d:"M9.5 6.5L15 12l-5.5 5.5"})),RP=O("ChevronLeftIcon",()=>f("path",{d:"M14.5 6.5L9 12l5.5 5.5"})),PP=O("ExternalLinkIcon",()=>f(I,{children:[f("path",{d:"M14 4.5h5.5V10M19.5 4.5L11.5 12.5"}),f("path",{d:"M17.5 13.5v4.25a1.75 1.75 0 01-1.75 1.75h-9.5a1.75 1.75 0 01-1.75-1.75v-9.5A1.75 1.75 0 016.25 6.5h4.25"})]})),MP=O("MinimizeIcon",()=>f("path",{d:"M4.5 19.5L10 14M5.5 14H10v4.5M19.5 4.5L14 10M18.5 10H14V5.5"}));var pl=[["mode_rewrite",C.MODE_REWRITE],["mode_improve",C.MODE_IMPROVE],["mode_grammar",C.MODE_GRAMMAR]];function fl({onPress:e}){let t=Mt(null);return De(()=>{t.current?.querySelector("button")?.focus()},[]),f("div",{class:"coere-act-modes",ref:t,onKeyDown:o=>{let n=["1","2","3"].indexOf(o.key);n<0||!Lt(o)||(o.preventDefault(),o.stopPropagation(),e(pl[n][0]))},children:pl.map(([o,n],i)=>f(D,{size:"sm",variant:i===0?"primary":"secondary",onClick:ue(()=>e(o)),children:[f("kbd",{"aria-hidden":"true",children:i+1}),n]},o))})}function ml({onPress:e}){return f("div",{class:"coere-act-review",children:[f(It,{size:20,mood:"happy",label:null}),f(D,{variant:"primary",size:"sm",onClick:ue(()=>e("looks_good")),children:C.LOOKS_GOOD}),f(D,{size:"sm",onClick:ue(()=>e("go_back")),children:C.GO_BACK})]})}function Tb(e,t){let r=e.ownerDocument,o=r.createElement("textarea");o.value=t,o.setAttribute("aria-hidden","true"),o.style.cssText="position:fixed;left:-9999px;top:0;opacity:0",(e.parentElement??r.body).append(o),o.select();let n=r.execCommand?.("copy")===!0;o.remove(),n||r.defaultView?.navigator.clipboard?.writeText(t).catch(()=>{})}function hl({text:e,edits:t,onPress:r}){let o=n=>{Lt(n)&&(Tb(n.currentTarget,e),r("copy"))};return f(I,{children:[f("div",{class:"coere-act-rewrite-text",children:[f("p",{class:"coere-act-rewrite-now",children:e}),t.length>0&&f("ul",{class:"coere-act-edits",children:t.map((n,i)=>f("li",{class:"coere-act-edit",children:[n.old&&f("s",{children:n.old}),n.now&&f("ins",{children:n.now})]},i))})]}),f("div",{class:"coere-act-actions",children:f(D,{variant:"primary",size:"sm",onClick:o,children:C.COPY})})]})}function uo({model:e,mac:t,onPress:r}){let o=re("coere-act-rewrite"),n=a=>ue(()=>r(a)),i=a=>{a.key==="Escape"&&Lt(a)&&(a.stopPropagation(),r(e.state==="review"?"go_back":"close"))},s=e.mode?C.modeName(e.mode):C.MENU_REWRITE;return e.state==="review"?f("section",{class:"coere-act-card coere-act-rewrite","aria-label":s,"data-state":"review",onKeyDown:i,children:f(ml,{onPress:r})}):e.state==="picker"?f("section",{class:"coere-act-card coere-act-rewrite","aria-labelledby":o,"data-state":"picker",onKeyDown:i,children:[f("p",{id:o,class:"coere-act-card-title",children:C.MENU_REWRITE}),f(fl,{onPress:r})]}):f("section",{class:"coere-act-card coere-act-rewrite","aria-labelledby":o,"data-state":e.state,onKeyDown:i,children:[f("div",{class:"coere-act-rewrite-head",children:[f(It,{size:20,mood:e.state==="working"?"working":"happy",label:null}),f("p",{id:o,class:"coere-act-card-title",role:"status",children:Rb(e,t)}),f(dl,{label:C.CLOSE,size:"sm",onClick:n("close"),children:f(ul,{})})]}),e.state==="preview"&&f(I,{children:[f("div",{class:"coere-act-rewrite-text",children:[f("s",{class:"coere-act-rewrite-was",children:e.original}),f("p",{class:"coere-act-rewrite-now",children:e.rewrite})]}),f("div",{class:"coere-act-chips",children:[f("button",{type:"button",class:"coere-act-chip",onClick:n("shorter"),children:C.SHORTER}),f("button",{type:"button",class:"coere-act-chip",onClick:n("more_formal"),children:C.MORE_FORMAL})]}),f("div",{class:"coere-act-actions",children:[f(D,{variant:"primary",size:"sm",onClick:n("accept"),children:C.ACCEPT}),f(D,{size:"sm",onClick:n("try_again"),children:C.TRY_AGAIN})]})]}),(e.state==="paste"||e.state==="copied")&&f(hl,{text:e.rewrite,edits:e.edits??[],onPress:r}),e.state==="check"&&f("div",{class:"coere-act-actions",children:[f(D,{variant:"primary",size:"sm",onClick:n("yes"),children:C.YES}),f(D,{size:"sm",onClick:n("undo"),children:C.UNDO})]}),e.state==="done"&&e.undoLeft!==null&&e.undoLeft>0&&f("div",{class:"coere-act-actions",children:f(D,{size:"sm",onClick:n("undo"),children:C.UNDO})})]})}function Rb(e,t){switch(e.state){case"working":return e.original?C.REWRITING:C.pressCopy(t);case"preview":return C.REWRITING;case"copied":return C.copiedPaste(t);case"paste":return C.pasteLine(t);case"check":return C.DID_IT_GO_IN;case"done":return C.REWRITTEN;case"none":return C.NOTHING_TO_CHANGE;case"picker":case"review":return C.MENU_REWRITE}}var Pb=O("CheckIcon",()=>f("path",{d:"M5 12.5l4.5 4.5L19 7.5"})),ZP=O("AlertIcon",()=>f(I,{children:[f("path",{d:"M10.4 4.9a1.85 1.85 0 013.2 0l6.95 12.1a1.85 1.85 0 01-1.6 2.75H5.05a1.85 1.85 0 01-1.6-2.75z"}),f("path",{d:"M12 9.75v3.5M12 16.25v.01"})]})),QP=O("InfoIcon",()=>f(I,{children:[f("circle",{cx:"12",cy:"12",r:"8.5"}),f("path",{d:"M12 11.25v4.75M12 8v.01"})]})),eM=O("ClockIcon",()=>f(I,{children:[f("circle",{cx:"12",cy:"12",r:"8.5"}),f("path",{d:"M12 7.5V12l3 2"})]})),Mb=O("EyeIcon",()=>f(I,{children:[f("path",{d:"M2.75 12S6.1 5.75 12 5.75 21.25 12 21.25 12 17.9 18.25 12 18.25 2.75 12 2.75 12z"}),f("circle",{cx:"12",cy:"12",r:"2.75"})]}));var Ib=220,Lb={review:52,picker:96,working:64,none:52};function Fn({state:e,mac:t,onPress:r,drag:o=0,onDrag:n}){let[i,s]=Ne(o),a=Mt(null),c=u=>{let g=u.currentTarget;if(u.button!==0||u.target.closest("button, input, textarea, a"))return;let y=g.ownerDocument.defaultView??window,x={width:y.innerWidth,height:y.innerHeight},b=yo(x,0);a.current={startX:u.clientX,from:i,limit:Math.max(0,b.x-yo(x,0,-x.width).x)},g.setPointerCapture(u.pointerId)},l=u=>{let g=a.current;g&&s(Math.max(-g.limit,Math.min(g.limit,g.from+u.clientX-g.startX)))},p=()=>{a.current&&a.current.from!==i&&n?.(i),a.current=null},m=e.rewrite&&e.rewriteAt?Ob(e.rewriteAt,Lb[e.rewrite.state]??Ib):null,d=e.cardOnly===!0;return f("div",{class:"coere-root coere-act-overlay","data-hidden":e.visible?void 0:"",children:[!d&&f(Mn,{mode:e.glow}),f("div",{class:"coere-act-dock",style:{"--coere-act-x":`${i}px`},onPointerDown:c,onPointerMove:l,onPointerUp:p,onPointerCancel:p,children:[e.card&&f("div",{class:"coere-act-dock-card coere-enter","data-wide":e.card.form?"":void 0,children:f($n,{model:e.card,onAnswer:(u,g)=>r({kind:"card",step:e.card?.step??0,choice:u,edited:g})})}),e.rewrite&&!m&&f("div",{class:"coere-act-dock-card coere-enter",children:f(uo,{model:e.rewrite,mac:t,onPress:u=>r({kind:"rewrite",button:u})})}),!d&&f(Dn,{model:e.bar,onPress:u=>r({kind:"bar",button:u})})]}),e.rewrite&&m&&f("div",{class:"coere-act-float coere-enter",style:{left:`${m.x}px`,top:`${m.y}px`,width:`${m.width}px`},children:f(uo,{model:e.rewrite,mac:t,onPress:u=>r({kind:"rewrite",button:u})})})]})}function Ob(e,t){let r={width:window.innerWidth,height:window.innerHeight};return oi(r,e,t)}var gl=`:root, :host, [data-theme='light'] { --coere-cori-floor: #080e24; --coere-cori-floor-o: 0.2; --coere-cori-glow-o: 0.3; }
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
`;var Nb=`.coere-cori { position: relative; display: inline-block; flex: none; vertical-align: middle; line-height: 0; }
.coere-cori[data-tappable] { cursor: pointer; user-select: none; -webkit-user-select: none; }
`,bl=Nb+gl;var yl=`/* Pill buttons. They press down a little, which reads as physical without being loud. */
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
`;var xl=`.coere-checkbox {
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
`;var wl=`/*
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
`;var vl=`/*
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
`;var kl=`.coere-kbd {
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
`;var _l=`.coere-tabs {
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
`;var Cl=`.coere-toggle {
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
`;var El=`.coere-empty {
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
`;var Sl=`.coere-progress {
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
`;var Al=`.coere-spinner {
  display: inline-flex;
  flex: none;
  line-height: 0;
  vertical-align: middle;
}

.coere-spinner-svg {
  animation: coere-spin 700ms linear infinite;
}
`;var Tl=`.coere-stat {
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
`;var Rl=`/*
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
`;var Pl=`.coere-hl-mark {
  padding: 0 2px;
  margin: 0 -1px;
  border-radius: 4px;
  background: var(--coere-mark-bg);
  color: var(--coere-mark-fg);
  font-weight: 550;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
`;var Ml=`/* The capsule card: lavender fill, a 1 px tint border, 16 px corners. */
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
`;var Il=`.coere-results {
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
`;var Ll=`.coere-row {
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
`;var Ol=`/* Platform logos keep their own colors. Single color marks follow the text color. */
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
`;var Nl=`/*
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
`;var Dl=`/*
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
`;var Hl=`/*
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
`;var r1=[Ol,yl,wl,vl,Cl,xl,kl,_l,Al,Sl,El,Tl,Rl,Pl,Ml,Ll,Il],Bl=[Hl,Nl,Dl,...r1].join(`
`);var $l=`
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
`;var Fl=`
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
`;var Ul=`
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
`;var jl=`
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
`;var zl=[Ul,$l,Fl,jl].join(`
`),Un=[Bl,bl,zl].join(`
`);var jn=`
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
`;var zn=`
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
`;var mt=(e,t,r)=>Math.min(r,Math.max(t,e));function Gl(e,t=100){if(e===void 0)return 1;let r=Number.parseFloat(e);return Number.isNaN(r)?null:e.trim().endsWith("%")?r/t:r}function o1(e){let[t="",r]=e.split("/"),o=t.split(/[\s,]+/).filter(Boolean);return r!==void 0?{parts:o,alpha:r.trim()}:{parts:o.slice(0,3),alpha:o[3]}}function Wl(e,t){let r=mt(e,0,1),o=r<=.0031308?r*12.92:1.055*r**(1/2.4)-.055,n=Math.round(o*255);return{r:n,g:n,b:n,a:t}}function n1(e){let t=e.length<=4?[...e].map(o=>o+o).join(""):e;if(!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(t))return null;let r=o=>Number.parseInt(t.slice(o,o+2),16);return{r:r(0),g:r(2),b:r(4),a:t.length===8?r(6)/255:1}}function Vl(e){let t=e.trim().toLowerCase();if(t==="transparent")return{r:0,g:0,b:0,a:0};if(t.startsWith("#"))return n1(t.slice(1));let r=/^([a-z]+)\((.*)\)$/.exec(t);if(!r)return null;let[,o="",n=""]=r,i=o==="color"?/^\s*([a-z0-9-]+)\s+/.exec(n):null;if(o==="color"&&i?.[1]!=="srgb")return null;let{parts:s,alpha:a}=o1(i?n.slice(i[0].length):n),c=Gl(a);if(c===null)return null;if(o==="rgb"||o==="rgba"){let l=s.slice(0,3).map(u=>u.endsWith("%")?Number.parseFloat(u)/100*255:Number(u));if(l.length!==3||l.some(u=>Number.isNaN(u)))return null;let[p=0,m=0,d=0]=l;return{r:p,g:m,b:d,a:mt(c,0,1)}}if(o==="color"){let l=s.map(Number);if(l.length!==3||l.some(u=>Number.isNaN(u)))return null;let[p=0,m=0,d=0]=l.map(u=>Math.round(mt(u,0,1)*255));return{r:p,g:m,b:d,a:mt(c,0,1)}}if(o==="oklch"||o==="oklab"){let l=Gl(s[0]);return l===null?null:Wl(l**3,mt(c,0,1))}if(o==="lab"||o==="lch"){let l=Number.parseFloat(s[0]??"");if(Number.isNaN(l))return null;let p=(l+16)/116;return Wl(l>8?p**3:l/903.3,mt(c,0,1))}return null}function Gn(e){let t=mt(e,0,255)/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function Kl(e){let t=.2126*Gn(e.r)+.7152*Gn(e.g)+.0722*Gn(e.b);return 1.05/(t+.05)>(t+.05)/.05}function ql(e,t=Object.is){let r=e,o=new Set,n=i=>{if(!t(r,i)){r=i;for(let s of[...o])try{s(r)}catch{}}};return{get:()=>r,set:n,update:i=>n(i(r)),subscribe(i){return o.add(i),()=>o.delete(i)}}}var Xl=32,i1=5e3,s1=["class","style","data-theme","data-mode","data-color-mode","data-color-scheme"];function a1(e,t){return t?e===t||t.contains(e):!1}function*c1(e,t,r){let n=(typeof t.elementsFromPoint=="function"?t.elementsFromPoint(e.innerWidth-Xl,e.innerHeight-Xl):[]).find(i=>!a1(i,r));for(let i=n;i;i=i.parentElement)yield i;t.body&&(yield t.body),yield t.documentElement}function l1(e,t){let r=e.getComputedStyle(t.documentElement).colorScheme??"";return/\bdark\b/.test(r)?/\blight\b/.test(r)?e.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light":"dark":"light"}function Jl(e,t,r){for(let o of c1(e,t,r)){let n=Vl(e.getComputedStyle(o).backgroundColor);if(n&&n.a>=.5)return Kl(n)?"dark":"light"}return l1(e,t)}function Yl(e,t,r){let o=ql(Jl(e,t,r)),n=!1,i=()=>{n||(n=!0,e.requestAnimationFrame(()=>{n=!1,o.set(Jl(e,t,r))}))},s=new MutationObserver(i),a={attributes:!0,attributeFilter:s1};s.observe(t.documentElement,a),t.body&&s.observe(t.body,a),t.head&&s.observe(t.head,{childList:!0});let c=e.matchMedia?.("(prefers-color-scheme: dark)");c?.addEventListener("change",i);let l=e.setInterval(i,i1);return{get:o.get,subscribe:o.subscribe,refresh:i,stop(){s.disconnect(),c?.removeEventListener("change",i),e.clearInterval(l)}}}var Wn="coere.actions.bar";function d1(e){return typeof e!="object"||e===null||Array.isArray(e)?{}:Object.fromEntries(Object.entries(e).filter(t=>typeof t[1]=="number"&&Number.isFinite(t[1])))}function u1(e,t){let r=async()=>d1((await e.get(Wn))[Wn]);return{async read(){try{return(await r())[t]??0}catch{return 0}},async write(o){try{let n=await r();delete n[t];let i=Object.entries({...n,[t]:Math.round(o)}).slice(-50);await e.set({[Wn]:Object.fromEntries(i)})}catch{}}}}var Zl=e=>u1(chrome.storage.local,e);function p1(e){let t=e.activeElement,r=t instanceof HTMLTextAreaElement||t instanceof HTMLInputElement?t:null,o=e.getSelection(),n=r?r.getBoundingClientRect():o&&o.rangeCount>0?o.getRangeAt(0).getBoundingClientRect():null;return!n||n.width<=0||n.height<=0?null:{x:n.x,y:n.y,width:n.width,height:n.height}}function Ql(e,t,r,o=Zl(location.host),n=null){let i=e.ownerDocument,s=i.createElement("style");s.textContent=`${Un}
${zn}
${jn}`;let a=i.createElement("div");e.append(s,a);let c=e.host,l=Yl(i.defaultView??window,i,c);c.setAttribute("data-theme",l.get());let p=l.subscribe(y=>c.setAttribute("data-theme",y)),m=null,d=null,u=null,g=y=>{if(y.rewrite?d?.rewrite||(u=p1(i)):u=null,d=y,m===null)return;let x={...y,rewriteAt:y.rewriteAt??n?.box()??u};Pn(Ce(Fn,{state:x,mac:t,onPress:r,drag:m,onDrag:b=>void o.write(b)}),a)};return n?.listen(()=>{d?.rewrite&&g(d)}),o.read().then(y=>{m=y,d&&g(d)}),{draw:g,remove(){p(),l.stop(),Pn(null,a),s.remove(),a.remove()}}}function ed(e,t,r){let o=a=>a===void 0?a:structuredClone(a),n=a=>({get(c){let l=e.stores[a]??{};if(c==null)return Promise.resolve(o(l));let p=typeof c=="string"?[c]:Array.isArray(c)?c:Object.keys(c),m=typeof c=="object"&&!Array.isArray(c)?c:{},d={};for(let u of p)u in l?d[u]=o(l[u]):u in m&&(d[u]=m[u]);return Promise.resolve(d)},set(c){return e.write(a,o(c)),Promise.resolve()},remove(c){return e.remove(a,typeof c=="string"?[c]:c),Promise.resolve()},clear(){return e.remove(a,Object.keys(e.stores[a]??{})),Promise.resolve()},onChanged:ht(c=>e.watchStorage((l,p)=>p===a&&c(o(l)),t))}),i={runtime:{id:"coere",lastError:void 0,getURL:a=>r+a.replace(/^\//,""),getManifest:()=>({version:"2.0.0",name:"Coere"}),sendMessage:async a=>o(await e.handle(o(a),t)),connect:()=>m1(),onMessage:ht(a=>e.listen(t,(c,l,p)=>a(o(c),l,p))),onConnect:ht(()=>()=>{})},storage:{local:n("local"),session:n("session"),sync:n("sync"),onChanged:ht(a=>e.watchStorage((c,l)=>a(o(c),l),t))},i18n:{getUILanguage:()=>"en-US",getMessage:()=>""},tabs:{sendMessage:(a,c)=>e.tell(o(c)),query:async()=>[],create:async()=>({})}};navigator.clipboard&&Object.defineProperty(navigator.clipboard,"writeText",{value:()=>Promise.resolve(),configurable:!0});let s=f1(i);Object.assign(window,{chrome:s,browser:s})}function f1(e){let t=()=>new Proxy(()=>Promise.resolve(void 0),{get:(o,n)=>typeof n=="string"&&/^on[A-Z]/.test(n)?ht(()=>()=>{}):n==="then"?void 0:t()}),r=o=>new Proxy(o,{get(n,i){if(i in n){let s=Reflect.get(n,i);return s&&typeof s=="object"&&!Array.isArray(s)&&!("addListener"in s)?r(s):s}if(!(typeof i!="string"||i==="then"))return/^on[A-Z]/.test(i)?ht(()=>()=>{}):t()}});return r(e)}function ht(e){let t=new Map;return{addListener(r){t.set(r,e(r))},removeListener(r){t.get(r)?.(),t.delete(r)},hasListener:r=>t.has(r)}}function m1(){let e=ht(()=>()=>{});return{name:"",postMessage:()=>{},disconnect:()=>{},onMessage:e,onDisconnect:e}}var Vn=parent.__demo,Kn=frameElement.dataset.tab??"",rr=Vn.extra.gmail;ed(Vn.world,Kn,Vn.assets);var h1=new URL(new URLSearchParams(location.search).get("at")??"https://mail.google.com/mail/u/0/"),bt=0,td=`/mail/u/${bt}/`,po=null,qn={get hostname(){return"mail.google.com"},get host(){return"mail.google.com"},get origin(){return"https://mail.google.com"},get protocol(){return"https:"},get pathname(){return td},get search(){return new URLSearchParams(location.search).has("at")?h1.search:""},get hash(){return po??location.hash},set hash(e){if(!/^#[^/]+\/[^/]+\/[0-9a-f]{8,}$|^#(inbox|sent|drafts|starred)\/[0-9a-f]{8,}$/.test(location.hash)||!rr.paced()){location.hash=e;return}po=e,setTimeout(()=>{po===e&&(po=null,location.hash=e)},900)},get href(){return`https://mail.google.com${td}${this.search}${location.hash}`},toString(){return this.href}},g1=new Proxy(document,{get(e,t){if(t==="location")return qn;let r=Reflect.get(e,t,e);return typeof r=="function"?r.bind(e):r}}),gt=rr.store,b1={name:"Maya Collins",address:gt.accounts[bt]??""},y1={account:bt,me:b1,accounts:[...gt.accounts],threads:gt.mailbox.filter(e=>e.account===bt),drafts:gt.drafts.filter(e=>e.account===bt),sent:gt.sent.filter(e=>e.account===bt&&e.undoneAt===null),contacts:gt.contacts.filter(e=>e.accounts.includes(bt)).map(({name:e,address:t})=>({name:e,address:t})),undoSeconds:gt.undoSeconds,composeOnly:qn.search.includes("view=cm")},fo=document.createElement("script");fo.type="application/json";fo.id="boot";fo.textContent=JSON.stringify(y1).replace(/</g,"\\u003c");document.body.append(fo);var x1=window.fetch.bind(window);window.fetch=async(e,t)=>{let r=new URL(typeof e=="string"?e:e instanceof URL?e.href:e.url,location.href),o=/^\/mail\/u\/(\d+)\/sync\/(\w+)$/.exec(r.pathname);if(!o)return x1(e,t);let n=JSON.parse(String(t?.body??"{}")),i=rr.sync(Number(o[1]),o[2],JSON.parse(JSON.stringify(n)));return new Response(JSON.stringify(i),{headers:{"content-type":"application/json"}})};function w1(e){let t=new Set,r=new Set,o=!0,n=()=>{if(o){o=!1;for(let a of r)a()}},i={name:e?.name??"",postMessage:a=>o&&s.post(structuredClone(a)),disconnect:()=>{o&&(o=!1,s.close())},onMessage:{addListener:a=>t.add(a),removeListener:a=>t.delete(a)},onDisconnect:{addListener:a=>r.add(a),removeListener:a=>r.delete(a)}},s=rr.connect(Kn,{deliver:a=>{if(!o)return;let c=structuredClone(a);for(let l of t)l(c)},close:n});return addEventListener("pagehide",()=>i.disconnect(),{once:!0}),i}var v1=window.chrome;v1.runtime.connect=w1;function k1(){let e=null,t=()=>e??=Bt(document),r=jo({doc:document,startUrl:qn.href,layer:t}),o=async l=>{let p=await r.handle({id:"pick",type:"snapshot",step:0,steps:0,viewportOnly:!1});return p.ok&&p.type==="snapshot"?c.pick(l,p.result.elements):null},n=null,i=null,s={layer:()=>t().root,emit:l=>c.emit(l),anchor:l=>{n=l,i?.()},goBackLabel:C.GO_BACK,alive:()=>e!==null},a=Pa(ln(g1,o,l=>r.session.element(l),s)),c=pc({connect:()=>window.chrome.runtime.connect({name:Zn}),kit:{handle:l=>r.handle(l),dispose:()=>{r.dispose(),e?.remove(),e=null}},overlay:l=>Ql(t().root,/Mac/i.test(navigator.platform),l,void 0,{box:()=>n,listen:p=>i=p}),recipes:a,watchPerson:l=>zo(document,l,{trusted:()=>!1})})}addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("compose-root"),t=document.getElementById("frame");!e||!t?.classList.contains("compose-only")||new MutationObserver(()=>{e.childElementCount>0||!t.classList.contains("compose-only")||(t.classList.remove("compose-only"),history.replaceState(null,"",`${location.pathname}#inbox`),dispatchEvent(new HashChangeEvent("hashchange")))}).observe(e,{childList:!0})});Object.assign(window,{__coereActionsStart:k1});addEventListener("load",()=>rr.loaded(Kn),{once:!0});})();
