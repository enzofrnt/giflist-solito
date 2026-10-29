import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isSameOrigin } from '@/lib/auth-request'
import { confirmEmailChange, EmailChangeError } from '@/lib/email-change'

export const runtime = 'nodejs'
export const maxDuration = 60

const schema = z.object({ token: z.string().min(20).max(4096) })

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine invalide' }, { status: 403 })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Lien invalide.' }, { status: 400 })

  try {
    const result = await confirmEmailChange(parsed.data.token)
    return NextResponse.json(
      { ok: true, user: result.user, token: result.token },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    if (error instanceof EmailChangeError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Email change confirmation failed.')
    return NextResponse.json({ error: 'Impossible de confirmer cette adresse pour le moment.' }, { status: 500 })
  }
}
