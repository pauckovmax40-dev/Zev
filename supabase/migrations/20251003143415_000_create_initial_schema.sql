/*
  # Create Initial Schema for MotorFlow Application

  This migration creates the foundational tables for the motor repair management system:
  - counterparties: Customer/vendor information
  - subdivisions: Organizational departments
  - motors: Motor equipment dictionary
  - repair_orders: Acceptance mode records with QR codes
  - upd_documents: UPD assembly mode headers
  - upd_document_items: Hierarchical financial items

  ## 1. New Tables
    
    ### `counterparties`
    Stores customer and vendor information
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text, required) - Company name
    - `code` (text) - Customer code
    - `contact_info` (text) - Contact details
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `subdivisions`
    Stores organizational departments
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text, required) - Department name
    - `code` (text) - Department code
    - `description` (text) - Description
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `motors`
    Motor equipment dictionary
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text, required) - Motor name/model
    - `power_kw` (numeric) - Power in kilowatts
    - `rpm` (integer) - Revolutions per minute
    - `voltage` (integer) - Operating voltage
    - `brand` (text) - Manufacturer brand
    - `price` (numeric) - Base price
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `repair_orders`
    Acceptance mode records
    - `id` (uuid, primary key) - Unique identifier
    - `qr_code_data` (text, unique) - QR code identifier
    - `description` (text) - Order description
    - `counterparty_id` (uuid, required) - Reference to counterparties
    - `subdivision_id` (uuid, required) - Reference to subdivisions
    - `motor_id` (uuid, required) - Reference to motors
    - `status` (text) - Order status
    - `allocated_document_id` (uuid) - Reference to upd_documents
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `upd_documents`
    UPD assembly mode headers
    - `id` (uuid, primary key) - Unique identifier
    - `document_number` (text, required) - Document number
    - `counterparty_id` (uuid, required) - Reference to counterparties
    - `document_date` (timestamptz) - Document date
    - `total_income` (numeric) - Total income amount
    - `total_expense` (numeric) - Total expense amount
    - `status` (text) - Document status
    - `user_id` (uuid, required) - Owner of the record
    - `created_at` (timestamptz) - Record creation timestamp

    ### `upd_document_items`
    Hierarchical financial items
    - `id` (uuid, primary key) - Unique identifier
    - `document_id` (uuid, required) - Reference to upd_documents
    - `parent_id` (uuid) - Reference to parent item for hierarchy
    - `level` (integer, required) - Hierarchy level
    - `order_index` (integer) - Sort order
    - `item_type` (text, required) - Type of item
    - `description` (text, required) - Item description
    - `quantity` (numeric) - Quantity
    - `price` (numeric) - Price per unit
    - `is_income` (boolean) - Income or expense flag
    - `motor_id` (uuid) - Reference to motors
    - `original_order_id` (uuid) - Reference to repair_orders
    - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Special RLS for upd_document_items using helper function

  ## 3. Important Notes
    - All tables use user_id for data isolation
    - Cascading deletes maintain referential integrity
    - upd_document_items uses special function for ownership checks
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
DROP POLICY IF EXISTS "Users can manage their own counterparties" ON counterparties;
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
DROP POLICY IF EXISTS "Users can manage their own subdivisions" ON subdivisions;
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
DROP POLICY IF EXISTS "Users can manage their own motors" ON motors;
CREATE POLICY "Users can manage their own motors"
  ON motors
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_motors_user_id ON motors (user_id);

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
  status text NOT NULL DEFAULT 'Draft'
);
ALTER TABLE upd_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own upd documents" ON upd_documents;
CREATE POLICY "Users can manage their own upd documents"
  ON upd_documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_upd_documents_user_id ON upd_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_upd_documents_status ON upd_documents (status);

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
  status text NOT NULL DEFAULT 'Accepted',
  allocated_document_id uuid REFERENCES upd_documents(id) ON DELETE SET NULL
);
ALTER TABLE repair_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own repair orders" ON repair_orders;
CREATE POLICY "Users can manage their own repair orders"
  ON repair_orders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_user_id ON repair_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders (status);

-- 6. upd_document_items (Hierarchical Items)
CREATE TABLE IF NOT EXISTS upd_document_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  document_id uuid REFERENCES upd_documents(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES upd_document_items(id) ON DELETE CASCADE NULL,
  level integer NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  item_type text NOT NULL,
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  price numeric DEFAULT 0,
  is_income boolean DEFAULT true,
  motor_id uuid REFERENCES motors(id) ON DELETE SET NULL NULL,
  original_order_id uuid REFERENCES repair_orders(id) ON DELETE SET NULL NULL
);

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

DROP POLICY IF EXISTS "Users can read document items if they own the document" ON upd_document_items;
CREATE POLICY "Users can read document items if they own the document"
  ON upd_document_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = check_document_owner(id));

DROP POLICY IF EXISTS "Users can modify document items if they own the document" ON upd_document_items;
CREATE POLICY "Users can modify document items if they own the document"
  ON upd_document_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = check_document_owner(id))
  WITH CHECK (auth.uid() = check_document_owner(id));

CREATE INDEX IF NOT EXISTS idx_upd_document_items_document_id ON upd_document_items (document_id);
CREATE INDEX IF NOT EXISTS idx_upd_document_items_parent_id ON upd_document_items (parent_id);
CREATE INDEX IF NOT EXISTS idx_upd_document_items_order_index ON upd_document_items (document_id, order_index);
