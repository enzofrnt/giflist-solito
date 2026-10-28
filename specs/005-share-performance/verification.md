# Verification: Share Branding & List-Loading Performance

**Branch**: `feat/share-performance` · **Date**: 2026-10-28

## Diagnostic

| Finding | Impact | Fix |
|---------|--------|-----|
| `AuthContext` invalidated its 60s user cache on every pathname and re-fetched `/api/auth/me` | Extra auth round-trip on every in-app navigation | Revalidate on mount only; keep cache + server enforcement |
| Dashboard “Gérer” used `router.push` | No Next.js prefetch for the manage route | `Link` with default prefetch |
| Public list API did list query then gifts query, and returned `user.email` + `reservedByEmail` | Extra DB round-trip + private data exposure | Single query with gifts + public user fields only (no emails) |
| Manage API included an unused `user` relation | Extra join/payload | Removed |
| Public list mounted a second `useAuth` besides the global context | Duplicate auth request on public pages | Reuse `useAuthContext` |

## Evidence

- **Client navigation** dashboard → manage, after fix: requests = `['/api/gift-lists/1']`; `/api/auth/me` count = **0** (the removed pathname effect was the extra request).
- **QR**: center image always `/logo.webp`; rendered image 52 px on a 224 px QR (~23%); `errorCorrectionLevel: H`; SVG + PNG use the same options. macOS Vision decoded the rendered QR to `http://localhost:3100/list/DEMO1234`.
- **Public API**: one Prisma query; no `user.email` or `reservedByEmail` in the response; gifts keep `createdAt desc`.
- **Manage API**: gifts-only include; no unused user join.
- **README**: logo at the top before the title.

## Gates (Bun 1.4.4)

- `bun run web:typecheck` — pass
- `bun run web:lint` — 0 errors, 15 pre-existing warnings
- `bun run test` — 25/25 pass
- `bun run web:build` — pass
- `bun run --cwd apps/expo export` — pass
- `./scripts/design-system-guard.sh` — pass
- Routes smoke-tested 200; production guard `/design-system` → 404 after deploy.

## Screenshots

- `docs/design-system/screenshots/phase-4/qr-share.jpg`

## Limitations

- Performance measurements use a mocked API/local server, not production DB latency; the eliminated requests and query joins are structural.
- QR was decoded with Vision, not a physical phone; EC H + 23% logo is the scannability margin.
- No API/schema/auth behavior change beyond removing private unused fields.
