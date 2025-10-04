/*
  # Add description column to motors table

  1. Changes
    - Add `description` column (text, NULL, DEFAULT '') to the `motors` table if it does not exist.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'description') THEN
    ALTER TABLE public.motors ADD COLUMN description text NULL DEFAULT '';
  END IF;
END $$;
