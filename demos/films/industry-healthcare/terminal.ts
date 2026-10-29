/**
 * A terminal window drawn as a page, as coere-v2's films draw it
 * (tools/demo-video/stage/terminal.ts), copied from the v3 film: the
 * folder's name in the title, each command typed after the prompt, and
 * what the command printed, added as it comes. Text goes in as text, so
 * nothing printed is read as markup. The command line is a box that takes
 * the scripted hand's keys, so a command is typed key by key; Enter runs
 * it, and the film prints what it printed.
 */
const CSS = `
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
`;

const style = document.createElement("style");
style.textContent = CSS;
document.head.append(style);
document.title = new URLSearchParams(location.search).get("title") ?? "Terminal";
document.body.innerHTML = '<div class="win"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="title"></span></div><pre></pre></div>';
document.querySelector(".title")!.textContent = document.title;
const pre = document.querySelector("pre")!;
const cursor = document.createElement("span");
cursor.className = "cursor";

/** What the film calls on this page. */
const term = {
  /** A new prompt, its command line focused for typing; the block cursor follows the text. */
  prompt(): HTMLElement {
    if (pre.childNodes.length > 0) pre.append("\n");
    const prompt = document.createElement("span");
    prompt.className = "dim";
    prompt.textContent = "$ ";
    const cmd = document.createElement("span");
    cmd.className = "cmd";
    cmd.contentEditable = "plaintext-only";
    cmd.spellcheck = false;
    // Enter runs the command; the film prints what it printed.
    cmd.addEventListener("keydown", (e) => e.key === "Enter" && e.preventDefault());
    cursor.classList.remove("busy");
    pre.append(prompt, cmd, cursor);
    cmd.focus();
    return cmd;
  },
  /** The command has been run: the line is no longer typed into, and the cursor waits below it. */
  ran(): void {
    const cmd = pre.querySelector<HTMLElement>(".cmd[contenteditable]");
    if (cmd) {
      cmd.removeAttribute("contenteditable");
      cmd.blur();
    }
    cursor.classList.add("busy");
    pre.append("\n", cursor);
  },
  /** One line of what the command printed, keeping the newest line in view. */
  line(text: string): void {
    cursor.before(`${text}\n`);
    pre.scrollTop = pre.scrollHeight;
  },
  /** The command ended: the cursor goes away until the next prompt. */
  done(): void {
    // The last printed line ends with a newline; the next prompt adds its own.
    const last = cursor.previousSibling;
    if (last?.nodeType === Node.TEXT_NODE && last.textContent?.endsWith("\n")) last.textContent = last.textContent.slice(0, -1);
    cursor.remove();
  },
  /** A fresh screen, as `clear` does. */
  clear(): void {
    pre.replaceChildren();
  },
};
Object.assign(window, { __term: term });
