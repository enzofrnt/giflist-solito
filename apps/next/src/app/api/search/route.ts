import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeUsername } from '@/lib/usernames'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ ok: true, list: null, users: [] }, { headers: { 'Cache-Control': 'no-store' } })

  try {
    // A full share code is an explicit capability, even for a private list.
    const code = q.toUpperCase()
    const list = await prisma.giftList.findUnique({
      where: { shareCode: code },
      select: {
        shareCode: true,
        title: true,
        description: true,
        isPublic: true,
        user: { select: { username: true, isPublic: true } },
      },
    })
    if (list) {
      return NextResponse.json({
        ok: true,
        list: {
          shareCode: list.shareCode,
          title: list.title,
          description: list.description,
          isPublic: list.isPublic,
          owner: {
            username: list.user.isPublic ? list.user.username : null,
          },
        },
        users: [],
      }, { headers: { 'Cache-Control': 'no-store' } })
    }

    if (q.length < 2) return NextResponse.json({ ok: true, list: null, users: [] }, { headers: { 'Cache-Control': 'no-store' } })

    const users = await prisma.user.findMany({
      where: {
        isPublic: true,
        username: { contains: normalizeUsername(q), mode: 'insensitive' },
      },
      select: {
        username: true,
        _count: { select: { giftLists: { where: { isPublic: true } } } },
      },
      orderBy: { username: 'asc' },
      take: 20,
    })

    return NextResponse.json({
      ok: true,
      list: null,
      users: users.map((user) => ({
        username: user.username,
        publicListsCount: user._count.giftLists,
      })),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ ok: false, error: 'Recherche momentanément indisponible.' }, { status: 500 })
  }
}
