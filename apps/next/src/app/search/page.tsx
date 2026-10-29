'use client'

import { Search as SearchIcon, ArrowRight, Heart, ListChecks } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { FavoriteSummary, SearchPayload } from 'app/lib/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAuthToken } from 'app/lib/authStorage'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<FavoriteSummary[]>([])
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user) { setFavorites([]); return }
    const token = getAuthToken()
    if (!token || token instanceof Promise) return
    fetch('/api/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setFavorites(data?.favorites ?? []))
      .catch(() => undefined)
  }, [user])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResult(null); setError(''); return }
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setLoading(true); setError('')
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
        const data = await response.json()
        if (!cancelled) data.ok ? setResult(data) : setError(data.error || 'Recherche indisponible.')
      } catch {
        if (!cancelled) setError('Recherche momentanément indisponible.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [query])

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <header className="ds-page-header">
          <div className="ds-page-header__copy">
            <span className="ds-page-kicker">Découvrir</span>
            <h1 className="ds-page-title">Recherche</h1>
            <p className="ds-page-subtitle">Un pseudo ou un code de liste. Les comptes publics apparaissent ici.</p>
          </div>
        </header>

        <div className="ds-card">
          <div className="ds-card__body">
            <label htmlFor="search-q" className="ds-label">Pseudo ou code de liste</label>
            <div className="ds-search-field">
              <SearchIcon size={18} aria-hidden="true" />
              <input
                id="search-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ds-input ds-search-field__input"
                placeholder="enzo ou A1B2C3D4"
                autoComplete="off"
                aria-describedby="search-hint"
              />
            </div>
            <p className="ds-hint" id="search-hint">Le code complet ouvre la liste directement, même si elle est privée.</p>
          </div>
        </div>

        {favorites.length > 0 ? (
          <section className="ds-stack ds-stack--gap-3">
            <h2 className="ds-h3" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={17} fill="currentColor" color="var(--ds-color-accent)" aria-hidden="true" />
              Favoris
            </h2>
            {favorites.map((favorite) => (
              <Link key={favorite.list.shareCode} href={`/list/${favorite.list.shareCode}`} className="ds-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="ds-card__body ds-cluster" style={{ justifyContent: 'space-between' }}>
                  <div className="ds-stack ds-stack--gap-1">
                    <strong>{favorite.list.title}</strong>
                    <span className="ds-hint">@{favorite.list.owner.username} · {favorite.list.giftsCount} cadeau{favorite.list.giftsCount > 1 ? 'x' : ''}</span>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </section>
        ) : null}

        {loading ? <p className="ds-body-sm ds-text-muted" role="status">Recherche…</p> : null}
        {error ? <p className="ds-error" role="alert">{error}</p> : null}

        {result?.list ? (
          <section className="ds-card">
            <div className="ds-card__body">
              <span className="ds-overline">Liste trouvée</span>
              <h2 className="ds-card__title">{result.list.title}</h2>
              {result.list.description ? <p className="ds-body-sm ds-text-muted">{result.list.description}</p> : null}
              <p className="ds-hint">Par {result.list.owner.username ? `@${result.list.owner.username}` : 'un membre'}</p>
              <Link href={`/list/${result.list.shareCode}`} className="ds-btn ds-btn--primary ds-btn--md">
                <ArrowRight size={16} className="ds-btn__icon" aria-hidden="true" />
                Ouvrir la liste
              </Link>
            </div>
          </section>
        ) : null}

        {!result?.list && result?.users.length ? (
          <section className="ds-stack ds-stack--gap-3">
            <h2 className="ds-h3">Comptes publics</h2>
            {result.users.map((user) => (
              <Link key={user.username} href={`/u/${user.username}`} className="ds-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="ds-card__body ds-cluster" style={{ justifyContent: 'space-between' }}>
                  <div className="ds-stack ds-stack--gap-1">
                    <strong>@{user.username}</strong>
                    <span className="ds-hint">{user.publicListsCount} liste{user.publicListsCount > 1 ? 's' : ''} publique{user.publicListsCount > 1 ? 's' : ''}</span>
                  </div>
                  <span className="ds-hint">{user.publicListsCount} liste{user.publicListsCount > 1 ? 's' : ''} publique{user.publicListsCount > 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </section>
        ) : null}

        {!loading && query.trim().length >= 2 && result && !result.list && result.users.length === 0 ? (
          <p className="ds-body-sm ds-text-muted">Aucun compte public ne correspond à « {query.trim()} ».</p>
        ) : null}
      </main>
    </div>
  )
}
