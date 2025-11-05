/**
 * Types relatifs aux listes de cadeaux
 */

import type { User, UserPublic } from './User'

/**
 * Liste de cadeaux
 */
export interface GiftList {
  id: number
  title: string
  description?: string
  image?: string
  shareCode: string
  secret: boolean
  createdAt: string
  user: User | UserPublic
}

/**
 * Liste de cadeaux avec le nombre de cadeaux (pour le dashboard)
 * N'inclut pas les informations de l'utilisateur car non nécessaires dans ce contexte
 */
export interface GiftListWithCount {
  id: number
  title: string
  description?: string
  image?: string
  shareCode: string
  secret: boolean
  createdAt: string
  giftsCount: number
}

