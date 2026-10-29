'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AuthCard } from '@/components/AuthCard'

type State = 'pending' | 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>('pending')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const attempted = useRef(false)

  useEffect(() => {
    const address = new URLSearchParams(window.location.search).get('email') || ''
    setEmail(address)

    const match = window.location.hash.match(/^#token=(.+)$/)
    if (!match || attempted.current) return
    attempted.current = true
    setState('verifying')
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: decodeURIComponent(match[1]) }),
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.ok) throw new Error(data.error || 'Lien invalide.')
        setState('success')
      })
      .catch(error => {
        setMessage(error instanceof Error ? error.message : 'Lien invalide ou expiré.')
        setState('error')
      })
  }, [])

  async function resend() {
    if (!email || sending) return
    setSending(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      setMessage(data.message || data.error || 'Si un compte correspond, un e-mail a été envoyé.')
    } catch {
      setMessage('L’e-mail n’a pas pu être renvoyé pour le moment.')
    } finally {
      setSending(false)
    }
  }

  const title = state === 'success'
    ? 'Adresse confirmée'
    : state === 'error'
      ? 'Lien invalide ou expiré'
      : state === 'verifying'
        ? 'Confirmation en cours…'
        : 'Vérifiez votre boîte mail'

  const lead = state === 'success'
    ? 'Votre compte est activé. Vous pouvez maintenant vous connecter.'
    : state === 'error'
      ? message || 'Ce lien de confirmation est invalide ou a expiré.'
      : state === 'verifying'
        ? 'Nous vérifions votre lien de confirmation.'
        : email
          ? `Un e-mail de confirmation vient d’être envoyé à ${email}. Cliquez sur le lien qu’il contient pour activer votre compte.`
          : 'Un e-mail de confirmation vient d’être envoyé. Cliquez sur le lien qu’il contient pour activer votre compte.'

  return (
    <AuthCard
      title={title}
      lead={lead}
      footer={
        <div className="ds-auth__links">
          <Link href="/login" className="ds-link">Se connecter</Link>
          <span aria-hidden="true"> · </span>
          <Link href="/register" className="ds-link">Créer un autre compte</Link>
        </div>
      }
    >
      {state === 'success' ? (
        <Link href="/login" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block">
          Se connecter
        </Link>
      ) : null}

      {state === 'verifying' ? (
        <div className="ds-stack ds-stack--items-center ds-stack--gap-3" role="status">
          <span className="ds-spinner" aria-hidden="true" />
          <p className="ds-body-sm">Vérification de votre adresse e-mail…</p>
        </div>
      ) : null}

      {state === 'pending' || state === 'error' ? (
        <div className="ds-stack ds-stack--gap-4">
          {state === 'error' ? (
            <div className="ds-alert ds-alert--danger" role="alert">
              <span className="ds-alert__icon" aria-hidden="true">!</span>
              <div className="ds-alert__content">
                <p className="ds-alert__title">Confirmation impossible</p>
                <p className="ds-alert__message">{message}</p>
              </div>
            </div>
          ) : null}
          {message && state === 'pending' ? (
            <p className="ds-hint" role="status">{message}</p>
          ) : null}
          {email ? (
            <button
              type="button"
              className="ds-btn ds-btn--secondary ds-btn--lg ds-btn--block"
              onClick={resend}
              disabled={sending}
              aria-busy={sending || undefined}
            >
              {sending ? <span className="ds-spinner" aria-hidden="true" /> : null}
              {sending ? 'Envoi…' : 'Renvoyer l’e-mail'}
            </button>
          ) : null}
          <p className="ds-hint">
            Pensez à vérifier vos spams. Le lien est valable 24 heures.
          </p>
        </div>
      ) : null}
    </AuthCard>
  )
}
