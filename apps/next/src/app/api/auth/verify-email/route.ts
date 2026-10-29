import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyEmailToken } from '@/lib/email-verification'

const Schema = z.object({ token: z.string().min(32).max(256) })

export async function POST(request: NextRequest) {
  try {
    const { token } = Schema.parse(await request.json())
    const verified = await verifyEmailToken(token)
    if (!verified) {
      return NextResponse.json(
        { ok: false, error: 'Ce lien de confirmation est invalide ou a expiré.' },
        { status: 400 },
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Lien de confirmation invalide.' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
