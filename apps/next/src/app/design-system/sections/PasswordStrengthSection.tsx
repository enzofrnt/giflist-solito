'use client'

import { useState } from 'react'
import { Section, Specimen } from './Section'
import { StrengthMeter } from './StrengthMeter'
import { EyeIcon, EyeOffIcon } from './icons'

const STRENGTH_EXAMPLES = [
  { label: 'Très faible', value: 'aaaa' },
  { label: 'Faible', value: 'giftlist' },
  { label: 'Moyen', value: 'Giftlist' },
  { label: 'Fort', value: 'Giftlist1' },
  { label: 'Très fort', value: 'Giftlist1!' },
]

export function PasswordStrengthSection() {
  const [password, setPassword] = useState('Giftlist2026!')
  const [visible, setVisible] = useState(false)

  return (
    <Section
      id="password"
      kicker="10 · Mot de passe"
      title="La robustesse, réutilisée et corrigée"
      lead="L’indicateur existant est conservé : mêmes règles serveur, mêmes libellés, même checklist. La logique est extraite dans packages/app, deux défauts sont corrigés et le composant expose enfin un vrai rôle de jauge."
    >
      <div className="ds-spec">
        <div className="ds-strength-demo">
          <div className="ds-strength-demo__panel">
            <div className="ds-field">
              <label className="ds-label" htmlFor="ds-password">
                Mot de passe
              </label>
              <div className="ds-showcase__input-wrap">
                <input
                  className="ds-input"
                  id="ds-password"
                  type={visible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  aria-describedby="ds-password-help"
                />
                <button
                  type="button"
                  className="ds-showcase__input-action"
                  onClick={() => setVisible((current) => !current)}
                  aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {visible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="ds-hint" id="ds-password-help">
                Les règles sont identiques côté client et côté API (8 caractères, minuscule, majuscule, chiffre, caractère spécial).
              </p>
            </div>
            <StrengthMeter value={password} />

            <ListePresets onChange={setPassword} />
          </div>

          <div className="ds-strength-demo__preview">
            <span className="ds-spec__label">Exemples par niveau</span>
            <div className="ds-showcase__stack">
              {STRENGTH_EXAMPLES.map((example) => (
                <div className="ds-showcase__strength-example" key={example.label}>
                  <span className="ds-caption">{example.label}</span>
                  <StrengthMeter value={example.value} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="Ce qui est conservé" note="La source de vérité reste getPasswordRules / validatePassword, partagée avec l’API.">
          <ul className="ds-showcase__check-list">
            <li>Les cinq règles et leurs libellés français.</li>
            <li>La checklist avec coche/croix.</li>
            <li>Le bouton afficher/masquer et son libellé accessible.</li>
            <li>Les niveaux Très faible → Très fort.</li>
          </ul>
        </Specimen>
        <Specimen label="Ce qui est corrigé" note="Pas de nouvelle règle produit : seulement une présentation cohérente et accessible.">
          <ul className="ds-showcase__check-list">
            <li>Barre visible dès qu’un mot de passe est saisi (plus de 0 % trompeur).</li>
            <li>Progression et libellé strictement croissants.</li>
            <li>role=meter, aria-valuenow, aria-valuetext et aria-live.</li>
            <li>Styles alignés sur les tokens de force.</li>
          </ul>
        </Specimen>
      </div>
    </Section>
  )
}

function ListePresets({ onChange }: { onChange: (value: string) => void }) {
  return (
    <div>
      <span className="ds-spec__label">Essayer un niveau</span>
      <div className="ds-strength-demo__presets">
        {STRENGTH_EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            className="ds-btn ds-btn--secondary ds-btn--sm"
            onClick={() => onChange(example.value)}
          >
            {example.label}
          </button>
        ))}
        <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={() => onChange('')}>
          Vide
        </button>
      </div>
    </div>
  )
}
