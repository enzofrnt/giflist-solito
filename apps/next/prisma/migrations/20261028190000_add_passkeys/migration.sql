CREATE TABLE "Passkey" (
  "id" TEXT PRIMARY KEY, "userId" INTEGER NOT NULL, "rpId" TEXT NOT NULL,
  "publicKey" BYTEA NOT NULL, "counter" BIGINT NOT NULL DEFAULT 0,
  "transports" TEXT[] NOT NULL, "deviceType" TEXT NOT NULL, "backedUp" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Passkey_userId_idx" ON "Passkey"("userId");
CREATE TABLE "PasskeyChallenge" (
  "id" TEXT PRIMARY KEY, "challenge" TEXT NOT NULL, "purpose" TEXT NOT NULL,
  "origin" TEXT NOT NULL, "rpId" TEXT NOT NULL, "userId" INTEGER, "authVersion" INTEGER, "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PasskeyChallenge_expiresAt_idx" ON "PasskeyChallenge"("expiresAt");
ALTER TABLE "Passkey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasskeyChallenge" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "Passkey", "PasskeyChallenge" FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
  REVOKE ALL ON TABLE "Passkey", "PasskeyChallenge" FROM anon;
 END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
  REVOKE ALL ON TABLE "Passkey", "PasskeyChallenge" FROM authenticated;
 END IF;
END $$;
