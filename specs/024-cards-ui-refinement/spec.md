# Feature Specification: Card UI Refinement & Search Continuity

**Branch**: `024-cards-ui-refinement` · **Status**: Approved

## Problems

- List cards stretch to viewport width at desktop; 4 cards can look like 400 px blocks; photos are cropped/stretched and missing images leave a huge band.
- Cards in “Mes listes” and public profiles are not readable or consistent.
- Search results have no explicit way back to the previous search/results on web; query state is not in the URL.
- Favorites and search input need a visible separator.
- Native upload does not preview the selected image.
- QR center logo is too small and black in dark mode.

## Requirements

- **FR-001**: Standard list-card media area (`16/10`), `object-cover`, compact placeholder, equal-height grid columns `minmax(260px, 300px)` (web), one column mobile.
- **FR-002**: Public profile and own lists use the same standard card/grid.
- **FR-003**: Search query persisted in `/search?q=...`; search result links carry a safe `from`; public profile shows a back action preserving query and results. Native keeps back navigation/state.
- **FR-004**: Visible separator between favorites and search field.
- **FR-005**: Native image upload always previews the selected/uploaded image for list and gift forms.
- **FR-006**: QR center logo: larger (~0.4), theme-aware white logo in dark mode.
- **FR-007**: Add and document `giftlist-ui` skill with mandatory card/grid/media/favorite/settings rules.
- **FR-008**: No behavior/API change to lists or uploads.
