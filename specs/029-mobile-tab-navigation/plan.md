# Plan

## Technical context

- Web only (`apps/next`). New client component `MobileTabBar` rendered by `AppChrome`; `Header`, `DropdownMenu`, `HomePage`, `_app.scss`.
- No API/Prisma/native change; no new dependency.

## Constitution check

- **One primary action per view**: tabs are navigation; the hero search button is ghost/tertiary.
- **Account menu**: avatar menu keeps identity/logout only; desktop untouched.
- **Mobile**: app-style bottom navigation, no burger, no overlay/dim.
- **Accessibility**: 44 px targets, labels, `aria-current`, focus ring, separator not focusable, Escape closes menu.
- **Safari**: `viewport-fit=cover` + `env(safe-area-inset-bottom)` + a spacer; cited fix for iOS Safari fixed-bottom overlap.

## Approach

1. **`MobileTabBar`** (client):
   - `useAuthContext` + `usePathname`; render only when logged in and the section is `dashboard`, `search`, `profile`, `list`, `u`, or the home route.
   - 3 `Link`s with Lucide icons/labels, active `aria-current="page"`.
   - Returns a flow spacer (after the footer) + fixed `nav`; spacer height = bar height + safe area.
2. **`AppChrome`**: render `<MobileTabBar />` after `<Footer />` (not on `/design-system`).
3. **`Header`**:
   - logged-out mobile search icon before the theme toggle (hidden ≥md);
   - account menu items become `Mon profil`, a mobile-only separator, `Se déconnecter`; remove `Mes listes`.
4. **`DropdownMenu`**: support `separator?: boolean` items rendered as `role="separator"` (mobile-only class).
5. **`HomePage`**: logged-out mobile ghost button with Search icon “Rechercher une liste ou un compte” under the hero actions (hidden ≥md).
6. **SCSS**: `.ds-tabbar`, `.ds-tabbar__item`, `.ds-tabbar-spacer`, `.ds-header__mobile-search`, `.ds-home__search-link`, `.ds-dropdown__separator`; tab bar display only ≤md; safe-area padding; z-index sticky.
7. **Desktop**: every new element is hidden ≥md; account menu keeps profile/logout; no desktop markup visible.

## Safari note

`viewportFit: "cover"` is already exported in `layout.tsx`. The fixed bar uses `padding-bottom: calc(var(--ds-space-1) + env(safe-area-inset-bottom))`; the spacer uses the same env. This keeps tap targets above the home indicator/browser toolbar. Real-device check on iPhone Safari via the dev network URL is required; if the toolbar still overlays, fall back to a floating bar with an additional bottom offset.

## Verification plan

- Puppeteer 390/320 logged in: bar visible, active states, menu items/separator, profile navigation, no overflow.
- 390 logged out: header search + hero search button, both `/search`.
- 768/1440: bar/search icon/hero button hidden; desktop header/menu unchanged.
- Keyboard sweep, Escape, focus ring; dark/light; screenshots.
- Typecheck, lint, build.
