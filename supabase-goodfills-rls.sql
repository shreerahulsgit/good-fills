-- Good Fills initial Row Level Security policies
-- Run after supabase-goodfills-schema.sql.
-- The current application still uses Firebase Auth and PIN-based admin access.
-- Trusted server routes should use SUPABASE_SECRET_KEY for protected writes.

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.inquiries enable row level security;
alter table public.events enable row level security;

-- Public catalog reads are allowed. Product writes remain server-only.
drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
to anon, authenticated
using (true);

-- Only published reviews are public. Review creation and moderation remain server-only.
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read
on public.reviews
for select
to anon, authenticated
using (status = 'published');

-- Contact forms may submit inquiries. Reading and updating inquiries remain server-only.
drop policy if exists inquiries_public_insert on public.inquiries;
create policy inquiries_public_insert
on public.inquiries
for insert
to anon, authenticated
with check (true);

-- Customers, orders, payments, and events intentionally have no public policies.
-- With RLS enabled, anon/authenticated clients cannot read or write them.
-- Use the server-only SUPABASE_SECRET_KEY client from trusted API routes/webhooks.

-- Authenticated customers can access only their own profile and purchases.
-- These policies are safe to enable now; they take effect when Supabase Auth
-- users are linked through customers.auth_user_id.
drop policy if exists customers_own_read on public.customers;
create policy customers_own_read
on public.customers
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists customers_own_update on public.customers;
create policy customers_own_update
on public.customers
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists orders_own_read on public.orders;
create policy orders_own_read
on public.orders
for select
to authenticated
using (
	exists (
		select 1
		from public.customers
		where customers.id = orders.customer_id
			and customers.auth_user_id = auth.uid()
	)
);

drop policy if exists payments_own_read on public.payments;
create policy payments_own_read
on public.payments
for select
to authenticated
using (
	exists (
		select 1
		from public.orders
		join public.customers on customers.id = orders.customer_id
		where orders.id = payments.order_id
			and customers.auth_user_id = auth.uid()
	)
);
