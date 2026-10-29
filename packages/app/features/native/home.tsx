import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Button, Card, Screen, spacing, typography, colors } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'home'>

export function HomeScreen({ navigation }: Props) {
  const { user } = useSession()

  return (
    <Screen>
      <AppHeader
        right={
          user ? (
            <Pressable onPress={() => navigation.navigate('profile')} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>Profil</Text>
            </Pressable>
          ) : null
        }
      />

      <Card style={styles.hero}>
        <Text style={styles.overline}>Listes de cadeaux</Text>
        <Text style={styles.title}>Des cadeaux qui font plaisir.</Text>
        <Text style={styles.lead}>
          Créez et partagez vos listes. Vos proches réservent via un lien ou un QR code, sans créer de compte.
        </Text>
        <Button
          title={user ? 'Voir mes listes' : 'Se connecter'}
          onPress={() => navigation.navigate(user ? 'dashboard' : 'login')}
          fullWidth
        />
        <Button
          title="Ouvrir une liste partagée"
          variant="secondary"
          onPress={() => navigation.navigate('public')}
          fullWidth
        />
        {!user ? (
          <Button title="Créer un compte" variant="secondary" onPress={() => navigation.navigate('register')} fullWidth />
        ) : null}
      </Card>

      <View style={styles.steps}>
        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <Card>
          <Text style={styles.step}>01 · Créez votre liste</Text>
          <Text style={styles.stepText}>Ajoutez vos envies en quelques secondes.</Text>
        </Card>
        <Card>
          <Text style={styles.step}>02 · Partagez le lien</Text>
          <Text style={styles.stepText}>Un lien ou un QR code, sans compte pour vos proches.</Text>
        </Card>
        <Card>
          <Text style={styles.step}>03 · Laissez réserver</Text>
          <Text style={styles.stepText}>Vos proches réservent sans spoiler, vous suivez tout.</Text>
        </Card>
      </View>

      <Text style={styles.note}>Gratuit · Aucune carte bancaire · Partage sans compte</Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md },
  overline: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: typography.display, lineHeight: 38, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 },
  steps: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700', marginBottom: spacing.xs },
  step: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  stepText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  note: { color: colors.textSubtle, fontSize: typography.caption, textAlign: 'center' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
