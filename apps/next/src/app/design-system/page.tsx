import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { BrandSection } from './sections/BrandSection'
import { ButtonsSection } from './sections/ButtonsSection'
import { CardsSection } from './sections/CardsSection'
import { FeedbackSection } from './sections/FeedbackSection'
import { FormsSection } from './sections/FormsSection'
import { PaletteSection } from './sections/PaletteSection'
import { PasswordStrengthSection } from './sections/PasswordStrengthSection'
import { ShowcaseNav } from './sections/ShowcaseNav'
import { SpacingSection } from './sections/SpacingSection'
import { StatesSection } from './sections/StatesSection'
import { TypographySection } from './sections/TypographySection'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Design system — Giftlist',
  description: 'Revue de la proposition de design system Giftlist (Phase 1).',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Design system — Giftlist',
    description: 'Revue de la proposition de design system Giftlist (Phase 1).',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Design system — Giftlist',
    description: 'Revue de la proposition de design system Giftlist (Phase 1).',
  },
}

export default function DesignSystemPage() {
  // Review-only: the showcase must never be served as a public product page.
  // Preview and local builds keep VERCEL_ENV unset or 'preview'.
  if (process.env.VERCEL_ENV === 'production') {
    notFound()
  }

  return (
    <div className="ds-showcase">
      <header className="ds-showcase__topbar">
        <a className="ds-showcase__brand" href="#top">
          <span className="ds-showcase__brand-mark" aria-hidden="true">G</span>
          <span>Giftlist · Design system</span>
        </a>
        <div className="ds-showcase__topbar-meta">
          <span>Phase 1 · proposition</span>
          <span className="ds-showcase__badge">Rev. 0.1</span>
        </div>
      </header>

      <div className="ds-showcase__shell" id="top">
        <ShowcaseNav />

        <main className="ds-showcase__main">
          <section className="ds-showcase__hero" aria-labelledby="ds-hero-title">
            <div className="ds-showcase__hero-copy">
              <span className="ds-overline">Identité visuelle · à valider</span>
              <h1 className="ds-showcase__hero-title" id="ds-hero-title">
                Porcelain <em>&</em> Cobalt
              </h1>
              <p className="ds-showcase__hero-lead">
                Une base chaleureuse, un cobalt d’action et un corail de célébration. Giftlist garde
                son logo et son bleu, mais gagne un système cohérent, accessible et maintenable.
              </p>
              <div className="ds-showcase__hero-meta">
                <span className="ds-showcase__meta-item">Web uniquement</span>
                <span className="ds-showcase__meta-item">Phase 1 · aucune page restylée</span>
                <span className="ds-showcase__meta-item">SCSS + tokens</span>
                <span className="ds-showcase__meta-item">Revue avant Phase 2</span>
              </div>
            </div>
            <div className="ds-showcase__hero-art">
              <Image
                src="/logo.webp"
                alt="Giftlist — logo liste de cadeaux"
                width={1536}
                height={1024}
                className="ds-showcase__hero-logo"
                priority
              />
              <span className="ds-showcase__art-note">Logo conservé</span>
            </div>
          </section>

          <BrandSection />
          <PaletteSection />
          <TypographySection />
          <ButtonsSection />
          <FormsSection />
          <FeedbackSection />
          <CardsSection />
          <StatesSection />
          <SpacingSection />
          <PasswordStrengthSection />

          <section className="ds-showcase__section" id="next" aria-labelledby="ds-next-title">
            <div className="ds-showcase__section-head">
              <span className="ds-showcase__section-kicker">Et ensuite ?</span>
              <h2 className="ds-showcase__section-title" id="ds-next-title">
                Phase 2, seulement après validation
              </h2>
              <p className="ds-showcase__section-lead">
                Ce showcase est la source de vérité visuelle. Une fois approuvé, la Phase 2
                appliquera ces tokens et composants à chaque écran, remplacera les styles dupliqués
                et supprimera les exceptions page par page. Aucune page n’a été restylée ici.
              </p>
            </div>
            <div className="ds-spec">
              <span className="ds-spec__label">Décision attendue</span>
              <ul className="ds-showcase__check-list">
                <li>Approuver la direction Porcelain & Cobalt.</li>
                <li>Demander des ajustements sur la palette, la typographie ou les composants.</li>
                <li>Confirmer que le showcase reste disponible en preview après la Phase 2.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>

      <footer className="ds-showcase__footer">
        <span>Giftlist · design system Phase 1 · 2026</span>
        <span>
          <a className="ds-link" href="#top">Revenir en haut</a>
        </span>
      </footer>
    </div>
  )
}
