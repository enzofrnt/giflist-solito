# Implementation Plan: Application-wide UI Harmonization (Phase 2)

**Branch**: `003-ui-harmonization` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Approved “Porcelain & Cobalt” design system from Phase 1; apply it to every web page/component without changing behavior or native.

## Summary

Reskin the entire `apps/next` web app with the Phase 1 design system: a shared shell (web Header, page frame, auth layout, modals), shared visual primitives (buttons, fields, selects, alerts, cards, badges, empty states), and page-by-page refactors for home, auth, dashboard, manage, public list, profile, and admin. Existing logic, API calls, auth/session behavior, and native rendering remain unchanged. Phase 1 markup/classes are the contract; the only approved change is the token-based select chevron.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.1.0, Next.js 16.4.3, Bun 1.4.4, Node 24.x

**Primary Dependencies**: Phase 1 SCSS design system (`.ds-*`), Tailwind v4 for layout utilities, React Native Web/Solito shared package (web variants only), no new UI runtime dependency

**Storage/API**: Unchanged. No Prisma, route handler, or contract changes.

**Testing**: `bun run web:typecheck`, `bun run web:lint`, `bun run test`, `bun run web:build`, `bun run --cwd apps/expo export`, `scripts/design-system-guard.sh`, plus route smoke tests, responsive/keyboard checks and screenshots.

**Target Platform**: Web only. Native (`apps/expo`) keeps its current shared screens; no CSS in `packages/app`.

**Project Type**: Cross-platform monorepo; implementation in `apps/next`, with web-only wrappers/variants where a shared component is involved.

**Performance Goals**: No meaningful bundle/JS increase beyond shared components; CSS remains one design-system entry; first paint no worse than Phase 1.

**Constraints**: No behavior/data changes; preserve all routes; no raw hex in app components; no CSS/SCSS in shared/native; use tokens; modals accessible; responsive 375/768/1440; reduced motion; existing tests green.

**Environment variables**: None new. `VERCEL_ENV` showcase guard remains.

## Constitution Check

- [x] **Spec-driven**: [spec.md](spec.md) + this plan + tasks.
- [x] **Cross-platform**: Web-only; shared/native untouched except web-only variants in `apps/next` or `.web` files; Expo export gate.
- [x] **Boundaries**: All CSS stays in `apps/next/src/styles`; shared code stays CSS-free; Tailwind entry intact.
- [x] **Data**: No schema/API changes.
- [x] **Security**: No auth behavior change; existing auth helpers reused; no secrets; no new client-side trust.
- [x] **Evidence**: Full gates + route smoke + screenshots + before/after.
- [x] **Deployment**: Preview build; no env changes; showcase stays preview-only.

**Post-design re-check**: PASS. The main deviation is replacing four shared visual components with web-only implementations while `packages/app` keeps the native versions (justified by the hard CSS boundary).

## Project Structure

```text
apps/next/src/styles/
├── _app.scss              # NEW: page frame, web header, auth layout, modal, lists, home
├── _cards.scss            # existing shared surfaces
├── _forms.scss            # existing fields + select chevron
└── index.scss             # + @use 'app'

apps/next/src/components/
├── Header.tsx             # NEW web header (ds classes); native Header untouched
├── AppChrome.tsx          # imports web Header instead of shared Header
├── Modal.tsx              # NEW accessible dialog (role/aria/Escape/focus trap)
├── AuthCard.tsx           # NEW shared auth layout
└── home/HomePage.tsx      # NEW web landing

apps/next/src/app/
├── page.tsx               # renders web HomePage
├── login|register|forgot-password|reset-password|setup-passkey/page.tsx
├── dashboard/page.tsx + DashboardClient.tsx
├── manage/[id]/page.tsx
├── list/[shareCode]/page.tsx + PublicListClient.tsx
├── profile/page.tsx + ProfileClient.tsx
└── admin/page.tsx

apps/next/src/components/
├── AlertModal.tsx, EditListModal.tsx, GiftFormModal.tsx, GiftList.tsx,
├── GiftStatusBadge.tsx, PasswordInput.tsx, PasswordRecoveryForm.tsx,
├── PasskeyManager.tsx, QRCodeDisplay.tsx, ReserveDialog.tsx,
├── SecretModeToggle.tsx (legacy debug components can stay untouched if page-local)
```

## Cross-Platform Impact

| Client | Impacted? | What changes | Verification |
|--------|-----------|--------------|--------------|
| Web | Yes | All pages/components; new web Header/Home/AuthCard/Modal | build, route smoke, screenshots |
| Native | No | Shared `Header`/home stay; no CSS imports | `expo export` |
| Shared | No visual change | Pages consume existing shared hooks/types | typecheck, expo export |

## Data & Migration Plan

None.

## API & Contracts

No API changes. UI contract remains [design-system-classes.md](../002-ui-design-system/contracts/design-system-classes.md), extended with app-shell classes (`.ds-page`, `.ds-header`, `.ds-auth`, `.ds-modal`, `.ds-list`).

## Phase 0: Research

Decisions recorded in [research.md](research.md):

1. Keep Tailwind for layout utilities; use `.ds-*` for visual primitives. A full utility rewrite is unnecessary for consistency and increases regression risk.
2. Web Header: new `apps/next/src/components/Header.tsx`; shared `packages/app/components/Header.tsx` remains for native. Avoids CSS in shared and preserves native.
3. Web Home: new `apps/next/src/components/home/HomePage.tsx`; shared `packages/app/features/home/screen.tsx` remains the native home.
4. Auth pages: shared `AuthCard` shell + `.ds-field`/`.ds-btn`/`.ds-alert`; preserve each page’s submit/redirect logic.
5. Modals: introduce `Modal` with role/aria/Escape/focus trap/restore; adopt in existing dialogs where feasible; keep existing behavior.
6. Existing visual recipes are replaced by shared classes; page-specific CSS limited to genuine layout (e.g., grid composition).
7. Admin gets visual harmonization only; known security gaps remain out of scope.
8. Evidence: screenshots per page group at 1440/390 + keyboard/route smoke.

## Phase 1: Design

### Shared shell

- `.ds-page` canvas/typography, `.ds-page__main` container, `.ds-page-header` title/subtitle/actions, `.ds-toolbar`.
- `.ds-header` sticky web navigation with brand, links, auth actions, mobile menu (Escape, aria-expanded).
- `.ds-auth` centered shell + `.ds-auth__card`; brand and footer links.
- `.ds-modal` overlay/panel/header/body/footer; `Modal` component with focus trap.
- `.ds-list`/`.ds-list-item` for dense rows; `.ds-table` for admin.

### Page mapping

| Page group | Shared components/classes |
|------------|---------------------------|
| Home | `.ds-home`, `.ds-display`, `.ds-btn`, feature cards |
| Auth | `.ds-auth`, `.ds-card`, `.ds-field`, `.ds-alert`, `.ds-btn` |
| Dashboard | `.ds-page`, `.ds-card`, `.ds-badge`, `.ds-empty`, `Modal`, alerts |
| Manage | `.ds-page`, `.ds-card`, `.ds-field`, `.ds-badge`, `.ds-alert`, `Modal` |
| Public list | `.ds-page`, `.ds-home` hero variant, `.ds-card`, `.ds-badge`, `Modal` |
| Profile | `.ds-page`, `.ds-card`, `.ds-field`, `.ds-alert` |
| Admin | `.ds-page`, `.ds-card`, `.ds-field`, `.ds-table`, `.ds-btn` |

### Interaction/accessibility

- All modals: `role="dialog"`, `aria-modal`, labelled title, Escape, focus trap, focus restore.
- All fields: label + `aria-describedby` for errors/hints.
- All buttons/links: visible focus, 44 px targets, disabled/loading states.
- Mobile menu: aria-expanded/controls, Escape, closes on navigation.
- No behavior changes in submit/fetch/redirect logic.

## Verification Plan

```sh
bun install --frozen-lockfile
bun run web:typecheck
bun run web:lint
bun run test
bun run web:build
bun run --cwd apps/expo export
./scripts/design-system-guard.sh
```

- Route smoke: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/setup-passkey`, `/dashboard`, `/profile`, `/admin`, `/list/[shareCode]`, `/manage/[id]`.
- Responsive screenshots 1440/768/390 for each page group; no horizontal overflow.
- Keyboard sweep on each page; dialogs trap/restore focus; Escape closes.
- Behavior checks: auth redirect, list/gift CRUD, reserve/cancel, share/QR, secret mode, scraping, profile/passkey, admin.
- Before/after screenshots in `docs/design-system/screenshots/phase-2/`.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Web-only Header/Home instead of modifying shared RN components | `packages/app` cannot consume CSS and is shared with Expo | Styling shared components with CSS would break native |
| Keep Tailwind layout utilities alongside `.ds-*` | 820 existing utility usages; layout is orthogonal to visual identity | Full SCSS rewrite of every layout would be high-risk and not needed for consistency |
| New `Modal` component | Six ad-hoc modals lack dialog semantics/focus handling | Restyling each ad-hoc shell leaves accessibility debt |
