/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8081',
    BILLING_API_URL: process.env.BILLING_API_URL || 'http://localhost:8082',
    SUPPORT_API_URL: process.env.SUPPORT_API_URL || 'http://localhost:8083',
    ANALYTICS_API_URL: process.env.ANALYTICS_API_URL || 'http://localhost:8085',
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:8081'}/auth/:path*`,
      },
      {
        source: '/api/billing/:path*',
        destination: `${process.env.BILLING_API_URL || 'http://localhost:8082'}/billing/:path*`,
      },
      {
        source: '/api/support/:path*',
        destination: `${process.env.SUPPORT_API_URL || 'http://localhost:8083'}/support/:path*`,
      },
      {
        source: '/api/analytics/:path*',
        destination: `${process.env.ANALYTICS_API_URL || 'http://localhost:8085'}/analytics/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;