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
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080', // thêm port nếu server bạn chạy cổng 8080
        pathname: '/public/images/**',
      },
    ],
  },
};

export default nextConfig;
