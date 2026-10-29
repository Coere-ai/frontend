"use client";

import { useState } from "react";
import { Highlighted } from "@/site/code/highlighted";
import { Underlined } from "@/site/ui/underlined";

export type CodeSample = { label: string; language: string; code: string };

/**
 * A dark code window with a tab per language, colored by token kind. Copy
 * takes the code exactly as written.
 */
export function CodeTabs({ samples }: { samples: CodeSample[] }) {
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
        {samples.map((s, index) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setPicked(index)}
            aria-pressed={index === picked}
            className={`group h-11 px-3 text-[13px] ${index === picked ? "text-white" : "text-white/55 hover:text-white"}`}
          >
            <Underlined light on={index === picked}>{s.label}</Underlined>
          </button>
        ))}
        <button type="button" onClick={copy} className="ml-auto h-11 px-3 text-[13px] text-white/55 hover:text-white">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* Every sample sits in the same cell and only the picked one shows, so the
          box keeps the tallest sample's size and never jumps between tabs. */}
      <div className="grid">
        {samples.map((s, index) => (
          <pre
            key={s.label}
            aria-hidden={index !== picked}
            className={`overflow-x-auto p-6 text-[13px] leading-relaxed [grid-area:1/1] ${index === picked ? "" : "invisible"}`}
          >
            <Highlighted code={s.code} language={s.language} />
          </pre>
        ))}
      </div>
    </div>
  );
}
