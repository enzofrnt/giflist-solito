-- Add username/public flags without breaking existing accounts.
ALTER TABLE "public"."User" ADD COLUMN "username" TEXT;
ALTER TABLE "public"."User" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- Backfill deterministic unique handles from the display name or email local part.
UPDATE "public"."User"
SET "username" = left(
  COALESCE(
    NULLIF(regexp_replace(lower(COALESCE(NULLIF("name", ''), split_part("email", '@', 1))), '[^a-z0-9_]+', '_', 'g'), ''),
    'user'
  ),
  20
) || '-' || "id"
WHERE "username" IS NULL;

ALTER TABLE "public"."User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
