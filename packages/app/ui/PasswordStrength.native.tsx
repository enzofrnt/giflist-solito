import { StyleSheet, Text, View } from 'react-native'
import { calculatePasswordStrength } from 'app/lib/passwordStrength'
import { getPasswordRules } from 'app/lib/passwordValidation'
import { colors, radius, spacing, typography } from './tokens'

const RULES = [
  ['minLength', 'Au moins 8 caractères'],
  ['hasLowercase', 'Une minuscule'],
  ['hasUppercase', 'Une majuscule'],
  ['hasNumber', 'Un chiffre'],
  ['hasSpecial', 'Un caractère spécial'],
] as const

export function PasswordStrength({ password, showRules = true }: { password: string; showRules?: boolean }) {
  const strength = calculatePasswordStrength(password)
  const rules = getPasswordRules(password)
  const tone = strength.isEmpty
    ? colors.borderStrong
    : strength.level <= 1
      ? colors.danger
      : strength.level === 2
        ? colors.warning
        : colors.success

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: strength.isEmpty ? colors.textSubtle : tone }]}>
          Robustesse : {strength.isEmpty ? '—' : strength.label}
        </Text>
        <Text style={styles.hint}>{strength.rulesPassed}/5 règles</Text>
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 4, now: strength.level, text: strength.isEmpty ? 'Mot de passe vide' : strength.label }}
      >
        <View style={[styles.fill, { width: `${strength.percent}%`, backgroundColor: tone }]} />
      </View>
      {showRules ? (
        <View style={styles.rules}>
          {RULES.map(([key, label]) => {
            const met = rules[key]
            return (
              <Text key={key} style={[styles.rule, met && styles.ruleMet]}>
                {met ? '✓' : '•'} {label}
              </Text>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  label: { fontSize: typography.caption, fontWeight: '600' },
  hint: { color: colors.textSubtle, fontSize: typography.caption },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  rules: { gap: 2, marginTop: spacing.xs },
  rule: { color: colors.textSubtle, fontSize: typography.caption },
  ruleMet: { color: colors.success },
})
