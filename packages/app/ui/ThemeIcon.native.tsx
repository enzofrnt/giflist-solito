import { Platform } from 'react-native'
import { SymbolView } from 'expo-symbols'
import { Monitor, Moon, Sun } from 'lucide-react-native'
import type { ThemeMode } from 'app/theme/ThemeProvider.native'

const SYMBOLS = {
  light: 'sun.max.fill',
  dark: 'moon.fill',
  system: 'circle.lefthalf.filled',
} as const

export function ThemeIcon({ mode, size = 18, color }: { mode: ThemeMode; size?: number; color: string }) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={SYMBOLS[mode] as never}
        size={size}
        tintColor={color}
        type="hierarchical"
      />
    )
  }

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor
  return <Icon size={size} color={color} strokeWidth={1.9} />
}
