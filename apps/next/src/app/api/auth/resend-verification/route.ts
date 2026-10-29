import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resendVerificationEmail } from '@/lib/email-verification'

const Schema = z.object({ email: z.string().trim().email() })

export async function POST(request: NextRequest) {
  try {
    const { email } = Schema.parse(await request.json())
    await resendVerificationEmail(email)
    return NextResponse.json({
      ok: true,
      message: 'Si un compte non confirmé correspond à cette adresse, un nouvel e-mail vient d’être envoyé.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Adresse e-mail invalide.' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
