# Verification

## Reproduction (before the fix)

On the dev instance (`http://127.0.0.1:3001`, `next dev`), setting the e-mail and password DOM values **without dispatching input events** (password-manager autofill behaviour) and submitting produced:

- `POST /api/auth/login` → **400** `{"ok":false,"error":"Email invalide"}`
- alert “Connexion impossible — Email invalide”
- fields cleared, no token

## After the fix

| Scenario | Result |
|----------|--------|
| Autofilled values injected without input events → submit | `POST /api/auth/login` **200**, redirect `/dashboard`, token present |
| Typed `demo@giftlist.fr` / password → submit | **200**, `/dashboard`, token present |
| Typed wrong password → submit | **401**, “Connexion impossible — Email ou mot de passe incorrect”, e-mail still visible, no token |

## Input attributes

- E-mail: `autocomplete="username"`, `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`.
- Password: `autocomplete="current-password"`, `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`.

## Implementation

- `handleSubmit` reads `new FormData(event.currentTarget)` (e-mail trimmed, password unchanged), then synchronises React state so the visible values survive loading/error re-renders.
- The shared `PasswordInput` now sets the keyboard attributes for every password field.

## Gates

- `bun run web:typecheck` — ✅ exit 0.
- `bun run web:lint` — ✅ exit 0, 0 errors (32 pre-existing warnings elsewhere).
- `bun run web:build` — ✅ executed by the Husky pre-commit hook on commit.
- `bun run test` — not applicable: no server auth/data logic changed; the password-reset suite is untouched.
- Dev server: `PORT=3001 bun run dev` (Turbopack), login flows exercised against it after hot reload.

## Notes

- The e-mail is trimmed but not lower-cased: existing rows keep their stored casing and the server lookup is unchanged. Case-insensitive account matching is a separate decision.
- Register and forgot-password still send React state on submit; they were not part of this failure. If the same autofill pattern is reported there, apply the same `FormData` approach.
