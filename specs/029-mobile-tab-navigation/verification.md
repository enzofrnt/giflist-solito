# Verification

## Behaviour

| Viewport / state | Result |
|------------------|--------|
| 390 × 844 logged in | Bottom bar visible: **Mes listes / Recherche / Profil**; active `Mes listes` on `/dashboard`; no horizontal overflow |
| 320 × 700 logged in | Bar fits; labels readable; `scrollWidth === innerWidth`; header 73 px |
| 768 × 1024 logged in | Bar hidden; desktop header nav (`Mes listes`, `Recherche`) visible |
| 1440 × 900 logged in | Bar hidden; header/nav/account unchanged; desktop menu = Mon profil + Se déconnecter (no separator, no lists) |
| 390 × 844 logged out | No bar; header search icon + theme + Connexion; hero **outlined secondary** button “Rechercher une liste ou un compte” spanning the action-group width (358 px, 1 px border); both open `/search` |
| 320 × 700 logged out | Same, no overflow; hero search width 288 px = action-group width |
| `/profile` | Bar active on **Profil**, including after clicking the top-right menu item |
| `/search` | Bar active on **Recherche** |
| `/list/TESTA1`, `/u/camille_demo` | Bar visible, no active tab (detail/browsing pages) |
| `/login`, `/manage/1` | Bar and spacer absent (auth / focused form) |
| Logout from menu | Token cleared, bar disappears, logged-out header/search returns, home route |

## Account menu (mobile)

- Trigger: top-right avatar/chevron (unchanged).
- Items: **Mon profil** → `/profile`; separator (`role="separator"`); **Se déconnecter** (danger).
- “Mes listes” is no longer in the menu.
- Desktop menu is unchanged: Mon profil + Se déconnecter, separator hidden.

## Keyboard / accessibility

- Menu first focus: “Mon profil”; ArrowDown skips the separator and lands on “Se déconnecter”; Escape closes the menu and restores focus to “Menu du compte”.
- Separator is not focusable and has `role="separator"`.
- Bar links are `<a>` with 44 px+ targets, icons `aria-hidden`, labels visible, `aria-current="page"` on the active destination; focus ring from the shared `.ds-focus-ring`.
- The bar is a labelled `<nav aria-label="Navigation principale">`; the spacer is `aria-hidden`.

## Safari / safe area

- `viewportFit: "cover"` is already exported in `apps/next/src/app/layout.tsx`.
- Bar: `padding-bottom: calc(var(--ds-space-1) + env(safe-area-inset-bottom))`; spacer: `calc(3.75rem + env(safe-area-inset-bottom))`. Chrome (no safe area) resolves to 4 px padding / 60 px spacer; on iPhone the inset is added and keeps the bar above the home indicator/browser toolbar.
- CDP `Emulation.setSafeAreaInsets` is not available in this Chrome build, so the env fallback could not be screenshot-emulated. **Manual iPhone Safari check required** at `http://192.168.1.141:3001` (login `test@giftlist.fr` / `Giftlist123!`). If the Safari toolbar still overlays, the documented fallback is a floating bar with an additional bottom offset.
- The Next.js dev badge was disabled (`devIndicators: false`) because it covered the “Mes listes” tab in local previews; development-only, no production effect.

## Evidence

- Screenshots: `docs/design-system/screenshots/mobile-nav/`
  - `dashboard-390.png`, `dashboard-320.png`, `dashboard-dark.png`
  - `menu-390.png`, `logged-out-390.png`, `desktop-1440.png`

## Gates

- `bun run web:typecheck` — ✅ exit 0.
- `bun run web:lint` — ✅ exit 0, 0 errors (32 pre-existing warnings elsewhere).
- `bun run web:build` — ✅ executed by the Husky pre-commit hook.
- `bun run test` — not applicable: no server auth/data logic changed.
- Bun runtime: **1.4.2** vs canonical **1.4.4**; no `--frozen-lockfile` install or Vercel release build.

## Notes

- Desktop is visually unchanged: the mobile search icon, hero search button, tab bar and spacer are all hidden at ≥768 px; the account menu keeps profile/logout without separator.
- The bar is rendered after the footer in the DOM; the fixed element is visually at the bottom, and the spacer keeps the footer scrollable above it.
