# Cloudflare + Neon setup (recommended for this repo)

This project already has a server-side endpoint at `functions/api/orders.ts`.
Use it to write orders to Neon safely (no direct browser write access to Neon Data API).

## 1) Apply schema in Neon

Run `database/neon-schema.sql` in Neon SQL Editor, or:

```bash
psql "$NEON_DATABASE_URL" -f database/neon-schema.sql
```

## 2) Local Cloudflare Pages dev

Create `.dev.vars` from `.dev.vars.example` and set:

- `NEON_DATABASE_URL`
- `BETTER_AUTH_URL` (optional, only if auth is on another domain)

Then run:

```bash
npm run cf:dev
```

Your frontend calls `POST /api/orders` and the function writes to:

- `orders`
- `order_items`

## 3) Deploy to Cloudflare Pages

Use `wrangler.toml` + this deploy command:

```bash
npm run cf:deploy
```

When prompted, select your Pages project.

## 4) Set production secrets in Cloudflare

In Pages project settings, add:

- `NEON_DATABASE_URL` (secret)
- `BETTER_AUTH_URL` (optional)

or via CLI:

```bash
npx wrangler pages secret put NEON_DATABASE_URL
npx wrangler pages secret put BETTER_AUTH_URL
```

## 5) Why not direct Neon Data API from frontend?

You currently have RLS warnings for `orders` and `order_items`. Direct browser writes are riskier unless RLS + auth policies are fully locked down.

Using the Cloudflare function keeps DB credentials server-side and gives controlled validation/idempotency.
