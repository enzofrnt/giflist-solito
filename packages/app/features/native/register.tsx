import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { UserPlus } from 'lucide-react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { ApiError } from 'app/lib/api'
import { AppHeader, Button, Card, Field, PasswordField, PasswordStrength, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'register'>

export function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  async function submit() {
    const cleanEmail = email.trim()
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Adresse e-mail invalide. Utilisez le format nom@domaine.com.')
      return
    }
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setError('Le pseudo doit contenir 3 à 30 caractères (lettres, chiffres, _).')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await api.register(username, cleanEmail, password, username)
      if (result.requiresEmailVerification) {
        navigation.navigate('verifyEmail', { email: result.email || cleanEmail })
      } else if (result.token && result.user) {
        // Backward-compatible with older API deployments.
        navigation.reset({ index: 0, routes: [{ name: 'login' }] })
      } else {
        setError('Compte créé, mais la confirmation est indisponible. Réessayez.')
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Création impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen header={<AppHeader onBack={() => navigation.goBack()} />}>
      <Card>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.lead}>Votre première liste prend quelques secondes.</Text>
        <Field label="Pseudo" value={username} onChangeText={(value) => setUsername(value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30))} autoCapitalize="none" autoComplete="username" textContentType="username" hint="3–30 caractères : a-z, chiffres et _." />
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="username" textContentType="username" />
        <PasswordField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          autoComplete="new-password"
          textContentType="newPassword"
          passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: special;"
          hint="8 caractères minimum."
        />
        <PasswordStrength password={password} />
        <PasswordField
          label="Confirmer le mot de passe"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          autoComplete="new-password"
          textContentType="newPassword"
          error={passwordConfirm && password !== passwordConfirm ? 'Les mots de passe ne correspondent pas.' : undefined}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Créer mon compte" icon={UserPlus} onPress={submit} loading={loading} disabled={!/^[a-z0-9_]{3,30}$/.test(username) || !email.trim() || password.length < 8 || password !== passwordConfirm} fullWidth />
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
