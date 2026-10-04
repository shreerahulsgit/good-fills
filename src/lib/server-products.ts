import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product, ProductAvailability } from '@/types';
import { PRODUCTS } from '@/data/products';

const PRIMARY_DATA_DIR = path.join(process.cwd(), '.data');
const PRIMARY_PRODUCTS_FILE = path.join(PRIMARY_DATA_DIR, 'products.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'good-fills-data');
const TMP_PRODUCTS_FILE = path.join(TMP_DATA_DIR, 'products.json');

let productsCache: Map<string, Product> = new Map();
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

export function initProductStore() {
  if (isInitialized) return;
  isInitialized = true;
  ensureDataDirs();

  let loaded = false;

  // 1. Try loading from primary disk
  try {
    if (fs.existsSync(PRIMARY_PRODUCTS_FILE)) {
      const content = fs.readFileSync(PRIMARY_PRODUCTS_FILE, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((p: Product) => productsCache.set(p.id, p));
        loaded = true;
      }
    }
  } catch (err) {
    console.error('Error loading products from primary disk:', err);
  }

  // 2. Try loading from tmp disk if primary was empty
  if (!loaded) {
    try {
      if (fs.existsSync(TMP_PRODUCTS_FILE)) {
        const content = fs.readFileSync(TMP_PRODUCTS_FILE, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((p: Product) => productsCache.set(p.id, p));
          loaded = true;
        }
      }
    } catch (err) {
      console.error('Error loading products from tmp disk:', err);
    }
  }

  // 3. Fallback: Seed with default catalog from src/data/products.ts
  if (!loaded || productsCache.size === 0) {
    PRODUCTS.forEach((p) => productsCache.set(p.id, { ...p }));
    persistProducts();
  }
}

function persistProducts() {
  const serialized = JSON.stringify(Array.from(productsCache.values()), null, 2);

  try {
    ensureDataDirs();
    fs.writeFileSync(PRIMARY_PRODUCTS_FILE, serialized, 'utf8');
  } catch (err) {
    console.error('Error writing products to primary disk:', err);
  }

  try {
    ensureDataDirs();
    fs.writeFileSync(TMP_PRODUCTS_FILE, serialized, 'utf8');
  } catch (err) {
    console.error('Error writing products to tmp disk:', err);
  }
}

export function getAllServerProducts(): Product[] {
  initProductStore();
  return Array.from(productsCache.values());
}

export function getServerProductById(id: string): Product | null {
  initProductStore();
  return productsCache.get(id) || null;
}

export function getServerProductBySlug(slug: string): Product | null {
  initProductStore();
  const products = Array.from(productsCache.values());
  return products.find((p) => p.slug === slug) || null;
}

export function updateServerProduct(id: string, updates: Partial<Product>): Product {
  initProductStore();
  const existing = productsCache.get(id);
  if (!existing) {
    throw new Error(`Product not found with ID: ${id}`);
  }

  const updated: Product = {
    ...existing,
    ...updates,
    id: existing.id, // ID is immutable
    images: {
      ...existing.images,
      ...(updates.images || {}),
    },
  };

  productsCache.set(id, updated);
  persistProducts();
  return updated;
}

export function createServerProduct(data: Partial<Product> & { name: string; category: any; price: number }): Product {
  initProductStore();
  
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

  productsCache.set(id, newProduct);
  persistProducts();
  return newProduct;
}

export function deleteServerProduct(id: string): boolean {
  initProductStore();
  if (!productsCache.has(id)) {
    return false;
  }
  const deleted = productsCache.delete(id);
  if (deleted) {
    persistProducts();
  }
  return deleted;
}

export function toggleServerProductAvailability(id: string, availability: ProductAvailability): Product {
  return updateServerProduct(id, { availability });
}

export function toggleServerProductFeatured(id: string): Product {
  initProductStore();
  const existing = productsCache.get(id);
  if (!existing) {
    throw new Error(`Product not found with ID: ${id}`);
  }
  return updateServerProduct(id, { featured: !existing.featured });
}
