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
};

export default nextConfig;
