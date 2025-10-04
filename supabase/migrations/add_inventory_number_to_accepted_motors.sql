/*
  # Add Inventory Number to Accepted Motors

  This migration adds the `motor_inventory_number` column to the `accepted_motors` table.
  This field is crucial for identifying motors and was missing from the original schema,
  causing errors when fetching available items for UPD creation.

  ## 1. Changes
    
    ### `accepted_motors`
    - Add `motor_inventory_number` (text, not null) - The inventory number for the motor.

  ## 2. Notes
    - This fixes a critical bug preventing the creation of UPD documents.
    - Existing records will need to be updated or re-imported to have this value.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'accepted_motors'
    AND column_name = 'motor_inventory_number'
  ) THEN
    ALTER TABLE public.accepted_motors ADD COLUMN motor_inventory_number TEXT;
  END IF;
END $$;