-- Fix historical abandoned orders that were stuck at payment_processing
-- These are orders where the user opened Razorpay but never completed payment
-- They should be marked as payment_cancelled (not payment_processing)
--
-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard → SQL Editor

UPDATE orders
SET
  order_status = 'payment_cancelled',
  payment_status = 'cancelled'
WHERE
  order_status = 'payment_processing'
  AND payment_status = 'pending';

-- Verify the update:
SELECT id, order_status, payment_status, created_at
FROM orders
WHERE order_status IN ('payment_processing', 'payment_cancelled')
ORDER BY created_at DESC;
