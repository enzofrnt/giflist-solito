'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthCard } from '@/components/AuthCard'
import PasswordInput from '@/components/PasswordInput'
import { validatePassword } from 'app/lib/passwordValidation'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')

    const email = formData.email.trim()
    const username = formData.username.trim()

    if (!EMAIL_PATTERN.test(email)) {
      setError('Adresse e-mail invalide. Utilisez le format nom@domaine.com.')
      setLoading(false)
      return
    }

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setError('Le pseudo doit contenir 3 à 30 caractères (lettres, chiffres, _).')
      setLoading(false)
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: formData.password,
          username,
        }),
      })
      const data = await response.json()

      if (data.ok && data.requiresEmailVerification) {
        window.location.href = `/verify-email?email=${encodeURIComponent(data.email || email)}`
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  }

  const passwordsMismatch = Boolean(formData.passwordConfirm) && formData.password !== formData.passwordConfirm

  return (
    <AuthCard
      title="Créer un compte"
      lead="Quelques secondes pour commencer votre première liste."
      footer={
        <div className="ds-auth__links">
          <Link href="/login" className="ds-link">Déjà un compte ? Connectez-vous</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="ds-stack ds-stack--gap-5" noValidate>
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
            autoComplete="email"
            autoCapitalize="none"
          />
        </div>

        <div className="ds-field">
          <label htmlFor="username" className="ds-label">
            Pseudo <span className="ds-label__required">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={30}
            value={formData.username}
            onChange={handleInputChange}
            className="ds-input"
            placeholder="ex : camille_demo"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
          <p className="ds-hint">3 à 30 caractères : lettres, chiffres et _.</p>
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
            showStrength
            showGuide
            required
            autoComplete="new-password"
          />
        </div>

        <div className="ds-field">
          <label htmlFor="passwordConfirm" className="ds-label">
            Confirmer le mot de passe <span className="ds-label__required">*</span>
          </label>
          <PasswordInput
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            placeholder="Confirmez votre mot de passe"
            required
            autoComplete="new-password"
          />
          {passwordsMismatch ? (
            <p className="ds-error" role="alert">Les mots de passe ne correspondent pas.</p>
          ) : null}
        </div>

        {error ? (
          <div className="ds-alert ds-alert--danger" role="alert">
            <span className="ds-alert__icon" aria-hidden="true">!</span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Inscription impossible</p>
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
          {loading ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </AuthCard>
  )
}
