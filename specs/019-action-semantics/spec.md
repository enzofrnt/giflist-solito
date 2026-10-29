# Feature Specification: Semantic Action Colors & Icons

**Branch**: `019-action-semantics` · **Status**: Approved

## Problem

Icons improved recognition, but destructive actions such as “Supprimer” still use the same neutral treatment as “Modifier”. Colour must carry meaning: a delete action must be red; a primary action cobalt; supporting/share neutral.

## Requirements

- **FR-001**: Document a clear action semantics matrix in the Design Charter and showcase: primary / secondary / ghost / danger / accent, plus when to use icon-only.
- **FR-002**: Rule: colour follows intent. **Danger red is reserved for destructive actions**; never style delete as secondary/ghost with neutral colour.
- **FR-003**: Irreversible destructive actions keep a confirmation; the final action is red and explicitly labelled.
- **FR-004**: Share, edit, create, save/cancel and password visibility keep their semantic icons and neutral/secondary styling.
- **FR-005**: Native gift delete uses the red `danger` button with `Trash2`; web gift delete remains red; passkey delete shows red + Trash2.
- **FR-006**: Showcase documents icon meanings, action colours and a live example pair (Modifier secondary / Supprimer danger).
- **FR-007**: No API/schema changes.

## Success Criteria

- A user can predict action consequence from colour and icon.
- No destructive action appears in cobalt/neutral as its primary signal.
- The showcase and charter agree.
