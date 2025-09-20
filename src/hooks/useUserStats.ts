import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  averageRating: number;
  totalRatings: number;
  profileViews: number;
}

export const useUserStats = (userId?: string) => {
  const [stats, setStats] = useState<UserStats>({
    averageRating: 0,
    totalRatings: 0,
    profileViews: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchUserStats = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Récupérer la note moyenne
      const { data: ratingData, error: ratingError } = await supabase.rpc(
        'get_user_average_rating',
        { target_user_id: userId }
      );

      // Récupérer le nombre de vues de profil
      const { data: viewsData, error: viewsError } = await supabase.rpc(
        'get_user_profile_views_count',
        { target_user_id: userId }
      );

      if (ratingError) {
        console.error('Error fetching user ratings:', ratingError);
      }

      if (viewsError) {
        console.error('Error fetching profile views:', viewsError);
      }

      setStats({
        averageRating: ratingData?.[0]?.average_rating || 0,
        totalRatings: ratingData?.[0]?.total_ratings || 0,
        profileViews: viewsData || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordProfileView = async (targetUserId: string) => {
    try {
      const { error } = await supabase.rpc('record_profile_view', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Error recording profile view:', error);
      }
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  };

  const submitRating = async (
    ratedUserId: string, 
    rating: number, 
    comment?: string,
    listingId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('user_ratings')
        .upsert({
          rated_user_id: ratedUserId,
          rater_user_id: (await supabase.auth.getUser()).data.user?.id,
          rating,
          comment,
          listing_id: listingId
        });

      if (error) {
        console.error('Error submitting rating:', error);
        return false;
      }

      // Rafraîchir les stats après avoir ajouté une note
      await fetchUserStats();
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  return {
    stats,
    loading,
    fetchUserStats,
    recordProfileView,
    submitRating,
  };
};