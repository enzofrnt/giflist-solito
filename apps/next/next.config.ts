import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['app', 'expo-image'],
  // The dev badge sits on top of the mobile tab bar; development-only chrome.
  devIndicators: false,
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src/styles")],
  },
  experimental: {
    // Inline the small app stylesheet so it is not a render-blocking request.
    inlineCss: true,
  },
  turbopack: {
    // Prisma's generated client uses dynamic filesystem helpers for engine
    // resolution. These are expected; suppress only the two known tracing
    // warnings from generated code instead of hiding unrelated builder issues.
    ignoreIssue: [
      {
        path: '**/src/generated/prisma/**',
        title: 'Dynamic filesystem access causes tracing of the whole project',
      },
    ],
    // Alias React Native to react-native-web for both client and server.
    resolveAlias: {
      'react-native': 'react-native-web',
    },
    // Prefer web-specific implementations, matching the former webpack setup.
    resolveExtensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
