import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Same contract as the legacy /api/gift route, but admin-only. The admin view
// legitimately sees reservation contact fields (reservedByEmail included).
const GiftSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'reserved']).optional(),
  reservedBy: z.string().nullable().optional(),
  reservedByName: z.string().nullable().optional(),
  reservedByEmail: z.string().nullable().optional(),
  reservedAt: z.string().nullable().optional(),
})

const GiftCreateSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  giftListId: z.number().int().positive(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

export async function GET(request: NextRequest) {
  return requireAdmin(request, async () => {
    const gifts = await prisma.gift.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        image: true,
        price: true,
        description: true,
        status: true,
        reservedByName: true,
        reservedByEmail: true,
        reservedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json({ ok: true, data: gifts }, { headers: { 'Cache-Control': 'no-store' } })
  })
}

export async function POST(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const body = await request.json()
      const parsed = GiftCreateSchema.parse(body)
      const gift = await prisma.gift.create({ data: parsed })
      return NextResponse.json({ ok: true, data: gift }, { status: 201 })
    } catch (error) {
      return errorResponse(error)
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const body = await request.json()
      const { id, ...data } = body
      const parsed = GiftSchema.parse(data)
      const updateData = {
        ...parsed,
        reservedAt: parsed.reservedAt ? new Date(parsed.reservedAt) : parsed.reservedAt,
      }
      const gift = await prisma.gift.update({
        where: { id: parseInt(id) },
        data: updateData,
      })
      return NextResponse.json({ ok: true, data: gift })
    } catch (error) {
      return errorResponse(error)
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAdmin(request, async () => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      if (!id) {
        return NextResponse.json({ ok: false, error: 'ID manquant' }, { status: 400 })
      }
      await prisma.gift.delete({
        where: { id: parseInt(id) },
      })
      return NextResponse.json({ ok: true })
    } catch (error) {
      return errorResponse(error)
    }
  })
}
