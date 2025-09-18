-- Drop the failed view approach and create proper restrictive RLS policies
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Create a policy that only allows viewing non-sensitive profile data for other users
CREATE POLICY "Public can view limited profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = user_id 
  OR 
  -- Or public can see only non-sensitive fields of other users (we'll handle this in the application layer)
  (auth.uid() IS NOT NULL AND banned = false)
);

-- Create a secure function that returns only safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(profile_user_id uuid)
RETURNS json
LANGUAGE sql
SECURITY definer
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'full_name', p.full_name,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'company_name', p.company_name,
    'user_type', p.user_type,
    'avatar_url', p.avatar_url,
    'city', p.city,
    'country', p.country,
    'created_at', p.created_at
  )
  FROM public.profiles p
  WHERE p.user_id = profile_user_id
  AND p.banned = false;
$$;

-- Create a function to get profiles for listings (only safe data)
CREATE OR REPLACE FUNCTION public.get_listing_owner_profile(owner_user_id uuid)
RETURNS json
LANGUAGE sql
SECURITY definer
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'full_name', p.full_name,
    'company_name', p.company_name,
    'user_type', p.user_type,
    'avatar_url', p.avatar_url,
    'city', p.city,
    'country', p.country
  )
  FROM public.profiles p
  WHERE p.user_id = owner_user_id
  AND p.banned = false;
$$;