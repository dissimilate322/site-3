import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.WISPBYTE_BUILD === "1" ? "standalone" : undefined,
  devIndicators: false,
  images: {
    qualities: [90],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
