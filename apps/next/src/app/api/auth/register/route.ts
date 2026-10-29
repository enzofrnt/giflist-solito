import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email-verification';
import { validatePassword } from 'app/lib/passwordValidation'

const RegisterSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide. Utilisez le format nom@domaine.com.'),
  password: z.string().superRefine((password, ctx) => {
    const validation = validatePassword(password)
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors[0] || 'Mot de passe invalide'
      })
    }
  }),
  name: z.string().min(1).max(100).optional(),
  username: z.string().trim().min(3, 'Le pseudo doit contenir au moins 3 caractères').max(30, 'Le pseudo ne peut pas dépasser 30 caractères').regex(/^[a-zA-Z0-9_]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres et _').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, username } = RegisterSchema.parse(body);

    if (!username) return NextResponse.json({ ok: false, error: 'Le pseudo est requis.' }, { status: 400 })
    const result = await registerUser(email, password, name || username, username);

    if (!result.success) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    if (!result.user) {
      return NextResponse.json({ ok: false, error: 'Erreur lors de la création du compte' }, { status: 500 });
    }

    try {
      await sendVerificationEmail({ id: result.user.id, email: result.user.email });
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Le compte a été créé, mais l’e-mail de confirmation n’a pas pu être envoyé. Réessayez depuis la page de vérification.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      requiresEmailVerification: true,
      email: result.user.email,
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
