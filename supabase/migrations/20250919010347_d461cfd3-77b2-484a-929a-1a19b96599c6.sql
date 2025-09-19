-- Correction de la fonction get_current_month_usage pour éviter l'erreur d'insertion
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
  
  -- Si pas d'enregistrement, créer un nouveau
  IF usage_record IS NULL THEN
    INSERT INTO public.monthly_listing_usage (user_id, month, year, free_listings_used, paid_listings_used)
    VALUES (target_user_id, current_month, current_year, 0, 0);
    usage_record.free_listings_used := 0;
    usage_record.paid_listings_used := 0;
  END IF;
  
  RETURN QUERY SELECT 
    usage_record.free_listings_used,
    usage_record.paid_listings_used,
    GREATEST(0, free_limit - usage_record.free_listings_used) AS free_listings_remaining;
END;
$function$;