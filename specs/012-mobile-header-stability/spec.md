# Feature Specification: Stable Mobile Header

**Branch**: `012-mobile-header-stability` · **Status**: Approved

## Problem

Opening “Gérer une liste” makes the header shift: it is inside the scroll content and the native stack slides the whole page. The brand should stay visually fixed; only the back/share controls appear.

## Requirements

- **FR-001**: `Screen` accepts an optional fixed `header` rendered outside the ScrollView.
- **FR-002**: All native screens use the fixed header slot.
- **FR-003**: Header keeps identical height, centered logo and horizontal position on main, manage and gift form.
- **FR-004**: Manage/gift form/public transitions use a fade (no horizontal page shift).
- **FR-005**: Back appears left when needed; share appears right on manage/public; no redundant titles.
- **FR-006**: No API/schema change.

## Success Criteria

- Scrolling manage/form does not move the header.
- Opening manage does not slide the brand horizontally.
- Back/share appear without moving the centered logo.
