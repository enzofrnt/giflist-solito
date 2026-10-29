import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Image, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { List, LogIn, QrCode, UserPlus } from 'lucide-react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { useSession } from 'app/provider/session.native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { AppHeader, Button, Card, Screen, colors, radius, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'home'>

export function HomeScreen({ navigation }: Props) {
  const { user } = useSession()
  const { isDark } = useTheme()

  return (
    <Screen header={<AppHeader />}>
      <View style={styles.heroShell}>
        <LinearGradient
          colors={isDark ? ['#1c2740', '#11100f', '#3a211b'] : ['#e8efff', '#faf9f7', '#fde8df']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { borderColor: isDark ? '#34302a' : '#dbe4fb' }]}
        >
          <View style={[styles.heroGlow, isDark && styles.heroGlowDark]} />
          <Image
            source={require('app/assets/logo.png')}
            style={[styles.heroLogo, isDark && { tintColor: '#f7f3ed' }]}
            resizeMode="contain"
            accessibilityLabel="Giftlist"
          />
          <Text style={styles.overline}>Listes de cadeaux</Text>
          <Text style={styles.title}>Des cadeaux qui{'\n'}font <Text style={styles.titleAccent}>plaisir.</Text></Text>
          <Text style={styles.lead}>
            Créez et partagez vos listes. Vos proches réservent via un lien ou un QR code, sans créer de compte.
          </Text>
          <Button
            title={user ? 'Voir mes listes' : 'Se connecter'}
            icon={user ? List : LogIn}
            onPress={() => user ? navigation.reset({ index: 0, routes: [{ name: 'main' }] }) : navigation.navigate('login')}
            fullWidth
          />
          <Button
            title="Ouvrir une liste partagée"
            icon={QrCode}
            variant="secondary"
            onPress={() => navigation.navigate('public')}
            fullWidth
          />
          {!user ? (
            <Button title="Créer un compte" icon={UserPlus} variant="secondary" onPress={() => navigation.navigate('register')} fullWidth />
          ) : null}
          <View style={styles.meta}>
            <Text style={styles.metaText}>Gratuit</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>Aucune carte bancaire</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>Partage sans compte</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.steps}>
        <Text style={styles.overline}>Comment ça marche</Text>
        <Text style={styles.sectionTitle}>Trois étapes, zéro friction.</Text>
        <Text style={styles.sectionLead}>Créez, partagez, laissez réserver. Le reste est automatique.</Text>
        <Card style={styles.stepCard}>
          <Text style={styles.stepNumber}>01</Text>
          <View style={styles.stepBody}>
            <Text style={styles.step}>Créez votre liste</Text>
            <Text style={styles.stepText}>Ajoutez vos envies en quelques secondes, avec un lien produit ou manuellement.</Text>
          </View>
        </Card>
        <Card style={styles.stepCard}>
          <Text style={styles.stepNumber}>02</Text>
          <View style={styles.stepBody}>
            <Text style={styles.step}>Partagez le lien</Text>
            <Text style={styles.stepText}>Un lien unique ou un QR code. Vos proches n’ont pas besoin de créer un compte.</Text>
          </View>
        </Card>
        <Card style={styles.stepCard}>
          <Text style={styles.stepNumber}>03</Text>
          <View style={styles.stepBody}>
            <Text style={styles.step}>Laissez réserver</Text>
            <Text style={styles.stepText}>Vos proches réservent sans spoiler ; vous suivez les réservations en temps réel.</Text>
          </View>
        </Card>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  heroShell: { borderRadius: radius.lg + 6, overflow: 'hidden' },
  hero: { gap: spacing.md, padding: spacing.xl, borderWidth: 1 },
  heroGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 999, right: -90, top: -90, backgroundColor: '#f9c7b7', opacity: 0.45 },
  heroGlowDark: { backgroundColor: '#c75b39', opacity: 0.2 },
  heroLogo: { width: 168, height: 112, alignSelf: 'flex-start' },
  overline: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 42, lineHeight: 43, fontWeight: '800', letterSpacing: -1.2 },
  titleAccent: { color: colors.accent },
  lead: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: spacing.xs },
  metaText: { color: colors.textSubtle, fontSize: typography.caption },
  metaDot: { color: colors.textSubtle, fontSize: typography.caption },
  steps: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: typography.title, lineHeight: 28, fontWeight: '800', letterSpacing: -0.5 },
  sectionLead: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19, marginBottom: spacing.xs },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg },
  stepNumber: { color: colors.accent, fontSize: typography.body, fontWeight: '800', width: 28, paddingTop: 1 },
  stepBody: { flex: 1, gap: 3 },
  step: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  stepText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
})
