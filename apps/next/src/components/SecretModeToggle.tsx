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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-300 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Mode secret activé
          </h3>
          <p className="text-sm text-gray-600">
            {hasRevealed
              ? variant === 'public'
                ? 'Cliquez sur le bouton ci-dessous pour masquer à nouveau les réservations.'
                : 'Les réservations sont visibles. Cliquez sur le bouton ci-dessous pour masquer à nouveau les réservations.'
              : 'Les réservations sont masquées. Cliquez sur le bouton ci-dessous pour révéler l&apos;état des réservations.'}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium whitespace-nowrap"
        >
          {hasRevealed ? 'Masquer les réservations' : 'Afficher les réservations'}
        </button>
      </div>
    </div>
  )
}

