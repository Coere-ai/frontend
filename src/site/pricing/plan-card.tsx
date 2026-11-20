"use client";

import Link from "next/link";
import PixelCard from "@/site/bits/PixelCard";
import type { Plan } from "@/site/content/pricing";
import { CheckIcon } from "@/site/ui/icons/interface-icons";
import { usePageTone } from "@/site/ui/page-theme";

/** Coere blue pixels: pale to full on white, full to white on near black. */
const LIGHT = ["#e0e5ff", "#a3b0fd", "#5267f7"];
const DARK = ["#7f8bfa", "#5267f7", "#c6cfff"];

/**
 * One plan on a PixelCard. The pixels light up from the edges on hover,
 * and fade toward the middle, so the words stay readable over them. The
 * featured plan sits on near black, so it stands out from the two beside
 * it, and its pixels light on hover like the others. The card itself takes no focus; its button
 * does, and lights the pixels too. On a dark page (the home page) the two
 * beside it turn dark as well: a flat raised near black with a fine light
 * rim, light words and white buttons, with the same blue pixels on hover.
 */
export function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured === true;
  const onDark = usePageTone() === "dark";
  const dark = featured || onDark;
  const external = !plan.cta.href.startsWith("/");
  const button = `inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
    featured
      ? "bg-brand-500 text-white shadow-[0_12px_30px_-12px_rgba(82,103,247,0.9)] hover:bg-brand-400 focus-visible:outline-white"
      : dark
        ? "bg-white text-neutral-950 hover:bg-white/85 focus-visible:outline-white"
        : "bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:outline-brand-500"
  }`;
  return (
    <PixelCard
      theme={dark ? "dark" : "light"}
      colors={dark ? DARK : LIGHT}
      gap={featured ? 7 : 8}
      speed={featured ? 30 : 25}
      fade={0.85}
      opacity={featured ? 0.75 : 0.9}
      trigger="hover"
      glowColor="#5267f7"
      radius={28}
      noFocus
      className={`h-auto! w-full! place-items-stretch! ${featured ? "ring-1 ring-brand-500/40 lg:-my-5" : dark ? "bg-none! bg-[#12111b]!" : ""}`}
    >
      <div className={`flex h-full flex-col p-8 md:p-9 ${featured ? "text-white lg:py-14" : dark ? "text-white" : "text-neutral-950"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[22px] font-semibold tracking-[-0.03em]">{plan.name}</h3>
          <span className={`text-[13px] font-medium ${dark ? "text-brand-300" : "text-brand-600"}`}>{plan.kind}</span>
        </div>
        <p className="mt-8 text-[44px] leading-none font-semibold tracking-[-0.045em]">{plan.price}</p>
        <p className={`mt-3 text-[14px] ${dark ? "text-white/65" : "text-neutral-500"}`}>{plan.priceNote}</p>
        <p className={`mt-6 text-[16px] leading-relaxed ${dark ? "text-white/85" : "text-neutral-600"}`}>{plan.line}</p>
        <ul className="mt-7 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className={`flex gap-3 text-[15px] leading-snug ${dark ? "text-white/90" : "text-neutral-700"}`}>
              <CheckIcon size={18} strokeWidth={2} className={`mt-px shrink-0 ${dark ? "text-brand-300" : "text-brand-500"}`} />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-9">
          {external ? (
            <a href={plan.cta.href} className={button}>
              {plan.cta.label}
            </a>
          ) : (
            <Link href={plan.cta.href} className={button}>
              {plan.cta.label}
            </Link>
          )}
        </div>
      </div>
    </PixelCard>
  );
}
