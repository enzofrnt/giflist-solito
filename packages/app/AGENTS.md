# packages/app — Shared product code

Read the root [`AGENTS.md`](../../AGENTS.md) first. It contains the mandatory Spec Kit workflow, canonical commands, and constitution rules.

## Scope

- Shared types (`types/`), hooks (`hooks/`), libraries (`lib/`), components (`components/`), features (`features/`), providers (`provider/`), and native navigation (`navigation/native`).
- Consumed by both `apps/next` (web) and `apps/expo` (native).

## Rules specific to this package

- **Never import from `apps/next` or `apps/expo`.** Dependency direction is one-way; server-only code, Prisma, and secrets must not appear here.
- Product logic, validation, and types shared by both clients belong here — do not duplicate them in the apps.
- Platform differences use `.web.tsx` / `.native.tsx` (or `.ts`) siblings, colocated with the shared file. Keep imports platform-neutral.
- Keep `index.ts` exports explicit; avoid deep imports from app code when a shared export exists.
- UI added here must be verified on both web and native. If only one client is in scope, say so in the spec/plan.

## Verify

```sh
bun run web:typecheck   # typechecks the web consumer
bun run web:build
bun run native          # native consumer
```
