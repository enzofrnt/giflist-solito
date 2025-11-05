import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/auth';
import { randomBytes } from 'crypto';

const CreateGiftListSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  secret: z.boolean().optional().default(false)
});

// GET - Récupérer les listes de l'utilisateur
async function handleGet(request: NextRequest, user: User) {
  try {
    const giftLists = await prisma.giftList.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { gifts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedLists = giftLists.map(list => ({
      id: list.id,
      title: list.title,
      description: list.description,
      image: list.image,
      shareCode: list.shareCode,
      secret: list.secret,
      createdAt: list.createdAt.toISOString(),
      giftsCount: list._count.gifts
    }));

    return NextResponse.json({
      ok: true,
      giftLists: formattedLists
    });
  } catch (error) {
    console.error('Erreur GET gift-lists:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur lors du chargement des listes' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle liste
async function handlePost(request: NextRequest, user: User) {
  try {
    const body = await request.json();
    const { title, description, image, secret } = CreateGiftListSchema.parse(body);

    // Générer un code de partage unique
    let shareCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      shareCode = randomBytes(4).toString('hex').toUpperCase();
      const existing = await prisma.giftList.findUnique({
        where: { shareCode }
      });
      isUnique = !existing;
    }

    const giftList = await prisma.giftList.create({
      data: {
        title,
        description,
        image: image || null,
        secret: secret ?? false,
        shareCode: shareCode!,
        userId: user.id
      },
      include: {
        _count: {
          select: { gifts: true }
        }
      }
    });

    const formattedList = {
      id: giftList.id,
      title: giftList.title,
      description: giftList.description,
      image: giftList.image,
      shareCode: giftList.shareCode,
      secret: giftList.secret,
      createdAt: giftList.createdAt.toISOString(),
      giftsCount: giftList._count.gifts
    };

    return NextResponse.json({
      ok: true,
      giftList: formattedList
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST gift-lists:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Erreur lors de la création de la liste' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
  return withAuth(request, handlePost);
}
