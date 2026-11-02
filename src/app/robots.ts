import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://thegoodfills.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/order/track'],
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/console',
                    '/console/*',
                    '/api/',
                    '/api/*',
                    '/account',
                    '/account/*',
                    '/checkout',
                    '/order/confirmation',
                    '/order/confirmation/*',
                    '/order/invoice',
                    '/order/invoice/*',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
