'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'

const FEATURES = [
  {
    title: 'Créez facilement',
    text: 'Une liste pour chaque occasion, en quelques secondes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    title: 'Partagez simplement',
    text: 'Un lien unique ou un QR code, sans compte pour vos proches.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.6 13.4 15.4 9.2M8.6 10.6l6.8 4.2" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="7" r="2.5" />
        <circle cx="18" cy="17" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Suivez les réservations',
    text: 'Voyez qui a réservé quoi, en temps réel, sans spoiler.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 4.5 4.5L19 7" />
      </svg>
    ),
  },
]

export function HomePage() {
  const { user } = useAuthContext()
  const primaryHref = user ? '/dashboard' : '/register'
  const primaryLabel = user ? 'Voir mes listes' : 'Commencer maintenant'

  return (
    <div className="ds-home">
      <main className="ds-home__main">
        <section className="ds-home__hero" aria-labelledby="home-title">
          <div className="ds-home__copy">
            <span className="ds-overline">Listes de cadeaux</span>
            <h1 className="ds-home__title" id="home-title">
              Des cadeaux qui font <em>plaisir</em>.
            </h1>
            <p className="ds-home__lead">
              Créez et partagez vos listes de cadeaux facilement. Invitez vos proches à réserver
              via un QR code ou un lien direct, sans créer de compte.
            </p>
            <div className="ds-home__actions">
              <Link href={primaryHref} className="ds-btn ds-btn--primary ds-btn--lg">
                {primaryLabel}
              </Link>
              {user ? null : (
                <Link href="/login" className="ds-btn ds-btn--secondary ds-btn--lg">
                  Se connecter
                </Link>
              )}
            </div>
            <div className="ds-home__meta">
              <span>Gratuit</span>
              <span aria-hidden="true">·</span>
              <span>Aucune carte bancaire</span>
              <span aria-hidden="true">·</span>
              <span>Partage sans compte</span>
            </div>
          </div>

          <div className="ds-home__art">
            <Image
              src="/logo.webp"
              alt="Giftlist — liste de cadeaux"
              width={1536}
              height={1024}
              className="ds-home__logo"
              priority
            />
          </div>
        </section>

        <section className="ds-home__features" aria-label="Fonctionnalités">
          {FEATURES.map((feature) => (
            <article className="ds-home__feature" key={feature.title}>
              <span className="ds-home__feature-icon">{feature.icon}</span>
              <h2 className="ds-home__feature-title">{feature.title}</h2>
              <p className="ds-home__feature-text">{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="ds-home__strip" aria-label="Prêt à commencer">
          <div>
            <p className="ds-home__strip-title">Une liste, un lien, zéro friction.</p>
            <p className="ds-home__strip-text">Vos proches réservent sans créer de compte.</p>
          </div>
          <Link href={primaryHref} className="ds-btn ds-btn--accent ds-btn--md">
            {primaryLabel}
          </Link>
        </section>
      </main>
    </div>
  )
}
