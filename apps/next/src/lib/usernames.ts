import { prisma } from './prisma'
import { USERNAME_MAX, USERNAME_MIN, USERNAME_RE, isValidUsername as isValidSharedUsername } from 'app/lib/usernameValidation'

export { USERNAME_MAX, USERNAME_MIN, USERNAME_RE }

/**
 * Trim only: a pseudo keeps the casing chosen by its owner. Comparisons and
 * uniqueness checks must be case-insensitive (see USERNAME_RE and the
 * `lower(username)` unique index).
 */
export function normalizeUsername(value: string): string {
  return value.trim()
}

export function isValidUsername(value: string): boolean {
  return isValidSharedUsername(value)
}

export function usernameFromName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20)
  return slug.length >= USERNAME_MIN ? slug : 'user'
}

/** Pick a free handle. The final insert still relies on the DB unique indexes. */
export async function uniqueUsername(base: string, excludeUserId?: number): Promise<string> {
  const normalized = normalizeUsername(base)
  for (let suffix = 0; suffix < 1000; suffix++) {
    const candidate = suffix === 0 ? normalized : `${normalized.slice(0, USERNAME_MAX - String(suffix).length - 1)}_${suffix}`
    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: candidate, mode: 'insensitive' },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return candidate
  }
  return `${normalized.slice(0, 22)}_${Date.now().toString(36).slice(-6)}`
}
