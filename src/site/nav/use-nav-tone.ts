"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** The height on the page, in CSS pixels, where the floating bar's middle sits. */
const BAR_MIDDLE = 42;

/** The parts of a page the bar turns dark over. */
const DARK_PARTS = '[data-nav-tone="dark"], :has(> main > [data-theme="dark"]) > footer';

/**
 * Whether the glass bar is over a dark part of the page. A section marks
 * itself with data-nav-tone="dark"; the bar then turns its glass dark and its
 * words white, so it stays readable and still bends what is under it. The
 * footer of a dark page (see DarkPage) counts as dark too.
 */
export function useNavTone(): "light" | "dark" {
  const pathname = usePathname();
  const [tone, setTone] = useState<"light" | "dark">("light");

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const dark = Array.from(document.querySelectorAll<HTMLElement>(DARK_PARTS)).some((section) => {
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
