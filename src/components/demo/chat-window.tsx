"use client";

import type { ReactNode } from "react";
import { AgentLogo } from "@/components/agent-logo";
import type { Brand } from "./data";

/** Mac Chrome chrome: traffic lights, a tab strip, a toolbar. */
export function BrowserFrame({
  brand,
  children,
}: {
  brand: Brand;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[13px] bg-[#dee1e6] shadow-[0_30px_70px_-38px_rgb(8_14_36_/_0.5)] ring-1 ring-ink-900/10">
      <div className="flex shrink-0 items-end gap-1.5 pt-2 pr-2 pl-3">
        <span className="mb-2.5 flex gap-[5px]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#ff5f57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#febc2e]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#28c840]" />
        </span>

        <div className="flex w-[172px] items-center gap-2 rounded-t-[10px] bg-white px-3 py-[7px]">
          <AgentLogo src={brand.logo} name={brand.name} size={13} />
          <span className="flex-1 truncate text-[11px] text-ink-900/80">
            {brand.tab}
          </span>
          <Glyph d="M3.5 3.5 8.5 8.5M8.5 3.5 3.5 8.5" size={9} />
        </div>

        <div className="flex w-[120px] items-center gap-2 rounded-t-[10px] bg-black/[0.05] px-3 py-[7px]">
          <span className="h-[12px] w-[12px] rounded-[3px] bg-ink-900/10" />
          <span className="flex-1 truncate text-[11px] text-ink-900/35">
            New tab
          </span>
        </div>

        <span className="mb-2 px-1.5">
          <Glyph d="M6 2.5v7M2.5 6h7" size={11} />
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 bg-white px-3 py-[7px]">
        <Glyph d="M7.5 2.5 4 6l3.5 3.5" size={12} />
        <span className="opacity-35">
          <Glyph d="M4.5 2.5 8 6l-3.5 3.5" size={12} />
        </span>
        <Glyph
          d="M9.5 6a3.5 3.5 0 1 1-1.1-2.5M9.6 2.2v2.2H7.4"
          size={12}
          round
        />
        <span className="flex flex-1 items-center gap-2 rounded-full bg-ink-900/[0.05] px-3 py-[5px]">
          <Glyph
            d="M6 3.2a1.6 1.6 0 0 1 1.6 1.6v.6H4.4v-.6A1.6 1.6 0 0 1 6 3.2zM3.9 5.4h4.2v3.4H3.9z"
            size={10}
          />
          <span className="truncate font-mono text-[10px] text-ink-900/50">
            {brand.url}
          </span>
        </span>
        <Glyph d="M6 2.6v.1M6 5.9v.1M6 9.2v.1" size={12} round />
      </div>

      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Glyph({
  d,
  size = 12,
  round,
}: {
  d: string;
  size?: number;
  round?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      className="shrink-0 text-ink-900/45"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap={round ? "round" : "butt"}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** The product inside the tab: sidebar, header, thread, composer. */
export function ChatApp({
  brand,
  chats,
  activeChat,
  children,
  composer,
  badge,
}: {
  brand: Brand;
  chats: readonly string[];
  activeChat: string;
  children: ReactNode;
  composer: ReactNode;
  /** Sits in the header, where it can never cover a message. */
  badge?: ReactNode;
}) {
  return (
    <div className={`flex min-h-0 flex-1 ${brand.surface}`}>
      {/* sidebar */}
      <div
        className={`flex w-[126px] shrink-0 flex-col gap-3 px-2.5 py-3 ${brand.sidebar}`}
      >
        <div className="flex items-center gap-2 px-1">
          <AgentLogo src={brand.logo} name={brand.name} size={14} />
          <span className="truncate text-[10.5px] font-medium text-ink-900/70">
            {brand.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2 py-1.5 ring-1 ring-ink-900/[0.06]">
          <Glyph d="M6 2.8v6.4M2.8 6h6.4" size={10} round />
          <span className="text-[10px] text-ink-900/60">New chat</span>
        </div>

        <div className="min-h-0 flex-1 space-y-0.5">
          <p className="px-1 pb-1 text-[9px] tracking-wide text-ink-900/30 uppercase">
            Recents
          </p>
          {chats.map((chat) => (
            <p
              key={chat}
              className={`truncate rounded-md px-2 py-1.5 text-[10px] ${
                chat === activeChat
                  ? "bg-ink-900/[0.06] text-ink-900/75"
                  : "text-ink-900/40"
              }`}
            >
              {chat}
            </p>
          ))}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-[8.5px] font-semibold text-white">
            ED
          </span>
          <span className="truncate text-[10px] text-ink-900/45">Edison</span>
        </div>
      </div>

      {/* thread column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1.5 px-4 py-2.5">
          <span className="text-[11.5px] font-medium text-ink-900/75">
            {brand.name}
          </span>
          <Glyph d="M3.5 5 6 7.5 8.5 5" size={10} round />
          {badge ? <span className="ml-2 min-w-0">{badge}</span> : null}
          <span className="ml-auto flex items-center gap-3">
            <Glyph d="M6 2.5v5M4 4.2 6 2.2l2 2M3 7.5v2h6v-2" size={12} round />
            <Glyph d="M6 2.6v.1M6 5.9v.1M6 9.2v.1" size={12} round />
          </span>
        </div>

        <div className="min-h-0 flex-1 px-4">{children}</div>

        <div className="shrink-0 px-4 pt-1.5 pb-2.5">
          {composer}
          <p className="pt-1.5 text-center text-[8.5px] text-ink-900/25">
            {brand.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

/** A message you sent. */
export function UserMessage({
  brand,
  children,
}: {
  brand: Brand;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-end">
      <div
        className={`max-w-[84%] rounded-[16px] rounded-br-[5px] px-3 py-2 text-[11px] leading-[1.6] text-ink-900/80 ${brand.bubble}`}
      >
        {children}
      </div>
    </div>
  );
}

/** A model reply: avatar, text, and the little action row underneath. */
export function AssistantMessage({
  brand,
  children,
  actions = true,
}: {
  brand: Brand;
  children: ReactNode;
  actions?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <AgentLogo
        src={brand.logo}
        name={brand.name}
        size={14}
        className="mt-[3px] shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="space-y-1.5 text-[11px] leading-[1.6] text-ink-900/70">
          {children}
        </div>
        {actions ? (
          <div className="flex gap-2.5 pt-1.5 opacity-30">
            <Glyph d="M4 3.5h4.5v5H4zM3.5 8.5V2.8h4.7" size={10} />
            <Glyph
              d="M3 5.5h1.8v4H3zM4.8 5.5 6.6 2.4l1.4.6-.5 2.5h2.2l-.9 4H4.8z"
              size={10}
            />
            <Glyph
              d="M9 6.5H7.2V2.6H9zM7.2 6.5 5.4 9.6 4 9l.5-2.5H2.3l.9-4h4z"
              size={10}
            />
            <Glyph
              d="M9.4 6a3.4 3.4 0 1 1-1-2.4M9.5 2.3v2.2H7.3"
              size={10}
              round
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Code, with just enough colour to read as code. */
export function CodeBlock({
  lines,
  filename,
}: {
  lines: readonly string[];
  filename?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-ink-950">
      {filename ? (
        <div className="flex items-center justify-between border-b border-white/8 px-3 py-1.5">
          <span className="font-mono text-[8.5px] text-white/45">
            {filename}
          </span>
          <span className="font-mono text-[8.5px] text-white/30">Copy</span>
        </div>
      ) : null}
      <pre className="px-3 py-2 font-mono text-[9px] leading-[1.75] text-white/80">
        {lines.map((line) => (
          <code key={line} className="block whitespace-pre">
            {colorize(line)}
          </code>
        ))}
      </pre>
    </div>
  );
}

/** A small result table, the way a research answer renders one. */
export function ResultTable({
  head,
  rows,
}: {
  head: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-ink-900/8">
      <div className="grid grid-cols-3 gap-2 bg-ink-900/[0.03] px-2.5 py-1.5">
        {head.map((cell) => (
          <span key={cell} className="text-[9px] text-ink-900/45">
            {cell}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row[0]}
          className="grid grid-cols-3 gap-2 border-t border-ink-900/[0.05] px-2.5 py-1.5"
        >
          {row.map((cell, index) => (
            <span
              key={cell}
              className={`truncate text-[9.5px] ${
                index === 0 ? "text-ink-900/70" : "text-ink-900/50"
              }`}
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Sources, the way a research answer cites them. */
export function Citations({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-0.5">
      {items.map((item, index) => (
        <span
          key={item}
          className="flex items-center gap-1 rounded-md bg-ink-900/[0.04] px-1.5 py-1 text-[8.5px] text-ink-900/45"
        >
          <span className="grid h-3 w-3 place-items-center rounded-[3px] bg-ink-900/10 text-[7px]">
            {index + 1}
          </span>
          {item}
        </span>
      ))}
    </div>
  );
}

const KEYWORDS = new Set([
  "def",
  "return",
  "import",
  "from",
  "for",
  "in",
  "if",
  "else",
  "None",
  "True",
  "False",
  "class",
  "with",
  "as",
]);

function colorize(line: string) {
  return line.split(/('[^']*'|"[^"]*"|#.*$)/g).map((part, index) => {
    if (/^['"]/.test(part)) {
      return (
        <span key={index} className="text-[#9fd6a4]">
          {part}
        </span>
      );
    }
    if (part.startsWith("#")) {
      return (
        <span key={index} className="text-white/35">
          {part}
        </span>
      );
    }
    return part.split(/(\b[A-Za-z_]+\b)/g).map((chunk, chunkIndex) => (
      <span
        key={`${index}-${chunkIndex}`}
        className={KEYWORDS.has(chunk) ? "text-[#b0a5f7]" : undefined}
      >
        {chunk}
      </span>
    ));
  });
}

/** The composer: attach, field, send. */
export function Composer({
  brand,
  children,
}: {
  brand: Brand;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-[18px] border bg-white px-3 py-2 ${brand.border}`}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 ring-ink-900/10">
        <Glyph d="M6 3.2v5.6M3.2 6h5.6" size={9} round />
      </span>
      <div className="flex min-h-[1.75rem] min-w-0 flex-1 items-center">
        {children ?? (
          <span className="truncate text-[11px] text-ink-900/30">
            {brand.composer}
          </span>
        )}
      </div>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-900/85">
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" aria-hidden>
          <path
            d="M6 9.2V3M3.4 5.4 6 2.8l2.6 2.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
