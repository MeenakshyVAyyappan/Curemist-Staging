-- Migration: ensure profiles.is_admin exists
-- Run this BEFORE applying RLS policies that reference profiles.is_admin

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

COMMIT;

-- Optionally, make a specific user an admin (by email or id). Replace the values below.
-- By email:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'admin@example.com';

-- By id:
-- UPDATE public.profiles SET is_admin = true WHERE id = '<user-uuid-here>';

-- Notes:
-- - Run this in the Supabase SQL editor or via psql as a privileged user.
-- - After adding the column, you can safely create RLS policies that reference profiles.is_admin.
