import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse, type AuthenticationResponseJSON, type AuthenticatorTransport } from '@simplewebauthn/server'
import { generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { consumeChallenge, failure } from '@/lib/passkeys'

export async function POST(request: NextRequest) {
  try {
    const challenge = await consumeChallenge(request, 'login')
    const body = await request.json() as AuthenticationResponseJSON
    if (typeof body?.id !== 'string' || body.id.length > 2048) return failure()
    const key = await prisma.passkey.findUnique({ where: { id: body.id }, include: { user: true } })
    if (!key || key.rpId !== challenge.rpId || key.counter > BigInt(Number.MAX_SAFE_INTEGER)) return failure(401)
    const result = await verifyAuthenticationResponse({ response: body, expectedChallenge: challenge.challenge, expectedOrigin: challenge.origin, expectedRPID: challenge.rpId, requireUserVerification: true, credential: { id: key.id, publicKey: new Uint8Array(key.publicKey), counter: Number(key.counter), transports: key.transports as AuthenticatorTransport[] } })
    if (!result.verified) return failure(401)
    const updated = await prisma.passkey.updateMany({ where: { id: key.id, counter: key.counter }, data: { counter: result.authenticationInfo.newCounter, backedUp: result.authenticationInfo.credentialBackedUp, lastUsedAt: new Date() } })
    if (!updated.count) return failure(401)
    const user = { id: key.user.id, email: key.user.email, name: key.user.name }
    return NextResponse.json({ ok: true, user, token: generateToken(user, key.user.authVersion) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return failure(401) }
}
