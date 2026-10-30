# Verification

## Behaviour

| Viewport | Logged-out header | Result |
|----------|-------------------|--------|
| 320 × 700 | single cobalt “Connexion” → `/login` | ✅ |
| 390 × 844 (light + dark) | single cobalt “Connexion”; “Créer un compte” `display: none` | ✅ |
| 479 × 844 | single cobalt “Connexion” | ✅ |
| 480 × 844 (sm boundary) | ghost “Connexion” + cobalt “Créer un compte” | ✅ |
| 768 × 1024 | ghost “Connexion” + cobalt “Créer un compte” | ✅ |
| 1440 × 900 (light + dark) | ghost “Connexion” + cobalt “Créer un compte” | ✅ |

- Cobalt computed `rgb(37, 99, 235)` in light, `rgb(125, 164, 255)` in dark with the inverse text token; the button is 44 px tall (touch target) and uses the existing focus ring.
- `document.documentElement.scrollWidth === window.innerWidth` at every tested width → no horizontal overflow.
- Header height stays **73 px** and the logo position is unchanged.
- Tab order at 390 px: brand → theme toggle → “Connexion” → hero CTAs. The hidden register link is not focusable and is absent from the accessibility tree.
- `/login` at 390 px keeps “Pas de compte ? Créez-en un” visible (one tap to `/register`); the footer register link also remains.

## Evidence

- Build served from a fresh production build on `http://127.0.0.1:3001` (the previous server was serving a stale build and was restarted).
- Screenshots inspected: 390 light, 390 dark, 320 light, 768 light, 1440 light, 1440 dark, login mobile.
- Puppeteer assertions on `getComputedStyle`/`getBoundingClientRect`/`document.activeElement` (see behaviour table).

## Gates

- `bun run web:typecheck` — ✅ exit 0.
- `bun run web:lint` — ✅ exit 0, 0 errors (32 pre-existing warnings elsewhere in the app).
- `bun run web:build` — ✅ exit 0 (44/44 static pages generated).
- `bun run test` — not applicable: no auth, data, crypto, email or server logic touched.
- Bun runtime: **1.4.2** on this machine vs canonical **1.4.4** (`>=1.4.4 <1.5.0`); no `--frozen-lockfile` install or Vercel release build was run. Reported, not silently accepted.

## Notes

- The mobile primary styling is a header-scoped override of the `.ds-btn` custom properties. If the primary button palette changes, this media block must be updated with it (documented in `plan.md`).
- Styling is media-query driven, so server-rendered HTML stays identical across viewports (no hydration flicker, register link simply hidden below 480 px).
