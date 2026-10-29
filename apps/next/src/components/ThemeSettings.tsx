'use client'

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext'

const OPTIONS: Array<{ mode: ThemeMode; label: string; description: string; Icon: typeof Sun }> = [
  { mode: 'light', label: 'Clair', description: 'Une interface lumineuse', Icon: Sun },
  { mode: 'dark', label: 'Sombre', description: 'Repos pour les yeux', Icon: Moon },
  { mode: 'system', label: 'Système', description: 'Suit votre appareil', Icon: Monitor },
]

export function ThemeSettings() {
  const { mode, setMode } = useTheme()

  return (
    <section className="ds-card" aria-labelledby="theme-heading">
      <div className="ds-card__header">
        <div className="ds-stack ds-stack--gap-1">
          <h2 className="ds-card__title" id="theme-heading">Apparence</h2>
          <p className="ds-card__subtitle">Choisissez le thème de Giftlist.</p>
        </div>
      </div>
      <div className="ds-card__body">
        <div className="ds-theme-options" role="radiogroup" aria-labelledby="theme-heading">
          {OPTIONS.map(({ mode: optionMode, label, description, Icon }) => {
            const selected = mode === optionMode
            return (
              <button
                key={optionMode}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`ds-theme-option${selected ? ' ds-theme-option--selected' : ''}`}
                onClick={() => setMode(optionMode)}
              >
                <span className="ds-theme-option__icon"><Icon size={18} strokeWidth={1.9} aria-hidden="true" /></span>
                <span className="ds-theme-option__copy">
                  <span className="ds-theme-option__label">{label}</span>
                  <span className="ds-theme-option__description">{description}</span>
                </span>
                <span className="ds-theme-option__check" aria-hidden="true">{selected ? <Check size={15} strokeWidth={2.2} /> : null}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
