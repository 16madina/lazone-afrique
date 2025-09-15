-- Fix remaining security issues

-- 1. Remove the security definer view as it's not needed
DROP VIEW IF EXISTS public.public_profiles;

-- 2. Enable leaked password protection (this needs to be done via auth config)
-- This will be shown to user as a manual step to enable in auth settings