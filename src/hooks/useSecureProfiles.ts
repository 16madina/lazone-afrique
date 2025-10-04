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
  // Suppression de l'état loading partagé pour éviter les conflits en parallèle
  const getPublicProfile = async (userId: string): Promise<PublicProfile | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_public_profile_safe', {
        profile_user_id: userId
      });

      if (error) {
        // Log silencieux - ne pas polluer la console
        console.warn('Profile fetch failed for user:', userId);
        return null;
      }

      return data as unknown as PublicProfile;
    } catch (error) {
      // Log silencieux - ne pas polluer la console
      console.warn('Profile fetch error for user:', userId);
      return null;
    }
  };

  const getListingOwnerProfile = async (userId: string): Promise<ListingOwnerProfile | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_listing_owner_profile', {
        owner_user_id: userId
      });

      if (error) {
        console.warn('Listing owner profile fetch failed for user:', userId);
        return null;
      }

      return data as unknown as ListingOwnerProfile;
    } catch (error) {
      console.warn('Listing owner profile fetch error for user:', userId);
      return null;
    }
  };

  return {
    getPublicProfile,
    getListingOwnerProfile
  };
};