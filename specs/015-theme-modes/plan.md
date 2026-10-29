# Plan

## Web
- `ThemeContext` + inline boot script; `data-theme` on `<html>`.
- SCSS `$semantic-dark` emitted under `[data-theme='dark']`; `color-scheme`.
- Header theme DropdownMenu; profile ThemeSettings.
- Lucide icons (`lucide-react`, same as MyOwnNotion).

## Native
- `ThemeProvider.native`: AsyncStorage key, 3 modes, `Appearance.setColorScheme`, resolved palette.
- `tokens.ts`: dynamic iOS colors + light/dark palettes for resolved UI icons.
- `ThemeSettings` in profile; `ThemeIcon` (expo-symbols iOS, lucide-react-native elsewhere).
- `userInterfaceStyle: automatic`; splash dark config; rounded splash/header assets.
