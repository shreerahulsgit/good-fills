import type { Metadata } from 'next';
import '@/styles/globals.css';
import { CartProvider } from '@/lib/cart-context';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { Preloader } from '@/components/common/Preloader';

export const metadata: Metadata = {
  title: 'Good Fills — Homemade Traditional Care, Prepared with Care',
  description: 'Artisanal homemade food, nutrition, skincare and bath products prepared with care and made to order in Bengaluru, India. Fast DTDC delivery across India.',
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
  metadataBase: new URL('https://goodfills.in'),
  openGraph: {
    title: 'Good Fills — Traditional Care, Made for Everyday Life',
    description: 'Artisanal homemade food, nutrition, skincare and bath products prepared with care and made to order in Bengaluru.',
    siteName: 'Good Fills',
    locale: 'en_IN',
    type: 'website'
  }
};

import { PreloaderProvider } from '@/lib/preloader-context';
import { CustomerAuthProvider } from '@/lib/customer-auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <PreloaderProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <Preloader />
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
