'use client'

import { useState, useMemo } from 'react'
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
        >
          {showPassword ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 3 18 18" />
              <path d="M10.6 6.1A10 10 0 0 1 12 6c3.9 0 7.3 2 9.5 6a12 12 0 0 1-2.4 3.1M6.3 6.8A12.4 12.4 0 0 0 2.5 12c2.2 4.2 5.6 6.2 9.5 6.2 1.2 0 2.4-.2 3.5-.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2.5 12c2.2-4.2 5.6-6.2 9.5-6.2S19.3 7.8 21.5 12c-2.2 4.2-5.6 6.2-9.5 6.2S4.7 16.2 2.5 12Z" />
              <circle cx="12" cy="12" r="2.7" />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value ? (
        <div className="ds-strength" data-level={strength.level}>
          <div className="ds-strength__header">
            <span className="ds-strength__label" aria-live="polite">
              Robustesse : {strength.label}
            </span>
            <span className="ds-strength__hint">{strength.rulesPassed}/5 règles</span>
          </div>
          <div
            className="ds-strength__track"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={strength.level}
            aria-valuetext={strength.label}
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
