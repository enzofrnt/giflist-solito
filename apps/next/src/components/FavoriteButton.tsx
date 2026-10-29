'use client'

import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuthToken } from 'app/lib/authStorage'
import { useAuthContext } from '@/contexts/AuthContext'

export function FavoriteButton({
  shareCode,
  initialFavorite,
  withLabel = true,
  onChange,
}: {
  shareCode: string
  initialFavorite?: boolean
  withLabel?: boolean
  onChange?: (active: boolean) => void
}) {
  const { user } = useAuthContext()
  const [active, setActive] = useState(initialFavorite ?? false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (initialFavorite !== undefined || !user) return
    const token = getAuthToken()
    if (!token || token instanceof Promise) return
    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setActive(Boolean(data?.favorites?.some((favorite: { list: { shareCode: string } }) => favorite.list.shareCode === shareCode))))
      .catch(() => undefined)
  }, [initialFavorite, shareCode, user])

  if (!user) return null

  async function toggle() {
    const token = getAuthToken()
    if (!token || token instanceof Promise || busy) return
    setBusy(true)
    try {
      const response = await fetch(active ? `/api/favorites/${encodeURIComponent(shareCode)}` : '/api/favorites', {
        method: active ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: active ? undefined : JSON.stringify({ shareCode }),
      })
      if (response.ok) {
        const next = !active
        setActive(next)
        onChange?.(next)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`ds-favorite-btn${withLabel ? ' ds-favorite-btn--label' : ''}`}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} strokeWidth={2} aria-hidden="true" />
      {withLabel ? <span>{busy ? '…' : active ? 'Favori' : 'Ajouter aux favoris'}</span> : null}
    </button>
  )
}
