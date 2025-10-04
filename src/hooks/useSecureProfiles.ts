import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PublicProfile {
  id: string;
  user_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  user_type: 'proprietaire' | 'demarcheur' | 'agence';
  avatar_url: string | null;
  city: string;
  country: string;
  created_at: string;
}

interface ListingOwnerProfile {
  full_name: string;
  company_name: string | null;
  user_type: 'proprietaire' | 'demarcheur' | 'agence';
  avatar_url: string | null;
  city: string;
  country: string;
  phone: string | null;
}

export const useSecureProfiles = () => {
  const [loading, setLoading] = useState(false);

  const getPublicProfile = async (userId: string): Promise<PublicProfile | null> => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_public_profile_safe', {
        profile_user_id: userId
      });

      if (error) {
        console.error('Error fetching public profile:', error);
        return null;
      }

      return data as unknown as PublicProfile;
    } catch (error) {
      console.error('Error fetching public profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getListingOwnerProfile = async (userId: string): Promise<ListingOwnerProfile | null> => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_listing_owner_profile', {
        owner_user_id: userId
      });

      if (error) {
        console.error('Error fetching listing owner profile:', error);
        return null;
      }

      return data as unknown as ListingOwnerProfile;
    } catch (error) {
      console.error('Error fetching listing owner profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getPublicProfile,
    getListingOwnerProfile,
    loading
  };
};