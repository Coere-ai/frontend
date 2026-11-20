"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PageTone = "light" | "dark";

const ToneContext = createContext<PageTone>("light");

/** The theme of the page a part sits on, for the few parts that draw their colors in code (the pricing cards' pixels). */
export function usePageTone(): PageTone {
  return useContext(ToneContext);
}

/**
 * A page whose hero is dark, dark from the top to the footer. It sets
 * data-theme="dark", which every shared section reads through the dark:
 * variant (see globals.css), and data-nav-tone="dark", which keeps the
 * glass navbar dark all the way down. The footer and the bounce past the
 * page's ends follow it through CSS, so the theme is right on first paint.
 */
export function DarkPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <ToneContext value="dark">
      <div data-theme="dark" data-nav-tone="dark" className={`bg-night text-white ${className}`}>
        {children}
      </div>
    </ToneContext>
  );
}
