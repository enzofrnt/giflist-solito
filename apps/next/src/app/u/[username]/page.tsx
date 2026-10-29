import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ListCard } from '@/components/ListCard'
import { getPublicProfile } from '@/lib/public-profile'
import { pageMetadata } from '@/lib/seo'
import { normalizeUsername } from '@/lib/usernames'

export const dynamic = 'force-dynamic'

interface PublicUserPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PublicUserPageProps): Promise<Metadata> {
  const { username } = await params
  const normalized = normalizeUsername(username)
  const profile = await getPublicProfile(normalized)

  if (!profile) {
    return pageMetadata({
      title: 'Profil introuvable',
      description: 'Ce profil Giftlist n’existe pas ou n’est pas public.',
      path: `/u/${normalized}`,
      private: true,
    })
  }

  const count = profile.giftLists.length
  const description =
    count === 1
      ? `Découvrez la liste de cadeaux publique de @${profile.username} sur Giftlist.`
      : `Découvrez les ${count} listes de cadeaux publiques de @${profile.username} sur Giftlist.`

  return pageMetadata({
    title: `Listes de cadeaux de @${profile.username}`,
    description,
    path: `/u/${profile.username}`,
  })
}

export default async function PublicUserPage({ params }: PublicUserPageProps) {
  const { username } = await params
  const user = await getPublicProfile(normalizeUsername(username))
  if (!user) notFound()

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <header className="ds-page-header">
          <div className="ds-page-header__copy">
            <span className="ds-page-kicker">Profil public</span>
            <h1 className="ds-page-title">@{user.username}</h1>
            <p className="ds-page-subtitle">
              {user.giftLists.length === 0
                ? 'Aucune liste publique pour le moment.'
                : `${user.giftLists.length} liste${user.giftLists.length > 1 ? 's' : ''} de cadeaux à découvrir.`}
            </p>
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
