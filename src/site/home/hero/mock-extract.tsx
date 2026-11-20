"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";
import { CheckIcon } from "@/site/ui/icons/interface-icons";
import { AI, type AiKey } from "./mock-dashboard";

/** Each AI's chats, and how many are saved when the drawing starts. */
const sources: { ai: AiKey; total: number; start: number }[] = [
  { ai: "chatgpt", total: 164, start: 118 },
  { ai: "claude", total: 82, start: 49 },
  { ai: "gemini", total: 31, start: 31 },
];

const STEP_MS = 900;
/** Steps before the drawing starts over, so it never sits finished for long. */
const LOOP = 70;

/**
 * Extract all as a drawing: Coere saving every chat from ChatGPT, Claude
 * and Gemini to this computer, the counts climbing as it reads. With reduced
 * motion it holds still on its first frame.
 */
export function MockExtract({ className = "" }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % LOOP), STEP_MS);
    return () => window.clearInterval(timer);
  }, []);

  const counts = sources.map((s) => Math.min(s.total, s.start + Math.floor(step * (s.ai === "chatgpt" ? 1 : 0.6))));
  const saved = counts.reduce((a, b) => a + b, 0);
  const total = sources.reduce((a, s) => a + s.total, 0);
  const done = saved === total;

  return (
    <div className={`rounded-[16px] bg-white p-4 shadow-[0_2px_4px_rgba(20,17,15,0.04),0_24px_50px_-20px_rgba(23,27,77,0.35)] ring-1 ring-neutral-950/[0.07] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-neutral-950">
          <LogoMark className="h-4 w-4 text-brand-500" />
          Extract all
        </span>
        <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${done ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-600"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-500" : "animate-pulse bg-brand-500"}`} />
          {done ? "Done" : "In progress"}
        </span>
      </div>

      <ul className="mt-3.5 space-y-3">
        {sources.map((s, i) => {
          const count = counts[i];
          const full = count === s.total;
          return (
            <li key={s.ai}>
              <div className="flex items-center gap-2 text-[11.5px]">
                <Image src={AI[s.ai].logo} alt="" width={14} height={14} unoptimized className="h-3.5 w-3.5" />
                <span className="flex-1 font-medium text-neutral-900">{AI[s.ai].name}</span>
                <span className="text-neutral-500 tabular-nums">
                  {count} of {s.total}
                </span>
                {full ? <CheckIcon size={13} strokeWidth={2.4} className="text-emerald-500" /> : <span className="w-[13px]" />}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${full ? "bg-emerald-400" : "bg-brand-500"}`} style={{ width: `${(count / s.total) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3.5 border-t border-neutral-100 pt-2.5 text-[10.5px] text-neutral-500">
        <span className="font-medium text-neutral-900 tabular-nums">{saved}</span> of {total} chats saved on this computer
      </p>
    </div>
  );
}
