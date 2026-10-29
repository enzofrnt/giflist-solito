import type { Gift, GiftList, GiftListWithCount, User } from 'app/types'
import { getAuthToken } from './authStorage'

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
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  me: () => request<{ user: User }>('/api/auth/me', { auth: true }),

  giftLists: () => request<{ giftLists: GiftListWithCount[] }>('/api/gift-lists', { auth: true }),

  giftList: (id: string | number) =>
    request<{ giftList: GiftList; gifts: Gift[] }>(`/api/gift-lists/${id}`, { auth: true }),

  createGiftList: (data: { title: string; description?: string; secret?: boolean }) =>
    request<{ giftList: GiftListWithCount }>('/api/gift-lists', {
      method: 'POST',
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
