-- Migration: Implement FEFO (First-Expired-First-Out) Dispensing RPC
-- Automatically selects and updates inventory batches based on expiry dates.

CREATE OR REPLACE FUNCTION rpc_dispense_fefo(
    p_pharmacy_id INT,
    p_medicine_id TEXT,
    p_request_quantity INT,
    p_sold_by TEXT,
    p_sale_id INT DEFAULT NULL
) 
RETURNS TABLE (
    batch_id TEXT,
    quantity_dispensed INT
) AS $$
DECLARE
    v_remaining_qty INT := p_request_quantity;
    v_batch RECORD;
    v_dispensed_in_step INT;
BEGIN
    -- Validate initial quantity
    IF p_request_quantity <= 0 THEN
        RETURN;
    END IF;

    -- Iterate through batches sorted by expiry_date (FEFO)
    -- We skip recalled batches and those with 0 quantity
    FOR v_batch IN 
        SELECT id, quantity, expiry_date, medicine_id, organization_id
        FROM inventory_batches
        WHERE organization_id = p_pharmacy_id 
          AND medicine_id = p_medicine_id
          AND quantity > 0
          AND (is_recalled IS FALSE OR is_recalled IS NULL)
          AND expiry_date > CURRENT_DATE -- Optional: Only non-expired
        ORDER BY expiry_date ASC
    LOOP
        EXIT WHEN v_remaining_qty <= 0;

        v_dispensed_in_step := LEAST(v_batch.quantity, v_remaining_qty);
        
        -- Update the batch quantity
        UPDATE inventory_batches
        SET quantity = quantity - v_dispensed_in_step
        WHERE id = v_batch.id;

        -- Record the stock movement
        INSERT INTO stock_movements (
            id, organization_id, medicine_id, batch_id, type, quantity, reference_id, created_at
        ) VALUES (
            'mov-' || gen_random_uuid(),
            p_pharmacy_id,
            p_medicine_id,
            v_batch.id,
            'sale',
            v_dispensed_in_step,
            COALESCE(CAST(p_sale_id AS TEXT), 'FEFO-AUTO-' || EXTRACT(EPOCH FROM NOW())::TEXT),
            NOW()
        );

        -- Adjust remaining quantity and return row
        v_remaining_qty := v_remaining_qty - v_dispensed_in_step;
        batch_id := v_batch.id;
        quantity_dispensed := v_dispensed_in_step;
        RETURN NEXT;
    END LOOP;

    -- Optional: check if we fulfilled the entire request
    IF v_remaining_qty > 0 THEN
        -- You could raise an exception here if partial dispensing is not allowed
        -- RAISE EXCEPTION 'Insufficient stock to fulfill FEFO request. Missing: %', v_remaining_qty;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
