import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { getClientAddress } from '@/lib/auth-request'
import { takeAuthQuota } from '@/lib/password-reset'
import { prisma } from '@/lib/prisma'
import { failure, passkeyOrigin, setChallenge } from '@/lib/passkeys'

export async function POST(request: NextRequest) {
  try {
    const { origin, rpId } = passkeyOrigin(request)
    if (!await takeAuthQuota('passkey-login', getClientAddress(request), 30, 15 * 60 * 1000)) return failure(429)
    const options = await generateAuthenticationOptions({ rpID: rpId, userVerification: 'required', allowCredentials: [] })
    await prisma.passkeyChallenge.deleteMany({ where: { expiresAt: { lt: new Date() } } })
    return await setChallenge(NextResponse.json(options, { headers: { 'Cache-Control': 'no-store' } }), { challenge: options.challenge, purpose: 'login', origin, rpId })
  } catch { return failure() }
}
