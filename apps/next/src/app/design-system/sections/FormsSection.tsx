import { Section, Specimen } from './Section'

export function FormsSection() {
  return (
    <Section
      id="forms"
      kicker="05 · Formulaires"
      title="Des champs qui se ressemblent"
      lead="Le même champ, le même label, le même message d’erreur partout. Les états sont explicites, les labels sont réels et les erreurs sont reliées au champ."
    >
      <div className="ds-spec">
        <div className="ds-form-grid">
          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-demo-email">
              Adresse e-mail <span className="ds-label__required">*</span>
            </label>
            <input
              className="ds-input"
              id="ds-demo-email"
              type="email"
              defaultValue="enzo@example.com"
              autoComplete="email"
              required
            />
            <p className="ds-hint">Utilisée pour la connexion et les notifications de compte.</p>
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-demo-name">Nom affiché</label>
            <input className="ds-input" id="ds-demo-name" defaultValue="Enzo" />
            <p className="ds-hint">Visible sur les listes partagées.</p>
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-demo-select">Occasion</label>
            <select className="ds-select" id="ds-demo-select" defaultValue="anniversaire">
              <option value="anniversaire">Anniversaire</option>
              <option value="noel">Noël</option>
              <option value="mariage">Mariage</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-demo-invalid">Adresse e-mail</label>
            <input
              className="ds-input"
              id="ds-demo-invalid"
              type="email"
              defaultValue="pas-un-email"
              aria-invalid="true"
              aria-describedby="ds-demo-invalid-error"
            />
            <p className="ds-error" id="ds-demo-invalid-error">Cette adresse e-mail n’est pas valide.</p>
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-demo-disabled">Champ désactivé</label>
            <input className="ds-input" id="ds-demo-disabled" defaultValue="Non modifiable" disabled />
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor="ds-demo-readonly">Lecture seule</label>
            <input className="ds-input" id="ds-demo-readonly" defaultValue="GIFT-2026-0042" readOnly />
          </div>

          <div className="ds-field ds-form-grid--full">
            <label className="ds-label" htmlFor="ds-demo-message">Message</label>
            <textarea className="ds-textarea" id="ds-demo-message" defaultValue="Ajoutez un mot pour vos proches…" />
            <p className="ds-hint">255 caractères maximum. Ce texte apparaît sur la liste publique.</p>
          </div>
        </div>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="Cases & options" note="Inputs natifs conservés et agrandis, focus visible, libellé cliquable.">
          <div className="ds-showcase__stack">
            <label className="ds-check">
              <input type="checkbox" defaultChecked />
              <span>Recevoir un e-mail quand un cadeau est réservé</span>
            </label>
            <label className="ds-check">
              <input type="checkbox" />
              <span>Recevoir le récapitulatif hebdomadaire</span>
            </label>
            <div className="ds-showcase__cluster">
              <label className="ds-check">
                <input type="radio" name="ds-demo-radio" defaultChecked />
                <span>Liste publique</span>
              </label>
              <label className="ds-check">
                <input type="radio" name="ds-demo-radio" />
                <span>Liste privée</span>
              </label>
              <label className="ds-check">
                <input type="radio" name="ds-demo-radio" disabled />
                <span>Désactivé</span>
              </label>
            </div>
          </div>
        </Specimen>

        <Specimen label="Interrupteurs" note="role=switch, aria-checked, focus visible ; le libellé reste lisible à gauche.">
          <div className="ds-showcase__stack">
            <label className="ds-switch">
              <input type="checkbox" role="switch" defaultChecked aria-label="Liste secrète" />
              <span className="ds-switch__track" />
              <span className="ds-switch__text">Mode secret</span>
            </label>
            <label className="ds-switch">
              <input type="checkbox" role="switch" aria-label="Notifications" />
              <span className="ds-switch__track" />
              <span className="ds-switch__text">Notifications</span>
            </label>
            <label className="ds-switch">
              <input type="checkbox" role="switch" disabled aria-label="Option indisponible" />
              <span className="ds-switch__track" />
              <span className="ds-switch__text">Option indisponible</span>
            </label>
          </div>
        </Specimen>
      </div>
    </Section>
  )
}
