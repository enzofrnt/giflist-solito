import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/auth';

const UpdateGiftListSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  secret: z.boolean().optional()
});

// GET - Récupérer une liste spécifique
async function handleGet(request: NextRequest, user: User, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listId = parseInt(id);
    
    if (isNaN(listId)) {
      return NextResponse.json(
        { ok: false, error: 'ID de liste invalide' },
        { status: 400 }
      );
    }

    // Récupérer la liste avec ses cadeaux
    const giftList = await prisma.giftList.findFirst({
      where: { 
        id: listId,
        userId: user.id 
      },
      include: {
        gifts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!giftList) {
      return NextResponse.json(
        { ok: false, error: 'Liste non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    const formattedGifts = giftList.gifts.map(gift => ({
      id: gift.id,
      title: gift.title,
      url: gift.url,
      image: gift.image,
      price: gift.price,
      description: gift.description,
      status: gift.status,
      reservedBy: gift.reservedBy,
      reservedByName: gift.reservedByName,
      reservedByEmail: gift.reservedByEmail,
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
        createdAt: giftList.createdAt.toISOString(),
        updatedAt: giftList.updatedAt.toISOString()
      },
      gifts: formattedGifts
    });
  } catch (error) {
    console.error('Erreur GET gift-list:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur lors du chargement de la liste' },
      { status: 500 }
    );
  }
}

// PUT - Modifier une liste
async function handlePut(request: NextRequest, user: User, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listId = parseInt(id);
    
    if (isNaN(listId)) {
      return NextResponse.json(
        { ok: false, error: 'ID de liste invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, image, secret } = UpdateGiftListSchema.parse(body);

    // Vérifier que la liste appartient à l'utilisateur
    const existingList = await prisma.giftList.findFirst({
      where: { 
        id: listId,
        userId: user.id 
      }
    });

    if (!existingList) {
      return NextResponse.json(
        { ok: false, error: 'Liste non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour la liste
    const updateData: {
      title: string;
      description: string | null;
      image: string | null;
      secret?: boolean;
    } = {
      title,
      description: description || null,
      image: image || null
    };
    
    if (secret !== undefined) {
      updateData.secret = secret;
    }

    const updatedList = await prisma.giftList.update({
      where: { id: listId },
      data: updateData
    });

    return NextResponse.json({
      ok: true,
      giftList: {
        id: updatedList.id,
        title: updatedList.title,
        description: updatedList.description,
        image: updatedList.image,
        shareCode: updatedList.shareCode,
        secret: updatedList.secret,
        createdAt: updatedList.createdAt.toISOString(),
        updatedAt: updatedList.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur PUT gift-lists:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Erreur lors de la modification de la liste' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une liste
async function handleDelete(request: NextRequest, user: User, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listId = parseInt(id);
    
    if (isNaN(listId)) {
      return NextResponse.json(
        { ok: false, error: 'ID de liste invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la liste appartient à l'utilisateur
    const existingList = await prisma.giftList.findFirst({
      where: { 
        id: listId,
        userId: user.id 
      }
    });

    if (!existingList) {
      return NextResponse.json(
        { ok: false, error: 'Liste non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la liste (les cadeaux seront supprimés automatiquement via CASCADE)
    await prisma.giftList.delete({
      where: { id: listId }
    });

    return NextResponse.json({
      ok: true,
      message: 'Liste supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur DELETE gift-list:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur lors de la suppression de la liste' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, (req, user) => handleGet(req, user, { params }));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, (req, user) => handlePut(req, user, { params }));
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, (req, user) => handleDelete(req, user, { params }));
}