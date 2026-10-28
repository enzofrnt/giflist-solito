import { Section, Specimen } from './Section'
import { radiusScale, shadowScale, spacingScale } from '../showcase-data'

export function SpacingSection() {
  return (
    <Section
      id="spacing"
      kicker="09 · Rythme"
      title="Un espacement qui se répète"
      lead="Une base de 4 px, des rayons de 6 à 28 px, cinq ombres chaudes. Les composants choisissent un pas, jamais une valeur improvisée."
    >
      <div className="ds-spec-grid">
        <Specimen label="Espacement">
          <div className="ds-space-scale">
            {spacingScale.map((space) => (
              <div className="ds-space-row" key={space.token}>
                <span className="ds-mono">--ds-space-{space.token}</span>
                <span
                  className="ds-space-row__bar"
                  style={{ width: `var(--ds-space-${space.token})` }}
                />
                <span>{space.value}</span>
              </div>
            ))}
          </div>
        </Specimen>

        <Specimen label="Rayons">
          <div className="ds-radius-grid">
            {radiusScale.map((radius) => (
              <div
                className="ds-radius-box"
                key={radius.token}
                style={{ borderRadius: `var(--ds-radius-${radius.token})` }}
              >
                {radius.token} · {radius.value}
              </div>
            ))}
          </div>
        </Specimen>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="Ombres">
          <div className="ds-shadow-grid">
            {shadowScale.map((shadow) => (
              <div
                className="ds-shadow-box"
                key={shadow}
                style={{ boxShadow: `var(--ds-shadow-${shadow})` }}
              >
                {shadow}
              </div>
            ))}
          </div>
        </Specimen>

        <Specimen label="Largeurs de contenu">
          <div className="ds-showcase__widths">
            {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((container) => (
              <div className="ds-showcase__width-row" key={container}>
                <span className="ds-mono">container-{container}</span>
                <span
                  className="ds-showcase__width-bar"
                  style={{ width: `var(--ds-container-${container})` }}
                />
              </div>
            ))}
          </div>
        </Specimen>
      </div>

      <div className="ds-spec ds-showcase__spaced">
        <span className="ds-spec__label">Règles de composition</span>
        <div className="ds-spec-grid">
          <div className="ds-showcase__rule-card">
            <p className="ds-label">Une colonne, une largeur</p>
            <p className="ds-body-sm">Les formulaires restent entre 28 et 40 rem ; les listes utilisent le conteneur xl.</p>
          </div>
          <div className="ds-showcase__rule-card">
            <p className="ds-label">Sections aérées</p>
            <p className="ds-body-sm">48 px entre deux sections, 24 px entre un titre et son contenu.</p>
          </div>
          <div className="ds-showcase__rule-card">
            <p className="ds-label">Pas d’exception locale</p>
            <p className="ds-body-sm">Si une page a besoin d’un espacement, elle utilise un token existant ou propose un nouveau token.</p>
          </div>
          <div className="ds-showcase__rule-card">
            <p className="ds-label">Tactile d’abord</p>
            <p className="ds-body-sm">44 px de cible minimum, 8 px entre deux cibles adjacentes.</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
