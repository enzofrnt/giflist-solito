import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, typography } from './tokens'

export function AppHeader({
  onBack,
  right,
}: {
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Retour" style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center} pointerEvents="none">
        <Image source={require('app/assets/mark.png')} style={styles.mark} accessibilityLabel="Giftlist" />
        <Text style={styles.brand}>Giftlist</Text>
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  side: { width: 92, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mark: { width: 32, height: 32, borderRadius: 8 },
  brand: { fontSize: typography.heading, fontWeight: '700', color: colors.text },
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, lineHeight: 34, color: colors.text },
})
