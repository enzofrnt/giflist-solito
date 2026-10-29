CREATE TABLE "public"."FavoriteList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "giftListId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteList_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FavoriteList_userId_giftListId_key" ON "public"."FavoriteList"("userId", "giftListId");
CREATE INDEX "FavoriteList_userId_idx" ON "public"."FavoriteList"("userId");
CREATE INDEX "FavoriteList_giftListId_idx" ON "public"."FavoriteList"("giftListId");

ALTER TABLE "public"."FavoriteList" ADD CONSTRAINT "FavoriteList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."FavoriteList" ADD CONSTRAINT "FavoriteList_giftListId_fkey" FOREIGN KEY ("giftListId") REFERENCES "public"."GiftList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
