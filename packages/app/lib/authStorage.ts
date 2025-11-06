/**
 * Service pour gérer le stockage du token d'authentification
 * Compatible avec React Native (AsyncStorage) et Web (localStorage)
 */

import { Platform } from 'react-native'

const AUTH_TOKEN_KEY = 'auth-token'

// Pour React Native, on utilisera AsyncStorage
// Pour Web, on utilisera localStorage
let storage: {
  getItem: (key: string) => Promise<string | null> | string | null
  setItem: (key: string, value: string) => Promise<void> | void
  removeItem: (key: string) => Promise<void> | void
}

if (Platform.OS === 'web') {
  // Web: utiliser localStorage
  storage = {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, value)
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    }
  }
} else {
  // React Native: utiliser AsyncStorage si disponible, sinon localStorage (pour compatibilité)
  // On utilise une fonction lazy pour éviter que Next.js essaie de résoudre le module
  // Le require est dans une fonction string pour éviter l'analyse statique de Next.js
  let AsyncStorageModule: any = null
  const getAsyncStorage = () => {
    if (AsyncStorageModule === null) {
      try {
        // On utilise Function pour éviter que Next.js analyse statiquement le require
        // Cette approche empêche Next.js de tenter de résoudre le module
        const requireAsyncStorage = new Function('return require("@react-native-async-storage/async-storage").default')
        AsyncStorageModule = requireAsyncStorage()
      } catch {
        AsyncStorageModule = false // Marque comme non disponible
      }
    }
    return AsyncStorageModule
  }

  // Initialiser storage avec une fonction lazy
  storage = {
    getItem: (key: string) => {
      const AsyncStorage = getAsyncStorage()
      if (AsyncStorage) {
        return AsyncStorage.getItem(key)
      }
      // Fallback sur localStorage
      if (typeof window === 'undefined') return null
      return localStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
      const AsyncStorage = getAsyncStorage()
      if (AsyncStorage) {
        return AsyncStorage.setItem(key, value)
      }
      // Fallback sur localStorage
      if (typeof window === 'undefined') return
      localStorage.setItem(key, value)
    },
    removeItem: (key: string) => {
      const AsyncStorage = getAsyncStorage()
      if (AsyncStorage) {
        return AsyncStorage.removeItem(key)
      }
      // Fallback sur localStorage
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    }
  }
}

/**
 * Récupère le token d'authentification
 * Sur web, retourne directement la valeur (synchrone)
 * Sur React Native, retourne une Promise
 */
export function getAuthToken(): string | null | Promise<string | null> {
  if (Platform.OS === 'web') {
    // Sur web, localStorage est synchrone
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(AUTH_TOKEN_KEY)
    } catch {
      return null
    }
  }
  // Sur React Native, retourne une Promise
  try {
    const result = storage.getItem(AUTH_TOKEN_KEY)
    return result instanceof Promise ? result : Promise.resolve(result)
  } catch {
    return Promise.resolve(null)
  }
}

/**
 * Sauvegarde le token d'authentification
 * Sur web, fonction synchrone
 * Sur React Native, retourne une Promise
 */
export function setAuthToken(token: string): void | Promise<void> {
  if (Platform.OS === 'web') {
    // Sur web, localStorage est synchrone
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error)
    }
    return
  }
  // Sur React Native, retourne une Promise
  try {
    const result = storage.setItem(AUTH_TOKEN_KEY, token)
    return result instanceof Promise ? result : Promise.resolve()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error)
    return Promise.resolve()
  }
}

/**
 * Supprime le token d'authentification
 * Sur web, fonction synchrone
 * Sur React Native, retourne une Promise
 */
export function removeAuthToken(): void | Promise<void> {
  if (Platform.OS === 'web') {
    // Sur web, localStorage est synchrone
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(AUTH_TOKEN_KEY)
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error)
    }
    return
  }
  // Sur React Native, retourne une Promise
  try {
    const result = storage.removeItem(AUTH_TOKEN_KEY)
    return result instanceof Promise ? result : Promise.resolve()
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error)
    return Promise.resolve()
  }
}

/**
 * Vérifie si un token existe
 * Sur web, retourne directement la valeur (synchrone)
 * Sur React Native, retourne une Promise
 */
export function hasAuthToken(): boolean | Promise<boolean> {
  if (Platform.OS === 'web') {
    const token = getAuthToken() as string | null
    return token !== null
  }
  // Sur React Native, retourne une Promise
  const tokenPromise = getAuthToken() as Promise<string | null>
  return tokenPromise.then(token => token !== null)
}

