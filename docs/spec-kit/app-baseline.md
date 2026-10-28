# Giftlist — application baseline inventory (as-is)

Factual inventory for the Spec Kit constitution and `AGENTS.md`. Descriptive, not prescriptive.

**Canonical state = `origin/main` @ `acde7cc`** (the SHA Vercel serves in production, verified by the Lead through the Vercel MCP). Canonical facts below are read from git objects (`git show`, `git ls-tree`), because the local checkout is a stale branch — see §3.

**Method.** Read-only survey: no installs, builds, branch switches or worktree changes; the only write is this file. Each fact is quoted from `git show origin/main:<path>` unless labelled *local* or *Lead-verified*.

## 1. Canonical state (origin/main @ acde7cc)

### 1.1 Stack and pinned versions

| Item | Value | Evidence |
|---|---|---|
| Runtime / package manager | **Bun 1.4.4** — `packageManager: "bun@1.4.4"`, `.bun-version` `1.4.4`, `engines.bun: ">=1.4.4 <1.5.0"`; Vercel runtime `1.4.x` | `package.json`, `.bun-version`, `apps/next/vercel.json` |
| Lockfile / install | **`bun.lock` only**; npm+pnpm lockfiles and `pnpm-workspace.yaml` deleted; workspaces declared in root `package.json`; `bunfig.toml` `[install] linker = "hoisted"` for Metro | root tree, `bunfig.toml` |
| Next.js | **16.4.3** (`next`, `eslint-config-next`); Webpack is explicit (`next dev --webpack`, `next build --webpack`) to keep `.web.*` resolution and the RN→RNW alias | `apps/next/package.json`, `readme.md` |
| React | 19.1.0, react-dom 19.1.0, react-native 0.81.5, react-native-web ^0.21.2 | manifests |
| Expo | `^54.0.16` (app) / `~54.0.22` (root), New Architecture on | `apps/expo/package.json`, `app.json` |
| DB / ORM | PostgreSQL via `POSTGRES_PRISMA_URL`; Prisma `^6.16.0`; client emitted to `src/generated/prisma` | `prisma/schema.prisma` |
| Auth | bcryptjs ^3.0.2, jsonwebtoken ^9.0.2, `@simplewebauthn/browser ^14.0.0`, `@simplewebauthn/server ^14.0.3` | `apps/next/package.json` |
| Validation / styling | zod ^4.1.5; Tailwind CSS v4 (`@tailwindcss/postcss ^4`, `@import "tailwindcss"`) plus RN `StyleSheet` | `postcss.config.mjs`, `globals.css` |
| TypeScript / lint | TS ^5 (`strict`, `isolatedModules`, `moduleResolution: bundler`, `jsx: react-jsx`); eslint ^9 flat config in `apps/next` (root devDep still eslint ^8 with a legacy `eslintConfig` block) | `tsconfig.json`, `apps/next/eslint.config.mjs` |
| Cross-platform | `solito` (tag `next`), `@react-navigation/native ^7.0.15`, `native-stack ^7.2.1`, `moti ^0.30.0`, `dripsy ^4.3.3`, `react-native-svg ^15.14.0` | `packages/app/package.json` |
| Tests | `bun test` + PGlite (`@electric-sql/pglite 0.5.13`, `pglite-socket 0.2.16`) + `puppeteer ^24.20.0` for WebAuthn e2e | `apps/next/package.json`, `tests/` |
| Other | `@vercel/speed-insights ^1.2.0` (only analytics); `sharp` overridden to `0.35.5`; `trustedDependencies` for prisma/esbuild/puppeteer/sharp/unrs-resolver; `turbo.json` present but **no script invokes turbo** | root `package.json` |

### 1.2 Layout and module resolution

```
giflist-solito/  .bun-version  bunfig.toml  bun.lock  package.json  turbo.json  tsconfig.json  .husky/
├── apps/next/     Vercel root: Next.js App Router + API routes + Prisma + tests
├── apps/expo/     Expo app (iOS/Android, no web platform)
└── packages/app/  shared package "app": features, components, hooks, lib, types, navigation, provider
```

- The shared package is named `app` and imported through `app/*`, mapped by root
  `tsconfig.json` (`"app/*": ["./packages/app/*"]`) and `apps/next/tsconfig.json`
  (`"app/*": ["../../packages/app/*"]`, `"@/*": ["./src/*"]`); `apps/expo/tsconfig.json`
  only extends the root config. `packages/app/index.ts` deliberately exports nothing
  (tree-shaking; comment cites vercel/next#12557).
- Canonical `apps/next/` holds `src/`, `prisma/`, `tests/`, `scripts/build-vercel.mjs`,
  `vercel.json`, `env.example`, `docker-compose.yml`, `eslint.config.mjs`,
  `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, the five docs
  (`README`, `DEPLOYMENT`, `PASSWORD_RESET`, `PASSKEYS`, `SCRAPING`), `test-db.js` and
  `test-regex.js` (1 byte). **`build.sh` no longer exists.**

### 1.3 Commands that exist (canonical)

| Root command | Expands to |
|---|---|
| `bun install --frozen-lockfile` | install; root postinstall runs `bun run --cwd apps/next db:generate` |
| `bun run web:dev` | `bun run --cwd apps/next dev` → `next dev --webpack` |
| `bun run web:build` | `db:generate && next build --webpack` (**no migration**) |
| `bun run web:build:vercel` | `bun scripts/build-vercel.mjs` (**migrate deploy, then build**) |
| `bun run web:start` | `next start` under Bun |
| `bun run web:typecheck` | `tsc --noEmit` |
| `bun run web:lint` | `eslint .` |
| `bun run test` | apps/next `test:password-reset` = `bun run db:generate && bun test tests/*.test.ts` |
| `bun run native` · `native:export` · `android` · `ios` | Expo start / `CI=1 expo export --max-workers 1` / run:android / run:ios |

`apps/next` also exposes `dev:debug`, `dev:no-debug`, `db:push`, `db:migrate`,
`db:generate` (`prisma generate --schema prisma/schema.production.prisma`),
`db:migrate:dev|create|reset`, `db:studio`, `docker:up|down|logs|reset`, `build:vercel`.
`apps/expo` exposes `start`, `android`, `ios`, `export`, all via `bun run --bun expo …`.

**Missing tooling:** no `.github/` → **no CI**; no formatter script (Prettier config only
in root `package.json`, unenforced); no coverage gate; no Next `middleware.ts`/`proxy.ts`
(`src/lib/middleware.ts` is just an `withAuth()` helper); no turbo-driven task graph in
use.

### 1.4 Next.js app: route map

App Router only (no `pages/`). Server components are limited to `layout.tsx` and the
`forgot-password`, `reset-password`, `list/[shareCode]` wrappers; every interactive page
is `'use client'` and fetches `/api/*` from the browser. `layout.tsx` renders the shared
`Header`, `AuthProvider`, Geist fonts, French metadata (`metadataBase` from
`NEXT_PUBLIC_APP_URL`, icons `/logo.webp`) and `<SpeedInsights />`.

| Route | Files | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` → `app/features/home/screen.tsx` | shared marketing home (FlickeringGrid + 3 cards) |
| `/login` | `login/page.tsx` | password login + passkey button; success → `/setup-passkey` |
| `/register` | `register/page.tsx` | shared password rules; success → `/setup-passkey` |
| `/forgot-password`, `/reset-password` | `*/page.tsx` → `components/PasswordRecoveryForm.tsx` | `noindex`, `no-referrer`; reset token read from URL **fragment** |
| `/setup-passkey` | `setup-passkey/page.tsx` | WebAuthn enrollment after login/register; skippable → `/dashboard` |
| `/dashboard` | `dashboard/page.tsx` + `DashboardClient.tsx` (631 L) | client-side guard; list CRUD, share/QR, delete |
| `/profile` | `profile/page.tsx` + `ProfileClient.tsx` (380 L) | name, password change, `<PasskeyManager />` |
| `/manage/[id]` | `manage/[id]/page.tsx` (880 L) | owner console: gifts CRUD, scraping, cancel/unreserve, secret-mode reveal, QR/share |
| `/list/[shareCode]` | `list/[shareCode]/page.tsx` + `PublicListClient.tsx` | public list, reserve/cancel, secret-mode masking, QR/share |
| `/admin` | `admin/page.tsx` (679 L) | **orphan** (linked nowhere); `localStorage.admin_authenticated` gate with hardcoded `enzo`/`enzo`; uses `/api/gift` |

API routes (`src/app/api/**/route.ts`), auth as implemented:

| Route | Methods | Auth |
|---|---|---|
| `auth/register`, `auth/login` | POST | none (zod) |
| `auth/me` | GET | `withAuth` (Bearer JWT) |
| `auth/profile` | PUT | Bearer JWT (`getCurrentUser`) |
| `auth/change-password` | PUT | Bearer JWT; verifies current password, bumps `authVersion`, returns fresh token, clears reset tokens |
| `auth/forgot-password` | POST | none + same-origin + IP quota 10/30 min |
| `auth/reset-password` | POST | none + same-origin + IP quota 30/15 min |
| `auth/passkeys/register-options`, `register-verify` | POST | JWT + origin/rpID checks + 10/30 min quota |
| `auth/passkeys/login-options`, `login-verify` | POST | none + 30/15 min quota; verify issues JWT |
| `auth/passkeys/manage` | POST (list), DELETE (revoke) | JWT, scoped `{ id, userId }` |
| `gift-lists` | GET, POST | `withAuth` |
| `gift-lists/[id]` | GET, PUT, DELETE | `withAuth` + ownership |
| `gift-lists/[id]/reveal` | POST | `withAuth`; requires `secret: true` but **changes no state** |
| `gift-lists/[id]/gifts`, `…/gifts/[giftId]` | POST / PUT, DELETE | `withAuth` |
| `gift-lists/[id]/gifts/[giftId]/cancel`, `…/unreserve` | POST | `withAuth` |
| `public/gift-lists/[shareCode]` | GET | **none** (by design); returns reservation names/emails |
| `public/…/gifts/[giftId]/reserve` | POST | none; transactional availability check |
| `public/…/gifts/[giftId]/cancel` | POST | **none** — any share-code holder can cancel any reservation |
| `reserve` (legacy) | POST | **none**, by raw `giftId`, no list scoping |
| `gift` (legacy) | GET, POST, PUT, DELETE | **none** — global gift CRUD across all lists |
| `scrape-product` | POST | none, no quota; 647-line parser (ScrapingBee if `SCRAPINGBEE_API_KEY`, else direct fetch + OpenGraph/CSS heuristics, Amazon-specific) |

`next.config.ts`: `transpilePackages: ['app', 'expo-image']`, webpack alias
`react-native` → `react-native-web`, `.web.{js,jsx,ts,tsx}` resolved first,
`images.remotePatterns` for `https://m.media-amazon.com/**`. No `headers()`, CSP,
redirects or rewrites.

### 1.5 Authentication and sessions

- **Password**: bcrypt cost 12; JWT HS256 valid 7 days with
  `{ userId, email, authVersion }`. `JWT_SECRET` is required in production
  (`getJwtSecret()` throws; dev falls back to `development-only-secret`).
- **Session storage**: `localStorage['auth-token']` (`packages/app/lib/authStorage.ts`),
  sent as `Authorization: Bearer <jwt>`. No cookies for sessions, no edge protection —
  each protected page redirects client-side.
- **Revocation**: `User.authVersion` is inside the JWT and compared in `getCurrentUser`;
  password change/reset increment it and invalidate older tokens.
- **Passkeys**: RP IDs `giftlist.fr` (shared with `www.giftlist.fr`), Vercel preview hosts
  from `VERCEL_URL`/`VERCEL_BRANCH_URL`, `http://localhost` only outside production.
  Challenges live in `PasskeyChallenge` (SHA-256 of a 32-byte secret) plus an httpOnly,
  `sameSite: strict` cookie scoped to `/api/auth/passkeys` (5 min), consumed atomically
  via `DELETE … RETURNING`. User verification required.
- **Password recovery (Resend)**: generic response, real work deferred with `after()`;
  quotas in `AuthRateLimit` (10/IP/30 min, 3/address/30 min, 40 emails per UTC day,
  30 submissions/IP/15 min); link `${origin}/reset-password#token=<64 hex>`; token stored
  as SHA-256 only, 30 min TTL, consumed in the same transaction as the password write;
  reset **deletes all passkeys**; confirmation email is idempotent (`Idempotency-Key`),
  3 attempts, 10 s timeout, direct `fetch` to `https://api.resend.com/emails` (no SDK).
- **Preview origins**: `getAppOrigin()` (`src/lib/email.ts`) uses
  `VERCEL_BRANCH_URL || VERCEL_URL` when `VERCEL_ENV === 'preview'` (must match
  `*.vercel.app`); otherwise requires an explicit HTTPS `APP_URL`; throws otherwise.
- **DB hardening**: migrations enable RLS and revoke `PUBLIC`/`anon`/`authenticated`
  privileges on `User`, `PasswordResetToken`, `AuthRateLimit`, `Passkey`,
  `PasskeyChallenge`.

### 1.6 Data model

`schema.prisma` and `schema.production.prisma` are **byte-identical on `origin/main`**
(verified with `diff`). Provider `postgresql`, URL `env("POSTGRES_PRISMA_URL")`,
generator `prisma-client-js` → `../src/generated/prisma`. **No enums**, no `Decimal`
(prices are `Float`).

| Model | Fields | Relations / indexes |
|---|---|---|
| `User` | `id Int @id autoincrement`, `email @unique`, `password`, `name String`, `authVersion Int @default(0)` | `giftLists`, `passwordResetToken?`, `passkeys[]`; indexes email, createdAt |
| `GiftList` | `id`, `title`, `description?`, `image?`, `isPublic @default(true)`, `secret @default(false)`, `shareCode @unique`, timestamps | `userId → User` (Cascade); `gifts[]`; indexes userId/shareCode/createdAt/secret |
| `Gift` | `id`, `title`, `url?`, `image?`, `price Float?`, `description?`, `status String @default("available")`, `reservedBy?`, `reservedByName?`, `reservedByEmail?`, `reservedAt?`, timestamps | `giftListId → GiftList` (Cascade); indexes status/createdAt/giftListId |
| `PasswordResetToken` | `tokenHash String @id`, `userId Int @unique`, `authVersion`, `expiresAt` | `user → User` (Cascade); index expiresAt |
| `AuthRateLimit` | `key String @id`, `count`, `expiresAt` | index expiresAt |
| `Passkey` | `id String @id`, `userId`, `rpId`, `publicKey Bytes`, `counter BigInt @default(0)`, `transports String[]`, `deviceType`, `backedUp`, `createdAt`, `lastUsedAt?` | `user → User` (Cascade); index userId |
| `PasskeyChallenge` | `id String @id`, `challenge`, `purpose`, `origin`, `rpId`, `userId Int?`, `authVersion Int?`, `expiresAt` | index expiresAt |

Migrations (directory order): `20250101000000_init`,
`20251031143802_make_name_required`, `20251031211354_add_secret_to_gift_lists`,
`20261028180000_add_password_recovery`, `20261028190000_add_passkeys` (last two add RLS
and revoke grants). `apps/next/prisma/dev.db` (69 KB SQLite file) is still **tracked**
even though no script or datasource uses SQLite.

### 1.7 Environment variables referenced by code

| Variable | Used in | Notes |
|---|---|---|
| `POSTGRES_PRISMA_URL` | schema datasource, `src/lib/prisma.ts`, build script | app connection |
| `DATABASE_URL` | `prisma.ts` fallback, build script fallback | |
| `POSTGRES_URL_NON_POOLING` | `scripts/build-vercel.mjs` | preferred URL for migrations |
| `JWT_SECRET` | `src/lib/auth.ts` | required in production |
| `APP_URL` | `src/lib/email.ts` | HTTPS origin for recovery links |
| `EMAIL_FROM`, `RESEND_API_KEY` | `src/lib/email.ts` | Resend send-only key |
| `SCRAPINGBEE_API_KEY` | `api/scrape-product/route.ts` | optional |
| `NEXT_PUBLIC_APP_URL` | `src/app/layout.tsx` | `metadataBase`; falls back to `https://gift.enzo-frnt.fr` |
| `EXPO_PUBLIC_API_URL` | `packages/app/components/Header.tsx` | native API base; default `http://localhost:3000` |
| `VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_BRANCH_URL` | `auth-request.ts`, `email.ts`, `passkeys.ts` | platform-provided |
| `NODE_ENV` | prisma logging, secret fallback, HTTPS checks | |
| `CHROME_PATH` | `tests/password-reset.test.ts` | optional e2e override |
| `NEXT_PUBLIC_BASE_URL` | **`env.example` only** | stale — unread by any source file |

Lead-reported Vercel-side variables **not referenced in the repo** (unverifiable from
code): `SUPABASE_*`, `NEXT_PUBLIC_SUPABASE_*`, `RESEND_EMAIL_DOMAIN`,
`ENABLE_ROOT_PATH_BUILD_CACHE`.

### 1.8 Deployment

- Vercel Root Directory = **`apps/next`**; config is `apps/next/vercel.json`
  (`bunVersion: "1.4.x"`, `installCommand: "cd ../.. && bun install --frozen-lockfile"`,
  `buildCommand: "bun run build:vercel"`, `framework: "nextjs"`, `regions: ["cdg1"]`).
  There is no `vercel.json` at the repo root on `main`.
- `apps/next/scripts/build-vercel.mjs`: picks
  `POSTGRES_URL_NON_POOLING || DATABASE_URL || POSTGRES_PRISMA_URL`, runs `db:migrate`
  (`prisma migrate deploy`, 120 s timeout), then `build` (`db:generate` from
  `schema.production.prisma` + `next build --webpack`); throws when `VERCEL` is set and
  no DB URL exists. Local `bun run web:build` never migrates and never rewrites schemas.
- `.husky/pre-commit` = `bun run web:build` (full production build per commit).
- **Vercel project** (Lead-verified via MCP; IDs also in the gitignored local
  `apps/next/.vercel/project.json`): project `giflist-solito`,
  `projectId prj_iBGFAXN3borSQ2zFcTq9q8zAxtFU`, `orgId team_B5BCUGJ6Zkjk0PiOR12QzQs9`,
  team `enzofrnts-projects`, domains `giftlist.fr` + `www.giftlist.fr`, Deployment
  Protection SSO `all_except_custom_domains`, latest production SHA `acde7cc`.
- No cron, queues or other background jobs; only `after()` for recovery emails and
  challenge cleanup. `runtime = 'nodejs'` + `maxDuration = 60` exist only on
  `auth/forgot-password` and `auth/reset-password`.
- Provider facts: email via Resend (domain `giftlist.fr`, Cloudflare DNS, free tier);
  DB on Supabase/Postgres (`Gift-dev` for preview/development, `Gift-Production`), per
  `DEPLOYMENT.md` / `PASSWORD_RESET.md`.

### 1.9 User-facing feature surface

| Feature | Where | Mobile (Expo) |
|---|---|---|
| Marketing home | `packages/app/features/home/screen.tsx` | yes (same file) |
| Register / password login | `app/{register,login}/page.tsx`, `api/auth/{register,login}`, `src/lib/auth.ts` | no |
| Passkey login, enrollment, management | `login/page.tsx`, `setup-passkey/page.tsx`, `components/PasskeyManager.tsx`, `lib/passkeys.ts`, 5 passkey routes | no |
| Password recovery by email | `forgot-password/`, `reset-password/`, `components/PasswordRecoveryForm.tsx`, `lib/{password-reset,email}.ts` | no |
| Profile (name, password, passkeys) | `profile/page.tsx`, `ProfileClient.tsx` | no |
| Gift list CRUD | `dashboard/page.tsx`, `DashboardClient.tsx`, `components/EditListModal.tsx`, `api/gift-lists/**` | no |
| Gift CRUD | `manage/[id]/page.tsx`, `components/{GiftFormModal,GiftStatusBadge}.tsx`, `api/gift-lists/[id]/gifts/**` | no |
| Product scraping autofill | `components/GiftFormModal.tsx`, `api/scrape-product`, dev-only `ScrapingTest.tsx` / `AmazonDebug.tsx` | no |
| Public share, QR code, reservation | `list/[shareCode]/PublicListClient.tsx`, `components/{QRCodeDisplay,ReserveDialog}.tsx` (`qr-code-styling`, PNG download) | no |
| Reservation cancel / unreserve | `api/public/**`, `api/gift-lists/[id]/gifts/[giftId]/{cancel,unreserve}` | no |
| Secret-mode masking (cosmetic toggle) | `components/SecretModeToggle.tsx`, `api/gift-lists/[id]/reveal` | no |
| Admin gadget page (unlinked) | `admin/page.tsx`, `api/gift/route.ts` | no |
| Search, filter, sort, i18n, notifications | **not implemented** (French UI copy only) | no |

### 1.10 Shared package and Expo app

`packages/app` (26 tracked files):

- `features/home/screen.tsx` (301 L) — the only real shared feature.
- `features/user/detail-screen.tsx` (14 L) — untouched Solito template leftover, only in
  the native stack.
- `components/Header.tsx` (712 L, responsive nav + `useAuth`), `components/LogoImage.tsx`
  (web → `SolitoImage /logo.webp`; native → `require('app/assets/logo.png')` — the one
  explicit platform branch), `components/FlickeringGrid.tsx` (196 L, RN `Animated`).
- `hooks/useAuth.ts` (232 L; 60 s cache, `apiBaseUrl`, `noRedirect`, `watchPathname`),
  `lib/authStorage.ts` (175 L; web `localStorage`, native lazily `require`s
  `@react-native-async-storage/async-storage` with a silent `localStorage` fallback),
  `lib/passwordValidation.ts` (76 L, shared rules: ≥8, lower, upper, digit, special).
- `types/{User,Gift,GiftList,Auth,Reserve,index}.ts` — handwritten DTOs parallel to Prisma.
- `navigation/native/index.tsx` (native stack: `home`, `user-detail` only),
  `provider/index.tsx`, `provider/navigation/{index.tsx,index.native.tsx}`,
  `provider/safe-area/*` (Solito no-op pattern), `rnw-overrides.d.ts`, `assets/logo.png`.
- Platform selection: Metro resolves `.native.ts(x)`; Webpack/Next resolves
  `.web.{js,jsx,ts,tsx}` first; types via `rnw-overrides.d.ts`.
- `dripsy`, `moti`, `qrcode`, `qrcode-generator` are declared but **imported nowhere**;
  `apps/next/src/components/GiftList.tsx` is also unused.

`apps/expo` (9 tracked files): `App.tsx` = `<Provider><NativeNavigation/></Provider>`;
`app.json` still says **`solito-blank`** (name, slug, scheme; `platforms: ["ios",
"android"]`; `ios.bundleIdentifier: "com.enzofournet.giflist"`; `newArchEnabled: true`;
`experiments.reactCanary: true`); `metro.config.js` (workspace `watchFolders`, both
`nodeModulesPaths`, `disableHierarchicalLookup`); `babel.config.js`
(`babel-preset-expo` + `react-native-worklets/plugin`); no `.env*`; `ios/` and `android/`
gitignored prebuild output. It consumes the shared package via `"app": "workspace:*"`.
Native has **no** auth, dashboard, gift-list or profile screens, while `Header` pushes
`/dashboard`, `/profile`, `/login`, `/register` — routes the native stack does not define.

## 2. The 14 commits between local HEAD and origin/main

| Commit | Change |
|---|---|
| `41acee5` | Bun 1.4.4 migration: `bun.lock`, `.bun-version`, `bunfig.toml`; drop npm/pnpm lockfiles, `pnpm-workspace.yaml`, `.npmrc`; all scripts → `bun run` |
| `f27d27f`, `8988daa`, `eb1c37e` | Next.js/Sharp security patches; `sharp` pinned `0.35.5` |
| `0b0f2d5` | Document isolated preview auth configuration |
| `6856d7c` | Next.js **16.4.3**, explicit Webpack builds |
| `8c20386`, `7f0933f` | Recovery works on every Vercel preview (`getAppOrigin` from `VERCEL_BRANCH_URL`/`VERCEL_URL`); new `tests/email-config.test.ts` |
| `a07f981` (PR #7) | Merge of the password-reset work that is the local HEAD |
| `d4a1c96`, `ee6622f` (PR #6) | Merge `origin/main` into the Bun branch; merge Bun migration |
| `cce2735`, `903f2ed`, `acde7cc` (PR #8) | **Passkeys**: `Passkey` + `PasskeyChallenge` models and migration `20261028190000_add_passkeys`; `lib/passkeys.ts`; 5 API routes; `setup-passkey` page; `PasskeyManager` in profile; login button; password reset deletes passkeys; Puppeteer WebAuthn e2e; `PASSKEYS.md` |

Unchanged in that range: `next.config.ts`, `src/lib/auth.ts`, `src/lib/auth-request.ts`,
`layout.tsx`, dashboard/manage/public-list clients, scraping route, other Prisma models,
`docker-compose.yml`, `test-db.js`.

## 3. Local checkout drift and uncommitted WIP (sampled 2026-10-28)

### 3.1 Checkout vs canonical

- Branch `codex/password-reset`, HEAD `e59d978`; `origin/main` = `acde7cc`.
  `git rev-list --left-right --count origin/main...HEAD` → `14  0` (HEAD is an ancestor,
  14 behind, 0 ahead).
- Using the working tree as baseline would wrongly describe: pnpm 10.12.4 instead of Bun,
  Next 15.5.2 instead of 16.4.3, `build.sh` and a root `vercel.json` still present,
  npm+pnpm lockfiles present, no passkeys, no `apps/next/vercel.json`, no
  `build:vercel`/`typecheck` scripts, tests via `tsx`/`node:test`.
- Local machine: `bun --version` = **1.4.2** (canonical requires 1.4.4 /
  `>=1.4.4 <1.5.0`), `node -v` = v24.19.0, `pnpm -v` = 10.12.4, and no `bun.lock`.
- Local-only ignored files: `apps/next/.env` (`DATABASE_URL`, `BETTER_AUTH_URL`,
  `POSTGRES_PRISMA_URL`, `JWT_SECRET`, all set), `apps/next/.env.local`
  (`VERCEL_OIDC_TOKEN`), `.vercel/`, `node_modules/`, `.next/`, `apps/expo/ios/`.
  `BETTER_AUTH_URL` is referenced nowhere (leftover); `APP_URL`, `EMAIL_FROM`,
  `RESEND_API_KEY` are absent, so recovery returns 503 locally.

### 3.2 Uncommitted Prisma WIP (gift groups)

Working-tree state before this file was added:

```
 M apps/next/prisma/schema.prisma
 M apps/next/prisma/schema.production.prisma
?? apps/next/prisma/migrations/20251117120000_add_gift_groups/
```

`git diff --stat` → 2 files changed, 39 insertions(+), 2 deletions(-). The change, applied
identically to both schema files:

- new `model GiftGroup { id, title, position Int?, createdAt, updatedAt, giftListId,
  giftList (Cascade), gifts Gift[] }` with `@@index([giftListId])` and
  `@@index([giftListId, position])`;
- `GiftList.groups GiftGroup[]`;
- `Gift.giftGroupId Int?` + `giftGroup GiftGroup? @relation(…, onDelete: SetNull)` and
  `@@index([giftGroupId])`;
- new untracked `20251117120000_add_gift_groups/migration.sql` (CREATE TABLE + ADD COLUMN
  + 3 indexes + 2 FKs).

Also present: a formatting artifact from the old `build.sh`
(` datasource db {` with a leading space), which is why `schema.prisma` shows as modified
even when only `schema.production.prisma` was hand-edited.

Reality: **schema + migration only.** No route, UI, type or test references `GiftGroup`
(`git grep GiftGroup` matches nothing outside the two schemas; the generated client is
gitignored). Local branch `gift-groupes` sits at `29dc59e` and contains no gift-group
code; no remote branch carries the migration. The local generated client was regenerated
with `giftGroup` on 2026-10-28 18:17, so it exists locally but not in production.

**Do not revert or edit these files** — the owner decides to finish or drop the WIP. It
also conflicts textually with `origin/main` (both append to the same schema files; `main`
adds `Passkey`/`PasskeyChallenge` after `AuthRateLimit`), so a merge must re-add
`GiftGroup` cleanly.

### 3.3 Untracked non-app directories

`.agents/`, `.claude/`, `.specify/`, `docs/` are untracked tooling/Spec Kit artifacts
created by the Lead's setup and by this survey; they are not app source.

## 4. Risks and gaps (candidate constitution rules)

| # | Risk | Evidence | Rule candidate |
|---|---|---|---|
| 1 | Baseline drift: local checkout is 14 commits behind production | `rev-list` → `14 0` | Always branch from `origin/main`; never treat a stale checkout as current |
| 2 | Gift-group WIP on no branch, with no implementation | §3.2 | No uncommitted migrations; don't merge schema without routes/UI/tests |
| 3 | **No CI**; lint/typecheck/test/build are unverified by automation | no `.github/` | Add CI covering the four gates |
| 4 | Unauthenticated legacy API: `GET /api/gift` exposes every gift (incl. `reservedByEmail`); `PUT`/`DELETE` mutate any id | `api/gift/route.ts` | Delete or auth-gate; all mutations need `withAuth` + ownership |
| 5 | Unauthenticated `POST /api/reserve` reserves by raw `giftId`, no list scoping | `api/reserve/route.ts` | Remove in favour of the share-code route |
| 6 | Public cancel lets any share-code holder cancel others' reservations | `api/public/.../cancel/route.ts` | Require reserver identity/secret or owner-only cancellation |
| 7 | `/admin` ships hardcoded `enzo`/`enzo`, gates on `localStorage`, calls the unauthenticated API | `admin/page.tsx` | No client-side credentials; admin needs real auth or removal |
| 8 | Secret mode is cosmetic: API always returns names/emails; `/reveal` changes nothing | `api/public/.../route.ts`, `reveal/route.ts` | Server must redact reservation data when `secret` is true |
| 9 | JWT in `localStorage`; route protection only client-side | `authStorage.ts`, page guards | Prefer httpOnly cookie + server guard, or document the trade-off |
| 10 | Scraper: 647-line bespoke parser, unauthenticated, no quota, server-side fetch of user URLs | `api/scrape-product/route.ts` | Auth, rate limit, outbound URL restrictions (SSRF) |
| 11 | `apps/next/prisma/dev.db` tracked although SQLite is dead | `git ls-tree origin/main -- apps/next/prisma` | No DB binaries in git |
| 12 | Two schema files must stay byte-identical; `db:generate` reads `schema.production.prisma` | verified identical on `main` | Any schema change edits both files + migration together |
| 13 | `env.example` stale (`NEXT_PUBLIC_BASE_URL` unread, no passkey/preview vars); unused `BETTER_AUTH_URL` locally | §1.7, §3.1 | One documented env contract, no unused variables |
| 14 | Unused code/deps: `dripsy`, `moti`, `qrcode`, `qrcode-generator`, `components/GiftList.tsx`; `puppeteer` is a prod dep used only by tests | `git grep` of imports | Prune or justify; test-only deps belong in devDependencies |
| 15 | `Gift.status` is an unconstrained string; reservation identity is denormalized strings, not FKs; no enums/DB checks/soft delete; deletes cascade from `User`/`GiftList` | schema `Gift` | Enum/constraint (+ reservation model if bookings grow); document intentional cascades |
| 16 | Only `tests/password-reset.test.ts` + `tests/email-config.test.ts`; no component or product-flow tests, no coverage gate | `apps/next/tests/` | New behavior needs tests; don't lower existing coverage |
| 17 | `turbo.json` and root `eslint@8` config are dead weight beside Bun + eslint 9 | root `package.json` | One task runner, one lint config |
| 18 | Pre-commit runs a full production build | `.husky/pre-commit` | Hooks run lint/typecheck/test; build in CI |
| 19 | Preview/production DB separation is convention only; a wrong `POSTGRES_*` value would migrate production from a preview build | `build-vercel.mjs`, `DEPLOYMENT.md` | Preview must use `Gift-dev`; build refuses prod DB on preview |

## 5. Verification commands and known limits

Read-only commands used (repo root): `git show origin/main:<path>`,
`git ls-tree -r origin/main --name-only -- <path>`, `git log --oneline e59d978..origin/main`,
`git diff e59d978..origin/main --stat`, `git rev-list --left-right --count origin/main...HEAD`,
`git status --short`.

Canonical gates (documented, **not executed here** — they need Bun 1.4.4 plus a database
and Chrome):

```sh
bun install --frozen-lockfile
bun run test            # apps/next: bun run db:generate && bun test tests/*.test.ts
bun run web:typecheck   # apps/next: tsc --noEmit
bun run web:lint        # apps/next: eslint
bun run web:build       # db:generate + next build --webpack (no migration)
bun run web:build:vercel  # migrate deploy (120 s) then build
```

Not verifiable from the repo: Vercel project settings and deployment SHA (Lead-reported
via Vercel MCP), production/preview env values, Supabase project names, Resend/Cloudflare
DNS state, and whether `bun test tests/*.test.ts` passes on `origin/main` (local Bun is
1.4.2, canonical is 1.4.4; the WebAuthn e2e also needs Chrome). There is no CI to check.

Local-only evidence on the stale HEAD `e59d978`:
`cd apps/next && ../../node_modules/.bin/tsx --test tests/password-reset.test.ts` passed
**9/9** (recovery flows, quotas, RLS grants, same-origin checks). That is a sanity signal
for shared code `main` inherited, not proof for the canonical suite.
