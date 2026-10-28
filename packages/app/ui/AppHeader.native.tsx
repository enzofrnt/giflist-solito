import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'react-native'
import { colors, spacing, typography } from './tokens'

export function AppHeader({
  title,
  onBack,
  right,
}: {
  title?: string
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Retour" style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}
        <Image source={require('app/assets/icon.png')} style={styles.mark} accessibilityLabel="Giftlist" />
        <Text style={styles.brand}>Giftlist</Text>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.right}>{right}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  mark: { width: 32, height: 32, borderRadius: 8 },
  brand: { fontSize: typography.heading, fontWeight: '700', color: colors.text },
  title: { fontSize: typography.small, color: colors.textMuted, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, lineHeight: 34, color: colors.text },
})
