interface GiftStatusBadgeProps {
  status: 'available' | 'reserved'
  reservedByName?: string
  isSecret: boolean
  hasRevealed: boolean
  variant?: 'default' | 'public'
}

export default function GiftStatusBadge({
  status,
  reservedByName,
  isSecret,
  hasRevealed,
  variant = 'default'
}: GiftStatusBadgeProps) {
  // Si la liste est secrète et que les réservations ne sont pas révélées
  if (isSecret && !hasRevealed) {
    if (variant === 'public') {
      // Sur la page publique, on affiche toujours "Disponible" quand masqué
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
          Disponible
        </span>
      )
    } else {
      // Sur la page de modification, on affiche "Statut masqué"
      return (
        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium bg-gray-50 text-gray-600 border border-gray-200">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></div>
          Statut masqué
        </span>
      )
    }
  }

  // Si la liste n'est pas secrète ou si les réservations sont révélées, afficher le vrai statut
  if (status === 'available') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-50 text-green-700 border border-green-200">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
        Disponible
      </span>
    )
  }

  // Statut réservé
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
      Réservé
      {hasRevealed && reservedByName && reservedByName !== 'Anonyme' && (
        <span className="ml-1 text-xs">par {reservedByName}</span>
      )}
    </span>
  )
}

