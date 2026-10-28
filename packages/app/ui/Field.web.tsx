import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function Field({ label, hint, error, id, ...props }: FieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="ds-field">
      <label className="ds-label" htmlFor={inputId}>{label}</label>
      <input id={inputId} className="ds-input" aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="ds-error">{error}</p> : hint ? <p className="ds-hint">{hint}</p> : null}
    </div>
  )
}
