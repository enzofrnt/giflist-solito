'use client'

import { setAuthToken } from 'app/lib/authStorage'
import { useEffect, useState } from 'react'

type State = 'loading' | 'success' | 'error'

export default function EmailChangePage() {
  const [state, setState] = useState<State>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
    if (!token) {
      setState('error')
      setMessage('Ce lien est incomplet ou a expiré. Demandez une nouvelle confirmation depuis votre profil.')
      return
    }

    let cancelled = false
    async function confirm() {
      try {
        const response = await fetch('/api/auth/email-change/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await response.json().catch(() => null)
        if (cancelled) return
        if (!response.ok) {
          setState('error')
          setMessage(data?.error || 'Impossible de confirmer cette adresse.')
          return
        }
        await setAuthToken(data.token)
        setState('success')
        setMessage(`Votre adresse e-mail Giftlist est maintenant ${data.user.email}.`)
      } catch {
        if (!cancelled) {
          setState('error')
          setMessage('Impossible de confirmer cette adresse pour le moment.')
        }
      }
    }
    confirm()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <section className="ds-card" aria-live="polite">
          <div className="ds-card__header">
            <div className="ds-stack ds-stack--gap-1">
              <span className="ds-overline">Compte</span>
              <h1 className="ds-card__title">Nouvelle adresse e-mail</h1>
            </div>
          </div>
          <div className="ds-card__body ds-stack ds-stack--gap-4">
            {state === 'loading' ? (
              <div className="ds-stack ds-stack--gap-3 items-center" role="status">
                <span className="ds-spinner" aria-hidden="true" />
                <p className="ds-body-sm ds-text-muted">Confirmation en cours…</p>
              </div>
            ) : (
              <>
                <p className={state === 'success' ? 'ds-body' : 'ds-error'}>{message}</p>
                <div className="ds-cluster">
                  {state === 'success' ? (
                    <a href="/profile" className="ds-btn ds-btn--primary ds-btn--md">Aller à mon profil</a>
                  ) : (
                    <a href="/profile" className="ds-btn ds-btn--secondary ds-btn--md">Retour au profil</a>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
