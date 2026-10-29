# Feature Specification: Share the List Link Once

**Branch**: `014-share-link-once` · **Status**: Approved

## Problem

From a managed list, tapping Share and choosing Messages inserts the list URL twice. The share payload sends the URL both inside `message` and in the separate iOS `url` field.

## Requirements

- **FR-001**: The managed-list share payload includes the URL exactly once.
- **FR-002**: Remove the separate `url` field when `message` already contains the link.
- **FR-003**: Keep the title and the friendly message.
- **FR-004**: Public-list share remains single-link.
- **FR-005**: No API/schema change.

## Success Criteria

- Messages/WhatsApp/Mail receive one `https://giftlist.fr/list/<code>` link.
- Share sheet still opens with the list title.
