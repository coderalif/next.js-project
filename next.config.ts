import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Hide the Next.js development badge from the FitLog screen.
  devIndicators: false,
  // Keep Turbopack's project root inside this workspace.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
