"use client";

import { useEffect, useState } from "react";
import { Highlighted } from "@/site/code/highlighted";
import { contextCommand, contextOutput, contextPy } from "@/site/content/forge-demo";

/** How long the code shows before it "runs". */
const RUN_AFTER_MS = 2800;

/**
 * One window with two tabs, context.py and Terminal. It opens on the code,
 * then switches to the terminal as if the script had been run, so the
 * code and what it printed each get the full width.
 */
export function ContextRun() {
  const [tab, setTab] = useState<"code" | "run">("code");

  useEffect(() => {
    const timer = setTimeout(() => setTab("run"), RUN_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-[#0b1020] text-white ring-1 ring-white/10">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="mr-3 h-2.5 w-2.5 rounded-full bg-white/20" />
        {(["code", "run"] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`h-9 px-3 font-mono text-[11px] ${tab === name ? "text-white" : "text-white/45 hover:text-white"}`}
          >
            {name === "code" ? "context.py" : "Terminal"}
          </button>
        ))}
      </div>
      <pre className="min-h-0 flex-1 overflow-hidden px-5 py-4 text-[11.5px] leading-relaxed">
        {tab === "code" ? (
          <Highlighted code={contextPy} language="python" />
        ) : (
          <>
            <span className="text-white/45">$ </span>
            <Highlighted code={contextCommand} language="bash" />
            {"\n"}
            <code className="font-mono text-white/75">{contextOutput}</code>
          </>
        )}
      </pre>
    </div>
  );
}
