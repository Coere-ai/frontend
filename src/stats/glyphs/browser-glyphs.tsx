/**
 * Browser marks for the analytics breakdowns.
 *
 * These keep their brand colours while everything else on the dashboard is
 * ink or Coere's blue: a browser row is scanned, not read, and the colour IS
 * the identifier. A column of identical grey marks would make the
 * reader parse the label every time, which is the whole thing the icon is there
 * to avoid.
 *
 * Drawn rather than fetched, and simplified rather than traced. Each is the
 * brand's recognisable geometry at the size it renders (18px) and nothing more:
 * no gradients, no inner highlights, no second ring that closes to a smudge.
 * They are identifying marks in a table, not logo reproductions.
 *
 * Every one is a 24x24 viewBox so they line up in a column without per-icon
 * nudging, and every one keys off the exact strings lib/analytics/client.ts
 * writes, so a new value shows a neutral fallback rather than nothing.
 */

import { Unknown, box, type GlyphProps } from "./glyph-kit";

export function Chrome({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="12" cy="12" r="10" fill="#f1f3f4" />
      <path d="M12 2a10 10 0 0 1 8.66 5H12a5 5 0 0 0-4.33 2.5L3.34 7A10 10 0 0 1 12 2Z" fill="#ea4335" />
      <path d="M3.34 7l4.33 2.5A5 5 0 0 0 9.4 16.4L5.07 19A10 10 0 0 1 3.34 7Z" fill="#34a853" />
      <path d="M20.66 7A10 10 0 0 1 5.07 19l4.33-2.6A5 5 0 0 0 16.33 9.5Z" fill="#fbbc04" />
      <circle cx="12" cy="12" r="4" fill="#4285f4" />
    </svg>
  );
}

function Safari({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="12" cy="12" r="10" fill="#0fb5ee" />
      <circle cx="12" cy="12" r="8.2" fill="#f5f5f7" />
      {/* The needle IS the mark, so it runs corner to corner rather than sitting
          as a sliver in the middle. Two triangles sharing the short diagonal:
          red points north-east, white returns south-west, which is the reading
          everyone recognises even at 18px. */}
      <path d="M17.2 6.8 10.4 10.4 13.6 13.6Z" fill="#ff3b30" />
      <path d="M6.8 17.2 13.6 13.6 10.4 10.4Z" fill="#c7c7cc" />
      <circle cx="12" cy="12" r="0.9" fill="#f5f5f7" />
    </svg>
  );
}

function Firefox({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      {/* A fox wrapped round a globe. Two things carry that read at 18px: the
          blue centre, without which the mark collapses into a fireball, and the
          tail sweeping off the top-left, without which it is just a ring. */}
      <path
        d="M20.4 8.1c-.5-1.2-1.4-2.5-2.2-2.9.6 1.2 1 2.5 1.1 3.8v.1a8.3 8.3 0 0 0-2.9-3.7c-1.5-1-2.9-1.1-4.5-1-.1 0-1.6.1-2.3.4 1.3-.4 3-.2 4.3.7-1.6-.4-3.2-.2-4.3.4-2.6 1.4-2.9 4.3-1.5 6 .4.5 1 1 1.7 1.2a5 5 0 0 1-.7-1.6c-.3-1.4.4-2.7 1.6-3 .3.9 1.1 1.7 2.3 1.9 2 .3 3.2 1.2 3.5 2.3.2-.5.2-1 .1-1.6.7.8 1 1.9.8 3 1.1-1.3 1.6-3 1.5-4.7Z"
        fill="#ff7139"
      />
      <circle cx="11.6" cy="13.6" r="8.2" fill="#ff7139" />
      <circle cx="11.6" cy="13.6" r="5.6" fill="#e34f26" opacity="0.45" />
      <circle cx="11.6" cy="13.6" r="4.3" fill="#0060df" />
      <circle cx="10.1" cy="12.2" r="1.4" fill="#4aa3ff" opacity="0.85" />
    </svg>
  );
}

function Edge({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      {/* The open crescent, which is what distinguishes it from a plain disc. */}
      <path
        d="M21.4 14.6A9.8 9.8 0 0 1 4.1 17c1.9 1.3 4 1.6 5.9 1.1 3-.8 4.6-3 6-3.2 2.1-.3 4 .9 5.4-.3Z"
        fill="#0f7ebf"
      />
      <path
        d="M2.4 12.6C2.4 6.9 6.9 2.6 12.2 2.6c4.6 0 7.6 2.7 8.6 6.1-1.6-1.6-3.9-2.5-6.4-2.5-4.5 0-7.6 2.6-8.4 6-.6 2.4 0 4.2 1.1 5.5-3-1.4-4.7-3.9-4.7-5.1Z"
        fill="#35c1f1"
      />
      <path
        d="M20.8 8.7c.9 3.1.1 5.3-1.4 5.7-1.5.4-2.8-.4-2.8-1.9 0-2.6 2.3-3.1 4.2-3.8Z"
        fill="#0c6aa5"
      />
    </svg>
  );
}

function Opera({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      <ellipse cx="12" cy="12" rx="10" ry="10" fill="#ff1b2d" />
      <ellipse cx="12" cy="12" rx="4.4" ry="7.6" fill="#fff" />
    </svg>
  );
}

function Samsung({ size = 18, className }: GlyphProps) {
  return (
    <svg {...box(size)} className={className}>
      {/* Concentric rings read as a target rather than as a browser, so this is
          the swirl instead: one open arc turning inside the disc. */}
      <circle cx="12" cy="12" r="10" fill="#1428a0" />
      <path
        d="M17.2 9.4a6 6 0 1 0 .9 4.2 4.2 4.2 0 1 1-3.4-4.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Keyed on the exact strings lib/analytics/client.ts writes. */
const BROWSERS: Record<string, (p: GlyphProps) => React.ReactElement> = {
  Chrome,
  Safari,
  Firefox,
  Edge,
  Opera,
  "Samsung Internet": Samsung,
};

export function BrowserGlyph({ name, size, className }: { name: string } & GlyphProps) {
  const C = BROWSERS[name] ?? Unknown;
  return <C size={size} className={className} />;
}
