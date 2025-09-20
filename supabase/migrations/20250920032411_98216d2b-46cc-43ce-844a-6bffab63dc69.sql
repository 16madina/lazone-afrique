-- Update the get_listing_owner_profile function to include phone number
CREATE OR REPLACE FUNCTION public.get_listing_owner_profile(owner_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'full_name', COALESCE(p.full_name, 'Utilisateur'),
    'company_name', p.company_name,
    'user_type', p.user_type,
    'avatar_url', p.avatar_url,
    'city', p.city,
    'country', p.country,
    'phone', p.phone
  )
  FROM public.profiles p
  WHERE p.user_id = owner_user_id
  AND p.banned = false;
$function$;