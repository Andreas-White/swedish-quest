import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MD content lives in /content, served through lib/content.ts (no bundling needed)
  transpilePackages: ["react-markdown"],
};

export default nextConfig;
