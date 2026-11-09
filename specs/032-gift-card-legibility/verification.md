# Verification

## Screenshots (local, seeded demo data)

| View | File |
|---|---|
| Public list, 1440, light | `screenshots/01-public-1440-light.png` |
| Public list, 1440, dark | `screenshots/02-public-1440-dark.png` |
| Editor (`/manage/1`), 1440, light | `screenshots/03-editor-1440-light.png` |
| Editor, 1440, dark | `screenshots/04-editor-1440-dark.png` |
| Design system “Fiche cadeau” (real `GiftCard`), light | `screenshots/05-showcase-1440-light.png` |
| Design system “Fiche cadeau”, dark | `screenshots/06-showcase-1440-dark.png` |
| Public list, 390, light | `screenshots/07-public-390-light.png` |
| Public list, 390, dark | `screenshots/08-public-390-dark.png` |
| Public gift grid, 1440, 3 columns, long-title stress, light | `screenshots/09-public-1440-long-title-light.png` |
| Public gift grid, 1440, 3 columns, long-title stress, dark | `screenshots/10-public-1440-long-title-dark.png` |

Captured with Puppeteer against `next dev` + a throwaway local Postgres seeded with `prisma/seed-demo.ts` (share codes `TESTA1` / `CAMI2026`, list id 1). The throwaway container and seed were removed afterwards; no shared database was touched.

## Results

- Price renders as `.ds-price`: ink `--ds-color-text`, `--ds-text-lg`, bold, tabular numerals — on the public list, the editor and the design-system composition, light and dark. Not grey, no chip border.
- “Voir le produit” renders as `ds-btn ds-btn--secondary` (44 px min height, bordered, 13 px label, icon + sr-only “(nouvel onglet)”) and stays visually below the cobalt primary action.
- Mobile 390: price and link fully readable; the reserve button stays the only primary.
- Keyboard: link is a native `<a>` with the shared focus ring (`ds-btn:focus-visible`); Enter opens the product in a new tab (`target="_blank" rel="noopener noreferrer"`).

## Follow-up: clipping in the 4-column gift grid

Production verification on `/list/38D0BD20` (10 gifts, real scraped titles) showed the pre-existing defect the first deploy inherited:

- before: grid `302px × 4`, text column 154–160 px, product link 154 px wide → right edge 17 px past the card and clipped by `overflow: hidden`; long titles also clipped.
- after: `.ds-card__body` one shrinkable column + `.ds-grid--gift` floor 21.25 rem + 96 px thumbnail → grid `408px × 3` at 1440, text column 254 px, `linkOverflow = −122`, `titleOverflow = 0`, `body.scrollWidth === body.clientWidth`.
- measured the same way on the live page after deploy (see PR evidence): no card clips its title or product link.

## Gates

- `bun run web:typecheck` ✅
- `bun run web:lint` ✅ (0 errors, 31 pre-existing warnings)
- `bun run web:build` ✅ (Turbopack production build)
- `bun run --cwd apps/expo export` ✅ (native bundling smoke)
- `bun run test`: not run — no auth/data/server logic touched.

## Runtime note

- Local machine ran Bun 1.4.2 (canonical is 1.4.4). Gates above passed under 1.4.2; CI/Vercel uses 1.4.x.
