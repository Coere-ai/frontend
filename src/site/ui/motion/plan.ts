import { editableOf, leavesOf, newestGroup, type Leaf } from "./leaves";

/** What a screen does when it comes on, worked out from what changed since the last one. */
export type Plan = {
  /** Text typed into a text box, letter by letter. */
  type: { el: HTMLElement; text: string }[];
  /** New panels, rows and cards that slide in, top to bottom. */
  reveal: HTMLElement[];
  /** Long new text that streams in word by word, like an answer being written. */
  stream: HTMLElement[];
  /** Where the pointer should travel to before the change, in the screen's pixels. */
  point: { x: number; y: number } | null;
  /** True when this screen is a different page, not the same one moving on. */
  cut: boolean;
};

/** New text this long streams in; shorter text, like a sent message, slides in whole. */
const LONG = 140;
/** On a new page, the answer that writes itself can be a little shorter. */
const LONG_ON_CUT = 70;

/** Plans a screen against the one before it, or on its own when it is the first. */
export function planShot(doc: Document, prev: Document | null): Plan {
  const leaves = leavesOf(doc);
  const before = new Set(prev ? leavesOf(prev).map((l) => l.text) : []);
  const shared = leaves.filter((l) => before.has(l.text)).length / Math.max(1, leaves.length);
  const cut = !prev || shared < 0.55;
  const isNew = (el: HTMLElement) => !before.has(leaves.find((l) => l.el === el)?.text ?? "");
  const fresh: Leaf[] = cut ? [] : leaves.filter((l) => !before.has(l.text));

  const type: Plan["type"] = [];
  const stream: HTMLElement[] = [];
  const groups = new Set<HTMLElement>();
  const typed = new Set<HTMLElement>();

  // A text box's words are always typed: on a new page as well as on a change.
  for (const leaf of leaves) {
    const box = editableOf(leaf.el);
    if (box && !typed.has(leaf.el) && (cut || !before.has(leaf.text)) && leaf.text.length < 220) {
      type.push({ el: leaf.el, text: leaf.text });
      typed.add(leaf.el);
    }
  }
  for (const leaf of fresh) {
    if (typed.has(leaf.el)) continue;
    if (leaf.text.length > LONG) stream.push(leaf.el);
    else groups.add(newestGroup(leaf.el, isNew, leaves));
  }
  // On a new page, the last long text on it is the answer being written.
  if (cut) {
    const long = leaves.filter((l) => l.text.length > LONG_ON_CUT && !typed.has(l.el));
    const last = long.at(-1);
    if (last) stream.push(...long.filter((l) => l.el.parentElement === last.el.parentElement).map((l) => l.el));
  }
  // A group holding a streamed line streams instead of sliding in.
  const reveal = [...groups].filter((g) => !stream.some((s) => g.contains(s) && g !== s)).slice(0, 14);

  const pointer = doc.getElementById("coere-pointer");
  const left = pointer ? parseFloat(pointer.style.left) : NaN;
  const top = pointer ? parseFloat(pointer.style.top) : NaN;
  const point = Number.isFinite(left) && Number.isFinite(top) && left < doc.defaultView!.innerWidth - 8 ? { x: left, y: top } : null;
  return { type, reveal, stream: stream.slice(0, 8), point, cut };
}
