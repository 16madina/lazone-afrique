-- Créer la table pour stocker toutes les transactions de paiement
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  payment_method TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('sponsorship', 'subscription', 'paid_listing')),
  related_id UUID, -- listing_id pour sponsorship et paid_listing
  package_id UUID, -- pour les sponsorships
  subscription_type TEXT, -- pour les abonnements
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  provider TEXT NOT NULL DEFAULT 'cinetpay',
  provider_transaction_id TEXT,
  payment_url TEXT,
  description TEXT,
  phone_number TEXT,
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON public.payment_transactions(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON public.payment_transactions(provider);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter une colonne payment_transaction_id aux tables existantes pour lier aux transactions
ALTER TABLE public.sponsorship_transactions 
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT REFERENCES public.payment_transactions(id);

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT REFERENCES public.payment_transactions(id);

ALTER TABLE public.listing_payments 
ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT REFERENCES public.payment_transactions(id);

-- RLS pour la table payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres transactions
CREATE POLICY "Users can view their own payment transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent créer leurs propres transactions
CREATE POLICY "Users can create their own payment transactions" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent voir toutes les transactions
CREATE POLICY "Admins can view all payment transactions" 
ON public.payment_transactions 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Fonction pour vérifier le statut d'une transaction
CREATE OR REPLACE FUNCTION public.get_payment_status(transaction_id TEXT)
RETURNS TABLE(
  id TEXT,
  status TEXT,
  amount DECIMAL,
  currency TEXT,
  payment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    pt.id,
    pt.status,
    pt.amount,
    pt.currency,
    pt.payment_type,
    pt.created_at
  FROM public.payment_transactions pt
  WHERE pt.id = transaction_id
    AND (pt.user_id = auth.uid() OR public.is_admin(auth.uid()));
$$;