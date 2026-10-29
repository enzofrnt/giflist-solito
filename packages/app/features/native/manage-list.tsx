import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Image, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import type { Gift, GiftList } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { API_URL, api } from 'app/lib/api'
import { AppHeader, Badge, Button, Card, Field, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'manage'>

const EMPTY_FORM = { title: '', url: '', image: '', price: '', description: '' }

export function ManageListScreen({ navigation, route }: Props) {
  const { id } = route.params
  const [list, setList] = useState<GiftList | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

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

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingGift(null)
    setShowForm(false)
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingGift(null)
    setShowForm(true)
  }

  function openEdit(gift: Gift) {
    setForm({
      title: gift.title,
      url: gift.url ?? '',
      image: gift.image ?? '',
      price: gift.price != null ? String(gift.price) : '',
      description: gift.description ?? '',
    })
    setEditingGift(gift)
    setShowForm(true)
  }

  async function saveGift() {
    if (!form.title.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        url: form.url.trim() || undefined,
        image: form.image.trim() || undefined,
        price: form.price.trim() ? Number(form.price.replace(',', '.')) : undefined,
        description: form.description.trim() || undefined,
      }
      if (editingGift) {
        const data = await api.updateGift(id, editingGift.id, payload)
        setGifts((current) => current.map((gift) => gift.id === data.gift.id ? data.gift : gift))
      } else {
        const data = await api.createGift(id, payload)
        setGifts((current) => [data.gift, ...current])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setSaving(false)
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

          {!showForm ? (
            <Button title="Ajouter un cadeau" onPress={openAdd} fullWidth />
          ) : null}

          {showForm ? (
            <Card>
              <Text style={styles.formTitle}>{editingGift ? 'Modifier le cadeau' : 'Nouveau cadeau'}</Text>
              <Field label="Titre" value={form.title} onChangeText={(value) => setForm((current) => ({ ...current, title: value }))} placeholder="Casque audio…" />
              <Field label="Lien produit" value={form.url} onChangeText={(value) => setForm((current) => ({ ...current, url: value }))} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
              <Field label="Image (URL)" value={form.image} onChangeText={(value) => setForm((current) => ({ ...current, image: value }))} autoCapitalize="none" keyboardType="url" placeholder="https://…/photo.jpg" />
              <Field label="Prix (€)" value={form.price} onChangeText={(value) => setForm((current) => ({ ...current, price: value }))} keyboardType="decimal-pad" placeholder="29,90" />
              <Field label="Description" value={form.description} onChangeText={(value) => setForm((current) => ({ ...current, description: value }))} multiline placeholder="Optionnel" />
              <View style={styles.formActions}>
                <Button title="Annuler" variant="ghost" onPress={resetForm} style={styles.flex} />
                <Button title={editingGift ? 'Enregistrer' : 'Ajouter'} onPress={saveGift} loading={saving} disabled={!form.title.trim()} style={styles.flex} />
              </View>
            </Card>
          ) : null}

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
                <Button title="Modifier" variant="secondary" onPress={() => openEdit(gift)} style={styles.flex} />
                <Button title="Supprimer" variant="ghost" onPress={() => confirmDelete(gift)} style={styles.flex} />
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
  formTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
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
  formActions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
})
