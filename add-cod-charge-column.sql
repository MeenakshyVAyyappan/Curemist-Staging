-- ============================================
-- Add COD charge column to orders table
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Add cod_charge column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'cod_charge'
    ) THEN
        ALTER TABLE orders ADD COLUMN cod_charge INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('payment_method', 'cod_charge')
ORDER BY column_name;
