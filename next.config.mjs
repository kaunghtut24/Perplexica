/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // Configure environment variables
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  // Add webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
