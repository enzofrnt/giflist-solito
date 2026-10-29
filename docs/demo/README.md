# Demo database seed

Fill a local database with a realistic demo dataset:

```sh
bun run db:seed:demo
```

The script is idempotent for the demo/test accounts. It deletes and recreates **only** the lists owned by these dedicated accounts; it never touches other users.

## Accounts

| Purpose | Email | Password | Username |
|---|---|---|---|
| Simple local test | `test@giftlist.fr` | `Giftlist123!` | `test_local` |
| Realistic demo | `demo@giftlist.fr` | `DemoGiftlist2026!` | `camille_demo` |
| Second public profile | `lucas.demo@giftlist.fr` | `DemoGiftlist2026!` | `lucas_demo` |

## What is seeded

- `test_local`: 3 lists with/without images, public/private, gifts and one reservation.
- `camille_demo`: 4 realistic lists (birthday, Christmas, Lisbon, housewarming), 11 gifts, public/private, secret mode, reservations.
- `lucas_demo`: 2 public lists for search/profile discovery.
- Two favorites between the demo accounts.

Demo images live in `apps/next/public/demo/` and are committed with the seed.

## Production

Do not run this against production automatically. If you intentionally want a production demo, run it with an explicit `DATABASE_URL` after reviewing the target.
