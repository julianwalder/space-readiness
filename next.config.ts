import type { NextConfig } from "next";
import { execSync } from 'child_process';

const nextConfig: NextConfig = {
  turbopack: {
    root: "/Users/julian/space-readiness"
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: (() => {
      try {
        return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      } catch {
        return 'unknown';
      }
    })(),
  },
};

export default nextConfig;
