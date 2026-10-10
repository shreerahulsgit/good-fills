import { MetadataRoute } from 'next';
import { getAllServerProducts } from '@/lib/store/products';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://thegoodfills.com';
    const products = await getAllServerProducts();

    const productUrls: MetadataRoute.Sitemap = products
    .filter((p) => p.slug && !p.id.includes('test'))
    .map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(),
                       changeFrequency: 'weekly',
                       priority: 0.85,
    }));

    const categoryUrls: MetadataRoute.Sitemap = [
        'baby-kids',
        'nutrition-wellness',
        'skin-bath',
        'pantry-beverages',
    ].map((cat) => ({
        url: `${baseUrl}/shop/${cat}`,
        lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
    }));

    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/our-story`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact-us`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/order/track`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/account`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/shipping-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/refund-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        }
    ];

    return [...staticUrls, ...categoryUrls, ...productUrls];
}