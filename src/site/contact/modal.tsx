"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/site/ui/icons/interface-icons";

/**
 * A pop up on the native dialog element. showModal gives the focus trap, the
 * inert page behind and Escape for free; this adds a click on the dimmed
 * page to close, and puts focus back on the link that opened it (Safari does
 * not focus a link on click, so the browser alone cannot). The card is dark
 * glass with a fine light border; its look and motion are .coere-modal in
 * globals.css.
 */
export function Modal({
  open,
  onClose,
  opener,
  labelledBy,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** The link or button that opened it, focused again on close. */
  opener: HTMLElement | null;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Where the press began, so selecting text in the card and letting go outside it does not close it.
  const pressedOutside = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const closed = () => {
      onClose();
      // A link inside a menu that closed meanwhile is gone or hidden; leave focus where the browser put it.
      if (opener?.isConnected && opener.checkVisibility?.() !== false) opener.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", closed);
    return () => dialog.removeEventListener("close", closed);
  }, [onClose, opener]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      // The dialog itself is the dimmed page around the card, so a click that lands on it is outside the card.
      onPointerDown={(event) => {
        pressedOutside.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && pressedOutside.current) event.currentTarget.close();
      }}
      className={`coere-modal m-auto max-h-[calc(100dvh-32px)] max-w-[calc(100vw-32px)] overflow-visible bg-transparent p-0 text-white backdrop:bg-transparent ${className}`}
    >
      {children}
    </dialog>
  );
}

/** The card inside a pop up: dark glass, a fine white border and a soft shadow. */
export const MODAL_CARD =
  "relative rounded-[22px] border border-white/10 bg-[#0f0e18]/88 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl";

/** A pop up's close button: a plain cross in a quiet square that lights on hover. */
export function CloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
    >
      <CloseIcon size={18} />
    </button>
  );
}
