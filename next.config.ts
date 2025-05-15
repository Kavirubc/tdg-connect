import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [],
    // This enables the use of Next.js Image component with static files
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Enable unoptimized local images
    unoptimized: true
  },
  // Make sure static assets are served correctly from public directory
  assetPrefix: undefined,
  // Ensure the public directory is included
  reactStrictMode: true,
  // Make sure static files are served from public directory
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/userAvatar/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
