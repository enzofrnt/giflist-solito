import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, User } from './auth';

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) {
  try {
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    // Vérifier le token et récupérer l'utilisateur
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Appeler le handler avec l'utilisateur
    return handler(request, user);
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    return NextResponse.json(
      { ok: false, error: 'Erreur d\'authentification' },
      { status: 500 }
    );
  }
}

// Fonction pour récupérer le token depuis les cookies
export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

// Fonction pour récupérer l'utilisateur depuis les cookies
export async function getUserFromCookies(request: NextRequest) {
  const token = getTokenFromCookies(request);
  if (!token) return null;
  return getCurrentUser(token);
}
