import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root so a stray lockfile above the repo is ignored.
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
  // The screenshot tool (scripts/screenshots) runs next dev; its pictures never show the dev badge.
  ...(process.env.COERE_SCREENSHOTS ? { devIndicators: false as const } : {}),
  // The docs read their Markdown from disk when a page is drawn, so the
  // files must ship with the server build.
  outputFileTracingIncludes: {
    "/preview/resources": ["./src/site/content/docs/*.md"],
    "/preview/resources/[page]": ["./src/site/content/docs/*.md"],
  },
  /**
   * One address per page: https://www.coere.ai, no trailing slash. Vercel's
   * domain settings already send coere.ai to www with a 308, and Next sends
   * /about/ to /about (trailingSlash stays false). This rule is the same
   * redirect in code, so the apex can never serve a second copy of the site
   * if the domain settings change.
   */
  /**
   * Frames on the public pages: they may frame only this site (the live
   * demos under /preview/live) and only this site may frame them. So a
   * script slipped into a public page cannot open a frame of Coere's own
   * Console, which the extension lets coere.ai load for /dashboard alone
   * (docs/accounts.md 6.8). The private paths are left out here, since
   * src/proxy.ts gives each of them its own nonce policy, and two policies
   * on one answer would both apply.
   */
  async headers() {
    return [
      {
        source: "/:path((?!admin(?:/|$)|sign-in$|sign-up$|auth(?:/|$)|connect$|account$|dashboard(?:/|$)).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-src 'self'; frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "coere.ai" }],
        destination: "https://www.coere.ai/:path*",
        permanent: true,
      },
      // The developer waitlist has one address; the short and singular forms
      // people type lead to it. /developers has no page of its own yet.
      { source: "/developers", destination: "/developers/waitlist", permanent: false },
      { source: "/developer", destination: "/developers/waitlist", permanent: false },
      { source: "/developer/waitlist", destination: "/developers/waitlist", permanent: true },
      // The operator's panel moved from /statistics to /admin. Not permanent,
      // so no browser keeps the old address as gone for good. These run
      // before the proxy, which then guards /admin as usual.
      { source: "/statistics", destination: "/admin", permanent: false },
      { source: "/statistics/:path*", destination: "/admin/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
