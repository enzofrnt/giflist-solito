'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthCard } from '@/components/AuthCard'
import PasswordInput from '@/components/PasswordInput'
import { validatePassword } from 'app/lib/passwordValidation'
import { setAuthToken } from 'app/lib/authStorage'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')

    if (formData.password !== formData.passwordConfirm) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (!formData.name || formData.name.trim().length === 0) {
      setError('Le nom est requis')
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
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
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
      <form onSubmit={handleSubmit} className="ds-stack ds-stack--gap-5">
        <div className="ds-field">
          <label htmlFor="name" className="ds-label">
            Nom <span className="ds-label__required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="ds-input"
            placeholder="Votre nom"
            minLength={1}
            maxLength={100}
            autoComplete="name"
          />
        </div>

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
