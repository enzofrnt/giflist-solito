import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance, useColorScheme, View } from 'react-native'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { darkColors, lightColors, type ThemeColors } from 'app/ui/tokens'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'giftlist-theme'

type ThemeContextValue = {
  mode: ThemeMode
  resolved: ResolvedTheme
  isDark: boolean
  colors: ThemeColors
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored)
      })
      .catch(() => undefined)
      .finally(() => setReady(true))
  }, [])

  const resolved: ResolvedTheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode

  useEffect(() => {
    if (!ready) return
    Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode)
  }, [mode, ready])

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode)
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => undefined)
  }, [])

  const value = useMemo(
    () => ({
      mode,
      resolved,
      isDark: resolved === 'dark',
      colors: resolved === 'dark' ? darkColors : lightColors,
      setMode,
    }),
    [mode, resolved, setMode],
  )

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: lightColors.canvas }} />
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
