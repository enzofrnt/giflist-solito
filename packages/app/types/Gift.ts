/**
 * Types relatifs aux cadeaux
 */

/**
 * Cadeau dans une liste
 */
export interface Gift {
  id: number
  title: string
  url?: string
  image?: string
  price?: number
  description?: string
  status: 'available' | 'reserved'
  reservedBy?: string
  reservedByName?: string
  reservedByEmail?: string
  reservedAt?: string
  createdAt: string
  updatedAt: string
}

