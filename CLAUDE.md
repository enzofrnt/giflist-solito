# Claude Code — Giftlist

@AGENTS.md
@.specify/memory/constitution.md

## Claude-specific notes

- Spec Kit skills are installed in `.claude/skills/` by github/spec-kit 0.16.0. Invoke them as slash commands:
  `/speckit-specify <description>`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`, `/speckit-checklist`, `/speckit-converge`, `/speckit-taskstoissues`, `/speckit-constitution`.
- The standing rule is mandatory: **specify before implementing** for every feature/enhancement. See “NON-NEGOTIABLE” in `AGENTS.md`.
- Shared scripts are bash (`.specify/scripts/bash/*.sh`); run them from the repository root.
- Do not hand-edit `.claude/skills/**` or `.agents/skills/**`; they are managed by `specify`. Re-install/upgrade via the CLI, then re-apply local template customizations.
- This repository is also driven by Codex and DeepSeek Harness, which read the same shared artifacts through `.agents/skills/` and `AGENTS.md`. Keep changes compatible with them.
