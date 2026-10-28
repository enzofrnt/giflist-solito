import { after, NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validatePassword } from 'app/lib/passwordValidation'
import { getClientAddress, isSameOrigin } from '@/lib/auth-request'
import { INVALID_RESET_MESSAGE, notifyPasswordReset, resetPassword, takeAuthQuota } from '@/lib/password-reset'

export const runtime = 'nodejs'
export const maxDuration = 60
const schema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: z.string().max(72) })

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine invalide' }, { status: 403 })
  try {
    if (!await takeAuthQuota('reset-submit-ip', getClientAddress(request), 30, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429, headers: { 'Retry-After': '900' } })
    }
    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ error: INVALID_RESET_MESSAGE }, { status: 400 })
    const validation = validatePassword(parsed.data.password)
    if (!validation.isValid) return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    if (Buffer.byteLength(parsed.data.password, 'utf8') > 72) {
      return NextResponse.json({ error: 'Le mot de passe est trop long (72 octets maximum).' }, { status: 400 })
    }
    const result = await resetPassword(parsed.data.token, parsed.data.password)
    if (!result) return NextResponse.json({ error: INVALID_RESET_MESSAGE }, { status: 400 })
    after(async () => {
      try { await notifyPasswordReset(result.email, result.tokenHash) }
      catch { console.error('Password reset confirmation email failed.') }
    })
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Password reset failed.')
    return NextResponse.json({ error: 'La réinitialisation a échoué. Réessayez plus tard.' }, { status: 503 })
  }
}
