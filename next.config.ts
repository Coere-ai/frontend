import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root so a stray lockfile above the repo is ignored.
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
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
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "coere.ai" }],
        destination: "https://www.coere.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
