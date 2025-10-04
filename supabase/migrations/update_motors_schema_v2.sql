/*
  # Schema update for motors table

  This migration updates the `motors` table to align with the required schema, including new fields for electrical characteristics, updated constraints, and an `updated_at` timestamp with a trigger.

  1. Changes
    - Rename `brand` to `manufacturer`.
    - Rename `price` to `price_per_unit`.
    - Add new columns: `current`, `efficiency`, `is_active`, `updated_at`, `text`.
    - Update constraints: Set `power_kw`, `rpm`, `price_per_unit` to NOT NULL with defaults.
    - Update data types and precision for numeric fields.
    - Create `update_updated_at_column` function (if missing).
    - Add `update_motors_updated_at` trigger.
    - Add unique index `motors_power_rpm_voltage_key` where `is_active = true`.
  2. Security
    - RLS policies remain active and are preserved.
*/

-- 1. Rename existing columns safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'brand') THEN
    ALTER TABLE public.motors RENAME COLUMN brand TO manufacturer;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'price') THEN
    ALTER TABLE public.motors RENAME COLUMN price TO price_per_unit;
  END IF;
END $$;

-- 2. Add new columns safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'current') THEN
    ALTER TABLE public.motors ADD COLUMN current numeric(8, 2) NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'efficiency') THEN
    ALTER TABLE public.motors ADD COLUMN efficiency numeric(5, 2) NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'is_active') THEN
    ALTER TABLE public.motors ADD COLUMN is_active boolean NULL DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'text') THEN
    ALTER TABLE public.motors ADD COLUMN text text NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'updated_at') THEN
    ALTER TABLE public.motors ADD COLUMN updated_at timestamptz NULL DEFAULT now();
  END IF;
END $$;

-- 3. Update existing column constraints and types
ALTER TABLE public.motors ALTER COLUMN name SET NOT NULL;

-- power_kw: numeric(8, 2) NOT NULL DEFAULT 0
ALTER TABLE public.motors ALTER COLUMN power_kw TYPE numeric(8, 2) USING power_kw::numeric(8, 2);
ALTER TABLE public.motors ALTER COLUMN power_kw SET NOT NULL;
ALTER TABLE public.motors ALTER COLUMN power_kw SET DEFAULT 0;

-- rpm: integer NOT NULL DEFAULT 0
ALTER TABLE public.motors ALTER COLUMN rpm SET NOT NULL;
ALTER TABLE public.motors ALTER COLUMN rpm SET DEFAULT 0;

-- voltage: integer NULL DEFAULT 380
ALTER TABLE public.motors ALTER COLUMN voltage DROP NOT NULL;
ALTER TABLE public.motors ALTER COLUMN voltage SET DEFAULT 380;

-- price_per_unit: numeric(12, 2) NOT NULL DEFAULT 0
ALTER TABLE public.motors ALTER COLUMN price_per_unit TYPE numeric(12, 2) USING price_per_unit::numeric(12, 2);
ALTER TABLE public.motors ALTER COLUMN price_per_unit SET NOT NULL;
ALTER TABLE public.motors ALTER COLUMN price_per_unit SET DEFAULT 0;

-- manufacturer: text NULL DEFAULT ''
ALTER TABLE public.motors ALTER COLUMN manufacturer SET DEFAULT '';

-- description: text NULL DEFAULT ''
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'motors' AND column_name = 'description') THEN
    ALTER TABLE public.motors ALTER COLUMN description SET DEFAULT '';
  END IF;
END $$;


-- 4. Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Create the trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_motors_updated_at'
  ) THEN
    CREATE TRIGGER update_motors_updated_at
    BEFORE UPDATE ON public.motors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 6. Create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS motors_power_rpm_voltage_key
ON public.motors (power_kw, rpm, voltage)
WHERE is_active = true;

-- 7. Ensure RLS policies are still valid (they rely on user_id which was preserved)
-- No changes needed to RLS policies as user_id column was not modified.
