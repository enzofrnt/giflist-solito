# Feature Specification: Instant Mobile Detail Transition

**Branch**: `013-mobile-instant-details` · **Status**: Approved

## Problem

The fixed header no longer shifts, but the `fade` transition makes the whole interface (including the header) fade, which feels cheap on static elements.

## Requirement

- Detail screens (`manage`, `giftForm`, `public`) use `animation: 'none'`.
- No page shift and no fade; the header, logo and controls stay visually static while the content switches.
- Keep one back target and the bottom bar hidden on details.
- No API/schema change.

## Success Criteria

- Opening manage displays the new content instantly, with no opacity animation and no horizontal movement.
- Back from gift form/manage remains instant.
