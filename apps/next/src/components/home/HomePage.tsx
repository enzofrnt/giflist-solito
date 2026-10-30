'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'

const STEPS = [
  {
    step: '01',
    title: 'Créez votre liste',
    text: 'Ajoutez vos envies en quelques secondes, avec un lien produit ou manuellement.',
  },
  {
    step: '02',
    title: 'Partagez le lien',
    text: 'Un lien unique ou un QR code. Vos proches n’ont pas besoin de créer un compte.',
  },
  {
    step: '03',
    title: 'Laissez réserver',
    text: 'Vos proches réservent sans spoiler ; vous suivez les réservations en temps réel.',
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
              sizes="(max-width: 768px) 70vw, 352px"
              className="ds-home__logo"
              priority
              fetchPriority="high"
            />
          </div>
        </section>

        <section className="ds-home__steps" aria-labelledby="how-it-works-title">
          <div className="ds-home__steps-head">
            <span className="ds-overline">Comment ça marche</span>
            <h2 className="ds-home__steps-title" id="how-it-works-title">Trois étapes, zéro friction.</h2>
            <p className="ds-body-sm">Créez, partagez, laissez réserver. Le reste est automatique.</p>
          </div>
          <ol className="ds-home__steps-list">
            {STEPS.map((step) => (
              <li className="ds-home__step" key={step.step}>
                <span className="ds-home__step-number" aria-hidden="true">{step.step}</span>
                <h3 className="ds-home__step-title">{step.title}</h3>
                <p className="ds-home__step-text">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
