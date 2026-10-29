import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { LogIn } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { ApiError, api } from 'app/lib/api'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Button, Card, Field, PasswordField, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'login'>

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  async function submit() {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    setNeedsVerification(false)
    try {
      const result = await api.login(email.trim(), password)
      await signIn(result.token, result.user)
      navigation.reset({ index: 0, routes: [{ name: 'main' }] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible')
      if (err instanceof ApiError && err.status === 403) setNeedsVerification(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen header={<AppHeader onBack={() => navigation.goBack()} />}>
      <Card>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.lead}>Retrouvez vos listes de cadeaux.</Text>
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="username" textContentType="username" />
        <PasswordField label="Mot de passe" value={password} onChangeText={setPassword} autoComplete="current-password" textContentType="password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {needsVerification && email.trim() ? (
          <Pressable onPress={() => navigation.navigate('verifyEmail', { email: email.trim() })} style={styles.link}>
            <Text style={styles.linkText}>Renvoyer l’e-mail de confirmation</Text>
          </Pressable>
        ) : null}
        <Button title="Se connecter" icon={LogIn} onPress={submit} loading={loading} disabled={!email.trim() || !password} fullWidth />
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
