import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray yarn.lock exists in the
  // home directory, which would otherwise make Next infer the wrong root).
  turbopack: {
    root: __dirname,
  },
  // Hide the floating dev indicator so it doesn't overlap the left sidebar.
  devIndicators: false,
};

export default nextConfig;
