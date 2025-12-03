import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure remote image patterns for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hel1.your-objectstorage.com",
      },
    ],
  },
};

export default nextConfig;
