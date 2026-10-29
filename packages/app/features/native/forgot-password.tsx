import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Mail } from 'lucide-react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { AppHeader, AuthBrand, Button, Card, Field, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'forgotPassword'>

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const result = await api.requestPasswordReset(email.trim())
      setMessage(result.message || 'Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demande impossible pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen header={<AppHeader onBack={() => navigation.goBack()} />}>
      <Card>
        <AuthBrand />
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.lead}>Indiquez votre adresse e-mail pour recevoir un lien de réinitialisation.</Text>
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
        {message ? <Text style={styles.success} accessibilityLiveRegion="polite">{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Envoyer le lien" icon={Mail} onPress={submit} loading={loading} disabled={!email.trim()} fullWidth />
        <Pressable onPress={() => navigation.navigate('login')} style={styles.link}>
          <Text style={styles.linkText}>Retour à la connexion</Text>
        </Pressable>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 },
  success: { color: colors.success, fontSize: typography.small, lineHeight: 19 },
  error: { color: colors.danger, fontSize: typography.small },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
