import type { NextRequest } from 'next/server'

export function getClientAddress(request: NextRequest) {
  // Vercel overwrites this header; don't trust arbitrary forwarded-for headers.
  if (process.env.VERCEL) return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  return 'local'
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  // Compare with the visited origin so the www alias and preview URLs work too.
  // Recovery emails still use the separately configured, trusted APP_URL.
  return !origin || origin === new URL(request.url).origin
}
