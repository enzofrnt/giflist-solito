# Verification: Fixed Mobile Header Height

- Header height fixed at **60 px** (`HEADER_HEIGHT`), no vertical padding.
- Side containers and absolute brand centre span the full fixed height.
- Accessibility measurement in iOS simulator:
  - Lists: `Giftlist` StaticText `y = 80`
  - Manage (with back + share): `Giftlist` StaticText `y = 80`
- Native typecheck ✅ · Expo export ✅ · release simulator build/launch ✅.
- No API/schema change.
