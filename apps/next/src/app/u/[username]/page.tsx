import { ListChecks } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function PublicUserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = await prisma.user.findFirst({
    where: { username: username.toLowerCase(), isPublic: true },
    select: {
      username: true,
      name: true,
      giftLists: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        select: { shareCode: true, title: true, description: true, _count: { select: { gifts: true } } },
      },
    },
  })
  if (!user) notFound()

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <header className="ds-page-header">
          <div className="ds-page-header__copy">
            <span className="ds-page-kicker">Profil public</span>
            <h1 className="ds-page-title">{user.name}</h1>
            <p className="ds-page-subtitle">@{user.username}</p>
          </div>
        </header>
        <section className="ds-stack ds-stack--gap-3">
          <h2 className="ds-h3">Listes publiques</h2>
          {user.giftLists.length === 0 ? <div className="ds-card"><div className="ds-card__body ds-body-sm ds-text-muted">Aucune liste publique.</div></div> : null}
          {user.giftLists.map((list) => (
            <article className="ds-card" key={list.shareCode}>
              <div className="ds-card__body ds-stack ds-stack--gap-2">
                <h3 className="ds-card__title">{list.title}</h3>
                {list.description ? <p className="ds-body-sm ds-text-muted">{list.description}</p> : null}
                <p className="ds-hint">{list._count.gifts} cadeau{list._count.gifts > 1 ? 'x' : ''}</p>
                <Link href={`/list/${list.shareCode}`} className="ds-btn ds-btn--primary ds-btn--sm" style={{ alignSelf: 'flex-start' }}>
                  <ListChecks size={16} className="ds-btn__icon" aria-hidden="true" />
                  Voir la liste
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
