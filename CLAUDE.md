# Claude Code — Giftlist

@AGENTS.md
@.specify/memory/constitution.md

## Claude-specific notes

- Spec Kit skills are installed once in `.agents/skills/` (canonical, shared with Codex/DSH). `.claude/skills/speckit-*` are symlinks to those directories; Claude Code supports symlinked skill folders. Invoke them as slash commands:
  `/speckit-specify <description>`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`, `/speckit-checklist`, `/speckit-converge`, `/speckit-taskstoissues`, `/speckit-constitution`.
- The standing rule is mandatory: **specify before implementing** for every feature/enhancement. See “NON-NEGOTIABLE” in `AGENTS.md`.
- Shared scripts are bash (`.specify/scripts/bash/*.sh`); run them from the repository root.
- Do not hand-edit `.claude/skills/**` or `.agents/skills/**`. If the links are missing or an upgrade replaced them, run `./.specify/scripts/bash/sync-claude-skill-links.sh`.
- This repository is also driven by Codex and DeepSeek Harness, which read the same shared skills through `.agents/skills/` and the same guidance through `AGENTS.md`. Keep changes compatible with them.
