import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BodySchema = z.object({
  giftId: z.number().int().positive(),
  name: z.string().min(1).max(120),
  email: z.string().email().optional(),
  message: z.string().max(500).optional(),
  anonymous: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    const result = await prisma.$transaction(async (tx) => {
      // Vérifie dispo
      const gift = await tx.gift.findUnique({ where: { id: body.giftId } });
      if (!gift || gift.status !== 'available') {
        throw new Error('Gift already reserved or not found');
      }

      // Passe en "reserved" avec les infos de réservation
      const updatedGift = await tx.gift.update({
        where: { id: body.giftId },
        data: {
          status: 'reserved',
          reservedBy: body.name,
          reservedByName: body.anonymous ? 'Anonyme' : body.name,
          reservedByEmail: body.email ?? null,
          reservedAt: new Date(),
        },
      });

      return { giftId: body.giftId, gift: updatedGift };
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error }, { status: 409 });
  }
}