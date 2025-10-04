/*
  # Make repair_orders columns nullable

  This migration makes the `motor_id` and `subdivision_id` columns in the `repair_orders` table nullable. This allows for the creation of a repair order before a specific motor or subdivision has been assigned, which is useful for multi-step order creation forms.

  1. Changes
    - `repair_orders`
      - `motor_id`: Changed from `NOT NULL` to `NULL`.
      - `subdivision_id`: Changed from `NOT NULL` to `NULL`.
*/

ALTER TABLE public.repair_orders
ALTER COLUMN motor_id DROP NOT NULL;

ALTER TABLE public.repair_orders
ALTER COLUMN subdivision_id DROP NOT NULL;
