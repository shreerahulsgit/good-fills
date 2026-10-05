/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/products/:slug', destination: '/product/:slug', permanent: true },
      { source: '/products', destination: '/shop', permanent: true },
      { source: '/international-delivery', destination: '/shipping-policy#international', permanent: true },
      { source: '/international-shipping', destination: '/shipping-policy#international', permanent: true },
      { source: '/contact', destination: '/contact-us', permanent: true },
      { source: '/about', destination: '/our-story', permanent: true },
      { source: '/track', destination: '/track-order', permanent: true },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/terms', destination: '/terms-of-service', permanent: true },
      { source: '/console/inquires', destination: '/console/inquiries', permanent: true },
      { source: '/admin', destination: '/console', permanent: true },
      { source: '/admin/:path*', destination: '/console/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
