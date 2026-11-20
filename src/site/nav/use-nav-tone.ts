"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** The height on the page, in CSS pixels, where the floating bar's middle sits. */
const BAR_MIDDLE = 42;

/** The parts of a page the bar turns dark over. */
const DARK_PARTS = '[data-nav-tone="dark"], :has(> main > [data-theme="dark"]) > footer';

/** A page in the dark theme (see DarkPage), which keeps the bar dark from its top to its end. */
const DARK_PAGE = 'main > [data-theme="dark"]';

/**
 * Whether the glass bar is over a dark part of the page. A section marks
 * itself with data-nav-tone="dark"; the bar then turns its glass dark and its
 * words white, so it stays readable and still bends what is under it. The
 * footer of a dark page (see DarkPage) counts as dark too, and on a page in
 * the dark theme the bar is dark all the way, even over a first section
 * that starts below it. Every page of the site is dark, so the bar starts
 * dark and the first paint already matches.
 */
export function useNavTone(): "light" | "dark" {
  const pathname = usePathname();
  const [tone, setTone] = useState<"light" | "dark">("dark");

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const dark =
        document.querySelector(DARK_PAGE) !== null ||
        Array.from(document.querySelectorAll<HTMLElement>(DARK_PARTS)).some((section) => {
          const box = section.getBoundingClientRect();
          return box.top <= BAR_MIDDLE && box.bottom >= BAR_MIDDLE;
        });
      setTone(dark ? "dark" : "light");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return tone;
}
