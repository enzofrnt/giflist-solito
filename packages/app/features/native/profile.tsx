import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { ThemeSettings } from 'app/features/native/theme-settings'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Button, Card, Field, PasswordStrength, Screen, colors, spacing, typography } from 'app/ui'

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'main'>
  onShowLists: () => void
}

export function ProfileScreen({ navigation, onShowLists }: Props) {
  const { user, loading, signIn, signOut } = useSession()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (!loading && !user) navigation.reset({ index: 0, routes: [{ name: 'login' }] })
  }, [user, loading, navigation])

  async function logout() {
    await signOut()
    navigation.reset({ index: 0, routes: [{ name: 'home' }] })
  }

  async function requestEmailChange() {
    if (!newEmail.trim() || !emailPassword) return
    setEmailSaving(true)
    setEmailError('')
    setEmailSuccess('')
    try {
      const result = await api.requestEmailChange(newEmail.trim(), emailPassword)
      setEmailSuccess(result.message)
      setNewEmail('')
      setEmailPassword('')
      setShowEmailForm(false)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Demande impossible')
    } finally {
      setEmailSaving(false)
    }
  }

  async function changePassword() {
    if (!user || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) return
    setSaving(true)
    setPasswordError('')
    setPasswordSuccess('')
    try {
      const result = await api.changePassword(currentPassword, newPassword)
      await signIn(result.token, user)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setPasswordSuccess('Mot de passe mis à jour.')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Modification impossible')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen header={<AppHeader />}>
      <Card>
        <Text style={styles.name}>{user?.name ?? 'Mon compte'}</Text>
        {user?.email ? <Text style={styles.muted}>{user.email}</Text> : null}
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Adresse e-mail</Text>
            <Text style={styles.muted}>{user?.email}</Text>
          </View>
          <Button
            title={showEmailForm ? 'Fermer' : 'Modifier'}
            variant={showEmailForm ? 'ghost' : 'secondary'}
            onPress={() => {
              setShowEmailForm((value) => !value)
              setEmailError('')
              setEmailSuccess('')
            }}
          />
        </View>
        {emailSuccess ? <Text style={styles.success}>{emailSuccess}</Text> : null}
        {showEmailForm ? (
          <View style={styles.form}>
            <Field label="Nouvelle adresse e-mail" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            <Field label="Mot de passe actuel" value={emailPassword} onChangeText={setEmailPassword} secureTextEntry autoComplete="current-password" textContentType="password" />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            <Button title="Envoyer la confirmation" onPress={requestEmailChange} loading={emailSaving} disabled={!newEmail.trim() || !emailPassword} fullWidth />
            <Text style={styles.muted}>Un lien de confirmation sera envoyé à la nouvelle adresse. L’ancienne reste active jusqu’à validation.</Text>
          </View>
        ) : null}
      </Card>

      <ThemeSettings />

      <Card>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.sectionTitle}>Mot de passe</Text>
            <Text style={styles.muted}>Modifiez le mot de passe de votre compte.</Text>
          </View>
          <Button
            title={showPassword ? 'Fermer' : 'Modifier'}
            variant={showPassword ? 'ghost' : 'secondary'}
            onPress={() => {
              setShowPassword((value) => !value)
              setPasswordError('')
              setPasswordSuccess('')
            }}
          />
        </View>
        {passwordSuccess ? <Text style={styles.success}>{passwordSuccess}</Text> : null}
        {showPassword ? (
          <View style={styles.form}>
            <Field label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoComplete="current-password" textContentType="password" />
            <Field
              label="Nouveau mot de passe"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: special;"
            />
            <PasswordStrength password={newPassword} />
            <Field
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              error={confirmPassword && newPassword !== confirmPassword ? 'Les mots de passe ne correspondent pas.' : undefined}
            />
            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
            <Button
              title="Enregistrer le mot de passe"
              onPress={changePassword}
              loading={saving}
              disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
              fullWidth
            />
          </View>
        ) : null}
      </Card>

      <Card>
        <Button title="Mes listes" onPress={onShowLists} fullWidth />
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
  sectionTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  flex: { flex: 1 },
  form: { gap: spacing.md, marginTop: spacing.sm },
  error: { color: colors.danger, fontSize: typography.small },
  success: { color: colors.success, fontSize: typography.small, marginTop: spacing.sm },
  footer: { alignItems: 'center', paddingTop: spacing.lg },
})
