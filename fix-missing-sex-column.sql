-- ============================================
-- Fix Missing sex Column in Profiles Table
-- ============================================
-- Run this if you get error: Could not find the 'sex' column of 'profiles' in the schema cache
-- ============================================

-- Add sex column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sex TEXT;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'sex';

-- ============================================
-- After running this, try your checkout process again
-- ============================================