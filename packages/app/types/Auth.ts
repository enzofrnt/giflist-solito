/**
 * Types relatifs à l'authentification
 */

import type { User } from './User'

/**
 * Résultat d'authentification
 */
export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
  requiresEmailVerification?: boolean
}

