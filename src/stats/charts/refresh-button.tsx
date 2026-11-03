"use client";

import { useEffect, useState } from "react";

/**
 * Manual refresh, with a live countdown to the next automatic one on hover.
 *
 * Each click adds 360 degrees to the icon's rotation and a CSS transition
 * spins it, which can be triggered again mid-spin. `intervalSec` should match
 * the panel's polling interval, so the countdown tells the truth.
 */
export function RefreshButton({
  onRefresh,
  intervalSec = 60,
}: {
  onRefresh: () => void;
  intervalSec?: number;
}) {
  const [rotation, setRotation] = useState(0);
  const [hover, setHover] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(intervalSec);

  // A 1s countdown that loops, paused while the tab is hidden, the same as
  // the automatic refresh.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setSecondsLeft((s) => (s <= 1 ? intervalSec : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [intervalSec]);

  const trigger = () => {
    setRotation((r) => r + 360);
    setSecondsLeft(intervalSec);
    onRefresh();
  };

  return (
    <div className="relative shrink-0" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button
        type="button"
        onClick={trigger}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2 text-[12.5px] font-medium text-zinc-700 transition-colors hover:bg-[color:var(--color-canvas-soft)]"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.6s ease-in-out" }}
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Refresh
      </button>

      {hover && (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-[calc(100%+6px)] right-0 z-50 w-max max-w-[220px] rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]"
        >
          Next refresh in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
