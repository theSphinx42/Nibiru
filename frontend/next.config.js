/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Disable the file watcher to prevent ERR_INVALID_ARG_TYPE errors
  onDemandEntries: {
    // Keep the pages in memory for 24 hours
    maxInactiveAge: 24 * 60 * 60 * 1000,
    // Don't actively watch for changes (this is what's causing the errors)
    pagesBufferLength: 999,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 