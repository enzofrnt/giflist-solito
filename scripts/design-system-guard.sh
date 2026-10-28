#!/usr/bin/env bash
#
# Design-system guardrails for Phase 1/2.
# Fails when the architecture drifts from the approved structure:
#  - Tailwind import must stay in the CSS entry, never in SCSS;
#  - Sass must use @use, not the deprecated @import;
#  - component partials must use tokens, not raw hex;
#  - shared/native code must not import CSS/SCSS;
#  - password rules must stay single-sourced;
#  - the compiled CSS must contain the design-system classes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STYLES="$ROOT/apps/next/src/styles"
fail=0

check() {
  local label="$1"
  shift
  if "$@"; then
    echo "ok: $label"
  else
    echo "FAIL: $label" >&2
    fail=1
  fi
}

# 1. Tailwind remains the CSS entry.
check "Tailwind import lives in apps/next/src/app/globals.css" \
  grep -q '@import "tailwindcss"' "$ROOT/apps/next/src/app/globals.css"

# 2. No Tailwind import or deprecated Sass @import in the SCSS layer.
check "no @import in the SCSS layer" \
  bash -c '! grep -RIn --include="*.scss" -E "^[[:space:]]*@import" "$0"' "$STYLES"

# 3. Component partials use tokens, not raw hex values.
check "no raw hex in component partials" \
  bash -c '! grep -RIn --include="_*.scss" -E "#[0-9a-fA-F]{3,8}" "$0" | grep -v "_tokens.scss"' "$STYLES"

# 4. Shared/native code stays CSS-free.
check "no CSS/SCSS imports in packages/app or apps/expo" \
  bash -c '! grep -RIn -E "\.(s?css)" "$0/packages/app" "$0/apps/expo" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"' "$ROOT"

# 5. Password rules stay single-sourced.
check "password rules single-sourced" \
  bash -c 'grep -Rq "getPasswordRules" "$0/apps/next/src" "$0/packages/app/lib"' "$ROOT"

# 6. Compiled output contains the design-system layer (only when a build exists).
if compgen -G "$ROOT/apps/next/.next/static/css/*.css" > /dev/null; then
  check "design-system classes compiled into CSS" \
    bash -c 'grep -Rq "ds-btn" "$0/apps/next/.next/static/css"' "$ROOT"
else
  echo "skip: compiled CSS check (run bun run web:build first)"
fi

if [ "$fail" -ne 0 ]; then
  echo "Design-system guard failed." >&2
  exit 1
fi

echo "Design-system guard passed."
