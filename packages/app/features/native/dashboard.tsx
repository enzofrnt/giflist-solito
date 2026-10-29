import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Plus, Settings } from 'lucide-react-native'
import type { GiftListWithCount } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { useSession } from 'app/provider/session.native'
import { AppHeader, Badge, Button, Card, Field, Screen, colors, spacing, typography } from 'app/ui'

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'main'> }

export function DashboardScreen({ navigation }: Props) {
  const { user, loading: sessionLoading } = useSession()
  const [lists, setLists] = useState<GiftListWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [secret, setSecret] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.giftLists()
      setLists(data.giftLists)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!sessionLoading && !user) {
      navigation.reset({ index: 0, routes: [{ name: 'login' }] })
      return
    }
    if (user) load()
  }, [user, sessionLoading, navigation, load])

  async function createList() {
    if (!title.trim()) return
    setCreating(true)
    setError('')
    try {
      const data = await api.createGiftList({ title: title.trim(), secret })
      setLists((current) => [data.giftList, ...current])
      setTitle('')
      setSecret(false)
      setShowCreate(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Screen header={<AppHeader />}>

      <View style={styles.heading}>
        <View style={styles.flex}>
          <Text style={styles.title}>{user ? `Bonjour ${user.name.split(' ')[0]}` : 'Mes listes'}</Text>
          <Text style={styles.lead}>Créez, partagez et gérez vos listes.</Text>
        </View>
        <Button title={showCreate ? 'Fermer' : 'Nouvelle liste'} icon={showCreate ? undefined : Plus} variant={showCreate ? 'ghost' : 'primary'} onPress={() => setShowCreate((value) => !value)} />
      </View>

      {showCreate ? (
        <Card>
          <Field label="Titre de la liste" value={title} onChangeText={setTitle} placeholder="Anniversaire, Noël…" />
          <Pressable onPress={() => setSecret((value) => !value)} style={styles.switchRow} accessibilityRole="switch" accessibilityState={{ checked: secret }}>
            <View style={[styles.checkbox, secret && styles.checkboxOn]}>{secret ? <Text style={styles.check}>✓</Text> : null}</View>
            <Text style={styles.switchText}>Mode secret</Text>
          </Pressable>
          <Button title="Créer la liste" onPress={createList} loading={creating} disabled={!title.trim()} fullWidth />
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <Text style={styles.muted}>Chargement des listes…</Text> : null}

      {!loading && lists.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Aucune liste</Text>
          <Text style={styles.muted}>Créez votre première liste pour commencer.</Text>
          <Button title="Créer ma première liste" icon={Plus} onPress={() => setShowCreate(true)} />
        </Card>
      ) : null}

      {lists.map((list) => (
        <Card key={list.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{list.title}</Text>
            <Badge label={list.secret ? 'Secret' : 'Visible'} tone={list.secret ? 'warning' : 'success'} />
          </View>
          {list.description ? <Text style={styles.muted}>{list.description}</Text> : null}
          <Text style={styles.meta}>{list.giftsCount} cadeau{list.giftsCount > 1 ? 'x' : ''}</Text>
          <Button title="Gérer la liste" icon={Settings} onPress={() => navigation.navigate('manage', { id: String(list.id) })} fullWidth />
        </Card>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  flex: { flex: 1 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.small, marginTop: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700', flex: 1 },
  muted: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  error: { color: colors.danger, fontSize: typography.small },
  emptyTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: colors.surface, fontWeight: '700' },
  switchText: { color: colors.text, fontSize: typography.small, fontWeight: '600' },
})
