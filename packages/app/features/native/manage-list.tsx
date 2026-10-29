import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { Alert, Image, Share, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Pencil, Plus, Trash2 } from 'lucide-react-native'
import type { Gift, GiftList } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { API_URL, api } from 'app/lib/api'
import { AppHeader, Badge, Button, Card, Screen, ShareAction, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'manage'>

export function ManageListScreen({ navigation, route }: Props) {
  const { id } = route.params
  const [list, setList] = useState<GiftList | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  async function shareList() {
    if (!list) return
    await Share.share({
      title: list.title,
      message: `Voilà ma liste de cadeaux Giftlist : ${API_URL}/list/${list.shareCode}`,
    }).catch(() => undefined)
  }

  return (
    <Screen
      header={(
        <AppHeader
          onBack={() => navigation.goBack()}
          right={list ? <ShareAction onPress={shareList} /> : null}
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

          <Button title="Ajouter un cadeau" icon={Plus} onPress={() => navigation.navigate('giftForm', { listId: id })} fullWidth />

          <Text style={styles.sectionTitle}>Les cadeaux <Text style={styles.count}>{gifts.length}</Text></Text>
          {gifts.length === 0 ? <Card><Text style={styles.muted}>Aucun cadeau pour le moment.</Text></Card> : null}
          {gifts.map((gift) => (
            <Card key={gift.id}>
              <View style={styles.giftRow}>
                {gift.image ? (
                  <Image source={{ uri: gift.image }} style={styles.thumb} resizeMode="cover" accessibilityLabel={gift.title} />
                ) : (
                  <View style={[styles.thumb, styles.thumbEmpty]}>
                    <Image source={require('app/assets/icon.png')} style={styles.thumbFallbackImage} accessibilityLabel="Giftlist" />
                  </View>
                )}
                <View style={styles.giftInfo}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{gift.title}</Text>
                    <Badge label={gift.status === 'reserved' ? 'Réservé' : 'Disponible'} tone={gift.status === 'reserved' ? 'warning' : 'success'} />
                  </View>
                  {gift.price != null ? <Text style={styles.meta}>{gift.price} €</Text> : null}
                  {gift.description ? <Text style={styles.muted} numberOfLines={2}>{gift.description}</Text> : null}
                </View>
              </View>
              <View style={styles.actions}>
                <Button title="Modifier" icon={Pencil} variant="secondary" onPress={() => navigation.navigate('giftForm', { listId: id, gift })} style={styles.flex} />
                <Button title="Supprimer" icon={Trash2} variant="danger" onPress={() => confirmDelete(gift)} style={styles.flex} />
              </View>
            </Card>
          ))}
        </>
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
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
