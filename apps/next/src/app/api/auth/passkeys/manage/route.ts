import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { failure, passkeyOrigin } from '@/lib/passkeys'

async function userFor(request: NextRequest) {
  passkeyOrigin(request)
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '')
  return token ? getCurrentUser(token) : null
}
export async function POST(request: NextRequest) {
  try {
    const user = await userFor(request)
    if (!user) return failure(401)
    const keys = await prisma.passkey.findMany({ where: { userId: user.id }, select: { id: true, rpId: true, createdAt: true, lastUsedAt: true }, orderBy: { createdAt: 'desc' } })
    const { rpId } = passkeyOrigin(request)
    return NextResponse.json({ ok: true, keys, hasPasskeyForCurrentOrigin: keys.some(key => key.rpId === rpId) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return failure() }
}
export async function DELETE(request: NextRequest) {
  try {
    const user = await userFor(request)
    if (!user) return failure(401)
    const { id } = await request.json()
    if (typeof id !== 'string' || id.length > 2048) return failure()
    const result = await prisma.passkey.deleteMany({ where: { id, userId: user.id } })
    return result.count ? NextResponse.json({ ok: true }) : failure(404)
  } catch { return failure() }
}
