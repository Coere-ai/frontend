"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { day, plural } from "@/lib/dashboard/format";
import type { MemoryView } from "@/lib/memory/view";
import { inputClass } from "@/site/ui/form-field";
import { SearchIcon } from "@/site/ui/icons/interface-icons";

/**
 * The chats memory came from, newest first: the title, the AI, when Coere
 * saved it and how many messages it had. Titles only; the chats themselves
 * never leave the browser.
 */

const AI_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
  grok: "Grok",
  copilot: "Copilot",
  meta: "Meta AI",
  kimi: "Kimi",
};

export const aiName = (platform: string): string => AI_NAMES[platform] ?? (platform ? platform[0]!.toUpperCase() + platform.slice(1) : "Unknown");

/** How many rows show before Show more, so a long list renders fast. */
const PAGE = 100;

export function ChatList({ sources }: { sources: MemoryView["sources"] }) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(PAGE);
  const deferred = useDeferredValue(query);
  const shown = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return q ? sources.filter((s) => s.title.toLowerCase().includes(q) || aiName(s.platform).toLowerCase().includes(q)) : sources;
  }, [sources, deferred]);

  return (
    <div>
      <div className="relative">
        <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 mt-1 -translate-y-1/2 text-neutral-400" />
        <label htmlFor="chat-search" className="sr-only">
          Search chats
        </label>
        <input
          id="chat-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chat titles"
          autoComplete="off"
          className={`${inputClass(false)} h-12 pl-11`}
        />
      </div>
      <p className="mt-6 text-[13px] text-neutral-500">{plural(shown.length, "chat")}</p>
      <ul className="mt-3 divide-y divide-neutral-100 border-y border-neutral-200">
        {shown.slice(0, count).map((s) => (
          <li key={s.id} className="flex flex-col gap-1 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <p className="min-w-0 truncate text-[15px] text-neutral-950">{s.title.trim() || "Untitled chat"}</p>
            <p className="shrink-0 text-[13px] text-neutral-500">
              {[aiName(s.platform), s.capturedAt ? `Saved ${day(s.capturedAt)}` : null, s.messages > 0 ? plural(s.messages, "message") : null].filter(Boolean).join(". ")}
            </p>
          </li>
        ))}
      </ul>
      {shown.length > count ? (
        <button type="button" onClick={() => setCount((c) => c + PAGE)} className="mt-4 rounded-full px-4 py-2 text-[14px] text-neutral-950 transition-colors hover:bg-neutral-100">
          Show more
        </button>
      ) : null}
    </div>
  );
}
