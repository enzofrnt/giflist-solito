import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { getCurrentUser } from '@/lib/auth'
import { getClientAddress } from '@/lib/auth-request'
import { takeAuthQuota } from '@/lib/password-reset'
import { prisma } from '@/lib/prisma'
import { failure, passkeyOrigin, setChallenge } from '@/lib/passkeys'

export async function POST(request: NextRequest) {
  try {
    const { origin, rpId } = passkeyOrigin(request)
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '')
    const current = token && await getCurrentUser(token)
    if (!current) return failure(401)
    if (!await takeAuthQuota('passkey-register', `${current.id}:${getClientAddress(request)}`, 10, 30 * 60 * 1000)) return failure(429)
    const user = await prisma.user.findUnique({ where: { id: current.id }, include: { passkeys: true } })
    if (!user) return failure(401)
    const options = await generateRegistrationOptions({
      rpName: 'Giftlist', rpID: rpId, userID: new TextEncoder().encode(String(user.id)),
      userName: user.email, userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials: user.passkeys.filter(key => key.rpId === rpId).map(key => ({ id: key.id })),
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    })
    await prisma.passkeyChallenge.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    return await setChallenge(NextResponse.json(options, { headers: { 'Cache-Control': 'no-store' } }), { challenge: options.challenge, purpose: 'register', origin, rpId, userId: user.id, authVersion: user.authVersion })
  } catch { return failure() }
}
