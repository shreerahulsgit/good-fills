import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product, ProductAvailability } from '@/types';
import { PRODUCTS } from '@/data/products';
import { 
  getFirebaseDb, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from '@/lib/firebase-db';

const PRIMARY_DATA_DIR = path.join(process.cwd(), '.data');
const PRIMARY_PRODUCTS_FILE = path.join(PRIMARY_DATA_DIR, 'products.json');
const PRIMARY_DELETED_FILE = path.join(PRIMARY_DATA_DIR, 'deleted-products.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'good-fills-data');
const TMP_PRODUCTS_FILE = path.join(TMP_DATA_DIR, 'products.json');
const TMP_DELETED_FILE = path.join(TMP_DATA_DIR, 'deleted-products.json');

let productsCache: Map<string, Product> = new Map();
let deletedProductIds: Set<string> = new Set(['prod-live-test']);
let isInitialized = false;
let lastFirestoreSync = 0;
const FIRESTORE_SYNC_COOLDOWN_MS = 5000; // 5s cache cooldown to avoid excessive queries

function loadDeletedIds() {
  try {
    if (fs.existsSync(PRIMARY_DELETED_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRIMARY_DELETED_FILE, 'utf8'));
      if (Array.isArray(data)) data.forEach((id: string) => deletedProductIds.add(id));
    }
  } catch {}
  try {
    if (fs.existsSync(TMP_DELETED_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_DELETED_FILE, 'utf8'));
      if (Array.isArray(data)) data.forEach((id: string) => deletedProductIds.add(id));
    }
  } catch {}
}

function persistDeletedIds() {
  const serialized = JSON.stringify(Array.from(deletedProductIds));
  try {
    ensureDataDirs();
    fs.writeFileSync(PRIMARY_DELETED_FILE, serialized, 'utf8');
  } catch {}
  try {
    ensureDataDirs();
    fs.writeFileSync(TMP_DELETED_FILE, serialized, 'utf8');
  } catch {}
}

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

let lastLoadedMtime = 0;

export function initProductStore(force = false) {
  ensureDataDirs();

  let shouldReload = force || !isInitialized;

  if (!shouldReload) {
    try {
      if (fs.existsSync(PRIMARY_PRODUCTS_FILE)) {
        const stat = fs.statSync(PRIMARY_PRODUCTS_FILE);
        if (stat.mtimeMs !== lastLoadedMtime) {
          shouldReload = true;
        }
      } else if (fs.existsSync(TMP_PRODUCTS_FILE)) {
        const stat = fs.statSync(TMP_PRODUCTS_FILE);
        if (stat.mtimeMs !== lastLoadedMtime) {
          shouldReload = true;
        }
      }
    } catch {}
  }

  if (!shouldReload) return;
  isInitialized = true;
  loadDeletedIds();

  let loaded = false;

  // 1. Try loading from primary disk
  try {
    if (fs.existsSync(PRIMARY_PRODUCTS_FILE)) {
      const stat = fs.statSync(PRIMARY_PRODUCTS_FILE);
      lastLoadedMtime = stat.mtimeMs;
      const content = fs.readFileSync(PRIMARY_PRODUCTS_FILE, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        productsCache.clear();
        data.forEach((p: Product) => {
          if (!deletedProductIds.has(p.id)) {
            productsCache.set(p.id, p);
          }
        });
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
        const stat = fs.statSync(TMP_PRODUCTS_FILE);
        lastLoadedMtime = stat.mtimeMs;
        const content = fs.readFileSync(TMP_PRODUCTS_FILE, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data) && data.length > 0) {
          productsCache.clear();
          data.forEach((p: Product) => {
            if (!deletedProductIds.has(p.id)) {
              productsCache.set(p.id, p);
            }
          });
          loaded = true;
        }
      }
    } catch (err) {
      console.error('Error loading products from tmp disk:', err);
    }
  }

  // 3. Fallback: Seed with default catalog from src/data/products.ts
  if (productsCache.size === 0) {
    PRODUCTS.forEach((p) => {
      if (!deletedProductIds.has(p.id)) {
        productsCache.set(p.id, { ...p });
      }
    });
    persistProducts();
  }
}

function persistProducts() {
  const serialized = JSON.stringify(Array.from(productsCache.values()), null, 2);

  try {
    ensureDataDirs();
    fs.writeFileSync(PRIMARY_PRODUCTS_FILE, serialized, 'utf8');
    const stat = fs.statSync(PRIMARY_PRODUCTS_FILE);
    lastLoadedMtime = stat.mtimeMs;
  } catch {}

  try {
    ensureDataDirs();
    fs.writeFileSync(TMP_PRODUCTS_FILE, serialized, 'utf8');
    const stat = fs.statSync(TMP_PRODUCTS_FILE);
    if (!lastLoadedMtime) {
      lastLoadedMtime = stat.mtimeMs;
    }
  } catch {}
}

/**
 * Sync with Firebase Cloud Firestore
 * - Pulls latest products across all Vercel instances
 * - If Firestore products collection is empty, auto-seeds with current catalog
 * - Falls back smoothly to cache if offline or unconfigured
 */
export async function syncProductsFromFirestore(force = false): Promise<Product[]> {
  initProductStore();

  const now = Date.now();
  if (!force && (now - lastFirestoreSync) < FIRESTORE_SYNC_COOLDOWN_MS) {
    return Array.from(productsCache.values());
  }

  const db = getFirebaseDb();
  if (!db) {
    return Array.from(productsCache.values());
  }

  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);

    if (snapshot.empty) {
      // Auto-seed Firestore from default catalog
      console.log('[Firestore] Products collection empty. Auto-seeding 14 creations...');
      const seedPromises = Array.from(productsCache.values()).map(async (prod) => {
        const prodDoc = doc(db, 'products', prod.id);
        await setDoc(prodDoc, prod);
      });
      await Promise.all(seedPromises);
      lastFirestoreSync = now;
      return Array.from(productsCache.values());
    }

    // Populate productsCache from Firestore documents
    const cloudProducts: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      if (data && data.id && !deletedProductIds.has(data.id)) {
        cloudProducts.push(data);
      }
    });

    if (cloudProducts.length > 0) {
      productsCache.clear();
      cloudProducts.forEach((p) => productsCache.set(p.id, p));
      persistProducts();
    }

    lastFirestoreSync = now;
    return Array.from(productsCache.values());
  } catch (err: any) {
    // If Firestore API not enabled yet or offline, continue with memory cache
    console.warn('[Firestore] Sync warning (running on local cache fallback):', err.message || err);
    return Array.from(productsCache.values());
  }
}

export function getAllServerProducts(force = false): Product[] {
  initProductStore(force);
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

export async function updateServerProduct(id: string, updates: Partial<Product>): Promise<Product> {
  initProductStore();
  const existing = productsCache.get(id);
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

  productsCache.set(id, updated);
  persistProducts();

  // Asynchronously sync to Cloud Firestore
  const db = getFirebaseDb();
  if (db) {
    try {
      const prodDoc = doc(db, 'products', id);
      await setDoc(prodDoc, updated, { merge: true });
      console.log(`[Firestore] Successfully saved product updates for: ${id}`);
    } catch (err: any) {
      console.error(`[Firestore] Failed to persist product ${id} to cloud:`, err.message);
    }
  }

  return updated;
}

export async function createServerProduct(data: Partial<Product> & { name: string; category: any; price: number }): Promise<Product> {
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

  // Asynchronously write to Cloud Firestore
  const db = getFirebaseDb();
  if (db) {
    try {
      const prodDoc = doc(db, 'products', id);
      await setDoc(prodDoc, newProduct);
      console.log(`[Firestore] Created new product in cloud: ${id}`);
    } catch (err: any) {
      console.error(`[Firestore] Failed to create product ${id} in cloud:`, err.message);
    }
  }

  return newProduct;
}

export async function deleteServerProduct(id: string): Promise<boolean> {
  initProductStore();
  deletedProductIds.add(id);
  persistDeletedIds();

  productsCache.delete(id);
  persistProducts();

  // Asynchronously delete from Cloud Firestore
  const db = getFirebaseDb();
  if (db) {
    try {
      const prodDoc = doc(db, 'products', id);
      await deleteDoc(prodDoc);
      console.log(`[Firestore] Deleted product from cloud: ${id}`);
    } catch (err: any) {
      console.error(`[Firestore] Failed to delete product ${id} from cloud:`, err.message);
    }
  }

  return true;
}

export async function toggleServerProductAvailability(id: string, availability: ProductAvailability): Promise<Product> {
  return updateServerProduct(id, { availability });
}

export async function toggleServerProductFeatured(id: string): Promise<Product> {
  initProductStore();
  const existing = productsCache.get(id);
  if (!existing) {
    throw new Error(`Product not found with ID: ${id}`);
  }
  return updateServerProduct(id, { featured: !existing.featured });
}
