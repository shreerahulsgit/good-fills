-- Good Fills initial Supabase schema
-- Database/project: goodfills
-- Run this in the Supabase SQL Editor or through the Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null check (category in (
    'baby-kids',
    'nutrition-wellness',
    'skin-bath',
    'pantry-beverages'
  )),
  price numeric(12, 2) not null check (price >= 0),
  pack_size text not null,
  product_weight_grams integer not null check (product_weight_grams > 0),
  short_description text not null,
  description text not null,
  ingredients jsonb not null default '[]'::jsonb,
  ingredients_verified boolean not null default false,
  ingredients_note text,
  benefits jsonb,
  usage_instructions text,
  preparation_instructions text,
  storage_instructions text,
  shelf_life text not null,
  availability text not null check (availability in (
    'available',
    'temporarily-unavailable',
    'sold-out',
    'coming-soon'
  )),
  featured boolean not null default false,
  images jsonb not null default '{}'::jsonb,
  fssai_compliant boolean not null default true,
  made_to_order boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  role text not null default 'customer' check (role = 'customer'),
  addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_cost numeric(12, 2) not null check (shipping_cost >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('UPI', 'Net Banking')),
  payment_status text not null check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  order_status text not null check (order_status in (
    'Pending',
    'Confirmed',
    'Ready to Ship',
    'Shipped',
    'Completed',
    'Failed',
    'Cancelled'
  )),
  shipment_status text not null check (shipment_status in (
    'Not Shipped',
    'Handed Over',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Failed'
  )),
  txn_utr text,
  razorpay_order_id text,
  razorpay_payment_id text,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  courier text not null default 'DTDC',
  tracking_number text,
  dispatch_date timestamptz,
  delivered_date timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  provider text not null default 'razorpay' check (provider = 'razorpay'),
  provider_order_id text not null,
  provider_payment_id text,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null check (status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  method text not null default 'UPI' check (method in ('UPI', 'Net Banking')),
  signature_verified boolean not null default false,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  order_id text references public.orders(id) on delete set null,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null,
  rating smallint not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  author_name text not null,
  location text not null,
  child_age text,
  is_verified_buyer boolean not null default false,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now(),
  is_featured boolean not null default false,
  status text not null default 'published' check (status in ('published', 'hidden')),
  testimonial_image text,
  founder_reply jsonb
);

create table if not exists public.inquiries (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  category text not null,
  order_id text references public.orders(id) on delete set null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'replied', 'archived')),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  event_id text primary key,
  event_type text,
  payload jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received' check (
    processing_status in ('received', 'processed', 'failed')
  ),
  error_message text
);

create unique index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id)
  where razorpay_order_id is not null;

create index if not exists products_category_idx on public.products (category);
create index if not exists products_availability_idx on public.products (availability);
create index if not exists products_featured_idx on public.products (featured);

create index if not exists customers_email_idx on public.customers (lower(email));
create index if not exists customers_phone_idx on public.customers (phone);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_customer_email_idx on public.orders (lower(customer_email));
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_order_status_idx on public.orders (order_status);
create index if not exists orders_shipment_status_idx on public.orders (shipment_status);
create index if not exists orders_tracking_number_idx on public.orders (tracking_number);

create unique index if not exists payments_provider_payment_id_idx
  on public.payments (provider_payment_id)
  where provider_payment_id is not null;

create index if not exists payments_provider_order_id_idx on public.payments (provider_order_id);
create index if not exists payments_order_id_idx on public.payments (order_id);

create unique index if not exists reviews_order_product_idx
  on public.reviews (order_id, product_id)
  where order_id is not null;

create index if not exists reviews_product_id_idx on public.reviews (product_id);
create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists reviews_featured_idx on public.reviews (is_featured);

create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_order_id_idx on public.inquiries (order_id);

create index if not exists events_event_type_idx on public.events (event_type);
create index if not exists events_received_at_idx on public.events (received_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();