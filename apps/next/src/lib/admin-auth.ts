import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from './auth'

// Server-only helpers. Never import this module from client components: it reads
// ADMIN_* secrets and JWT_SECRET.

const ADMIN_COOKIE = 'admin-token'
const ADMIN_ISSUER = 'giftlist'
const ADMIN_AUDIENCE = 'admin'
const ADMIN_TOKEN_TTL_SECONDS = 8 * 60 * 60

export interface AdminConfig {
  username: string
  passwordHash: string
}

// Missing or empty configuration disables the admin area entirely (fail closed).
export function getAdminConfig(): AdminConfig | null {
  const username = process.env.ADMIN_USERNAME?.trim()
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (!username || !passwordHash) return null
  return { username, passwordHash }
}

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'utf8')
  const rightBuffer = Buffer.from(right, 'utf8')
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const config = getAdminConfig()
  if (!config) return false
  const usernameMatches = constantTimeEquals(username, config.username)
  // Always run the bcrypt comparison so a wrong username is not detectable by timing.
  const passwordMatches = await bcrypt.compare(password, config.passwordHash).catch(() => false)
  return usernameMatches && passwordMatches
}

export function issueAdminSession(response: NextResponse): NextResponse {
  const token = jwt.sign({ role: 'admin' }, getJwtSecret(), {
    algorithm: 'HS256',
    issuer: ADMIN_ISSUER,
    audience: ADMIN_AUDIENCE,
    expiresIn: ADMIN_TOKEN_TTL_SECONDS,
  })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_TOKEN_TTL_SECONDS,
  })
  return response
}

export function readAdminSession(request: NextRequest): boolean {
  // Without configuration the admin area is disabled, even for a token issued earlier.
  if (!getAdminConfig()) return false
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token) return false
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
    })
    return typeof decoded !== 'string' && decoded.role === 'admin'
  } catch {
    return false
  }
}

// Mirrors the withAuth style from src/lib/middleware.ts: return a 401 payload or
// run the handler.
export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  if (!readAdminSession(request)) {
    return NextResponse.json(
      { ok: false, error: 'Authentification administrateur requise.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }
  return handler(request)
}

export function clearAdminSession(response: NextResponse): NextResponse {
  response.cookies.delete({ name: ADMIN_COOKIE, path: '/' })
  return response
}
