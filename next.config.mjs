/** @type {import('next').NextConfig} */
const nextConfig = {
  // Externalize pdf-parse to avoid webpack bundling issues
  // This is needed because pdf-parse has internal require() calls that don't work with webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark pdf-parse as external so it's not bundled
      config.externals = [...(config.externals || []), 'pdf-parse'];
    }
    return config;
  },
  // Experimental settings
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
    // Allow larger file uploads (200MB) for contract processing
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://quzovwfpsmcmsndbmipc.supabase.co https://generativelanguage.googleapis.com; frame-ancestors 'self';"
          }
        ]
      }
    ];
  },
};

export default nextConfig;
