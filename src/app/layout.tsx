import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { KEYWORDS } from "@/lib/seo";
import { founders, siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Site-wide metadata. The share images come from the opengraph-image and
 * twitter-image files beside this one, and the icons from favicon.ico, icon.svg,
 * icon1.png and apple-icon.png. Each page sets its own title, description,
 * keywords and canonical link through pageMetadata (lib/seo).
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: KEYWORDS,
  applicationName: siteConfig.name,
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  authors: founders.map((f) => ({ name: f.name })),
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  // Search Console and Bing Webmaster Tools tokens, when set in the deploy.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
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
