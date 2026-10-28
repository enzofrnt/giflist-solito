import { getPasswordRules } from 'app/lib/passwordValidation'
import { calculatePasswordStrength } from 'app/lib/passwordStrength'

export function StrengthMeter({
  value,
  compact = false,
}: {
  value: string
  compact?: boolean
}) {
  const strength = calculatePasswordStrength(value)

  return (
    <div className={`ds-strength${compact ? ' ds-strength--compact' : ''}`} data-level={strength.level}>
      <div className="ds-strength__header">
        <span className="ds-strength__label" aria-live="polite">
          {strength.isEmpty ? 'Robustesse du mot de passe' : `Robustesse : ${strength.label}`}
        </span>
        <span className="ds-strength__hint">{strength.rulesPassed}/5 règles</span>
      </div>
      <div
        className="ds-strength__track"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strength.level}
        aria-valuetext={strength.isEmpty ? 'Aucun mot de passe' : strength.label}
        aria-label="Robustesse du mot de passe"
      >
        <div className="ds-strength__fill" style={{ width: `${strength.percent}%` }} />
      </div>
      {compact ? null : <StrengthRules value={value} />}
    </div>
  )
}

export function StrengthRules({ value }: { value: string }) {
  const rules = getPasswordRules(value)
  const items = [
    { label: 'Au moins 8 caractères', met: rules.minLength },
    { label: 'Une minuscule', met: rules.hasLowercase },
    { label: 'Une majuscule', met: rules.hasUppercase },
    { label: 'Un chiffre', met: rules.hasNumber },
    { label: 'Un caractère spécial', met: rules.hasSpecial },
  ]

  return (
    <ul className="ds-strength__rules">
      {items.map((rule) => (
        <li key={rule.label} className="ds-strength__rule" data-met={rule.met}>
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
