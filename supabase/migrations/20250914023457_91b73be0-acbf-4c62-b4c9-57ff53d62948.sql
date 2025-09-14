-- Add sponsorship fields to listings table
ALTER TABLE public.listings 
ADD COLUMN is_sponsored BOOLEAN DEFAULT FALSE,
ADD COLUMN sponsored_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN sponsor_amount NUMERIC DEFAULT 0,
ADD COLUMN sponsored_at TIMESTAMP WITH TIME ZONE;

-- Create sponsorship_packages table for different boost options
CREATE TABLE public.sponsorship_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  price_usd NUMERIC NOT NULL,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sponsorship_packages
ALTER TABLE public.sponsorship_packages ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing packages
CREATE POLICY "Everyone can view active sponsorship packages" 
ON public.sponsorship_packages 
FOR SELECT 
USING (is_active = true);

-- Create sponsorship_transactions table for payment tracking
CREATE TABLE public.sponsorship_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  package_id UUID NOT NULL,
  amount_paid NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sponsorship_transactions
ALTER TABLE public.sponsorship_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsorship_transactions
CREATE POLICY "Users can view their own sponsorship transactions" 
ON public.sponsorship_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sponsorship transactions" 
ON public.sponsorship_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsorship transactions" 
ON public.sponsorship_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default sponsorship packages
INSERT INTO public.sponsorship_packages (name, description, duration_days, price_usd, features) VALUES
('Boost 3 jours', 'Mettez votre annonce en avant pendant 3 jours', 3, 15, ARRAY['Position prioritaire', 'Badge "Sponsorisé"', 'Visibilité accrue']),
('Boost 7 jours', 'Mettez votre annonce en avant pendant 1 semaine', 7, 35, ARRAY['Position prioritaire', 'Badge "Sponsorisé"', 'Visibilité accrue', 'Support prioritaire']),
('Boost 15 jours', 'Mettez votre annonce en avant pendant 2 semaines', 15, 65, ARRAY['Position prioritaire', 'Badge "Sponsorisé"', 'Visibilité accrue', 'Support prioritaire', 'Statistiques détaillées']),
('Boost 30 jours', 'Mettez votre annonce en avant pendant 1 mois', 30, 120, ARRAY['Position prioritaire', 'Badge "Sponsorisé"', 'Visibilité accrue', 'Support prioritaire', 'Statistiques détaillées', 'Promotion sur réseaux sociaux']);

-- Create function to check if listing is currently sponsored
CREATE OR REPLACE FUNCTION public.is_listing_sponsored(listing_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    COALESCE(
      (SELECT is_sponsored AND sponsored_until > now() 
       FROM public.listings 
       WHERE id = listing_id), 
      FALSE
    );
$$;

-- Create trigger to update listings updated_at
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsorship_packages_updated_at
BEFORE UPDATE ON public.sponsorship_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsorship_transactions_updated_at
BEFORE UPDATE ON public.sponsorship_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();