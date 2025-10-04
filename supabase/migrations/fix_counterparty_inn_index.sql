/*
  # Fix counterparty unique index for upsert

  1. Changes
    - Drop the existing PARTIAL unique index `counterparties_user_id_inn_key`.
    - Create a new FULL unique index `counterparties_user_id_inn_unique` on (user_id, inn).

  2. Reason
    - The Supabase client's `upsert` method does not support specifying the `WHERE` clause of a partial index in its `onConflict` parameter.
    - This caused the error "there is no unique or exclusion constraint matching the ON CONFLICT specification".
    - A standard (full) unique index in PostgreSQL treats NULL values as distinct, allowing multiple rows to have a NULL `inn` for the same `user_id`, which is the desired behavior.
    - This new index is compatible with the `onConflict: 'user_id,inn'` specification in the client code.
*/

-- Drop the old partial index if it exists
DROP INDEX IF EXISTS public.counterparties_user_id_inn_key;

-- Create a new full unique index on (user_id, inn)
-- PostgreSQL's unique constraint treats NULLs as not equal, so multiple rows
-- with NULL in the `inn` column for the same `user_id` are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS counterparties_user_id_inn_unique
ON public.counterparties (user_id, inn);
