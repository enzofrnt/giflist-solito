'use client'

import { useState, useMemo } from 'react'
import { getPasswordRules } from 'app/lib/passwordValidation'

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
}

interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
}

function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: '', color: 'gray' }
  }

  const rules = getPasswordRules(password)
  let score = 0

  // Calcul du score basé sur les règles
  if (rules.minLength) score++
  if (rules.hasLowercase) score++
  if (rules.hasUppercase) score++
  if (rules.hasNumber) score++
  if (rules.hasSpecial) score++

  // Normaliser le score sur 0-4
  const normalizedScore = Math.min(4, Math.floor(score * 0.8))

  const strengths: Record<number, PasswordStrength> = {
    0: { score: 0, label: 'Très faible', color: 'red' },
    1: { score: 1, label: 'Faible', color: 'orange' },
    2: { score: 2, label: 'Moyen', color: 'yellow' },
    3: { score: 3, label: 'Fort', color: 'green' },
    4: { score: 4, label: 'Très fort', color: 'emerald' }
  }

  return strengths[normalizedScore] || strengths[0]
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
  className = ''
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const strength = useMemo(() => calculatePasswordStrength(value), [value])

  // Règles correspondant exactement à la validation back-end (réutilisées depuis passwordValidation.ts)
  const rules = getPasswordRules(value)
  const passwordRules = [
    { check: rules.minLength, label: 'Au moins 8 caractères' },
    { check: rules.hasLowercase, label: 'Une minuscule' },
    { check: rules.hasUppercase, label: 'Une majuscule' },
    { check: rules.hasNumber, label: 'Un chiffre' },
    { check: rules.hasSpecial, label: 'Un caractère spécial' }
  ]

  const strengthColors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-600',
    gray: 'bg-gray-300'
  }

  const strengthTextColors = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    emerald: 'text-emerald-600',
    gray: 'text-gray-500'
  }

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${className}`}
          minLength={showGuide ? 8 : 6}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${strengthTextColors[strength.color as keyof typeof strengthTextColors]}`}>
              Robustesse : {strength.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength.color as keyof typeof strengthColors]}`}
              style={{ width: `${(strength.score / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showGuide && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <p className="font-medium mb-2">Règles de mot de passe :</p>
          <ul className="space-y-1">
            {passwordRules.map((rule, index) => (
              <li key={index} className={`flex items-center gap-2 ${rule.check ? 'text-green-600' : 'text-gray-500'}`}>
                {rule.check ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

