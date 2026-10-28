# apps/expo — Native client

Read the root [`AGENTS.md`](../../AGENTS.md) first. It contains the mandatory Spec Kit workflow, canonical commands, and constitution rules.

## Scope

- Expo SDK 57 app (React Native 0.86.3, React 19.2) that consumes the shared `packages/app` product code.
- Native navigation (`packages/app/navigation/native`) and providers.
- Native-only modules/configuration live here; shared UI belongs in `packages/app`.

## Rules specific to this app

- Bun 1.4.4 only (`bun run --bun expo ...`). Do not add npm/pnpm/yarn lockfiles.
- Keep shared behavior in `packages/app`; use `.native.tsx`/`.web.tsx` siblings for platform differences. Shared tokens/primitives live in `packages/app/ui`, shared API in `packages/app/lib/api.ts`.
- Any dependency with native code must be compatible with Expo SDK 57 and installed here (keep versions aligned with `packages/app` when shared).
- `ios/` and `android/` are generated and gitignored; do not hand-edit generated native projects without a plan.
- Feature specs must state native scope. Verify both web and native when a shared component changes.

## Verify

```sh
bun run native                  # start Expo dev client
bun run native:typecheck
bun run native:doctor
bun run --cwd apps/expo export  # smoke export without a device
```

See `apps/expo/README.md` for `EXPO_PUBLIC_API_URL` and simulator prerequisites.
