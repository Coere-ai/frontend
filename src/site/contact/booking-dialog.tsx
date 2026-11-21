"use client";

import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/site/i18n/client";
import { ArrowUpRightIcon } from "@/site/ui/icons/interface-icons";
import { mountBooking } from "./cal-embed";
import { BOOKING_URL } from "./links";
import { CloseButton, MODAL_CARD, Modal } from "./modal";

/** Idle until the calendar says it has loaded or failed; the pop up shows "Loading" while idle. */
export type BookingState = "idle" | "ready" | "failed";

/** How long the calendar may take before the pop up offers the page in a new tab. */
const LOAD_TIMEOUT_MS = 15000;

/**
 * "Book a demo": the founders' Cal.com booking page, inside a large dark pop
 * up. The embed loads the first time it opens and stays for the visit, so a
 * second open is instant. When it cannot load (a blocked script, a slow
 * network), the pop up says so and offers the page in a new tab, and the
 * layer opens later clicks straight in a new tab (onFailed).
 */
export function BookingDialog({ open, opener, onClose, onFailed }: { open: boolean; opener: HTMLElement | null; onClose: () => void; onFailed: () => void }) {
  const t = useMessages("chrome").booking;
  const frameRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [state, setState] = useState<BookingState>("idle");

  // The latest answer, read by the callbacks, which outlive the render that made them.
  const result = useRef<BookingState>("idle");

  useEffect(() => {
    if (!open || started.current || !frameRef.current) return;
    started.current = true;
    // A late "ready" still wins over a timeout; a failure never hides a calendar that loaded.
    const settle = (next: BookingState) => {
      if (result.current === "ready" || result.current === next) return;
      result.current = next;
      setState(next);
      if (next === "failed") onFailed();
    };
    mountBooking(frameRef.current, { onReady: () => settle("ready"), onFailed: () => settle("failed") });
    // No clean up: the embed stays for the visit.
    setTimeout(() => {
      if (result.current === "idle") settle("failed");
    }, LOAD_TIMEOUT_MS);
  }, [open, onFailed]);

  return (
    <Modal open={open} onClose={onClose} opener={opener} labelledBy="booking-title" className="w-[1040px]">
      <div className={`${MODAL_CARD} flex max-h-[calc(100dvh-32px)] flex-col overflow-hidden`}>
        <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3.5 pr-3.5 pl-6">
          <div className="min-w-0">
            <h2 id="booking-title" className="text-[19px] font-semibold tracking-[-0.03em] text-white">
              {t.title}
            </h2>
            <p className="truncate text-[13px] text-white/55">{t.line}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-[10px] px-3 text-[14px] text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:inline-flex"
            >
              {t.newTab}
              <ArrowUpRightIcon size={16} />
            </a>
            <CloseButton label={t.close} onClick={onClose} />
          </div>
        </div>
        {/* Cal.com sizes its frame to the page it shows, so the pop up is as tall as the calendar and scrolls past the screen's height. */}
        <div className="relative min-h-[min(560px,calc(100dvh-120px))] flex-1 overflow-y-auto overscroll-contain">
          <div ref={frameRef} data-state={state} />
          {state === "idle" ? (
            <p role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-white/50 motion-safe:animate-pulse">
              {t.loading}
            </p>
          ) : null}
          {state === "failed" ? (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#0f0e18] px-6 text-center">
              <p className="text-[17px] text-white/75">{t.failed}</p>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-[12px] bg-brand-500 px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.openPage}
                <ArrowUpRightIcon size={17} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
