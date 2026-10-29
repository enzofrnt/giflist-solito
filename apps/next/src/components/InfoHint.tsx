'use client'

import { Info } from 'lucide-react'
import { useId, useState } from 'react'

export function InfoHint({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="ds-info-hint" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="ds-info-hint__trigger"
        aria-label={`À propos : ${label}`}
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info size={14} strokeWidth={2} aria-hidden="true" />
      </button>
      <span id={id} role="tooltip" className="ds-info-hint__bubble" data-open={open}>
        {children}
      </span>
    </span>
  )
}
