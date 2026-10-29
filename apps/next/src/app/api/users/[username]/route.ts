import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeUsername } from '@/lib/usernames'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const normalized = normalizeUsername(username)
  try {
    const user = await prisma.user.findFirst({
      where: { username: normalized, isPublic: true },
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
    if (!user) return NextResponse.json({ ok: false, error: 'Profil introuvable.' }, { status: 404 })
    return NextResponse.json({
      ok: true,
      user: { username: user.username },
      giftLists: user.giftLists.map((list) => ({
        shareCode: list.shareCode,
        title: list.title,
        description: list.description,
        image: list.image,
        giftsCount: list._count.gifts,
        createdAt: list.createdAt.toISOString(),
      })),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ ok: false, error: 'Profil momentanément indisponible.' }, { status: 500 })
  }
}
