import Image from "next/image";
import type { ReactNode, Ref } from "react";
import { LogoMark } from "@/components/logo";

/** The AIs a chat can come from in the mocks, with their logos in /public. */
export const AI = {
  chatgpt: { name: "ChatGPT", logo: "/openai.svg" },
  claude: { name: "Claude", logo: "/claude-color.svg" },
  gemini: { name: "Gemini", logo: "/gemini-color.svg" },
} as const;

export type AiKey = keyof typeof AI;

/** The chats the made up account Maya Collins saved, as the real dashboard's README pictures show them. */
const chats: { title: string; ai: AiKey; when: string; memories: number }[] = [
  { title: "Convert a budget to euros", ai: "gemini", when: "2 min ago", memories: 4 },
  { title: "Thank you message for the crew", ai: "chatgpt", when: "1 h ago", memories: 3 },
  { title: "Slide outline for a roadmap", ai: "claude", when: "Yesterday", memories: 6 },
  { title: "Coffee order for the studio", ai: "chatgpt", when: "2 days ago", memories: 2 },
];

/** Tokens saved per day this week, for the small chart. */
const week = [32, 41, 38, 52, 47, 61, 72];

function Spark() {
  const max = Math.max(...week);
  const points = week.map((v, i) => `${(i / (week.length - 1)) * 100},${30 - (v / max) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 h-7 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5267f7" stopOpacity="0.28" />
          <stop offset="1" stopColor="#5267f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,32 ${points} 100,32`} fill="url(#spark-fill)" />
      <polyline points={points} fill="none" stroke="#5267f7" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ label, value, unit, note, children }: { label: string; value: string; unit?: string; note: string; children?: ReactNode }) {
  return (
    <div className="rounded-[12px] bg-neutral-50 px-3.5 pt-3 pb-3 ring-1 ring-neutral-950/[0.04]">
      <p className="text-[10.5px] font-medium text-neutral-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1 text-[24px] leading-none font-semibold tracking-[-0.03em] text-neutral-950">
        {value}
        {unit ? <span className="text-[12px] font-medium tracking-normal text-neutral-500">{unit}</span> : null}
      </p>
      {children}
      <p className="mt-1.5 text-[10px] text-neutral-500">{note}</p>
    </div>
  );
}

const nav = ["Home", "Memory", "Library", "Statistics"];

/**
 * The Coere dashboard as a drawing for the hero: tokens saved, efficiency
 * and time saved this month, and the chats saved from each AI. The numbers
 * are made up for the made up account Maya Collins.
 */
/** `compact` leaves out the side menu, for the narrower drawing a phone shows. */
export function MockDashboard({ className = "", compact = false, ref }: { className?: string; compact?: boolean; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={`overflow-hidden rounded-[18px] bg-white shadow-[0_2px_4px_rgba(20,17,15,0.04),0_30px_70px_-24px_rgba(23,27,77,0.35)] ring-1 ring-neutral-950/[0.07] ${className}`}>
      <div className="flex h-10 items-center justify-between border-b border-neutral-100 px-4">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-neutral-950">
          <LogoMark className="h-4 w-4 text-brand-500" />
          Coere
          <span className="font-normal text-neutral-400">Dashboard</span>
        </span>
        <span className="flex items-center gap-2 text-[11px] text-neutral-600">
          Maya Collins
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-[9.5px] font-semibold text-brand-700">MC</span>
        </span>
      </div>

      <div className="flex">
        <ul className={`w-[112px] shrink-0 space-y-0.5 border-r border-neutral-100 p-2.5 pt-3 ${compact ? "hidden" : ""}`}>
          {nav.map((item, i) => (
            <li key={item} className={`rounded-[8px] px-2.5 py-1.5 text-[11px] ${i === 0 ? "bg-brand-50 font-medium text-brand-600" : "text-neutral-600"}`}>
              {item}
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-950">Welcome back, Maya</p>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-600">This month</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <Stat label="Tokens saved" value="1.28M" note="+18% on last week">
              <Spark />
            </Stat>
            <Stat label="Efficiency" value="94" unit="%" note="of chats began with context">
              <div className="mt-2 h-7 pt-2.5">
                <div className="h-2 overflow-hidden rounded-full bg-neutral-200/80">
                  <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                </div>
              </div>
            </Stat>
            <Stat label="Time saved" value="11.4" unit="h" note="no context typed twice">
              <div className="mt-2 flex h-7 items-end gap-[3px]" aria-hidden="true">
                {[40, 55, 35, 70, 60, 85, 100].map((h, i) => (
                  <span key={i} className={`flex-1 rounded-[2px] ${i === 6 ? "bg-neutral-950" : "bg-neutral-300"}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </Stat>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <p className="text-[10px] font-semibold tracking-[0.06em] text-neutral-500 uppercase">Recent chats</p>
            <p className="text-[10px] text-neutral-400">248 saved from 3 AIs</p>
          </div>
          <ul className="mt-1.5 divide-y divide-neutral-100">
            {chats.map((chat) => (
              <li key={chat.title} className="flex items-center gap-2.5 py-[7px]">
                <Image src={AI[chat.ai].logo} alt="" width={14} height={14} unoptimized className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-neutral-900">{chat.title}</span>
                <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9.5px] font-medium text-brand-600">{chat.memories} memories</span>
                <span className="w-[62px] shrink-0 text-right text-[10px] text-neutral-400">{chat.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
