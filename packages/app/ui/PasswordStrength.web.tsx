import { calculatePasswordStrength } from 'app/lib/passwordStrength'

export function PasswordStrength({ password, showRules = true }: { password: string; showRules?: boolean }) {
  const strength = calculatePasswordStrength(password)
  return (
    <div className="ds-strength" data-level={strength.isEmpty ? 'empty' : strength.level}>
      <div className="ds-strength__header">
        <span className="ds-strength__label">Robustesse : {strength.isEmpty ? '—' : strength.label}</span>
        <span className="ds-strength__hint">{strength.rulesPassed}/5 règles</span>
      </div>
      <div className="ds-strength__track" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength.level}>
        <div className="ds-strength__fill" style={{ width: `${strength.percent}%` }} />
      </div>
    </div>
  )
}
