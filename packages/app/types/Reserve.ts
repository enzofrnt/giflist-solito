/**
 * Types relatifs à la réservation de cadeaux
 */

/**
 * Payload de réservation d'un cadeau
 */
export interface ReservePayload {
  name: string
  email?: string
  message?: string
  anonymous?: boolean
}

