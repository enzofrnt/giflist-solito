import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse, type RegistrationResponseJSON } from '@simplewebauthn/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { consumeChallenge, failure } from '@/lib/passkeys'

export async function POST(request: NextRequest) {
  try {
    const challenge = await consumeChallenge(request, 'register')
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '')
    const current = token && await getCurrentUser(token)
    if (!current || current.id !== challenge.userId) return failure(401)
    const account = await prisma.user.findUnique({ where: { id: current.id }, select: { authVersion: true } })
    if (!account || account.authVersion !== challenge.authVersion) return failure(401)
    const body = await request.json() as RegistrationResponseJSON
    const result = await verifyRegistrationResponse({ response: body, expectedChallenge: challenge.challenge, expectedOrigin: challenge.origin, expectedRPID: challenge.rpId, requireUserVerification: true })
    if (!result.verified || !result.registrationInfo) return failure()
    const { credential, credentialDeviceType, credentialBackedUp } = result.registrationInfo
    await prisma.$transaction(async tx => {
      // Serialize against password recovery: a reset must also revoke a key
      // that is being registered concurrently.
      const locked = await tx.user.updateMany({ where: { id: current.id, authVersion: challenge.authVersion! }, data: { authVersion: challenge.authVersion! } })
      if (locked.count !== 1) throw new Error('Session changed')
      await tx.passkey.create({ data: { id: credential.id, userId: current.id, rpId: challenge.rpId, publicKey: Buffer.from(credential.publicKey), counter: credential.counter, transports: credential.transports || [], deviceType: credentialDeviceType, backedUp: credentialBackedUp } })
    })
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return failure() }
}
