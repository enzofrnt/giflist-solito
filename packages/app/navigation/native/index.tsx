import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeScreen } from 'app/features/native/home'
import { LoginScreen } from 'app/features/native/login'
import { RegisterScreen } from 'app/features/native/register'
import { DashboardScreen } from 'app/features/native/dashboard'
import { ManageListScreen } from 'app/features/native/manage-list'
import { PublicListScreen } from 'app/features/native/public-list'
import { ProfileScreen } from 'app/features/native/profile'

export type RootStackParamList = {
  home: undefined
  login: undefined
  register: undefined
  dashboard: undefined
  profile: undefined
  manage: { id: string }
  public: { shareCode?: string } | undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function NativeNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="home">
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="register" component={RegisterScreen} />
      <Stack.Screen name="dashboard" component={DashboardScreen} />
      <Stack.Screen name="manage" component={ManageListScreen} />
      <Stack.Screen name="public" component={PublicListScreen} />
      <Stack.Screen name="profile" component={ProfileScreen} />
    </Stack.Navigator>
  )
}
