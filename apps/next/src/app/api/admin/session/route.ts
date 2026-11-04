import { NextRequest, NextResponse } from 'next/server'
import { readAdminSession } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export function GET(request: NextRequest) {
  return NextResponse.json(
    { ok: true, authenticated: readAdminSession(request) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
