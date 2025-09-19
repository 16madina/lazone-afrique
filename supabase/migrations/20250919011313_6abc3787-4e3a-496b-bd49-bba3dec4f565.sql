-- Mise à jour de la fonction get_current_month_usage pour éviter les problèmes de doublons
CREATE OR REPLACE FUNCTION public.get_current_month_usage(target_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(free_listings_used integer, paid_listings_used integer, free_listings_remaining integer)
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_month INTEGER := EXTRACT(MONTH FROM now());
  current_year INTEGER := EXTRACT(YEAR FROM now());
  user_type_val public.user_type;
  free_limit INTEGER;
  usage_record RECORD;
BEGIN
  -- Récupérer le type d'utilisateur
  SELECT p.user_type INTO user_type_val
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
  
  -- Si pas de profil trouvé, retourner des valeurs par défaut
  IF user_type_val IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;
  
  -- Récupérer la limite gratuite pour ce type d'utilisateur
  SELECT llc.free_listings_per_month INTO free_limit
  FROM public.listing_limits_config llc
  WHERE llc.user_type = user_type_val AND llc.is_active = true;
  
  -- Si pas de configuration trouvée, utiliser une valeur par défaut
  IF free_limit IS NULL THEN
    free_limit := 3; -- valeur par défaut
  END IF;
  
  -- Récupérer l'utilisation actuelle
  SELECT mlu.free_listings_used, mlu.paid_listings_used
  INTO usage_record
  FROM public.monthly_listing_usage mlu
  WHERE mlu.user_id = target_user_id 
    AND mlu.month = current_month 
    AND mlu.year = current_year;
  
  -- Si pas d'enregistrement, créer un nouveau (avec gestion des doublons)
  IF usage_record IS NULL THEN
    INSERT INTO public.monthly_listing_usage (user_id, month, year, free_listings_used, paid_listings_used)
    VALUES (target_user_id, current_month, current_year, 0, 0)
    ON CONFLICT (user_id, month, year) DO NOTHING;
    
    -- Récupérer à nouveau après insertion
    SELECT mlu.free_listings_used, mlu.paid_listings_used
    INTO usage_record
    FROM public.monthly_listing_usage mlu
    WHERE mlu.user_id = target_user_id 
      AND mlu.month = current_month 
      AND mlu.year = current_year;
    
    -- Si toujours NULL, initialiser avec des valeurs par défaut
    IF usage_record IS NULL THEN
      usage_record.free_listings_used := 0;
      usage_record.paid_listings_used := 0;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    usage_record.free_listings_used,
    usage_record.paid_listings_used,
    GREATEST(0, free_limit - usage_record.free_listings_used) AS free_listings_remaining;
END;
$function$;

-- Mise à jour de la fonction can_create_listing pour être plus robuste
CREATE OR REPLACE FUNCTION public.can_create_listing(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  has_unlimited BOOLEAN;
  free_remaining INTEGER;
BEGIN
  -- Vérifier si l'utilisateur a un abonnement illimité actif
  SELECT EXISTS(
    SELECT 1 FROM public.user_subscriptions us
    WHERE us.user_id = target_user_id 
      AND us.subscription_type = 'unlimited_monthly'
      AND us.is_active = true
      AND (us.expires_at IS NULL OR us.expires_at > now())
  ) INTO has_unlimited;
  
  IF has_unlimited THEN
    RETURN true;
  END IF;
  
  -- Vérifier les annonces gratuites restantes directement
  SELECT COALESCE(llc.free_listings_per_month, 3) - COALESCE(mlu.free_listings_used, 0)
  INTO free_remaining
  FROM public.profiles p
  LEFT JOIN public.listing_limits_config llc ON (llc.user_type = p.user_type AND llc.is_active = true)
  LEFT JOIN public.monthly_listing_usage mlu ON (
    mlu.user_id = target_user_id 
    AND mlu.month = EXTRACT(MONTH FROM now())
    AND mlu.year = EXTRACT(YEAR FROM now())
  )
  WHERE p.user_id = target_user_id;
  
  RETURN COALESCE(free_remaining, 3) > 0;
END;
$function$;