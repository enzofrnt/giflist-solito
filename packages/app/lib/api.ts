import type { Gift, GiftList, GiftListWithCount, User } from 'app/types'
import { getAuthToken } from './authStorage'

export type PublicListSummary = {
  shareCode: string
  title: string
  description?: string | null
  image?: string | null
  giftsCount: number
  createdAt: string
}

export type FavoriteSummary = {
  createdAt: string
  list: {
    shareCode: string
    title: string
    description?: string | null
    image?: string | null
    isPublic: boolean
    createdAt: string
    owner: { username: string }
    giftsCount: number
  }
}

export type SearchPayload = {
  ok: boolean
  list: {
    shareCode: string
    title: string
    description?: string | null
    isPublic: boolean
    owner: { username: string | null }
  } | null
  users: Array<{ username: string; publicListsCount: number }>
}

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'
).replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers, ...rest } = options
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(headers as Record<string, string> | undefined),
  }

  if (auth) {
    const token = await getAuthToken()
    if (!token) throw new ApiError('Session expirée, reconnectez-vous.', 401)
    requestHeaders.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(`Impossible de joindre l’API (${API_URL}).`, 0)
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(payload?.error || 'Une erreur est survenue.', response.status)
  }
  return payload as T
}

export const api = {
  uploadImage: async (uri: string, type = 'image/jpeg', name = 'image.jpg') => {
    const token = await getAuthToken()
    if (!token) throw new ApiError('Session expirée, reconnectez-vous.', 401)
    const form = new FormData()
    form.append('file', { uri, type, name } as unknown as Blob)
    const response = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) throw new ApiError(payload?.error || 'Envoi de l’image impossible.', response.status)
    return payload as { ok: boolean; url: string }
  },

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (name: string, email: string, password: string, username: string) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password, username },
    }),

  me: () => request<{ user: User }>('/api/auth/me', { auth: true }),

  favorites: () => request<{ ok: boolean; favorites: FavoriteSummary[] }>('/api/favorites', { auth: true }),

  addFavorite: (shareCode: string) => request<{ ok: boolean }>(
    '/api/favorites',
    { method: 'POST', auth: true, body: { shareCode } },
  ),

  removeFavorite: (shareCode: string) => request<{ ok: boolean }>(
    `/api/favorites/${encodeURIComponent(shareCode)}`,
    { method: 'DELETE', auth: true },
  ),

  search: (q: string) =>
    request<SearchPayload>(`/api/search?q=${encodeURIComponent(q)}`, { method: 'GET' }),

  publicUser: (username: string) =>
    request<{ ok: boolean; user: { username: string }; giftLists: PublicListSummary[] }>(`/api/users/${encodeURIComponent(username)}`, { method: 'GET' }),

  updateProfile: (data: { name: string; username?: string; isPublic?: boolean }) =>
    request<{ success: boolean; user: User }>('/api/auth/profile', {
      method: 'PUT',
      auth: true,
      body: data,
    }),

  giftLists: () => request<{ giftLists: GiftListWithCount[] }>('/api/gift-lists', { auth: true }),

  giftList: (id: string | number) =>
    request<{ giftList: GiftList; gifts: Gift[] }>(`/api/gift-lists/${id}`, { auth: true }),

  createGiftList: (data: { title: string; description?: string; image?: string; secret?: boolean; isPublic?: boolean }) =>
    request<{ giftList: GiftListWithCount }>('/api/gift-lists', {
      method: 'POST',
      auth: true,
      body: data,
    }),

  updateGiftList: (id: string | number, data: { title: string; description?: string; secret?: boolean; isPublic?: boolean }) =>
    request<{ giftList: GiftListWithCount }>(`/api/gift-lists/${id}`, {
      method: 'PUT',
      auth: true,
      body: data,
    }),

  createGift: (listId: string | number, data: { title: string; url?: string; image?: string; price?: number; description?: string }) =>
    request<{ gift: Gift }>(`/api/gift-lists/${listId}/gifts`, {
      method: 'POST',
      auth: true,
      body: data,
    }),

  updateGift: (
    listId: string | number,
    giftId: number,
    data: { title: string; url?: string; image?: string; price?: number; description?: string },
  ) =>
    request<{ gift: Gift }>(`/api/gift-lists/${listId}/gifts/${giftId}`, {
      method: 'PUT',
      auth: true,
      body: data,
    }),

  deleteGift: (listId: string | number, giftId: number) =>
    request<{ ok: boolean }>(`/api/gift-lists/${listId}/gifts/${giftId}`, {
      method: 'DELETE',
      auth: true,
    }),

  requestEmailChange: (email: string, currentPassword: string) =>
    request<{ ok: boolean; message: string }>('/api/auth/email-change/request', {
      method: 'POST',
      auth: true,
      body: { email, currentPassword },
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ token: string; message: string }>('/api/auth/change-password', {
      method: 'PUT',
      auth: true,
      body: { currentPassword, newPassword },
    }),

  publicGiftList: (shareCode: string) =>
    request<{ giftList: GiftList; gifts: Gift[] }>(`/api/public/gift-lists/${encodeURIComponent(shareCode)}`),

  reserveGift: (
    shareCode: string,
    giftId: number,
    payload: { name: string; email?: string; message?: string; anonymous?: boolean },
  ) =>
    request<{ ok: boolean }>(`/api/public/gift-lists/${encodeURIComponent(shareCode)}/gifts/${giftId}/reserve`, {
      method: 'POST',
      body: payload,
    }),
}
