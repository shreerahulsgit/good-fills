import { Product, CategoryInfo } from '@/types';
import { PRODUCT_ASSETS, CATEGORY_ASSETS } from '@/lib/assets';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'baby-kids',
    name: 'Baby & Kids',
    tagline: 'Gentle, nourishing traditional blends crafted for young bellies and delicate skin.',
    description: 'Fresh sprouted grains, cold-milled porridges, and all-natural botanic bath powders designed for growing little ones.',
    image: CATEGORY_ASSETS['baby-kids']
  },
  {
    id: 'nutrition-wellness',
    name: 'Nutrition & Wellness',
    tagline: 'Whole-food proteins, heritage millets, and time-honored botanical infusions.',
    description: 'Pure kitchen nutrition made without preservatives, synthetics, or artificial additives for everyday nourishment.',
    image: CATEGORY_ASSETS['nutrition-wellness']
  },
  {
    id: 'skin-bath',
    name: 'Skin & Bath',
    tagline: 'Pure Ayurvedic botanicals, sun-dried roots, and calming sandalwood remedies.',
    description: 'Traditional ubtans and herbal bath washes that cleanse gently while preserving the natural skin barrier.',
    image: CATEGORY_ASSETS['skin-bath']
  },
  {
    id: 'pantry-beverages',
    name: 'Pantry & Beverages',
    tagline: 'Artisanal Chikmagalur roasts and raw nectar sourced from pristine altitudes.',
    description: 'Everyday pantry rituals elevated by traditional small-batch preparation and zero adulteration.',
    image: CATEGORY_ASSETS['pantry-beverages']
  }
];

export const PRODUCTS: Product[] = [
  // 1. Baby Cereal Mix
  {
    id: 'prod-01',
    slug: 'baby-cereal-mix',
    name: 'Baby Cereal Mix',
    category: 'baby-kids',
    price: 225,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Gentle, wholesome first cereal crafted from traditional sprouted grains.',
    description: 'Prepared in small batches specifically for infants. Milled fine for easy digestibility and wholesome early nutrition.',
    ingredients: [],
    ingredientsVerified: false,
    ingredientsNote: '[CONTENT REQUIRED FROM GOOD FILLS] Specific grain ratios pending final confirmation.',
    benefits: [
      'Nutritious alternative to factory-made baby foods',
      'Zero preservatives or shelf-life chemicals',
      'Prepared in small batches after checkout',
      'Milled fine for tender infant digestion'
    ],
    storageInstructions: 'Store in an airtight container in a cool, dry place. Keep away from moisture.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['baby-cereal-mix'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 2. Ragi Porridge Mix
  {
    id: 'prod-02',
    slug: 'ragi-porridge-mix',
    name: 'Ragi Porridge Mix',
    category: 'baby-kids',
    price: 400,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Multigrain power porridge featuring traditional sprouted finger millet and grains.',
    description: 'A deeply nourishing, calcium-rich porridge crafted with sprouted ragi and complementary whole grains. Slow-roasted and ground to preserve natural nutrient density.',
    ingredients: ['Sprouted Ragi (Finger Millet)', 'Complementary Whole Grains & Pulses'],
    ingredientsVerified: false,
    ingredientsNote: 'Catalog mentions 48+ traditional grains. [CONTENT REQUIRED FROM GOOD FILLS] Detailed grain breakdown pending verification.',
    benefits: [
      'Crafted with 48+ traditional sprouted grains',
      'Hygienically dried & fine-filtered for infants',
      'Rich in natural bioavailable calcium & minerals',
      'Ideal wholesome first solid food'
    ],
    storageInstructions: 'Store in a clean, airtight container. Use a dry spoon for each serving.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['ragi-porridge-mix'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 3. Kids Bath Powder
  {
    id: 'prod-03',
    slug: 'kids-bath-powder',
    name: 'Kids Bath Powder',
    category: 'baby-kids',
    price: 200,
    packSize: '100g',
    productWeightGrams: 100,
    shortDescription: 'Soap-free herbal cleansing powder enriched with wild turmeric and avarampoo.',
    description: 'A traditional sun-dried herbal bath wash for babies and young children. Gently cleanses without stripping natural oils, leaving skin soft and naturally protected.',
    ingredients: [
      'Gram Flour',
      'White Turmeric',
      'Baje',
      'Wild Turmeric',
      'Menthya',
      'Nut Grass Root',
      'Avarampoo',
      'Green Gram',
      'Rose Petals',
      'Masoor Gram'
    ],
    ingredientsVerified: true,
    benefits: [
      '10 pure sun-dried herbs and pulses',
      'Rich in natural Vitamin E for soft skin',
      'Natural skin-lubricating, soap-free wash',
      'Safe, soothing & gentle on tender skin'
    ],
    usageInstructions: 'Mix a small quantity with warm water or milk into a smooth paste. Gently massage over damp skin and rinse cleanly.',
    storageInstructions: 'Store in a dry location. Protect from direct water splashes.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['kids-bath-powder'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 4. Kids Nutrition Powder
  {
    id: 'prod-04',
    slug: 'kids-nutrition-powder',
    name: 'Kids Nutrition Powder',
    category: 'baby-kids',
    price: 600,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Hand-roasted nut & seed powerhouse sweetened gently with Kempu Kallsakre.',
    description: 'A dense, delicious daily nutritional supplement for active children. Packed with wholesome tree nuts, seeds, and natural unrefined rock candy.',
    ingredients: [
      'Badam (Almonds)',
      'Sunflower Seeds',
      'Cashew',
      'Walnut',
      'Hazelnut',
      'Pista (Pistachio)',
      'Rock Candy (Kempu Kallsakre)'
    ],
    ingredientsVerified: true,
    benefits: [
      '7 pure nuts, seeds & Kempu Kallsakre',
      'Specifically formulated for active & athletic children',
      'Zero added preservatives or harmful chemicals',
      'Wholesome daily energy & natural weight support'
    ],
    usageInstructions: 'Stir 1-2 teaspoons into warm milk or morning porridge. Mix well and serve.',
    storageInstructions: 'Store in an airtight glass or steel jar in a cool, shaded pantry.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['kids-nutrition-powder'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 5. Baby Ragi Sari
  {
    id: 'prod-05',
    slug: 'baby-ragi-sari',
    name: 'Baby Ragi Sari',
    category: 'baby-kids',
    price: 250,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Traditional sprouted ragi, rice, and lentil malt for growing infants.',
    description: 'An easy-to-cook traditional weaning meal prepared with sprouted finger millet, golden lentils, and blanched almonds for optimal energy and digestive comfort.',
    ingredients: [
      'Sprouted Ragi',
      'Rice',
      'Toor Dal',
      'Masoor Dal',
      'Almonds'
    ],
    ingredientsVerified: false,
    ingredientsNote: 'Additional regional ingredients mentioned. [CONTENT REQUIRED FROM GOOD FILLS] Full recipe list pending confirmation.',
    benefits: [
      'Sprouted Ragi, Rice, Toor Dal, Masoor Dal & Almonds',
      'Specially crafted for baby\'s growing nutritional needs',
      'Naturally easily digestible & nutrient-dense',
      'Traditional homemade purity with zero factory fillers'
    ],
    storageInstructions: 'Keep in an airtight container away from heat and moisture.',
    shelfLife: '6 months',
    availability: 'available',
    featured: true,
    images: PRODUCT_ASSETS['baby-ragi-sari'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 6. ImmuniTea
  {
    id: 'prod-06',
    slug: 'immunitea',
    name: 'ImmuniTea',
    category: 'nutrition-wellness',
    price: 450,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Potent 13-herb botanical infusion with Ashwagandha, Brahmi, and wild spices.',
    description: 'A warming traditional Ayurvedic herbal brew featuring 13 whole spices and therapeutic herbs. Formulated to soothe the respiratory system and invigorate daily vitality.',
    ingredients: [
      'Black Cardamom',
      'Coriander Seeds',
      'Tipli (Long Pepper)',
      'Cumin Seeds',
      'Om Seeds (Ajwain)',
      'Dry Wild Ginger',
      'Cinnamon',
      'Cloves',
      'Pepper',
      'Sage',
      'Tulsi Seeds',
      'Ashwagandha',
      'Brahmi'
    ],
    ingredientsVerified: true,
    benefits: [
      '13 potent Ayurvedic spices and herbs',
      'Packed with elements that boost immunity',
      'Features Ashwagandha, Brahmi, Tulsi & Wild Ginger',
      'Soothing respiratory comfort & daily vitality'
    ],
    preparationInstructions: 'Boil 1 teaspoon in 250ml water for 3-5 minutes. Strain and enjoy warm. Honey or jaggery may be added to taste.',
    storageInstructions: 'Store in an airtight jar in a cool, dry cupboard.',
    shelfLife: '6 months',
    availability: 'available',
    featured: true,
    images: PRODUCT_ASSETS['immunitea'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 7. Wonder Millet Mix
  {
    id: 'prod-07',
    slug: 'wonder-millet-mix',
    name: 'Wonder Millet Mix',
    category: 'nutrition-wellness',
    price: 250,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Fiber-rich blend of ancient millets and hearty whole grains.',
    description: 'A versatile, slow-burning carbohydrate foundation prepared from roasted heritage millets. Ideal for rotis, dosas, or warm morning porridge.',
    ingredients: ['Ancient Millets', 'Multigrain Selection'],
    ingredientsVerified: false,
    ingredientsNote: '[CONTENT REQUIRED FROM GOOD FILLS] Exact millet variety breakdown pending confirmation.',
    benefits: [
      'All-natural heritage millets & multigrains',
      'Supports healthy BP and diabetes management',
      'High dietary fiber for heart and arterial vitality',
      'Prepared with traditional hygiene & special care'
    ],
    storageInstructions: 'Store in a sealed container in a cool, dark location.',
    shelfLife: '6 months',
    availability: 'available',
    featured: true,
    images: PRODUCT_ASSETS['wonder-millet-mix'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 8. Homemade Protein Powder
  {
    id: 'prod-08',
    slug: 'homemade-protein-powder',
    name: 'Homemade Protein Powder',
    category: 'nutrition-wellness',
    price: 850,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Whole-food plant & seed protein with chia, almonds, and raw banana powder.',
    description: 'A completely whole-food alternative to synthetic protein shakes. Roasted seeds and premium nuts provide clean, sustained amino acids and healthy fats.',
    ingredients: [
      'Almond',
      'Walnut',
      'Pistachios',
      'Cashew',
      'Pumpkin Seeds',
      'Melon Seeds',
      'Sunflower Seeds',
      'Oats',
      'Chia Seeds',
      'Milk Powder',
      'Dry Banana Powder'
    ],
    ingredientsVerified: true,
    benefits: [
      '11 whole-food ingredients (7 nuts & seeds, oats, chia, milk & banana)',
      'Pure homemade protein without synthetic isolate powders',
      'Zero artificial sweeteners, gums, or chemical fillers',
      'Versatile clean nutrition for active families'
    ],
    usageInstructions: 'Add 2 tablespoons to smoothies, warm milk, or breakfast bowls. Shake or blend thoroughly.',
    storageInstructions: 'Store in an airtight container. Refrigeration recommended during peak summer.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['homemade-protein-powder'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 9. Instant Barley Soup Mix
  {
    id: 'prod-09',
    slug: 'instant-barley-soup-mix',
    name: 'Instant Barley Soup Mix',
    category: 'nutrition-wellness',
    price: 375,
    packSize: '250g',
    productWeightGrams: 250,
    shortDescription: 'Comforting, soothing barley soup infused with aromatic kitchen spices.',
    description: 'A gentle, gut-friendly soup base prepared with roasted pearl barley, powdered nuts, and warming digestive spices. Hydrating, light, and deeply restorative.',
    ingredients: [
      'Barley',
      'Almonds',
      'Cashews',
      'Jeera (Cumin)',
      'Black Pepper',
      'Himalayan Pink Salt',
      'Tomato Powder',
      'Garlic Powder',
      'Ginger Powder',
      'Onion Powder'
    ],
    ingredientsVerified: true,
    benefits: [
      'Barley, almonds, cashews & digestive spices',
      'Aids healthy digestion & gut wellness',
      'Supports cholesterol balance & heart protection',
      'Ready-to-cook warm nourishing comfort'
    ],
    preparationInstructions: 'Whisk 2 tablespoons into 300ml boiling water. Simmer on low heat for 3 minutes until thickened. Serve warm.',
    storageInstructions: 'Keep airtight in a cool dry space.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['instant-barley-soup-mix'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 10. Ubtan Face Pack
  {
    id: 'prod-10',
    slug: 'ubtan-face-pack',
    name: 'Ubtan Face Pack',
    category: 'skin-bath',
    price: 250,
    packSize: '100g',
    productWeightGrams: 100,
    shortDescription: 'Gently clarifying herbal radiance powder for healthy, glowing skin.',
    description: 'A pure botanical treatment rooted in classical cleansing rituals. Buffs away impurities, tightens pores gently, and revives dull skin without harsh chemical exfoliants.',
    ingredients: [],
    ingredientsVerified: false,
    ingredientsNote: '[CONTENT REQUIRED FROM GOOD FILLS] Botanical herb specification pending verification.',
    benefits: [
      'Promotes extra glowing, luminous skin',
      'Natural tan & dark-patch reduction',
      'Gentle clarifying action to reduce acne',
      'Traditional Ayurvedic skin toning & rejuvenating'
    ],
    usageInstructions: 'Mix 1 teaspoon with rose water, yogurt, or raw milk. Apply evenly over face, allow to dry for 10-12 minutes, then rinse gently with lukewarm water.',
    storageInstructions: 'Store sealed away from bathroom humidity.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['ubtan-face-pack'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 11. Sandal Bath Powder
  {
    id: 'prod-11',
    slug: 'sandal-bath-powder',
    name: 'Sandal Bath Powder',
    category: 'skin-bath',
    price: 400,
    packSize: '100g',
    productWeightGrams: 100,
    shortDescription: 'Luxurious fragrant bath wash with pure sandalwood, khus, and red bay leaf.',
    description: 'An opulent traditional bathing blend featuring genuine sandalwood, cooling vetiver (khus), and aromatic sacred blossoms. Leaves the skin subtly perfumed and calmed.',
    ingredients: [
      'Sandal',
      'Turmeric',
      'White Turmeric',
      'Rose Petals',
      'Champak',
      'Muthakach Khus',
      'Indian Sarsaparilla',
      'Cinnamon',
      'Sagewort',
      'Marjoram',
      'Flagroot / Sweet Cane',
      'Black Stone Flower',
      'Red Bay Leaf'
    ],
    ingredientsVerified: true,
    benefits: [
      '13 pure botanicals with authentic sandalwood & rose',
      'Smooths, cools & calms sensitive skin',
      'Hydrates and balances sensitive or aging skin',
      'Traditional soothing & balancing properties'
    ],
    usageInstructions: 'Take 2-3 tablespoons, mix into a paste with water, and massage gently across the body in place of commercial soap. Rinse thoroughly.',
    storageInstructions: 'Keep in an airtight jar to retain the natural volatile fragrances.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['sandal-bath-powder'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 12. Pure Mountain Honey
  {
    id: 'prod-12',
    slug: 'pure-mountain-honey',
    name: 'Pure Mountain Honey',
    category: 'pantry-beverages',
    price: 400,
    packSize: '500g',
    productWeightGrams: 500,
    shortDescription: 'Raw, unpasteurized forest nectar harvested from high mountain elevations.',
    description: 'Unfiltered and completely free from added sugar syrups or heat processing. Retains naturally occurring bee pollen, floral enzymes, and rich amber complexity.',
    ingredients: ['100% Pure Raw Mountain Honey'],
    ingredientsVerified: true,
    ingredientsNote: 'Pure raw honey. Natural crystallization is normal; liquefy gently in warm water if needed.',
    benefits: [
      '100% pure raw mountain nectar',
      'Distinct natural aroma, texture & rich enzymes',
      'Antimicrobial throat soothing & cough relief',
      'Instant clean energy & promotes restful sleep'
    ],
    storageInstructions: 'Store at room temperature. Do not refrigerate.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['pure-mountain-honey'],
    fssaiCompliant: true,
    madeToOrder: true
  },

  // 13. Filter Coffee Powder
  {
    id: 'prod-13',
    slug: 'filter-coffee-powder',
    name: 'Filter Coffee Powder',
    category: 'pantry-beverages',
    price: 500,
    packSize: '500g',
    productWeightGrams: 500,
    shortDescription: 'Classic South Indian 80:20 plantation roast with Arabica, Robusta & chicory.',
    description: 'Freshly roasted and ground in traditional small batches in Bengaluru. An authentic 80:20 master blend delivering thick crema, deep bittersweet cocoa notes, and lingering warmth.',
    ingredients: [
      'Arabica Coffee Beans',
      'Robusta Coffee Beans',
      'Chicory'
    ],
    ingredientsVerified: true,
    ingredientsNote: '80:20 Coffee to Chicory ratio.',
    benefits: [
      'Karnataka-grown Arabica & Robusta coffee beans',
      'Authentic 80:20 coffee-to-chicory heritage ratio',
      'Freshly ground upon order for maximum aromatic crema',
      'Traditional South Indian filter coffee decoction'
    ],
    preparationInstructions: 'Add 2-3 tablespoons into the top chamber of a traditional South Indian brass or stainless steel decoction filter. Add freshly boiled water and allow decoction to steep for 15 minutes. Combine with hot frothy boiled milk.',
    storageInstructions: 'Transfer immediately to an airtight container to preserve roast aroma.',
    shelfLife: '6 months',
    availability: 'available',
    featured: false,
    images: PRODUCT_ASSETS['filter-coffee-powder'],
    fssaiCompliant: true,
    madeToOrder: true
  },
  // 17. Live Gateway Verification Sample (₹1 Test Item)
  {
    id: 'prod-live-test',
    slug: 'live-test-sample',
    name: 'Atelier ₹1 Live Test Sample',
    category: 'nutrition-wellness',
    price: 1,
    packSize: '1 Test Unit',
    productWeightGrams: 0,
    shortDescription: 'Temporary ₹1 verification sample to test live UPI payment and settlement.',
    description: 'A temporary ₹1 test creation for verifying live Razorpay payment processing, webhook delivery, and instant bank settlement.',
    ingredients: ['100% Quality Sprouted Grain'],
    ingredientsVerified: true,
    benefits: [
      'Instant ₹1 live UPI gateway verification',
      'Zero shipping charge test',
      'Confirms live bank settlement'
    ],
    storageInstructions: 'Atelier test creation.',
    shelfLife: 'Immediate',
    availability: 'available',
    featured: false,
    images: {
      primary: '/logo.png',
      packaging: '/logo.png',
      detail: '/logo.png',
      lifestyle: '/logo.png'
    },
    fssaiCompliant: true,
    madeToOrder: true
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(p => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter(p => p.featured);
}
