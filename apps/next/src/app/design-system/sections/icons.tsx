import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  width: '1em',
  height: '1em',
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5V17M12 7.2v.2" />
    </svg>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4 3.7 19h16.6L12 4Z" />
      <path d="M12 9v4.5M12 16.5v.2" />
    </svg>
  )
}

export function ErrorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  )
}

export function GiftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10h16v10H4zM12 10v10M4 10V7h16v3M12 7c-1.5-3-5-3-5-1s2.5 2 5 2m0 0c1.5-3 5-3 5-1s-2.5 2-5 2" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12c2.2-4.2 5.6-6.2 9.5-6.2S19.3 7.8 21.5 12c-2.2 4.2-5.6 6.2-9.5 6.2S4.7 16.2 2.5 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </svg>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m3 3 18 18M10.6 6.1A10 10 0 0 1 12 6c3.9 0 7.3 2 9.5 6a12 12 0 0 1-2.4 3.1M6.3 6.8A12.4 12.4 0 0 0 2.5 12c2.2 4.2 5.6 6.2 9.5 6.2 1.2 0 2.4-.2 3.5-.6" />
    </svg>
  )
}
