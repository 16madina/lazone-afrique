-- Update RLS policies to restrict business data access
-- Restrict listing_limits_config to authenticated users only
DROP POLICY IF EXISTS "Everyone can view listing limits config" ON public.listing_limits_config;

CREATE POLICY "Authenticated users can view listing limits config" 
ON public.listing_limits_config 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep admin management policy
-- The existing "Only admins can manage listing limits config" policy remains unchanged

-- Update sponsorship_packages to require authentication for viewing
DROP POLICY IF EXISTS "Everyone can view active sponsorship packages" ON public.sponsorship_packages;

CREATE POLICY "Authenticated users can view active sponsorship packages" 
ON public.sponsorship_packages 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Add admin management policy for sponsorship packages
CREATE POLICY "Admins can manage sponsorship packages" 
ON public.sponsorship_packages 
FOR ALL 
USING (is_admin());

-- Strengthen admin_roles table security
-- Remove the self-admin policy that allows users to grant themselves admin privileges
DROP POLICY IF EXISTS "Only admins can insert admin roles" ON public.admin_roles;

-- Create a more restrictive policy that prevents self-granting of admin privileges
CREATE POLICY "System admins can insert admin roles" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (
  -- Only existing admins can grant admin privileges to others (not themselves)
  EXISTS (
    SELECT 1 FROM admin_roles existing_admin 
    WHERE existing_admin.user_id = auth.uid()
  ) 
  AND auth.uid() != user_id  -- Prevent self-granting
);

-- Add audit trigger for admin role changes
CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all admin role changes for security monitoring
  INSERT INTO public.user_actions (
    admin_id,
    target_user_id,
    action_type,
    reason
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.user_id, OLD.user_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'admin_role_granted'
      WHEN TG_OP = 'DELETE' THEN 'admin_role_revoked'
    END,
    'Admin role modification via database'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for admin role audit
DROP TRIGGER IF EXISTS audit_admin_role_changes_trigger ON public.admin_roles;
CREATE TRIGGER audit_admin_role_changes_trigger
  AFTER INSERT OR DELETE ON public.admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_admin_role_changes();