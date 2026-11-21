"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { BookingDialog } from "./booking-dialog";
import { ContactDialog } from "./contact-dialog";
import { BOOKING_URL, DEFAULT_SUBJECT, isBookingHref, readMailto } from "./links";

type Open = { kind: "contact"; subject: string } | { kind: "booking" } | null;

/**
 * Turns the site's plain links into its two pop ups. Every link that writes
 * to the team (a mailto to siteConfig.email, wherever it is: the footer, a
 * menu, a FAQ answer, a blog post) opens the contact pop up, and every link
 * to the booking page opens the booking pop up. The links keep their plain
 * href, so without JavaScript they still write or book, and a click with a
 * modifier key (to open a new tab) is left to the browser.
 *
 * One listener on the document covers links drawn anywhere, Markdown
 * included. It runs after React's own click handlers, and skips a click one
 * of them already handled.
 */
export function ContactLayer() {
  const [open, setOpen] = useState<Open>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  // Once the calendar has failed to load, later clicks open the booking page in a new tab.
  const bookingFailed = useRef(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      // The pop ups' own links (Apple Mail is a mailto) go where they say.
      if (!(link instanceof HTMLAnchorElement) || link.closest("dialog")) return;
      const href = link.getAttribute("href") ?? "";
      const mail = readMailto(href, siteConfig.email);
      if (mail) {
        event.preventDefault();
        setOpener(link);
        setOpen({ kind: "contact", subject: mail.subject });
      } else if (isBookingHref(href)) {
        event.preventDefault();
        if (bookingFailed.current) {
          window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
          return;
        }
        setOpener(link);
        setOpen({ kind: "booking" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const close = useCallback(() => setOpen(null), []);
  const failed = useCallback(() => {
    bookingFailed.current = true;
  }, []);

  return (
    <>
      <ContactDialog open={open?.kind === "contact"} subject={open?.kind === "contact" ? open.subject : DEFAULT_SUBJECT} opener={opener} onClose={close} />
      <BookingDialog open={open?.kind === "booking"} opener={opener} onClose={close} onFailed={failed} />
    </>
  );
}
