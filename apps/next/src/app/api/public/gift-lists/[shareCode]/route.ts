import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer une liste publique par son code de partage
export async function GET(request: NextRequest, { params }: { params: Promise<{ shareCode: string }> }) {
  try {
    const { shareCode } = await params;

    // Une seule requête : la liste, ses cadeaux et le profil public du propriétaire.
    // L'email du propriétaire ne doit jamais être exposé publiquement.
    const giftList = await prisma.giftList.findUnique({
      where: { shareCode },
      include: {
        gifts: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!giftList) {
      return NextResponse.json(
        { ok: false, error: 'Liste non trouvée' },
        { status: 404 }
      );
    }

    const gifts = giftList.gifts;

    const formattedGifts = gifts.map(gift => ({
      id: gift.id,
      title: gift.title,
      url: gift.url,
      image: gift.image,
      price: gift.price,
      description: gift.description,
      status: gift.status as 'available' | 'reserved',
      reservedByName: gift.reservedByName,
      reservedAt: gift.reservedAt?.toISOString(),
      createdAt: gift.createdAt.toISOString(),
      updatedAt: gift.updatedAt.toISOString()
    }));

    return NextResponse.json({
      ok: true,
      giftList: {
        id: giftList.id,
        title: giftList.title,
        description: giftList.description,
        image: giftList.image,
        shareCode: giftList.shareCode,
        secret: giftList.secret,
        isPublic: giftList.isPublic,
        createdAt: giftList.createdAt.toISOString(),
        user: giftList.user
      },
      gifts: formattedGifts
    });
  } catch (error) {
    console.error('Erreur GET public gift-list:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur lors du chargement de la liste' },
      { status: 500 }
    );
  }
}
