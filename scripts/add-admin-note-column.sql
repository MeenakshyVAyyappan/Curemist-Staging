-- Migration: add admin_note to orders
-- Run in Supabase SQL editor or psql connected to your DB.

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS admin_note text;

COMMIT;

-- OPTIONAL: Example RLS policies
-- If Row-Level Security is enabled on `orders`, you may need policies so admins can update this column
-- and customers can SELECT it for their own orders. Adjust to match your `profiles` schema and admin flag.

-- Allow owners (order.user_id = auth.uid()) to SELECT their orders (if not already present)
-- CREATE POLICY "Users can select own orders" ON public.orders
--   FOR SELECT
--   USING (user_id = auth.uid());

-- Allow admins (profiles.is_admin = true) to UPDATE admin_note
-- CREATE POLICY "Admins can update admin_note" ON public.orders
--   FOR UPDATE
--   USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true)
--   WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Allow users to SELECT their orders (including admin_note)
-- CREATE POLICY "Users can select their orders or admins" ON public.orders
--   FOR SELECT
--   USING (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Notes:
-- - If you use Supabase, run the first ALTER statement in the SQL editor; the change is immediate.
-- - If you use PostgREST separately, you may need to restart/reload PostgREST so the schema cache picks up the new column.
-- - If you manage access via RLS, enable/adjust policies as needed. The service_role in Supabase bypasses RLS.
