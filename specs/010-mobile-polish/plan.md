# Implementation Plan: Mobile Polish

1. Home: switch “Créer un compte” to `Button variant="secondary"`.
2. API client: add `updateGift` and `changePassword`.
3. Manage: image thumbnail + edit mode (shared add/edit form), update gift in state.
4. Profile: password-change form + PasswordStrength; persist new token via `signIn`.
5. PasswordStrength: RN `Animated.Value` for animated fill width.
6. Verify expo typecheck/export, simulator screenshots if available.
