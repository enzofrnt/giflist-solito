# Verification

- `ManageListScreen.shareList` now sends only `title` + `message`; the URL is inside the message and no longer duplicated through `url`.
- `PublicListScreen` already sent a single message containing the URL.
- `grep Share.share` confirms no remaining payload with both `message` and `url`.
- Native typecheck ✅ · Expo export ✅.
