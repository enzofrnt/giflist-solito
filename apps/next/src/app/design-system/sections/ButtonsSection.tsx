import { Section, Specimen } from './Section'
import { ArrowRightIcon, GiftIcon } from './icons'
import { buttonSizes, buttonVariants } from '../showcase-data'

export function ButtonsSection() {
  return (
    <Section
      id="buttons"
      kicker="04 · Actions"
      title="Un seul langage de bouton"
      lead="Fin des 19 variantes de bleu copiées à la main. Cinq intentions, trois tailles, des états cohérents et un focus toujours visible."
    >
      <div className="ds-spec">
        <span className="ds-spec__label">Intentions</span>
        <div className="ds-btn-grid">
          {buttonVariants.map((variant) => (
            <div className="ds-btn-cell" key={variant.variant}>
              <span className="ds-btn-cell__label">{variant.label}</span>
              <button type="button" className={`ds-btn ds-btn--${variant.variant} ds-btn--md`}>
                {variant.variant === 'accent' ? <GiftIcon className="ds-btn__icon" /> : null}
                <span className="ds-btn__label">{variant.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="Tailles" note="44 px minimum de hauteur pour le tactile ; petit et grand restent dans le même rythme.">
          <div className="ds-showcase__cluster">
            {buttonSizes.map((size) => (
              <button type="button" className={`ds-btn ds-btn--primary ds-btn--${size.size}`} key={size.size}>
                <span className="ds-btn__label">{size.label}</span>
              </button>
            ))}
          </div>
        </Specimen>

        <Specimen label="Avec icône / chargement" note="Le spinner ne change jamais la largeur du bouton.">
          <div className="ds-showcase__cluster">
            <button type="button" className="ds-btn ds-btn--primary ds-btn--md">
              <span className="ds-btn__label">Continuer</span>
              <ArrowRightIcon className="ds-btn__icon" />
            </button>
            <button type="button" className="ds-btn ds-btn--secondary ds-btn--md">
              <GiftIcon className="ds-btn__icon" />
              <span className="ds-btn__label">Ajouter</span>
            </button>
            <button type="button" className="ds-btn ds-btn--primary ds-btn--md ds-btn--loading" aria-busy="true">
              <span className="ds-btn__spinner" aria-hidden="true" />
              <span className="ds-btn__label">Enregistrement…</span>
            </button>
          </div>
        </Specimen>
      </div>

      <div className="ds-spec ds-showcase__spaced">
        <span className="ds-spec__label">États</span>
        <div className="ds-state-table">
          <div className="ds-state-row">
            <span>État</span>
            <span>Exemple</span>
            <span>Comportement</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Repos</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm">Enregistrer</button></span>
            <span className="ds-body-sm">Action principale.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Survol</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm">Survolez-moi</button></span>
            <span className="ds-body-sm">Fond plus profond, pas de saut de taille.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Focus</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm ds-demo-focus">Focus visible</button></span>
            <span className="ds-body-sm">Anneau 2 px + offset, jamais supprimé.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Actif</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm">Cliquez</button></span>
            <span className="ds-body-sm">Léger enfoncement de 1 px.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Désactivé</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm" disabled>Indisponible</button></span>
            <span className="ds-body-sm">Opacité réduite, curseur interdit.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Chargement</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm ds-btn--loading" aria-busy="true"><span className="ds-btn__spinner" aria-hidden="true" /><span className="ds-btn__label">Envoi…</span></button></span>
            <span className="ds-body-sm">Largeur stable, `aria-busy`.</span>
          </div>
        </div>
      </div>
    </Section>
  )
}
