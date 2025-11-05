import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/auth';

// POST - Annuler une réservation (interface de gestion)
async function handlePost(request: NextRequest, user: User, { params }: { params: Promise<{ id: string; giftId: string }> }) {
  try {
    const { id, giftId: giftIdParam } = await params;
    const listId = parseInt(id);
    const giftId = parseInt(giftIdParam);

    // Vérifier que l'utilisateur est propriétaire de la liste
    const giftList = await prisma.giftList.findFirst({
      where: { 
        id: listId,
        userId: user.id
      }
    });

    if (!giftList) {
      return NextResponse.json(
        { ok: false, error: 'Liste non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    // Vérifier que le cadeau appartient à cette liste et est réservé
    const gift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        giftListId: listId,
        status: 'reserved'
      }
    });

    if (!gift) {
      return NextResponse.json(
        { ok: false, error: 'Cadeau non trouvé ou non réservé' },
        { status: 404 }
      );
    }

    // Annuler la réservation
    const updatedGift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        status: 'available',
        reservedBy: null,
        reservedByName: null,
        reservedByEmail: null,
        reservedAt: null
      }
    });

    return NextResponse.json({
      ok: true,
      gift: {
        id: updatedGift.id,
        title: updatedGift.title,
        url: updatedGift.url,
        image: updatedGift.image,
        price: updatedGift.price,
        description: updatedGift.description,
        status: updatedGift.status as 'available' | 'reserved',
        reservedByName: updatedGift.reservedByName,
        reservedByEmail: updatedGift.reservedByEmail,
        reservedAt: updatedGift.reservedAt?.toISOString(),
        createdAt: updatedGift.createdAt.toISOString(),
        updatedAt: updatedGift.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur POST cancel reservation:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur lors de l\'annulation de la réservation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; giftId: string }> }) {
  return withAuth(request, (req, user) => handlePost(req, user, { params }));
}
