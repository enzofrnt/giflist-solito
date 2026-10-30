'use client'

import { useState } from 'react'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'
import { AuthCard } from '@/components/AuthCard'
import { startAuthentication } from '@simplewebauthn/browser'
import { setAuthToken } from 'app/lib/authStorage'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (loading) return

    // Password managers can fill the fields without firing React input events,
    // so read the submitted values from the form itself.
    const values = new FormData(event.currentTarget)
    const email = String(values.get('email') ?? '').trim()
    const password = String(values.get('password') ?? '')

    setFormData({ email, password })
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (data.ok) {
        const result = setAuthToken(data.token)
        if (result instanceof Promise) await result
        window.location.href = '/setup-passkey'
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const loginWithPasskey = async () => {
    setLoading(true)
    setError('')
    try {
      const optionsResponse = await fetch('/api/auth/passkeys/login-options', { method: 'POST' })
      if (!optionsResponse.ok) throw new Error('options')
      const optionsJSON = await optionsResponse.json()
      const credential = await startAuthentication({ optionsJSON })
      const response = await fetch('/api/auth/passkeys/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credential),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error('verification')
      await setAuthToken(data.token)
      window.location.href = '/dashboard'
    } catch {
      setError('Connexion par clé d’accès impossible ou annulée. Réessayez ou utilisez votre mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  }

  return (
    <AuthCard
      title="Connexion"
      lead="Connectez-vous à votre compte pour retrouver vos listes."
      footer={
        <div className="ds-auth__links">
          <Link href="/register" className="ds-link">Pas de compte ? Créez-en un</Link>
          <Link href="/forgot-password" className="ds-link">Mot de passe oublié ?</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="ds-stack ds-stack--gap-5">
        <div className="ds-field">
          <label htmlFor="email" className="ds-label">
            Adresse e-mail <span className="ds-label__required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="ds-input"
            placeholder="votre@email.com"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <div className="ds-field">
          <label htmlFor="password" className="ds-label">
            Mot de passe <span className="ds-label__required">*</span>
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Votre mot de passe"
            showStrength={false}
            showGuide={false}
            required
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <div className="ds-alert ds-alert--danger" role="alert">
            <span className="ds-alert__icon" aria-hidden="true">!</span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Connexion impossible</p>
              <p className="ds-alert__message">{error}</p>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block"
          disabled={loading}
          aria-busy={loading || undefined}
        >
          {loading ? <span className="ds-spinner" aria-hidden="true" /> : null}
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <button
          type="button"
          className="ds-btn ds-btn--secondary ds-btn--block"
          disabled={loading}
          onClick={loginWithPasskey}
        >
          Se connecter avec une clé d’accès
        </button>
      </form>
    </AuthCard>
  )
}
