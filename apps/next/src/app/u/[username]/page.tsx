import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ListCard } from '@/components/ListCard'

export const dynamic = 'force-dynamic'

export default async function PublicUserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = await prisma.user.findFirst({
    where: { username: username.toLowerCase(), isPublic: true },
    select: {
      username: true,
      giftLists: {
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        select: { shareCode: true, title: true, description: true, image: true, createdAt: true, _count: { select: { gifts: true } } },
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
            <h1 className="ds-page-title">@{user.username}</h1>
            <p className="ds-page-subtitle">@{user.username}</p>
          </div>
        </header>
        <section className="ds-stack ds-stack--gap-3">
          <h2 className="ds-h3">Listes publiques</h2>
          {user.giftLists.length === 0 ? <div className="ds-card"><div className="ds-card__body ds-body-sm ds-text-muted">Aucune liste publique.</div></div> : null}
          {user.giftLists.map((list) => (
            <ListCard
              key={list.shareCode}
              list={{ title: list.title, description: list.description, image: list.image, giftsCount: list._count.gifts, createdAt: list.createdAt.toISOString() }}
              context="public"
              href={`/list/${list.shareCode}`}
              footer={<Link href={`/list/${list.shareCode}`} className="ds-btn ds-btn--primary ds-btn--sm">Voir la liste</Link>}
            />
          ))}
        </section>
      </main>
    </div>
  )
}
