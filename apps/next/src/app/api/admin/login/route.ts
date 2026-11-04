import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminConfig, issueAdminSession, verifyAdminCredentials } from '@/lib/admin-auth'
import { getClientAddress, isSameOrigin } from '@/lib/auth-request'
import { takeAuthQuota } from '@/lib/password-reset'

export const runtime = 'nodejs'

const schema = z.object({
  username: z.string().trim().min(1).max(128),
  password: z.string().min(1).max(256),
})

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_ATTEMPTS = 5
const NO_STORE = { 'Cache-Control': 'no-store' }
// Same generic answer for an unknown username and a wrong password.
const INVALID_CREDENTIALS_MESSAGE = 'Identifiants incorrects.'

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'Origine invalide.' }, { status: 403, headers: NO_STORE })
  }
  if (!getAdminConfig()) {
    return NextResponse.json(
      { ok: false, error: 'L’espace administrateur est désactivé.' },
      { status: 503, headers: NO_STORE },
    )
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: INVALID_CREDENTIALS_MESSAGE }, { status: 400, headers: NO_STORE })
  }

  let allowed: boolean
  try {
    allowed = await takeAuthQuota(
      'admin-login',
      getClientAddress(request),
      RATE_LIMIT_MAX_ATTEMPTS,
      RATE_LIMIT_WINDOW_MS,
    )
  } catch {
    console.error('Admin login rate limit unavailable.')
    return NextResponse.json(
      { ok: false, error: 'Le service est momentanément indisponible. Réessayez plus tard.' },
      { status: 503, headers: NO_STORE },
    )
  }
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429, headers: NO_STORE },
    )
  }

  const valid = await verifyAdminCredentials(parsed.data.username, parsed.data.password)
  if (!valid) {
    return NextResponse.json({ ok: false, error: INVALID_CREDENTIALS_MESSAGE }, { status: 401, headers: NO_STORE })
  }

  return issueAdminSession(NextResponse.json({ ok: true }, { headers: NO_STORE }))
}
