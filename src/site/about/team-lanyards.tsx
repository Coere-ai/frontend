"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { TeamMember } from "@/lib/site";
import { drawLanyardFaces, type LanyardFaces } from "./lanyard-faces";

// three.js is heavy, so the Lanyard loads only in the browser, once the team is close.
const Lanyard = dynamic(() => import("@/site/bits/Lanyard"), { ssr: false });

/**
 * Turns true once the element meets the observer's options, and stays true.
 * A margin wakes things early; a threshold waits until enough is in view.
 */
function useSeen<T extends Element>(options: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  const { rootMargin, threshold } = options;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);
  return [ref, seen] as const;
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5a6.5 6.5 0 0 1 11.6-3.2L16.5 7" />
      <path d="M16.5 3v4h-4" />
      <path d="M16.5 11.5a6.5 6.5 0 0 1-11.6 3.2L3.5 13" />
      <path d="M3.5 17v-4h4" />
    </svg>
  );
}

/**
 * One founder's lanyard. Its scene is made only once half of it is in view,
 * so the card drops in while the person can see it, and a phone never builds
 * a scene for a card it has not scrolled to.
 */
function LanyardSlot({ member, faces }: { member: TeamMember; faces: LanyardFaces | null }) {
  const [ref, seen] = useSeen<HTMLDivElement>({ threshold: 0.5 });
  const [flips, setFlips] = useState(0);
  return (
    <figure className="flex flex-col items-center">
      <div ref={ref} className="relative h-[440px] w-full sm:h-[540px] lg:h-[620px]">
        {faces && seen ? (
          <Lanyard
            frontImage={faces.front}
            backImage={faces.back}
            strapImage={faces.strap}
            cardColor="#ffffff"
            finish="glossy"
            size={0.56}
            strapLength={0.5}
            strapWidth={0.62}
            breeze={0.25}
            metal="silver"
            introFrom="top"
            flipSignal={flips}
          />
        ) : null}
      </div>
      <figcaption className="mt-2">
        <button
          type="button"
          onClick={() => setFlips((n) => n + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[14px] font-medium text-neutral-800 shadow-[0_1px_2px_rgba(20,17,15,0.06)] transition-colors hover:border-neutral-300 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          aria-label={`Flip ${member.name}'s card`}
        >
          <FlipIcon />
          Flip card
        </button>
      </figcaption>
    </figure>
  );
}

/**
 * The founders as two lanyard cards that drop in from the top. The front is
 * the photo and the name; flipped, the back is the name, the role and the
 * school. The faces are drawn once the team is a screen away. The same words
 * are in the highlights below, for screen readers.
 */
export function TeamLanyards({ members }: { members: readonly TeamMember[] }) {
  const [ref, near] = useSeen<HTMLDivElement>({ rootMargin: "100% 0px" });
  const [faces, setFaces] = useState<LanyardFaces[] | null>(null);

  useEffect(() => {
    if (!near) return;
    let live = true;
    drawLanyardFaces(members)
      .then((drawn) => {
        if (live) setFaces(drawn);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [near, members]);

  return (
    <div ref={ref} className="grid gap-2 sm:grid-cols-2 sm:gap-0">
      {members.map((member, i) => (
        <LanyardSlot key={member.name} member={member} faces={faces?.[i] ?? null} />
      ))}
    </div>
  );
}
