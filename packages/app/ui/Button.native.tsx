import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { colors, radius, spacing, typography } from './tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  icon?: LucideIcon
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  icon: Icon,
}: ButtonProps) {
  const { colors: palette } = useTheme()
  const isDisabled = disabled || loading
  const iconColor = variant === 'primary' || variant === 'danger' ? palette.surface : palette.primary
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' ? palette.surface : palette.primary} /> : null}
        {!loading && Icon ? <Icon size={18} strokeWidth={1.9} color={iconColor} /> : null}
        <Text style={[styles.label, variant === 'primary' || variant === 'danger' ? styles.labelOnColor : styles.labelDark]}>{title}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontSize: typography.body, fontWeight: '600' },
  labelOnColor: { color: colors.surface },
  labelDark: { color: colors.text },
})
