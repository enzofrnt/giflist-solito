import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ImagePlus } from 'lucide-react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { api } from 'app/lib/api'
import { colors, spacing, typography } from './tokens'

export function ImageUploadButton({ onChange, label = 'Téléverser une image' }: { onChange: (url: string) => void; label?: string }) {
  const { colors: palette } = useTheme()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick() {
    setError('')
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) { setError('Autorisez l’accès aux photos pour téléverser une image.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    setBusy(true)
    try {
      const uploaded = await api.uploadImage(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'image.jpg')
      onChange(uploaded.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable onPress={pick} disabled={busy} accessibilityRole="button" accessibilityLabel={label} style={[styles.button, { borderColor: palette.border }]}>
        <ImagePlus size={17} color={palette.primary} />
        <Text style={[styles.label, { color: palette.primary }]}>{busy ? 'Envoi…' : label}</Text>
      </Pressable>
      <Text style={[styles.hint, { color: palette.textSubtle }]}>JPG, PNG, WebP ou GIF · 5 Mo max.</Text>
      {error ? <Text style={[styles.hint, { color: palette.danger }]}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  button: { minHeight: 44, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md },
  label: { fontSize: typography.small, fontWeight: '700' },
  hint: { fontSize: typography.caption, lineHeight: 17 },
})
