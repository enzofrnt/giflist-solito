import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, typography } from './tokens'

type Tone = 'neutral' | 'success' | 'warning' | 'danger'

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.badge, styles[tone]]}>
      <Text style={[styles.text, tone !== 'neutral' && styles.textColored]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  neutral: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  success: { backgroundColor: colors.successSoft, borderColor: colors.success },
  warning: { backgroundColor: colors.warningSoft, borderColor: colors.warning },
  danger: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  text: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '600' },
  textColored: { color: colors.text },
})
