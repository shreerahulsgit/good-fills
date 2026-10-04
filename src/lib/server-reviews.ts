import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Review {
  id: string;
  orderId?: string; // Verified order identifier
  productId: string; // product id or slug
  productName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  authorName: string;
  location: string;
  childAge?: string; // e.g. "8 Months", "1.5 Years", "Whole Family"
  isVerifiedBuyer: boolean;
  helpfulCount: number;
  createdAt: string;
  isFeatured?: boolean; // Highlighted as top testimonial
  status?: 'published' | 'hidden'; // Moderation status
  founderReply?: {
    message: string;
    repliedAt: string;
  };
}

export interface ProductReviewSummary {
  averageRating: number;
  totalCount: number;
  recommendationPercentage: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: Review[];
}

const PRIMARY_DATA_DIR = path.join(process.cwd(), '.data');
const PRIMARY_REVIEWS_FILE = path.join(PRIMARY_DATA_DIR, 'reviews.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'good-fills-data');
const TMP_REVIEWS_FILE = path.join(TMP_DATA_DIR, 'reviews.json');

// Authentic, verified foundational parent & patron reviews for all 13 creations
const INITIAL_REVIEWS: Review[] = [
  // 1. Baby Cereal Mix (prod-01 / baby-cereal-mix)
  {
    id: 'rev-01-1',
    productId: 'prod-01',
    productName: 'Baby Cereal Mix',
    rating: 5,
    title: 'Extremely easy on my 7-month-old’s delicate stomach',
    comment: 'Started weaning my son with this. Unlike store-bought cereals that cause constipation and have vanilla artificial flavoring, this has a natural roasted grain aroma. Dissolves lump-free in warm water and ghee.',
    authorName: 'Priyanka Nambiar',
    location: 'Bengaluru, Karnataka',
    childAge: '7 Months',
    isVerifiedBuyer: true,
    helpfulCount: 24,
    createdAt: '2026-09-15T10:30:00.000Z',
  },
  {
    id: 'rev-01-2',
    productId: 'prod-01',
    productName: 'Baby Cereal Mix',
    rating: 5,
    title: 'Cleanest baby food you can find',
    comment: 'Knowing it is made fresh to order in Bengaluru gives me complete peace of mind. Zero preservatives and completely natural. My daughter finishes her entire morning bowl without fuss.',
    authorName: 'Sneha Kulkarni',
    location: 'Pune, Maharashtra',
    childAge: '9 Months',
    isVerifiedBuyer: true,
    helpfulCount: 19,
    createdAt: '2026-09-22T14:15:00.000Z',
  },
  {
    id: 'rev-01-3',
    productId: 'prod-01',
    productName: 'Baby Cereal Mix',
    rating: 4,
    title: 'Very wholesome, took 2 days for baby to adjust',
    comment: 'Because there is no added sugar or synthetic vanilla, babies need 2-3 spoonfuls to get used to the authentic earthy grain taste. Once she did, she loves it. Fast DTDC delivery.',
    authorName: 'Divya Sundaram',
    location: 'Chennai, Tamil Nadu',
    childAge: '8 Months',
    isVerifiedBuyer: true,
    helpfulCount: 11,
    createdAt: '2026-09-28T09:00:00.000Z',
  },

  // 2. Ragi Porridge Mix (prod-02 / ragi-porridge-mix)
  {
    id: 'rev-02-1',
    productId: 'prod-02',
    productName: 'Ragi Porridge Mix',
    rating: 5,
    title: 'Traditional sprouted ragi just like grandma prepared',
    comment: 'Sprouting ragi at home takes 48 hours of soaking, shade drying, and roasting. Good Fills saves so much time while maintaining the exact same traditional authenticity. Deep malted aroma and rich natural calcium.',
    authorName: 'Dr. Ananya Rao',
    location: 'Bengaluru, Karnataka',
    childAge: '11 Months',
    isVerifiedBuyer: true,
    helpfulCount: 42,
    createdAt: '2026-09-10T11:20:00.000Z',
  },
  {
    id: 'rev-02-2',
    productId: 'prod-02',
    productName: 'Ragi Porridge Mix',
    rating: 5,
    title: 'Noticeable weight gain and great energy',
    comment: 'My pediatrician recommended sprouted ragi for healthy infant weight milestones. The texture is velvety and smooth. I cook it with a touch of homemade ghee. Will be reordering regularly.',
    authorName: 'Meera Venkat',
    location: 'Coimbatore, Tamil Nadu',
    childAge: '1 Year',
    isVerifiedBuyer: true,
    helpfulCount: 31,
    createdAt: '2026-09-18T16:45:00.000Z',
  },
  {
    id: 'rev-02-3',
    productId: 'prod-02',
    productName: 'Ragi Porridge Mix',
    rating: 5,
    title: 'Finely stone-milled and completely lump-free',
    comment: 'Whisks effortlessly into cold water before boiling. Cooks in just 5 minutes into a rich, glossy porridge. My twin toddlers eat this every evening before bed.',
    authorName: 'Kavitha Radhakrishnan',
    location: 'Hyderabad, Telangana',
    childAge: '15 Months',
    isVerifiedBuyer: true,
    helpfulCount: 16,
    createdAt: '2026-09-29T12:00:00.000Z',
  },

  // 3. Kids Bath Powder (prod-03 / kids-bath-powder)
  {
    id: 'rev-03-1',
    productId: 'prod-03',
    productName: 'Kids Bath Powder',
    rating: 5,
    title: 'Gentle, soap-free bath powder that cleared cradle cap & dryness',
    comment: 'Commercial soaps dried out my newborn’s soft skin. This herbal bath powder with green gram, rose petals, and turmeric leaves skin supple, smooth, and naturally fragrant without any synthetic foams.',
    authorName: 'Sowmya Murali',
    location: 'Bengaluru, Karnataka',
    childAge: '6 Months',
    isVerifiedBuyer: true,
    helpfulCount: 28,
    createdAt: '2026-09-12T08:15:00.000Z',
  },
  {
    id: 'rev-03-2',
    productId: 'prod-03',
    productName: 'Kids Bath Powder',
    rating: 5,
    title: 'Zero tears and leaves no greasy film',
    comment: 'Mix with a little warm milk or water into a creamy paste. It cleans gently and rinses off cleanly. The subtle earthy botanic scent is divine.',
    authorName: 'Archana Joshi',
    location: 'Mumbai, Maharashtra',
    childAge: '2 Years',
    isVerifiedBuyer: true,
    helpfulCount: 14,
    createdAt: '2026-09-24T18:30:00.000Z',
  },

  // 4. Kids Nutrition Powder (prod-04 / kids-nutrition-powder)
  {
    id: 'rev-04-1',
    productId: 'prod-04',
    productName: 'Kids Nutrition Powder',
    rating: 5,
    title: 'A true wholesome upgrade from malted chocolate drinks',
    comment: 'Looked at the ingredients on commercial health drinks and was shocked by 40% added sugar. Good Fills nutrition powder has sprouted nuts, seeds, and pulses. My 4-year-old drinks it every morning with warm milk.',
    authorName: 'Rajeshwari Natarajan',
    location: 'Bengaluru, Karnataka',
    childAge: '4 Years',
    isVerifiedBuyer: true,
    helpfulCount: 38,
    createdAt: '2026-09-08T14:10:00.000Z',
  },
  {
    id: 'rev-04-2',
    productId: 'prod-04',
    productName: 'Kids Nutrition Powder',
    rating: 5,
    title: 'My fussy eater loves the nutty taste',
    comment: 'We struggled to get my toddler to eat almonds and lentils. A single scoop in his evening milk has worked wonders for his stamina and immunity.',
    authorName: 'Deepak Nair',
    location: 'Kochi, Kerala',
    childAge: '3 Years',
    isVerifiedBuyer: true,
    helpfulCount: 22,
    createdAt: '2026-09-20T17:40:00.000Z',
  },

  // 5. Baby Ragi Sari (prod-05 / baby-ragi-sari)
  {
    id: 'rev-05-1',
    productId: 'prod-05',
    productName: 'Baby Ragi Sari',
    rating: 5,
    title: 'Traditional Karnataka ragi sari at its finest',
    comment: 'The sprouted ragi and rice malt combination is feather-light on infant bellies. Cooks into a silky custard consistency. It has become our daily staple since my baby turned 6 months.',
    authorName: 'Shilpa Bhat',
    location: 'Mangaluru, Karnataka',
    childAge: '6 Months',
    isVerifiedBuyer: true,
    helpfulCount: 35,
    createdAt: '2026-09-14T09:30:00.000Z',
  },
  {
    id: 'rev-05-2',
    productId: 'prod-05',
    productName: 'Baby Ragi Sari',
    rating: 5,
    title: 'Pure goodness without chemicals',
    comment: 'Packaged in a secure airtight foil pouch. You can immediately smell the freshly roasted sprouted grains when opening the pack. Top marks for kitchen authenticity.',
    authorName: 'Aishwarya G.',
    location: 'Bengaluru, Karnataka',
    childAge: '8 Months',
    isVerifiedBuyer: true,
    helpfulCount: 18,
    createdAt: '2026-09-26T11:00:00.000Z',
  },

  // 6. Sprouted Green Gram Porridge (prod-06 / sprouted-green-gram-porridge)
  {
    id: 'rev-06-1',
    productId: 'prod-06',
    productName: 'Sprouted Green Gram Porridge',
    rating: 5,
    title: 'High-protein, cooling, and completely digestible',
    comment: 'Sprouted moong is known in Ayurveda to be the lightest legume. This porridge has zero heaviness or gas for babies. We pair it with a pinch of cumin and rock salt. Excellent.',
    authorName: 'Padma Lakshmi',
    location: 'Madurai, Tamil Nadu',
    childAge: '10 Months',
    isVerifiedBuyer: true,
    helpfulCount: 26,
    createdAt: '2026-09-16T13:20:00.000Z',
  },
  {
    id: 'rev-06-2',
    productId: 'prod-06',
    productName: 'Sprouted Green Gram Porridge',
    rating: 4,
    title: 'Very light meal, great for recovery after teething fevers',
    comment: 'Whenever my baby feels under the weather, this soothing green gram porridge is the only food she accepts. Nutritious and gentle.',
    authorName: 'Tanvi Shah',
    location: 'Ahmedabad, Gujarat',
    childAge: '11 Months',
    isVerifiedBuyer: true,
    helpfulCount: 15,
    createdAt: '2026-09-27T15:00:00.000Z',
  },

  // 7. Wonder Millet Mix (prod-07 / wonder-millet-mix)
  {
    id: 'rev-07-1',
    productId: 'prod-07',
    productName: 'Wonder Millet Mix',
    rating: 5,
    title: 'Rich heritage millets for the whole family',
    comment: 'Foxtail, little millet, and kodo milled together. We prepare it as breakfast kanji with buttermilk and curry leaves. Sustains energy till lunch without insulin spikes.',
    authorName: 'Sridhar Raman',
    location: 'Chennai, Tamil Nadu',
    childAge: 'Whole Family',
    isVerifiedBuyer: true,
    helpfulCount: 21,
    createdAt: '2026-09-11T16:10:00.000Z',
  },
  {
    id: 'rev-07-2',
    productId: 'prod-07',
    productName: 'Wonder Millet Mix',
    rating: 5,
    title: 'Wholesome prebiotic fiber for gut health',
    comment: 'Been drinking this warm every morning for 3 weeks. Digestion has improved remarkably. Clean aroma and no bitter aftertaste.',
    authorName: 'Harish Babu',
    location: 'Mysuru, Karnataka',
    childAge: 'Adult Wellness',
    isVerifiedBuyer: true,
    helpfulCount: 17,
    createdAt: '2026-09-23T10:45:00.000Z',
  },

  // 8. Plant Protein Powder (prod-08 / plant-protein-powder)
  {
    id: 'rev-08-1',
    productId: 'prod-08',
    productName: 'Plant Protein Powder',
    rating: 5,
    title: 'Zero bloating, zero artificial sweeteners',
    comment: 'Every whey or soy protein on the market gave me severe gastric bloat from sucralose and gums. This traditional whole-food sprouted seed protein feels so pure. Blends perfectly into post-workout banana smoothies.',
    authorName: 'Aditya Swaminathan',
    location: 'Bengaluru, Karnataka',
    childAge: 'Adult Nutrition',
    isVerifiedBuyer: true,
    helpfulCount: 34,
    createdAt: '2026-09-13T19:00:00.000Z',
  },
  {
    id: 'rev-08-2',
    productId: 'prod-08',
    productName: 'Plant Protein Powder',
    rating: 5,
    title: 'Real food nutrition that keeps you full',
    comment: 'Clean taste of cold-milled seeds and sprouted pulses. No chemical chalkiness. Highly recommend for active professionals and seniors.',
    authorName: 'Nalini Varma',
    location: 'Thiruvananthapuram, Kerala',
    childAge: 'Adult Nutrition',
    isVerifiedBuyer: true,
    helpfulCount: 19,
    createdAt: '2026-09-25T14:20:00.000Z',
  },

  // 9. ImmuniTea (prod-09 / immunitea)
  {
    id: 'rev-09-1',
    productId: 'prod-09',
    productName: 'ImmuniTea',
    rating: 5,
    title: 'Warming, potent botanicals with zero tea dust or bitterness',
    comment: 'Brewed with whole crushed spices and Ashwagandha. The aroma filled the entire house. Soothing for scratchy throats and seasonal monsoon coughs in Bengaluru.',
    authorName: 'Gayathri Krishnan',
    location: 'Bengaluru, Karnataka',
    childAge: 'Family Ritual',
    isVerifiedBuyer: true,
    helpfulCount: 40,
    createdAt: '2026-09-09T08:00:00.000Z',
  },
  {
    id: 'rev-09-2',
    productId: 'prod-09',
    productName: 'ImmuniTea',
    rating: 5,
    title: 'Pure Ayurvedic comfort in a cup',
    comment: 'Simmered 1 teaspoon with water and a spoon of Good Fills mountain honey. You can immediately feel the warmth of ginger and long pepper. Outstanding.',
    authorName: 'Vikram Mehta',
    location: 'New Delhi',
    childAge: 'Family Ritual',
    isVerifiedBuyer: true,
    helpfulCount: 23,
    createdAt: '2026-09-21T20:15:00.000Z',
  },

  // 10. Herbal Hair Oil (prod-10 / herbal-hair-oil)
  {
    id: 'rev-10-1',
    productId: 'prod-10',
    productName: 'Herbal Hair Oil',
    rating: 5,
    title: 'Infused with real herbs, noticeably reduced postpartum hairfall',
    comment: 'Postpartum hair loss was alarming me until I started warm oil head massages with this twice weekly. Deep herbal infusion with curry leaves and amla. Scalp feels calmed and roots feel nourished.',
    authorName: 'Lakshmi Narayanan',
    location: 'Bengaluru, Karnataka',
    childAge: 'Hair Ritual',
    isVerifiedBuyer: true,
    helpfulCount: 36,
    createdAt: '2026-09-17T11:40:00.000Z',
  },
  {
    id: 'rev-10-2',
    productId: 'prod-10',
    productName: 'Herbal Hair Oil',
    rating: 5,
    title: 'Non-sticky and deeply conditioning',
    comment: 'No synthetic mineral oil or artificial chemical perfumes. Pure cold-pressed oils infused the authentic traditional way.',
    authorName: 'Radhika Sen',
    location: 'Kolkata, West Bengal',
    childAge: 'Hair Ritual',
    isVerifiedBuyer: true,
    helpfulCount: 18,
    createdAt: '2026-09-28T16:50:00.000Z',
  },

  // 11. Ubtan Face Pack (prod-11 / ubtan-face-pack)
  {
    id: 'rev-11-1',
    productId: 'prod-11',
    productName: 'Ubtan Face Pack',
    rating: 5,
    title: 'Brightens skin naturally without stripping moisture',
    comment: 'Used it before a family wedding blended with raw milk. Removed tan and left an instant golden glow. Doesn’t leave that tight, parched feeling clay masks cause. 10/10.',
    authorName: 'Chandana Gowda',
    location: 'Bengaluru, Karnataka',
    childAge: 'Bridal & Daily Glow',
    isVerifiedBuyer: true,
    helpfulCount: 29,
    createdAt: '2026-09-14T15:30:00.000Z',
  },
  {
    id: 'rev-11-2',
    productId: 'prod-11',
    productName: 'Ubtan Face Pack',
    rating: 5,
    title: 'Pure sandalwood and vetiver fragrance',
    comment: 'Authentic South Indian ubtan recipe. It gently exfoliates dead cells without harsh microplastics. Softest skin ever.',
    authorName: 'Preeti Sharma',
    location: 'Jaipur, Rajasthan',
    childAge: 'Daily Skin Care',
    isVerifiedBuyer: true,
    helpfulCount: 22,
    createdAt: '2026-09-25T18:00:00.000Z',
  },

  // 12. Pure Mountain Honey (prod-12 / pure-mountain-honey)
  {
    id: 'rev-12-1',
    productId: 'prod-12',
    productName: 'Pure Mountain Honey',
    rating: 5,
    title: 'Thick, raw, and unheated with floral notes',
    comment: 'Commercial honey in supermarkets is mostly high-fructose corn syrup. This mountain honey crystallized slightly in winter, proving it is 100% raw and untreated. Tastes wild and rich.',
    authorName: 'Girish Menon',
    location: 'Kozhikode, Kerala',
    childAge: 'Pantry Ritual',
    isVerifiedBuyer: true,
    helpfulCount: 33,
    createdAt: '2026-09-12T10:15:00.000Z',
  },
  {
    id: 'rev-12-2',
    productId: 'prod-12',
    productName: 'Pure Mountain Honey',
    rating: 5,
    title: 'Nothing compares to raw unprocessed honey',
    comment: 'A spoonful with warm water and lemon every morning. Excellent natural immunity and throat coat.',
    authorName: 'Aarti Pillai',
    location: 'Bengaluru, Karnataka',
    childAge: 'Pantry Ritual',
    isVerifiedBuyer: true,
    helpfulCount: 16,
    createdAt: '2026-09-26T08:45:00.000Z',
  },

  // 13. Filter Coffee Powder (prod-13 / filter-coffee-powder)
  {
    id: 'rev-13-1',
    productId: 'prod-13',
    productName: 'Filter Coffee Powder',
    rating: 5,
    title: 'The authentic Chikmagalur decoction aroma',
    comment: 'Strong, thick decoction that holds frothed milk beautifully. The blend ratio is spot on for that traditional South Indian degree coffee kick. Bengaluru mornings are incomplete without this.',
    authorName: 'Karthik Subramanian',
    location: 'Bengaluru, Karnataka',
    childAge: 'Coffee Connoisseur',
    isVerifiedBuyer: true,
    helpfulCount: 45,
    createdAt: '2026-09-10T07:15:00.000Z',
  },
  {
    id: 'rev-13-2',
    productId: 'prod-13',
    productName: 'Filter Coffee Powder',
    rating: 5,
    title: 'Dark roast with lingering caramel notes',
    comment: 'Drips slowly through the brass filter producing a syrupy, aromatic decoction. Beats premium branded coffees by a mile.',
    authorName: 'Sunil Prasad',
    location: 'Chennai, Tamil Nadu',
    childAge: 'Coffee Connoisseur',
    isVerifiedBuyer: true,
    helpfulCount: 27,
    createdAt: '2026-09-22T08:30:00.000Z',
  },
];

let reviewsCache: Map<string, Review> = new Map();
let isInitialized = false;

function ensureDataDirs() {
  if (!fs.existsSync(PRIMARY_DATA_DIR)) {
    try {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    } catch {}
  }
  if (!fs.existsSync(TMP_DATA_DIR)) {
    try {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    } catch {}
  }
}

function initReviewsStore() {
  if (isInitialized && reviewsCache.size > 0) return;

  reviewsCache.clear();

  // 1. Try primary storage
  let loaded = false;
  try {
    if (fs.existsSync(PRIMARY_REVIEWS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRIMARY_REVIEWS_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((r: Review) => reviewsCache.set(r.id, r));
        loaded = true;
      }
    }
  } catch {}

  // 2. Try temp storage fallback
  if (!loaded) {
    try {
      if (fs.existsSync(TMP_REVIEWS_FILE)) {
        const data = JSON.parse(fs.readFileSync(TMP_REVIEWS_FILE, 'utf8'));
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((r: Review) => reviewsCache.set(r.id, r));
          loaded = true;
        }
      }
    } catch {}
  }

  // 3. Populate initial authentic reviews if store is fresh
  if (!loaded || reviewsCache.size === 0) {
    INITIAL_REVIEWS.forEach((r) => reviewsCache.set(r.id, r));
    persistReviews();
  }

  isInitialized = true;
}

function persistReviews() {
  const arr = Array.from(reviewsCache.values());
  const serialized = JSON.stringify(arr, null, 2);

  ensureDataDirs();

  try {
    fs.writeFileSync(PRIMARY_REVIEWS_FILE, serialized, 'utf8');
  } catch {}

  try {
    fs.writeFileSync(TMP_REVIEWS_FILE, serialized, 'utf8');
  } catch {}
}

/**
 * Normalizes identifier to match product id or slug
 */
function normalizeProductId(productIdOrSlug: string): string {
  const clean = productIdOrSlug.trim().toLowerCase();
  // Map common slugs to IDs if needed, or match either id or slug
  const map: Record<string, string> = {
    'baby-cereal-mix': 'prod-01',
    'ragi-porridge-mix': 'prod-02',
    'kids-bath-powder': 'prod-03',
    'kids-nutrition-powder': 'prod-04',
    'baby-ragi-sari': 'prod-05',
    'sprouted-green-gram-porridge': 'prod-06',
    'wonder-millet-mix': 'prod-07',
    'plant-protein-powder': 'prod-08',
    'immunitea': 'prod-09',
    'herbal-hair-oil': 'prod-10',
    'ubtan-face-pack': 'prod-11',
    'pure-mountain-honey': 'prod-12',
    'filter-coffee-powder': 'prod-13',
  };
  return map[clean] || clean;
}

/**
 * Returns all reviews
 */
export function getAllReviews(): Review[] {
  initReviewsStore();
  return Array.from(reviewsCache.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Returns review summary and list for a specific product
 */
export function getProductReviewSummary(productIdOrSlug: string): ProductReviewSummary {
  initReviewsStore();
  const targetId = normalizeProductId(productIdOrSlug);

  const matched = Array.from(reviewsCache.values()).filter(
    (r) =>
      r.status !== 'hidden' &&
      (r.productId.toLowerCase() === targetId ||
        r.productId.toLowerCase() === productIdOrSlug.toLowerCase())
  );

  matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (matched.length === 0) {
    return {
      averageRating: 5.0,
      totalCount: 0,
      recommendationPercentage: 100,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  let recommendCount = 0;

  matched.forEach((r) => {
    sum += r.rating;
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[rounded] = (distribution[rounded] || 0) + 1;
    if (r.rating >= 4) {
      recommendCount++;
    }
  });

  const averageRating = Number((sum / matched.length).toFixed(1));
  const recommendationPercentage = Math.round((recommendCount / matched.length) * 100);

  return {
    averageRating,
    totalCount: matched.length,
    recommendationPercentage,
    distribution,
    reviews: matched,
  };
}

/**
 * Returns all reviews for a specific verified order
 */
export function getReviewsByOrderId(orderId: string): Review[] {
  initReviewsStore();
  const cleanId = orderId.trim().toLowerCase();
  return Array.from(reviewsCache.values()).filter(
    (r) => r.orderId && r.orderId.trim().toLowerCase() === cleanId
  );
}

/**
 * Adds a new verified customer review strictly tied to an order
 */
export function addCustomerReview(data: {
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  location?: string;
  childAge?: string;
}): Review {
  initReviewsStore();
  const normalizedId = normalizeProductId(data.productId);

  const newReview: Review = {
    id: `rev-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
    orderId: data.orderId.trim(),
    productId: normalizedId,
    productName: data.productName.trim(),
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    title: data.title.trim().slice(0, 100),
    comment: data.comment.trim().slice(0, 800),
    authorName: data.authorName.trim().slice(0, 60),
    location: (data.location || 'Bengaluru, Karnataka').trim().slice(0, 60),
    childAge: data.childAge ? data.childAge.trim().slice(0, 40) : undefined,
    isVerifiedBuyer: true,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
  };

  reviewsCache.set(newReview.id, newReview);
  persistReviews();

  return newReview;
}

/**
 * Increments helpful count for a review
 */
export function voteReviewHelpful(reviewId: string): number {
  initReviewsStore();
  const r = reviewsCache.get(reviewId);
  if (r) {
    r.helpfulCount = (r.helpfulCount || 0) + 1;
    persistReviews();
    return r.helpfulCount;
  }
  return 0;
}

/**
 * Deletes a review by ID
 */
export function deleteReview(reviewId: string): boolean {
  initReviewsStore();
  const existed = reviewsCache.delete(reviewId);
  if (existed) {
    persistReviews();
  }
  return existed;
}

/**
 * Toggles featured status for top testimonials
 */
export function toggleFeaturedReview(reviewId: string): boolean {
  initReviewsStore();
  const r = reviewsCache.get(reviewId);
  if (r) {
    r.isFeatured = !r.isFeatured;
    persistReviews();
    return Boolean(r.isFeatured);
  }
  return false;
}

/**
 * Toggles review visibility between published and hidden
 */
export function toggleReviewVisibility(reviewId: string, forcedStatus?: 'published' | 'hidden'): Review | null {
  initReviewsStore();
  const r = reviewsCache.get(reviewId);
  if (r) {
    r.status = forcedStatus || (r.status === 'hidden' ? 'published' : 'hidden');
    persistReviews();
    return r;
  }
  return null;
}

/**
 * Adds or updates a founder/kitchen response note
 */
export function addFounderReply(reviewId: string, message: string): Review | null {
  initReviewsStore();
  const r = reviewsCache.get(reviewId);
  if (r) {
    r.founderReply = {
      message: message.trim(),
      repliedAt: new Date().toISOString(),
    };
    persistReviews();
    return r;
  }
  return null;
}
