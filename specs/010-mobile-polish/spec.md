# Feature Specification: Mobile Polish (Buttons, Gifts, Password, Animation)

**Branch**: `010-mobile-polish` · **Created**: 2026-10-29 · **Status**: Approved

## User Stories

### 1. Readable registration CTA
The “Créer un compte” action on mobile home must be clearly visible, with a border/contrast, not an invisible ghost button.

### 2. Manage gifts with photos and editing
In a managed list, each gift shows its product image/thumbnail; the owner can edit an existing gift (title, URL, price, description, image) instead of only deleting it.

### 3. Password change in settings
The profile/settings area offers “Changer le mot de passe” with current/new/confirm fields and the shared strength meter. Requires current password; updates the session token.

### 4. Smooth strength animation
On mobile registration/password change, the strength bar animates its width smoothly (like web), instead of jumping between states.

## Requirements

- **FR-001**: Mobile home “Créer un compte” uses a visible secondary/outlined button.
- **FR-002**: Gift cards show image thumbnail when `gift.image` exists; fallback placeholder otherwise.
- **FR-003**: Manage screen supports edit mode for an existing gift, pre-filled, calling `PUT /api/gift-lists/:id/gifts/:giftId`.
- **FR-004**: Profile has a password-change section using `PUT /api/auth/change-password`, current/new/confirm validation, API error feedback, strength meter.
- **FR-005**: Password change persists the returned token in session storage.
- **FR-006**: Native strength fill animates width (~250 ms) on change, including empty→typed.
- **FR-007**: No API/database change; typecheck/export pass.

## Success Criteria

- CTA has visible border and contrast.
- Gift thumbnails render; editing a gift updates the list.
- Password change works and old password is required.
- Bar glides instead of jumping.
