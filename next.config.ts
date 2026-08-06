import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root so a stray lockfile above the repo is ignored.
  turbopack: { root: import.meta.dirname },
  poweredByHeader: false,
};

export default nextConfig;
