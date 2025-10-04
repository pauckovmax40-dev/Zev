/*
  # Add Transaction Type to Reception Items

  This migration adds a transaction_type column to the reception_items table
  to track whether each item is an income or expense transaction.

  ## 1. Changes
    
    ### `reception_items`
    - Add `transaction_type` (text) - Type of transaction (e.g., "Расход", "Приход")

  ## 2. Notes
    - Existing rows will have NULL transaction_type initially
    - New rows should specify transaction_type when inserting
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'reception_items'
    AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE public.reception_items ADD COLUMN transaction_type TEXT;
  END IF;
END $$;
