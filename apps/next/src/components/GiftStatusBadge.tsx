import type { ReactNode } from 'react'

interface GiftStatusBadgeProps {
  status: 'available' | 'reserved'
  reservedByName?: string
  isSecret: boolean
  hasRevealed: boolean
  variant?: 'default' | 'public'
}

function Badge({ tone, children }: { tone: 'success' | 'warning' | 'neutral'; children: ReactNode }) {
  return <span className={`ds-badge ds-badge--${tone} ds-badge--dot`}>{children}</span>
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
      return <Badge tone="success">Disponible</Badge>
    }

    // Sur la page de modification, on affiche "Statut masqué"
    return <Badge tone="neutral">Statut masqué</Badge>
  }

  // Si la liste n'est pas secrète ou si les réservations sont révélées, afficher le vrai statut
  if (status === 'available') {
    return <Badge tone="success">Disponible</Badge>
  }

  const showName = hasRevealed && reservedByName && reservedByName !== 'Anonyme'

  return (
    <Badge tone="warning">
      {showName ? `Réservé par ${reservedByName}` : 'Réservé'}
    </Badge>
  )
}
