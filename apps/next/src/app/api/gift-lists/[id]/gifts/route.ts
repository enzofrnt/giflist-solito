import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/auth';

const CreateGiftSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  url: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  price: z.number().optional(),
  description: z.string().optional()
});

// POST - Ajouter un cadeau à une liste
async function handlePost(request: NextRequest, user: User, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listId = parseInt(id);
    const body = await request.json();
    const { title, url, image, price, description } = CreateGiftSchema.parse(body);

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

    const gift = await prisma.gift.create({
      data: {
        title,
        url: url || null,
        image: image || null,
        price: price || null,
        description: description || null,
        giftListId: listId
      }
    });

    return NextResponse.json({
      ok: true,
      gift: {
        id: gift.id,
        title: gift.title,
        url: gift.url,
        image: gift.image,
        price: gift.price,
        description: gift.description,
        status: gift.status as 'available' | 'reserved',
        reservedByName: gift.reservedByName,
        reservedByEmail: gift.reservedByEmail,
        reservedAt: gift.reservedAt?.toISOString(),
        createdAt: gift.createdAt.toISOString(),
        updatedAt: gift.updatedAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST gift:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Erreur lors de l\'ajout du cadeau' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, (req, user) => handlePost(req, user, { params }));
}
