'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'
import { getAuthToken } from 'app/lib/authStorage'

type Key = { id: string; rpId: string; createdAt: string; lastUsedAt: string | null }

const subscribe = () => () => {}
const browserSupport = () => browserSupportsWebAuthn()
const serverSupport = () => false

export default function PasskeyManager() {
  const [keys, setKeys] = useState<Key[]>([])
  const [password, setPassword] = useState('')
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
      const optionsJSON = await api('register-options', 'POST', { password })
      const credential = await startRegistration({ optionsJSON })
      await api('register-verify', 'POST', credential)
      setPassword('')
      await refresh()
      setMessage('Clé d’accès ajoutée. Vous pouvez maintenant l’utiliser pour vous connecter.')
    } catch (err) {
      setError(err instanceof Error && err.message === 'Mot de passe incorrect.' ? err.message : 'Ajout impossible ou annulé. Vérifiez votre appareil et réessayez.')
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

  return <section className="border-t border-gray-200 pt-5 mb-6" aria-labelledby="passkeys-heading">
    <h3 id="passkeys-heading" className="text-base font-semibold text-gray-900">Clés d’accès</h3>
    <p className="text-sm text-gray-600 mt-1">Connectez-vous avec le code, l’empreinte ou la reconnaissance faciale de votre appareil.</p>
    {keys.length > 0 && <ul className="my-3 space-y-2">
      {keys.map(key => <li key={key.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-700">
        <span>Ajoutée le {new Date(key.createdAt).toLocaleDateString('fr-FR')} {key.rpId !== window.location.hostname && key.rpId !== 'giftlist.fr' ? `(${key.rpId})` : ''}</span>
        <button type="button" disabled={busy} onClick={() => remove(key.id)} className="text-red-700 hover:underline disabled:opacity-50">Supprimer</button>
      </li>)}
    </ul>}
    {supported ? <form onSubmit={add} className="space-y-2 mt-4">
      <label htmlFor="passkey-password" className="block text-sm font-medium text-gray-700">Mot de passe actuel pour ajouter une clé</label>
      <input id="passkey-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" />
      <button type="submit" disabled={busy || !password} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50">{busy ? 'Patientez…' : 'Ajouter une clé d’accès'}</button>
    </form> : <p className="mt-3 text-sm text-gray-600">Les clés d’accès ne sont pas disponibles sur ce navigateur ou cette connexion.</p>}
    {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>
}
