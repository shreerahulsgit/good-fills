# Good Fills — Firebase Cloud Database Integration Plan

> **Objective:** Transition from ephemeral local `.json` file storage to **Firebase Firestore** so product catalog changes, homepage "Featured" pin states, customer orders, and reviews are 100% persistent across Vercel serverless deployments, multi-region edge nodes, and local development.

---

## 1. Executive Summary & Why This Solves the Issue

### The Core Problem on Vercel:
* Vercel functions run in isolated, ephemeral serverless containers (AWS Lambda).
* Writing to `.data/products.json` or `/tmp/` is local to only *one* container. Other containers and edge visitors cannot see those changes, and container restarts wipe `/tmp`.
* This caused products pinned in the console to disappear or render as invisible ghost slots on the live homepage.

### The Firebase Firestore Solution:
* **Single Centralized Cloud Source of Truth:** All updates from the Admin Console write directly to Firebase Cloud Firestore in real time.
* **Global Consistency:** Every visitor on `good-fills.vercel.app` or `localhost:3000` queries Firestore directly, receiving identical, up-to-the-second data.
* **Zero Cold-Start Loss:** Container reboots on Vercel never wipe database records.
* **Already Installed:** Firebase SDK (`^12.19.0`) is already present in `package.json`.

---

## 2. Target Database Architecture & Schema

### Collection 1: `products`
* **Document ID:** `prod-01`, `prod-02`, etc.
* **Fields:**
  * `id`: string
  * `slug`: string (e.g. `ragi-porridge-mix`)
  * `name`: string
  * `category`: `'baby-kids' | 'nutrition-wellness' | 'skin-bath' | 'pantry-beverages'`
  * `price`: number (INR)
  * `packSize`: string (e.g. `250g`)
  * `productWeightGrams`: number
  * `shortDescription`: string
  * `description`: string
  * `ingredients`: string[]
  * `benefits`: string[]
  * `storageInstructions`: string
  * `shelfLife`: string
  * `availability`: `'available' | 'sold-out' | 'temporarily-unavailable' | 'coming-soon'`
  * `featured`: boolean (controls Homepage "Signature Creations")
  * `images`: `{ primary: string, packaging: string, detail: string, lifestyle: string }`
  * `fssaiCompliant`: boolean
  * `madeToOrder`: boolean
  * `updatedAt`: timestamp

### Collection 2: `orders`
* **Document ID:** `ORD-XXXXXX`
* **Fields:**
  * `id`: string
  * `createdAt`: timestamp
  * `customerName`, `customerEmail`, `customerPhone`
  * `shippingAddress`: `{ street, city, state, postalCode, country }`
  * `items`: `CartItem[]`
  * `subtotal`, `shippingCost`, `grandTotal`, `totalWeightGrams`
  * `orderStatus`: `'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'`
  * `paymentStatus`: `'Pending' | 'Paid' | 'Failed' | 'Refunded'`
  * `shipmentStatus`: `'Not Shipped' | 'Label Created' | 'In Transit' | 'Out for Delivery' | 'Delivered'`
  * `trackingNumber`: string (AWB)
  * `courierPartner`: string (e.g. `'DTDC'`)

### Collection 3: `reviews`
* **Document ID:** Auto-generated ID
* **Fields:**
  * `productId`: string
  * `customerName`: string
  * `rating`: number (1–5)
  * `title`, `comment`: string
  * `isVerifiedBuyer`: boolean
  * `isFeatured`: boolean (controls Homepage "Patron Voices")
  * `founderReply`: string | null
  * `createdAt`: timestamp

---

## 3. Implementation Phases

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Environment & Firestore Initialization Module       │
│ - Create src/lib/firebase-db.ts                             │
│ - Configure Firestore instance with offline caching fallback│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 2: Product Store Migration & Auto-Seeding             │
│ - Refactor src/lib/server-products.ts to query Firestore    │
│ - Auto-seed from src/data/products.ts if DB collection is 0 │
│ - Update /api/admin/products routes (create, update, delete)│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 3: Orders & Real-Time Tracking Integration            │
│ - Update src/lib/server-orders.ts to write/read Firestore   │
│ - Razorpay webhook updates paymentStatus in Firestore       │
│ - Tracking portal (/track) queries Firestore by Order ID    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 4: Reviews & Moderation Sync                          │
│ - Update src/lib/server-reviews.ts with Firestore collection │
│ - Admin "Pin Testimonial" updates Firestore instantly       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 5: Verification, Zero-Downtime Deployment to Vercel   │
│ - End-to-end test on local & Vercel Preview                 │
│ - Full TypeScript compilation (0 errors)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Security & Resilience Rules

1. **Graceful Fallback Mode:**
   * If Firebase credentials are missing or network times out, the system will fall back to static data so the website *never* crashes or shows a white screen.
2. **Admin PIN Protection:**
   * All write operations (updating stock, pinning products, deleting items) remain strictly guarded by `x-admin-pin` authentication.
3. **Optimistic UI with Realtime Confirmation:**
   * Admin UI toggles stars and stock instantly with immediate Firestore commit confirmation.

---

## 5. Next Steps

* [ ] **Review and complete requested UI changes** (as specified by user).
* [ ] **Initialize Firebase Firestore** configuration in `src/lib/firebase-db.ts`.
* [ ] **Migrate Products CRUD API** to Firestore.
* [ ] **Test Admin Console pin/unpin/delete workflows** live.
