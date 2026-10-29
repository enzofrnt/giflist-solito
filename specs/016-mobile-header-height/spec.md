# Feature Specification: Fixed Mobile Header Height

**Branch**: `016-mobile-header-height` · **Status**: Approved

## Problem

Pages with header actions (back/share) show a small vertical shift of the centred Giftlist logo compared with pages without actions. The header uses `minHeight` and its intrinsic height grows when a 44 px control is added.

## Requirements

- **FR-001**: `AppHeader` uses a fixed height (60 px).
- **FR-002**: The brand centre is absolutely positioned across the full fixed height.
- **FR-003**: Back/share controls are vertically centred and never change header height.
- **FR-004**: Same logo Y on home, lists, manage, gift form, auth and public pages.
- **FR-005**: No API/data change.

## Success Criteria

- Header logo has identical Y across pages with and without actions.
- No layout jump when entering a detail screen.
