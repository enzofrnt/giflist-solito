interface SecretModeToggleProps {
  hasRevealed: boolean
  onToggle: () => void
  variant?: 'public' | 'manage'
}

export default function SecretModeToggle({
  hasRevealed,
  onToggle,
  variant = 'public'
}: SecretModeToggleProps) {
  const message = hasRevealed
    ? variant === 'public'
      ? 'Cliquez sur le bouton ci-dessous pour masquer à nouveau les réservations.'
      : 'Les réservations sont visibles. Cliquez sur le bouton ci-dessous pour masquer à nouveau les réservations.'
    : 'Les réservations sont masquées. Cliquez sur le bouton ci-dessous pour révéler l’état des réservations.'

  return (
    <div className="ds-alert ds-alert--warning mb-6 flex-col items-stretch sm:flex-row sm:items-center">
      <span className="ds-alert__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
          <path d="M9.5 12l1.8 1.8 3.2-3.4" />
        </svg>
      </span>
      <div className="ds-alert__content flex-1">
        <p className="ds-alert__title">Mode secret activé</p>
        <p className="ds-alert__message">{message}</p>
      </div>
      <button
        type="button"
        className="ds-btn ds-btn--secondary"
        onClick={onToggle}
        aria-pressed={hasRevealed}
      >
        {hasRevealed ? 'Masquer les réservations' : 'Afficher les réservations'}
      </button>
    </div>
  )
}
