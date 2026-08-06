import type { ReactNode } from "react";
import { AgentLogo } from "@/components/agent-logo";

export type BrowserTab = {
  name: string;
  logo: string;
  url: string;
  /** Content surface, so ChatGPT and Claude read as different products. */
  surface: string;
};

/** A small Chrome window mock: tab strip, address bar, page content. */
export function BrowserWindow({
  tabs,
  activeIndex,
  children,
}: {
  tabs: readonly BrowserTab[];
  activeIndex: number;
  children: ReactNode;
}) {
  const active = tabs[activeIndex];

  return (
    <div className="overflow-hidden rounded-xl border border-ink-900/10 bg-[#e8eaed]">
      <div className="flex items-end gap-1 px-2 pt-2">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={tab.name}
              className={`flex w-36 min-w-0 items-center gap-2 rounded-t-lg px-3 py-2 transition-colors duration-300 ${
                isActive ? "bg-white" : "bg-black/[0.04]"
              }`}
            >
              <AgentLogo
                src={tab.logo}
                name={tab.name}
                size={14}
                className={`shrink-0 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-45"
                }`}
              />
              <span
                className={`truncate text-[11px] transition-colors duration-300 ${
                  isActive ? "text-ink-900/80" : "text-ink-900/40"
                }`}
              >
                {tab.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 bg-white px-3 pt-2.5 pb-2">
        <span className="flex gap-1.5">
          {[0, 1].map((dot) => (
            <span key={dot} className="h-1 w-1 rounded-full bg-ink-900/20" />
          ))}
        </span>
        <span className="flex-1 truncate rounded-full bg-ink-900/[0.05] px-3 py-1 font-mono text-[10px] text-ink-900/45">
          {active.url}
        </span>
      </div>

      <div className={`px-4 py-4 ${active.surface}`}>{children}</div>
    </div>
  );
}
