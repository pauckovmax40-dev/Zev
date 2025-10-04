/*
  # Add RLS Policies for UPD Document Items

  This migration secures the `upd_document_items` table by enabling Row Level Security and adding policies for SELECT, INSERT, UPDATE, and DELETE operations.

  1. Security Changes
    - Enables RLS on the `upd_document_items` table if not already enabled.
    - **SELECT Policy**: Allows users to read items belonging to documents they own.
    - **INSERT Policy**: Allows users to insert items into documents they own.
    - **UPDATE Policy**: Allows users to update items belonging to documents they own.
    - **DELETE Policy**: Allows users to delete items belonging to documents they own.

  Ownership is determined by checking the `user_id` on the parent `upd_documents` table.
*/

-- 1. Enable RLS
ALTER TABLE public.upd_document_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view document items" ON public.upd_document_items;
DROP POLICY IF EXISTS "Users can insert document items" ON public.upd_document_items;
DROP POLICY IF EXISTS "Users can update document items" ON public.upd_document_items;
DROP POLICY IF EXISTS "Users can delete document items" ON public.upd_document_items;

-- 3. Create Policies
CREATE POLICY "Users can view document items"
ON public.upd_document_items
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.upd_documents WHERE id = document_id));

CREATE POLICY "Users can insert document items"
ON public.upd_document_items
FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM public.upd_documents WHERE id = document_id));

CREATE POLICY "Users can update document items"
ON public.upd_document_items
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM public.upd_documents WHERE id = document_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.upd_documents WHERE id = document_id));

CREATE POLICY "Users can delete document items"
ON public.upd_document_items
FOR DELETE
USING (auth.uid() = (SELECT user_id FROM public.upd_documents WHERE id = document_id));
