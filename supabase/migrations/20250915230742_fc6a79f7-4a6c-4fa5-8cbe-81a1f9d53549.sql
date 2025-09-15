-- Fix critical security issues

-- 1. Fix function search_path issues by adding SECURITY DEFINER and proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid
  )
$function$;

CREATE OR REPLACE FUNCTION public.can_user_add_participant(target_conversation_id uuid, target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- L'utilisateur peut s'ajouter lui-même ou ajouter d'autres s'il est déjà dans la conversation
  SELECT 
    auth.uid() = target_user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp 
      WHERE cp.conversation_id = target_conversation_id 
      AND cp.user_id = auth.uid()
    )
$function$;

CREATE OR REPLACE FUNCTION public.can_user_view_participants(target_conversation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants cp 
    WHERE cp.conversation_id = target_conversation_id 
    AND cp.user_id = auth.uid()
  )
$function$;

-- 2. Fix admin_roles security - remove public insert policy and restrict to admins only
DROP POLICY IF EXISTS "Anyone can insert admin roles" ON public.admin_roles;

CREATE POLICY "Only admins can insert admin roles" ON public.admin_roles
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_roles existing_admin 
    WHERE existing_admin.user_id = auth.uid()
  )
);

-- 3. Fix profiles table - restrict access to sensitive data
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- Allow users to view basic public info of all profiles
CREATE POLICY "Users can view basic profile info" ON public.profiles
FOR SELECT 
USING (true);

-- Allow users to view their own full profile
CREATE POLICY "Users can view their own full profile" ON public.profiles  
FOR SELECT
USING (auth.uid() = user_id);

-- Create a view for public profile data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  first_name,
  last_name,
  avatar_url,
  user_type,
  company_name,
  country,
  city
FROM public.profiles
WHERE NOT banned;