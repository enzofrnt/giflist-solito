import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Svg, Path, Circle } from 'react-native-svg'
import type { Gift } from 'app/types'
import { colors, spacing, typography } from 'app/ui'
import { useSession } from 'app/provider/session.native'
import { HomeScreen } from 'app/features/native/home'
import { LoginScreen } from 'app/features/native/login'
import { RegisterScreen } from 'app/features/native/register'
import { DashboardScreen } from 'app/features/native/dashboard'
import { ManageListScreen } from 'app/features/native/manage-list'
import { GiftFormScreen } from 'app/features/native/gift-form'
import { PublicListScreen } from 'app/features/native/public-list'
import { ProfileScreen } from 'app/features/native/profile'

export type RootStackParamList = {
  home: undefined
  login: undefined
  register: undefined
  main: undefined
  manage: { id: string }
  giftForm: { listId: string; gift?: Gift }
  public: { shareCode?: string } | undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

type Tab = 'lists' | 'profile'

function TabIcon({ name, color, focused }: { name: Tab; color: string; focused: boolean }) {
  if (name === 'lists') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M5 7h14M5 12h14M5 17h8" stroke={color} strokeWidth={focused ? 2.4 : 1.9} strokeLinecap="round" />
        <Circle cx="18.5" cy="17" r="1.4" fill={color} />
      </Svg>
    )
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth={focused ? 2.2 : 1.8} />
      <Path d="M5 20c0-3.9 3-6 7-6s7 2.1 7 6" stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" />
    </Svg>
  )
}

function MainScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'main'>) {
  const [tab, setTab] = useState<Tab>('lists')
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.shell}>
      <View style={styles.screen}>
        {tab === 'lists' ? (
          <DashboardScreen navigation={navigation} />
        ) : (
          <ProfileScreen navigation={navigation} onShowLists={() => setTab('lists')} />
        )}
      </View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        {(['lists', 'profile'] as const).map((value) => {
          const active = tab === value
          return (
            <Pressable
              key={value}
              onPress={() => setTab(value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={value === 'lists' ? 'Mes listes' : 'Profil'}
              style={styles.tab}
            >
              <TabIcon name={value} color={active ? colors.primary : colors.textMuted} focused={active} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {value === 'lists' ? 'Mes listes' : 'Profil'}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export function NativeNavigation() {
  const { user, loading } = useSession()
  if (loading) {
    return <View style={styles.loading}><Text style={styles.loadingText}>Giftlist</Text></View>
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? 'main' : 'home'}>
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="register" component={RegisterScreen} />
      <Stack.Screen name="main" component={MainScreen} />
      <Stack.Screen name="manage" component={ManageListScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="giftForm" component={GiftFormScreen} options={{ animation: 'none' }} />
      <Stack.Screen name="public" component={PublicListScreen} options={{ animation: 'none' }} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.canvas },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    minHeight: 58,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 44 },
  tabLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
  loadingText: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
})
