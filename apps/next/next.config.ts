import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['app', 'expo-image'],
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src/styles")],
  },
  turbopack: {
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
