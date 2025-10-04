/*
  # Create Reception Tables for Motor Acceptance Process

  This migration creates three new tables to handle the motor acceptance workflow:
  - receptions: Header table for acceptance documents
  - accepted_motors: Individual motors within each reception
  - reception_items: Detailed work items for each motor

  ## 1. New Tables
    
    ### `receptions`
    Stores acceptance document headers
    - `id` (uuid, primary key) - Unique identifier
    - `reception_date` (timestamptz, required) - Date of acceptance
    - `reception_number` (text) - Document number
    - `counterparty_id` (uuid, required) - Reference to counterparties table
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `accepted_motors`
    Stores individual motors in each reception (QR code generated from this ID)
    - `id` (uuid, primary key) - Unique identifier used for QR code generation
    - `reception_id` (uuid, required) - Reference to receptions table
    - `subdivision_id` (uuid) - Reference to subdivisions table
    - `position_in_reception` (int, required) - Position number in the reception
    - `motor_service_description` (text, required) - Service description for this motor
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `reception_items`
    Stores detailed work items for each motor
    - `id` (uuid, primary key) - Unique identifier
    - `accepted_motor_id` (uuid, required) - Reference to accepted_motors table
    - `item_description` (text, required) - Work item description
    - `work_group` (text) - Work group classification
    - `quantity` (numeric, default 1) - Quantity of work
    - `price` (numeric, default 0) - Price per unit
    - `upd_document_id` (uuid, nullable) - Reference to upd_documents (populated later)
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
    - Cascading deletes to maintain referential integrity

  ## 3. Important Notes
    - The `accepted_motors.id` field is used for QR code generation
    - `reception_items.upd_document_id` remains NULL during import
    - All tables use user_id for data isolation
*/

CREATE TABLE IF NOT EXISTS public.receptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reception_date TIMESTAMPTZ NOT NULL,
    reception_number TEXT,
    counterparty_id UUID NOT NULL REFERENCES public.counterparties(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own receptions" ON public.receptions;
CREATE POLICY "Users can view own receptions"
  ON public.receptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own receptions" ON public.receptions;
CREATE POLICY "Users can insert own receptions"
  ON public.receptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own receptions" ON public.receptions;
CREATE POLICY "Users can update own receptions"
  ON public.receptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own receptions" ON public.receptions;
CREATE POLICY "Users can delete own receptions"
  ON public.receptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_receptions_user_id ON public.receptions (user_id);
CREATE INDEX IF NOT EXISTS idx_receptions_counterparty_id ON public.receptions (counterparty_id);

CREATE TABLE IF NOT EXISTS public.accepted_motors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reception_id UUID NOT NULL REFERENCES public.receptions(id) ON DELETE CASCADE,
    subdivision_id UUID REFERENCES public.subdivisions(id) ON DELETE SET NULL,
    position_in_reception INT NOT NULL,
    motor_service_description TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accepted_motors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accepted motors" ON public.accepted_motors;
CREATE POLICY "Users can view own accepted motors"
  ON public.accepted_motors FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own accepted motors" ON public.accepted_motors;
CREATE POLICY "Users can insert own accepted motors"
  ON public.accepted_motors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accepted motors" ON public.accepted_motors;
CREATE POLICY "Users can update own accepted motors"
  ON public.accepted_motors FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own accepted motors" ON public.accepted_motors;
CREATE POLICY "Users can delete own accepted motors"
  ON public.accepted_motors FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_accepted_motors_user_id ON public.accepted_motors (user_id);
CREATE INDEX IF NOT EXISTS idx_accepted_motors_reception_id ON public.accepted_motors (reception_id);
CREATE INDEX IF NOT EXISTS idx_accepted_motors_subdivision_id ON public.accepted_motors (subdivision_id);

CREATE TABLE IF NOT EXISTS public.reception_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accepted_motor_id UUID NOT NULL REFERENCES public.accepted_motors(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    work_group TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    upd_document_id UUID REFERENCES public.upd_documents(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reception_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reception items" ON public.reception_items;
CREATE POLICY "Users can view own reception items"
  ON public.reception_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reception items" ON public.reception_items;
CREATE POLICY "Users can insert own reception items"
  ON public.reception_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reception items" ON public.reception_items;
CREATE POLICY "Users can update own reception items"
  ON public.reception_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reception items" ON public.reception_items;
CREATE POLICY "Users can delete own reception items"
  ON public.reception_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reception_items_user_id ON public.reception_items (user_id);
CREATE INDEX IF NOT EXISTS idx_reception_items_accepted_motor_id ON public.reception_items (accepted_motor_id);
CREATE INDEX IF NOT EXISTS idx_reception_items_upd_document_id ON public.reception_items (upd_document_id);
