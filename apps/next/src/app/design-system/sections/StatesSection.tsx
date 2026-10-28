import { Section, Specimen } from './Section'
import { GiftIcon } from './icons'

export function StatesSection() {
  return (
    <Section
      id="states"
      kicker="08 · États"
      title="Le feedback est un état, pas une surprise"
      lead="Chaque composant interactif montre son état : survol, focus clavier, pression, désactivation, chargement. Le focus est toujours un anneau visible, jamais une outline supprimée."
    >
      <div className="ds-spec">
        <div className="ds-state-table">
          <div className="ds-state-row">
            <span>État</span>
            <span>Démonstration</span>
            <span>Règle</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Focus</span>
            <span><button type="button" className="ds-btn ds-btn--secondary ds-btn--sm ds-demo-focus">Focus visible</button></span>
            <span className="ds-body-sm">2 px encre/bleu + offset 2 px, jamais retiré.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Survol</span>
            <span><button type="button" className="ds-btn ds-btn--secondary ds-btn--sm">Survolez-moi</button></span>
            <span className="ds-body-sm">Fond plus contrasté, pas de déplacement.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Sélection</span>
            <span><span className="ds-chip ds-chip--selected">Sélectionné</span></span>
            <span className="ds-body-sm">Fond doux + bordure primaire ; jamais une couleur seule.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Désactivé</span>
            <span><button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" disabled>Indisponible</button></span>
            <span className="ds-body-sm">Opacité 55 %, curseur interdit, inchangé au survol.</span>
          </div>
          <div className="ds-state-row">
            <span className="ds-label">Chargement</span>
            <span><button type="button" className="ds-btn ds-btn--primary ds-btn--sm ds-btn--loading" aria-busy="true"><span className="ds-btn__spinner" aria-hidden="true" /><span className="ds-btn__label">Chargement…</span></button></span>
            <span className="ds-body-sm">aria-busy, largeur stable, spinner désactivé en reduced motion.</span>
          </div>
        </div>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="Carte interactive" note="Tabulez jusqu’à la carte : le focus est visible sur le conteneur.">
          <div className="ds-card ds-card--interactive" tabIndex={0}>
            <div className="ds-card__body">
              <span className="ds-empty__icon"><GiftIcon /></span>
              <p className="ds-card__title">Carte focusable</p>
              <p className="ds-body-sm">Utilisée pour une carte cliquable ; le focus reste visible même sans survol.</p>
            </div>
          </div>
        </Specimen>
        <Specimen label="Champ focus" note="Le focus du champ se superpose à la bordure, pas à la place.">
          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-state-input">Recherche</label>
            <input className="ds-input ds-demo-focus" id="ds-state-input" placeholder="Rechercher un cadeau…" />
          </div>
        </Specimen>
      </div>
    </Section>
  )
}
