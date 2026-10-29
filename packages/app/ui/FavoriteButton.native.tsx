import { Heart } from 'lucide-react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { radius, spacing, typography } from './tokens'

export function FavoriteButton({
  active,
  onPress,
  withLabel = false,
  busy = false,
  accessibilityLabel,
}: {
  active: boolean
  onPress: () => void
  withLabel?: boolean
  busy?: boolean
  accessibilityLabel?: string
}) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (active ? 'Retirer des favoris' : 'Ajouter aux favoris')}
      accessibilityState={{ selected: active, disabled: busy }}
      style={[
        styles.button,
        withLabel && styles.withLabel,
        { backgroundColor: active ? colors.favoriteSoft : 'transparent', borderColor: active ? colors.favoriteBorder : colors.border },
      ]}
    >
      <Heart size={17} color={colors.favorite} fill={active ? colors.favorite : 'transparent'} strokeWidth={2} />
      {withLabel ? <Text style={[styles.label, { color: colors.favorite }]}>{active ? 'Favori' : 'Ajouter aux favoris'}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, borderWidth: 1 },
  withLabel: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.sm },
  label: { fontSize: typography.caption, fontWeight: '700' },
})
