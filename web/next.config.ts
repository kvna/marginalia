import type { NextConfig } from "next";

/**
 * Static export. Azure Static Web Apps free tier serves the `out/` directory as
 * plain files — no Node process, no server, nothing that can accrue cost.
 * `trailingSlash` keeps deep links like /books/w-tfs/ resolving to an index.html
 * on a static host rather than 404ing.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
