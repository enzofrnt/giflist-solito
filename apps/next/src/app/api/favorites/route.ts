import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import type { User } from '@/lib/auth'

export const runtime = 'nodejs'

function formatFavorite(favorite: {
  createdAt: Date
  giftList: {
    shareCode: string
    title: string
    description: string | null
    image: string | null
    isPublic: boolean
    createdAt: Date
    user: { username: string }
    _count: { gifts: number }
  }
}) {
  return {
    createdAt: favorite.createdAt.toISOString(),
    list: {
      shareCode: favorite.giftList.shareCode,
      title: favorite.giftList.title,
      description: favorite.giftList.description,
      image: favorite.giftList.image,
      isPublic: favorite.giftList.isPublic,
      createdAt: favorite.giftList.createdAt.toISOString(),
      owner: { username: favorite.giftList.user.username },
      giftsCount: favorite.giftList._count.gifts,
    },
  }
}

async function handleGet(_request: NextRequest, user: User) {
  const favorites = await prisma.favoriteList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      giftList: {
        select: {
          shareCode: true,
          title: true,
          description: true,
          image: true,
          isPublic: true,
          createdAt: true,
          user: { select: { username: true } },
          _count: { select: { gifts: true } },
        },
      },
    },
  })
  return NextResponse.json({ ok: true, favorites: favorites.map(formatFavorite) }, { headers: { 'Cache-Control': 'no-store' } })
}

const schema = z.object({ shareCode: z.string().trim().min(4).max(24) })

async function handlePost(request: NextRequest, user: User) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Code de liste invalide.' }, { status: 400 })
  const list = await prisma.giftList.findUnique({ where: { shareCode: parsed.data.shareCode.toUpperCase() }, select: { id: true } })
  if (!list) return NextResponse.json({ ok: false, error: 'Liste introuvable.' }, { status: 404 })
  await prisma.favoriteList.upsert({
    where: { userId_giftListId: { userId: user.id, giftListId: list.id } },
    create: { userId: user.id, giftListId: list.id },
    update: {},
  })
  return NextResponse.json({ ok: true, favorite: true })
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet)
}

export async function POST(request: NextRequest) {
  return withAuth(request, handlePost)
}
