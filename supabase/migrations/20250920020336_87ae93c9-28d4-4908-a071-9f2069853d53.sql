-- Créer la table pour les évaluations des utilisateurs
CREATE TABLE public.user_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rated_user_id uuid NOT NULL, -- L'utilisateur qui est évalué
  rater_user_id uuid NOT NULL, -- L'utilisateur qui donne la note
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  listing_id uuid, -- Optionnel : évaluation liée à une transaction sur une annonce
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(rated_user_id, rater_user_id, listing_id) -- Empêcher les doublons
);

-- Créer la table pour le suivi des vues de profil
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewed_user_id uuid NOT NULL, -- L'utilisateur dont le profil est consulté
  viewer_user_id uuid, -- L'utilisateur qui consulte (peut être null pour les visiteurs non connectés)
  viewer_ip inet, -- IP du visiteur pour les non connectés
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS sur les deux tables
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_ratings
CREATE POLICY "Users can view ratings for any user" 
ON public.user_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings for others" 
ON public.user_ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = rater_user_id 
  AND auth.uid() != rated_user_id -- Ne peut pas s'auto-évaluer
);

CREATE POLICY "Users can update their own ratings" 
ON public.user_ratings 
FOR UPDATE 
USING (auth.uid() = rater_user_id);

-- Politiques RLS pour profile_views
CREATE POLICY "Users can view their own profile views" 
ON public.profile_views 
FOR SELECT 
USING (auth.uid() = viewed_user_id);

CREATE POLICY "Anyone can create profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- Fonction pour calculer la note moyenne d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_average_rating(target_user_id uuid)
RETURNS TABLE(average_rating numeric, total_ratings integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating::numeric), 1), 0) as average_rating,
    COALESCE(COUNT(rating)::integer, 0) as total_ratings
  FROM public.user_ratings
  WHERE rated_user_id = target_user_id;
$$;

-- Fonction pour compter les vues de profil d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_profile_views_count(target_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM public.profile_views
  WHERE viewed_user_id = target_user_id;
$$;

-- Fonction pour enregistrer une vue de profil
CREATE OR REPLACE FUNCTION public.record_profile_view(
  target_user_id uuid,
  viewer_ip inet DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  -- Ne pas enregistrer si l'utilisateur regarde son propre profil
  IF current_user_id = target_user_id THEN
    RETURN;
  END IF;
  
  -- Éviter les doublons : ne pas enregistrer si la même personne a déjà vu ce profil dans les dernières 24h
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_views 
    WHERE viewed_user_id = target_user_id 
      AND (
        (current_user_id IS NOT NULL AND viewer_user_id = current_user_id)
        OR (current_user_id IS NULL AND viewer_ip = record_profile_view.viewer_ip)
      )
      AND created_at > now() - interval '24 hours'
  ) THEN
    INSERT INTO public.profile_views (viewed_user_id, viewer_user_id, viewer_ip)
    VALUES (target_user_id, current_user_id, viewer_ip);
  END IF;
END;
$$;

-- Trigger pour mettre à jour updated_at sur user_ratings
CREATE TRIGGER update_user_ratings_updated_at
BEFORE UPDATE ON public.user_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();