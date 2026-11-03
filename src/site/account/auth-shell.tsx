import Image from "next/image";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo";
import { backgrounds } from "@/site/content/backgrounds";
import { SizedPhoto } from "@/site/ui/sized-photo";

/** Cori, happy and still, in the brand blue (scripts/agents/build-cori.mts). */
const CORI = "/preview/images/agents/cori-general.svg";

/**
 * The frame of the sign in, sign up and connect pages. On a wide screen it
 * is two halves under the navbar: Coere's brand on a blue background, and
 * the page's one task on white. On a phone the brand is a short band above
 * the form.
 */
export function AuthShell({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid lg:min-h-[calc(100dvh-72px)] lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center px-4 pt-10 pb-20 sm:px-6 lg:px-12 lg:py-20">
        <div className="w-full max-w-[440px]">
          <p className="text-sm font-medium text-brand-600">{eyebrow}</p>
          <h1 className="mt-3 text-[2rem] leading-[1.1] font-medium tracking-[-0.04em] text-neutral-950 text-balance md:text-[2.5rem]">{title}</h1>
          {lede ? <p className="mt-4 text-[17px] leading-relaxed text-neutral-500 text-pretty">{lede}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Coere's mark and name in white on blue, the line that says what it is, and Cori. */
function BrandPanel() {
  return (
    <div className="relative isolate overflow-hidden bg-brand-900 text-white">
      <SizedPhoto src={backgrounds.dune.src} alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" className="-z-20 object-cover" />
      {/* Deepens the top and bottom, so the white words hold on the bright parts. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-brand-950/45 via-brand-950/5 to-brand-950/50" />

      {/* A phone: one short band. */}
      <div className="flex items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:hidden">
        <div>
          <Mark size="sm" />
          <p className="mt-2 text-[14px] text-white/80">One memory for every AI.</p>
        </div>
        <Image src={CORI} alt="Cori, Coere's helper" width={256} height={256} unoptimized className="h-[88px] w-[88px] shrink-0 drop-shadow-[0_10px_18px_rgba(5,9,23,0.35)]" />
      </div>

      {/* A wide screen: the full height panel. */}
      <div className="hidden h-full flex-col justify-between p-12 lg:flex xl:p-16">
        <Mark size="lg" />
        <div className="flex flex-col items-start">
          <div className="relative">
            <p className="absolute -top-2 left-[150px] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[15px] font-medium whitespace-nowrap text-neutral-950 shadow-[0_12px_30px_-12px_rgba(5,9,23,0.5)]">
              Hi, I&apos;m Cori.
            </p>
            <Image src={CORI} alt="" width={256} height={256} unoptimized className="h-[168px] w-[168px] drop-shadow-[0_18px_30px_rgba(5,9,23,0.4)] xl:h-[188px] xl:w-[188px]" />
          </div>
          <p className="mt-10 max-w-[12ch] text-5xl leading-[1.02] font-medium tracking-[-0.045em] text-balance xl:text-6xl">One memory for every AI.</p>
          <p className="mt-5 max-w-[38ch] text-[17px] leading-relaxed text-white/80 text-pretty">
            Your chats from ChatGPT, Claude, Gemini and more, kept in one memory you own.
          </p>
        </div>
      </div>
    </div>
  );
}

/** The Coere mark and name in white. */
function Mark({ size }: { size: "sm" | "lg" }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark className={size === "lg" ? "h-11 w-11 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className={`font-semibold tracking-[-0.03em] ${size === "lg" ? "text-[34px]" : "text-[22px]"}`}>Coere</span>
    </span>
  );
}

/** The card a form sits in, alone on the white side. */
export const authCardClass = "rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(8,14,36,0.04),0_16px_40px_-24px_rgba(8,14,36,0.18)] sm:p-8";

/** The quiet button under a form's main one, for the other ways through it. */
export const textButtonClass =
  "group rounded-md text-[14px] text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";

/**
 * The line a form shows its error or notice in, read out as it changes. It
 * closes up while empty, taking back the card's gap above it, and stays in
 * the page so screen readers keep listening to it.
 */
export function FormStatus({ error, notice }: { error: string | null; notice?: string | null }) {
  return (
    <p role="status" aria-live="polite" className={`min-h-5 text-[13px] empty:-mt-6 empty:min-h-0 ${error ? "text-red-600" : "text-neutral-500"}`}>
      {error ?? notice ?? ""}
    </p>
  );
}
