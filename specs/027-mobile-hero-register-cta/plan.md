# Plan

## Technical context

- Web only: `apps/next/src/components/home/HomePage.tsx` + `apps/next/src/styles/_app.scss` (home hero block).
- No API, Prisma, shared `packages/app`, or native change; no new dependency.
- Breakpoint: existing `sm` token (480 px), consistent with the header change in 026.

## Constitution check

- **One primary action per view**: the hero keeps a single cobalt action; no third button is introduced.
- **UX process**: `ui-ux-design` skill loaded; UX brief and screen/action audit recorded in `spec.md`.
- **Copy**: “Créer un compte” matches the registration page title and the desktop header action.
- **Accessibility**: only the visible label is in the accessibility tree; the link keeps `.ds-btn` focus ring and 44 px height.
- **Gates**: typecheck, lint, build, plus 320/390/768/1440 screenshots and keyboard check.

## Approach

1. **Replace the vague label with an explicit pair** in `HomePage.tsx`:
   - logged in → plain `Voir mes listes` (unchanged);
   - logged out → two spans: `Commencer maintenant` (wide) and `Créer un compte` (compact).
2. **Swap labels at the breakpoint** in `_app.scss`:
   - default: compact hidden, wide visible;
   - `ds-media-down('sm')`: wide hidden, compact visible.
   The hidden span is `display: none`, so it leaves the accessibility tree and tab order; the link destination is unchanged (`/register`).
3. **No third action**: the secondary “Se connecter” link stays as is; “Commencer maintenant” is relabelled on mobile rather than duplicated.

## Rejected alternatives

- Add a third “Créer un compte” button alongside “Commencer maintenant” — two buttons with the same `/register` destination and no clear primary.
- Rename everywhere — changes desktop messaging although the desktop header already exposes registration explicitly.
- `matchMedia`/`useEffect` — hydration mismatch and a flash of the wrong label.

## Risks

- Two labels live in the HTML; only one is rendered per viewport. SEO reads both strings, which is acceptable (same intent, same destination).
- If the header register action returns on mobile later, the compact label may become redundant; the spec records the dependency on 026.

## Verification plan

- Puppeteer at 320/390/479/480/768/1440, logged out: visible hero label, href, computed styles, no overflow.
- Keyboard: tab to the primary hero action; accessible name equals visible label.
- Logged-in state logic unchanged by inspection (`user ? 'Voir mes listes'` branch).
- `bun run web:typecheck`, `bun run web:lint`, `bun run web:build`.
