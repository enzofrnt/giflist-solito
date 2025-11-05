import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Annuler une réservation
export async function POST(request: NextRequest, { params }: { params: Promise<{ shareCode: string; giftId: string }> }) {
  try {
    const { shareCode, giftId } = await params;

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
      // Vérifier que le cadeau existe et est réservé
      const gift = await tx.gift.findFirst({
        where: {
          id: parseInt(giftId),
          giftListId: giftList.id,
          status: 'reserved'
        }
      });

      if (!gift) {
        throw new Error('Cadeau non trouvé ou non réservé');
      }

      // Annuler la réservation
      const updatedGift = await tx.gift.update({
        where: { id: parseInt(giftId) },
        data: {
          status: 'available',
          reservedBy: null,
          reservedByName: null,
          reservedByEmail: null,
          reservedAt: null
        }
      });

      return updatedGift;
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Réservation annulée avec succès' 
    });
  } catch (error) {
    console.error('Erreur POST cancel reservation:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'annulation de la réservation';
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 409 }
    );
  }
}
