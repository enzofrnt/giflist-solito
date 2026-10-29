import type { AuthResult, User } from 'app/types'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { isValidUsername, normalizeUsername, uniqueUsername, usernameFromName } from './usernames';

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be configured');
  return 'development-only-secret';
}

// Réexporter les types pour compatibilité
export type { AuthResult, User };

// Hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Générer un JWT token
export function generateToken(user: User, authVersion = 0): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      authVersion
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

interface JwtPayload {
  userId: number;
  email: string;
  authVersion?: number;
  iat?: number;
  exp?: number;
}

// Vérifier un JWT token
export function verifyToken(token: string): { userId: number; email: string; authVersion: number } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as JwtPayload;
    if (!Number.isInteger(decoded.userId) || typeof decoded.email !== 'string') return null;
    return {
      userId: decoded.userId,
      email: decoded.email,
      authVersion: decoded.authVersion ?? 0
    };
  } catch {
    return null;
  }
}

// Obtenir l'utilisateur actuel depuis le token
export async function getCurrentUser(token: string): Promise<User | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      isPublic: true,
      authVersion: true
    }
  });

  if (!user || user.authVersion !== decoded.authVersion) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || '', // Fallback temporaire pour les utilisateurs existants
    username: user.username,
    isPublic: user.isPublic,
  };
}

// Inscription d'un nouvel utilisateur
export async function registerUser(email: string, password: string, name: string, requestedUsername?: string): Promise<AuthResult> {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      };
    }

    const username = requestedUsername
      ? normalizeUsername(requestedUsername)
      : await uniqueUsername(usernameFromName(name))
    if (!isValidUsername(username)) {
      return { success: false, error: 'Le pseudo doit contenir 3 à 30 caractères (a-z, chiffres, _).' }
    }
    const usernameTaken = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (usernameTaken) return { success: false, error: 'Ce pseudo est déjà utilisé.' }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        isPublic: true,
        // Accounts created through the registration flow must confirm their
        // e-mail before they can log in. Existing accounts default to true.
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isPublic: true,
      }
    });

    return {
      success: true,
      requiresEmailVerification: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        username: user.username,
        isPublic: user.isPublic,
      },
    };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return {
      success: false,
      error: 'Erreur lors de la création du compte'
    };
  }
}

// Connexion d'un utilisateur
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect'
      };
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect'
      };
    }

    if (!user.emailVerified) {
      return {
        success: false,
        requiresEmailVerification: true,
        error: 'Confirmez votre adresse e-mail avant de vous connecter. Vérifiez votre boîte de réception.',
      };
    }

    // Générer le token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || ''
    }, user.authVersion);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        username: user.username,
        isPublic: user.isPublic,
      },
      token
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return {
      success: false,
      error: 'Erreur lors de la connexion'
    };
  }
}

export interface EmailChangeClaims {
  userId: number
  currentEmail: string
  newEmail: string
  authVersion: number
}

interface EmailChangePayload extends EmailChangeClaims {
  purpose?: string
  iat?: number
  exp?: number
}

export function signEmailChangeToken(claims: EmailChangeClaims): string {
  return jwt.sign(
    { ...claims, purpose: 'email-change' },
    getJwtSecret(),
    { algorithm: 'HS256', expiresIn: '30m', issuer: 'giftlist' },
  )
}

export function verifyEmailChangeToken(token: string): EmailChangeClaims | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'giftlist',
    }) as EmailChangePayload
    if (
      decoded.purpose !== 'email-change' ||
      !Number.isInteger(decoded.userId) ||
      typeof decoded.currentEmail !== 'string' ||
      typeof decoded.newEmail !== 'string' ||
      !Number.isInteger(decoded.authVersion)
    ) return null
    return {
      userId: decoded.userId,
      currentEmail: decoded.currentEmail,
      newEmail: decoded.newEmail,
      authVersion: decoded.authVersion,
    }
  } catch {
    return null
  }
}
