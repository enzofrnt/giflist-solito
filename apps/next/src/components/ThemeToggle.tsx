'use client'

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { DropdownMenu } from '@/components/DropdownMenu'
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext'

const OPTIONS: Array<{ mode: ThemeMode; label: string; description: string; Icon: typeof Sun }> = [
  { mode: 'light', label: 'Clair', description: 'Toujours lumineux', Icon: Sun },
  { mode: 'dark', label: 'Sombre', description: 'Toujours sombre', Icon: Moon },
  { mode: 'system', label: 'Système', description: 'Comme l’appareil', Icon: Monitor },
]

export function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme()
  const current = OPTIONS.find((option) => option.mode === mode) ?? OPTIONS[2]
  const TriggerIcon = mode === 'system' ? (resolved === 'dark' ? Moon : Sun) : current.Icon

  return (
    <DropdownMenu
      label={`Thème : ${current.label}`}
      align="end"
      triggerClassName="ds-icon-btn ds-header__theme"
      trigger={<TriggerIcon size={19} strokeWidth={1.8} aria-hidden="true" />}
      items={OPTIONS.map(({ mode: optionMode, label, description, Icon }) => ({
        label,
        selected: mode === optionMode,
        onSelect: () => setMode(optionMode),
        icon: (
          <span className="ds-theme-menu-icon">
            <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
          </span>
        ),
        description,
      }))}
    />
  )
}
