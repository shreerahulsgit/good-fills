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
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332818/baby-cereal-mix_ort49h.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332818/baby-cereal-mix_ort49h.png',
    detail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332818/baby-cereal-mix_ort49h.png',
  },
  'ragi-porridge-mix': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/ragi-porridge-mix_ummvre.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/ragi-porridge-mix_ummvre.png',
    detail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/ragi-porridge-mix_ummvre.png',
  },
  'kids-bath-powder': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/kids-bath-powder_czow7b.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/kids-bath-powder_czow7b.png',
    detail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/kids-bath-powder_czow7b.png',
  },
  'kids-nutrition-powder': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/kids-nutrition-powder_ya030n.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/kids-nutrition-powder_ya030n.png',
    detail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332817/kids-nutrition-powder_ya030n.png',
  },
  'baby-ragi-sari': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332818/baby-ragi-sari_ad49km.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332818/baby-ragi-sari_ad49km.png',
    detail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791332818/baby-ragi-sari_ad49km.png',
  },
  'immunitea': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306402/immunitea_gfdqbn.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306402/immunitea_gfdqbn.png',
    detail: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306402/immunitea_gfdqbn.png',
  },
  'wonder-millet-mix': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306469/wonder-millet-mix_orjmkg.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306469/wonder-millet-mix_orjmkg.png',
    detail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306469/wonder-millet-mix_orjmkg.png',
  },
  'homemade-protein-powder': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306403/homemade-protein-powder_b59cub.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306403/homemade-protein-powder_b59cub.png',
    detail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306403/homemade-protein-powder_b59cub.png',
  },
  'instant-barley-soup-mix': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306401/instant-barley-soup-mix_ci9uhs.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306401/instant-barley-soup-mix_ci9uhs.png',
    detail: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306401/instant-barley-soup-mix_ci9uhs.png',
  },
  'ubtan-face-pack': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306455/ubtan-face-pack_ry0nyy.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306455/ubtan-face-pack_ry0nyy.png',
    detail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306455/ubtan-face-pack_ry0nyy.png',
  },
  'sandal-bath-powder': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306455/sandal-bath-powder_tazevc.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306455/sandal-bath-powder_tazevc.png',
    detail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306455/sandal-bath-powder_tazevc.png',
  },
  'pure-mountain-honey': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306456/pure-mountain-honey_xnpokg.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306456/pure-mountain-honey_xnpokg.png',
    detail: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306456/pure-mountain-honey_xnpokg.png',
  },
  'filter-coffee-powder': {
    primary: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306400/filter-coffee-powder_l2erna.png',
    packaging: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306400/filter-coffee-powder_l2erna.png',
    detail: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
    lifestyle: 'https://res.cloudinary.com/dqqrrgdwd/image/upload/v1791306400/filter-coffee-powder_l2erna.png',
  }
};
