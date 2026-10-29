import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isValidUsername, normalizeUsername } from '@/lib/usernames';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const currentUser = await getCurrentUser(token);
    if (!currentUser) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    
    const body = await request.json();
    const { name, username, isPublic } = body;
    const data: { name?: string; username?: string; isPublic?: boolean } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Le nom ne peut pas dépasser 100 caractères' }, { status: 400 });
      }
      data.name = name.trim();
    }

    if (username !== undefined) {
      const normalized = normalizeUsername(String(username));
      if (!isValidUsername(normalized)) {
        return NextResponse.json({ error: 'Le pseudo doit contenir 3 à 30 caractères (a-z, chiffres, _).' }, { status: 400 });
      }
      const taken = await prisma.user.findFirst({ where: { username: normalized, id: { not: currentUser.id } }, select: { id: true } });
      if (taken) return NextResponse.json({ error: 'Ce pseudo est déjà utilisé.' }, { status: 409 });
      data.username = normalized;
      if (data.name === undefined) data.name = normalized;
    }
    if (typeof isPublic === 'boolean') data.isPublic = isPublic;
    if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Aucune modification.' }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isPublic: true,
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
