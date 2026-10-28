import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import type { Gift, GiftList } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { API_URL, api } from 'app/lib/api'
import { AppHeader, Badge, Button, Card, Field, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'manage'>

export function ManageListScreen({ navigation, route }: Props) {
  const { id } = route.params
  const [list, setList] = useState<GiftList | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

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

  useEffect(() => { load() }, [load])

  async function addGift() {
    if (!title.trim()) return
    setAdding(true)
    setError('')
    try {
      const data = await api.createGift(id, {
        title: title.trim(),
        url: url.trim() || undefined,
        price: price.trim() ? Number(price.replace(',', '.')) : undefined,
        description: description.trim() || undefined,
      })
      setGifts((current) => [data.gift, ...current])
      setTitle(''); setUrl(''); setPrice(''); setDescription(''); setShowAdd(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ajout impossible')
    } finally {
      setAdding(false)
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

  async function shareList() {
    if (!list) return
    await Share.share({
      title: list.title,
      message: `Voilà ma liste de cadeaux Giftlist : ${API_URL}/list/${list.shareCode}`,
      url: `${API_URL}/list/${list.shareCode}`,
    }).catch(() => undefined)
  }

  return (
    <Screen>
      <AppHeader
        title="Gérer"
        onBack={() => navigation.navigate('dashboard')}
        right={list ? <Pressable onPress={shareList} style={styles.link} accessibilityRole="button"><Text style={styles.linkText}>Partager</Text></Pressable> : null}
      />
      {loading ? <Text style={styles.muted}>Chargement de la liste…</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {list ? (
        <>
          <View>
            <Text style={styles.title}>{list.title}</Text>
            {list.description ? <Text style={styles.muted}>{list.description}</Text> : null}
          </View>
          <Button title={showAdd ? 'Fermer' : 'Ajouter un cadeau'} variant={showAdd ? 'ghost' : 'primary'} onPress={() => setShowAdd((value) => !value)} fullWidth />
          {showAdd ? (
            <Card>
              <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Casque audio…" />
              <Field label="Lien produit" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
              <Field label="Prix (€)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="29,90" />
              <Field label="Description" value={description} onChangeText={setDescription} multiline placeholder="Optionnel" />
              <Button title="Ajouter" onPress={addGift} loading={adding} disabled={!title.trim()} fullWidth />
            </Card>
          ) : null}

          <Text style={styles.sectionTitle}>Les cadeaux <Text style={styles.count}>{gifts.length}</Text></Text>
          {gifts.length === 0 ? <Card><Text style={styles.muted}>Aucun cadeau pour le moment.</Text></Card> : null}
          {gifts.map((gift) => (
            <Card key={gift.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{gift.title}</Text>
                <Badge label={gift.status === 'reserved' ? 'Réservé' : 'Disponible'} tone={gift.status === 'reserved' ? 'warning' : 'success'} />
              </View>
              {gift.price != null ? <Text style={styles.meta}>{gift.price} €</Text> : null}
              {gift.description ? <Text style={styles.muted}>{gift.description}</Text> : null}
              <View style={styles.actions}>
                <Button title="Supprimer" variant="ghost" onPress={() => confirmDelete(gift)} />
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
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700', flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
