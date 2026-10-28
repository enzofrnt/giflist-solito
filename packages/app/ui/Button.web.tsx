import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
  variant?: Variant
  fullWidth?: boolean
}

export function Button({ title, variant = 'primary', fullWidth, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`ds-btn ds-btn--${variant}${fullWidth ? ' ds-btn--block' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {title}
    </button>
  )
}
