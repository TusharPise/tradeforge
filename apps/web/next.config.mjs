/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tradeforge/types', '@tradeforge/validation'],
  output: 'standalone',
};

export default nextConfig;
