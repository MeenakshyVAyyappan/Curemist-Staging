-- ============================================
-- Fix Missing dob Column in Profiles Table
-- ============================================
-- Run this if you get error: Could not find the 'dob' column of 'profiles' in the schema cache
-- ============================================

-- Add dob column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'dob';

-- ============================================
-- After running this, try your checkout process again
-- ============================================