"use client";

import { useState } from "react";

export type CodeSample = { label: string; language: string; code: string };

/**
 * A dark code window with a tab per language. Code is shown as written,
 * with no highlighting, so it reads like a terminal and copies cleanly.
 */
export function CodeTabs({ samples, title }: { samples: CodeSample[]; title?: string }) {
  const [picked, setPicked] = useState(0);
  const [copied, setCopied] = useState(false);
  const sample = samples[picked];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be refused; the code is still there to select.
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0b1020] text-white shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="flex items-center gap-1 border-b border-white/10 px-3">
        {title ? <span className="mr-3 px-2 text-[13px] text-white/50">{title}</span> : null}
        {samples.map((s, index) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setPicked(index)}
            aria-pressed={index === picked}
            className={`h-11 px-3 text-[13px] decoration-1 underline-offset-[14px] ${index === picked ? "text-white underline" : "text-white/55 hover:text-white"}`}
          >
            {s.label}
          </button>
        ))}
        <button type="button" onClick={copy} className="ml-auto h-11 px-3 text-[13px] text-white/55 hover:text-white">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-6 text-[13px] leading-relaxed">
        <code className={`language-${sample.language} font-mono`}>{sample.code}</code>
      </pre>
    </div>
  );
}
