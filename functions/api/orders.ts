import { neon } from '@neondatabase/serverless'
import { z } from 'zod'

type Env = {
  NEON_DATABASE_URL: string
  BETTER_AUTH_URL?: string
}

const orderSchema = z.object({
  requestId: z.string().min(1),
  submittedAt: z.string().datetime(),
  locale: z.enum(['en', 'fr']),
  itemCount: z.number().int().min(1),
  itemsSummary: z.string().min(1),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        productId: z.string().min(1),
        productName: z.string().min(1),
        quantity: z.number().int().min(1),
        unitPrice: z.number().nonnegative(),
        lineTotal: z.number().nonnegative(),
        selectedOptions: z.record(z.string()),
      }),
    )
    .min(1),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    creditUsed: z.number().nonnegative(),
    creditRemaining: z.number().nonnegative(),
    walletToPay: z.number().nonnegative(),
  }),
})

type BetterAuthSession = {
  user: {
    id: string
    email?: string
  }
  session: {
    id: string
  }
}

const isRequestIdUniqueViolation = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybe = error as { code?: string; constraint?: string; message?: string }
  if (maybe.code !== '23505') {
    return false
  }

  if (maybe.constraint === 'orders_request_id_key') {
    return true
  }

  return typeof maybe.message === 'string' && maybe.message.includes('request_id')
}

const getSession = async (request: Request, env: Env): Promise<BetterAuthSession | null> => {
  const cookie = request.headers.get('cookie')
  if (!cookie) {
    return null
  }

  const requestUrl = new URL(request.url)
  const authBaseUrl = env.BETTER_AUTH_URL ?? requestUrl.origin
  const response = await fetch(`${authBaseUrl}/api/auth/get-session`, {
    method: 'GET',
    headers: {
      cookie,
    },
  })

  if (!response.ok) {
    return null
  }

  const json = (await response.json().catch(() => null)) as unknown
  if (!json || typeof json !== 'object') {
    return null
  }

  const direct = json as Record<string, unknown>
  const maybeSession = direct.user && direct.session ? direct : (direct.data as Record<string, unknown> | undefined)
  if (!maybeSession || typeof maybeSession !== 'object') {
    return null
  }

  const session = maybeSession as BetterAuthSession
  if (!session.user?.id || !session.session?.id) {
    return null
  }

  return session
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    if (!env.NEON_DATABASE_URL) {
      return Response.json({ error: 'NEON_DATABASE_URL is not configured.' }, { status: 500 })
    }

    const session = await getSession(request, env)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid order payload', issues: parsed.error.issues }, { status: 400 })
    }

    const sql = neon(env.NEON_DATABASE_URL)
    const order = parsed.data

    const existing = await sql<[{ id: string }]>`
      select id
      from orders
      where request_id = ${order.requestId}
      limit 1
    `
    if (existing[0]?.id) {
      return Response.json({ ok: true, orderId: existing[0].id, duplicate: true }, { status: 200 })
    }

    const orderId = crypto.randomUUID()

    try {
      await sql.transaction((txn) => [
        txn`
          insert into orders (
            id,
            request_id,
            submitted_at,
            user_id,
            user_email,
            locale,
            item_count,
            items_summary,
            subtotal,
            credit_used,
            credit_remaining,
            wallet_to_pay,
            raw_payload
          ) values (
            ${orderId},
            ${order.requestId},
            ${order.submittedAt},
            ${session.user.id},
            ${session.user.email ?? null},
            ${order.locale},
            ${order.itemCount},
            ${order.itemsSummary},
            ${order.totals.subtotal},
            ${order.totals.creditUsed},
            ${order.totals.creditRemaining},
            ${order.totals.walletToPay},
            ${JSON.stringify(order)}
          )
        `,
        ...order.items.map((item) =>
          txn`
            insert into order_items (
              id,
              order_id,
              cart_line_id,
              product_id,
              product_name,
              quantity,
              unit_price,
              line_total,
              selected_options
            ) values (
              ${crypto.randomUUID()},
              ${orderId},
              ${item.id},
              ${item.productId},
              ${item.productName},
              ${item.quantity},
              ${item.unitPrice},
              ${item.lineTotal},
              ${JSON.stringify(item.selectedOptions)}
            )
          `,
        ),
      ])
    } catch (error) {
      if (!isRequestIdUniqueViolation(error)) {
        throw error
      }

      const duplicate = await sql<[{ id: string }]>`
        select id
        from orders
        where request_id = ${order.requestId}
        limit 1
      `
      const duplicateId = duplicate[0]?.id
      if (!duplicateId) {
        throw error
      }

      return Response.json({ ok: true, orderId: duplicateId, duplicate: true }, { status: 200 })
    }

    return Response.json({ ok: true, orderId }, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
