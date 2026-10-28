import { after, NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getEmailConfig } from '@/lib/email'
import { getClientAddress, isSameOrigin } from '@/lib/auth-request'
import { requestPasswordReset, RESET_MESSAGE, takeAuthQuota } from '@/lib/password-reset'

export const runtime = 'nodejs'
export const maxDuration = 60
const schema = z.object({ email: z.string().trim().email().max(254) })

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine invalide' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Saisissez une adresse e-mail valide.' }, { status: 400 })
  try {
    getEmailConfig()
    const allowed = await takeAuthQuota('reset-request-ip', getClientAddress(request), 10, 30 * 60 * 1000)
    if (allowed) after(async () => {
      try {
        await requestPasswordReset(parsed.data.email)
        await prismaCleanup()
      } catch {
        console.error('Password reset request failed; check email configuration and database availability.')
      }
    })
    return NextResponse.json({ ok: true, message: RESET_MESSAGE }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Password reset service unavailable.')
    return NextResponse.json({ error: 'Le service est momentanément indisponible. Réessayez plus tard.' }, { status: 503 })
  }
}

async function prismaCleanup() {
  const { prisma } = await import('@/lib/prisma')
  await prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  await prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } })
}
