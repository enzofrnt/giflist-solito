import { useState } from 'react'
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import { Copy, Share2, X } from 'lucide-react-native'
import * as Clipboard from 'expo-clipboard'
import QRCode from 'react-native-qrcode-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { Button } from './Button.native'
import { radius, spacing, typography } from './tokens'

export function ShareSheet({
  visible,
  title,
  url,
  onClose,
}: {
  visible: boolean
  title: string
  url: string
  onClose: () => void
}) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [copied, setCopied] = useState(false)

  async function copy() {
    await Clipboard.setStringAsync(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function share() {
    await Share.share({ title, message: url }).catch(() => undefined)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer le partage" />
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.head}>
            <View style={styles.flex}>
              <Text style={[styles.kicker, { color: colors.textMuted }]}>PARTAGER LA LISTE</Text>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            </View>
            <Pressable onPress={onClose} style={[styles.close, { borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Fermer">
              <X size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={[styles.qrWrap, { backgroundColor: '#ffffff' }]} accessibilityLabel="QR code de partage">
            <QRCode value={url} size={220} color="#11100f" backgroundColor="#ffffff" />
          </View>

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Scannez ce QR code ou envoyez le lien. Aucun compte n’est nécessaire pour réserver.
          </Text>
          <Text style={[styles.url, { color: colors.textSubtle, borderColor: colors.border }]} numberOfLines={1}>{url}</Text>

          <View style={styles.actions}>
            <Button title={copied ? 'Lien copié' : 'Copier le lien'} icon={Copy} variant="secondary" onPress={copy} style={styles.flex} />
            <Button title="Partager" icon={Share2} onPress={share} style={styles.flex} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(17,16,15,0.58)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.lg },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  flex: { flex: 1 },
  kicker: { fontSize: typography.caption, fontWeight: '700', letterSpacing: 1.1 },
  title: { fontSize: typography.heading, fontWeight: '800', marginTop: 3 },
  close: { width: 40, height: 40, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qrWrap: { alignSelf: 'center', padding: 18, borderRadius: radius.lg },
  hint: { fontSize: typography.small, lineHeight: 19, textAlign: 'center' },
  url: { fontSize: typography.caption, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
})
