-- Fix the circular RLS policy for admin_roles
-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can view admin roles" ON public.admin_roles;

-- Create new policies that allow users to insert themselves as admin
-- but only view admin roles if they are admin
CREATE POLICY "Anyone can insert admin roles" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can select admin roles" 
ON public.admin_roles 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid())
);