'use client'

import { useState, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { getPasswordRules } from 'app/lib/passwordValidation'
import { calculatePasswordStrength } from 'app/lib/passwordStrength'

interface PasswordInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  showStrength?: boolean
  showGuide?: boolean
  required?: boolean
  className?: string
  autoComplete?: string
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Votre mot de passe',
  showStrength = false,
  showGuide = false,
  required = false,
  className = '',
  autoComplete,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const strength = useMemo(() => calculatePasswordStrength(value), [value])
  const rules = getPasswordRules(value)

  const passwordRules = [
    { check: rules.minLength, label: 'Au moins 8 caractères' },
    { check: rules.hasLowercase, label: 'Une minuscule' },
    { check: rules.hasUppercase, label: 'Une majuscule' },
    { check: rules.hasNumber, label: 'Un chiffre' },
    { check: rules.hasSpecial, label: 'Un caractère spécial' },
  ]

  return (
    <div className="ds-stack ds-stack--gap-2">
      <div className="ds-input-wrap">
        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`ds-input ${className}`.trim()}
          minLength={showGuide ? 8 : undefined}
        />
        <button
          type="button"
          className="ds-icon-btn ds-input-wrap__action"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={19} strokeWidth={1.8} aria-hidden="true" /> : <Eye size={19} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      </div>

      {showStrength ? (
        <div className="ds-strength" data-level={strength.isEmpty ? 'empty' : strength.level}>
          <div className="ds-strength__header">
            <span className="ds-strength__label" aria-live="polite">
              Robustesse : {strength.isEmpty ? '—' : strength.label}
            </span>
            <span className="ds-strength__hint">{strength.rulesPassed}/5 règles</span>
          </div>
          <div
            className="ds-strength__track"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={strength.level}
            aria-valuetext={strength.isEmpty ? 'Mot de passe vide' : strength.label}
            aria-label="Robustesse du mot de passe"
          >
            <div className="ds-strength__fill" style={{ width: `${strength.percent}%` }} />
          </div>
        </div>
      ) : null}

      {showGuide ? (
        <div className="ds-stack ds-stack--gap-1">
          <p className="ds-label">Règles de mot de passe</p>
          <ul className="ds-strength__rules">
            {passwordRules.map((rule) => (
              <li key={rule.label} className="ds-strength__rule" data-met={rule.check}>
                {rule.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
