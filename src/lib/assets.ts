// Centralized Asset Management System
// Allows seamless dropping in of final brand photography and video assets

export const BRAND_ASSETS = {
  logo: '/images/brand/good-fills-logo.svg',
  heroMain: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80', // Artisanal raw grains, seeds, and spices in clay vessels
  craftStory: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80', // Handmade grinding & mortar
  packingDispatch: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=1200&q=80', // Clean artisanal paper packaging
  purityBanner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
};

export const CATEGORY_ASSETS = {
  'baby-kids': '/images/story/category-baby-kids.jpg',
  'nutrition-wellness': '/images/story/category-nutrition-wellness.jpg',
  'skin-bath': '/images/story/category-skin-bath.jpg',
  'pantry-beverages': '/images/story/category-pantry-beverages.jpg',
};

export const PRODUCT_ASSETS: Record<string, { primary: string; packaging: string; detail: string; lifestyle: string }> = {
  'baby-cereal-mix': {
    primary: '/images/products/baby-cereal-mix.png',
    packaging: '/images/products/baby-cereal-mix.png',
    detail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/baby-cereal-mix.png',
  },
  'ragi-porridge-mix': {
    primary: '/images/products/ragi-porridge-mix.png',
    packaging: '/images/products/ragi-porridge-mix.png',
    detail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/ragi-porridge-mix.png',
  },
  'kids-bath-powder': {
    primary: '/images/products/kids-bath-powder.png',
    packaging: '/images/products/kids-bath-powder.png',
    detail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/kids-bath-powder.png',
  },
  'kids-nutrition-powder': {
    primary: '/images/products/kids-nutrition-powder.png',
    packaging: '/images/products/kids-nutrition-powder.png',
    detail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/kids-nutrition-powder.png',
  },
  'baby-ragi-sari': {
    primary: '/images/products/baby-ragi-sari.png',
    packaging: '/images/products/baby-ragi-sari.png',
    detail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/baby-ragi-sari.png',
  },
  'immunitea': {
    primary: '/images/products/immunitea.png',
    packaging: '/images/products/immunitea.png',
    detail: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/immunitea.png',
  },
  'wonder-millet-mix': {
    primary: '/images/products/wonder-millet-mix.png',
    packaging: '/images/products/wonder-millet-mix.png',
    detail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/wonder-millet-mix.png',
  },
  'homemade-protein-powder': {
    primary: '/images/products/homemade-protein-powder.png',
    packaging: '/images/products/homemade-protein-powder.png',
    detail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/homemade-protein-powder.png',
  },
  'instant-barley-soup-mix': {
    primary: '/images/products/instant-barley-soup-mix.png',
    packaging: '/images/products/instant-barley-soup-mix.png',
    detail: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/instant-barley-soup-mix.png',
  },
  'ubtan-face-pack': {
    primary: '/images/products/ubtan-face-pack.png',
    packaging: '/images/products/ubtan-face-pack.png',
    detail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/ubtan-face-pack.png',
  },
  'sandal-bath-powder': {
    primary: '/images/products/sandal-bath-powder.png',
    packaging: '/images/products/sandal-bath-powder.png',
    detail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/sandal-bath-powder.png',
  },
  'pure-mountain-honey': {
    primary: '/images/products/pure-mountain-honey.png',
    packaging: '/images/products/pure-mountain-honey.png',
    detail: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/pure-mountain-honey.png',
  },
  'filter-coffee-powder': {
    primary: '/images/products/filter-coffee-powder.png',
    packaging: '/images/products/filter-coffee-powder.png',
    detail: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
    lifestyle: '/images/products/filter-coffee-powder.png',
  }
};
