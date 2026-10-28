import { Section } from './Section'
import { paletteGroups } from '../showcase-data'

export function PaletteSection() {
  return (
    <Section
      id="palette"
      kicker="02 · Couleurs"
      title="Porcelain, cobalt, corail"
      lead="Une palette sémantique unique : les composants ne choisissent jamais une couleur brute, ils choisissent un rôle. Les contrastes texte/fond sont annotés dans les tokens."
    >
      <div className="ds-showcase__stack">
        {paletteGroups.map((group) => (
          <div className="ds-spec" key={group.title}>
            <div className="ds-showcase__spec-head">
              <span className="ds-spec__label">{group.title}</span>
              <p className="ds-spec__note">{group.description}</p>
            </div>
            <div className="ds-swatch-grid">
              {group.swatches.map((swatch) => (
                <div className="ds-swatch" key={swatch.name}>
                  <div
                    className="ds-swatch__chip"
                    style={{ backgroundColor: `var(--ds-color-${swatch.token})` }}
                  />
                  <div className="ds-swatch__meta">
                    <span className="ds-swatch__name">{swatch.name}</span>
                    <span className="ds-swatch__hex">{swatch.hex}</span>
                    <span className="ds-caption">{swatch.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="ds-spec ds-showcase__spaced">
        <span className="ds-spec__label">Règles de couleur</span>
        <div className="ds-spec-grid">
          <div className="ds-showcase__rule-card">
            <span className="ds-badge ds-badge--primary">Primaire</span>
            <p className="ds-body-sm">Une seule action principale visible par écran. Survol et focus sont des états, pas des couleurs différentes.</p>
          </div>
          <div className="ds-showcase__rule-card">
            <span className="ds-badge ds-badge--danger">Danger</span>
            <p className="ds-body-sm">Rouge réservé à l’erreur et à la destruction. Le corail ne remplace jamais le rouge.</p>
          </div>
          <div className="ds-showcase__rule-card">
            <span className="ds-badge ds-badge--warning">Alerte</span>
            <p className="ds-body-sm">Toujours accompagné d’une icône et d’un texte. Ne jamais coder l’information par la seule couleur.</p>
          </div>
          <div className="ds-showcase__rule-card">
            <span className="ds-badge ds-badge--success">Succès</span>
            <p className="ds-body-sm">Vert pour une confirmation positive ; jamais pour un état « en attente ».</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
