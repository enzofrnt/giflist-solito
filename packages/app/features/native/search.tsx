import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { Search as SearchIcon, ArrowRight } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { SearchPayload } from 'app/lib/api'
import { api } from 'app/lib/api'
import type { PublicListSummary } from 'app/lib/api'
import type { RootStackParamList } from 'app/navigation/native'
import { AppHeader, Button, Card, ListCard, Screen, colors, spacing, typography } from 'app/ui'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'main'> }

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResult(null)
      setError('')
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.search(trimmed)
        if (!cancelled) setResult(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Recherche impossible')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return (
    <Screen header={<AppHeader />}>
      <View>
        <Text style={styles.title}>Recherche</Text>
        <Text style={styles.lead}>Un pseudo ou un code de liste. Les comptes publics apparaissent ici.</Text>
      </View>

      <Card>
        <View style={styles.searchWrap}>
          <SearchIcon size={19} color={colors.textSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="enzo ou A1B2C3D4"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel="Rechercher un pseudo ou un code de liste"
          />
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </View>
        <Text style={styles.hint}>Le code complet ouvre la liste directement, même si elle est privée.</Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {result?.list ? (
        <Card>
          <Text style={styles.kicker}>LISTE TROUVÉE</Text>
          <Text style={styles.cardTitle}>{result.list.title}</Text>
          {result.list.description ? <Text style={styles.muted}>{result.list.description}</Text> : null}
          <Text style={styles.meta}>Par {result.list.owner.username ? `@${result.list.owner.username}` : 'un membre'}</Text>
          <Button title="Ouvrir la liste" icon={ArrowRight} onPress={() => navigation.navigate('public', { shareCode: result.list!.shareCode })} fullWidth />
        </Card>
      ) : null}

      {!result?.list && result?.users.length ? (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>Comptes publics</Text>
          {result.users.map((user) => (
            <Pressable
              key={user.username}
              onPress={() => navigation.navigate('userProfile', { username: user.username })}
              accessibilityRole="button"
              accessibilityLabel={`Voir le profil de ${user.username}`}
            >
              <Card>
                <View style={styles.userRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text></View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>@{user.username}</Text>
                  </View>
                  <Text style={styles.count}>{user.publicListsCount} liste{user.publicListsCount > 1 ? 's' : ''}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!loading && query.trim().length >= 2 && result && !result.list && result.users.length === 0 ? (
        <Card><Text style={styles.muted}>Aucun compte public ne correspond à « {query.trim()} ».</Text></Card>
      ) : null}
    </Screen>
  )
}

export function PublicUserScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'userProfile'>) {
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [lists, setLists] = useState<PublicListSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.publicUser(route.params.username)
      .then((data) => { setUser(data.user); setLists(data.giftLists) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Profil introuvable'))
      .finally(() => setLoading(false))
  }, [route.params.username])

  return (
    <Screen header={<AppHeader onBack={() => navigation.goBack()} />}>
      {loading ? <Text style={styles.muted}>Chargement du profil…</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {user ? (
        <>
          <View style={styles.profileHead}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text></View>
            <View>
              <Text style={styles.title}>@{user.username}</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Listes publiques</Text>
          {lists.length === 0 ? <Card><Text style={styles.muted}>Aucune liste publique.</Text></Card> : null}
          {lists.map((list) => (
            <ListCard
              key={list.shareCode}
              list={list}
              context="public"
              onOpen={() => navigation.navigate('public', { shareCode: list.shareCode })}
            />
          ))}
        </>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.small, marginTop: spacing.xs, lineHeight: 19 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, backgroundColor: colors.surface, marginBottom: spacing.sm },
  input: { flex: 1, minHeight: 44, color: colors.text, fontSize: typography.body },
  hint: { color: colors.textSubtle, fontSize: typography.caption, lineHeight: 17 },
  error: { color: colors.danger, fontSize: typography.small },
  kicker: { color: colors.textSubtle, fontSize: typography.caption, fontWeight: '700', letterSpacing: 1 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700', marginTop: spacing.xs },
  muted: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  results: { gap: spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 42, height: 42, borderRadius: 999, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontSize: typography.heading, fontWeight: '800' },
  flex: { flex: 1 },
  count: { color: colors.textMuted, fontSize: typography.caption },
  profileHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
})
