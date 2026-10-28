import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const currentUser = await getCurrentUser(token);
    if (!currentUser) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    
    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Le nom ne peut pas dépasser 100 caractères' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: name.trim()
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return NextResponse.json({ 
      success: true,
      user: updatedUser 
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour du profil' 
    }, { status: 500 });
  }
}
