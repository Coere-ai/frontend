/**
 * The person's hand in a tab: pointer moves, presses, keys and typed text,
 * sent as the browser sends them, so the page and Coere react with their
 * own code. Text goes in through the editing command a keyboard uses, so
 * ProseMirror, Quill and plain boxes all take it as typing.
 */
export type Point = { x: number; y: number };

/** The element drawn at a point, looking into open shadow roots. */
export function hitAt(doc: Document, p: Point): Element | null {
  let el = doc.elementFromPoint(p.x, p.y);
  while (el?.shadowRoot) {
    const inner = el.shadowRoot.elementFromPoint(p.x, p.y);
    if (!inner || inner === el) break;
    el = inner;
  }
  return el;
}

/** The focused element, looking into open shadow roots. */
export function focused(doc: Document): Element | null {
  let el = doc.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

const mouse = (win: Window, type: string, p: Point, extra: MouseEventInit = {}) =>
  new win.MouseEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: p.x, clientY: p.y, view: win, ...extra });

const pointer = (win: Window, type: string, p: Point, extra: PointerEventInit = {}) =>
  new win.PointerEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: p.x, clientY: p.y, pointerId: 1, pointerType: "mouse", isPrimary: true, view: win, ...extra });

/** Tracks what the pointer is over in one tab, for the over and out events a move makes. */
export class Hover {
  private over: Element | null = null;

  move(doc: Document, p: Point): void {
    const win = doc.defaultView;
    if (!win) return;
    const el = hitAt(doc, p);
    if (el !== this.over) {
      if (this.over) {
        this.over.dispatchEvent(pointer(win, "pointerout", p));
        this.over.dispatchEvent(mouse(win, "mouseout", p));
        this.over.dispatchEvent(mouse(win, "mouseleave", p, { bubbles: false }));
      }
      if (el) {
        el.dispatchEvent(pointer(win, "pointerover", p));
        el.dispatchEvent(mouse(win, "mouseover", p));
        el.dispatchEvent(mouse(win, "mouseenter", p, { bubbles: false }));
      }
      this.over = el;
    }
    (el ?? doc).dispatchEvent(pointer(win, "pointermove", p));
    (el ?? doc).dispatchEvent(mouse(win, "mousemove", p));
  }
}

/** The element under a press takes focus as a real press gives it: itself, or the nearest focusable around it. */
function focusFor(el: Element): void {
  const target = (el as HTMLElement).closest?.('input, textarea, select, button, a[href], [tabindex], [contenteditable="true"], [contenteditable=""]') as HTMLElement | null;
  if (target) target.focus({ preventScroll: true });
}

export function down(doc: Document, p: Point, button = 0, count = 1): Element | null {
  const win = doc.defaultView!;
  const el = hitAt(doc, p);
  if (!el) return null;
  el.dispatchEvent(pointer(win, "pointerdown", p, { button, buttons: 1 }));
  const go = el.dispatchEvent(mouse(win, "mousedown", p, { button, buttons: 1, detail: count }));
  if (go) focusFor(el);
  return el;
}

export function up(doc: Document, p: Point, pressed: Element | null, button = 0, count = 1): void {
  const win = doc.defaultView!;
  const el = hitAt(doc, p) ?? pressed;
  if (!el) return;
  el.dispatchEvent(pointer(win, "pointerup", p, { button }));
  el.dispatchEvent(mouse(win, "mouseup", p, { button, detail: count }));
  if (pressed && (el === pressed || pressed.contains(el) || el.contains(pressed))) {
    el.dispatchEvent(mouse(win, button === 2 ? "contextmenu" : "click", p, { button, detail: count }));
    if (count === 2) el.dispatchEvent(mouse(win, "dblclick", p, { button, detail: 2 }));
  }
}

const CODES: Record<string, string> = { Enter: "Enter", Escape: "Escape", Tab: "Tab", Backspace: "Backspace", ArrowDown: "ArrowDown", ArrowUp: "ArrowUp", ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight", End: "End", Home: "Home", " ": "Space" };

/** A key press on the focused element: keydown, the key's own effect unless the page stopped it, keyup. Modifiers go as "Meta+k". */
export function key(doc: Document, combo: string): void {
  const win = doc.defaultView!;
  const parts = combo.split("+");
  const name = parts.pop()!;
  const mods = { metaKey: parts.includes("Meta"), ctrlKey: parts.includes("Control"), altKey: parts.includes("Alt"), shiftKey: parts.includes("Shift") };
  const el = focused(doc) ?? doc.body;
  const init = { key: name, code: CODES[name] ?? (name.length === 1 ? `Key${name.toUpperCase()}` : name), bubbles: true, cancelable: true, composed: true, ...mods };
  const go = el.dispatchEvent(new win.KeyboardEvent("keydown", init));
  if (go && name.length === 1 && !mods.metaKey && !mods.ctrlKey) {
    el.dispatchEvent(new win.KeyboardEvent("keypress", init));
    insert(doc, name);
  } else if (go && name === "Backspace") doc.execCommand("delete");
  else if (go && name === "Enter" && el instanceof win.HTMLTextAreaElement) insert(doc, "\n");
  else if (go && name === "End" && isEditable(el)) caretToEnd(doc, el);
  el.dispatchEvent(new win.KeyboardEvent("keyup", init));
}

/** Puts text in at the caret, as typing or a paste does, with the input events a page listens for. */
export function insert(doc: Document, value: string): void {
  if (!doc.execCommand("insertText", false, value)) {
    const el = focused(doc) as HTMLInputElement | null;
    if (el && "value" in el) {
      el.value += value;
      el.dispatchEvent(new (doc.defaultView!.InputEvent)("input", { bubbles: true, composed: true, inputType: "insertText", data: value }));
    }
  }
}

function isEditable(el: Element): boolean {
  return el instanceof HTMLElement && (el.isContentEditable || "value" in el);
}

function caretToEnd(doc: Document, el: Element): void {
  if ("value" in el) {
    const box = el as HTMLInputElement;
    box.setSelectionRange(box.value.length, box.value.length);
    return;
  }
  const range = doc.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = doc.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export function wheel(doc: Document, p: Point, dy: number): void {
  const win = doc.defaultView!;
  const el = hitAt(doc, p) ?? doc.documentElement;
  const go = el.dispatchEvent(new win.WheelEvent("wheel", { bubbles: true, cancelable: true, composed: true, clientX: p.x, clientY: p.y, deltaY: dy }));
  if (!go) return;
  // A wheel scrolls the nearest box that can scroll, as the browser does.
  for (let box: Element | null = el; box; box = box.parentElement ?? ((box.getRootNode() as ShadowRoot).host ?? null)) {
    const style = win.getComputedStyle(box);
    if (/(auto|scroll)/.test(style.overflowY) && box.scrollHeight > box.clientHeight) {
      box.scrollBy({ top: dy });
      return;
    }
  }
  doc.scrollingElement?.scrollBy({ top: dy });
}
