# Good Fills Supabase Schema

This document describes a Supabase design for the current Good Fills application.

## Table Count

### Required application tables: 7

1. `products`
2. `customers`
3. `orders`
4. `payments`
5. `reviews`
6. `inquiries`
7. `events`

### Supabase-managed authentication

Supabase Auth provides the built-in `auth.users` table. It is not recreated as an application table.

### Total database tables

- 7 application tables
- 1 Supabase-managed authentication table: `auth.users`

No separate tracking-milestone or order-status-history table is required. Direct DTDC tracking data is stored on `orders` and/or returned from the DTDC integration.

## Design Decisions

- Order items remain nested in `orders.items` as `jsonb`.
- Shipping addresses remain nested in `orders.shipping_address` as `jsonb`.
- Product details are copied into each order item so historical orders do not change when the catalog changes.
- Current payment and shipment statuses remain columns on `orders`.
- Direct DTDC checkpoints can be stored as optional `jsonb` data when persistence is needed.
- Supabase Auth handles customer authentication. The application `customers` table stores the business profile.
- Product images remain URL/path strings; image files should be stored in Supabase Storage or the existing public asset system.

## 1. `products`

Stores the current product catalog.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `id` | `text` | yes | Existing product ID, primary key |
| `slug` | `text` | yes | Unique public URL slug |
| `name` | `text` | yes | Current product name |
| `category` | `text` | yes | Product category |
| `price` | `numeric(12,2)` | yes | Current INR price |
| `pack_size` | `text` | yes | For example, `250g` |
| `product_weight_grams` | `integer` | yes | Used for shipping calculation |
| `short_description` | `text` | yes | Short display copy |
| `description` | `text` | yes | Full product description |
| `ingredients` | `jsonb` | yes | JSON string array |
| `ingredients_verified` | `boolean` | yes | Defaults to `false` |
| `ingredients_note` | `text` | no | Verification note |
| `benefits` | `jsonb` | no | JSON string array |
| `usage_instructions` | `text` | no | Product usage instructions |
| `preparation_instructions` | `text` | no | Preparation instructions |
| `storage_instructions` | `text` | no | Storage instructions |
| `shelf_life` | `text` | yes | For example, `6 months` |
| `availability` | `text` | yes | Available, sold-out, etc. |
| `featured` | `boolean` | yes | Defaults to `false` |
| `images` | `jsonb` | yes | Primary, packaging, detail, lifestyle paths |
| `fssai_compliant` | `boolean` | yes | Defaults to `true` |
| `made_to_order` | `boolean` | yes | Defaults to `true` |
| `created_at` | `timestamptz` | yes | Defaults to `now()` |
| `updated_at` | `timestamptz` | yes | Updated on changes |

Recommended constraints:

- Primary key: `id`
- Unique: `slug`
- Check: `price >= 0`
- Check: `product_weight_grams > 0`
- Check: `availability` is one of `available`, `temporarily-unavailable`, `sold-out`, `coming-soon`

Recommended indexes:

- Unique index on `slug`
- Index on `category`
- Index on `availability`
- Index on `featured`

## 2. `customers`

Stores the customer business profile. Authentication credentials are handled by Supabase Auth.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `id` | `uuid` | yes | Primary key; normally references `auth.users.id` |
| `name` | `text` | yes | Customer name |
| `email` | `text` | yes | Customer email |
| `phone` | `text` | no | Customer phone |
| `role` | `text` | yes | Defaults to `customer` |
| `addresses` | `jsonb` | no | Existing nested address array |
| `created_at` | `timestamptz` | yes | Defaults to `now()` |
| `updated_at` | `timestamptz` | yes | Updated on changes |

Recommended constraints and indexes:

- Primary key: `id`
- Foreign key: `id -> auth.users.id`
- Unique or partial unique index on normalized `email`
- Index on normalized `phone`
- Check: `role = 'customer'`

A customer may also be created from an order when guest checkout is supported. In that case, `id` can be generated independently and `auth_user_id` can be nullable instead of using `id` as the Auth foreign key.

## 3. `orders`

Stores the purchase, customer details, historical item snapshots, payment state, and current fulfillment state.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `id` | `text` | yes | Existing order ID such as `ORD-1024`, primary key |
| `customer_id` | `uuid` | no | References `customers.id`; nullable for guests |
| `created_at` | `timestamptz` | yes | Order creation time |
| `customer_name` | `text` | yes | Snapshot at checkout |
| `customer_email` | `text` | yes | Snapshot at checkout |
| `customer_phone` | `text` | yes | Snapshot at checkout |
| `shipping_address` | `jsonb` | yes | Full `ShippingAddress` object |
| `items` | `jsonb` | yes | Array of historical order item snapshots |
| `subtotal` | `numeric(12,2)` | yes | Server-calculated INR amount |
| `shipping_cost` | `numeric(12,2)` | yes | Server-calculated INR amount |
| `total` | `numeric(12,2)` | yes | Server-calculated INR amount |
| `payment_method` | `text` | yes | `UPI` or `Razorpay` |
| `payment_status` | `text` | yes | Pending, Paid, Failed, Refunded |
| `order_status` | `text` | yes | Current order status |
| `shipment_status` | `text` | yes | Current shipment status |
| `txn_utr` | `text` | no | Payment transaction reference |
| `razorpay_order_id` | `text` | no | Razorpay order ID |
| `razorpay_payment_id` | `text` | no | Razorpay payment ID |
| `weight_grams` | `integer` | no | Authoritative total product weight |
| `courier` | `text` | yes | Current value is `DTDC` |
| `tracking_number` | `text` | no | DTDC AWB/consignment number |
| `dispatch_date` | `timestamptz` | no | Dispatch time |
| `delivered_date` | `timestamptz` | no | Delivery time |
| `updated_at` | `timestamptz` | yes | Updated on changes |

### `orders.items` JSON shape

Each item preserves the product snapshot used at checkout:

```json
[
  {
    "product": {
      "id": "prod-01",
      "slug": "baby-cereal-mix",
      "name": "Baby Cereal Mix",
      "price": 450,
      "productWeightGrams": 250,
      "packSize": "250g",
      "images": {
        "primary": "/images/products/baby-cereal-mix.png"
      }
    },
    "quantity": 2
  }
]
```

The server must still recalculate prices, weights, shipping, and totals from the current trusted catalog before creating the order. The nested snapshot is for order history and display, not for trusting client input.

Razorpay signature verification happens on the server using `RAZORPAY_KEY_SECRET`. The signature does not need to be stored in the order. Store the Razorpay order ID, payment ID, payment status, and verification result in `payments` instead.

### `orders.shipping_address` JSON shape

```json
{
  "fullName": "Customer Name",
  "phone": "9876543210",
  "email": "customer@example.com",
  "addressLine1": "Address line 1",
  "addressLine2": "Optional address line 2",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "country": "India"
}
```

Recommended constraints and indexes:

- Primary key: `id`
- Foreign key: `customer_id -> customers.id`
- Unique partial index on `razorpay_order_id`
- Index on `customer_id`
- Index on `customer_email`
- Index on `customer_phone`
- Index on `payment_status`
- Index on `order_status`
- Index on `shipment_status`
- Index on `tracking_number`
- Check: all monetary values are non-negative
- Order status includes `Failed` for payment failures; shipment status uses `Failed` for payment or delivery failures.

## 4. `payments`

Stores durable payment records. This replaces the current in-memory `PaymentRecord` cache.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `id` | `text` | yes | Internal payment ID, primary key |
| `order_id` | `text` | yes | References `orders.id` |
| `provider` | `text` | yes | Current value is `razorpay` |
| `provider_order_id` | `text` | yes | Razorpay order ID |
| `provider_payment_id` | `text` | no | Razorpay payment ID |
| `amount` | `numeric(12,2)` | yes | INR amount |
| `currency` | `text` | yes | Defaults to `INR` |
| `status` | `text` | yes | Pending, Paid, Failed, Refunded |
| `method` | `text` | yes | Current value is `UPI` |
| `signature_verified` | `boolean` | yes | Defaults to `false` |
| `captured_at` | `timestamptz` | no | Capture time |
| `created_at` | `timestamptz` | yes | Defaults to `now()` |
| `updated_at` | `timestamptz` | yes | Updated on changes |

Recommended constraints and indexes:

- Primary key: `id`
- Foreign key: `order_id -> orders.id`
- Unique index on `provider_payment_id` when present
- Index on `provider_order_id`
- Index on `order_id`
- Check: `currency = 'INR'`

## 5. `reviews`

Stores customer product reviews and moderation information.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `id` | `text` | yes | Primary key |
| `order_id` | `text` | no | References `orders.id` |
| `product_id` | `text` | yes | References `products.id` where possible |
| `product_name` | `text` | yes | Historical display name |
| `rating` | `smallint` | yes | Integer from 1 to 5 |
| `title` | `text` | yes | Review headline |
| `comment` | `text` | yes | Review body |
| `author_name` | `text` | yes | Display name |
| `location` | `text` | yes | Display location |
| `child_age` | `text` | no | Optional age/context |
| `is_verified_buyer` | `boolean` | yes | Defaults to `false` |
| `helpful_count` | `integer` | yes | Defaults to `0` |
| `created_at` | `timestamptz` | yes | Review creation time |
| `is_featured` | `boolean` | yes | Defaults to `false` |
| `status` | `text` | yes | `published` or `hidden` |
| `testimonial_image` | `text` | no | Storage/public asset path |
| `founder_reply` | `jsonb` | no | Message and reply timestamp |

Recommended constraints and indexes:

- Primary key: `id`
- Foreign keys: `order_id -> orders.id`, `product_id -> products.id`
- Check: `rating between 1 and 5`
- Unique constraint on `(order_id, product_id)` when `order_id` is present
- Index on `product_id`
- Index on `status`
- Index on `is_featured`

## 6. `inquiries`

Stores contact and customer support inquiries.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `id` | `text` | yes | Primary key, such as `INQ-1001` |
| `created_at` | `timestamptz` | yes | Defaults to `now()` |
| `name` | `text` | yes | Customer name |
| `phone` | `text` | yes | Customer phone |
| `email` | `text` | no | Customer email |
| `category` | `text` | yes | Inquiry category |
| `order_id` | `text` | no | Related order ID |
| `message` | `text` | yes | Inquiry message |
| `status` | `text` | yes | `new`, `replied`, or `archived` |
| `updated_at` | `timestamptz` | yes | Updated on status changes |

Recommended constraints and indexes:

- Primary key: `id`
- Optional foreign key: `order_id -> orders.id`
- Index on `status`
- Index on `created_at desc`
- Index on `order_id`

## 7. `events`

Provides durable idempotency for Razorpay webhooks.

| Column | PostgreSQL type | Required | Notes |
|---|---|---:|---|
| `event_id` | `text` | yes | Razorpay event ID, primary key |
| `event_type` | `text` | no | For example, `payment.captured` |
| `payload` | `jsonb` | no | Optional raw webhook payload |
| `received_at` | `timestamptz` | yes | Defaults to `now()` |
| `processed_at` | `timestamptz` | no | Processing completion time |
| `processing_status` | `text` | yes | `received`, `processed`, or `failed` |
| `error_message` | `text` | no | Failure details |

Recommended constraints and indexes:

- Primary key: `event_id`
- Unique event IDs prevent duplicate webhook processing
- Index on `event_type`
- Index on `received_at desc`

## Relationships

```text
Supabase auth.users
        |
        | optional one-to-one
        v
    customers
        |
        | one-to-many
        v
      orders
       |  \
       |   \
       |    +--> payments
       +-------> reviews (optional order reference)
       +-------> inquiries (optional order reference)

products <---- reviews.product_id
products are copied into orders.items as historical JSON snapshots
```

## Supabase Auth

Use Supabase Auth for:

- Email/password authentication
- Google OAuth
- Password reset
- Session management
- Access tokens

Do not store passwords in `customers`.

Recommended customer mapping:

- `auth.users.id` identifies the authenticated account.
- `customers.id` references the Auth user, or `customers.auth_user_id` can be used if guest customers must exist without Auth accounts.
- Customer-facing queries should be restricted to the authenticated customer's own rows.

## Row Level Security

Enable RLS on all seven application tables.

### Customers

- Customers can read and update only their own profile.
- Staff can read customer records through a protected server-side path.

### Orders

- Customers can read only their own orders.
- Customers should not directly update totals, payment status, order status, or shipment status.
- Server-side service-role code creates and updates orders.
- Staff can read and update operational fields through protected server-side routes.

### Products

- Public users can read products marked for public display.
- Only authorized staff can create, update, or delete products.

### Payments

- Customers can read only payments belonging to their own orders.
- Only server-side payment/webhook code can insert or update payment records.

### Reviews

- Public users can read published reviews.
- Customers can submit reviews only through a server-side route that verifies a delivered order and purchased product.
- Only authorized staff can moderate or feature reviews.

### Inquiries

- Public users can submit inquiries.
- Only authorized staff can read or update inquiries.

### Webhook events

- No public access.
- Only server-side webhook processing can insert or read these rows.

## Optional Future Tables

These are not required for the current application shape:

- `order_items`: only if item-level reporting or SQL analytics becomes important
- `addresses`: only if addresses must be independently searched, reused, or managed
- `staff_profiles`: if staff users need database-managed roles instead of the current PIN approach
- `product_categories`: only if categories need their own editable metadata
- `refunds`: if refunds require a separate audit trail

## Migration Mapping

The application now uses Supabase as the runtime source of truth. The former file-backed stores are retained here only as historical migration references:

| Former storage | Supabase destination |
|---|---|
| `.data/products.json` | `products` |
| `.data/server-orders.json` | `orders` |
| `.data/customers.json` | `customers` |
| `.data/reviews.json` | `reviews` |
| `.data/inquiries.json` | `inquiries` |
| `.data/webhook-events.json` | `events` |
| In-memory `PaymentRecord` cache | `payments` |
