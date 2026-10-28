'use client'

import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react'
import Link from 'next/link'
import { removeAuthToken } from 'app/lib/authStorage'
import { validatePassword } from 'app/lib/passwordValidation'
import { AuthCard } from './AuthCard'
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
    <AuthCard
      title={resetting ? 'Nouveau mot de passe' : 'Mot de passe oublié ?'}
      lead={
        resetting
          ? 'Choisissez un nouveau mot de passe pour votre compte Giftlist.'
          : 'Indiquez votre adresse e-mail pour recevoir un lien de réinitialisation.'
      }
      footer={
        <div className="ds-auth__links">
          <Link href="/login" className="ds-link">Retour à la connexion</Link>
          {invalidLink ? <Link href="/forgot-password" className="ds-link">Demander un nouveau lien</Link> : null}
        </div>
      }
    >
      {success ? (
        <div className="ds-alert ds-alert--success" role="status">
          <span className="ds-alert__icon" aria-hidden="true">✓</span>
          <div className="ds-alert__content">
            <p className="ds-alert__title">C’est fait</p>
            <p className="ds-alert__message">
              {resetting
                ? 'Votre mot de passe a été modifié. Vos clés d’accès ont été supprimées ; vous pourrez les ajouter à nouveau après connexion.'
                : 'Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé. Vérifiez aussi vos courriers indésirables. Le lien est valable 30 minutes.'}
            </p>
          </div>
        </div>
      ) : invalidLink ? (
        <div className="ds-alert ds-alert--warning" role="alert">
          <span className="ds-alert__icon" aria-hidden="true">!</span>
          <div className="ds-alert__content">
            <p className="ds-alert__title">Lien invalide</p>
            <p className="ds-alert__message">Ce lien est incomplet ou invalide. Demandez un nouveau lien de réinitialisation.</p>
          </div>
        </div>
      ) : !ready ? (
        <p className="ds-body-sm" role="status">Chargement…</p>
      ) : (
        <form onSubmit={submit} className="ds-stack ds-stack--gap-5" aria-busy={loading}>
          {resetting ? (
            <>
              <div className="ds-field">
                <label htmlFor="new-password" className="ds-label">Nouveau mot de passe</label>
                <PasswordInput
                  id="new-password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  showGuide
                  showStrength
                />
              </div>
              <div className="ds-field">
                <label htmlFor="confirm-password" className="ds-label">Confirmer le mot de passe</label>
                <PasswordInput
                  id="confirm-password"
                  name="confirmation"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="ds-field">
              <label htmlFor="recovery-email" className="ds-label">Adresse e-mail</label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ds-input"
              />
            </div>
          )}

          {error ? (
            <div className="ds-alert ds-alert--danger" role="alert">
              <span className="ds-alert__icon" aria-hidden="true">!</span>
              <div className="ds-alert__content">
                <p className="ds-alert__title">Action impossible</p>
                <p className="ds-alert__message">{error}</p>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block"
            aria-busy={loading || undefined}
          >
            {loading ? <span className="ds-spinner" aria-hidden="true" /> : null}
            {loading ? 'En cours…' : resetting ? 'Enregistrer le nouveau mot de passe' : 'Recevoir le lien'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
