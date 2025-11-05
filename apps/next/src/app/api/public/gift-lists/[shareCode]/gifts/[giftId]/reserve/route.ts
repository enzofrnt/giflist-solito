import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ReserveSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email().optional(),
  anonymous: z.boolean().optional()
});

// POST - Réserver un cadeau dans une liste publique
export async function POST(request: NextRequest, { params }: { params: Promise<{ shareCode: string; giftId: string }> }) {
  try {
    const { shareCode, giftId } = await params;
    const body = await request.json();
    const { name, email, anonymous } = ReserveSchema.parse(body);

    // Vérifier que la liste existe
    const giftList = await prisma.giftList.findUnique({
      where: { shareCode }
    });

    if (!giftList) {
      return NextResponse.json(
        { ok: false, error: 'Liste non trouvée' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Vérifier que le cadeau existe et est disponible
      const gift = await tx.gift.findFirst({
        where: {
          id: parseInt(giftId),
          giftListId: giftList.id,
          status: 'available'
        }
      });

      if (!gift) {
        const existingGift = await tx.gift.findFirst({
          where: {
            id: parseInt(giftId),
            giftListId: giftList.id
          }
        });
        if (existingGift && existingGift.status === 'reserved') {
          throw new Error('Ce cadeau est déjà réservé');
        }
        throw new Error('Cadeau non trouvé');
      }

      // Mettre à jour le cadeau
      const updatedGift = await tx.gift.update({
        where: { id: parseInt(giftId) },
        data: {
          status: 'reserved',
          reservedBy: name,
          reservedByName: anonymous ? 'Anonyme' : name,
          reservedByEmail: email || null,
          reservedAt: new Date()
        }
      });

      return updatedGift;
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Cadeau réservé avec succès' 
    });
  } catch (error) {
    console.error('Erreur POST reserve:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation';
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 409 }
    );
  }
}
