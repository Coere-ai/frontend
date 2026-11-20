"use client";

import { useEffect, useRef, useState } from "react";
import { SECTION_TITLE, SECTION_Y, SOFT_CARD } from "@/site/home/look";
import { Container } from "@/site/ui/container";

const PAGE = "/preview/live/compare/index.html";
const POSTER = "/preview/live/compare/poster.webp";

/**
 * Without Coere and with Coere, side by side: the same new chat started by
 * pasting files and notes, then by naming the project and letting Coere add
 * the context, with the tokens and time each one takes. The film is the
 * scene from Coere's own pitch (coere-v2 tools/demos/scenes/pitch/transfer.js),
 * built on its own; it plays and loops by itself and ignores the pointer.
 * It loads only near the screen, and its last frame shows until it does.
 */
export function CompareSection() {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const seen = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px 0px" });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  return (
    <section id="compare" className={`scroll-mt-24 ${SECTION_Y}`}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={SECTION_TITLE}>The same chat, 97.7% fewer tokens</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-white/65">
            Without Coere, you paste files and notes into every new chat. With Coere, you name the project and the right context goes in for you.
          </p>
        </div>
        <div ref={box} role="img" aria-label="Without Coere: 10.4k tokens and 4 minutes 12 seconds. With Coere: 240 tokens and 5 seconds." className={`relative mt-14 aspect-video w-full overflow-hidden md:mt-16 ${SOFT_CARD}`}>
          {near ? (
            <iframe
              src={PAGE}
              title="Without Coere and with Coere"
              tabIndex={-1}
              aria-hidden={true}
              onLoad={() => setTimeout(() => setLoaded(true), 400)}
              className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSTER} alt="" aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded && near ? "opacity-0" : "opacity-100"}`} />
        </div>
      </Container>
    </section>
  );
}
