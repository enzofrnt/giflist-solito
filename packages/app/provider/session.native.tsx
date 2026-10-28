import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from 'app/types'
import { api } from 'app/lib/api'
import { getAuthToken, removeAuthToken, setAuthToken } from 'app/lib/authStorage'

interface SessionContextValue {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (token: string, user: User) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        setUser(null)
        return
      }
      const { user: currentUser } = await api.me()
      setUser(currentUser)
    } catch (err) {
      setUser(null)
      setError(err instanceof Error ? err.message : 'Session indisponible')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signIn = useCallback(async (token: string, nextUser: User) => {
    await setAuthToken(token)
    setUser(nextUser)
    setError(null)
  }, [])

  const signOut = useCallback(async () => {
    await removeAuthToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, error, signIn, signOut, refresh }),
    [user, loading, error, signIn, signOut, refresh],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside SessionProvider')
  return value
}
