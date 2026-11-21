"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { useMessages } from "@/site/i18n/client";
import { ArrowUpRightIcon, CheckIcon, CopyIcon } from "@/site/ui/icons/interface-icons";
import { gmailComposeHref, mailtoHref, outlookComposeHref } from "./links";
import { CloseButton, MODAL_CARD, Modal } from "./modal";

type CopyState = "idle" | "copied" | "selected";

/**
 * Puts the address on the clipboard. Where the browser refuses clipboard
 * access, it selects the address on the page and tries the older copy
 * command; if that is refused too, the address stays selected for the
 * keyboard.
 */
async function copyAddress(node: HTMLElement | null): Promise<CopyState> {
  try {
    await navigator.clipboard.writeText(siteConfig.email);
    return "copied";
  } catch {
    if (!node) return "idle";
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    try {
      return document.execCommand("copy") ? "copied" : "selected";
    } catch {
      return "selected";
    }
  }
}

/**
 * "Get in touch": the founders' address, large, with a Copy button, and a
 * new message ready in Gmail, Outlook or the computer's own mail app. Each
 * service shows its own logo (public/brands, sources noted in each file).
 */
export function ContactDialog({ open, subject, opener, onClose }: { open: boolean; subject: string; opener: HTMLElement | null; onClose: () => void }) {
  const t = useMessages("chrome");
  const c = t.contact;
  const addressRef = useRef<HTMLSpanElement>(null);
  const [copy, setCopy] = useState<CopyState>("idle");

  // "Copied" shows for a moment, then the button reads Copy again.
  useEffect(() => {
    if (copy !== "copied") return;
    const timer = setTimeout(() => setCopy("idle"), 1800);
    return () => clearTimeout(timer);
  }, [copy]);

  const close = () => {
    setCopy("idle");
    onClose();
  };

  const email = siteConfig.email;
  const services = [
    { name: "Gmail", line: c.gmail, href: gmailComposeHref(email, subject), logo: "/brands/gmail.svg", web: true },
    { name: "Outlook", line: c.outlook, href: outlookComposeHref(email, subject), logo: "/brands/outlook.svg", web: true },
    { name: "Apple Mail", line: c.appleMail, href: mailtoHref(email, subject), logo: "/brands/apple-mail.svg", web: false },
  ];

  return (
    <Modal open={open} onClose={close} opener={opener} labelledBy="contact-title" className="w-[480px]">
      <div className={`${MODAL_CARD} p-6 sm:p-8`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="contact-title" className="text-[26px] leading-tight font-semibold tracking-[-0.035em] text-white">
              {c.title}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-pretty text-white/60">{c.line}</p>
          </div>
          <div className="-mt-1 -mr-2">
            <CloseButton label={c.close} onClick={close} />
          </div>
        </div>

        <div className="mt-7 rounded-[16px] border border-white/10 bg-white/[0.035] p-2 sm:pl-5">
          <p className="sr-only">{c.address}</p>
          {/* On a phone the address takes the whole line and Copy sits under it, so the address is never cut off. */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span ref={addressRef} className="min-w-0 px-2 pt-2 pb-1 text-center text-[20px] font-medium tracking-[-0.02em] break-all text-white select-all sm:truncate sm:p-0 sm:py-2 sm:text-left sm:text-[21px]">
              {email}
            </span>
            <button
              type="button"
              onClick={async () => setCopy(await copyAddress(addressRef.current))}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-brand-500 px-4 text-[15px] font-medium text-white shadow-[0_8px_20px_-10px_rgba(82,103,247,0.8)] transition-colors hover:bg-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {copy === "copied" ? <CheckIcon size={17} strokeWidth={2} /> : <CopyIcon size={17} />}
              <span className="sm:min-w-[3.25rem] sm:text-left">{copy === "copied" ? t.common.copied : t.common.copy}</span>
            </button>
          </div>
        </div>
        <p aria-live="polite" className={`mt-2 min-h-5 text-[13px] text-white/50 ${copy === "selected" ? "" : "sr-only"}`}>
          {copy === "selected" ? c.selected : copy === "copied" ? t.common.copied : ""}
        </p>

        <p className="mt-4 text-[13px] font-medium text-white/50">{c.openIn}</p>
        <ul className="mt-3 grid gap-2">
          {services.map((service) => (
            <li key={service.name}>
              <a
                href={service.href}
                {...(service.web ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-4 rounded-[14px] border border-white/[0.08] bg-white/[0.025] px-4 py-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a small brand SVG, drawn as is */}
                <img src={service.logo} alt="" width={28} height={28} className="size-7 shrink-0 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-white">{service.name}</span>
                  <span className="block text-[13px] text-white/50">{service.line}</span>
                </span>
                <ArrowUpRightIcon size={18} className="shrink-0 text-white/40 transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white motion-reduce:transition-none" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
