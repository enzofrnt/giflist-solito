# Feature Specification: Light / Dark / System Theme

**Branch**: `015-theme-modes` · **Status**: Approved

## User Stories

### 1. Choose a theme everywhere
Users can choose **Clair**, **Sombre** or **Système** in web settings and mobile profile/settings. The choice is persisted and applies immediately/at startup.

### 2. Web header toggle
On web only, the header has a compact theme control with clean icons; the settings page exposes the full three-way choice.

### 3. Native appearance
On iOS, the status bar, canvas, cards, inputs, menus and tab bar follow the resolved theme. The app supports the system appearance and an explicit override. Icons use **SF Symbols on iOS** and **Lucide** on web/Android (same icon language as MyOwnNotion).

### 4. Clean app icon corners
The splash and in-app brand marks have transparent rounded corners; the iOS app icon remains a square opaque source that iOS masks itself. Android adaptive icon uses a suitable foreground.

## Requirements

- **FR-001**: Web resolves `data-theme=light|dark` from localStorage/system, before paint (no flash).
- **FR-002**: Dark web overrides all semantic `--ds-color-*` tokens; components need no per-page dark classes.
- **FR-003**: Web header toggle (light/dark/system menu) + profile radio group.
- **FR-004**: Native theme provider persists mode and calls `Appearance.setColorScheme`.
- **FR-005**: Native semantic colors become dynamic (iOS `DynamicColorIOS`) and screens/controls update without restarting.
- **FR-006**: Mobile profile exposes the three-way selector with SF Symbols on iOS and Lucide elsewhere.
- **FR-007**: Splash has rounded transparent mark + dark splash variant; in-app header mark uses rounded asset.
- **FR-008**: `userInterfaceStyle` set to automatic.
- **FR-009**: No API/schema/auth change.

## Success Criteria

- Theme persists after reload/relaunch; system follows OS changes.
- No flash of wrong theme on web.
- Web light/dark screenshots (1440 + 390).
- Native simulator screenshots light/dark profile/theme selector.
- Splash icon corners are transparent and clean on both backgrounds.
