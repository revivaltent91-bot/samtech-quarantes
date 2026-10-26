import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok-free.app', '*.ngrok.io'],
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/docs', destination: `${API_URL}/docs` },
        { source: '/redoc', destination: `${API_URL}/redoc` },
        { source: '/openapi.json', destination: `${API_URL}/openapi.json` },
      ],
      afterFiles: [
        { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
        { source: '/console', destination: `${API_URL}/console/` },
        { source: '/console/:path*', destination: `${API_URL}/console/:path*` },
      ],
      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);