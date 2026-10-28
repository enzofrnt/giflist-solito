import { createHash, randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { isSameOrigin } from './auth-request'

const cookieName = 'giftlist-passkey-challenge'
const ttl = 5 * 60 * 1000
const hash = (value: string) => createHash('sha256').update(value).digest('hex')

// Never derive an RP ID from an arbitrary Host header. Each preview has its own
// independent WebAuthn credentials; production www and apex share giftlist.fr.
export function passkeyOrigin(request: NextRequest) {
  if (!isSameOrigin(request) || !request.headers.get('origin')) throw new Error('Invalid origin')
  const origin = new URL(request.url)
  const allowed = new Set<string>()
  if (process.env.VERCEL_ENV === 'preview') {
    for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
      if (host && /^[a-z0-9][a-z0-9.-]*\.vercel\.app$/i.test(host)) allowed.add(`https://${host}`)
    }
  } else if (process.env.NODE_ENV !== 'production' && origin.hostname === 'localhost' && origin.protocol === 'http:') {
    allowed.add(origin.origin)
  } else {
    allowed.add('https://giftlist.fr')
    allowed.add('https://www.giftlist.fr')
  }
  if (!allowed.has(origin.origin)) throw new Error('Untrusted origin')
  return { origin: origin.origin, rpId: origin.hostname === 'www.giftlist.fr' ? 'giftlist.fr' : origin.hostname }
}

export async function setChallenge(response: NextResponse, value: { challenge: string; purpose: string; origin: string; rpId: string; userId?: number; authVersion?: number }) {
  const secret = randomBytes(32).toString('base64url')
  await prisma.passkeyChallenge.create({ data: { ...value, id: hash(secret), expiresAt: new Date(Date.now() + ttl) } })
  response.cookies.set(cookieName, secret, { httpOnly: true, secure: value.origin.startsWith('https:'), sameSite: 'strict', path: '/api/auth/passkeys', maxAge: ttl / 1000 })
  return response
}

export async function consumeChallenge(request: NextRequest, purpose: string) {
  const { origin, rpId } = passkeyOrigin(request)
  const secret = request.cookies.get(cookieName)?.value
  if (!secret || !/^[A-Za-z0-9_-]{43}$/.test(secret)) throw new Error('Missing challenge')
  // Single atomic consumption prevents two concurrent verifications using one challenge.
  const rows = await prisma.$queryRaw<{ challenge: string; purpose: string; origin: string; rpId: string; userId: number | null; authVersion: number | null; expiresAt: Date }[]>`
    DELETE FROM "PasskeyChallenge" WHERE "id" = ${hash(secret)} RETURNING *`
  const challenge = rows[0]
  if (!challenge || challenge.purpose !== purpose || challenge.origin !== origin || challenge.rpId !== rpId || challenge.expiresAt <= new Date()) throw new Error('Invalid challenge')
  return challenge
}

export function failure(status = 400) {
  return NextResponse.json({ ok: false, error: 'Impossible de vérifier la clé d’accès. Réessayez.' }, { status, headers: { 'Cache-Control': 'no-store' } })
}
