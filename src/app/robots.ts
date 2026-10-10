import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://thegoodfills.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
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
                    '/order',
                    '/order/*',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}