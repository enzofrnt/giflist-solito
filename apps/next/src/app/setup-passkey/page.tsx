'use client'

import { useEffect, useState } from 'react'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'
import { getAuthToken } from 'app/lib/authStorage'
import Image from 'next/image'

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
        const response = await fetch('/api/auth/passkeys/manage', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
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
      const verified = await fetch('/api/auth/passkeys/register-verify', { method: 'POST', headers, body: JSON.stringify(credential) })
      if (!verified.ok) throw new Error('verification')
      window.location.replace('/dashboard')
    } catch {
      setError('La création de la clé a été annulée ou a échoué. Vous pouvez réessayer ou continuer sans clé.')
      setBusy(false)
    }
  }

  if (!ready) return <main className="min-h-screen flex items-center justify-center text-gray-600" role="status">Chargement…</main>

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-5">
      <Image src="/logo.webp" alt="Giftlist" width={64} height={64} className="mx-auto rounded-full border-4 border-indigo-200" />
      <h1 className="text-2xl font-bold text-gray-900">Simplifiez vos prochaines connexions</h1>
      <p className="text-gray-600">Ajoutez une clé d’accès pour vous connecter avec le code, l’empreinte ou la reconnaissance faciale de votre appareil.</p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" onClick={addPasskey} disabled={busy} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Création en cours…' : 'Ajouter une clé d’accès'}</button>
      <button type="button" onClick={() => window.location.replace('/dashboard')} disabled={busy} className="w-full rounded-lg px-4 py-2 text-blue-700 hover:bg-blue-50 disabled:opacity-50">Plus tard</button>
      <p className="text-xs text-gray-500">Vous pourrez aussi ajouter ou supprimer une clé depuis Mon compte.</p>
    </div>
  </main>
}
