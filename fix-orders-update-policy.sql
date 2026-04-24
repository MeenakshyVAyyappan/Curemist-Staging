-- ============================================
-- Fix missing UPDATE policy for orders table
-- ============================================
-- Currently, normal users cannot update their own orders in the database.
-- This causes the checkout page to silently fail when trying to update
-- the order status to "payment_successful" after a successful Razorpay payment.
-- 
-- Run this SQL in your Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query

-- 1. Create policy to allow users to update their own orders
CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Verify it was created
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders' AND policyname = 'Users can update their own orders';
