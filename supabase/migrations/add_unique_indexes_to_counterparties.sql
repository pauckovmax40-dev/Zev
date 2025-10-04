/*
  # Add composite unique indexes to counterparties table

  1. Changes
    - Add unique partial index on (user_id, inn) where inn is not null.
    - Add unique index on (user_id, name).

  2. Notes
    - These indexes are required for the CSV upsert functionality to correctly identify existing records based on INN or Name within the scope of the current user (multi-tenancy).
    - The upsert operation in the application will now use 'user_id,inn' or 'user_id,name' as conflict targets.
*/

-- 1. Unique index on (user_id, inn) for non-null INN values
CREATE UNIQUE INDEX IF NOT EXISTS counterparties_user_id_inn_key
ON public.counterparties (user_id, inn)
WHERE inn IS NOT NULL;

-- 2. Unique index on (user_id, name)
CREATE UNIQUE INDEX IF NOT EXISTS counterparties_user_id_name_key
ON public.counterparties (user_id, name);
