/*
  # Add unique constraint to motors table

  This migration adds a unique constraint to the `motors` table on the `user_id` and `name` columns. This is necessary to prevent duplicate motor entries for the same user and to enable the `upsert` functionality for CSV imports.

  1. Changes
    - Adds a unique constraint named `motors_user_id_name_key` to the `motors` table.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'motors_user_id_name_key' AND conrelid = 'public.motors'::regclass
  ) THEN
    ALTER TABLE public.motors
    ADD CONSTRAINT motors_user_id_name_key UNIQUE (user_id, name);
  END IF;
END;
$$;
