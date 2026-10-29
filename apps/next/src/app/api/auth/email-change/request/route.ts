import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { isSameOrigin } from '@/lib/auth-request'
import { EmailChangeError, requestEmailChange } from '@/lib/email-change'

export const runtime = 'nodejs'
export const maxDuration = 60

const schema = z.object({
  email: z.string().trim().email('Saisissez une adresse e-mail valide.').max(254),
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis.'),
})

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine invalide' }, { status: 403 })
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }
  const currentUser = await getCurrentUser(authHeader.substring(7))
  if (!currentUser) return NextResponse.json({ error: 'Session expirée, reconnectez-vous.' }, { status: 401 })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  try {
    const result = await requestEmailChange(currentUser.id, parsed.data.currentPassword, parsed.data.email)
    return NextResponse.json({ ok: true, message: result.message }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof EmailChangeError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Email change request failed.')
    return NextResponse.json({ error: 'Le service e-mail est momentanément indisponible.' }, { status: 503 })
  }
}
