'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'solito/navigation'
import type { User } from 'app/types'
import { getAuthToken, removeAuthToken } from 'app/lib/authStorage'
import { Platform } from 'react-native'

interface UseAuthOptions {
  /**
   * Si true, redirige vers login si non authentifié
   */
  redirectToLogin?: boolean
  /**
   * URL de redirection si non authentifié (par défaut: '/login')
   */
  redirectUrl?: string
  /**
   * Callback appelé après authentification réussie
   */
  onAuthenticated?: (token: string, user: User) => void | Promise<void>
  /**
   * Si true, ne redirige pas et laisse la page gérer (pour Header par exemple)
   */
  noRedirect?: boolean
  /**
   * Si true, re-vérifie l'authentification quand la route change (pour Header)
   */
  watchPathname?: boolean
  /**
   * URL de base pour les appels API (par défaut: '' pour utiliser les chemins relatifs)
   */
  apiBaseUrl?: string
}

interface UseAuthResult {
  user: User | null
  loading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  logout: () => void
}

// Cache simple pour éviter les appels multiples simultanés
let authCheckPromise: Promise<User | null> | null = null
let cachedUser: User | null = null
let cacheExpiry: number = 0
const CACHE_DURATION = 60000 // 1 minute

async function fetchUser(token: string, apiBaseUrl: string = ''): Promise<User | null> {
  try {
    // Sur web, utiliser le chemin relatif si apiBaseUrl est vide
    // Sur React Native, utiliser apiBaseUrl (doit être configuré)
    const apiUrl = Platform.OS === 'web' && !apiBaseUrl
      ? '/api/auth/me'
      : `${apiBaseUrl}/api/auth/me`
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.user
    }
    return null
  } catch {
    return null
  }
}

/**
 * Hook personnalisé pour gérer l'authentification
 * Compatible avec React Native et Web
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const {
    redirectToLogin = false,
    redirectUrl = '/login',
    onAuthenticated,
    noRedirect = false,
    watchPathname = false,
    apiBaseUrl = ''
  } = options

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Utiliser useRef pour mémoriser le callback
  const onAuthenticatedRef = useRef(onAuthenticated)
  
  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated
  }, [onAuthenticated])

  const checkAuth = useCallback(async () => {
    try {
      setError(null)

      // Vérifier que le stockage est disponible
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        setLoading(false)
        return
      }

      const tokenResult = getAuthToken()
      const token = tokenResult instanceof Promise ? await tokenResult : tokenResult
      if (!token) {
        setUser(null)
        cachedUser = null
        cacheExpiry = 0
        setLoading(false)
        if (redirectToLogin && !noRedirect && mounted) {
          router.push(redirectUrl)
        }
        return
      }

      // Vérifier le cache
      const now = Date.now()
      if (cachedUser && now < cacheExpiry) {
        setUser(cachedUser)
        setLoading(false)
        return
      }

      // Éviter les appels simultanés
      if (authCheckPromise) {
        const cachedResult = await authCheckPromise
        if (cachedResult) {
          cachedUser = cachedResult
          cacheExpiry = now + CACHE_DURATION
          setUser(cachedResult)
        } else {
          const removeResult = removeAuthToken()
          if (removeResult instanceof Promise) await removeResult
          cachedUser = null
          cacheExpiry = 0
          setUser(null)
        }
        setLoading(false)
        if (redirectToLogin && !noRedirect && mounted && !cachedResult) {
          router.push(redirectUrl)
        }
        return
      }

      // Faire l'appel
      authCheckPromise = fetchUser(token, apiBaseUrl)
      const result = await authCheckPromise
      authCheckPromise = null

      if (result) {
        cachedUser = result
        cacheExpiry = now + CACHE_DURATION
        setUser(result)

        // Appeler le callback si fourni
        if (onAuthenticatedRef.current) {
          await onAuthenticatedRef.current(token, result)
        }
      } else {
        const removeResult = removeAuthToken()
        if (removeResult instanceof Promise) await removeResult
        cachedUser = null
        cacheExpiry = 0
        setUser(null)
        if (redirectToLogin && !noRedirect && mounted) {
          router.push(redirectUrl)
        }
      }
    } catch (error) {
      console.error('Erreur auth:', error)
      setError(error instanceof Error ? error.message : 'Erreur d\'authentification')
      setUser(null)
      cachedUser = null
      cacheExpiry = 0
      if (redirectToLogin && !noRedirect && mounted) {
        router.push(redirectUrl)
      }
    } finally {
      setLoading(false)
    }
  }, [redirectToLogin, redirectUrl, noRedirect, router, mounted, apiBaseUrl])

  const logout = useCallback(async () => {
    const removeResult = removeAuthToken()
    if (removeResult instanceof Promise) await removeResult
    cachedUser = null
    cacheExpiry = 0
    setUser(null)
    if (!noRedirect) {
      router.push('/')
    }
  }, [noRedirect, router])

  // Mount effect
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check auth on mount
  useEffect(() => {
    if (mounted) {
      checkAuth()
    }
  }, [mounted, checkAuth])

  // Re-vérifier quand la route change (pour Header)
  useEffect(() => {
    if (mounted && watchPathname) {
      // Invalider le cache et re-vérifier
      cacheExpiry = 0
      checkAuth()
    }
  }, [pathname, mounted, watchPathname, checkAuth])

  return {
    user,
    loading,
    error,
    checkAuth,
    logout
  }
}

