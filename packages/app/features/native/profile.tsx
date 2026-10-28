import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Button, Card, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'profile'>

export function ProfileScreen({ navigation }: Props) {
  const { user, loading, signOut } = useSession()

  useEffect(() => {
    if (!loading && !user) navigation.replace('login')
  }, [user, loading, navigation])

  async function logout() {
    await signOut()
    navigation.reset({ index: 0, routes: [{ name: 'home' }] })
  }

  return (
    <Screen>
      <AppHeader title="Mon profil" onBack={() => navigation.navigate('dashboard')} />
      <Card>
        <Text style={styles.name}>{user?.name ?? 'Mon compte'}</Text>
        {user?.email ? <Text style={styles.muted}>{user.email}</Text> : null}
      </Card>
      <Card>
        <Button title="Mes listes" onPress={() => navigation.navigate('dashboard')} fullWidth />
        <Button title="Se déconnecter" variant="danger" onPress={logout} fullWidth />
      </Card>
      <View style={styles.footer}>
        <Text style={styles.muted}>Giftlist · application mobile</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: typography.small },
  footer: { alignItems: 'center', paddingTop: spacing.lg },
})
