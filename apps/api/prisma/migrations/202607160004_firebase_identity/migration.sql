-- Link the legacy application user to the immutable Firebase Authentication UID.
-- Nullable keeps the migration compatible with accounts awaiting first sign-in.
ALTER TABLE "users" ADD COLUMN "firebase_uid" VARCHAR(128);

CREATE UNIQUE INDEX "user_firebase_uid_key" ON "users"("firebase_uid");
