import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../src/data/products';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required.');
}

async function main() {
  const supabase = createClient(supabaseUrl!, secretKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const rows = PRODUCTS.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    pack_size: product.packSize,
    product_weight_grams: product.productWeightGrams,
    short_description: product.shortDescription,
    description: product.description,
    ingredients: product.ingredients,
    ingredients_verified: product.ingredientsVerified,
    ingredients_note: product.ingredientsNote || null,
    benefits: product.benefits || null,
    usage_instructions: product.usageInstructions || null,
    preparation_instructions: product.preparationInstructions || null,
    storage_instructions: product.storageInstructions || null,
    shelf_life: product.shelfLife,
    availability: product.availability,
    featured: product.featured,
    images: product.images,
    fssai_compliant: product.fssaiCompliant,
    made_to_order: product.madeToOrder,
  }));

  const { error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    throw new Error(`Product seed failed: ${error.message}`);
  }

  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Product count verification failed: ${countError.message}`);
  }

  console.log(`Seeded ${rows.length} catalog products. Supabase now contains ${count ?? 0} products.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
