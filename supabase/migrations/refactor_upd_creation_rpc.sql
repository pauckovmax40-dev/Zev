/*
      # Refactor UPD Creation Logic

      This migration updates the UPD creation function to correctly populate the new `upd_document_items` table
      while also marking the source `reception_items` as processed. This ensures data integrity and prevents items from being sold twice.

      ## 1. Changes
        - **DROP Function**: The old function `create_upd_and_link_items` is dropped if it exists.
        - **CREATE OR REPLACE Function**: The function `create_upd_and_link_reception_items` is updated.

      ## 2. Updated Function Details
        - **Name**: `create_upd_and_link_reception_items`
        - **Parameters**:
          - `p_counterparty_id` (UUID)
          - `p_subdivision_id` (UUID, optional)
          - `p_document_number` (TEXT)
          - `p_document_date` (TIMESTAMPTZ)
          - `p_item_ids` (UUID[]): An array of `reception_items` IDs to be linked.
        - **Returns**: UUID of the newly created `upd_documents` record.

      ## 3. Transaction Flow
        - **Step 1**: Inserts a new record into the `upd_documents` table.
        - **Step 2**: Copies the selected reception items into the `upd_document_items` table, linking them to the new UPD document.
        - **Step 3**: Updates the `upd_document_id` for the source `reception_items` to mark them as processed.
        - The entire operation is a single transaction.
    */

    -- Drop the very old, incorrect function if it exists
    DROP FUNCTION IF EXISTS create_upd_and_link_items(UUID, UUID, TEXT, TIMESTAMPTZ, UUID[]);

    -- Create or replace the new, correct function
    CREATE OR REPLACE FUNCTION create_upd_and_link_reception_items(
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
        current_user_id UUID := auth.uid();
    BEGIN
        -- Step 1: Create the new UPD document header
        INSERT INTO public.upd_documents (
            document_number,
            document_date,
            status,
            counterparty_id,
            subdivision_id,
            user_id
        )
        VALUES (
            p_document_number,
            p_document_date,
            'Реализовано',
            p_counterparty_id,
            p_subdivision_id,
            current_user_id
        )
        RETURNING id INTO new_upd_id;

        -- Step 2: Copy the selected reception items into the new upd_document_items table
        INSERT INTO public.upd_document_items (
            upd_document_id,
            source_reception_item_id,
            item_description,
            work_group,
            quantity,
            price,
            user_id
        )
        SELECT
            new_upd_id,
            ri.id,
            ri.item_description,
            ri.work_group,
            ri.quantity,
            ri.price,
            current_user_id
        FROM public.reception_items ri
        WHERE ri.id = ANY(p_item_ids)
          AND ri.user_id = current_user_id; -- Security check

        -- Step 3: Link the source reception items to the new UPD document to mark them as processed
        UPDATE public.reception_items
        SET upd_document_id = new_upd_id
        WHERE id = ANY(p_item_ids)
          AND user_id = current_user_id; -- Ensure user can only update their own items

        -- Return the ID of the newly created UPD document
        RETURN new_upd_id;
    END;
    $$;

    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION create_upd_and_link_reception_items(UUID, UUID, TEXT, TIMESTAMPTZ, UUID[]) TO authenticated;