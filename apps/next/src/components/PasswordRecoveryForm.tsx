'use client'

import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { removeAuthToken } from 'app/lib/authStorage'
import { validatePassword } from 'app/lib/passwordValidation'
import PasswordInput from './PasswordInput'

const subscribeToHydration = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export default function PasswordRecoveryForm({ mode }: { mode: 'request' | 'reset' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [token, setToken] = useState(() => {
    if (mode !== 'reset' || typeof window === 'undefined') return ''
    const secret = new URLSearchParams(window.location.hash.slice(1)).get('token')
    return secret && /^[a-f0-9]{64}$/.test(secret) ? secret : ''
  })
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const resetting = mode === 'reset'
  const ready = !resetting || hydrated

  useEffect(() => {
    if (!resetting) return
    // Keep the secret in memory only, including after successful submission.
    window.history.replaceState(null, '', window.location.pathname)
  }, [resetting])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')
    if (resetting) {
      const validation = validatePassword(password)
      if (!validation.isValid) return setError(validation.errors[0])
      if (password !== confirmation) return setError('Les mots de passe ne correspondent pas.')
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/auth/${resetting ? 'reset-password' : 'forgot-password'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetting ? { token, password } : { email }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue. Réessayez plus tard.')
        return
      }
      if (resetting) {
        await removeAuthToken()
        setPassword('')
        setConfirmation('')
        setToken('')
      }
      setSuccess(true)
    } catch {
      setError('Impossible de contacter Giftlist. Vérifiez votre connexion puis réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const invalidLink = resetting && ready && !token && !success
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Image src="/logo.webp" alt="Giftlist" width={64} height={64} className="mx-auto mb-4 rounded-full border-4 border-indigo-200" />
          <h1 className="text-3xl font-bold text-gray-900">{resetting ? 'Nouveau mot de passe' : 'Mot de passe oublié ?'}</h1>
          {!success && <p className="mt-3 text-sm text-gray-600">{resetting ? 'Choisissez un nouveau mot de passe pour votre compte Giftlist.' : 'Indiquez votre adresse e-mail pour recevoir un lien de réinitialisation.'}</p>}
        </div>

        {success ? (
          <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {resetting ? 'Votre mot de passe a été modifié. Connectez-vous avec votre nouveau mot de passe.' : 'Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé. Vérifiez aussi vos courriers indésirables. Le lien est valable 30 minutes.'}
          </div>
        ) : invalidLink ? (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Ce lien est incomplet ou invalide. Demandez un nouveau lien de réinitialisation.</div>
        ) : !ready ? <p role="status" className="text-center text-gray-600">Chargement…</p> : (
          <form onSubmit={submit} className="space-y-5" aria-busy={loading}>
            {resetting ? <>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                <PasswordInput id="new-password" name="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required showGuide showStrength />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                <PasswordInput id="confirm-password" name="confirmation" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
              </div>
            </> : <div>
              <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <input id="recovery-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>}
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
              {loading ? 'En cours…' : resetting ? 'Enregistrer le nouveau mot de passe' : 'Recevoir le lien'}
            </button>
          </form>
        )}
        {(invalidLink || resetting && error) && <Link href="/forgot-password" className="block text-center text-sm text-blue-600 hover:underline">Demander un nouveau lien</Link>}
        <Link href="/login" className="block text-center text-sm text-blue-600 hover:underline">Retour à la connexion</Link>
      </div>
    </main>
  )
}
