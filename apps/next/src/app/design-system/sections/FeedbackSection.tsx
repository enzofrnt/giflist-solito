import { Section, Specimen } from './Section'
import { ErrorIcon, GiftIcon, InfoIcon, WarningIcon } from './icons'

export function FeedbackSection() {
  return (
    <Section
      id="feedback"
      kicker="06 · Messages"
      title="Informer sans crier"
      lead="Quatre tons, un même gabarit : icône, titre, message. La couleur accompagne le texte, elle ne le remplace jamais."
    >
      <div className="ds-spec">
        <div className="ds-showcase__stack">
          <div className="ds-alert ds-alert--info" role="status">
            <span className="ds-alert__icon"><InfoIcon /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Votre liste est prête à être partagée</p>
              <p className="ds-alert__message">Copiez le lien ou affichez le QR code pour inviter vos proches.</p>
            </div>
          </div>
          <div className="ds-alert ds-alert--success" role="status">
            <span className="ds-alert__icon"><GiftIcon /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Cadeau réservé</p>
              <p className="ds-alert__message">Marie a réservé « Casque audio » pour votre anniversaire.</p>
            </div>
          </div>
          <div className="ds-alert ds-alert--warning" role="status">
            <span className="ds-alert__icon"><WarningIcon /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Cette liste est en mode secret</p>
              <p className="ds-alert__message">Les réservations restent visibles uniquement par vous.</p>
            </div>
          </div>
          <div className="ds-alert ds-alert--danger" role="alert">
            <span className="ds-alert__icon"><ErrorIcon /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Impossible d’enregistrer</p>
              <p className="ds-alert__message">Vérifiez votre connexion puis réessayez. Vos modifications n’ont pas été perdues.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="État vide" note="Toujours une action claire pour sortir de l’état vide.">
          <div className="ds-empty">
            <span className="ds-empty__icon"><GiftIcon /></span>
            <p className="ds-empty__title">Aucun cadeau pour le moment</p>
            <p className="ds-empty__message">Ajoutez votre première envie ou importez-la depuis un lien produit.</p>
            <button type="button" className="ds-btn ds-btn--primary ds-btn--sm">Ajouter un cadeau</button>
          </div>
        </Specimen>
        <Specimen label="Chargement" note="Squelettes discrets, sans animation si prefers-reduced-motion.">
          <div className="ds-showcase__stack">
            <div className="ds-skeleton ds-skeleton--title" />
            <div className="ds-skeleton ds-skeleton--text" />
            <div className="ds-skeleton ds-skeleton--text" style={{ width: '82%' }} />
            <div className="ds-skeleton ds-skeleton--text" style={{ width: '64%' }} />
          </div>
        </Specimen>
      </div>
    </Section>
  )
}
