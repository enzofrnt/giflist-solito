'use client'

import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'
import { getAuthToken } from 'app/lib/authStorage'

type Key = { id: string; rpId: string; createdAt: string; lastUsedAt: string | null }

const subscribe = () => () => {}
const browserSupport = () => browserSupportsWebAuthn()
const serverSupport = () => false

function AlertIcon({ tone }: { tone: 'success' | 'danger' | 'info' }) {
  if (tone === 'success') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 4.5 4.5L19 7" />
      </svg>
    )
  }
  if (tone === 'danger') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.6 17.2A1.8 1.8 0 0 0 4.2 20h15.6a1.8 1.8 0 0 0 1.6-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

export default function PasskeyManager() {
  const [keys, setKeys] = useState<Key[]>([])
  const supported = useSyncExternalStore(subscribe, browserSupport, serverSupport)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const api = useCallback(async (path: string, method: string, body?: unknown) => {
    const token = await getAuthToken()
    const response = await fetch(`/api/auth/passkeys/${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, ...(body ? { body: JSON.stringify(body) } : {}) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.')
    return data
  }, [])

  const refresh = useCallback(async () => {
    const data = await api('manage', 'POST')
    setKeys(data.keys)
  }, [api])

  useEffect(() => {
    api('manage', 'POST').then(data => setKeys(data.keys)).catch(() => setError('Impossible de charger vos clés d’accès.'))
  }, [api])

  async function add(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true); setError(''); setMessage('')
    try {
      const optionsJSON = await api('register-options', 'POST')
      const credential = await startRegistration({ optionsJSON })
      await api('register-verify', 'POST', credential)
      await refresh()
      setMessage('Clé d’accès ajoutée. Vous pouvez maintenant l’utiliser pour vous connecter.')
    } catch {
      setError('Ajout impossible ou annulé. Vérifiez votre appareil et réessayez.')
    } finally { setBusy(false) }
  }

  async function remove(id: string) {
    if (!window.confirm('Supprimer cette clé d’accès ?')) return
    setBusy(true); setError(''); setMessage('')
    try {
      await api('manage', 'DELETE', { id })
      await refresh()
      setMessage('Clé d’accès supprimée.')
    } catch { setError('Impossible de supprimer cette clé d’accès.') }
    finally { setBusy(false) }
  }

  return (
    <section className="ds-card" aria-labelledby="passkeys-heading">
      <div className="ds-card__header">
        <div className="ds-stack ds-stack--gap-1">
          <h3 id="passkeys-heading" className="ds-card__title">Clés d’accès</h3>
          <p className="ds-card__subtitle">
            Connectez-vous avec le code, l’empreinte ou la reconnaissance faciale de votre appareil.
          </p>
        </div>
      </div>

      <div className="ds-card__body">
        {keys.length > 0 ? (
          <ul className="ds-list">
            {keys.map(key => (
              <li key={key.id} className="ds-list-item">
                <span className="ds-body-sm">
                  Ajoutée le {new Date(key.createdAt).toLocaleDateString('fr-FR')}
                  {key.rpId !== window.location.hostname && key.rpId !== 'giftlist.fr' ? (
                    <span className="ds-caption"> · {key.rpId}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(key.id)}
                  className="ds-btn ds-btn--danger ds-btn--md"
                >
                  <span className="ds-btn__icon" aria-hidden="true"><Trash2 size={16} strokeWidth={1.9} /></span>
                  <span className="ds-btn__label">Supprimer</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ds-hint">Aucune clé d’accès enregistrée pour le moment.</p>
        )}

        {supported ? (
          <form onSubmit={add}>
            <button type="submit" disabled={busy} className="ds-btn ds-btn--primary ds-btn--md" aria-busy={busy || undefined}>
              {busy ? (
                <>
                  <span className="ds-spinner" aria-hidden="true" />
                  Patientez…
                </>
              ) : (
                'Ajouter une clé d’accès'
              )}
            </button>
          </form>
        ) : (
          <div className="ds-alert ds-alert--info" role="status">
            <span className="ds-alert__icon"><AlertIcon tone="info" /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__message">
                Les clés d’accès ne sont pas disponibles sur ce navigateur ou cette connexion.
              </p>
            </div>
          </div>
        )}

        {message ? (
          <div className="ds-alert ds-alert--success" role="status">
            <span className="ds-alert__icon"><AlertIcon tone="success" /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__message">{message}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="ds-alert ds-alert--danger" role="alert">
            <span className="ds-alert__icon"><AlertIcon tone="danger" /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__message">{error}</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
