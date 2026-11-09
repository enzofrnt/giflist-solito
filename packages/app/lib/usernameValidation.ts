/**
 * Règles de validation du pseudo
 * Utilisées à la fois côté web, côté natif et côté serveur.
 *
 * Le pseudo conserve la casse saisie (affichage public), mais l'unicité et
 * toutes les recherches sont insensibles à la casse.
 */

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30

/** 3 à 30 caractères : lettres ASCII (majuscules et minuscules), chiffres et _. */
export const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/

export const USERNAME_HINT = '3 à 30 caractères : lettres, chiffres et _.'

export const USERNAME_ERROR = 'Le pseudo doit contenir 3 à 30 caractères (lettres, chiffres, _).'

/**
 * Filtre la saisie sans changer la casse : seuls les caractères autorisés sont
 * conservés, dans la limite de 30.
 */
export function sanitizeUsernameInput(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, '').slice(0, USERNAME_MAX)
}

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(value.trim())
}
