import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import type { User } from '@/lib/auth'

export const runtime = 'nodejs'

async function handleDelete(_request: NextRequest, user: User, { params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode } = await params
  const list = await prisma.giftList.findUnique({ where: { shareCode: shareCode.toUpperCase() }, select: { id: true } })
  if (!list) return NextResponse.json({ ok: false, error: 'Liste introuvable.' }, { status: 404 })
  await prisma.favoriteList.deleteMany({ where: { userId: user.id, giftListId: list.id } })
  return NextResponse.json({ ok: true, favorite: false })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ shareCode: string }> }) {
  return withAuth(request, (req, user) => handleDelete(req, user, { params }))
}
