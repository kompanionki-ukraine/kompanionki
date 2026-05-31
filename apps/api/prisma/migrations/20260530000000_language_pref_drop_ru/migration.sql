-- Remove 'ru' from LanguagePref enum.
-- PostgreSQL does not support ALTER TYPE ... DROP VALUE, so we:
--   1. Migrate any 'ru' rows to 'uk' (safety net — should be zero rows)
--   2. Create a replacement enum without 'ru'
--   3. Swap the column to the new type
--   4. Drop the old enum and rename the replacement

-- Step 1: re-point any ru rows to uk (no-op if none exist)
UPDATE "users" SET "language_pref" = 'uk'::"LanguagePref" WHERE "language_pref" = 'ru'::"LanguagePref";

-- Step 2: drop the column default (it is bound to the old type's OID)
ALTER TABLE "users" ALTER COLUMN "language_pref" DROP DEFAULT;

-- Step 3: create replacement enum
CREATE TYPE "LanguagePref_new" AS ENUM ('uk', 'en');

-- Step 4: swap column type (USING casts the stored text through the new enum)
ALTER TABLE "users"
  ALTER COLUMN "language_pref" TYPE "LanguagePref_new"
  USING "language_pref"::text::"LanguagePref_new";

-- Step 5: restore default bound to the new type
ALTER TABLE "users" ALTER COLUMN "language_pref" SET DEFAULT 'uk'::"LanguagePref_new";

-- Step 6: drop old enum, rename replacement
DROP TYPE "LanguagePref";
ALTER TYPE "LanguagePref_new" RENAME TO "LanguagePref";

-- After this migration the DB enum matches the schema: ('uk', 'en')
