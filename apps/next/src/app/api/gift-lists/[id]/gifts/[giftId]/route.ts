import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/auth';

const UpdateGiftSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  url: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  price: z.number().optional(),
  description: z.string().optional()
});

// PUT - Modifier un cadeau
async function handlePut(request: NextRequest, user: User, { params }: { params: Promise<{ id: string; giftId: string }> }) {
  try {
    const { id, giftId: giftIdParam } = await params;
    const listId = parseInt(id);
    const giftId = parseInt(giftIdParam);
    const body = await request.json();
    const { title, url, image, price, description } = UpdateGiftSchema.parse(body);

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

    // Vérifier que le cadeau appartient à cette liste
    const gift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        giftListId: listId
      }
    });

    if (!gift) {
      return NextResponse.json(
        { ok: false, error: 'Cadeau non trouvé' },
        { status: 404 }
      );
    }

    const updatedGift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        title,
        url: url || null,
        image: image || null,
        price: price || null,
        description: description || null
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
    console.error('Erreur PUT gift:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Erreur lors de la modification du cadeau' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un cadeau
async function handleDelete(request: NextRequest, user: User, { params }: { params: Promise<{ id: string; giftId: string }> }) {
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

    // Vérifier que le cadeau appartient à cette liste
    const gift = await prisma.gift.findFirst({
      where: {
        id: giftId,
        giftListId: listId
      }
    });

    if (!gift) {
      return NextResponse.json(
        { ok: false, error: 'Cadeau non trouvé' },
        { status: 404 }
      );
    }

    await prisma.gift.delete({
      where: { id: giftId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur DELETE gift:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur lors de la suppression du cadeau' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; giftId: string }> }) {
  return withAuth(request, (req, user) => handlePut(req, user, { params }));
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; giftId: string }> }) {
  return withAuth(request, (req, user) => handleDelete(req, user, { params }));
}
