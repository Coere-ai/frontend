import type { ReactNode } from "react";
import { Geist, Noto_Sans_JP } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Geist has no Japanese, so the Japanese pages add Noto Sans JP after it.
 * It is not preloaded: the browser fetches only the slices of it a page
 * uses, and only on a page in Japanese.
 */
const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

/**
 * The <html> and <body> every page sits in, for both root layouts: the
 * language, the fonts and the no script fallback for the reveal animations.
 */
export function RootDocument({ lang, children }: { lang: string; children: ReactNode }) {
  const fonts = lang === "ja" ? `${geistSans.variable} ${notoJp.variable}` : geistSans.variable;
  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${fonts} h-full antialiased`}>
      {/* eslint-disable-next-line @next/next/no-head-element -- this is the root layout's <html>, moved out of app/ so two root layouts share it. */}
      <head>
        {/*
          Scroll-reveal animations render with an inline `opacity:0` on the
          server. Without JS nothing would ever animate in, so reveal it all.
        */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
