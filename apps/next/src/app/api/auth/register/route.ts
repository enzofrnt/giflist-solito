import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/lib/auth';
import { validatePassword } from 'app/lib/passwordValidation'

const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().superRefine((password, ctx) => {
    const validation = validatePassword(password)
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors[0] || 'Mot de passe invalide'
      })
    }
  }),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = RegisterSchema.parse(body);

    const result = await registerUser(email, password, name);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Erreur API register:', error);
    
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
