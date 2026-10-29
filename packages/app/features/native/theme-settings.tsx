import { Check } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme, type ThemeMode } from 'app/theme/ThemeProvider.native'
import { ThemeIcon } from 'app/ui/ThemeIcon.native'
import { Card, spacing, typography } from 'app/ui'

const OPTIONS: Array<{ mode: ThemeMode; label: string; description: string }> = [
  { mode: 'light', label: 'Clair', description: 'Une interface lumineuse' },
  { mode: 'dark', label: 'Sombre', description: 'Repos pour les yeux' },
  { mode: 'system', label: 'Système', description: 'Suit votre appareil' },
]

export function ThemeSettings() {
  const { mode, colors: palette, setMode } = useTheme()

  return (
    <Card>
      <Text style={[styles.title, { color: palette.text }]}>Apparence</Text>
      <Text style={[styles.lead, { color: palette.textMuted }]}>Choisissez le thème de Giftlist.</Text>
      <View style={styles.options} role="radiogroup" aria-label="Thème">
        {OPTIONS.map((option) => {
          const selected = mode === option.mode
          return (
            <Pressable
              key={option.mode}
              onPress={() => setMode(option.mode)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.label}
              style={[
                styles.option,
                { borderColor: selected ? palette.primary : palette.border, backgroundColor: selected ? palette.primarySoft : palette.surface },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: selected ? palette.primary : palette.surfaceMuted }]}>
                <ThemeIcon mode={option.mode} size={18} color={selected ? palette.surface : palette.textMuted} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: palette.text }]}>{option.label}</Text>
                <Text style={[styles.description, { color: palette.textSubtle }]}>{option.description}</Text>
              </View>
              {selected ? <Check size={17} color={palette.primary} strokeWidth={2.2} /> : null}
            </Pressable>
          )
        })}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: typography.body, fontWeight: '700' },
  lead: { fontSize: typography.small, lineHeight: 19, marginTop: spacing.xs },
  options: { gap: spacing.sm, marginTop: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: 10, padding: spacing.md, minHeight: 60 },
  iconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 1 },
  label: { fontSize: typography.small, fontWeight: '600' },
  description: { fontSize: typography.caption },
})
