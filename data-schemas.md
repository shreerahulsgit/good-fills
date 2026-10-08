# Good Fills Data Schemas

This project does not have one centralized database schema. The schemas are distributed across `src/types/index.ts` and the server-side libraries.

## Core Entities

### Product

- `id: string`
- `slug: string`
- `name: string`
- `category: ProductCategory`
- `price: number` (INR)
- `packSize: string`
- `productWeightGrams: number`
- `shortDescription: string`
- `description: string`
- `ingredients: string[]`
- `ingredientsVerified: boolean`
- `ingredientsNote?: string`
- `benefits?: string[]`
- `usageInstructions?: string`
- `preparationInstructions?: string`
- `storageInstructions?: string`
- `shelfLife: string`
- `availability: ProductAvailability`
- `featured: boolean`
- `images: ProductImages`
- `fssaiCompliant: boolean`
- `madeToOrder: boolean`

`ProductCategory` values:

- `baby-kids`
- `nutrition-wellness`
- `skin-bath`
- `pantry-beverages`

`ProductAvailability` values:

- `available`
- `temporarily-unavailable`
- `sold-out`
- `coming-soon`

`ProductImages` contains:

- `primary: string`
- `packaging?: string`
- `detail?: string`
- `lifestyle?: string`

### CartItem

```ts
{
  product: Product;
  quantity: number;
}
```

The browser cart stores a full product snapshot rather than only a product ID.

### Order

- `id: string`
- `createdAt: string`
- `customerId: string`
- `customerName: string`
- `customerEmail: string`
- `customerPhone: string`
- `shippingAddress: ShippingAddress`
- `items: CartItem[]`
- `subtotal: number`
- `shippingCost: number`
- `total: number`
- `paymentMethod: "UPI" | "Razorpay"`
- `paymentStatus: PaymentStatus`
- `orderStatus: OrderStatus`
- `shipmentStatus: ShipmentStatus`
- `upiUtr?: string`
- `razorpayOrderId?: string`
- `razorpayPaymentId?: string`
- `razorpaySignature?: string`
- `weightGrams?: number`
- `courier: string`
- `trackingNumber?: string`
- `estimatedDelivery: string`
- `dispatchDate?: string`
- `deliveredDate?: string`
- `internalNotes?: string[]`

`PaymentStatus` values:

- `Pending`
- `Paid`
- `Failed`
- `Refunded`

`OrderStatus` values:

- `Pending`
- `Confirmed`
- `Processing`
- `Ready to Ship`
- `Shipped`
- `Delivered`
- `Cancelled`
- `Returned`
- `RTO`

`ShipmentStatus` values:

- `Not Shipped`
- `Handed Over`
- `In Transit`
- `Out for Delivery`
- `Delivered`
- `Delivery Failed`
- `RTO`

### ShippingAddress

```ts
{
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}
```

### CustomerUser

```ts
{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer";
  addresses: ShippingAddress[];
  createdAt: string;
}
```

### StaffUser

```ts
{
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager";
  active: boolean;
}
```

The type exists, but current admin API access primarily uses an admin PIN.

## Order Support Schemas

### PaymentRecord

Defined in `src/lib/server-orders.ts`:

```ts
{
  id: string;
  orderId: string;
  provider: "razorpay";
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: "INR";
  status: PaymentStatus;
  method: "UPI";
  signatureVerified: boolean;
  capturedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

Payment records currently live mainly in an in-memory cache instead of a durable payment table.

### AuthoritativeCartCalculation

```ts
{
  subtotal: number;
  totalWeightGrams: number;
  shippingCost: number;
  grandTotal: number;
  validatedItems: CartItem[];
}
```

This is an internal calculation result and does not need to become a database table.

### ShippingCalculation

```ts
{
  totalWeightGrams: number;
  totalWeightKg: number;
  shippingCost: number;
  slabDescription: string;
  courierName: string;
  estimatedDelivery: string;
}
```

## Reviews and Inquiries

### Review

Defined in `src/lib/server-reviews.ts`:

- `id: string`
- `orderId?: string`
- `productId: string`
- `productName: string`
- `rating: number`
- `title: string`
- `comment: string`
- `authorName: string`
- `location: string`
- `childAge?: string`
- `isVerifiedBuyer: boolean`
- `helpfulCount: number`
- `createdAt: string`
- `isFeatured?: boolean`
- `status?: "published" | "hidden"`
- `testimonialImage?: string`
- `founderReply?: { message: string; repliedAt: string }`

### ProductReviewSummary

```ts
{
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
```

### Inquiry

Defined in `src/lib/inquiries.ts`:

```ts
{
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  orderId?: string;
  message: string;
  status: "new" | "replied" | "archived";
}
```

## Tracking Schemas

Defined in `src/lib/tracking.ts`.

### CourierPartnerInfo

- `name: string`
- `brand: string`
- `serviceType: string`
- `awbNumber: string`
- `isAssigned: boolean`
- `trackingUrl: string`
- `helpline: string`

### ConsignmentPackageSpecs

- `totalWeightGrams: number`
- `formattedWeight: string`
- `packagingType: string`
- `sealIntegrity: string`
- `storageRequirement: string`
- `batchCode: string`

### TrackingTelemetryResult

Contains:

- Order ID and creation timestamp
- Customer name and masked phone number
- Shipping address
- Order and shipment statuses
- Progress percentage
- Current status headline and description
- Status badge type
- Estimated delivery fields
- Courier information
- Package specifications
- Simplified product items
- Subtotal, shipping cost, and total

### DTDC schemas

`DtdcCheckpoint` contains:

- `Time`
- `Date`
- `Location`
- `Activity`
- `CourierName`
- `CheckpointState`

`DtdcTrackingResponse` contains optional:

- `Checkpoints: DtdcCheckpoint[]`
- `MostRecentStatus`
- `ShipmentState`
- `AdditionalInfo`

## Persisted Data

Runtime persistence is now handled by Supabase tables defined in `supabase-goodfills-schema.sql`:

- `products`: catalog data
- `customers`: customer profiles and saved addresses
- `orders`: order snapshots and status
- `payments`: Razorpay payment records
- `reviews`: customer reviews and moderation state
- `inquiries`: customer support requests
- `events`: webhook event audit records

The former `.data/*.json` and `/tmp` fallback stores are no longer used by the application. `src/data/products.ts` remains repository seed input for the explicit product seed command.

## Recommended Relational Model

For a Supabase or PostgreSQL migration, the current embedded structures can remain nested in `jsonb` columns. A simple design would use:

- `products`
- `customers`
- `addresses`
- `orders`
- `payments`
- `reviews`
- `inquiries`
- `webhook_events`

The `orders.items` field can remain a nested `jsonb` array containing the product snapshot and quantity. This preserves historical values such as product name, product ID, quantity, unit price, and weight without requiring a separate `order_items` table.

Separate `order_items` and `addresses` tables are optional future optimizations for reporting, indexing, or more complex relational queries.

