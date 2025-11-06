import type { AuthResult, User } from 'app/types'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Vérifier un JWT token
export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email
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
      name: true
    }
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || '' // Fallback temporaire pour les utilisateurs existants
  };
}

// Inscription d'un nouvel utilisateur
export async function registerUser(email: string, password: string, name: string): Promise<AuthResult> {
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

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // Générer le token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || ''
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || ''
      },
      token
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

    // Générer le token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || ''
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || ''
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
