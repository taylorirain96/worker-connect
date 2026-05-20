/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
  },
})

const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async redirects() {
    return [
      // Legacy job-creation URLs — normalise to /jobs/create
      { source: '/jobs/new', destination: '/jobs/create', permanent: true },
      { source: '/jobs/post', destination: '/jobs/create', permanent: true },
    ]
  },
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

// Wrap with Sentry for source-map upload, route instrumentation, and tunnelling.
// All Sentry build features are no-ops when SENTRY_AUTH_TOKEN / SENTRY_DSN are
// not configured, so local dev and PR builds without secrets keep working.
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Upload source maps on Vercel / CI builds only.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Hide source maps from generated client bundles so they're not publicly served.
  hideSourceMaps: true,
  // Strip Sentry SDK logger statements in production for smaller bundles.
  disableLogger: true,
  // Tunnel events through a Next.js route to bypass ad-blockers.
  tunnelRoute: '/monitoring',
}

module.exports = withSentryConfig(withMDX(nextConfig), sentryBuildOptions)
