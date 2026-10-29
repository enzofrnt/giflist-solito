/**
 * Shared Giftlist design tokens (Porcelain & Cobalt).
 *
 * `lightColors` / `darkColors` are the resolved palettes used by the theme
 * selector and SVG icons. `colors` exposes iOS dynamic colours so existing
 * StyleSheets switch without a JS re-style pass; `Appearance.setColorScheme`
 * drives the override.
 */
import { DynamicColorIOS, Platform, type ColorValue } from 'react-native'

export type ThemeColors = {
  canvas: string
  surface: string
  surfaceMuted: string
  text: string
  textMuted: string
  textSubtle: string
  border: string
  borderStrong: string
  primary: string
  primaryHover: string
  primarySoft: string
  accent: string
  accentSoft: string
  danger: string
  dangerSoft: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  favorite: string
  favoriteSoft: string
  favoriteBorder: string
}

export const lightColors: ThemeColors = {
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
  favorite: '#e05a4f',
  favoriteSoft: '#fdeceb',
  favoriteBorder: '#f4c7c2',
}

export const darkColors: ThemeColors = {
  canvas: '#11100f',
  surface: '#1b1917',
  surfaceMuted: '#25221f',
  text: '#f7f3ed',
  textMuted: '#c9c1b7',
  textSubtle: '#9a9187',
  border: '#34302a',
  borderStrong: '#4b453d',
  primary: '#7da4ff',
  primaryHover: '#a2bbff',
  primarySoft: '#1c2740',
  accent: '#ff9b7b',
  accentSoft: '#3a211b',
  danger: '#ff8980',
  dangerSoft: '#331b1b',
  success: '#5fd39a',
  successSoft: '#152a20',
  warning: '#ffc46b',
  warningSoft: '#332614',
  favorite: '#ffb0a8',
  favoriteSoft: '#3a1e1c',
  favoriteBorder: '#6b302b',
}

function dynamicColor(light: string, dark: string): ColorValue {
  if (Platform.OS === 'ios') return DynamicColorIOS({ light, dark })
  return light
}

export type ThemeColorMap = { [Key in keyof ThemeColors]: ColorValue }

export const colors: ThemeColorMap = {
  canvas: dynamicColor(lightColors.canvas, darkColors.canvas),
  surface: dynamicColor(lightColors.surface, darkColors.surface),
  surfaceMuted: dynamicColor(lightColors.surfaceMuted, darkColors.surfaceMuted),
  text: dynamicColor(lightColors.text, darkColors.text),
  textMuted: dynamicColor(lightColors.textMuted, darkColors.textMuted),
  textSubtle: dynamicColor(lightColors.textSubtle, darkColors.textSubtle),
  border: dynamicColor(lightColors.border, darkColors.border),
  borderStrong: dynamicColor(lightColors.borderStrong, darkColors.borderStrong),
  primary: dynamicColor(lightColors.primary, darkColors.primary),
  primaryHover: dynamicColor(lightColors.primaryHover, darkColors.primaryHover),
  primarySoft: dynamicColor(lightColors.primarySoft, darkColors.primarySoft),
  accent: dynamicColor(lightColors.accent, darkColors.accent),
  accentSoft: dynamicColor(lightColors.accentSoft, darkColors.accentSoft),
  danger: dynamicColor(lightColors.danger, darkColors.danger),
  dangerSoft: dynamicColor(lightColors.dangerSoft, darkColors.dangerSoft),
  success: dynamicColor(lightColors.success, darkColors.success),
  successSoft: dynamicColor(lightColors.successSoft, darkColors.successSoft),
  warning: dynamicColor(lightColors.warning, darkColors.warning),
  warningSoft: dynamicColor(lightColors.warningSoft, darkColors.warningSoft),
  favorite: dynamicColor(lightColors.favorite, darkColors.favorite),
  favoriteSoft: dynamicColor(lightColors.favoriteSoft, darkColors.favoriteSoft),
  favoriteBorder: dynamicColor(lightColors.favoriteBorder, darkColors.favoriteBorder),
}

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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
} as const
