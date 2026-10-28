import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['app', 'expo-image'],
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src/styles")],
  },
  webpack: (config) => {
    // Alias react-native vers react-native-web pour le web (client et serveur)
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': 'react-native-web',
    }
    
    // Exclure certains modules React Native qui ne sont pas nécessaires sur le web
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ]
    
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
