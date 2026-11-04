import { NextResponse } from 'next/server'
import { clearAdminSession } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export function POST() {
  return clearAdminSession(NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } }))
}
