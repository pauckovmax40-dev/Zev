/*
  # Schema update for subdivisions table

  1. Changes
    - Add `is_active` column (boolean, DEFAULT true) to `subdivisions`.
    - Ensure `name` column has a unique constraint.
    - Ensure `user_id` column exists (for RLS).
  2. Security
    - Enable RLS on `subdivisions` table.
    - Add RLS policies for CRUD operations, restricting access to the owner (`user_id`).
*/

-- 1. Add missing columns and constraints safely
DO $$
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subdivisions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.subdivisions ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Ensure name is unique (if constraint doesn't exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subdivisions_name_key' AND conrelid = 'public.subdivisions'::regclass
  ) THEN
    ALTER TABLE public.subdivisions ADD CONSTRAINT subdivisions_name_key UNIQUE (name);
  END IF;

  -- Ensure user_id exists and is linked (if somehow missing)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subdivisions' AND column_name = 'user_id'
  ) THEN
    -- Assuming user_id is required and links to auth.users
    ALTER TABLE public.subdivisions ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
  END IF;

END $$;

-- 2. Security (RLS)
ALTER TABLE public.subdivisions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subdivisions
CREATE POLICY "Users can view their own subdivisions"
  ON public.subdivisions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own subdivisions
CREATE POLICY "Users can insert their own subdivisions"
  ON public.subdivisions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subdivisions
CREATE POLICY "Users can update their own subdivisions"
  ON public.subdivisions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own subdivisions
CREATE POLICY "Users can delete their own subdivisions"
  ON public.subdivisions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
