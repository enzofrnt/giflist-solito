import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { AppHeader, AuthBrand, Button, Card, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'verifyEmail'>

export function VerifyEmailScreen({ navigation, route }: Props) {
  const email = route.params?.email
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  async function resend() {
    if (!email || sending) return
    setSending(true)
    setMessage('')
    try {
      const result = await api.resendVerification(email)
      setMessage(result.message || 'Si un compte non confirmé correspond, un e-mail vient d’être envoyé.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Envoi impossible pour le moment.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Screen header={<AppHeader onBack={() => navigation.goBack()} />}>
      <Card>
        <AuthBrand />
        <Text style={styles.title}>Vérifiez votre boîte mail</Text>
        <Text style={styles.lead}>
          Un e-mail de confirmation vient d’être envoyé{email ? ` à ${email}` : ''}. Cliquez sur le lien qu’il contient pour activer votre compte.
        </Text>
        <Text style={styles.hint}>Pensez à vérifier vos spams. Le lien est valable 24 heures.</Text>
        {message ? <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text> : null}
        {email ? (
          <Button
            title="Renvoyer l’e-mail"
            variant="secondary"
            onPress={resend}
            loading={sending}
            fullWidth
          />
        ) : null}
        <Button title="Se connecter" onPress={() => navigation.navigate('login')} fullWidth />
        <Pressable onPress={() => navigation.navigate('register')} style={styles.link}>
          <Text style={styles.linkText}>Créer un autre compte</Text>
        </Pressable>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 },
  hint: { color: colors.textSubtle, fontSize: typography.caption, lineHeight: 18 },
  message: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
