/**
 * Règles de validation du mot de passe
 * Utilisées à la fois côté client et serveur
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PasswordRules {
  minLength: boolean
  hasLowercase: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

/**
 * Vérifie si un mot de passe respecte toutes les règles
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }

  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Obtient l'état de chaque règle du mot de passe
 */
export function getPasswordRules(password: string): PasswordRules {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)
  }
}

/**
 * Valide un mot de passe avec Zod
 * Retourne une erreur Zod formatée pour la validation de schéma
 */
export function validatePasswordForZod(password: string): { success: true } | { success: false; error: string } {
  const validation = validatePassword(password)
  
  if (validation.isValid) {
    return { success: true }
  }
  
  return { success: false, error: validation.errors[0] }
}
