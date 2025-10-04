/*
  # Add Subdivision to UPD Documents

  1. Purpose
    - Adds a `subdivision_id` column to the `upd_documents` table.
    - This allows linking a UPD document directly to a subdivision, which is required by the `create_upd_and_link_items` function.

  2. Changes
    - **Table `upd_documents`:**
      - Adds a new nullable column `subdivision_id` of type `UUID`.
      - Adds a foreign key constraint from `subdivision_id` to `subdivisions(id)`.

  3. Security
    - RLS policies for `upd_documents` will implicitly handle this new column as they operate on the row level.
*/

DO $$
BEGIN
  -- Add the column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'upd_documents' AND column_name = 'subdivision_id'
  ) THEN
    ALTER TABLE public.upd_documents
    ADD COLUMN subdivision_id UUID;
  END IF;

  -- Add the foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'upd_documents_subdivision_id_fkey' AND conrelid = 'public.upd_documents'::regclass
  ) THEN
    ALTER TABLE public.upd_documents
    ADD CONSTRAINT upd_documents_subdivision_id_fkey
    FOREIGN KEY (subdivision_id)
    REFERENCES public.subdivisions(id)
    ON DELETE SET NULL;
  END IF;
END $$;