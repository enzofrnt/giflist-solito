import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEffect, useState } from 'react'
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import { Gift as GiftIcon } from 'lucide-react-native'
import type { Gift, GiftList } from 'app/types'
import type { RootStackParamList } from 'app/navigation/native'
import { API_URL, api } from 'app/lib/api'
import { AppHeader, Badge, Button, Card, Field, Screen, ShareAction, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'public'>

export function PublicListScreen({ navigation, route }: Props) {
  const initialCode = route.params?.shareCode ?? ''
  const [code, setCode] = useState(initialCode)
  const [list, setList] = useState<GiftList | null>(null)
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Gift | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reserving, setReserving] = useState(false)

  async function load(shareCode = code) {
    if (!shareCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.publicGiftList(shareCode.trim())
      setList(data.giftList)
      setGifts(data.gifts)
      setCode(data.giftList.shareCode)
    } catch (err) {
      setList(null)
      setError(err instanceof Error ? err.message : 'Liste introuvable')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCode) void load(initialCode)
    // The code is a route capability when coming from search/profile; load it once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode])

  async function reserve() {
    if (!list || !selected || !name.trim()) return
    setReserving(true)
    setError('')
    try {
      await api.reserveGift(list.shareCode, selected.id, {
        name: name.trim(),
        email: email.trim() || undefined,
      })
      setGifts((current) => current.map((gift) => gift.id === selected.id ? { ...gift, status: 'reserved', reservedByName: name.trim() } : gift))
      setSelected(null)
      setName('')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Réservation impossible')
    } finally {
      setReserving(false)
    }
  }

  async function shareList() {
    if (!list) return
    await Share.share({ title: list.title, message: `${list.title} — ${API_URL}/list/${list.shareCode}` }).catch(() => undefined)
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

      {!initialCode ? (
        <Card>
          <Field label="Code de partage" value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="Ex. A1B2C3D4" />
          <Button title={loading ? 'Ouverture…' : 'Ouvrir la liste'} onPress={() => load()} loading={loading} disabled={!code.trim()} fullWidth />
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {list ? (
        <>
          <View>
            <Text style={styles.title}>{list.title}</Text>
            {list.description ? <Text style={styles.muted}>{list.description}</Text> : null}
            <Text style={styles.meta}>Par {list.user?.username ? `@${list.user.username}` : 'un proche'} · {gifts.length} cadeau{gifts.length > 1 ? 'x' : ''}</Text>
          </View>

          {gifts.map((gift) => {
            const reserved = gift.status === 'reserved'
            return (
              <Card key={gift.id}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{gift.title}</Text>
                  <Badge label={reserved ? 'Réservé' : 'Disponible'} tone={reserved ? 'warning' : 'success'} />
                </View>
                {gift.price != null ? <Text style={styles.meta}>{gift.price} €</Text> : null}
                {gift.description ? <Text style={styles.muted}>{gift.description}</Text> : null}
                {!reserved ? <Button title="Réserver ce cadeau" icon={GiftIcon} onPress={() => setSelected(gift)} fullWidth /> : null}
              </Card>
            )
          })}
        </>
      ) : null}

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Réserver « {selected?.title} »</Text>
            <Field label="Votre nom" value={name} onChangeText={setName} autoComplete="name" />
            <Field label="Votre e-mail (optionnel)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Button title="Confirmer la réservation" onPress={reserve} loading={reserving} disabled={!name.trim()} fullWidth />
            <Button title="Annuler" variant="ghost" onPress={() => setSelected(null)} fullWidth />
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  error: { color: colors.danger, fontSize: typography.small },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700', flex: 1 },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  linkText: { color: colors.primary, fontSize: typography.small, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(27,25,23,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl, gap: spacing.md },
  modalTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
})
