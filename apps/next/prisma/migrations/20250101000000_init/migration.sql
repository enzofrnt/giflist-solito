-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GiftList" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "shareCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "GiftList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Gift" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "image" TEXT,
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "reservedBy" TEXT,
    "reservedByName" TEXT,
    "reservedByEmail" TEXT,
    "reservedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "giftListId" INTEGER NOT NULL,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GiftList_shareCode_key" ON "public"."GiftList"("shareCode");

-- CreateIndex
CREATE INDEX "GiftList_userId_idx" ON "public"."GiftList"("userId");

-- CreateIndex
CREATE INDEX "GiftList_shareCode_idx" ON "public"."GiftList"("shareCode");

-- CreateIndex
CREATE INDEX "GiftList_createdAt_idx" ON "public"."GiftList"("createdAt");

-- CreateIndex
CREATE INDEX "Gift_status_idx" ON "public"."Gift"("status");

-- CreateIndex
CREATE INDEX "Gift_createdAt_idx" ON "public"."Gift"("createdAt");

-- CreateIndex
CREATE INDEX "Gift_giftListId_idx" ON "public"."Gift"("giftListId");

-- AddForeignKey
ALTER TABLE "public"."GiftList" ADD CONSTRAINT "GiftList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gift" ADD CONSTRAINT "Gift_giftListId_fkey" FOREIGN KEY ("giftListId") REFERENCES "public"."GiftList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

