import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    qualities: [90],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
