/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  logging: {
    fetches: {
      failed: true,
    },
  },
  images: {
    domains: ['api_gateway'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'api_gateway',
        port: '8080', // thêm port nếu server bạn chạy cổng 8080
        pathname: '/public/images/**',
      },
    ],
  },
};

export default nextConfig;
