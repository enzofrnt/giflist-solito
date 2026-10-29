/**
 * Types relatifs aux utilisateurs
 */

/**
 * Utilisateur de l'application
 */
export interface User {
  id: number
  email: string
  name: string
  username?: string
  isPublic?: boolean
}

/**
 * Utilisateur avec informations optionnelles (pour les vues publiques)
 */
export interface UserPublic {
  id: number
  email: string
  name?: string
  username?: string
  isPublic?: boolean
}

