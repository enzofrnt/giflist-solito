-- AlterTable
ALTER TABLE "public"."GiftList" ADD COLUMN "secret" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GiftList_secret_idx" ON "public"."GiftList"("secret");

