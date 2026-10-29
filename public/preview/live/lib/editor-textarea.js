/* eslint-disable */
"use strict";
(() => {
  // tests/fake-sites/boot-types.ts
  var BOOT_ELEMENT_ID = "__coere_fake_boot__";
  var HOOK = {
    sidebar: "data-fake-sidebar",
    sidebarList: "data-fake-sidebar-list",
    scroller: "data-fake-scroller",
    thread: "data-fake-thread",
    historyLoader: "data-fake-history-loader"
  };
  function hookSelector(name) {
    return `[${HOOK[name]}]`;
  }

  // tests/fake-sites/runtime/dom.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  function buildEl(spec, vars, fill2, inSvg = false) {
    const svg = inSvg || spec.tag === "svg";
    const node = svg ? document.createElementNS(SVG_NS, spec.tag) : document.createElement(spec.tag);
    for (const [name, value] of Object.entries(spec.attrs ?? {})) {
      node.setAttribute(
        name,
        value.replace(/\{(\w+)\}/g, (_m, key) => vars[key] ?? "")
      );
    }
    for (const child of spec.children ?? []) {
      const built = typeof child === "string" ? document.createTextNode(child) : buildEl(child, vars, fill2, svg);
      if (built) node.append(built);
    }
    if (spec.slot && fill2 && !fill2(spec.slot, node)) return null;
    return node;
  }
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function must(selector, root = document) {
    const found = root.querySelector(selector);
    if (!found) throw new Error(`fake page is missing ${selector}`);
    return found;
  }

  // tests/fake-sites/runtime/files.ts
  function mountFileSpy(state, shell) {
    const record = (via) => {
      const event = {
        platform: state.platform,
        via,
        path: location.pathname,
        at: Date.now()
      };
      state.files.push(event);
      document.documentElement.dataset.fakeFiles = String(state.files.length);
      void window.__coereFakeFile?.(event);
    };
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    (shell ?? document.body).append(input);
    const isFileInput = (target) => target instanceof HTMLInputElement && target.type === "file";
    document.addEventListener(
      "click",
      (e) => {
        if (!isFileInput(e.target)) return;
        e.preventDefault();
        record("open");
      },
      true
    );
    document.addEventListener("change", (e) => isFileInput(e.target) && record("select"), true);
    document.addEventListener(
      "drop",
      (e) => {
        if (!e.dataTransfer?.files.length) return;
        e.preventDefault();
        record("drop");
      },
      true
    );
    document.addEventListener("paste", (e) => e.clipboardData?.files.length && record("paste"), true);
    return input;
  }

  // tests/fake-sites/conventions-types.ts
  var FAKE_STATUS = "fake, not observed on the live site";
  function fakeRecord(platform, newChatPath, chatPrefix, dom) {
    return {
      platform,
      urls: { status: FAKE_STATUS, newChatPath, chatPrefix },
      dom: { status: FAKE_STATUS, ...dom }
    };
  }

  // tests/fake-sites/conventions-tier1.ts
  var chatgpt = fakeRecord("chatgpt", "/", "/c/", {
    editorKind: "prosemirror",
    composer: 'div#prompt-textarea.ProseMirror[contenteditable="true"]',
    composerShell: 'form[data-type="unified-composer"]',
    sendButton: 'button[data-testid="send-button"]',
    userTurn: 'div[data-message-author-role="user"]',
    assistantTurn: 'div[data-message-author-role="assistant"]',
    userContent: ".whitespace-pre-wrap",
    assistantContent: ".markdown",
    sidebarLink: 'nav a[href^="/c/"]',
    sourceLink: null
  });
  var claude = fakeRecord("claude", "/new", "/chat/", {
    editorKind: "prosemirror",
    composer: 'fieldset div.ProseMirror[contenteditable="true"]',
    composerShell: "fieldset",
    sendButton: 'button[aria-label="Send message"]',
    userTurn: '[data-testid="user-message"]',
    assistantTurn: ".font-claude-message",
    userContent: ":scope",
    assistantContent: ":scope",
    sidebarLink: 'nav a[href^="/chat/"]',
    sourceLink: null
  });
  var gemini = fakeRecord("gemini", "/app", "/app/", {
    editorKind: "quill",
    composer: 'rich-textarea div.ql-editor[contenteditable="true"][role="textbox"]',
    composerShell: "fieldset.input-area-fieldset",
    sendButton: 'button.send-button[aria-label="Send message"]',
    userTurn: "user-query",
    assistantTurn: "model-response",
    userContent: "message-content",
    assistantContent: "message-content",
    sidebarLink: 'side-navigation a[href^="/app/"]',
    sourceLink: null
  });

  // tests/fake-sites/conventions-tier2.ts
  var deepseek = fakeRecord("deepseek", "/", "/a/chat/s/", {
    editorKind: "controlled-textarea",
    composer: "textarea#chat-input",
    composerShell: "div.ds-composer",
    sendButton: 'div.ds-composer button[aria-label="Send"]',
    userTurn: 'div.ds-message[data-role="user"]',
    assistantTurn: 'div.ds-message[data-role="assistant"]',
    userContent: ".ds-message-text",
    assistantContent: ".ds-markdown",
    sidebarLink: 'nav a[href^="/a/chat/s/"]',
    sourceLink: null
  });
  var kimi = fakeRecord("kimi", "/", "/chat/", {
    editorKind: "reflowing",
    composer: 'div.chat-input-editor[contenteditable="true"][role="textbox"]',
    composerShell: "div.chat-input",
    sendButton: "div.chat-input button.send-button",
    userTurn: "div.chat-content-item-user",
    assistantTurn: "div.chat-content-item-assistant",
    userContent: ".segment-content-box",
    assistantContent: ".segment-content-box",
    sidebarLink: 'nav a[href^="/chat/"]',
    sourceLink: null
  });
  var perplexity = fakeRecord("perplexity", "/", "/search/", {
    editorKind: "reflowing",
    composer: 'div#ask-input[contenteditable="true"][role="textbox"]',
    composerShell: "div.ask-box",
    sendButton: 'button[aria-label="Submit"]',
    userTurn: 'section[aria-label="Question"]',
    assistantTurn: 'section[aria-label="Answer"]',
    userContent: "h2",
    assistantContent: ".prose",
    sidebarLink: 'nav a[href^="/search/"]',
    sourceLink: 'ol[aria-label="Sources"] a[href]'
  });
  var grok = fakeRecord("grok", "/", "/c/", {
    editorKind: "plain-textarea",
    composer: 'textarea[aria-label="Ask Grok anything"]',
    composerShell: "form.query-bar",
    sendButton: 'form.query-bar button[type="submit"]',
    userTurn: 'div.message-row[data-author="user"]',
    assistantTurn: 'div.message-row[data-author="assistant"]',
    userContent: ".message-bubble",
    assistantContent: ".message-bubble",
    sidebarLink: 'nav a[href^="/c/"]',
    sourceLink: null
  });
  var copilot = fakeRecord("copilot", "/", "/chats/", {
    editorKind: "controlled-textarea",
    composer: "textarea#userInput",
    composerShell: "div.composer",
    sendButton: 'button[data-testid="submit-button"]',
    userTurn: 'div[data-content="user-message"]',
    assistantTurn: 'div[data-content="ai-message"]',
    userContent: ":scope > div.content",
    assistantContent: ":scope > div.content",
    sidebarLink: 'nav a[href^="/chats/"]',
    sourceLink: null
  });
  var meta_ai = fakeRecord("meta_ai", "/", "/prompt/", {
    editorKind: "reflowing",
    composer: 'div[contenteditable="true"][role="textbox"][aria-label="Ask Meta AI anything"]',
    composerShell: "div.prompt-box",
    sendButton: 'div[role="button"][aria-label="Send message"]',
    userTurn: 'div[role="listitem"][data-author="user"]',
    assistantTurn: 'div[role="listitem"][data-author="assistant"]',
    userContent: ".message-text",
    assistantContent: ".message-text",
    sidebarLink: 'nav a[href^="/prompt/"]',
    sourceLink: null
  });

  // tests/fake-sites/conventions.ts
  var FAKE_PREFIX = "/__coere_fake__/";
  var FAKE_API_PREFIX = `${FAKE_PREFIX}api/`;
  var FAKE_STATIC_PREFIX = `${FAKE_PREFIX}static/`;
  var FAKE_CONVENTIONS = {
    chatgpt,
    claude,
    gemini,
    deepseek,
    kimi,
    perplexity,
    grok,
    copilot,
    meta_ai
  };
  function fakeTurnsPath(id, turns) {
    const bytes = new TextEncoder().encode(JSON.stringify(turns));
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    const t = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${FAKE_API_PREFIX}conversation/${encodeURIComponent(id)}/turns?t=${t}`;
  }

  // tests/fake-sites/runtime/markdown.ts
  var FENCE_OPEN = /^```([^`\s]*)\s*$/;
  var FENCE_CLOSE = /^```\s*$/;
  var TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}/;
  function cells(line) {
    const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return inner.split("|").map((c) => c.trim());
  }
  function isTableStart(lines, i) {
    const next = lines[i + 1];
    return (lines[i] ?? "").trim().startsWith("|") && next !== void 0 && TABLE_SEPARATOR.test(next);
  }
  function splitBlocks(text) {
    const lines = text.split("\n");
    const blocks = [];
    let para = [];
    const flush = () => {
      if (para.length) blocks.push({ kind: "para", text: para.join("\n") });
      para = [];
    };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      const fence = FENCE_OPEN.exec(line);
      if (fence) {
        flush();
        const body = [];
        i++;
        while (i < lines.length && !FENCE_CLOSE.test(lines[i] ?? "")) body.push(lines[i++] ?? "");
        blocks.push({ kind: "code", lang: fence[1] ?? "", code: body.join("\n") });
        continue;
      }
      if (isTableStart(lines, i)) {
        flush();
        const rows = [];
        while (i < lines.length && (lines[i] ?? "").trim().startsWith("|"))
          rows.push(cells(lines[i++] ?? ""));
        i--;
        rows.splice(1, 1);
        blocks.push({ kind: "table", rows });
        continue;
      }
      if (line.trim() === "") flush();
      else para.push(line);
    }
    flush();
    return blocks;
  }
  function renderCode(lang, code) {
    const wrap = make("div", "fake-code");
    const chrome = make("div", "fake-code-chrome");
    chrome.dataset.fakeCodeChrome = "";
    const copy = make("button", "fake-code-copy", "Copy");
    copy.type = "button";
    copy.addEventListener("click", () => {
      copy.textContent = "Copied";
      setTimeout(() => copy.textContent = "Copy", 1200);
    });
    chrome.append(make("span", "fake-code-lang", lang || "text"), copy);
    const pre = make("pre");
    const codeEl = make("code", lang ? `language-${lang}` : void 0, code);
    pre.append(codeEl);
    wrap.append(chrome, pre);
    return wrap;
  }
  function renderTable(rows) {
    const wrap = make("div", "fake-table");
    const table = make("table");
    const [head, ...body] = rows;
    if (head) {
      const tr = make("tr");
      for (const c of head) tr.append(make("th", void 0, c));
      const thead = make("thead");
      thead.append(tr);
      table.append(thead);
    }
    const tbody = make("tbody");
    for (const row of body) {
      const tr = make("tr");
      for (const c of row) tr.append(make("td", void 0, c));
      tbody.append(tr);
    }
    table.append(tbody);
    wrap.append(table);
    return wrap;
  }
  function renderMarkdown(text, host) {
    for (const block of splitBlocks(text)) {
      if (block.kind === "para") host.append(make("p", void 0, block.text));
      else if (block.kind === "code") host.append(renderCode(block.lang, block.code));
      else host.append(renderTable(block.rows));
    }
  }

  // tests/fake-sites/runtime/turns.ts
  function fill(slot, host, msg) {
    switch (slot) {
      case "plain":
        host.textContent = msg.text;
        return true;
      case "markdown":
        renderMarkdown(msg.text, host);
        return true;
      case "sources": {
        if (!msg.sources?.length) return false;
        for (const source of msg.sources) {
          const link = make("a", "fake-source", source.title ?? source.url);
          link.href = source.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          const item = make("li");
          item.append(link);
          host.append(item);
        }
        return true;
      }
      case "attachments": {
        if (!msg.attachments?.length) return false;
        for (const name of msg.attachments) host.append(make("span", "fake-turn-file", name));
        return true;
      }
    }
  }
  function renderTurn(templates, msg, index) {
    const template = msg.role === "user" ? templates.user : msg.role === "tool" && templates.tool ? templates.tool : templates.assistant;
    const turn = buildEl(
      template,
      { i: String(index), role: msg.role },
      (slot, host) => fill(slot, host, msg)
    );
    if (!turn) throw new Error("a turn template must not be a slot");
    return turn;
  }

  // tests/fake-sites/runtime/reply.ts
  function fakeModes() {
    return window.__coereFakeModes ?? {};
  }
  function seeded(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var FIRST_MS = 400;
  var STEP_MS = 80;
  var PAUSE_MIN_MS = 3e3;
  var PAUSE_MAX_MS = 1e4;
  var SENTENCES = [
    "Here is a short fake answer for the test.",
    "The fake site writes this reply one piece at a time.",
    "Nothing in this reply is real advice.",
    "A real assistant would say something more useful here.",
    "This line only makes the reply a little longer.",
    "The test can check every word of it later.",
    "Fake replies are plain sentences with no formatting.",
    "One more sentence keeps the reply growing for a while."
  ];
  function planReply(n, mode, rand, script = []) {
    const picked = Array.from({ length: 5 + Math.floor(rand() * 3) }, () => SENTENCES[Math.floor(rand() * SENTENCES.length)]);
    const text = script[n - 1] ?? [`Fake reply ${n}.`, ...picked].join(" ");
    const words = text.split(" ");
    const steps = [];
    for (let w = 0; w < words.length; ) {
      w = Math.min(words.length, w + 1 + Math.floor(rand() * 3));
      steps.push({ upto: words.slice(0, w).join(" ").length, pauseMs: 0 });
    }
    const pauses = script[n - 1] !== void 0 ? 0 : mode === "bare" ? 1 + Math.floor(rand() * 2) : 1;
    for (let p = 0; p < pauses; p++) {
      const at = Math.floor(steps.length * (0.2 + rand() * 0.6));
      const step = steps[Math.min(at, steps.length - 2)];
      if (step) step.pauseMs = PAUSE_MIN_MS + Math.floor(rand() * (PAUSE_MAX_MS - PAUSE_MIN_MS + 1));
    }
    return { text, steps };
  }
  function replyTurn(boot2, index) {
    const slot = { el: null, plain: false };
    const turn = buildEl(boot2.templates.assistant, { i: String(index), role: "assistant" }, (kind, el) => {
      if (kind !== "plain" && kind !== "markdown") return false;
      slot.el = el;
      slot.plain = kind === "plain";
      return true;
    });
    if (!turn) throw new Error("a turn template must not be a slot");
    const show = (text) => {
      if (!slot.el) return;
      if (slot.plain) slot.el.textContent = text;
      else {
        slot.el.replaceChildren();
        renderMarkdown(text, slot.el);
      }
    };
    return { turn, show };
  }
  var FakeReplies = class {
    rand;
    boot;
    id;
    /** Messages the page shows. Each exchange adds two. */
    count;
    replies = 0;
    queue = Promise.resolve();
    posts = Promise.resolve();
    stop = null;
    constructor(seed) {
      this.boot = JSON.parse(document.getElementById(BOOT_ELEMENT_ID)?.textContent ?? "");
      this.rand = seeded(seed);
      this.id = this.boot.conversation?.id ?? null;
      this.count = this.boot.conversation?.messages.length ?? 0;
      window.__coereFakeStop = () => this.stop?.();
    }
    send(text, mode) {
      this.queue = this.queue.then(() => this.exchange(text, mode)).catch(() => void 0);
    }
    async exchange(text, mode) {
      const from = this.count;
      this.count += 2;
      const born = this.chat(text);
      const turns = (reply2) => ({
        from,
        messages: reply2 === null ? [{ role: "user", text }] : [{ role: "user", text }, { role: "assistant", text: reply2 }],
        ...born ? { title: document.title } : {}
      });
      this.append(renderTurn(this.boot.templates, { role: "user", text }, from));
      this.post(turns(null));
      const plan = planReply(++this.replies, mode, this.rand, fakeModes().script);
      const reply = replyTurn(this.boot, from + 1);
      let stopped = false;
      const stop = new Promise((resolve) => {
        this.stop = () => {
          stopped = true;
          resolve();
        };
      });
      await sleep(FIRST_MS);
      if (mode === "streamed") reply.turn.setAttribute("data-fake-streaming", "");
      let shown = "";
      for (const step of plan.steps) {
        if (stopped) break;
        shown = plan.text.slice(0, step.upto);
        reply.show(shown);
        this.append(reply.turn);
        if (step.pauseMs > 0) this.post(turns(shown));
        await Promise.race([sleep(step.pauseMs || STEP_MS), stop]);
      }
      reply.turn.removeAttribute("data-fake-streaming");
      this.stop = null;
      this.post(turns(shown));
      document.documentElement.dataset.fakeReplied = String(this.replies);
    }
    /** A chat sent from the new chat page gets its own address and thread, as the real sites do. True when it did now. */
    chat(text) {
      if (this.id !== null) return false;
      this.id = `fake-new-${Math.floor(this.rand() * 1e9).toString(36)}`;
      history.pushState({}, "", FAKE_CONVENTIONS[this.boot.platform].urls.chatPrefix + encodeURIComponent(this.id));
      document.title = text.slice(0, 48);
      const thread = document.createElement("div");
      thread.className = "fake-thread";
      thread.setAttribute(HOOK.thread, "");
      if (this.boot.templates.user.attrs?.role === "listitem") thread.setAttribute("role", "list");
      document.querySelector(".fake-hero")?.replaceWith(thread);
      document.body.classList.replace("fake-new_chat", "fake-chat");
      return true;
    }
    /** Adds a turn at the end, or keeps one already there, and keeps the newest in view. */
    append(turn) {
      if (!turn.isConnected) document.querySelector(hookSelector("thread"))?.append(turn);
      const scroller = document.querySelector(hookSelector("scroller"));
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }
    /** Posts in order, one at a time, so the server never gets an older state after a newer one. */
    post(turns) {
      const path = fakeTurnsPath(this.id ?? "", turns);
      this.posts = this.posts.then(() => fetch(path, { method: "POST" }).catch(() => void 0));
    }
  };

  // tests/fake-sites/runtime/send.ts
  function mountSendSpy(state, button) {
    let replies = null;
    const record = (via) => {
      const event = {
        platform: state.platform,
        via,
        path: location.pathname,
        at: Date.now()
      };
      state.sends.push(event);
      (window.__coereFakeSentText ??= []).push(state.model);
      (window.__coereFakeSentFiles ??= []).push(state.attached.map((f) => ({ name: f.name, text: f.text, state: f.state })));
      document.documentElement.dataset.fakeSends = String(state.sends.length);
      void window.__coereFakeSend?.(event);
      const { reply, seed = 1 } = fakeModes();
      const text = state.model.trim();
      if (reply && text) (replies ??= new FakeReplies(seed)).send(text, reply);
    };
    button?.addEventListener("click", (e) => {
      e.preventDefault();
      if (button.getAttribute("aria-disabled") === "true") return;
      record("button");
    });
    for (const form of document.querySelectorAll("form")) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        record("submit");
      });
    }
    const setReady = (ready) => {
      if (!button) return;
      if (button instanceof HTMLButtonElement) button.disabled = !ready;
      else button.setAttribute("aria-disabled", String(!ready));
      button.classList.toggle("is-ready", ready);
    };
    setReady(false);
    return { record, setReady };
  }

  // tests/fake-sites/runtime/sidebar.ts
  function mountSidebar(boot2, scroller, list) {
    const items = boot2.sidebar;
    const { sidebarPageSize, sidebarDelayMs } = boot2.options;
    let shown = 0;
    let loading = false;
    const setState = () => {
      scroller.dataset.fakeSidebarState = loading ? "loading" : shown < items.length ? "more" : "complete";
    };
    const renderItem = (chat) => {
      const row = buildEl(
        boot2.templates.sidebarItem,
        { href: chat.href, id: chat.id },
        (_slot, host) => {
          host.textContent = chat.title || "Untitled chat";
          return true;
        }
      );
      if (row && chat.id === boot2.currentId) row.setAttribute("aria-current", "page");
      return row;
    };
    const loadMore = async () => {
      if (loading || shown >= items.length) return;
      loading = true;
      setState();
      if (sidebarDelayMs > 0) await sleep(sidebarDelayMs);
      const next = items.slice(shown, shown + sidebarPageSize);
      for (const chat of next) {
        const row = renderItem(chat);
        if (row) list.append(row);
      }
      shown += next.length;
      loading = false;
      setState();
      if (scroller.scrollHeight <= scroller.clientHeight + 40) void loadMore();
    };
    scroller.addEventListener("scroll", () => {
      if (scroller.scrollTop + scroller.clientHeight > scroller.scrollHeight - 60) void loadMore();
    });
    setState();
    void loadMore();
  }

  // tests/fake-sites/runtime/thread.ts
  function historyDelayMs(seed) {
    return 1e3 + Math.floor(seeded(seed)() * 2001);
  }
  function mountThread(boot2, scroller, thread, loader) {
    const messages = boot2.conversation?.messages ?? [];
    const { historyPageSize, historyDelayMs: olderDelayMs } = boot2.options;
    const modes = fakeModes();
    let start2 = Math.max(0, messages.length - historyPageSize);
    let loading = modes.history === true;
    let drawn = false;
    const setState = () => {
      scroller.dataset.fakeHistory = loading ? "loading" : start2 > 0 ? "more" : "complete";
      loader.hidden = !loading;
    };
    const renderRange = (from, to) => {
      const frag = document.createDocumentFragment();
      for (let i = from; i < to; i++) {
        const msg = messages[i];
        if (msg) frag.append(renderTurn(boot2.templates, msg, i));
      }
      return frag;
    };
    const loadOlder = async () => {
      if (!drawn || loading || start2 === 0) return;
      loading = true;
      setState();
      await sleep(olderDelayMs);
      const from = Math.max(0, start2 - historyPageSize);
      const before = scroller.scrollHeight;
      thread.prepend(renderRange(from, start2));
      scroller.scrollTop += scroller.scrollHeight - before;
      start2 = from;
      loading = false;
      setState();
      fillIfShort();
    };
    const fillIfShort = () => {
      if (start2 > 0 && scroller.scrollHeight <= scroller.clientHeight) void loadOlder();
    };
    const draw = () => {
      thread.prepend(renderRange(start2, messages.length));
      scroller.scrollTop = scroller.scrollHeight;
      drawn = true;
      loading = false;
      setState();
      requestAnimationFrame(fillIfShort);
    };
    window.__coereFakeOlder = loadOlder;
    scroller.addEventListener("scroll", () => {
      if (scroller.scrollTop < 80) void loadOlder();
    });
    setState();
    if (modes.history) setTimeout(draw, historyDelayMs(modes.seed ?? 1));
    else draw();
  }

  // tests/fake-sites/runtime/upload-sites.ts
  var PLAIN = {
    accept: "",
    trustedPasteOnly: false,
    shows: "name",
    sendOffWhileUploading: true,
    limitBytes: null
  };
  var FAKE_UPLOAD_SITES = {
    chatgpt: PLAIN,
    claude: PLAIN,
    gemini: { accept: "image/*,video/*", trustedPasteOnly: true, shows: "title", sendOffWhileUploading: false, limitBytes: null },
    deepseek: PLAIN,
    kimi: { ...PLAIN, shows: "stem" },
    perplexity: PLAIN,
    grok: PLAIN,
    copilot: { ...PLAIN, limitBytes: 1024 * 1024 },
    meta_ai: { ...PLAIN, accept: "image/*" }
  };

  // tests/fake-sites/runtime/uploads.ts
  function topChild(shell, el) {
    let node = el;
    while (node && node.parentElement !== shell) node = node.parentElement;
    return node ?? shell.firstChild;
  }
  var fileWords = (f, shows) => shows === "stem" ? f.name.replace(/\.[^.]+$/, "") : shows === "title" ? "" : f.name;
  function mountUploads(h) {
    const site = FAKE_UPLOAD_SITES[h.state.platform];
    const limit = h.options.uploadLimitBytes ?? site.limitBytes;
    let busy = 0;
    if (site.accept) h.input.accept = site.accept;
    function signIn() {
      if (document.querySelector("[data-fake-signin]")) return;
      const dialog = make("div", "fake-signin");
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.dataset.fakeSignin = "";
      dialog.append(make("p", "", "Sign in to upload files"));
      const close = dialog.appendChild(make("button", "", "Close"));
      close.type = "button";
      close.addEventListener("click", () => dialog.remove());
      document.body.append(dialog);
    }
    function take(file, via) {
      if (h.options.upload === "signin") return signIn();
      const f = { name: file.name, bytes: file.size, text: "", via, state: "uploading" };
      h.state.attached.push(f);
      void file.text().then((t) => f.text = t);
      const chip = make("div", "fake-upload-chip");
      chip.dataset.fakeUpload = "uploading";
      if (site.shows === "title") chip.title = f.name;
      chip.append(make("span", "fake-upload-icon", "TXT"), make("span", "fake-upload-name", fileWords(f, site.shows)));
      const remove = chip.appendChild(make("button", "fake-upload-remove", "\xD7"));
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove file");
      const bar = chip.appendChild(make("div", "fake-upload-bar"));
      bar.setAttribute("role", "progressbar");
      bar.append(make("span"));
      h.shell.insertBefore(chip, topChild(h.shell, h.before));
      busy++;
      h.refresh();
      let done = false;
      remove.addEventListener("click", () => {
        if (!done) busy--;
        done = true;
        chip.remove();
        h.state.attached.splice(h.state.attached.indexOf(f), 1);
        h.refresh();
      });
      const end = (state, words) => {
        if (done) return;
        done = true;
        busy--;
        f.state = state;
        chip.dataset.fakeUpload = state;
        bar.remove();
        if (words) chip.append(make("span", "fake-upload-error", words));
        h.refresh();
      };
      const tooBig = limit !== null && file.size > limit;
      if (tooBig) return void setTimeout(() => end("failed", "File too large"), 200);
      if (h.options.upload === "refuse") return void setTimeout(() => end("failed", "Upload failed"), 300);
      if (h.options.upload === "stuck") return;
      setTimeout(() => end("ready"), h.options.uploadMs);
    }
    const filesOf = (data) => Array.from(data?.files ?? []);
    h.input.addEventListener("change", () => {
      for (const f of Array.from(h.input.files ?? [])) take(f, "input");
    });
    h.shell.addEventListener(
      "paste",
      (e) => {
        const files = filesOf(e.clipboardData);
        if (files.length === 0 || site.trustedPasteOnly && !e.isTrusted) return;
        e.preventDefault();
        e.stopPropagation();
        for (const f of files) take(f, "paste");
      },
      true
    );
    for (const type of ["dragenter", "dragover"])
      h.shell.addEventListener(type, (e) => e.dataTransfer?.types.includes("Files") && e.preventDefault(), true);
    h.shell.addEventListener(
      "drop",
      (e) => {
        const files = filesOf(e.dataTransfer);
        if (files.length === 0) return;
        e.preventDefault();
        e.stopPropagation();
        for (const f of files) take(f, "drop");
      },
      true
    );
    return { uploading: () => site.sendOffWhileUploading && busy > 0 };
  }

  // tests/fake-sites/runtime/boot.ts
  function start(mountEditor) {
    const data = JSON.parse(must(`#${BOOT_ELEMENT_ID}`).textContent ?? "");
    const state = { platform: data.platform, sends: [], files: [], model: "", pastedFiles: [], attached: [] };
    window.__coereFake = state;
    if (data.conversation?.title) document.title = data.conversation.title;
    const sidebar = document.querySelector(hookSelector("sidebar"));
    const list = document.querySelector(hookSelector("sidebarList"));
    if (sidebar && list) mountSidebar(data, sidebar, list);
    if (data.page === "chat") {
      mountThread(
        data,
        must(hookSelector("scroller")),
        must(hookSelector("thread")),
        must(hookSelector("historyLoader"))
      );
    }
    const mount = document.querySelector(data.editor.mount);
    if (!mount) return;
    const send = must(data.selectors.sendButton);
    const spy = mountSendSpy(state, send);
    const shell = send.closest(".fake-shell") ?? send.closest("form") ?? send.closest("fieldset");
    const input = mountFileSpy(state, shell);
    const files = shell ? mountUploads({ state, options: data.options, shell, input, before: mount, refresh: () => refresh() }) : null;
    const refresh = () => spy.setReady(
      (state.model.trim() !== "" || state.pastedFiles.length > 0 || state.attached.length > 0) && !files?.uploading()
    );
    mountEditor({
      boot: data,
      mount,
      onChange(text) {
        state.model = text;
        refresh();
      },
      onEnter: () => spy.record("enter"),
      onFile(text) {
        state.pastedFiles.push(text);
        refresh();
      }
    });
  }
  function boot(mountEditor) {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", () => start(mountEditor));
    else start(mountEditor);
  }

  // tests/fake-sites/editors/textarea.ts
  var nativeValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
  function readNative(el) {
    return String(nativeValue?.get?.call(el) ?? "");
  }
  function writeNative(el, value) {
    nativeValue?.set?.call(el, value);
  }
  function personGate(el, enabled) {
    let typed = false;
    el.addEventListener("beforeinput", (e) => typed = e.isTrusted, true);
    return () => {
      const ok = !enabled || typed;
      typed = false;
      return ok;
    };
  }
  function controlled(el, host, byPerson) {
    let state = host.boot.options.preDraft;
    let tracked = state;
    Object.defineProperty(el, "value", {
      configurable: true,
      get: () => readNative(el),
      set: (next) => {
        tracked = String(next);
        writeNative(el, tracked);
      }
    });
    const render = () => {
      if (readNative(el) !== state) writeNative(el, state);
      tracked = state;
    };
    el.addEventListener("input", () => {
      const actual = readNative(el);
      if (!byPerson()) {
        render();
        return;
      }
      if (actual === tracked) {
        requestAnimationFrame(render);
        return;
      }
      tracked = actual;
      state = actual;
      host.onChange(state);
    });
    writeNative(el, state);
    host.onChange(state);
  }
  function plain(el, host, byPerson) {
    let accepted = host.boot.options.preDraft;
    el.value = accepted;
    el.addEventListener("input", () => {
      if (!byPerson()) {
        el.value = accepted;
        return;
      }
      accepted = el.value;
      host.onChange(accepted);
    });
    host.onChange(accepted);
  }
  function autosize(el) {
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
    };
    el.addEventListener("input", fit);
    requestAnimationFrame(fit);
  }
  boot((host) => {
    const el = host.mount;
    if (!(el instanceof HTMLTextAreaElement))
      throw new Error("textarea editor mounted on something else");
    for (const [name, value] of Object.entries(host.boot.editor.attrs)) el.setAttribute(name, value);
    el.placeholder = host.boot.editor.placeholder;
    const byPerson = personGate(el, host.boot.options.ignoreProgrammaticInput);
    if (host.boot.editor.kind === "controlled-textarea") controlled(el, host, byPerson);
    else plain(el, host, byPerson);
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      host.onEnter();
    });
    autosize(el);
  });
})();
