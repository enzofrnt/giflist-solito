#!/usr/bin/env bash
#
# Re-point Claude Code's Spec Kit skills at the canonical Codex/DSH copies.
#
# Spec Kit installs two full copies of the ten speckit-* skills (one in
# .agents/skills for Codex/DSH, one in .claude/skills for Claude Code).
# Giftlist keeps a single source of truth in .agents/skills and makes
# .claude/skills/speckit-* symlinks to it. Claude Code supports symlinked
# skill folders:
#   https://code.claude.com/docs/en/skills  ("Symlinked folders")
#
# Run this after any `specify integration install/upgrade`, which replaces
# the links with real (duplicated) directories.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CANON="$ROOT/.agents/skills"
ADAPTER="$ROOT/.claude/skills"

if [ ! -d "$CANON" ]; then
  echo "error: canonical skills directory not found: $CANON" >&2
  exit 1
fi
mkdir -p "$ADAPTER"

linked=0
for dir in "$CANON"/*; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"
  if [ ! -f "$dir/SKILL.md" ]; then
    echo "error: missing $dir/SKILL.md" >&2
    exit 1
  fi
  rm -rf "$ADAPTER/$name"
  ln -s "../../.agents/skills/$name" "$ADAPTER/$name"
  linked=$((linked + 1))
  echo "linked .claude/skills/$name -> .agents/skills/$name"
done

if [ "$linked" -eq 0 ]; then
  echo "error: no .agents/skills/* directories found" >&2
  exit 1
fi

# Verify every adapter is a link that resolves to a readable SKILL.md.
for link in "$ADAPTER"/*; do
  [ -L "$link" ] || { echo "error: not a symlink: $link" >&2; exit 1; }
  [ -f "$link/SKILL.md" ] || { echo "error: broken link: $link" >&2; exit 1; }
done

echo "OK: $linked Claude skills now point to $CANON (single source)."
