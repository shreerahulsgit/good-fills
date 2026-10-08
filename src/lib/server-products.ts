import { Product, ProductAvailability } from '@/types';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function toSupabaseProductRow(product: Product) {
  return {
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
  };
}

function fromSupabaseProductRow(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: row.category as Product['category'],
    price: Number(row.price),
    packSize: String(row.pack_size || ''),
    productWeightGrams: Number(row.product_weight_grams),
    shortDescription: String(row.short_description || ''),
    description: String(row.description || ''),
    ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(String) : [],
    ingredientsVerified: Boolean(row.ingredients_verified),
    ingredientsNote: typeof row.ingredients_note === 'string' ? row.ingredients_note : undefined,
    benefits: Array.isArray(row.benefits) ? row.benefits.map(String) : undefined,
    usageInstructions: typeof row.usage_instructions === 'string' ? row.usage_instructions : undefined,
    preparationInstructions: typeof row.preparation_instructions === 'string' ? row.preparation_instructions : undefined,
    storageInstructions: typeof row.storage_instructions === 'string' ? row.storage_instructions : undefined,
    shelfLife: String(row.shelf_life || ''),
    availability: row.availability as ProductAvailability,
    featured: Boolean(row.featured),
    images: (row.images && typeof row.images === 'object' ? row.images : {}) as Product['images'],
    fssaiCompliant: row.fssai_compliant !== false,
    madeToOrder: row.made_to_order !== false,
  };
}

export async function getAllServerProducts(): Promise<Product[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw new Error(`Failed to load products from Supabase: ${error.message}`);
  return (data || []).map((row) => fromSupabaseProductRow(row as Record<string, unknown>));
}

export async function getServerProductById(id: string): Promise<Product | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load product from Supabase: ${error.message}`);
  return data ? fromSupabaseProductRow(data as Record<string, unknown>) : null;
}

export async function getServerProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Failed to load product from Supabase: ${error.message}`);
  return data ? fromSupabaseProductRow(data as Record<string, unknown>) : null;
}

export async function updateServerProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const existing = await getServerProductById(id);
  if (!existing) {
    throw new Error(`Product not found with ID: ${id}`);
  }

  const updated: Product = {
    ...existing,
    ...updates,
    id: existing.id,
    images: {
      ...existing.images,
      ...(updates.images || {}),
    },
  };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('products')
    .update(toSupabaseProductRow(updated))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update product in Supabase: ${error.message}`);

  return fromSupabaseProductRow(data as Record<string, unknown>);
}

export async function createServerProduct(data: Partial<Product> & { name: string; category: any; price: number }): Promise<Product> {
  const id = data.id || `prod-${Date.now().toString().slice(-4)}`;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProduct: Product = {
    id,
    slug,
    name: data.name.trim(),
    category: data.category,
    price: Number(data.price) || 0,
    packSize: data.packSize || '250g',
    productWeightGrams: Number(data.productWeightGrams) || 250,
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    ingredientsVerified: Boolean(data.ingredientsVerified),
    ingredientsNote: data.ingredientsNote || '',
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
    storageInstructions: data.storageInstructions || 'Store in an airtight container in a cool, dry place.',
    shelfLife: data.shelfLife || '6 months',
    availability: (data.availability as ProductAvailability) || 'available',
    featured: Boolean(data.featured),
    images: {
      primary: data.images?.primary || '/logo.png',
      packaging: data.images?.packaging || '/logo.png',
      detail: data.images?.detail || '/logo.png',
      lifestyle: data.images?.lifestyle || '/logo.png',
    },
    fssaiCompliant: data.fssaiCompliant !== false,
    madeToOrder: data.madeToOrder !== false,
  };

  const supabase = createSupabaseAdminClient();
  const { data: createdRow, error } = await supabase
    .from('products')
    .insert(toSupabaseProductRow(newProduct))
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create product in Supabase: ${error.message}`);

  return fromSupabaseProductRow(createdRow as Record<string, unknown>);
}

export async function deleteServerProduct(id: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete product from Supabase: ${error.message}`);

  return true;
}

export async function toggleServerProductAvailability(id: string, availability: ProductAvailability): Promise<Product> {
  return updateServerProduct(id, { availability });
}

export async function toggleServerProductFeatured(id: string): Promise<Product> {
  const existing = await getServerProductById(id);
  if (!existing) {
    throw new Error(`Product not found with ID: ${id}`);
  }
  return updateServerProduct(id, { featured: !existing.featured });
}
