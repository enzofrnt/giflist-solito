import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Button, Card, Field, PasswordStrength, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'register'>

export function RegisterScreen({ navigation }: Props) {
  const { signIn } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!name.trim() || !email.trim() || password.length < 8 || password !== passwordConfirm) return
    setLoading(true)
    setError('')
    try {
      const result = await api.register(name.trim(), email.trim(), password)
      await signIn(result.token, result.user)
      navigation.reset({ index: 0, routes: [{ name: 'dashboard' }] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <AppHeader onBack={() => navigation.goBack()} />
      <Card>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.lead}>Votre première liste prend quelques secondes.</Text>
        <Field label="Nom" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="username" textContentType="username" />
        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: special;"
          hint="8 caractères minimum."
        />
        <PasswordStrength password={password} />
        <Field
          label="Confirmer le mot de passe"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          error={passwordConfirm && password !== passwordConfirm ? 'Les mots de passe ne correspondent pas.' : undefined}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Créer mon compte" onPress={submit} loading={loading} disabled={!name.trim() || !email.trim() || password.length < 8 || password !== passwordConfirm} fullWidth />
        <Pressable onPress={() => navigation.navigate('login')} style={styles.link}>
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
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
