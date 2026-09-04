/*
# Add bio column to user_profiles table

1. Modified Tables
- `user_profiles`: adds `bio` (text, nullable) column to store user biography text.
2. Security
- No RLS policy changes needed — existing user_profiles policies already cover the new column.
3. Notes
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ to safely re-run.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;
END $$;
