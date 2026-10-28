import { View } from 'react-native'
import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation/index.native'
import { SessionProvider } from './session.native'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea>
      <SessionProvider>
        <NavigationProvider>
          <View style={{ flex: 1 }}>{children}</View>
        </NavigationProvider>
      </SessionProvider>
    </SafeArea>
  )
}
