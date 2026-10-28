import Image from 'next/image'
import { Section, Specimen } from './Section'
import { CheckIcon, GiftIcon } from './icons'

export function BrandSection() {
  return (
    <Section
      id="brand"
      kicker="01 · Marque"
      title="Une identité chaleureuse, pas enfantine"
      lead="Giftlist garde son logo et son bleu historique, mais gagne un socle chaud, une typographie assumée et un accent corail réservé aux moments de cadeau."
    >
      <div className="ds-spec-grid">
        <Specimen label="Logo principal" note="Fichier existant /logo.webp — conservé tel quel.">
          <div className="ds-showcase__logo-panel">
            <Image
              src="/logo.webp"
              alt="Giftlist — liste de cadeaux"
              width={1536}
              height={1024}
              className="ds-showcase__logo"
              priority={false}
            />
          </div>
        </Specimen>

        <Specimen label="Surfaces de marque" note="Le logo noir fonctionne sur porcelain et sur blanc. Sur encre, utiliser la version claire ou un cartouche.">
          <div className="ds-showcase__brand-surfaces">
            <div className="ds-showcase__brand-surface ds-showcase__brand-surface--porcelain">
              <Image src="/logo.webp" alt="" width={1536} height={1024} aria-hidden="true" />
            </div>
            <div className="ds-showcase__brand-surface ds-showcase__brand-surface--ink">
              <span>Giftlist</span>
            </div>
            <div className="ds-showcase__brand-surface ds-showcase__brand-surface--accent">
              <GiftIcon />
            </div>
          </div>
        </Specimen>
      </div>

      <div className="ds-spec-grid ds-showcase__spaced">
        <Specimen label="À faire">
          <ul className="ds-showcase__check-list">
            <li><CheckIcon /> Laisser respirer le logo (marge ≥ hauteur du « G »).</li>
            <li><CheckIcon /> Utiliser le corail pour un détail, pas pour une action destructive.</li>
            <li><CheckIcon /> Garder l’encre pour le texte, jamais le bleu sur de longs paragraphes.</li>
          </ul>
        </Specimen>
        <Specimen label="À éviter">
          <ul className="ds-showcase__check-list ds-showcase__check-list--avoid">
            <li>Déformer, recolorer ou incliner le logo.</li>
            <li>Utiliser le corail comme couleur d’erreur.</li>
            <li>Mélanger plusieurs accents dans une même vue.</li>
          </ul>
        </Specimen>
      </div>
    </Section>
  )
}
