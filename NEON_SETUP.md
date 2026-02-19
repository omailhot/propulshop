# Getting Started with Neon

This guide will help you connect your application to Neon Serverless Postgres.

## Your Neon Details

- **Organization**: `org-polished-surf-53680285`
- **Project**: `dawn-field-01773809`
- **Console URL**: https://console.neon.tech/app/projects/dawn-field-01773809

## Quick Start

### 1. Get Your Connection String

1. Visit the [Neon Console](https://console.neon.tech/app/projects/dawn-field-01773809)
2. Navigate to your project dashboard
3. Click on **"Connection Details"** or **"Connect"**
4. Copy the connection string (it should look like this):
   ```
   postgres://[user]:[password]@ep-xxx-xxx.region.aws.neon.tech/[dbname]?sslmode=require
   ```

### 2. Configure Environment Variables

1. Open the `.env` file in the root of your project
2. Replace the `NEON_DATABASE_URL` value with your actual connection string:
   ```bash
   NEON_DATABASE_URL=postgres://your-user:your-password@your-endpoint.region.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Deploy Your Database Schema

Run the following command to create your tables:

```bash
# Using psql (if installed)
psql $NEON_DATABASE_URL -f database/neon-schema.sql

# Or using the Neon SQL Editor
# Copy the contents of database/neon-schema.sql and paste it into the SQL Editor in the Neon Console
```

Alternatively, you can use the Neon Console SQL Editor:

1. Go to https://console.neon.tech/app/projects/dawn-field-01773809
2. Click on **"SQL Editor"** in the sidebar
3. Copy and paste the contents of `database/neon-schema.sql`
4. Click **"Run"** to execute the schema

### 4. Verify Your Setup

Your application is already configured to use the Neon serverless driver:

- ✅ `@neondatabase/serverless` is installed in `package.json`
- ✅ `functions/api/orders.ts` uses the Neon database
- ✅ Schema is defined in `database/neon-schema.sql`

The orders API endpoint will automatically connect to your Neon database once `NEON_DATABASE_URL` is set.

## Database Schema

Your database includes:

### `orders` table

- Order tracking with user information
- Payment and credit information
- Full order payload stored as JSONB

### `order_items` table

- Line items for each order
- Product details and pricing
- Selected product options

## Connection Methods

Your app uses the **Neon Serverless Driver** (`@neondatabase/serverless`), which is optimized for:

- Edge functions (Cloudflare Workers, Vercel Edge Functions)
- Serverless functions (AWS Lambda, Vercel Functions)
- Any environment that supports HTTP-based database queries

This driver uses HTTP to connect, making it ideal for serverless and edge environments where traditional WebSocket or TCP connections may not be available.

## Next Steps

1. Get your connection string from the Neon Console
2. Update `.env` with your connection string
3. Deploy your schema using one of the methods above
4. Start your dev server: `npm run dev`
5. Test the orders API endpoint

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Neon Console](https://console.neon.tech/app/projects/dawn-field-01773809)

## Troubleshooting

### Connection Issues

If you encounter connection errors:

1. Verify your connection string is correct
2. Ensure `sslmode=require` is included in the connection string
3. Check that your Neon project is active (not in sleep mode)

### Environment Variables Not Loading

Make sure to restart your development server after updating `.env` files.
