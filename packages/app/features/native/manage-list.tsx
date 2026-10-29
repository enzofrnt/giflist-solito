import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Plus } from 'lucide-react-native'
import type { Gift, GiftList } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { WEB_URL, api } from 'app/lib/api'
import { AppHeader, Button, Card, GiftCard, InfoHint, Screen, ShareAction, ShareSheet, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'manage'>

export function ManageListScreen({ navigation, route }: Props) {
  const { id } = route.params
  const [list, setList] = useState<GiftList | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareOpen, setShareOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.giftList(id)
      setList(data.giftList)
      setGifts(data.gifts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }, [id])

  useFocusEffect(useCallback(() => { load() }, [load]))
  async function toggleListPublic() {
    if (!list) return
    try {
      const data = await api.updateGiftList(id, {
        title: list.title,
        description: list.description,
        secret: list.secret,
        isPublic: list.isPublic === false,
      })
      setList({ ...list, ...data.giftList })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible')
    }
  }



  function confirmDelete(gift: Gift) {
    Alert.alert('Supprimer le cadeau', `Supprimer « ${gift.title} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteGift(id, gift.id)
            setGifts((current) => current.filter((item) => item.id !== gift.id))
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Suppression impossible')
          }
        },
      },
    ])
  }

  return (
    <Screen
      header={(
        <AppHeader
          onBack={() => navigation.goBack()}
          right={list ? <ShareAction onPress={() => setShareOpen(true)} /> : null}
        />
      )}
    >
      {loading ? <Text style={styles.muted}>Chargement de la liste…</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {list ? (
        <>
          <View>
            <Text style={styles.title}>{list.title}</Text>
            {list.description ? <Text style={styles.muted}>{list.description}</Text> : null}
          </View>

          <Card>
            <View style={styles.rowBetween}>
              <View style={styles.inline}>
                <Text style={styles.switchText}>Liste publique</Text>
                <InfoHint title="Liste publique" message="Une liste publique apparaît sur votre profil public et dans la recherche. Une liste privée reste accessible uniquement avec son code complet." />
              </View>
              <Pressable onPress={toggleListPublic} style={styles.switchRow} accessibilityRole="switch" accessibilityState={{ checked: list.isPublic !== false }} accessibilityLabel="Liste publique">
                <View style={[styles.checkbox, list.isPublic !== false && styles.checkboxOn]}>{list.isPublic !== false ? <Text style={styles.check}>✓</Text> : null}</View>
              </Pressable>
            </View>
            <Text style={styles.muted}>Publique : visible sur votre profil. Privée : uniquement par code.</Text>
          </Card>

          <Button title="Ajouter un cadeau" icon={Plus} onPress={() => navigation.navigate('giftForm', { listId: id })} fullWidth />

          <Text style={styles.sectionTitle}>Les cadeaux <Text style={styles.count}>{gifts.length}</Text></Text>
          {gifts.length === 0 ? <Card><Text style={styles.muted}>Aucun cadeau pour le moment.</Text></Card> : null}
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              context="owner"
              onEdit={() => navigation.navigate('giftForm', { listId: id, gift })}
              onDelete={() => confirmDelete(gift)}
            />
          ))}
        </>
      ) : null}
      {list ? (
        <ShareSheet
          visible={shareOpen}
          title={list.title}
          url={`${WEB_URL}/list/${list.shareCode}`}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  count: { color: colors.textMuted, fontSize: typography.small, fontWeight: '500' },
  muted: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  error: { color: colors.danger, fontSize: typography.small },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  giftRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  giftInfo: { flex: 1, gap: spacing.xs },
  thumb: { width: 84, height: 84, borderRadius: 10, backgroundColor: colors.surfaceMuted },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  thumbFallbackImage: { width: 44, height: 44, borderRadius: 10 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700', flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  flex: { flex: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  switchText: { color: colors.text, fontSize: typography.small, fontWeight: '600' },
  switchRow: { minHeight: 44, justifyContent: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: colors.surface, fontWeight: '700' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
