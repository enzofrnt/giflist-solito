const TONES = { neutral: 'neutral', success: 'success', warning: 'warning', danger: 'danger' } as const

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: keyof typeof TONES }) {
  return <span className={`ds-badge ds-badge--${tone}`}>{label}</span>
}
