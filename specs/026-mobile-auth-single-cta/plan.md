# Plan

## Technical context

- Web only: `apps/next/src/components/Header.tsx` (client component) + `apps/next/src/styles/_app.scss` (design-system header block).
- No API, Prisma, shared `packages/app`, or native change; no new dependency.
- Breakpoint: the existing `sm` token (480 px) via `ds-media-down('sm')`.

## Constitution check

- **One primary action per view**: on mobile the header keeps a single cobalt action; the ghost duplicate is removed from that view.
- **Header rules**: logo stays left, nav untouched, account menu untouched, no burger added.
- **UI/UX process**: `ui-ux-design` skill loaded; UX brief and screen/action audit recorded in `spec.md`.
- **Accessibility**: hidden control leaves the tab order/accessibility tree (CSS `display: none`), remaining link keeps `.ds-btn` focus ring.
- **Gates**: typecheck, lint, build, plus 1440/768/390 screenshots and keyboard sweep.

## Approach

1. **Stable hooks in markup** — add `ds-header__auth-login` and `ds-header__auth-register` modifiers next to the existing `ds-header__auth-action` class on the two links. Classes only; no conditional rendering, so SSR and hydration stay identical.
2. **Mobile-only presentation** — inside `ds-media-down('sm')`:
   - `.ds-header__auth-register { display: none; }` removes the redundant control from layout, tab order and assistive tech.
   - `.ds-header__actions .ds-header__auth-login` overrides the `.ds-btn` custom properties with the primary palette (cobalt background/border, inverse text, primary hover/active, `--ds-shadow-xs`). The two-class selector wins over `.ds-btn--ghost` without touching global button styles.
3. **Desktop/tablet unchanged** — no rule applies at ≥480 px, so the ghost/primary pair remains.
4. **Rejected alternatives**:
   - Duplicated DOM (two login links toggled by CSS) — redundant nodes and confusing assistive tech.
   - `matchMedia` in React — SSR mismatch and hydration flicker.
   - New `.ds-btn--primary` variant applied always — would create two primary buttons on desktop.

## Risks

- The override lives in the header block, so a future change to primary button tokens must be mirrored in the media query. Recorded in `verification.md`; acceptable for a two-property presentation rule.
- Header `min-width: 17rem` on actions stays unchanged to preserve layout stability between auth states.

## Verification plan

- Puppeteer screenshots at 390×844, 768×1024, 1440×900 in light and dark.
- Assert at 390 px: exactly one `.ds-header__auth-action` visible, cobalt computed background, `href="/login"`, register link `display:none`, no horizontal overflow.
- Assert at 768/1440: both links visible with current styles.
- Keyboard: tab order logo → theme toggle → Connexion (no hidden register stop).
- `bun run web:typecheck`, `bun run web:lint`, `bun run web:build`.
