/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
  },
})

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async redirects() {
    return [
      // Legacy job-creation URLs — normalise to /jobs/create
      { source: '/jobs/new', destination: '/jobs/create', permanent: true },
      { source: '/jobs/post', destination: '/jobs/create', permanent: true },
    ]
  },
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}
module.exports = withMDX(nextConfig)
