/**
 * Service pour gérer le stockage du token d'authentification
 */

const AUTH_TOKEN_KEY = 'auth-token'

/**
 * Récupère le token d'authentification depuis localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Sauvegarde le token d'authentification dans localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

/**
 * Supprime le token d'authentification de localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * Vérifie si un token existe
 */
export function hasAuthToken(): boolean {
  return getAuthToken() !== null
}

