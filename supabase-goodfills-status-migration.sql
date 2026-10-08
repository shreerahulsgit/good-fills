-- Apply once to an existing Supabase project after deploying the status workflow.
alter table public.orders
  drop constraint if exists orders_order_status_check;

alter table public.orders
  add constraint orders_order_status_check check (order_status in (
    'Pending',
    'Confirmed',
    'Ready to Ship',
    'Shipped',
    'Completed',
    'Failed',
    'Cancelled'
  ));