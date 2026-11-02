import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Good Fills | Homemade Food & Natural Care',
    short_name: 'Good Fills',
    description: 'Small-batch food, nutrition, skincare and bath essentials made to order in Bengaluru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F5',
    theme_color: '#221813',
    icons: [
      {
        src: '/icons/icon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/icons/icon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

