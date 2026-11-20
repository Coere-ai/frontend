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

/**
 * The canvas runs half again as tall as the card's place, so a card pulled
 * down stretches its strap without meeting a bottom edge. The size and the
 * strap length are scaled to match, so the card hangs where and as large as
 * it would in the slot alone.
 */
const REACH = 1.5;

/**
 * The strap runs from the top edge of its canvas, so the top of the canvas
 * fades to clear and the strap seems to hang from the dark above.
 */
const STRAP_FADE = {
  maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 5.3%, #000 14.7%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 5.3%, #000 14.7%)",
} as const;

/**
 * One founder's lanyard, free to roam: its canvas is much wider than the
 * card's place and takes no clicks but the card's, so the card swings over
 * the page with no box round it. Its scene is made only once half of it is in view,
 * so the card drops in while the person can see it, and a phone never builds
 * a scene for a card it has not scrolled to.
 */
function LanyardSlot({ faces }: { faces: LanyardFaces | null }) {
  const [ref, seen] = useSeen<HTMLDivElement>({ threshold: 0.5 });
  return (
    <figure className="flex flex-col items-center">
      <div ref={ref} className="relative h-[440px] w-full sm:h-[540px] lg:h-[620px]">
        {faces && seen ? (
          // The canvas stays centered on the card's place and reaches both edges of the screen, so a card swung or dragged anywhere is never cut off: one screen wide, plus the slot's own width where two sit side by side, and REACH times the slot's height. It lets clicks through everywhere but on the card.
          <div className="pointer-events-none absolute top-0 left-1/2 z-10 h-[150%] w-screen -translate-x-1/2 sm:w-[calc(100vw+100%)]">
            <Lanyard
              frontImage={faces.front}
              backImage={faces.back}
              strapImage={faces.strap}
              cardColor="#ffffff"
              finish="glossy"
              size={0.56 / REACH}
              // The card's top sits 27% down the slot, as with a strap of 0.5 in the slot alone.
              strapLength={(0.27 / REACH - 0.12) / 0.3}
              strapWidth={0.62}
              breeze={0.25}
              metal="silver"
              introFrom="top"
              roam
              style={STRAP_FADE}
            />
          </div>
        ) : null}
      </div>
    </figure>
  );
}

/**
 * The founders as two lanyard cards that drop in from the top. The front is
 * the photo, the name and the role; flipped, the back is the name, the role
 * and the school. The faces are drawn once the team is a screen away. The same words
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
        <LanyardSlot key={member.name} faces={faces?.[i] ?? null} />
      ))}
    </div>
  );
}
