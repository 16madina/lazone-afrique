-- Table pour la configuration des limites et tarifs (modifiable par admin)
CREATE TABLE public.listing_limits_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_type public.user_type NOT NULL,
  free_listings_per_month INTEGER NOT NULL DEFAULT 0,
  price_per_extra_listing DECIMAL(10,2) NOT NULL DEFAULT 0,
  unlimited_monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CFA',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_type)
);

-- Données par défaut pour les limites
INSERT INTO public.listing_limits_config (user_type, free_listings_per_month, price_per_extra_listing, unlimited_monthly_price) VALUES
('proprietaire', 3, 500, 15000),
('demarcheur', 3, 500, 15000),
('agence', 1, 500, 15000);

-- Table pour les abonnements utilisateurs
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('free', 'unlimited_monthly', 'pay_per_listing')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour tracker l'utilisation mensuelle des annonces
CREATE TABLE public.monthly_listing_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  free_listings_used INTEGER NOT NULL DEFAULT 0,
  paid_listings_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Table pour les transactions d'annonces payantes
CREATE TABLE public.listing_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('extra_listing', 'unlimited_subscription')),
  amount_paid DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CFA',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.listing_limits_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_listing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_payments ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour listing_limits_config
CREATE POLICY "Everyone can view listing limits config"
ON public.listing_limits_config FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage listing limits config"
ON public.listing_limits_config FOR ALL
USING (is_admin());

-- Politiques RLS pour user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
ON public.user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR ALL
USING (is_admin());

-- Politiques RLS pour monthly_listing_usage
CREATE POLICY "Users can view their own usage"
ON public.monthly_listing_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage records"
ON public.monthly_listing_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage records"
ON public.monthly_listing_usage FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
ON public.monthly_listing_usage FOR ALL
USING (is_admin());

-- Politiques RLS pour listing_payments
CREATE POLICY "Users can view their own payments"
ON public.listing_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.listing_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
ON public.listing_payments FOR ALL
USING (is_admin());

-- Fonctions utiles
CREATE OR REPLACE FUNCTION public.get_current_month_usage(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  free_listings_used INTEGER,
  paid_listings_used INTEGER,
  free_listings_remaining INTEGER
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Récupérer la limite gratuite pour ce type d'utilisateur
  SELECT llc.free_listings_per_month INTO free_limit
  FROM public.listing_limits_config llc
  WHERE llc.user_type = user_type_val AND llc.is_active = true;
  
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
$$;

CREATE OR REPLACE FUNCTION public.can_create_listing(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Vérifier les annonces gratuites restantes
  SELECT free_listings_remaining INTO free_remaining
  FROM public.get_current_month_usage(target_user_id);
  
  RETURN free_remaining > 0;
END;
$$;

-- Trigger pour mettre à jour les timestamps
CREATE TRIGGER update_listing_limits_config_updated_at
  BEFORE UPDATE ON public.listing_limits_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_listing_usage_updated_at
  BEFORE UPDATE ON public.monthly_listing_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listing_payments_updated_at
  BEFORE UPDATE ON public.listing_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();