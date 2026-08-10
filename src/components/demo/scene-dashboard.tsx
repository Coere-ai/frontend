"use client";

import { motion } from "motion/react";
import { AgentLogo } from "@/components/agent-logo";
import { LogoMark } from "@/components/logo";
import { BRANDS, TOTALS, TRANSFERS } from "./data";
import { Rolling, formatClock, formatCompact, formatInt } from "./bits";
import { EASE, EASE_HERO } from "./timeline";
import type { DemoClock } from "./use-demo-clock";

/** Act 4: every transfer you have made, and what it saved. */
export function SceneDashboard({ clock }: { clock: DemoClock }) {
  const shown = clock.at("dash-in");
  const leaving = clock.at("dash-out");
  const totals = clock.at("dash-totals");

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col justify-center px-[80px]"
      initial={false}
      animate={{
        opacity: shown && !leaving ? 1 : 0,
        scale: leaving ? 0.97 : 1,
        filter: leaving ? "blur(10px)" : "blur(0px)",
      }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <motion.div
        className="overflow-hidden rounded-[18px] border border-ink-900/10 bg-white shadow-[0_50px_110px_-40px_rgb(8_14_36_/_0.5)]"
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{
          opacity: shown ? 1 : 0,
          y: shown ? 0 : 24,
          scale: shown ? 1 : 0.94,
        }}
        transition={{ duration: 0.9, ease: EASE_HERO }}
      >
        <div className="flex items-center gap-2.5 border-b border-ink-900/8 px-6 py-4">
          <LogoMark className="h-4 w-4 text-brand-500" />
          <span className="text-[13px] font-medium text-ink-900">
            Your transfers
          </span>
          <span className="ml-auto text-[11.5px] text-ink-900/40">
            edison@coere.ai
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-ink-900/8 border-b border-ink-900/8">
          <Total
            label="Transfers"
            value={totals ? TOTALS.transfers : 0}
            format={formatInt}
          />
          <Total
            label="Tokens saved"
            value={totals ? TOTALS.tokensSaved : 0}
            format={formatCompact}
            highlight
          />
          <Total
            label="Time saved"
            value={totals ? TOTALS.secondsSaved : 0}
            format={formatClock}
            highlight
          />
        </div>

        <div className="px-6 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_170px_120px_110px_110px] gap-4 px-2 pb-2 text-[10.5px] text-ink-900/40">
            <span>Project</span>
            <span>Moved</span>
            <span className="text-right">Tokens saved</span>
            <span className="text-right">Time saved</span>
            <span className="text-right">When</span>
          </div>

          <div className="space-y-1">
            {TRANSFERS.map((transfer, index) => (
              <motion.div
                key={transfer.project}
                className={`grid grid-cols-[minmax(0,1fr)_170px_120px_110px_110px] items-center gap-4 rounded-lg px-2 py-2.5 ${
                  index === 0 ? "bg-brand-50/70" : ""
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: clock.at("dash-rows") ? 1 : 0,
                  y: clock.at("dash-rows") ? 0 : 12,
                }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: index * 0.09,
                }}
              >
                <span className="truncate text-[12.5px] text-ink-900/80">
                  {transfer.project}
                </span>

                <span className="flex items-center gap-2 text-[11.5px] text-ink-900/55">
                  <AgentLogo
                    src={BRANDS[transfer.from].logo}
                    name={BRANDS[transfer.from].name}
                    size={14}
                  />
                  {BRANDS[transfer.from].name}
                  <Arrow />
                  <AgentLogo
                    src={BRANDS[transfer.to].logo}
                    name={BRANDS[transfer.to].name}
                    size={14}
                  />
                  {BRANDS[transfer.to].name}
                </span>

                <span className="text-right text-[12.5px] font-medium text-brand-600 tabular-nums">
                  {formatInt(transfer.tokens)}
                </span>
                <span className="text-right text-[12.5px] text-ink-900/70 tabular-nums">
                  {formatClock(transfer.seconds)}
                </span>
                <span className="text-right text-[11.5px] text-ink-900/40">
                  {transfer.when}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Total({
  label,
  value,
  format,
  highlight,
}: {
  label: string;
  value: number;
  format: (value: number) => string;
  highlight?: boolean;
}) {
  return (
    <div className="px-6 py-5">
      <p className="text-[11px] text-ink-900/45">{label}</p>
      <p
        className={`mt-1.5 text-[30px] leading-none font-semibold tracking-[-0.03em] tabular-nums ${
          highlight ? "text-brand-600" : "text-ink-900"
        }`}
      >
        <Rolling value={value} format={format} duration={1.4} />
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 14 14"
      className="h-3 w-3 text-ink-900/25"
      aria-hidden="true"
    >
      <path
        d="M2.5 7h9M8.2 3.8 11.5 7l-3.3 3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
