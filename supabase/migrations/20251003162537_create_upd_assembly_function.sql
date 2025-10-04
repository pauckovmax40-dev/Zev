/*
  # Create UPD Assembly Function

  1. Purpose
    - Creates a PostgreSQL function to handle UPD document creation and item linking
    - Ensures atomic transaction: creates UPD document and links selected reception items

  2. Function Details
    - Name: `create_upd_and_link_items`
    - Parameters:
      - `p_counterparty_id` (UUID): ID of the counterparty
      - `p_subdivision_id` (UUID, optional): ID of the subdivision
      - `p_document_number` (TEXT): Document number
      - `p_document_date` (TIMESTAMPTZ): Document date
      - `p_item_ids` (UUID[]): Array of reception_item IDs to link
    - Returns: UUID of the newly created UPD document

  3. Transaction Flow
    - Step 1: Insert new record into `upd_documents` table
    - Step 2: Update selected `reception_items` to link them to the new UPD
    - All operations are atomic (transaction rolls back if any step fails)

  4. Security
    - Function is SECURITY DEFINER to ensure proper permissions
    - Only accessible to authenticated users
*/

-- Drop function if exists
DROP FUNCTION IF EXISTS create_upd_and_link_items(UUID, UUID, TEXT, TIMESTAMPTZ, UUID[]);

-- Create the function
CREATE OR REPLACE FUNCTION create_upd_and_link_items(
    p_counterparty_id UUID,
    p_subdivision_id UUID,
    p_document_number TEXT,
    p_document_date TIMESTAMPTZ,
    p_item_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_upd_id UUID;
BEGIN
    -- Step 1: Create new UPD document
    INSERT INTO public.upd_documents (
        document_number,
        document_date,
        status,
        counterparty_id,
        subdivision_id
    )
    VALUES (
        p_document_number,
        p_document_date,
        'Реализовано',
        p_counterparty_id,
        p_subdivision_id
    )
    RETURNING id INTO new_upd_id;

    -- Step 2: Link selected reception items to the new UPD
    UPDATE public.reception_items
    SET upd_document_id = new_upd_id
    WHERE id = ANY(p_item_ids)
        AND upd_document_id IS NULL; -- Only update items that aren't already linked

    -- Return the ID of the newly created UPD
    RETURN new_upd_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_upd_and_link_items(UUID, UUID, TEXT, TIMESTAMPTZ, UUID[]) TO authenticated;