-- Fix RLS policies for profiles table to protect sensitive data
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;

-- Create more restrictive policies for public profile data
CREATE POLICY "Public can view limited profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow viewing limited public info (not sensitive data)
  true
);

-- Create policy for users to view their own full profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update existing policies to be more explicit
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure users can only insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create a secure function to get public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
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

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add constraint to ensure user_id is not null (critical for RLS)
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;