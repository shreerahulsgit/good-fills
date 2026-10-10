/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/admin/:path*', destination: '/console/:path*', permanent: true },
      { source: '/products/:slug', destination: '/product/:slug', permanent: true },
      { source: '/product', destination: '/shop', permanent: true },
      { source: '/order', destination: '/checkout', permanent: true },
      { source: '/about', destination: '/our-story', permanent: true },
      { source: '/track', destination: '/order/track', permanent: true },
      { source: '/contact', destination: '/contact-us', permanent: true },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/terms', destination: '/terms-of-service', permanent: true },
    ];
  },
};

export default nextConfig;
