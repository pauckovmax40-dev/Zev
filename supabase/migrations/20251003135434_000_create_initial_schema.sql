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
