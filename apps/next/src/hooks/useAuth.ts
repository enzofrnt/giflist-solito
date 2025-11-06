'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from 'app/types'
import { getAuthToken, removeAuthToken } from 'app/lib/authStorage'

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
}

interface UseAuthResult {
  user: User | null
  loading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  logout: () => void
}

/**
 * Hook personnalisé pour gérer l'authentification
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const {
    redirectToLogin = false,
    redirectUrl = '/login',
    onAuthenticated,
    noRedirect = false,
    watchPathname = false
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

      // Vérifier que localStorage est disponible
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      const tokenResult = getAuthToken()
      const token = tokenResult instanceof Promise ? await tokenResult : tokenResult
      if (!token) {
        setUser(null)
        setLoading(false)
        if (redirectToLogin && !noRedirect && mounted) {
          router.push(redirectUrl)
        }
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        // Appeler le callback si fourni
        if (onAuthenticatedRef.current) {
          await onAuthenticatedRef.current(token, data.user)
        }
      } else {
        const removeResult = removeAuthToken()
        if (removeResult instanceof Promise) await removeResult
        setUser(null)
        if (redirectToLogin && !noRedirect && mounted) {
          router.push(redirectUrl)
        }
      }
    } catch (error) {
      console.error('Erreur auth:', error)
      setError(error instanceof Error ? error.message : 'Erreur d\'authentification')
      setUser(null)
      if (redirectToLogin && !noRedirect && mounted) {
        router.push(redirectUrl)
      }
    } finally {
      setLoading(false)
    }
  }, [redirectToLogin, redirectUrl, noRedirect, router, mounted])

  const logout = useCallback(async () => {
    const removeResult = removeAuthToken()
    if (removeResult instanceof Promise) await removeResult
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

