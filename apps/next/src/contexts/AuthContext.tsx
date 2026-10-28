'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from 'app/types'
import { getAuthToken, removeAuthToken } from 'app/lib/authStorage'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Cache simple pour éviter les appels multiples simultanés
let authCheckPromise: Promise<User | null> | null = null
let cachedUser: User | null = null
let cacheExpiry: number = 0
const CACHE_DURATION = 60000 // 1 minute

async function fetchUser(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      setError(null)

      if (typeof window === 'undefined') {
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
        return
      }

      // Faire l'appel
      authCheckPromise = fetchUser(token)
      const result = await authCheckPromise
      authCheckPromise = null

      if (result) {
        cachedUser = result
        cacheExpiry = now + CACHE_DURATION
        setUser(result)
      } else {
        const removeResult = removeAuthToken()
        if (removeResult instanceof Promise) await removeResult
        cachedUser = null
        cacheExpiry = 0
        setUser(null)
      }
    } catch (error) {
      console.error('Erreur auth:', error)
      setError(error instanceof Error ? error.message : 'Erreur d\'authentification')
      setUser(null)
      cachedUser = null
      cacheExpiry = 0
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    const removeResult = removeAuthToken()
    if (removeResult instanceof Promise) await removeResult
    cachedUser = null
    cacheExpiry = 0
    setUser(null)
    router.push('/')
  }, [router])

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

  return (
    <AuthContext.Provider value={{ user, loading, error, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

