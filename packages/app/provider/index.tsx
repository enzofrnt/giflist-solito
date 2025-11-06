import { View } from 'react-native'
import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation'
import { Header } from 'app/components/Header'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea>
      <NavigationProvider>
        <View style={{ flex: 1 }}>
          <Header />
          {children}
        </View>
      </NavigationProvider>
    </SafeArea>
  )
}
