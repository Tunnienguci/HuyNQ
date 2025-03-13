/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tối ưu cho các thiết bị cũ
  swcMinify: true,
  // Tối ưu hóa image
  images: {
    formats: ['image/avif', 'image/webp'],
    // Giảm kích thước mặc định cho các thiết bị cũ
    deviceSizes: [320, 375, 425, 640, 750, 828, 1080, 1200, 1920, 2048],
  },
  // Tối ưu hóa bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig

