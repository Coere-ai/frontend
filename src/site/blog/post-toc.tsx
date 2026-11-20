"use client";

import { useEffect, useState } from "react";

/**
 * The post's headings beside the reading column on a wide screen, with the
 * section being read marked as the reader scrolls.
 */
export function PostToc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    // The current section is the last heading that has passed the upper third of the screen.
    const pick = () => {
      const line = window.innerHeight * 0.33;
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const observer = new IntersectionObserver(pick, { rootMargin: "0px 0px -60% 0px" });
    els.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", pick, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pick);
    };
  }, [headings]);

  return (
    <nav aria-label="On this page">
      <p className="text-[13px] font-semibold text-neutral-950">On this page</p>
      <ul className="mt-4 space-y-1 border-l border-neutral-200">
        {headings.map((h) => {
          const on = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l py-1.5 pl-4 text-[14px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${on ? "border-brand-500 font-medium text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-950"}`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
