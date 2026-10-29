"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A live demo: Coere's real code running in its own page (public/preview/live,
 * built by demos/build.mjs from the coere-v2 source), driven like a person
 * uses it. It starts when it comes near the screen and stops when it is far
 * off, so a page of demos only runs the ones in view.
 *
 * `from` and `to` name chapters, to loop one part of a film. A demo without
 * `controls` ignores the pointer, so inside a link or a menu it behaves like
 * a picture; with them it shows pause and the chapters on hover.
 */
export function LiveDemo({ film, from, to, controls = false, label, className }: { film: string; from?: string; to?: string; controls?: boolean; label: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const seen = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px 0px" });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (controls) query.set("controls", "1");
  const src = `/preview/live/${film}/index.html${query.size ? `?${query}` : ""}`;

  return (
    <div ref={box} role={controls ? undefined : "img"} aria-label={controls ? undefined : label} className={`relative aspect-[1440/900] w-full overflow-hidden bg-white ${className ?? ""}`}>
      {near ? (
        <iframe
          src={src}
          title={label}
          tabIndex={controls ? undefined : -1}
          aria-hidden={controls ? undefined : true}
          className={`absolute inset-0 h-full w-full border-0 bg-white ${controls ? "" : "pointer-events-none"}`}
        />
      ) : null}
    </div>
  );
}
