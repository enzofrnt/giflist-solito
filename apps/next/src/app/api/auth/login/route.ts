import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginUser } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          ...(result.requiresEmailVerification ? { requiresEmailVerification: true } : {}),
        },
        { status: result.requiresEmailVerification ? 403 : 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Erreur API login:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
