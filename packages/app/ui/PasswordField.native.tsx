import { Eye, EyeOff } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { useState } from 'react'
import { colors, radius, spacing, typography } from './tokens'

interface PasswordFieldProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string
  hint?: string
  error?: string
}

export function PasswordField({ label, hint, error, style, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrap}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={!visible}
          style={[styles.input, error ? styles.inputError : null, style]}
          {...inputProps}
        />
        <Pressable
          onPress={() => setVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          accessibilityState={{ selected: visible }}
          style={styles.toggle}
          hitSlop={4}
        >
          {visible
            ? <EyeOff size={20} color={colors.textMuted} strokeWidth={1.8} />
            : <Eye size={20} color={colors.textMuted} strokeWidth={1.8} />}
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { color: colors.text, fontSize: typography.small, fontWeight: '600' },
  wrap: { position: 'relative' },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    paddingRight: 48,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: typography.body,
  },
  inputError: { borderColor: colors.danger },
  toggle: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, alignItems: 'center', justifyContent: 'center' },
  hint: { color: colors.textSubtle, fontSize: typography.caption },
  error: { color: colors.danger, fontSize: typography.caption },
})
