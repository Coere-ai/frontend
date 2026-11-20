"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/site/ui/icons/interface-icons";

/** A bare icon with room round it to tap: no circle, no ring, only the mark darkening on hover. */
const BUTTON = "grid h-10 w-10 place-items-center rounded-md text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-500";

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13.5a4.5 4.5 0 0 0 6.4.4l2.6-2.6a4.5 4.5 0 0 0-6.4-6.4l-1.3 1.3" />
      <path d="M14 10.5a4.5 4.5 0 0 0-6.4-.4L5 12.7a4.5 4.5 0 0 0 6.4 6.4l1.3-1.3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.99c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.64V21h-4V9.75Z" />
    </svg>
  );
}

/**
 * Ways to pass a post on: copy its address, or share it on X or LinkedIn.
 * The share links open each site's own share page in a new tab, so
 * nothing loads from those sites until the reader asks.
 */
export function ShareLinks({ url, title, layout = "row" }: { url: string; title: string; layout?: "row" | "column" }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Without clipboard access the address is still in the share links and the address bar.
    }
  };

  const x = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className={`flex items-center gap-1 ${layout === "column" ? "flex-col" : ""}`}>
      <button type="button" onClick={copy} className={BUTTON} aria-label={copied ? "Link copied" : "Copy link"} title={copied ? "Link copied" : "Copy link"}>
        {copied ? <CheckIcon size={17} className="text-brand-600" /> : <LinkIcon />}
      </button>
      <a href={x} target="_blank" rel="noopener noreferrer" className={BUTTON} aria-label="Share on X" title="Share on X">
        <XIcon />
      </a>
      <a href={linkedIn} target="_blank" rel="noopener noreferrer" className={BUTTON} aria-label="Share on LinkedIn" title="Share on LinkedIn">
        <LinkedInIcon />
      </a>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
