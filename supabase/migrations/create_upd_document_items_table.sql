/*
      # Create upd_document_items Table

      This migration re-creates the `upd_document_items` table, which was accidentally deleted.
      This table will store the line items for each UPD document, effectively creating a snapshot of the sold items at the time of the transaction.

      ## 1. New Table
        
        ### `upd_document_items`
        Stores line items for a UPD document.
        - `id` (uuid, primary key) - Unique identifier for the line item.
        - `upd_document_id` (uuid, required) - Foreign key to the `upd_documents` header.
        - `source_reception_item_id` (uuid, nullable) - Foreign key to the original `reception_items` record. Can be null if the source is deleted.
        - `item_description` (text, required) - Copied from `reception_items`.
        - `work_group` (text) - Copied from `reception_items`.
        - `quantity` (numeric, required) - Copied from `reception_items`.
        - `price` (numeric, required) - Copied from `reception_items`.
        - `user_id` (uuid, required) - Owner of the record.
        - `created_at` (timestamptz) - Record creation timestamp.

      ## 2. Security
        - Enable RLS on the new table.
        - Add policies for authenticated users to manage their own data.
        - `ON DELETE CASCADE` for `upd_document_id` ensures that if a UPD document is deleted, its items are also deleted.

      ## 3. Important Notes
        - This table duplicates data from `reception_items` to create a historical record of the sale.
        - The `source_reception_item_id` provides a link back to the origin of the item.
    */

    CREATE TABLE IF NOT EXISTS public.upd_document_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        upd_document_id UUID NOT NULL REFERENCES public.upd_documents(id) ON DELETE CASCADE,
        source_reception_item_id UUID REFERENCES public.reception_items(id) ON DELETE SET NULL,
        item_description TEXT NOT NULL,
        work_group TEXT,
        quantity NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
        created_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE public.upd_document_items ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own upd_document_items" ON public.upd_document_items;
    CREATE POLICY "Users can view own upd_document_items"
      ON public.upd_document_items FOR SELECT TO authenticated
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own upd_document_items" ON public.upd_document_items;
    CREATE POLICY "Users can insert own upd_document_items"
      ON public.upd_document_items FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own upd_document_items" ON public.upd_document_items;
    CREATE POLICY "Users can update own upd_document_items"
      ON public.upd_document_items FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own upd_document_items" ON public.upd_document_items;
    CREATE POLICY "Users can delete own upd_document_items"
      ON public.upd_document_items FOR DELETE TO authenticated
      USING (auth.uid() = user_id);

    CREATE INDEX IF NOT EXISTS idx_upd_document_items_user_id ON public.upd_document_items (user_id);
    CREATE INDEX IF NOT EXISTS idx_upd_document_items_upd_document_id ON public.upd_document_items (upd_document_id);
    CREATE INDEX IF NOT EXISTS idx_upd_document_items_source_reception_item_id ON public.upd_document_items (source_reception_item_id);