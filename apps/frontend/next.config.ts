import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
  webpack: (config, { isServer }) => {
    // Ignore warnings for missing modules
    config.ignoreWarnings = [
      /Module not found/,
      /Can't resolve/,
      /require.extensions is not supported/,
    ];
    return config;
  },
};

export default nextConfig;