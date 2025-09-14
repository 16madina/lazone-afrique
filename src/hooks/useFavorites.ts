import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      setFavorites(data?.map(fav => fav.listing_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Setup real-time updates for favorites
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Favorites changed:', payload);
          // Refresh favorites when changes occur
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Add listing to favorites
  const addToFavorites = async (listingId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return false;
    }

    if (favorites.includes(listingId)) {
      return true; // Already in favorites
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          listing_id: listingId
        });

      if (error) {
        console.error('Error adding to favorites:', error);
        toast.error('Erreur lors de l\'ajout aux favoris');
        return false;
      }

      toast.success('Ajouté aux favoris');
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove listing from favorites
  const removeFromFavorites = async (listingId: string) => {
    if (!user) return false;

    if (!favorites.includes(listingId)) {
      return true; // Not in favorites
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) {
        console.error('Error removing from favorites:', error);
        toast.error('Erreur lors de la suppression des favoris');
        return false;
      }

      toast.success('Retiré des favoris');
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Erreur lors de la suppression des favoris');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (listingId: string) => {
    if (favorites.includes(listingId)) {
      return await removeFromFavorites(listingId);
    } else {
      return await addToFavorites(listingId);
    }
  };

  // Check if listing is favorite
  const isFavorite = (listingId: string) => {
    return favorites.includes(listingId);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    fetchFavorites
  };
};