import { Section } from './Section'
import { ArrowRightIcon, GiftIcon } from './icons'

export function CardsSection() {
  return (
    <Section
      id="surfaces"
      kicker="07 · Surfaces"
      title="Cartes, badges, fragments"
      lead="Le conteneur par défaut est une carte porcelain sur blanc, avec une ombre chaude discrète et une bordure de 1 px. Les badges ont un ton sémantique, jamais une couleur arbitraire."
    >
      <div className="ds-spec-grid">
        <div className="ds-card">
          <div className="ds-card__header">
            <div className="ds-stack" style={{ gap: 'var(--ds-space-1)' }}>
              <p className="ds-card__title">Anniversaire d’Enzo</p>
              <p className="ds-card__subtitle">Partagée · 12 cadeaux</p>
            </div>
            <span className="ds-badge ds-badge--success ds-badge--dot">Disponible</span>
          </div>
          <div className="ds-card__body">
            <p className="ds-body-sm">Une liste pour les proches, avec un lien unique et des réservations en temps réel.</p>
            <div className="ds-showcase__cluster">
              <span className="ds-chip">Anniversaire</span>
              <span className="ds-chip ds-chip--selected">Sélectionnée</span>
            </div>
          </div>
          <div className="ds-card__footer">
            <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm">Copier le lien</button>
            <button type="button" className="ds-btn ds-btn--primary ds-btn--sm">
              <span className="ds-btn__label">Ouvrir</span>
              <ArrowRightIcon className="ds-btn__icon" />
            </button>
          </div>
        </div>

        <div className="ds-card ds-card--interactive" tabIndex={0}>
          <div className="ds-card__body">
            <span className="ds-avatar ds-avatar--lg">GL</span>
            <div className="ds-stack" style={{ gap: 'var(--ds-space-1)' }}>
              <p className="ds-card__title">Cadeau réservé</p>
              <p className="ds-card__subtitle">Marie · il y a 4 minutes</p>
            </div>
            <p className="ds-body-sm">« Casque audio » a été réservé. Vous seul pouvez voir les détails de la réservation.</p>
            <div className="ds-showcase__cluster">
              <span className="ds-badge ds-badge--primary">Réservé</span>
              <span className="ds-badge ds-badge--neutral">12 €</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-spec ds-showcase__spaced">
        <span className="ds-spec__label">Badges</span>
        <div className="ds-showcase__cluster">
          <span className="ds-badge ds-badge--neutral">Neutre</span>
          <span className="ds-badge ds-badge--primary">Primaire</span>
          <span className="ds-badge ds-badge--success ds-badge--dot">Succès</span>
          <span className="ds-badge ds-badge--warning ds-badge--dot">Alerte</span>
          <span className="ds-badge ds-badge--danger ds-badge--dot">Erreur</span>
          <span className="ds-badge ds-badge--info">Info</span>
        </div>
      </div>

      <div className="ds-spec ds-showcase__spaced">
        <span className="ds-spec__label">Avatars & séparateurs</span>
        <div className="ds-showcase__cluster">
          <span className="ds-avatar ds-avatar--sm">A</span>
          <span className="ds-avatar">ML</span>
          <span className="ds-avatar ds-avatar--lg">GL</span>
          <span className="ds-avatar" style={{ background: 'var(--ds-color-accent-soft)', color: 'var(--ds-color-accent-700)' }}>E</span>
          <div className="ds-divider" style={{ width: '4rem' }} />
          <span className="ds-caption">Séparateur 1 px</span>
        </div>
      </div>

      <div className="ds-spec ds-showcase__spaced">
        <span className="ds-spec__label">Fiche cadeau (composition)</span>
        <div className="ds-card" style={{ maxWidth: '28rem' }}>
          <div className="ds-card__body">
            <span className="ds-badge ds-badge--success ds-badge--dot">Disponible</span>
            <div className="ds-stack" style={{ gap: 'var(--ds-space-1)' }}>
              <p className="ds-card__title">Casque audio sans fil</p>
              <p className="ds-card__subtitle">Sony WH-1000XM5 · 349 €</p>
            </div>
            <p className="ds-body-sm">Réduction de bruit, 30 h d’autonomie, coloris noir.</p>
            <div className="ds-showcase__cluster">
              <button type="button" className="ds-btn ds-btn--primary ds-btn--sm"><GiftIcon className="ds-btn__icon" /><span className="ds-btn__label">Réserver</span></button>
              <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm">Voir le site</button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
