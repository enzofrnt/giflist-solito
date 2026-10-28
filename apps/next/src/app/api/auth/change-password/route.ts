import { validatePassword } from 'app/lib/passwordValidation'
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, getCurrentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    const currentUser = await getCurrentUser(token);
    if (!currentUser) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    
    const { currentPassword, newPassword } = await request.json();

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    if (Buffer.byteLength(newPassword, 'utf8') > 72) {
      return NextResponse.json({ error: 'Le mot de passe est trop long (72 octets maximum).' }, { status: 400 });
    }

    // Validation du nouveau mot de passe avec la fonction réutilisable
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    // Récupérer l'utilisateur avec le mot de passe actuel
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        password: true,
        authVersion: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Le mot de passe actuel est incorrect' }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    const updated = await prisma.$transaction(async tx => {
      const result = await tx.user.updateMany({
        where: { id: user.id, password: user.password, authVersion: user.authVersion },
        data: { password: hashedNewPassword, authVersion: { increment: 1 } }
      });
      if (result.count === 1) await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
      return result.count;
    });
    if (updated !== 1) return NextResponse.json({ error: 'Votre mot de passe a changé. Reconnectez-vous.' }, { status: 401 });

    return NextResponse.json({ 
      success: true,
      message: 'Mot de passe modifié avec succès',
      token: generateToken(currentUser, user.authVersion + 1)
    });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors du changement de mot de passe' 
    }, { status: 500 });
  }
}
