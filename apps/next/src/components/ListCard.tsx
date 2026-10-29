import Image from 'next/image'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import type { ReactNode } from 'react'

export type ListCardData = {
  title: string
  description?: string | null
  image?: string | null
  giftsCount: number
  isPublic?: boolean
  secret?: boolean
  createdAt?: string
}

export function ListCard({
  list,
  context,
  href,
  footer,
}: {
  list: ListCardData
  context: 'owner' | 'public'
  href?: string
  footer?: ReactNode
}) {
  const title = href ? <Link href={href} className="ds-card__title">{list.title}</Link> : <h3 className="ds-card__title">{list.title}</h3>
  return (
    <article className="ds-card ds-list-card">
      <div className="ds-list-card__media">
        {list.image ? (
          <Image
            src={list.image}
            alt={list.title}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="ds-list-card__placeholder" aria-hidden="true">
            <Gift size={26} strokeWidth={1.8} />
            <span>Aucune image</span>
          </div>
        )}
      </div>
      <div className="ds-card__body ds-list-card__body">
        <div className="flex flex-wrap items-start justify-between gap-2">
          {title}
          {context === 'owner' ? (
            <span className={`ds-badge ds-badge--dot ${list.isPublic === false ? 'ds-badge--warning' : 'ds-badge--success'}`}>
              {list.isPublic === false ? 'Privée' : 'Publique'}
            </span>
          ) : null}
        </div>
        {list.description ? <p className="ds-card__subtitle line-clamp-2">{list.description}</p> : null}
        <div className="ds-hint flex flex-wrap items-center justify-between gap-2">
          <span>{list.giftsCount} cadeau{list.giftsCount > 1 ? 'x' : ''}{context === 'owner' && list.secret ? ' · Mode secret' : ''}</span>
          {list.createdAt ? <span>Créée le {new Date(list.createdAt).toLocaleDateString('fr-FR')}</span> : null}
        </div>
      </div>
      {footer ? <div className="ds-card__footer ds-list-card__footer">{footer}</div> : null}
    </article>
  )
}
