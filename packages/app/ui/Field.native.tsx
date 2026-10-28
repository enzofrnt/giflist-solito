import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { colors, radius, spacing, typography } from './tokens'

interface FieldProps extends TextInputProps {
  label: string
  hint?: string
  error?: string
}

export function Field({ label, hint, error, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.text, fontSize: typography.small, fontWeight: '600' },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: typography.body,
  },
  inputError: { borderColor: colors.danger },
  hint: { color: colors.textSubtle, fontSize: typography.caption },
  error: { color: colors.danger, fontSize: typography.caption },
})
