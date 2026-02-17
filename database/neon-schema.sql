create table if not exists orders (
  id uuid primary key,
  request_id text not null unique,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  user_id text not null,
  user_email text,
  locale text not null,
  item_count integer not null check (item_count > 0),
  items_summary text not null,
  subtotal numeric(12, 2) not null,
  credit_used numeric(12, 2) not null,
  credit_remaining numeric(12, 2) not null,
  wallet_to_pay numeric(12, 2) not null,
  raw_payload jsonb not null
);

create table if not exists order_items (
  id uuid primary key,
  order_id uuid not null references orders(id) on delete cascade,
  cart_line_id text not null,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  selected_options jsonb not null default '{}'::jsonb
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_order_items_order_id on order_items(order_id);
