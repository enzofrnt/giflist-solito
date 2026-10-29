'use client'

import { Search as SearchIcon, ArrowRight, Heart, ListChecks } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { FavoriteSummary, SearchPayload } from 'app/lib/api'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAuthToken } from 'app/lib/authStorage'
import { FavoriteButton } from '@/components/FavoriteButton'

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
    const initial = new URLSearchParams(window.location.search).get('q')
    if (initial) setQuery(initial)
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (query.trim()) url.searchParams.set('q', query.trim())
    else url.searchParams.delete('q')
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
  }, [query])

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

        {favorites.length > 0 ? (
          <section className="ds-stack ds-stack--gap-3">
            <h2 className="ds-h3" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={17} fill="currentColor" color="var(--ds-color-favorite)" aria-hidden="true" />
              Favoris
            </h2>
            <div className="ds-favorites-row">
            {favorites.map((favorite) => (
              <article key={favorite.list.shareCode} className="ds-card ds-favorite-shortcut">
                <div className="ds-card__body ds-cluster" style={{ justifyContent: 'space-between' }}>
                  <Link href={`/list/${favorite.list.shareCode}`} className="ds-stack ds-stack--gap-1" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{favorite.list.title}</strong>
                    <span className="ds-hint">@{favorite.list.owner.username} · {favorite.list.giftsCount} cadeau{favorite.list.giftsCount > 1 ? 'x' : ''}</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <FavoriteButton
                      shareCode={favorite.list.shareCode}
                      initialFavorite
                      withLabel={false}
                      onChange={(active) => {
                        if (!active) setFavorites((current) => current.filter((item) => item.list.shareCode !== favorite.list.shareCode))
                      }}
                    />
                    <Link href={`/list/${favorite.list.shareCode}`} aria-label="Ouvrir la liste"><ArrowRight size={17} aria-hidden="true" /></Link>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </section>
        ) : null}

        {favorites.length > 0 ? <hr className="ds-search-separator" /> : null}

        <div className="ds-search-hero">
          <div className="ds-search-field ds-search-field--hero">
            <SearchIcon size={20} aria-hidden="true" />
            <input
              id="search-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ds-input ds-search-field__input"
              placeholder="Rechercher un pseudo ou un code de liste"
              autoComplete="off"
              aria-describedby="search-hint"
              aria-label="Rechercher un pseudo ou un code de liste"
            />
          </div>
          <p className="ds-hint" id="search-hint">Le code complet ouvre la liste directement, même si elle est privée.</p>
        </div>

        <div className="ds-search-results">
        {loading ? <p className="ds-body-sm ds-text-muted" role="status">Recherche…</p> : null}
        {error ? <p className="ds-error" role="alert">{error}</p> : null}

        {result && (result.list || result.users.length) ? (
          <section className="ds-search-results-panel" aria-label="Résultats de recherche">
            <div className="ds-search-results__header">
              <h2 className="ds-search-results__title">Résultats pour « {query.trim()} »</h2>
              <span className="ds-search-results__count">
                {result.list
                  ? '1 liste'
                  : `${result.users.length} compte${result.users.length > 1 ? 's' : ''} public${result.users.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="ds-search-result-list">
              {result.list ? (
                <Link
                  href={`/list/${result.list.shareCode}?from=${encodeURIComponent(`/search?q=${query.trim()}`)}`}
                  className="ds-search-result-row"
                >
                  <div className="ds-search-result-row__icon" aria-hidden="true"><ListChecks size={18} /></div>
                  <div className="ds-search-result-row__body">
                    <span className="ds-search-result-row__kicker">Liste trouvée</span>
                    <strong>{result.list.title}</strong>
                    {result.list.description ? <span className="ds-hint">{result.list.description}</span> : null}
                    <span className="ds-hint">Par {result.list.owner.username ? `@${result.list.owner.username}` : 'un membre'} · {result.list.shareCode}</span>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              ) : null}
              {result.users.map((user) => (
                <Link
                  key={user.username}
                  href={`/u/${user.username}?from=${encodeURIComponent(`/search?q=${query.trim()}`)}`}
                  className="ds-search-result-row"
                >
                  <div className="ds-search-result-row__icon" aria-hidden="true">@</div>
                  <div className="ds-search-result-row__body">
                    <span className="ds-search-result-row__kicker">Compte public</span>
                    <strong>@{user.username}</strong>
                    <span className="ds-hint">{user.publicListsCount} liste{user.publicListsCount > 1 ? 's' : ''} publique{user.publicListsCount > 1 ? 's' : ''}</span>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && query.trim().length >= 2 && result && !result.list && result.users.length === 0 ? (
          <p className="ds-body-sm ds-text-muted">Aucun compte public ne correspond à « {query.trim()} ».</p>
        ) : null}
        </div>
      </main>
    </div>
  )
}
