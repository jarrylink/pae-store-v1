/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Configure Turbopack for development
  turbopack: {
    // Keep file watching and module resolution inside this project.
    root: __dirname,
    resolveAlias: {
      // Add any aliases here if needed
    },
  },
};

module.exports = nextConfig;
