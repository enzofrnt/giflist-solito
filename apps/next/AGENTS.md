# apps/next — Web + API

Read the root [`AGENTS.md`](../../AGENTS.md) first. It contains the mandatory Spec Kit workflow, canonical commands, and constitution rules.

## Scope

- App Router pages in `src/app/**` (`page.tsx`, `layout.tsx`, `*Client.tsx`).
- Route handlers in `src/app/api/**/route.ts` (auth, gift-lists, public, reserve, scrape-product).
- Server libraries in `src/lib/` (`auth.ts`, `auth-request.ts`, `middleware.ts`, `prisma.ts`, `passkeys.ts`, `password-reset.ts`, `email.ts`).
- Prisma schema, migrations, and generated client (`prisma/`, `src/generated/prisma` — generated, never hand-edited).
- `scripts/build-vercel.mjs`: Vercel deploy build; applies `prisma migrate deploy`, generates the client from `schema.production.prisma`, then builds.

## Rules specific to this app

- Turbopack is the bundler (`next dev --turbopack` / `next build --turbopack`). `next.config.ts` must keep the Solito `react-native → react-native-web` alias and `.web.*` resolution order in `turbopack.resolveAlias` / `turbopack.resolveExtensions`. Verify `/`, auth, search, public-list and manage routes after changing them.
- Every route handler validates input with Zod and enforces ownership server-side. Use the auth helpers; do not re-implement JWT/cookie parsing.
- `schema.prisma` and `schema.production.prisma` must stay identical, with a committed forward-only migration for every change. Never `db push`/`reset` against shared databases. Production migrations run in the Vercel build, so a bad migration fails deployment.
- Tests: `apps/next/tests/*.test.ts` via `bun test`, using the ephemeral pglite PostgreSQL fixture (never a shared database).
- Public share routes (`api/public/**`) must expose only public fields; never leak owner emails or secrets.

## Verify

```sh
bun run web:typecheck
bun run test
bun run web:lint
bun run web:build
```
