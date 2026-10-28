/**
 * Shared Giftlist design tokens (Porcelain & Cobalt).
 * Native screens import these values directly; web variants keep using the
 * existing `ds-*` CSS classes so the web visual system stays canonical.
 */
export const colors = {
  canvas: '#faf9f7',
  surface: '#ffffff',
  surfaceMuted: '#f4f1ec',
  text: '#1b1917',
  textMuted: '#6b655e',
  textSubtle: '#8b857d',
  border: '#e7e2da',
  borderStrong: '#d8d1c7',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primarySoft: '#e8efff',
  accent: '#f4673f',
  accentSoft: '#fde8df',
  danger: '#c73333',
  dangerSoft: '#fdecec',
  success: '#2f7d5b',
  successSoft: '#e9f5ee',
  warning: '#b45309',
  warningSoft: '#fff4e5',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  pill: 999,
} as const

export const typography = {
  display: 32,
  title: 24,
  heading: 20,
  body: 15,
  small: 13,
  caption: 12,
  tight: 1.15,
  normal: 1.5,
} as const

export const shadow = {
  card: {
    shadowColor: '#1b1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
} as const
