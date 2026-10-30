# Verification

## Behaviour

| Viewport | Visible hero primary | Destination | Hero actions |
|----------|----------------------|-------------|--------------|
| 320 × 700 | “Créer un compte” | `/register` | 2 |
| 390 × 844 (light + dark) | “Créer un compte” | `/register` | 2 |
| 479 × 844 | “Créer un compte” | `/register` | 2 |
| 480 × 844 | “Commencer maintenant” | `/register` | 2 |
| 768 × 1024 | “Commencer maintenant” | `/register` | 2 |
| 1440 × 900 | “Commencer maintenant” | `/register` | 2 |

- Only one label is rendered per breakpoint (`Commencer maintenant` is `display: none` below 480 px, `Créer un compte` above), so the accessible name matches the visible label at each width.
- Button stays 52 px tall, cobalt (`rgb(37, 99, 235)` light / `rgb(125, 164, 255)` dark), and the secondary action remains “Se connecter” → `/login`.
- No horizontal overflow at any tested width (`scrollWidth === innerWidth`), and the mobile layout still draws the two actions on one row at 390 px (they wrap at 320 px).
- Keyboard order at 390 px: brand → theme toggle → header “Connexion” → hero “Créer un compte” → hero “Se connecter”. Tab stops carry the matching visible label.
- Logged-in branch unchanged by inspection: “Voir mes listes” → `/dashboard` (no responsive spans rendered).

## Evidence

- Screenshots inspected at 320, 390 light, 390 dark, 480, 768, 1440 (home hero).
- Puppeteer assertions on the visible `innerText`, `href`, computed background, bounding boxes, document overflow and tab order.

## Gates

- `bun run web:typecheck` — ✅ exit 0.
- `bun run web:lint` — ✅ exit 0, 0 errors (32 pre-existing warnings elsewhere in the app).
- `bun run web:build` — ✅ executed by the Husky pre-commit hook (Next.js production build); the preview on `http://127.0.0.1:3001` was restarted from that build.
- `bun run test` — not applicable: no auth, data, crypto, email or server logic touched.
- Bun runtime: **1.4.2** vs canonical **1.4.4**; no `--frozen-lockfile` install or Vercel release build was run.

## Notes

- The hidden label span is `display: none`, so it is excluded from the accessibility tree and does not add an extra tab stop.
- Desktop copy is intentionally unchanged; the desktop header already exposes “Créer un compte”. If the mobile header regains a register action, the compact hero label becomes redundant and should be reconsidered with feature 026.
