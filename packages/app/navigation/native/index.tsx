import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'

const Stack = createNativeStackNavigator<{
  home: undefined
  'user-detail': {
    id: string
  }
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Désactiver le header par défaut de React Navigation
      }}
    >
      <Stack.Screen
        name="home"
        component={HomeScreen}
      />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
      />
    </Stack.Navigator>
  )
}
