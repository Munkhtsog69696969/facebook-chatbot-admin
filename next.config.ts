import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'scontent-sin2-2.xx.fbcdn.net',
      'scontent-sin6-2.xx.fbcdn.net',
      'scontent.xx.fbcdn.net',
      'scontent.fbkk5-8.fna.fbcdn.net',
      'platform-lookaside.fbsbx.com' // Fixed: removed "https://" prefix
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;