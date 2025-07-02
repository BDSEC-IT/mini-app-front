/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  
  // Add proxy for FAQ API to handle CORS
  async rewrites() {
    return [
      {
        source: '/api/faq/:path*',
        destination: 'https://new.bdsec.mn/api/v1/faq/:path*',
      },
    ]
  }
}

export default nextConfig
