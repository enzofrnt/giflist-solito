# Quickstart — Review the UI Design System (Phase 1)

**Feature**: `002-ui-design-system`
**Goal**: run the design-system showcase and verify that Phase 1 did not restyle the existing application.

## Prerequisites

- Bun **1.4.4** (`bun --version`; the repo pins `1.4.4` and Vercel uses `1.4.x`).
- Node 24.x.
- No database needed for the showcase (it does not call the API).
- For the WebAuthn/test gate: Chrome at the default macOS path or set `CHROME_PATH`.

## Install and run

```bash
bun install --frozen-lockfile        # must resolve next@16.4.3 and sass
bun run web:typecheck
bun run web:lint
bun run web:build
PORT=3100 bun run --cwd apps/next start
```

Open **http://localhost:3100/design-system**.

For development with hot reload:

```bash
bun run web:dev
# http://localhost:3000/design-system
```

## Review checklist

1. **Brand** — logo lockup, proposed “Porcelain & Cobalt” direction, do/don't examples.
2. **Palette** — every token swatch shows name, hex, role; semantic colors are labelled.
3. **Typography** — display/headings/body/label/caption/code specimens; Geist is actually rendered.
4. **Buttons** — primary/secondary/ghost/danger/accent × sm/md/lg; hover/focus-visible/active/disabled/loading.
5. **Forms** — input, password, select, textarea, checkbox, radio, switch; label/hint/error/required/disabled.
6. **Feedback** — info/success/warning/danger alerts; distinguishability without color alone.
7. **Cards / badges / containers** — card variants, badge tones, chips, dividers, empty state.
8. **Interactive states** — focus visible via keyboard (`Tab`), hover, active, disabled, loading.
9. **Spacing / borders / radii / shadows** — visual scale with token names.
10. **Password strength** — type in the demo: empty, weak, medium, strong, very strong; confirm labels, colors, bar, checklist, and screen-reader semantics.
11. **Responsive** — 375px, 768px, 1440px: no horizontal scroll, controls usable.
12. **No Phase 2 leakage** — open `/`, `/login`, `/register`, `/profile`, `/dashboard` and confirm the existing visual design is unchanged.

## Approval gate

Phase 2 (application-wide rollout) starts **only after** the owner records an explicit approval (or a change request) in `specs/002-ui-design-system/`. Until then, no existing page should be restyled.

## Useful checks

```bash
# Tailwind entry untouched / SCSS layer present
grep -n '@import "tailwindcss"' apps/next/src/app/globals.css
grep -rn '@import' apps/next/src/styles || true

# Showcase is not in the product navigation
grep -rn 'design-system' packages/app/components/Header.tsx apps/next/src/app/layout.tsx

# Production guard (after building with VERCEL_ENV=production)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3100/design-system   # expect 404
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Module not found: Can't resolve 'sass'` | Run `bun install --frozen-lockfile` at the repo root; `sass` is a devDependency of `apps/next`. |
| SCSS syntax error about `@import "tailwindcss"` | Never import Tailwind from SCSS. Tailwind lives in `globals.css` only. |
| Showcase 404 locally | Check `VERCEL_ENV`; only `production` is blocked. Unset it for local review. |
| Wrong `next` version after install | Delete `node_modules` and re-run `bun install --frozen-lockfile`; the lock must resolve `next@16.4.3`. |
| Native/Expo fails | Phase 1 must not import CSS/SCSS from `packages/app` or `apps/expo`; check the diff. |
