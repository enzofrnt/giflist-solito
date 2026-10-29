import { Share2 } from 'lucide-react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { radius, spacing, typography } from './tokens'

export function ShareAction({ onPress, label = 'Partager' }: { onPress: () => void; label?: string }) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
        pressed && styles.pressed,
      ]}
    >
      <Share2 size={15} color={colors.primary} strokeWidth={2} />
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  label: { fontSize: typography.caption, fontWeight: '700' },
  pressed: { opacity: 0.7 },
})
