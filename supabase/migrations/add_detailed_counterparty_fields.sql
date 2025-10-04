/*
  # Schema update for detailed Counterparty information

  This migration adds detailed contact and identification fields to the `counterparties` table,
  implements an automatic `updated_at` timestamp mechanism, and adds necessary unique indexes.

  1. New Function
    - `handle_updated_at`: PL/pgSQL function to automatically update the `updated_at` column on row modification.

  2. Modified Tables
    - `counterparties`:
      - Added `inn` (text, unique index, nullable)
      - Added `kpp` (text, nullable)
      - Added `address` (text, nullable)
      - Added `contact_person` (text, nullable)
      - Added `phone` (text, nullable)
      - Added `email` (text, nullable)
      - Added `description` (text, nullable)
      - Added `is_active` (boolean, default true, indexed)
      - Added `updated_at` (timestamptz, default now())

  3. Indexes and Triggers
    - Added unique index on `inn` (where not null).
    - Added index on `is_active`.
    - Added unique index on `name`.
    - Added `on_counterparties_updated` trigger to manage `updated_at`.
*/

-- 1. Create or replace handle_updated_at function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- 2. Add new columns to counterparties table safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'inn') THEN
    ALTER TABLE counterparties ADD COLUMN inn text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'kpp') THEN
    ALTER TABLE counterparties ADD COLUMN kpp text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'address') THEN
    ALTER TABLE counterparties ADD COLUMN address text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'contact_person') THEN
    ALTER TABLE counterparties ADD COLUMN contact_person text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'phone') THEN
    ALTER TABLE counterparties ADD COLUMN phone text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'email') THEN
    ALTER TABLE counterparties ADD COLUMN email text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'description') THEN
    ALTER TABLE counterparties ADD COLUMN description text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'is_active') THEN
    ALTER TABLE counterparties ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'counterparties' AND column_name = 'updated_at') THEN
    ALTER TABLE counterparties ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- 3. Add Indexes (using IF NOT EXISTS for safety)
CREATE UNIQUE INDEX IF NOT EXISTS counterparties_inn_key ON public.counterparties (inn)
WHERE (inn IS NOT NULL);

CREATE INDEX IF NOT EXISTS counterparties_is_active_idx ON public.counterparties (is_active);

CREATE UNIQUE INDEX IF NOT EXISTS counterparties_name_key ON public.counterparties (name);

-- 4. Add Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_counterparties_updated'
  ) THEN
    CREATE TRIGGER on_counterparties_updated BEFORE UPDATE ON counterparties
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
