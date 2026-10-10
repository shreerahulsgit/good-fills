import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getServerProductBySlug } from '@/lib/store/products';
import { Review, ProductReviewSummary, ReviewRow } from '@/types';

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-featured-deepika',
    productId: 'prod-10',
    productName: 'Ubtan Face Pack',
    rating: 5,
    title: 'Amazing for the skin, adds smoothness and natural glow',
    comment: "Thank you for sending me Goodfills products, the ubtan face mask and baby bath - it's amazing for the skin. It adds the smoothness and glow to the skin. Also it has no fragrance or a strong smell which I personally prefer. Thank you",
    authorName: 'Deepika Subbaiah',
    location: 'Bengaluru, Karnataka',
    isVerifiedBuyer: true,
    helpfulCount: 42,
    createdAt: '2026-10-01T10:00:00.000Z',
    isFeatured: true,
    status: 'published',
    testimonialImage: '/images/testimonials/Deepika.png',
  },
  {
    id: 'rev-featured-sowmya',
    productId: 'prod-13',
    productName: 'Filter Coffee Powder',
    rating: 5,
    title: 'Loving the coffee blend! Every sip is a delight',
    comment: 'Hi Alankrutha, we’re loving the coffee blend! The taste is genuinely authentic, and every sip is a delight. Truly enjoyable. From Good fills ❤️',
    authorName: 'Sowmya',
    location: 'Bengaluru, Karnataka',
    isVerifiedBuyer: true,
    helpfulCount: 39,
    createdAt: '2026-10-02T11:30:00.000Z',
    isFeatured: true,
    status: 'published',
    testimonialImage: '/images/testimonials/sowmya.png',
  },
  {
    id: 'rev-featured-preksha',
    productId: 'prod-05',
    productName: 'Baby Ragi Sari',
    rating: 5,
    title: "My preferred choice for my baby's food since the beginning",
    comment: "Alankrutha has been my preferred choice for my baby's food since the beginning. She has a special talent for making ragi seri, which my daughter loves. I have tried other brands, but she never liked them as much as Alankrutha's. I am very grateful to Alankrutha for introducing such delicious and nutritious baby foods.",
    authorName: 'Preksha Rohan',
    location: 'Bengaluru, Karnataka',
    childAge: 'Baby Care',
    isVerifiedBuyer: true,
    helpfulCount: 56,
    createdAt: '2026-10-03T09:15:00.000Z',
    isFeatured: true,
    status: 'published',
    testimonialImage: '/images/testimonials/Preksha.png',
  },
  {
    id: 'rev-featured-shambhavi',
    productId: 'prod-04',
    productName: 'Kids Nutrition Powder',
    rating: 5,
    title: "My son really likes dry fruits powder, it's tasty and healthy",
    comment: "Hi Alankrutha, Thank you for Goodfills products, my son really likes dry fruits powder, it's tasty and healthy.. I recommend this for other customers also. Thanks again",
    authorName: 'Shambhavi',
    location: 'Bengaluru, Karnataka',
    childAge: 'Active Kids',
    isVerifiedBuyer: true,
    helpfulCount: 38,
    createdAt: '2026-10-04T14:20:00.000Z',
    isFeatured: true,
    status: 'published',
    testimonialImage: '/images/testimonials/Shambhavi.png',
  },
  {
    id: 'rev-featured-nischita',
    productId: 'prod-10',
    productName: 'Ubtan Face Pack',
    rating: 5,
    title: 'Gives amazing glow and removes sun tan',
    comment: 'I really loved the Ubtan powder by Goodfills. It really gives you amazing glow to your skin and even removes sun tan. I highly recommend this product to everyone. Thank you Alankrutha ❤️',
    authorName: 'Nischita Kiran',
    location: 'Bengaluru, Karnataka',
    isVerifiedBuyer: true,
    helpfulCount: 48,
    createdAt: '2026-10-05T16:00:00.000Z',
    isFeatured: true,
    status: 'published',
    testimonialImage: '/images/testimonials/Nischita.png',
  }
];

function normalizeProductId(productIdOrSlug: string): string {
  const clean = productIdOrSlug.trim().toLowerCase();
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

function fromReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    orderId: row.order_id || undefined,
    productId: row.product_id,
    productName: row.product_name,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    authorName: row.author_name,
    location: row.location,
    childAge: row.child_age || undefined,
    isVerifiedBuyer: row.is_verified_buyer,
    helpfulCount: row.helpful_count,
    createdAt: row.created_at,
    isFeatured: row.is_featured,
    status: row.status,
    testimonialImage: row.testimonial_image || undefined,
    founderReply: row.founder_reply || undefined,
  };
}

function toReviewRow(review: Review) {
  return {
    id: review.id,
    order_id: review.orderId || null,
    product_id: review.productId,
    product_name: review.productName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    author_name: review.authorName,
    location: review.location,
    child_age: review.childAge || null,
    is_verified_buyer: review.isVerifiedBuyer,
    helpful_count: review.helpfulCount,
    created_at: review.createdAt,
    is_featured: Boolean(review.isFeatured),
    status: review.status || 'published',
    testimonial_image: review.testimonialImage || null,
    founder_reply: review.founderReply || null,
  };
}

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load reviews from Supabase: ${error.message}`);
  return (data || []).map((row) => fromReviewRow(row as ReviewRow));
}

export async function getProductReviewSummary(productIdOrSlug: string): Promise<ProductReviewSummary> {
  const product = productIdOrSlug.startsWith('prod-')
    ? null
    : await getServerProductBySlug(productIdOrSlug);
  const targetId = (product?.id || normalizeProductId(productIdOrSlug)).toLowerCase();
  const { data, error } = await createSupabaseAdminClient()
    .from('reviews')
    .select('*')
    .eq('product_id', targetId)
    .neq('status', 'hidden')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load product reviews from Supabase: ${error.message}`);
  const matched = (data || []).map((row) => fromReviewRow(row as ReviewRow));

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

export async function getReviewsByOrderId(orderId: string): Promise<Review[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('reviews')
    .select('*')
    .eq('order_id', orderId.trim())
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load order reviews from Supabase: ${error.message}`);
  return (data || []).map((row) => fromReviewRow(row as ReviewRow));
}

export async function addCustomerReview(data: {
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  location?: string;
  childAge?: string;
}): Promise<Review> {
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

  const { data: created, error } = await createSupabaseAdminClient()
    .from('reviews')
    .insert(toReviewRow(newReview))
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create review in Supabase: ${error.message}`);
  return fromReviewRow(created as ReviewRow);
}

export async function voteReviewHelpful(reviewId: string): Promise<number> {
  const { data: review, error: loadError } = await createSupabaseAdminClient()
    .from('reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .maybeSingle();
  if (loadError) throw new Error(`Failed to load review in Supabase: ${loadError.message}`);
  if (!review) return 0;

  const helpfulCount = Number(review.helpful_count || 0) + 1;
  const { error } = await createSupabaseAdminClient()
    .from('reviews')
    .update({ helpful_count: helpfulCount })
    .eq('id', reviewId);
  if (error) throw new Error(`Failed to update review helpful count: ${error.message}`);
  return helpfulCount;
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const { data, error } = await createSupabaseAdminClient()
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`Failed to delete review from Supabase: ${error.message}`);
  return Boolean(data);
}

export async function toggleFeaturedReview(reviewId: string): Promise<boolean> {
  const { data: review, error: loadError } = await createSupabaseAdminClient()
    .from('reviews')
    .select('is_featured')
    .eq('id', reviewId)
    .maybeSingle();
  if (loadError) throw new Error(`Failed to load review in Supabase: ${loadError.message}`);
  if (!review) return false;

  const isFeatured = !Boolean(review.is_featured);
  const { error } = await createSupabaseAdminClient().from('reviews').update({ is_featured: isFeatured }).eq('id', reviewId);
  if (error) throw new Error(`Failed to update review featured status: ${error.message}`);
  return isFeatured;
}

export async function toggleReviewVisibility(reviewId: string, forcedStatus?: 'published' | 'hidden'): Promise<Review | null> {
  const { data: review, error: loadError } = await createSupabaseAdminClient()
    .from('reviews')
    .select('status')
    .eq('id', reviewId)
    .maybeSingle();
  if (loadError) throw new Error(`Failed to load review in Supabase: ${loadError.message}`);
  if (!review) return null;

  const status = forcedStatus || (review.status === 'hidden' ? 'published' : 'hidden');
  const { data, error } = await createSupabaseAdminClient()
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update review visibility: ${error.message}`);
  return fromReviewRow(data as ReviewRow);
}

export async function addFounderReply(reviewId: string, message: string): Promise<Review | null> {
  const founderReply = {
    message: message.trim(),
    repliedAt: new Date().toISOString(),
  };
  const { data, error } = await createSupabaseAdminClient()
    .from('reviews')
    .update({ founder_reply: founderReply })
    .eq('id', reviewId)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`Failed to save founder reply: ${error.message}`);
  return data ? fromReviewRow(data as ReviewRow) : null;
}

export async function resetReviewsToSeed(): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error: deleteError } = await supabase.from('reviews').delete().not('id', 'is', null);
  if (deleteError) throw new Error(`Failed to clear reviews in Supabase: ${deleteError.message}`);

  const { error: insertError } = await supabase
    .from('reviews')
    .insert(INITIAL_REVIEWS.map((review) => toReviewRow({ ...review })));
  if (insertError) throw new Error(`Failed to seed reviews in Supabase: ${insertError.message}`);
}