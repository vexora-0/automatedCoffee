/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Disable image optimization for Cloudinary to avoid 404 issues
    // Images will be served directly from Cloudinary
    unoptimized: false,
  },
}

module.exports = nextConfig 