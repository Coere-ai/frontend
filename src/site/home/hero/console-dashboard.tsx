"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";

/**
 * The Coere dashboard (the extension's Console) drawn for the home hero,
 * to the Console's own look: its rail with the six sections and their
 * icons, the Home page's title, cards with a hairline and a 16px corner,
 * stat tiles on a quiet fill, the chats saved by AI as one split bar, and
 * the chats saved last with each AI's logo. Colours, sizes and spacing come
 * from the Console's tokens (packages/ui tokens.css, console rail.css and
 * statistics.css in coere-v2). The numbers are made up for the made up
 * account Maya Collins. It is real text and SVG, so it stays sharp at any
 * scale. On load the figures count up and the chats come in one by one,
 * unless the visitor asks for less motion.
 */

/** The Console's light tokens. */
const INK = "#080e24";
const MUTED = "rgba(8,14,36,0.64)";
const SUBTLE = "rgba(8,14,36,0.6)";
const LINE = "rgba(8,14,36,0.08)";
const ACCENT_TEXT = "#4355cd";
const FILL_QUIET = "rgba(8,14,36,0.04)";

/** The design size the hero scales: with the rail, and without it for a phone. */
export const CONSOLE_SIZE = { width: 820, height: 548 };
export const CONSOLE_COMPACT_SIZE = { width: 480, height: 548 };

const AI = {
  chatgpt: { name: "ChatGPT", logo: "/openai.svg" },
  claude: { name: "Claude", logo: "/claude-color.svg" },
  gemini: { name: "Gemini", logo: "/gemini-color.svg" },
} as const;
type AiKey = keyof typeof AI;

/** The rail's sections with the Console's own icon paths (24 grid, 1.75 stroke). */
const RAIL: { label: string; icon: ReactNode }[] = [
  {
    label: "Home",
    icon: (
      <>
        <path d="M4.25 10.5L12 4.25l7.75 6.25" />
        <path d="M6.25 9v9.25c0 .69.56 1.25 1.25 1.25h9c.69 0 1.25-.56 1.25-1.25V9" />
        <path d="M10 19.5v-4.25c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v4.25" />
      </>
    ),
  },
  {
    label: "Memory",
    icon: (
      <>
        <circle cx="6.5" cy="7" r="2.25" />
        <circle cx="17.5" cy="7.75" r="2.25" />
        <circle cx="11" cy="17.5" r="2.25" />
        <path d="M8.75 7.15l6.5.45M7.45 9.05l2.6 6.4M16.35 9.7l-4.2 5.85" />
      </>
    ),
  },
  { label: "Library", icon: <path d="M5 4.75v14.5M9.5 7.25v12M14 4.75v14.5M17.1 6.9l2.9 12.35" /> },
  {
    label: "Organization",
    icon: (
      <>
        <path d="M5.5 19.5V6.25c0-.83.67-1.5 1.5-1.5h6.25c.83 0 1.5.67 1.5 1.5V19.5" />
        <path d="M14.75 10h2.75c.83 0 1.5.67 1.5 1.5v8" />
        <path d="M3.75 19.5h16.5" />
        <path d="M8.75 8.5h1.75M8.75 12h1.75M8.75 15.5h1.75" />
      </>
    ),
  },
  {
    label: "Settings",
    icon: (
      <>
        <path d="M4.5 8h8.25M17.25 8h2.25M4.5 16h2.25M11.25 16h8.25" />
        <circle cx="15" cy="8" r="2.25" />
        <circle cx="9" cy="16" r="2.25" />
      </>
    ),
  },
  {
    label: "Statistics",
    icon: (
      <>
        <path d="M4.25 19.75h15.5" />
        <path d="M7 16.5v-3.25M12 16.5V9.25M17 16.5V5.75" />
      </>
    ),
  },
];

function RailIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** This month's figures. */
const STATS: { label: string; to: number; decimals: number; unit: string }[] = [
  { label: "Tokens saved", to: 1.28, decimals: 2, unit: "M" },
  { label: "Efficiency", to: 94, decimals: 0, unit: "%" },
  { label: "Time saved", to: 11.4, decimals: 1, unit: " h" },
];

/** The chats saved by each AI, as the Home page's split bar shows them. */
const SAVED: { ai: AiKey; count: number; color: string }[] = [
  { ai: "chatgpt", count: 112, color: "#5267f7" },
  { ai: "claude", count: 86, color: "#97a3fb" },
  { ai: "gemini", count: 50, color: "#c5ccfd" },
];
const TOTAL = SAVED.reduce((sum, s) => sum + s.count, 0);

/** The chats Maya saved last. */
const RECENT: { title: string; ai: AiKey; when: string }[] = [
  { title: "Brand refresh brief for Kestrel", ai: "claude", when: "2 min ago" },
  { title: "Convert a budget to euros", ai: "gemini", when: "1 h ago" },
  { title: "Thank you message for the crew", ai: "chatgpt", when: "Yesterday" },
  { title: "Slide outline for a roadmap", ai: "claude", when: "Nov 17, 2026" },
  { title: "Coffee order for the studio", ai: "chatgpt", when: "Nov 15, 2026" },
];

/**
 * A figure that counts up from zero once, while its card is still coming
 * in. If the card is already in place when the page wakes, or the visitor
 * asks for less motion, it shows the final figure as it is.
 */
function CountUp({ to, decimals, delay }: { to: number; decimals: number; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const final = to.toFixed(decimals);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tile = el.closest<HTMLElement>("[data-hero-tile]");
    const entering = tile ? Number(getComputedStyle(tile).opacity) < 0.6 : false;
    if (reduce || !entering) return;
    let raf = 0;
    const start = performance.now() + delay;
    const step = (now: number) => {
      const t = Math.min(Math.max((now - start) / 1400, 0), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (to * eased).toFixed(decimals);
      if (t < 1) raf = requestAnimationFrame(step);
      else el.textContent = final;
    };
    el.textContent = (0).toFixed(decimals);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = final;
    };
  }, [to, decimals, delay]);
  return <span ref={ref}>{to.toFixed(decimals)}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[16px] bg-white ${className}`} style={{ border: `1px solid ${LINE}` }}>
      {children}
    </div>
  );
}

/** `compact` leaves the rail out, for the narrower drawing a phone shows. */
export function ConsoleDashboard({ compact = false }: { compact?: boolean }) {
  const size = compact ? CONSOLE_COMPACT_SIZE : CONSOLE_SIZE;
  return (
    <div className="flex bg-white text-left font-sans antialiased" style={{ width: size.width, height: size.height, color: INK }}>
      {compact ? null : (
        <nav aria-hidden="true" className="flex w-[196px] shrink-0 flex-col gap-7 px-[14px] pt-[22px] pb-[18px]" style={{ borderRight: `1px solid ${LINE}` }}>
          <div className="flex items-center gap-[11px] px-2 py-0.5">
            <LogoMark className="h-7 w-7 shrink-0 text-[#5267f7]" />
            <span className="flex flex-col leading-[1.25]">
              <span className="text-[15px] font-semibold tracking-[-0.01em]">Coere</span>
              <span className="text-[12px]" style={{ color: SUBTLE }}>
                Dashboard
              </span>
            </span>
          </div>
          <ul className="relative flex flex-col gap-0.5">
            {RAIL.map((item, i) => (
              <li key={item.label} className="relative flex h-10 items-center gap-[11px] rounded-[12px] px-3 text-[13.5px] font-medium" style={{ color: i === 0 ? ACCENT_TEXT : MUTED }}>
                {i === 0 ? <span className="absolute top-1/2 -left-[14px] h-5 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#5267f7]" /> : null}
                <RailIcon>{item.icon}</RailIcon>
                {item.label}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2.5 px-1.5">
            <Image src="/preview/images/agents/cori-general.svg" alt="" width={34} height={34} unoptimized className="h-[34px] w-[34px]" />
            <span className="text-[13.5px] font-medium" style={{ color: MUTED }}>
              Ask Cori
            </span>
          </div>
        </nav>
      )}

      <div className={`min-w-0 flex-1 ${compact ? "px-5 pt-5" : "px-8 pt-7"}`}>
        <p className="text-[26px] leading-none font-semibold tracking-[-0.02em]">Home</p>

        <Card className="mt-5 px-5 pt-4 pb-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold tracking-[-0.01em]">What your memory saved</p>
            <p className="text-[12px]" style={{ color: SUBTLE }}>
              This month
            </p>
          </div>
          <dl className="mt-3.5 grid grid-cols-3 gap-3">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="grid gap-1 rounded-[12px] px-3.5 py-3" style={{ background: FILL_QUIET }}>
                <dt className="text-[12px]" style={{ color: SUBTLE }}>
                  {stat.label}
                </dt>
                <dd className="m-0 text-[22px] leading-tight font-semibold tracking-[-0.015em] tabular-nums">
                  <CountUp to={stat.to} decimals={stat.decimals} delay={650 + i * 120} />
                  <span className="text-[14px] font-medium" style={{ color: SUBTLE }}>
                    {stat.unit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="mt-4 px-5 pt-4 pb-2">
          <p className="flex items-baseline gap-2">
            <span className="text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              <CountUp to={TOTAL} decimals={0} delay={800} />
            </span>
            <span className="text-[16px]" style={{ color: MUTED }}>
              chats saved
            </span>
          </p>
          <div className="mt-3.5 flex gap-1">
            {SAVED.map((s) => (
              <div key={s.ai} style={{ flex: s.count }}>
                <div className="h-2 rounded-full" style={{ background: s.color }} />
                <p className="mt-2 flex items-center gap-1.5 text-[13px] tabular-nums">
                  <Image src={AI[s.ai].logo} alt="" width={15} height={15} unoptimized className="h-[15px] w-[15px]" />
                  {s.count}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] font-medium tracking-[0.06em] uppercase" style={{ color: SUBTLE }}>
            Recently saved
          </p>
          <ul className="mt-1">
            {RECENT.slice(0, 4).map((chat, i) => (
              <li key={chat.title} className="flex animate-[coere-row-in_0.6s_cubic-bezier(0.22,1,0.36,1)_both] items-center gap-3 py-[7px]" style={{ animationDelay: `${900 + i * 110}ms` }}>
                <Image src={AI[chat.ai].logo} alt="" width={17} height={17} unoptimized className="h-[17px] w-[17px] shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[14px]">{chat.title}</span>
                <span className="shrink-0 text-[12.5px] tabular-nums" style={{ color: SUBTLE }}>
                  {chat.when}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
