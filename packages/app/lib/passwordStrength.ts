/**
 * Password strength scoring shared by the web UI and future native surfaces.
 *
 * The underlying rules stay in `passwordValidation.ts` (also used by the API),
 * so the meter can never disagree with server-side validation. The scoring
 * fixes two defects of the previous inline implementation:
 *  - a non-empty, rule-less password no longer renders a 0%-width bar;
 *  - the label and the bar progress monotonically (no floor(score * 0.8)).
 */
import { getPasswordRules, type PasswordRules } from './passwordValidation'

export type PasswordStrengthTone = 'neutral' | 'weak' | 'fair' | 'medium' | 'strong' | 'excellent'

export interface PasswordStrength {
  /** 0 = very weak … 4 = very strong */
  level: 0 | 1 | 2 | 3 | 4
  label: string
  tone: PasswordStrengthTone
  /** Visible bar progress (minimum 10% for a non-empty password). */
  percent: number
  rulesPassed: number
  isEmpty: boolean
}

const LABELS = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'] as const
const TONES: PasswordStrengthTone[] = ['weak', 'fair', 'medium', 'strong', 'excellent']

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      level: 0,
      label: '',
      tone: 'neutral',
      percent: 0,
      rulesPassed: 0,
      isEmpty: true,
    }
  }

  const rules = getPasswordRules(password)
  const rulesPassed = countPassedRules(rules)
  const level = Math.max(0, Math.min(4, rulesPassed - 1)) as 0 | 1 | 2 | 3 | 4

  return {
    level,
    label: LABELS[level],
    tone: TONES[level],
    percent: level === 0 ? 10 : level * 25,
    rulesPassed,
    isEmpty: false,
  }
}

export function countPassedRules(rules: PasswordRules): number {
  return [
    rules.minLength,
    rules.hasLowercase,
    rules.hasUppercase,
    rules.hasNumber,
    rules.hasSpecial,
  ].filter(Boolean).length
}
