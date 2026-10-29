import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Check, X } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import type { RootStackParamList } from 'app/navigation/native'
import { api } from 'app/lib/api'
import { AppHeader, Button, Card, Field, ImageUploadButton, Screen, colors, spacing, typography } from 'app/ui'

type Props = NativeStackScreenProps<RootStackParamList, 'giftForm'>

export function GiftFormScreen({ navigation, route }: Props) {
  const { listId, gift } = route.params
  const [title, setTitle] = useState(gift?.title ?? '')
  const [url, setUrl] = useState(gift?.url ?? '')
  const [image, setImage] = useState(gift?.image ?? '')
  const [price, setPrice] = useState(gift?.price != null ? String(gift.price) : '')
  const [description, setDescription] = useState(gift?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        url: url.trim() || undefined,
        image: image.trim() || undefined,
        price: price.trim() ? Number(price.replace(',', '.')) : undefined,
        description: description.trim() || undefined,
      }
      if (gift) {
        await api.updateGift(listId, gift.id, payload)
      } else {
        await api.createGift(listId, payload)
      }
      navigation.goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen header={<AppHeader onBack={() => navigation.goBack()} />}>
      <Card>
        <Text style={styles.title}>{gift ? 'Modifier le cadeau' : 'Ajouter un cadeau'}</Text>
        <Text style={styles.lead}>{gift ? 'Ajustez les informations puis enregistrez.' : 'Ajoutez une envie à votre liste.'}</Text>
        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Casque audio…" />
        <Field label="Lien produit" value={url} onChangeText={setUrl} autoCapitalize="none" keyboardType="url" placeholder="https://…" />
        <Field label="Image (URL)" value={image} onChangeText={setImage} autoCapitalize="none" keyboardType="url" placeholder="https://…/photo.jpg" />
        <ImageUploadButton onChange={setImage} />
        <Field label="Prix (€)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="29,90" />
        <Field label="Description" value={description} onChangeText={setDescription} multiline placeholder="Optionnel" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button title="Annuler" icon={X} variant="ghost" onPress={() => navigation.goBack()} style={styles.flex} />
          <Button title={gift ? 'Enregistrer' : 'Ajouter'} icon={Check} onPress={save} loading={saving} disabled={!title.trim()} style={styles.flex} />
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
  lead: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  error: { color: colors.danger, fontSize: typography.small },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
})
