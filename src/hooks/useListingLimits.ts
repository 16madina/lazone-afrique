import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ListingUsage {
  free_listings_used: number;
  paid_listings_used: number;
  free_listings_remaining: number;
}

interface ListingConfig {
  user_type: 'proprietaire' | 'demarcheur' | 'agence';
  free_listings_per_month: number;
  price_per_extra_listing: number;
  unlimited_monthly_price: number;
  currency: string;
}

interface UserSubscription {
  id: string;
  subscription_type: 'free' | 'unlimited_monthly' | 'pay_per_listing';
  is_active: boolean;
  starts_at: string;
  expires_at?: string;
  auto_renew: boolean;
}

export const useListingLimits = () => {
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<ListingUsage | null>(null);
  const [config, setConfig] = useState<ListingConfig | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [canCreateListing, setCanCreateListing] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('get_current_month_usage', {
        target_user_id: user.id
      });

      if (error) {
        console.error('Error fetching usage:', error);
        setError('Erreur lors du chargement de l\'utilisation');
        return;
      }

      if (data && data.length > 0) {
        setUsage(data[0]);
      }
    } catch (err) {
      console.error('Error in fetchUsage:', err);
      setError('Erreur lors du chargement de l\'utilisation');
    }
  };

  const fetchConfig = async () => {
    if (!profile?.user_type) return;

    try {
      const { data, error } = await supabase
        .from('listing_limits_config')
        .select('*')
        .eq('user_type', profile.user_type)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching config:', error);
        setError('Erreur lors du chargement de la configuration');
        return;
      }

      setConfig(data);
    } catch (err) {
      console.error('Error in fetchConfig:', err);
      setError('Erreur lors du chargement de la configuration');
    }
  };

  const fetchSubscription = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        setError('Erreur lors du chargement de l\'abonnement');
        return;
      }

      setSubscription(data as UserSubscription);
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
      setError('Erreur lors du chargement de l\'abonnement');
    }
  };

  const checkCanCreateListing = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('can_create_listing', {
        target_user_id: user.id
      });

      if (error) {
        console.error('Error checking can create listing:', error);
        setCanCreateListing(false);
        return;
      }

      setCanCreateListing(data || false);
    } catch (err) {
      console.error('Error in checkCanCreateListing:', err);
      setCanCreateListing(false);
    }
  };

  const incrementUsage = async (isPaid: boolean = false) => {
    if (!user?.id) return;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      const { data: existingUsage } = await supabase
        .from('monthly_listing_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (existingUsage) {
        const updateData = isPaid 
          ? { paid_listings_used: existingUsage.paid_listings_used + 1 }
          : { free_listings_used: existingUsage.free_listings_used + 1 };

        await supabase
          .from('monthly_listing_usage')
          .update(updateData)
          .eq('id', existingUsage.id);
      } else {
        const insertData = {
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          free_listings_used: isPaid ? 0 : 1,
          paid_listings_used: isPaid ? 1 : 0
        };

        await supabase
          .from('monthly_listing_usage')
          .insert(insertData);
      }

      // Refresh data
      await fetchUsage();
      await checkCanCreateListing();
    } catch (err) {
      console.error('Error incrementing usage:', err);
    }
  };

  const createPayment = async (paymentType: 'extra_listing' | 'unlimited_subscription', amount: number, listingId?: string) => {
    if (!user?.id || !config) return null;

    try {
      const { data, error } = await supabase
        .from('listing_payments')
        .insert({
          user_id: user.id,
          listing_id: listingId,
          payment_type: paymentType,
          amount_paid: amount,
          currency: config.currency,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in createPayment:', err);
      return null;
    }
  };

  const createPaidListingPayment = async (listingId: string, amount: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-cinetpay-payment', {
        body: {
          amount,
          description: 'Paiement pour annonce supplémentaire',
          payment_type: 'paid_listing',
          related_id: listingId,
          currency: 'XOF'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating paid listing payment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !profile?.user_type) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      await Promise.all([
        fetchUsage(),
        fetchConfig(),
        fetchSubscription(),
        checkCanCreateListing()
      ]);

      setLoading(false);
    };

    loadData();
  }, [user?.id, profile?.user_type]);

  const refreshData = async () => {
    await Promise.all([
      fetchUsage(),
      fetchSubscription(),
      checkCanCreateListing()
    ]);
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'proprietaire': return 'Propriétaire';
      case 'demarcheur': return 'Démarcheur';
      case 'agence': return 'Agence immobilière';
      default: return userType;
    }
  };

  const getSubscriptionTypeLabel = (subType: string) => {
    switch (subType) {
      case 'free': return 'Gratuit';
      case 'unlimited_monthly': return 'Illimité mensuel';
      case 'pay_per_listing': return 'Paiement par annonce';
      default: return subType;
    }
  };

  return {
    usage,
    config,
    subscription,
    canCreateListing,
    loading,
    error,
    incrementUsage,
    createPaidListingPayment,
    refreshData,
    getUserTypeLabel,
    getSubscriptionTypeLabel
  };
};