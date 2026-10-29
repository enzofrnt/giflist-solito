import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Gift } from 'app/types'

/** Shared visual contract for gift cards (owner/public). */
export function GiftCard({
  gift,
  badge,
  footer,
}: {
  gift: Gift
  badge?: ReactNode
  footer?: ReactNode
}) {
  return (
    <article className="ds-card">
      <div className="ds-card__body">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="ds-card ds-card--flat mx-auto flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden sm:mx-0">
            {gift.image ? (
              <Image
                src={gift.image}
                alt={gift.title}
                width={128}
                height={96}
                className="h-full w-full object-contain"
                unoptimized
              />
            ) : (
              <span className="ds-empty__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </span>
            )}
          </div>

          <div className="ds-stack ds-stack--gap-2 min-w-0 flex-1">
            <h3 className="ds-card__title break-words">{gift.title}</h3>
            <div className="ds-cluster">
              {gift.price != null ? <span className="ds-chip">{gift.price} €</span> : null}
              {badge}
            </div>
            {gift.description ? <p className="ds-card__subtitle break-words">{gift.description}</p> : null}
            {gift.url ? (
              <a href={gift.url} target="_blank" rel="noopener noreferrer" className="ds-btn ds-btn--ghost ds-btn--sm min-h-11 self-start">
                <svg className="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le produit
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
      {footer ? <div className="ds-card__footer">{footer}</div> : null}
    </article>
  )
}
