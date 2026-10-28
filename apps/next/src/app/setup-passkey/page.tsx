'use client'

import { useEffect, useState } from 'react'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'
import { getAuthToken } from 'app/lib/authStorage'
import { AuthCard } from '@/components/AuthCard'

export default function SetupPasskeyPage() {
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function check() {
      const token = await getAuthToken()
      if (!token) { window.location.replace('/login'); return }
      if (!browserSupportsWebAuthn()) { window.location.replace('/dashboard'); return }
      try {
        const response = await fetch('/api/auth/passkeys/manage', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('unavailable')
        const data = await response.json()
        if (cancelled) return
        if (data.hasPasskeyForCurrentOrigin) window.location.replace('/dashboard')
        else setReady(true)
      } catch {
        // An unavailable passkey service must not prevent the user from signing in.
        if (!cancelled) window.location.replace('/dashboard')
      }
    }
    void check()
    return () => { cancelled = true }
  }, [])

  async function addPasskey() {
    setBusy(true)
    setError('')
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('not signed in')
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      const response = await fetch('/api/auth/passkeys/register-options', { method: 'POST', headers })
      if (!response.ok) throw new Error('options')
      const optionsJSON = await response.json()
      const credential = await startRegistration({ optionsJSON })
      const verified = await fetch('/api/auth/passkeys/register-verify', {
        method: 'POST',
        headers,
        body: JSON.stringify(credential),
      })
      if (!verified.ok) throw new Error('verification')
      window.location.replace('/dashboard')
    } catch {
      setError('La création de la clé a été annulée ou a échoué. Vous pouvez réessayer ou continuer sans clé.')
      setBusy(false)
    }
  }

  if (!ready) {
    return (
      <div className="ds-auth">
        <p className="ds-cluster ds-body-sm" role="status">
          <span className="ds-spinner" aria-hidden="true" />
          Chargement…
        </p>
      </div>
    )
  }

  return (
    <AuthCard
      title="Simplifiez vos prochaines connexions"
      lead="Ajoutez une clé d’accès pour vous connecter avec le code, l’empreinte ou la reconnaissance faciale de votre appareil."
      footer={<p className="ds-caption">Vous pourrez aussi ajouter ou supprimer une clé depuis Mon compte.</p>}
    >
      {error ? (
        <div className="ds-alert ds-alert--danger" role="alert">
          <span className="ds-alert__icon" aria-hidden="true">!</span>
          <div className="ds-alert__content">
            <p className="ds-alert__title">Clé non ajoutée</p>
            <p className="ds-alert__message">{error}</p>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={addPasskey}
        disabled={busy}
        className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block"
        aria-busy={busy || undefined}
      >
        {busy ? <span className="ds-spinner" aria-hidden="true" /> : null}
        {busy ? 'Création en cours…' : 'Ajouter une clé d’accès'}
      </button>
      <button
        type="button"
        onClick={() => window.location.replace('/dashboard')}
        disabled={busy}
        className="ds-btn ds-btn--ghost ds-btn--block"
      >
        Plus tard
      </button>
    </AuthCard>
  )
}
