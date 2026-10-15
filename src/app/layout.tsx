import type { Metadata } from 'next';
import { CartProvider } from '@/components/context/cart-context';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/navigation/site-footer';
import { Preloader } from '@/components/navigation/site-preloader';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Homemade Food & Natural Care | Good Fills',
  description: 'Explore small-batch food, nutrition, skincare and bath essentials made to order in Bengaluru. Shop the collection with delivery across India.',
  keywords: [
    'Good Fills',
    'homemade products Bengaluru',
    'traditional ragi porridge',
    'kids bath powder',
    'herbal ubtan',
    'homemade protein powder',
    'filter coffee powder',
    'pure mountain honey',
    'made to order food India'
  ],
  authors: [{ name: 'Good Fills' }],
  metadataBase: new URL('https://thegoodfills.com'),
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icons/icon-32x32.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Homemade Food & Natural Care | Good Fills',
    description: 'Explore small-batch food, nutrition, skincare and bath essentials made to order in Bengaluru. Shop the collection with delivery across India.',
    siteName: 'Good Fills',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 400,
        alt: 'Good Fills Homemade Products',
      },
    ],
  }
};

import { PreloaderProvider } from '@/components/context/preloader-context';
import { CustomerAuthProvider } from '@/components/context/auth-context';
import { AnnouncementModal } from '@/components/navigation/announcement-modal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <PreloaderProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <Preloader />
              <AnnouncementModal />
              <SiteHeader />
              {children}
              <SiteFooter />
            </CartProvider>
          </CustomerAuthProvider>
        </PreloaderProvider>
      </body>
    </html>
  );
}