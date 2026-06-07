/** @type {import('next').NextConfig} */
// Configure @next/mdx. Note: do NOT pass an `options` block with empty
// `remarkPlugins`/`rehypePlugins` arrays — some combinations of
// @next/mdx + @mdx-js/loader + unified versions interpret an empty
// plugin entry as an "empty preset" and throw at build time:
//   "Expected usable value but received an empty preset, which is
//    probably a mistake: presets typically come with `plugins` and
//    sometimes with `settings`, but this has neither"
// Plugins (when needed) must be referenced by package-name string
// because next.config.js is CommonJS and remark/rehype plugins are ESM.
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
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

// Force fresh Vercel build – 2026-06-07
module.exports = withSentryConfig(withMDX(nextConfig), sentryBuildOptions)
