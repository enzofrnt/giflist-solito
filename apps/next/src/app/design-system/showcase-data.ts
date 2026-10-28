export const showcaseSections = [
  { id: 'brand', label: 'Marque' },
  { id: 'palette', label: 'Palette' },
  { id: 'typography', label: 'Typographie' },
  { id: 'buttons', label: 'Boutons' },
  { id: 'forms', label: 'Formulaires' },
  { id: 'feedback', label: 'Messages' },
  { id: 'surfaces', label: 'Cartes & badges' },
  { id: 'states', label: 'États' },
  { id: 'spacing', label: 'Espacement & forme' },
  { id: 'password', label: 'Mot de passe' },
] as const

export type PaletteSwatch = {
  token: string
  name: string
  hex: string
  role: string
  dark?: boolean
}

export const paletteGroups: { title: string; description: string; swatches: PaletteSwatch[] }[] = [
  {
    title: 'Neutres chauds',
    description: 'Le socle porcelain / encre. Les bordures restent discrètes, jamais grises et froides.',
    swatches: [
      { token: 'porcelain', name: 'canvas', hex: '#faf9f7', role: 'Fond de page' },
      { token: 'white', name: 'surface', hex: '#ffffff', role: 'Cartes, champs' },
      { token: 'mist', name: 'surface-muted', hex: '#f3f1ed', role: 'Zones secondaires' },
      { token: 'sand', name: 'border', hex: '#e8e4dd', role: 'Séparateurs' },
      { token: 'stone', name: 'border-strong', hex: '#918a80', role: 'Contours de champs' },
      { token: 'ash', name: 'text-subtle', hex: '#746e65', role: 'Texte tertiaire' },
      { token: 'graphite', name: 'text-muted', hex: '#5c574f', role: 'Texte secondaire' },
      { token: 'ink', name: 'text', hex: '#1b1917', role: 'Texte principal', dark: true },
    ],
  },
  {
    title: 'Cobalt (primaire)',
    description: 'La couleur d’action, héritée du bleu historique du produit. Utilisée pour une action principale à la fois.',
    swatches: [
      { token: 'primary-50', name: 'primary-soft', hex: '#eff4ff', role: 'Fond doux' },
      { token: 'primary-100', name: 'primary-100', hex: '#dbe6ff', role: 'Survol doux' },
      { token: 'primary-300', name: 'primary-300', hex: '#93b4ff', role: 'Bordures douces' },
      { token: 'primary-500', name: 'primary-500', hex: '#3b76f6', role: 'Accent clair' },
      { token: 'primary-600', name: 'primary', hex: '#2563eb', role: 'Action principale' },
      { token: 'primary-700', name: 'primary-hover', hex: '#1d4ed8', role: 'Survol' },
      { token: 'primary-900', name: 'primary-900', hex: '#1e3a8a', role: 'Sur fond clair' },
    ],
  },
  {
    title: 'Corail (accent)',
    description: 'La chaleur du cadeau. Réservé aux moments de célébration, jamais aux erreurs ou aux actions destructives.',
    swatches: [
      { token: 'accent-50', name: 'accent-soft', hex: '#fff3ee', role: 'Fond' },
      { token: 'accent-100', name: 'accent-100', hex: '#ffe2d6', role: 'Illustration' },
      { token: 'accent-300', name: 'accent-300', hex: '#ffa585', role: 'Détail' },
      { token: 'accent-500', name: 'accent', hex: '#f4673f', role: 'Accent' },
      { token: 'accent-700', name: 'accent-700', hex: '#b23a18', role: 'Sur fond clair' },
    ],
  },
  {
    title: 'Sémantiques',
    description: 'Chaque ton a un fond, une bordure et un texte dédiés. Jamais de couleur seule pour porter l’information.',
    swatches: [
      { token: 'success-50', name: 'success-soft', hex: '#ecfdf3', role: 'Fond succès' },
      { token: 'success-200', name: 'success-border', hex: '#a6f4c5', role: 'Bordure succès' },
      { token: 'success-600', name: 'success', hex: '#039855', role: 'Succès' },
      { token: 'success-800', name: 'success-800', hex: '#05603a', role: 'Texte succès' },
      { token: 'warning-50', name: 'warning-soft', hex: '#fffaeb', role: 'Fond alerte' },
      { token: 'warning-600', name: 'warning', hex: '#dc6803', role: 'Avertissement' },
      { token: 'warning-800', name: 'warning-800', hex: '#93370d', role: 'Texte alerte' },
      { token: 'danger-50', name: 'danger-soft', hex: '#fef3f2', role: 'Fond erreur' },
      { token: 'danger-200', name: 'danger-border', hex: '#fecdca', role: 'Bordure erreur' },
      { token: 'danger-600', name: 'danger', hex: '#d92d20', role: 'Erreur' },
      { token: 'danger-800', name: 'danger-800', hex: '#912018', role: 'Texte erreur' },
      { token: 'info-50', name: 'info-soft', hex: '#eff8ff', role: 'Fond info' },
      { token: 'info-600', name: 'info', hex: '#1570ef', role: 'Information' },
      { token: 'info-700', name: 'info-700', hex: '#175cd3', role: 'Texte info' },
    ],
  },
]

export const typeScale = [
  { className: 'ds-display', label: 'Display', spec: '48–72 px · 600 · 1.0', sample: 'Des cadeaux qui font plaisir.' },
  { className: 'ds-h1', label: 'Titre 1', spec: '36 px · 600 · 1.1', sample: 'Vos listes, enfin organisées.' },
  { className: 'ds-h2', label: 'Titre 2', spec: '30 px · 600 · 1.15', sample: 'Une liste claire pour chaque occasion.' },
  { className: 'ds-h3', label: 'Titre 3', spec: '24 px · 600 · 1.25', sample: 'Partagez en un seul lien.' },
  { className: 'ds-h4', label: 'Titre 4', spec: '20 px · 600 · 1.35', sample: 'Les réservations en temps réel.' },
  { className: 'ds-body', label: 'Corps', spec: '15 px · 400 · 1.65', sample: 'Créez une liste, ajoutez vos envies et laissez vos proches réserver sans créer de compte.' },
  { className: 'ds-body-sm', label: 'Corps secondaire', spec: '13 px · 400 · 1.5', sample: 'Une note discrète pour accompagner une information.' },
  { className: 'ds-label', label: 'Label', spec: '13 px · 600 · 1.25', sample: 'Adresse e-mail' },
  { className: 'ds-overline', label: 'Overline', spec: '12 px · 600 · +0.08em', sample: 'Design system' },
  { className: 'ds-caption', label: 'Légende', spec: '12 px · 400 · 1.5', sample: 'Dernière mise à jour il y a 2 minutes.' },
  { className: 'ds-mono', label: 'Mono', spec: '13 px · Geist Mono', sample: 'GIFT-2026-0042' },
]

export const spacingScale = [
  { token: '1', value: '4 px' },
  { token: '2', value: '8 px' },
  { token: '3', value: '12 px' },
  { token: '4', value: '16 px' },
  { token: '5', value: '20 px' },
  { token: '6', value: '24 px' },
  { token: '8', value: '32 px' },
  { token: '10', value: '40 px' },
  { token: '12', value: '48 px' },
  { token: '16', value: '64 px' },
]

export const radiusScale = [
  { token: 'xs', value: '4 px' },
  { token: 'sm', value: '6 px' },
  { token: 'md', value: '10 px' },
  { token: 'lg', value: '14 px' },
  { token: 'xl', value: '20 px' },
  { token: '2xl', value: '28 px' },
  { token: 'full', value: '999 px' },
]

export const shadowScale = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export const buttonVariants = [
  { variant: 'primary', label: 'Principal' },
  { variant: 'secondary', label: 'Secondaire' },
  { variant: 'ghost', label: 'Fantôme' },
  { variant: 'danger', label: 'Danger' },
  { variant: 'accent', label: 'Accent' },
] as const

export const buttonSizes = [
  { size: 'sm', label: 'Petit' },
  { size: 'md', label: 'Moyen' },
  { size: 'lg', label: 'Grand' },
] as const
