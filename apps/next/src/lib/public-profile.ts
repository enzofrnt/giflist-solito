import { cache } from 'react'
import { prisma } from './prisma'

export interface PublicProfileList {
  shareCode: string
  title: string
  description: string | null
  image: string | null
  createdAt: Date
  _count: { gifts: number }
}

export interface PublicProfile {
  username: string
  giftLists: PublicProfileList[]
}

/**
 * Public profile loader shared by the page and its metadata so the database is
 * only queried once per request. Only public accounts and public lists are
 * exposed; no email or private field can leak through this shape.
 */
export const getPublicProfile = cache(async (username: string): Promise<PublicProfile | null> => {
  const key = username.trim()
  if (!key) return null

  return prisma.user.findFirst({
    where: { username: { equals: key, mode: 'insensitive' }, isPublic: true },
    select: {
      username: true,
      giftLists: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        select: {
          shareCode: true,
          title: true,
          description: true,
          image: true,
          createdAt: true,
          _count: { select: { gifts: true } },
        },
      },
    },
  })
})
