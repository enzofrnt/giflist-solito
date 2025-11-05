import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// POST - Révéler les réservations d'une liste secrète
// Note: Cette action ne modifie pas la base de données, elle sert uniquement pour le traçage
// La révélation est gérée côté client avec un état local
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (req, user) => {
    try {
      const { id } = await params;
      const listId = parseInt(id);
      
      if (isNaN(listId)) {
        return NextResponse.json(
          { ok: false, error: 'ID de liste invalide' },
          { status: 400 }
        );
      }

      // Vérifier que la liste appartient à l'utilisateur et est secrète
      const giftList = await prisma.giftList.findFirst({
        where: { 
          id: listId,
          userId: user.id,
          secret: true
        }
      });

      if (!giftList) {
        return NextResponse.json(
          { ok: false, error: 'Liste non trouvée ou non secrète' },
          { status: 404 }
        );
      }

      // Log de l'action de révélation (pour traçabilité future)
      // Pour l'instant, on retourne juste un succès
      // TODO: Ajouter un modèle de log si nécessaire pour la traçabilité

      return NextResponse.json({
        ok: true,
        message: 'Réservations révélées'
      });
    } catch (error) {
      console.error('Erreur reveal:', error);
      return NextResponse.json(
        { ok: false, error: 'Erreur lors de la révélation' },
        { status: 500 }
      );
    }
  });
}

