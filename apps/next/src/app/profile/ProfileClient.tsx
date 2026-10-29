'use client'

import AlertModal from '@/components/AlertModal'
import PasswordInput from '@/components/PasswordInput'
import PasskeyManager from '@/components/PasskeyManager'
import { ThemeSettings } from '@/components/ThemeSettings'
import { useAlert } from '@/hooks/useAlert'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAuthToken, setAuthToken } from 'app/lib/authStorage'
import { validatePassword } from 'app/lib/passwordValidation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Feedback = {
  tone: 'success' | 'danger'
  title: string
  message: string
}

function FeedbackIcon({ tone }: { tone: Feedback['tone'] }) {
  if (tone === 'success') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 4.5 4.5L19 7" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.6 17.2A1.8 1.8 0 0 0 4.2 20h15.6a1.8 1.8 0 0 0 1.6-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
    </svg>
  )
}

export default function ProfileClient() {
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)
  const [emailData, setEmailData] = useState({ email: '', currentPassword: '' })
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const router = useRouter()
  const { alert, hideAlert } = useAlert()
  const { user } = useAuthContext()

  // Synchroniser avec l'utilisateur du contexte
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email
      })
    }
  }, [user])

  async function updateProfile() {
    if (!formData.name.trim()) {
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'Le nom est requis' })
      return
    }

    setUpdating(true)
    try {
      const token = getAuthToken()
      if (!token) {
        setFeedback({ tone: 'danger', title: 'Erreur', message: 'Non authentifié' })
        return
      }
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim()
        })
      })

      if (response.ok) {
        setFeedback({ tone: 'success', title: 'Profil mis à jour', message: 'Vos informations ont été enregistrées.' })
        // Recharger l'auth pour mettre à jour le contexte
        window.location.reload()
      } else {
        const errorData = await response.json()
        setFeedback({ tone: 'danger', title: 'Erreur', message: errorData.error || 'Erreur lors de la mise à jour du profil' })
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'Erreur lors de la mise à jour du profil' })
    } finally {
      setUpdating(false)
    }
  }

  async function requestEmailChange() {
    if (!emailData.email.trim() || !emailData.currentPassword) {
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'La nouvelle adresse et le mot de passe actuel sont requis.' })
      return
    }
    setChangingEmail(true)
    try {
      const token = getAuthToken()
      if (!token) {
        setFeedback({ tone: 'danger', title: 'Erreur', message: 'Non authentifié' })
        return
      }
      const response = await fetch('/api/auth/email-change/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(emailData),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setFeedback({ tone: 'danger', title: 'Changement impossible', message: data?.error || 'Erreur lors de la demande.' })
        return
      }
      setFeedback({ tone: 'success', title: 'Vérifiez votre boîte mail', message: data.message })
      setShowEmailForm(false)
      setEmailData({ email: '', currentPassword: '' })
    } catch {
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'Erreur lors de la demande de changement.' })
    } finally {
      setChangingEmail(false)
    }
  }

  async function changePassword() {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'Tous les champs sont requis' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'Les nouveaux mots de passe ne correspondent pas' })
      return
    }

    const validation = validatePassword(passwordData.newPassword)
    if (!validation.isValid) {
      setFeedback({ tone: 'danger', title: 'Erreur', message: validation.errors[0] })
      return
    }

    setChangingPassword(true)
    try {
      const token = getAuthToken()
      if (!token) {
        setFeedback({ tone: 'danger', title: 'Erreur', message: 'Non authentifié' })
        return
      }
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        await setAuthToken(data.token)
        setFeedback({ tone: 'success', title: 'Mot de passe modifié', message: 'Votre mot de passe a bien été mis à jour.' })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setShowPasswordForm(false)
      } else {
        const errorData = await response.json()
        setFeedback({ tone: 'danger', title: 'Erreur', message: errorData.error || 'Erreur lors du changement de mot de passe' })
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error)
      setFeedback({ tone: 'danger', title: 'Erreur', message: 'Erreur lors du changement de mot de passe' })
    } finally {
      setChangingPassword(false)
    }
  }

  function closePasswordForm() {
    setShowPasswordForm(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  if (!user) {
    return null
  }

  const initials = (formData.name || user.name || 'GL').trim().slice(0, 2).toUpperCase() || 'GL'

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <header className="ds-page-header">
          <div className="ds-page-header__copy">
            <span className="ds-page-kicker">Compte</span>
            <h1 className="ds-page-title">Mon compte</h1>
            <p className="ds-page-subtitle">Gérez vos informations personnelles et vos préférences.</p>
          </div>
        </header>

        {feedback ? (
          <div
            className={`ds-alert ds-alert--${feedback.tone} mb-6`}
            role={feedback.tone === 'danger' ? 'alert' : 'status'}
          >
            <span className="ds-alert__icon"><FeedbackIcon tone={feedback.tone} /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">{feedback.title}</p>
              <p className="ds-alert__message">{feedback.message}</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="ds-stack ds-stack--gap-6 lg:col-span-2">
            <form
              className="ds-card"
              onSubmit={(e) => {
                e.preventDefault()
                updateProfile()
              }}
            >
              <div className="ds-card__header">
                <div className="ds-stack ds-stack--gap-1">
                  <h2 className="ds-card__title">Informations personnelles</h2>
                  <p className="ds-card__subtitle">Votre nom apparaît sur vos listes partagées.</p>
                </div>
                <span className="ds-avatar ds-avatar--lg" aria-hidden="true">{initials}</span>
              </div>

              <div className="ds-card__body">
                <div className="ds-field">
                  <label htmlFor="profile-name" className="ds-label">
                    Nom d’utilisateur <span className="ds-label__required">*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="ds-input"
                    placeholder="Votre nom"
                    minLength={1}
                    maxLength={100}
                    autoComplete="name"
                    aria-describedby="profile-name-hint"
                  />
                  <p className="ds-hint" id="profile-name-hint">Obligatoire, 100 caractères maximum.</p>
                </div>

                <div className="ds-field">
                  <label htmlFor="profile-email" className="ds-label">Adresse e-mail</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="ds-input"
                    aria-describedby="profile-email-hint"
                  />
                  <p className="ds-hint" id="profile-email-hint">Une confirmation est envoyée à la nouvelle adresse avant le changement.</p>
                  <div className="ds-cluster">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm((current) => !current)}
                      className="ds-btn ds-btn--secondary ds-btn--sm"
                      aria-expanded={showEmailForm}
                      aria-controls="email-change-panel"
                    >
                      {showEmailForm ? 'Fermer' : 'Modifier mon adresse e-mail'}
                    </button>
                  </div>
                  {showEmailForm ? (
                    <form
                      id="email-change-panel"
                      className="ds-stack ds-stack--gap-3"
                      onSubmit={(event) => {
                        event.preventDefault()
                        requestEmailChange()
                      }}
                    >
                      <div className="ds-field">
                        <label htmlFor="email-change-new" className="ds-label">Nouvelle adresse e-mail</label>
                        <input
                          id="email-change-new"
                          type="email"
                          required
                          value={emailData.email}
                          onChange={(event) => setEmailData((current) => ({ ...current, email: event.target.value }))}
                          className="ds-input"
                          placeholder="nouvelle@adresse.fr"
                          autoComplete="email"
                        />
                      </div>
                      <div className="ds-field">
                        <label htmlFor="email-change-password" className="ds-label">Mot de passe actuel</label>
                        <input
                          id="email-change-password"
                          type="password"
                          required
                          value={emailData.currentPassword}
                          onChange={(event) => setEmailData((current) => ({ ...current, currentPassword: event.target.value }))}
                          className="ds-input"
                          placeholder="Votre mot de passe actuel"
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="ds-cluster">
                        <button type="submit" className="ds-btn ds-btn--primary ds-btn--sm" disabled={changingEmail}>
                          {changingEmail ? 'Envoi…' : 'Envoyer la confirmation'}
                        </button>
                        <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={() => setShowEmailForm(false)}>Annuler</button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </div>

              <div className="ds-card__footer">
                <button
                  type="submit"
                  disabled={!formData.name.trim() || updating}
                  className="ds-btn ds-btn--primary ds-btn--md"
                  aria-busy={updating || undefined}
                >
                  {updating ? (
                    <>
                      <span className="ds-spinner" aria-hidden="true" />
                      Mise à jour…
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </button>
              </div>
            </form>

            <section className="ds-card" aria-labelledby="password-heading">
              <div className="ds-card__header">
                <div className="ds-stack ds-stack--gap-1">
                  <h2 className="ds-card__title" id="password-heading">Mot de passe</h2>
                  <p className="ds-card__subtitle">Modifiez le mot de passe de votre compte.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(current => !current)}
                  className="ds-btn ds-btn--secondary ds-btn--md"
                  aria-expanded={showPasswordForm}
                  aria-controls="password-form-panel"
                >
                  {showPasswordForm ? 'Fermer' : 'Changer le mot de passe'}
                </button>
              </div>

              <div className="ds-card__body">
                <div id="password-form-panel">
                {showPasswordForm ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      changePassword()
                    }}
                    className="ds-stack ds-stack--gap-4"
                  >
                    <div className="ds-field">
                      <label htmlFor="currentPassword" className="ds-label">
                        Mot de passe actuel <span className="ds-label__required">*</span>
                      </label>
                      <PasswordInput
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Votre mot de passe actuel"
                        showStrength={false}
                        showGuide={false}
                        required={true}
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="ds-field">
                      <label htmlFor="newPassword" className="ds-label">
                        Nouveau mot de passe <span className="ds-label__required">*</span>
                      </label>
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Nouveau mot de passe"
                        showStrength={true}
                        showGuide={true}
                        required={true}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="ds-field">
                      <label htmlFor="confirmPassword" className="ds-label">
                        Confirmer le nouveau mot de passe <span className="ds-label__required">*</span>
                      </label>
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirmer le nouveau mot de passe"
                        showStrength={false}
                        showGuide={false}
                        required={true}
                        autoComplete="new-password"
                      />
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? (
                        <p className="ds-error" role="alert">Les mots de passe ne correspondent pas.</p>
                      ) : null}
                    </div>

                    <div className="ds-cluster">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="ds-btn ds-btn--primary ds-btn--md"
                        aria-busy={changingPassword || undefined}
                      >
                        {changingPassword ? (
                          <>
                            <span className="ds-spinner" aria-hidden="true" />
                            Modification…
                          </>
                        ) : (
                          'Modifier le mot de passe'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closePasswordForm}
                        className="ds-btn ds-btn--secondary ds-btn--md"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="ds-hint">Utilisez un mot de passe robuste et unique pour protéger votre compte.</p>
                )}
                </div>
              </div>
            </section>

            <PasskeyManager />
          </div>

          <div className="ds-stack ds-stack--gap-6">
            <ThemeSettings />

            <section className="ds-card" aria-labelledby="status-heading">
              <div className="ds-card__header">
                <h2 className="ds-card__title" id="status-heading">Statistiques</h2>
              </div>
              <div className="ds-card__body">
                <div className="flex items-center justify-between gap-3">
                  <span className="ds-body-sm ds-text-muted">Statut</span>
                  <span className="ds-badge ds-badge--success ds-badge--dot">Actif</span>
                </div>
              </div>
            </section>

            <section className="ds-card" aria-labelledby="actions-heading">
              <div className="ds-card__header">
                <h2 className="ds-card__title" id="actions-heading">Actions</h2>
              </div>
              <div className="ds-card__body ds-stack ds-stack--gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="ds-btn ds-btn--secondary ds-btn--block"
                >
                  Mes listes de cadeaux
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="ds-btn ds-btn--ghost ds-btn--block"
                >
                  Page d’accueil
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {alert ? (
        <AlertModal
          isOpen={!!alert}
          onClose={hideAlert}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          confirmText={alert.confirmText}
          onConfirm={alert.onConfirm}
          showCancel={alert.showCancel}
          cancelText={alert.cancelText}
        />
      ) : null}
    </div>
  )
}
