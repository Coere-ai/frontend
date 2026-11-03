"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { discoverSections } from "@/lib/analytics/sections/discover";

/** The frame renders the page at a desktop width and is scaled to fit, so
 *  every preview is the same page at the same size and the cards compare. */
const FRAME_W = 1280;
const FRAME_H = 820;

/**
 * Scroll a loaded frame to one section, and freeze it there.
 *
 * Done from here rather than from the page, so the public page carries nothing
 * that exists only for this dashboard. Three jobs: stop all motion so the
 * preview is the resting state, reveal entrances that wait for a scroll that
 * will never come, and position the frame on the section. The section is found
 * by DOM id first, then by the same discovery the tracker uses, which is what
 * finds a heading-derived section that has no id of its own.
 */
function settle(frame: HTMLIFrameElement, id: string): void {
  let doc: Document | null = null;
  try {
    doc = frame.contentDocument;
  } catch {
    return;
  }
  if (!doc || !doc.documentElement) return;

  try {
    const still = doc.createElement("style");
    still.textContent =
      "*,*::before,*::after{transition:none!important;animation:none!important}" +
      "html{overflow:hidden!important;scroll-behavior:auto!important}" +
      // Motion's entrances start from an inline opacity:0 and wait for a
      // scroll; this is the same reveal the root layout's noscript rule uses.
      '[style*="opacity:0"]{opacity:1!important;transform:none!important;filter:none!important}';
    doc.head?.appendChild(still);

    const scrolled = doc.documentElement.scrollTop || 0;
    const byId = doc.getElementById(id)?.getBoundingClientRect().top;
    const top = byId ?? discoverSections(doc).find((s) => s.id === id)?.top;
    if (top !== undefined) {
      doc.defaultView?.scrollTo(0, Math.max(0, Math.round(top + scrolled)));
    }
  } catch {
    // A preview that will not position itself is still a preview.
  }
}

/**
 * The section itself, live, in a frame scaled to the card.
 *
 * `?preview=1` marks the request as a preview, so a page could drop heavy media
 * for it; everything else is the real page with its real stylesheet. The frame
 * is inert: no pointer events, not in the tab order, hidden from assistive
 * tech, which reads the numbers beside it instead. Every card on a page uses
 * the same URL, so the page is fetched once and served from cache to the rest.
 */
export function SectionPreview({ path, id, label }: { path: string; id: string; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    // Measured directly first, so the frame appears on the first paint rather
    // than waiting for an observer callback that may never come.
    const measure = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setScale(width / FRAME_W);
    };
    measure();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={box}
      className="relative w-full overflow-hidden border-b"
      style={{
        aspectRatio: `${FRAME_W} / ${FRAME_H}`,
        borderColor: "var(--color-border)",
        background: "var(--color-canvas-soft)",
      }}
    >
      {scale > 0 && (
        <iframe
          src={`${path}?preview=1`}
          title={`Preview of the ${label} section`}
          aria-hidden="true"
          tabIndex={-1}
          loading="lazy"
          onLoad={(e) => settle(e.currentTarget, id)}
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
          style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
