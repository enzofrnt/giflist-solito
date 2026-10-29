import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation/index.native'
import { SessionProvider } from './session.native'
import { ThemeProvider, useTheme } from 'app/theme/ThemeProvider.native'

function ThemedStatusBar() {
  const { isDark } = useTheme()
  return <StatusBar style={isDark ? 'light' : 'dark'} />
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SafeArea>
        <SessionProvider>
          <NavigationProvider>
            <View style={{ flex: 1 }}>{children}</View>
            <ThemedStatusBar />
          </NavigationProvider>
        </SessionProvider>
      </SafeArea>
    </ThemeProvider>
  )
}
