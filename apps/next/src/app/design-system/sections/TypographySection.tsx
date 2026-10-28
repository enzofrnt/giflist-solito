import { Section, Specimen } from './Section'
import { typeScale } from '../showcase-data'

export function TypographySection() {
  return (
    <Section
      id="typography"
      kicker="03 · Typographie"
      title="Geist, enfin utilisé"
      lead="Geist Sans et Geist Mono sont déjà chargés par l’application mais le body forçait Arial. La nouvelle échelle les remet au centre : display, titres, corps, labels, légendes et mono."
    >
      <div className="ds-spec">
        <div className="ds-type-specimen">
          {typeScale.map((row) => (
            <div className="ds-type-row" key={row.className}>
              <div className="ds-type-row__meta">
                <strong>{row.label}</strong>
                <span>{row.spec}</span>
                <code className="ds-code">.{row.className}</code>
              </div>
              <div className={`ds-type-row__sample ${row.className}`}>{row.sample}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="Graisses" note="400 pour lire, 500 pour insister, 600 pour les titres et actions. 700 réservé aux très grands affichages.">
          <div className="ds-showcase__weight-demo">
            <p style={{ fontWeight: 400 }}>Regular — le corps de texte respire.</p>
            <p style={{ fontWeight: 500 }}>Medium — une information à retenir.</p>
            <p style={{ fontWeight: 600 }}>Semibold — un titre ou une action.</p>
            <p style={{ fontWeight: 700 }}>Bold — uniquement pour marquer.</p>
          </div>
        </Specimen>
        <Specimen label="Règles" note="Pas plus de deux tailles de titre par vue. Les paragraphes restent en corps 15 px, largeur 65–75 caractères.">
          <ul className="ds-showcase__check-list">
            <li>Texte principal en encre, secondaire en graphite.</li>
            <li>Jamais de bleu pour un paragraphe entier.</li>
            <li>Les nombres (prix, codes) utilisent Geist Mono tabulaire.</li>
            <li>Pas de texte justifié.</li>
          </ul>
        </Specimen>
      </div>
    </Section>
  )
}
