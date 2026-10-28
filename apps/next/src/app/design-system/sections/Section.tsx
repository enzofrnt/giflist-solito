import type { ReactNode } from 'react'

export function Section({
  id,
  kicker,
  title,
  lead,
  children,
}: {
  id: string
  kicker: string
  title: string
  lead: string
  children: ReactNode
}) {
  return (
    <section className="ds-showcase__section" id={id} aria-labelledby={`${id}-title`}>
      <div className="ds-showcase__section-head">
        <span className="ds-showcase__section-kicker">{kicker}</span>
        <h2 className="ds-showcase__section-title" id={`${id}-title`}>
          {title}
        </h2>
        <p className="ds-showcase__section-lead">{lead}</p>
      </div>
      {children}
    </section>
  )
}

export function Specimen({
  label,
  note,
  children,
  className = '',
}: {
  label: string
  note?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`ds-spec ${className}`.trim()}>
      <span className="ds-spec__label">{label}</span>
      {children}
      {note ? <p className="ds-spec__note">{note}</p> : null}
    </div>
  )
}
