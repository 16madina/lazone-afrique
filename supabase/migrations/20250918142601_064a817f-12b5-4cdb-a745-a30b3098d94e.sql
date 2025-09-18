-- Fix the profiles table security by creating a proper public view
-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view limited profile info" ON public.profiles;

-- Create a secure public view for profiles that only shows non-sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  first_name,
  last_name,
  company_name,
  user_type,
  avatar_url,
  city,
  country,
  created_at
FROM public.profiles
WHERE banned = false;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Anyone can view public profile data" 
ON public.public_profiles
FOR SELECT 
USING (true);

-- Update the main profiles table to be more restrictive
-- Only allow users to see their own complete profile or public data of others through the view
CREATE POLICY "Users can only see public data of other profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id -- Own profile: full access
);

-- Create a function to safely get public profile info
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  first_name text,
  last_name text,
  company_name text,
  user_type public.user_type,
  avatar_url text,
  city text,
  country text,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY definer
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.first_name,
    p.last_name,
    p.company_name,
    p.user_type,
    p.avatar_url,
    p.city,
    p.country,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
  AND p.banned = false;
$$;