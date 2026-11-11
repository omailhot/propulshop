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

alter table orders add column if not exists is_locked boolean not null default false;
alter table orders add column if not exists locked_at timestamptz;
alter table orders add column if not exists lock_deadline_at timestamptz not null default '2026-03-01T23:59:59Z'::timestamptz;
alter table orders add column if not exists placed_at timestamptz;
alter table orders add column if not exists edition integer not null default 1;
alter table orders alter column lock_deadline_at drop not null;
alter table orders alter column lock_deadline_at drop default;

update orders
set is_locked = nullif(raw_payload->>'confirmedAt', '') is not null
where edition = 1 and raw_payload ? 'confirmedAt';

update orders
set locked_at = coalesce(locked_at, submitted_at)
where edition = 1 and is_locked and locked_at is null;

update orders
set placed_at = coalesce(locked_at, submitted_at)
where edition = 1 and is_locked and placed_at is null;

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

create table if not exists app_users (
  user_id text primary key,
  email text not null unique,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

alter table app_users add column if not exists display_name text not null default '';

create table if not exists admin_users (
  user_id text primary key references app_users(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  is_active boolean not null default true,
  sort_order integer not null default 1000,
  category text not null,
  price numeric(12, 2) not null check (price >= 0),
  supplier text,
  name jsonb not null,
  description jsonb not null default '{}'::jsonb,
  variant_groups jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products add column if not exists supplier_url text;
alter table products add column if not exists cost numeric(12, 2) check (cost is null or cost >= 0);

create table if not exists product_images (
  id uuid primary key,
  data_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  setting_key text primary key,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table app_settings add column if not exists setting_key text;
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'app_settings'
      and column_name = 'key'
  ) then
    execute 'update app_settings set setting_key = key where setting_key is null';

    begin
      alter table app_settings drop constraint if exists app_settings_pkey;
    exception when undefined_object then
      null;
    end;

    begin
      alter table app_settings drop column key;
    exception when undefined_column then
      null;
    end;
  end if;
end $$;
update app_settings
set setting_key = 'global_readonly_mode'
where setting_key is null
  and value_json ? 'enabled';
alter table app_settings alter column setting_key set not null;
alter table app_settings drop constraint if exists app_settings_pkey;
alter table app_settings add constraint app_settings_pkey primary key (setting_key);

create table if not exists editions (
  number integer primary key,
  credit_per_employee numeric(12, 2) check (credit_per_employee is null or credit_per_employee >= 0),
  order_deadline timestamptz,
  has_suppliers boolean not null default true,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

insert into editions (number, credit_per_employee, order_deadline, has_suppliers, is_open)
select
  seed.number,
  seed.credit_per_employee,
  seed.order_deadline,
  seed.has_suppliers,
  seed.is_open
from (
  values
    (1, 250::numeric, '2026-03-01T23:59:59Z'::timestamptz, false, false),
    (
      2,
      null,
      null,
      true,
      not coalesce(
        (
          select (value_json->>'enabled')::boolean
          from app_settings
          where setting_key = 'global_readonly_mode'
        ),
        false
      )
    )
) as seed(number, credit_per_employee, order_deadline, has_suppliers, is_open)
where not exists (select 1 from editions);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_edition_fkey'
  ) then
    alter table orders
      add constraint orders_edition_fkey
      foreign key (edition) references editions(number);
  end if;
end $$;

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_user_id on orders(user_id);
drop index if exists idx_orders_user_id_unique;
create unique index if not exists idx_orders_user_edition_unique on orders(user_id, edition);
create index if not exists idx_order_items_order_id on order_items(order_id);
create unique index if not exists idx_order_items_order_line on order_items(order_id, cart_line_id);
create index if not exists idx_app_users_last_seen on app_users(last_seen_at desc);

-- Neon Auth + RLS setup for direct frontend Data API access
-- Make sure Neon Auth is enabled in the Neon console before relying on auth.user_id().
grant usage on schema public to authenticated;
grant usage on schema public to anonymous;
grant select, insert, update, delete on orders to authenticated;
grant select, insert, update, delete on orders to anonymous;
grant select, insert, update, delete on order_items to authenticated;
grant select, insert, update, delete on order_items to anonymous;
grant select, insert, update on app_users to authenticated;
grant select, insert, update on app_users to anonymous;
grant select on admin_users to authenticated;
grant select on admin_users to anonymous;
grant select on app_settings to authenticated;
grant select on app_settings to anonymous;
grant insert, update on app_settings to authenticated;
grant select on editions to authenticated;
grant select on editions to anonymous;
grant insert, update, delete on editions to authenticated;
grant select on products to authenticated;
grant select on products to anonymous;
grant insert, update, delete on products to authenticated;
grant select on product_images to authenticated;
grant select on product_images to anonymous;
grant insert, update, delete on product_images to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anonymous;

alter table orders enable row level security;
alter table order_items enable row level security;
alter table app_users enable row level security;
alter table admin_users enable row level security;
alter table app_settings enable row level security;
alter table editions enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;

drop policy if exists orders_select_own on orders;
create policy orders_select_own
  on orders
  for select
  to authenticated
  using (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists orders_insert_own on orders;
create policy orders_insert_own
  on orders
  for insert
  to authenticated
  with check (
    (
      user_id = auth.user_id()
      and exists (
        select 1
        from editions e
        where e.number = orders.edition
          and e.is_open
          and (e.order_deadline is null or now() < e.order_deadline)
      )
    )
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists orders_update_own on orders;
create policy orders_update_own
  on orders
  for update
  to authenticated
  using (
    (
      user_id = auth.user_id()
      and exists (
        select 1
        from editions e
        where e.number = orders.edition
          and e.is_open
          and (e.order_deadline is null or now() < e.order_deadline)
      )
    )
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  )
  with check (
    (
      user_id = auth.user_id()
      and exists (
        select 1
        from editions e
        where e.number = orders.edition
          and e.is_open
          and (e.order_deadline is null or now() < e.order_deadline)
      )
    )
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists orders_delete_own on orders;
create policy orders_delete_own
  on orders
  for delete
  to authenticated
  using (
    (
      user_id = auth.user_id()
      and exists (
        select 1
        from editions e
        where e.number = orders.edition
          and e.is_open
          and (e.order_deadline is null or now() < e.order_deadline)
      )
    )
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists order_items_select_own on order_items;
create policy order_items_select_own
  on order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          o.user_id = auth.user_id()
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists order_items_insert_own on order_items;
create policy order_items_insert_own
  on order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and exists (
              select 1
              from editions e
              where e.number = o.edition
                and e.is_open
                and (e.order_deadline is null or now() < e.order_deadline)
            )
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists order_items_update_own on order_items;
create policy order_items_update_own
  on order_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and exists (
              select 1
              from editions e
              where e.number = o.edition
                and e.is_open
                and (e.order_deadline is null or now() < e.order_deadline)
            )
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  )
  with check (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and exists (
              select 1
              from editions e
              where e.number = o.edition
                and e.is_open
                and (e.order_deadline is null or now() < e.order_deadline)
            )
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists order_items_delete_own on order_items;
create policy order_items_delete_own
  on order_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from orders o
      where o.id = order_items.order_id
        and (
          (
            o.user_id = auth.user_id()
            and exists (
              select 1
              from editions e
              where e.number = o.edition
                and e.is_open
                and (e.order_deadline is null or now() < e.order_deadline)
            )
          )
          or exists (select 1 from admin_users a where a.user_id = auth.user_id())
        )
    )
  );

drop policy if exists app_users_select on app_users;
create policy app_users_select
  on app_users
  for select
  to authenticated
  using (
    user_id = auth.user_id()
    or exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists app_users_insert on app_users;
create policy app_users_insert
  on app_users
  for insert
  to authenticated
  with check (user_id = auth.user_id());

drop policy if exists app_users_update on app_users;
create policy app_users_update
  on app_users
  for update
  to authenticated
  using (user_id = auth.user_id())
  with check (user_id = auth.user_id());

drop policy if exists admin_users_select on admin_users;
create policy admin_users_select
  on admin_users
  for select
  to authenticated
  using (user_id = auth.user_id());

drop policy if exists app_settings_select_all on app_settings;
create policy app_settings_select_all
  on app_settings
  for select
  to authenticated, anonymous
  using (true);

drop policy if exists app_settings_insert_admin on app_settings;
create policy app_settings_insert_admin
  on app_settings
  for insert
  to authenticated
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists app_settings_update_admin on app_settings;
create policy app_settings_update_admin
  on app_settings
  for update
  to authenticated
  using (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  )
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists products_select_all on products;
create policy products_select_all
  on products
  for select
  to authenticated, anonymous
  using (true);

drop policy if exists products_insert_admin on products;
create policy products_insert_admin
  on products
  for insert
  to authenticated
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists products_update_admin on products;
create policy products_update_admin
  on products
  for update
  to authenticated
  using (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  )
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists products_delete_admin on products;
create policy products_delete_admin
  on products
  for delete
  to authenticated
  using (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists product_images_select_all on product_images;
create policy product_images_select_all
  on product_images
  for select
  to authenticated, anonymous
  using (true);

drop policy if exists product_images_insert_admin on product_images;
create policy product_images_insert_admin
  on product_images
  for insert
  to authenticated
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists product_images_delete_admin on product_images;
create policy product_images_delete_admin
  on product_images
  for delete
  to authenticated
  using (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists editions_select_all on editions;
create policy editions_select_all
  on editions
  for select
  to authenticated, anonymous
  using (true);

drop policy if exists editions_insert_admin on editions;
create policy editions_insert_admin
  on editions
  for insert
  to authenticated
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists editions_update_admin on editions;
create policy editions_update_admin
  on editions
  for update
  to authenticated
  using (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  )
  with check (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );

drop policy if exists editions_delete_admin on editions;
create policy editions_delete_admin
  on editions
  for delete
  to authenticated
  using (
    exists (select 1 from admin_users a where a.user_id = auth.user_id())
  );
