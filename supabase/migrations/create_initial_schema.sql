/*
  # Initial Schema for Electric Motor Repair Management System

  This migration sets up all necessary tables for managing repair orders, documents, and reference data.
  All tables include Row Level Security (RLS) policies to ensure data isolation based on the authenticated user (auth.uid()).

  1. New Tables
    - `counterparties`: Stores client/partner information.
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `code` (text, optional code/identifier)
      - `contact_info` (text)
    - `subdivisions`: Stores internal subdivisions/locations.
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `code` (text, optional code/identifier)
      - `description` (text)
    - `motors`: Stores motor specifications (dictionary).
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `power_kw` (numeric, default 0)
      - `rpm` (integer, default 0)
      - `voltage` (integer, default 0)
      - `brand` (text)
      - `price` (numeric, default 0)
    - `repair_orders`: Stores intake records (Acceptance Mode).
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `qr_code_data` (text, unique identifier for tracking)
      - `description` (text)
      - `counterparty_id` (uuid, foreign key to counterparties)
      - `subdivision_id` (uuid, foreign key to subdivisions)
      - `motor_id` (uuid, foreign key to motors)
      - `status` (text, default 'Accepted')
      - `allocated_document_id` (uuid, foreign key to upd_documents, nullable)
    - `upd_documents`: Stores the main document header (UPD Assembly Mode).
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `document_number` (text)
      - `counterparty_id` (uuid, foreign key to counterparties)
      - `document_date` (timestamptz)
      - `total_income` (numeric, default 0)
      - `total_expense` (numeric, default 0)
      - `status` (text, default 'Draft')
    - `upd_document_items`: Stores the hierarchical items within a document.
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to upd_documents)
      - `parent_id` (uuid, self-referencing, nullable)
      - `level` (integer, 1, 2, or 3)
      - `order_index` (integer, for sorting)
      - `item_type` (text, 'Position', 'Subgroup', 'Line')
      - `description` (text)
      - `quantity` (numeric, default 1)
      - `price` (numeric, default 0)
      - `is_income` (boolean, default true)
      - `motor_id` (uuid, foreign key to motors, nullable)
      - `original_order_id` (uuid, foreign key to repair_orders, nullable)

  2. Security
    - Enable RLS on all new tables.
    - Add policies for authenticated users to perform CRUD operations only on data where `user_id` matches `auth.uid()`.
*/

-- 1. counterparties
CREATE TABLE IF NOT EXISTS counterparties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  code text DEFAULT '',
  contact_info text DEFAULT ''
);
ALTER TABLE counterparties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own counterparties"
  ON counterparties
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_counterparties_user_id ON counterparties (user_id);

-- 2. subdivisions
CREATE TABLE IF NOT EXISTS subdivisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  code text DEFAULT '',
  description text DEFAULT ''
);
ALTER TABLE subdivisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own subdivisions"
  ON subdivisions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_subdivisions_user_id ON subdivisions (user_id);

-- 3. motors (Dictionary)
CREATE TABLE IF NOT EXISTS motors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  power_kw numeric DEFAULT 0,
  rpm integer DEFAULT 0,
  voltage integer DEFAULT 0,
  brand text DEFAULT '',
  price numeric DEFAULT 0
);
ALTER TABLE motors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own motors"
  ON motors
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_motors_user_id ON motors (user_id);

-- 4. repair_orders (Acceptance Mode)
CREATE TABLE IF NOT EXISTS repair_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  qr_code_data text UNIQUE NOT NULL,
  description text DEFAULT '',
  counterparty_id uuid REFERENCES counterparties(id) ON DELETE RESTRICT NOT NULL,
  subdivision_id uuid REFERENCES subdivisions(id) ON DELETE RESTRICT NOT NULL,
  motor_id uuid REFERENCES motors(id) ON DELETE RESTRICT NOT NULL,
  status text NOT NULL DEFAULT 'Accepted', -- Accepted, In Repair, Shipped
  allocated_document_id uuid NULL, -- References upd_documents(id)
  CONSTRAINT fk_allocated_document FOREIGN KEY (allocated_document_id) REFERENCES upd_documents(id) ON DELETE SET NULL
);
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own repair orders"
  ON repair_orders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_user_id ON repair_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders (status);

-- 5. upd_documents (UPD Assembly Mode Header)
CREATE TABLE IF NOT EXISTS upd_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  document_number text NOT NULL DEFAULT '',
  counterparty_id uuid REFERENCES counterparties(id) ON DELETE RESTRICT NOT NULL,
  document_date timestamptz DEFAULT now(),
  total_income numeric DEFAULT 0,
  total_expense numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'Draft' -- Draft, Completed, Archived
);
ALTER TABLE upd_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own upd documents"
  ON upd_documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_upd_documents_user_id ON upd_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_upd_documents_status ON upd_documents (status);

-- 6. upd_document_items (Hierarchical Items)
CREATE TABLE IF NOT EXISTS upd_document_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  document_id uuid REFERENCES upd_documents(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES upd_document_items(id) ON DELETE CASCADE NULL,
  level integer NOT NULL, -- 1: Position, 2: Subgroup, 3: Line
  order_index integer NOT NULL DEFAULT 0,
  item_type text NOT NULL, -- Position, Subgroup, Line
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  price numeric DEFAULT 0,
  is_income boolean DEFAULT true,
  motor_id uuid REFERENCES motors(id) ON DELETE SET NULL NULL,
  original_order_id uuid REFERENCES repair_orders(id) ON DELETE SET NULL NULL
);

-- RLS for document items must check the parent document's user_id
CREATE OR REPLACE FUNCTION check_document_owner(item_id uuid)
RETURNS uuid AS $$
DECLARE
  doc_user_id uuid;
BEGIN
  SELECT user_id INTO doc_user_id
  FROM upd_documents
  WHERE id = (SELECT document_id FROM upd_document_items WHERE id = item_id);

  RETURN doc_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE upd_document_items ENABLE ROW LEVEL SECURITY;

-- Select policy: User can read if they own the parent document
CREATE POLICY "Users can read document items if they own the document"
  ON upd_document_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = check_document_owner(id));

-- Insert/Update/Delete policy: User can modify if they own the parent document
CREATE POLICY "Users can modify document items if they own the document"
  ON upd_document_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = check_document_owner(id))
  WITH CHECK (auth.uid() = check_document_owner(id));

CREATE INDEX IF NOT EXISTS idx_upd_document_items_document_id ON upd_document_items (document_id);
CREATE INDEX IF NOT EXISTS idx_upd_document_items_parent_id ON upd_document_items (parent_id);
CREATE INDEX IF NOT EXISTS idx_upd_document_items_order_index ON upd_document_items (document_id, order_index);
