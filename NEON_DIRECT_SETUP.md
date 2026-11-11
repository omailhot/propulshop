# Neon direct setup (RLS + Data API from frontend)

This project now supports direct writes from the frontend to Neon Data API (no `/api/orders` call required).

Order rules implemented:

- One order per user and per edition (`orders.edition`)
- An order is a draft until the user places it (`orders.placed_at`)
- A placed order stays placed and can be modified while its edition is open and its deadline has not passed
- Edition 1 orders that were locked count as placed; they are read-only and listed on the "Mes commandes" page

Editions live in the database:

- `editions`: one row per edition (`credit_per_employee`, `order_deadline`, `is_open`, `has_suppliers`). The highest `number` is the current edition. Admins add, edit and delete editions from the "Éditions" page.
- Creating an edition closes the previous ones. An edition that still has orders cannot be deleted (`orders.edition` references `editions.number`).
- A `null` credit or deadline is shown as "À déterminer".
- RLS reads `editions` to decide whether a user may still write an order: closing an edition or passing its deadline blocks writes in the database, not only in the interface. Admins are never blocked.
- `is_open` replaces the former global read-only mode. The schema script seeds editions 1 and 2 only while the table is empty, and copies the current `global_readonly_mode` setting into edition 2.

The catalog lives in the database:

- `products`: one row per item, managed from the admin "Articles" page. `cost` is the supplier cost before taxes and `supplier_url` the supplier page; the admin form computes the price from the cost (14.975 % of taxes, rounded up to the next dollar).
- `product_images`: images uploaded from that page, stored as data URLs and referenced by the image source `db:<id>`
- Edition 1 items are kept hidden (`is_active = false`) so past orders still show their images

## 1) Configure env vars

Set these in `.env`:

```bash
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth
VITE_NEON_DATA_API_URL=https://ep-xxx.apirest.c-4.us-east-1.aws.neon.tech/neondb/rest/v1
```

## 2) Apply schema + RLS

Run `database/neon-schema.sql` in Neon SQL Editor, then `database/seed-products.sql`.

Then refresh the Data API schema cache: Neon Console > Postgres database > Data API > API tab > "Refresh schema cache". The Data API does not pick up new tables on its own; until the cache is refreshed, requests fail with `PGRST205` ("Could not find the table 'public.products' in the schema cache").

Both scripts can be run again safely: the schema script only adds what is missing, and the seed only refreshes items that were never modified from the admin page (`updated_at = created_at`); it never touches their position or visibility. Deploy the app right after running the schema script: the previous version of the app does not know about editions.

The schema script creates:

- `orders` (with `edition` and `placed_at`; `is_locked`, `locked_at` and `lock_deadline_at` are only used by edition 1)
- `editions`
- `order_items`
- `products` and `product_images`
- RLS policies scoped to `auth.user_id()`: everyone can read the catalog, only admins can change it

## 3) Neon console checks

In Neon Data API page:

- Neon Auth enabled
- RLS enabled for `orders`, `order_items`, `editions`, `products` and `product_images`
- Anonymous access enabled, so the catalog and the edition settings load before sign-in. Without it, signed-out visitors see the last catalog their browser cached, or a prompt to sign in.

## 3.1) Grant admin access

After your user signs in at least once (so it exists in `app_users`), promote it:

```sql
insert into admin_users (user_id)
values ('<your_neon_auth_user_id>')
on conflict (user_id) do nothing;
```

## 4) Authentication requirement

Order submission now uses:

- `client.auth.getSession()` from `@neondatabase/neon-js`
- then inserts into `orders` and `order_items`

If there is no authenticated Neon session, the app returns the existing auth-required toast.

## 5) Run app

```bash
npm run dev
```

Then sign in via Neon Auth and place an order.
