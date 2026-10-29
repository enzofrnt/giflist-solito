import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react-native'
import type { Gift, GiftList } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { WEB_URL, api } from 'app/lib/api'
import { AppHeader, Button, Card, Field, GiftCard, ImageUploadButton, InfoHint, Screen, ShareAction, ShareSheet, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'manage'>

export function ManageListScreen({ navigation, route }: Props) {
  const { id } = route.params
  const [list, setList] = useState<GiftList | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editPublic, setEditPublic] = useState(true)
  const [editSecret, setEditSecret] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [hasRevealed, setHasRevealed] = useState(false)

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



  async function revealReservations() {
    try {
      await api.revealGiftList(id)
      setHasRevealed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Révélation impossible')
    }
  }

  function openEditList() {
    if (!list) return
    setEditTitle(list.title)
    setEditDescription(list.description || '')
    setEditImage(list.image || '')
    setEditPublic(list.isPublic !== false)
    setEditSecret(Boolean(list.secret))
    setEditOpen(true)
  }

  async function saveList() {
    if (!list || !editTitle.trim()) return
    setEditSaving(true)
    try {
      const data = await api.updateGiftList(id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        image: editImage.trim() || undefined,
        secret: editSecret,
        isPublic: editPublic,
      })
      setList({ ...list, ...data.giftList })
      setEditOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Modification impossible')
    } finally {
      setEditSaving(false)
    }
  }

  function deleteList() {
    Alert.alert('Supprimer la liste', 'Cette action est irréversible et supprimera tous les cadeaux associés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.deleteGiftList(id)
          navigation.goBack()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Suppression impossible')
        }
      } },
    ])
  }

  function cancelReservation(gift: Gift) {
    Alert.alert('Annuler la réservation', `Libérer « ${gift.title} » pour les autres ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Libérer', style: 'destructive', onPress: async () => {
        try {
          await api.cancelGiftReservation(id, gift.id)
          setGifts((current) => current.map((item) => item.id === gift.id ? { ...item, status: 'available', reservedByName: undefined, reservedByEmail: undefined, reservedAt: undefined } : item))
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Annulation impossible')
        }
      } },
    ])
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
          <View style={styles.listHero}>
            {list.image ? <Image source={{ uri: list.image }} style={styles.listCover} resizeMode="cover" accessibilityLabel={list.title} /> : null}
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>GESTION DE LISTE</Text>
              <Text style={styles.title}>{list.title}</Text>
              {list.description ? <Text style={styles.muted}>{list.description}</Text> : null}
              <Text style={styles.meta}>{gifts.length} cadeau{gifts.length > 1 ? 'x' : ''} · {list.isPublic === false ? 'Privée' : 'Publique'}{list.secret ? ' · Mode secret' : ''}</Text>
              <View style={styles.heroActions}>
                <Button title="Modifier" icon={Pencil} variant="secondary" onPress={openEditList} style={styles.flex} />
                <Button title="Supprimer" icon={Trash2} variant="ghost" onPress={deleteList} style={styles.flex} />
              </View>
            </View>
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

          {list.secret && !hasRevealed ? (
            <Button title="Révéler les réservations" icon={Eye} variant="secondary" onPress={revealReservations} fullWidth />
          ) : null}

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
              onCancelReservation={gift.status === 'reserved' && (!list.secret || hasRevealed) ? () => cancelReservation(gift) : undefined}
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

      <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier la liste</Text>
            <Field label="Titre" value={editTitle} onChangeText={setEditTitle} placeholder="Anniversaire, Noël…" />
            <Field label="Description" value={editDescription} onChangeText={setEditDescription} multiline placeholder="Description de votre liste…" />
            <Field label="Image (URL)" value={editImage} onChangeText={setEditImage} autoCapitalize="none" keyboardType="url" placeholder="https://…/photo.jpg" />
            <ImageUploadButton value={editImage} onChange={setEditImage} />
            <Pressable onPress={() => setEditPublic((v) => !v)} style={styles.switchRow} accessibilityRole="switch" accessibilityState={{ checked: editPublic }}>
              <View style={[styles.checkbox, editPublic && styles.checkboxOn]}>{editPublic ? <Text style={styles.check}>✓</Text> : null}</View>
              <Text style={styles.switchText}>Liste publique</Text>
            </Pressable>
            <Pressable onPress={() => setEditSecret((v) => !v)} style={styles.switchRow} accessibilityRole="switch" accessibilityState={{ checked: editSecret }}>
              <View style={[styles.checkbox, editSecret && styles.checkboxOn]}>{editSecret ? <Text style={styles.check}>✓</Text> : null}</View>
              <Text style={styles.switchText}>Mode secret</Text>
            </Pressable>
            <View style={styles.modalActions}>
              <Button title="Annuler" variant="ghost" onPress={() => setEditOpen(false)} style={styles.flex} />
              <Button title="Enregistrer" onPress={saveList} loading={editSaving} disabled={!editTitle.trim()} style={styles.flex} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  listHero: { gap: spacing.md },
  listCover: { width: '100%', aspectRatio: 16 / 9, borderRadius: 14, backgroundColor: colors.surfaceMuted },
  heroCopy: { gap: 5 },
  kicker: { color: colors.accent, fontSize: typography.caption, fontWeight: '700', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  count: { color: colors.textMuted, fontSize: typography.small, fontWeight: '500' },
  muted: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  error: { color: colors.danger, fontSize: typography.small },
  heroActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17,16,15,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: spacing.xl, gap: spacing.md },
  modalTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
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
