import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Button, Card, Field, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'login'>

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    try {
      const result = await api.login(email.trim(), password)
      await signIn(result.token, result.user)
      navigation.reset({ index: 0, routes: [{ name: 'dashboard' }] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} />
      <Card>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.lead}>Retrouvez vos listes de cadeaux.</Text>
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Se connecter" onPress={submit} loading={loading} disabled={!email.trim() || !password} fullWidth />
        <Pressable onPress={() => navigation.navigate('register')} style={styles.link}>
          <Text style={styles.linkText}>Pas de compte ? Créer un compte</Text>
        </Pressable>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.body, marginBottom: spacing.sm },
  error: { color: colors.danger, fontSize: typography.small },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
