import { Image, StyleSheet, Text, View } from 'react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { radius, spacing, typography } from './tokens'

export function AuthBrand() {
  const { colors } = useTheme()
  return (
    <View style={styles.wrap}>
      <Image source={require('app/assets/mark.png')} style={styles.mark} accessibilityLabel="Giftlist" />
      <Text style={[styles.wordmark, { color: colors.text }]}>Giftlist</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  mark: { width: 48, height: 48, borderRadius: radius.md },
  wordmark: { fontSize: typography.heading, fontWeight: '800', letterSpacing: -0.4 },
})
