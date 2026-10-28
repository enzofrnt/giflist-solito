-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "authVersion" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_userId_key" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthRateLimit_expiresAt_idx" ON "AuthRateLimit"("expiresAt");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Password hashes, recovery secrets and counters belong to the backend only.
-- Otherwise the public Data API could bypass the recovery flow entirely.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuthRateLimit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "User", "PasswordResetToken", "AuthRateLimit" FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "User", "PasswordResetToken", "AuthRateLimit" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "User", "PasswordResetToken", "AuthRateLimit" FROM authenticated;
  END IF;
END $$;
