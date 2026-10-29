import type { Plan } from "./plan";

/** Easing that starts quick and settles gently, as interface motion does. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const POINTER_MS = 650;
const TYPE_MS = 32;
const REVEAL_MS = 460;
const REVEAL_GAP = 85;

/** A plan with its starting states applied, ready to play. */
export type Prepared = { play: (from: { x: number; y: number } | null) => number };

/** The text nodes an element holds directly. */
const ownTexts = (el: HTMLElement) => [...el.childNodes].filter((n): n is Text => n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim());

/**
 * Puts a screen in its starting state before it is shown: typed text empty,
 * new pieces hidden, streamed words hidden. Nothing flashes, because the
 * screen is still invisible while this runs. `play` then moves it on to how
 * it was saved, and answers how long that takes.
 */
export function prepare(doc: Document, plan: Plan): Prepared {
  const typed = plan.type.map(({ el, text }) => {
    const nodes = ownTexts(el);
    nodes.forEach((n, i) => (n.textContent = i === 0 ? "" : ""));
    return { node: nodes[0], text };
  });
  for (const el of plan.reveal) el.style.opacity = "0";
  const words = plan.stream.flatMap((el) =>
    ownTexts(el).flatMap((node) => {
      const parts = (node.textContent ?? "").split(/(\s+)/);
      const spans = parts.map((part) => {
        const span = doc.createElement("span");
        span.textContent = part;
        if (part.trim()) span.style.opacity = "0";
        return span;
      });
      node.replaceWith(...spans);
      return spans.filter((s) => s.textContent?.trim());
    }),
  );
  const pointer = doc.getElementById("coere-pointer");
  if (pointer) pointer.style.opacity = "0";

  return {
    play(from) {
      let t = 0;
      // The pointer travels to where it was when this moment was saved, then presses.
      if (pointer && plan.point) {
        const start = from ?? { x: plan.point.x + 140, y: plan.point.y + 90 };
        pointer.style.transition = "none";
        pointer.animate(
          [
            { left: `${start.x}px`, top: `${start.y}px`, opacity: from ? 1 : 0 },
            { left: `${plan.point.x}px`, top: `${plan.point.y}px`, opacity: 1 },
          ],
          { duration: POINTER_MS, easing: EASE, fill: "forwards" },
        );
        pointer.animate([{ scale: "1" }, { scale: "0.82" }, { scale: "1" }], { duration: 220, delay: POINTER_MS, fill: "none" });
        t = POINTER_MS + 120;
      }
      for (const { node, text } of typed) {
        if (!node) continue;
        const step = Math.min(TYPE_MS, 1700 / Math.max(1, text.length));
        for (let i = 1; i <= text.length; i++) setTimeout(() => (node.textContent = text.slice(0, i)), t + i * step);
        t += text.length * step + 180;
      }
      plan.reveal.forEach((el, i) => {
        el.animate(
          [
            { opacity: 0, translate: "0 10px", filter: "blur(3px)" },
            { opacity: 1, translate: "0 0", filter: "blur(0)" },
          ],
          { duration: REVEAL_MS, delay: t + i * REVEAL_GAP, easing: EASE, fill: "forwards" },
        );
      });
      if (plan.reveal.length) t += plan.reveal.length * REVEAL_GAP + 200;
      const per = Math.min(28, 2400 / Math.max(1, words.length));
      words.forEach((span, i) => span.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: t + i * per, fill: "forwards" }));
      t += words.length * per + 260;
      return t;
    },
  };
}
