const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
    // Handle external dependencies that cause build issues
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('@opentelemetry/exporter-jaeger');
    }
    
    // Ignore handlebars require.extensions warnings
    config.ignoreWarnings = [
      /require\.extensions is not supported/,
      /Module not found.*@opentelemetry\/exporter-jaeger/,
    ];
    
    return config;
  },

};

module.exports = nextConfig;