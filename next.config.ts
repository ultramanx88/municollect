import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  transpilePackages: ['@municollect/shared'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
