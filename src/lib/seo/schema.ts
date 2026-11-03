import { Product, ProductReviewSummary } from '@/types';

const SITE_URL = 'https://thegoodfills.com';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: 'Good Fills',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo.png`,
    description: 'Small-batch artisanal food, nutrition, skincare and bath essentials made to order in Bengaluru. Handcrafted with traditional methods and zero chemical preservatives.',
    email: 'care@thegoodfills.com',
    telephone: '+919986422020',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946',
    },
    priceRange: '₹₹',
    sameAs: [
      'https://www.instagram.com/goodfills2020',
      'https://www.facebook.com/share/1FMwVm7H2b',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Good Fills',
    description: 'Homemade Food, Traditional Nutrition & Botanical Bath Essentials',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function generateProductSchema(product: Product, reviewSummary?: ProductReviewSummary | null) {
  const images = [
    product.images?.primary,
    product.images?.packaging,
    product.images?.detail,
    product.images?.lifestyle,
  ]
    .filter(Boolean)
    .map((img) => (img!.startsWith('http') ? img! : `${SITE_URL}${img}`));

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/product/${product.slug}#product`,
    name: `${product.name} (${product.packSize})`,
    description: product.shortDescription || product.description,
    image: images.length > 0 ? images : [`${SITE_URL}/logo.png`],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Good Fills',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.availability === 'sold-out'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Good Fills',
      },
    },
  };

  if (reviewSummary && reviewSummary.totalCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewSummary.averageRating,
      reviewCount: reviewSummary.totalCount,
      bestRating: 5,
      worstRating: 1,
    };

    if (reviewSummary.reviews && reviewSummary.reviews.length > 0) {
      schema.review = reviewSummary.reviews.slice(0, 5).map((r) => {
        const review = {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
          author: {
            '@type': 'Person',
            name: r.authorName || 'Verified Customer',
          },
          reviewBody: r.comment || r.title,
        };

        return r.createdAt
          ? { ...review, datePublished: new Date(r.createdAt).toISOString().split('T')[0] }
          : review;
      });
    }
  }

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
