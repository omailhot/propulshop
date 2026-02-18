import { createClient } from '@neondatabase/neon-js'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

if (!authUrl || !dataApiUrl) {
  const message = 'Missing VITE_NEON_AUTH_URL or VITE_NEON_DATA_API_URL'
  if (import.meta.env.PROD) {
    throw new Error(`${message}. Refusing to run in production with fallback auth/data URLs.`)
  }
  console.warn(message)
}

export const neonClient = createClient({
  auth: {
    url: authUrl ?? '',
  },
  dataApi: {
    url: dataApiUrl ?? '',
  },
})
