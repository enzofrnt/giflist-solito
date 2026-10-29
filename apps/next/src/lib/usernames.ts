import { prisma } from './prisma'

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30
export const USERNAME_RE = /^[a-z0-9_]{3,30}$/

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(normalizeUsername(value))
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

/** Pick a free handle. The final insert still relies on the DB unique index. */
export async function uniqueUsername(base: string, excludeUserId?: number): Promise<string> {
  const normalized = normalizeUsername(base)
  for (let suffix = 0; suffix < 1000; suffix++) {
    const candidate = suffix === 0 ? normalized : `${normalized.slice(0, USERNAME_MAX - String(suffix).length - 1)}_${suffix}`
    const existing = await prisma.user.findFirst({
      where: { username: candidate, ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
  }
  return `${normalized.slice(0, 22)}_${Date.now().toString(36).slice(-6)}`
}
