import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserRating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rater_user_id: string;
  listing_id: string | null;
  rater_profile?: {
    full_name?: string;
    avatar_url?: string;
    user_type?: string;
  };
  listing?: {
    title?: string;
  };
}

interface UserRatingDisplayProps {
  userId: string;
  maxVisible?: number;
  showAverage?: boolean;
}

export const UserRatingDisplay = ({ 
  userId, 
  maxVisible = 3, 
  showAverage = true 
}: UserRatingDisplayProps) => {
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRatings();
  }, [userId]);

  const fetchRatings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer les avis avec les profils des évaluateurs
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('user_ratings')
        .select(`
          id,
          rating,
          comment,
          created_at,
          rater_user_id,
          listing_id
        `)
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error('Erreur récupération avis:', ratingsError);
        setError('Impossible de charger les avis');
        return;
      }

      // Récupérer les profils et listings associés
      const ratingsWithDetails = await Promise.all(
        (ratingsData || []).map(async (rating) => {
          // Récupérer le profil de l'évaluateur
          const { data: profileData } = await supabase
            .rpc('get_public_profile_safe', { profile_user_id: rating.rater_user_id });

          let listingData = null;
          if (rating.listing_id) {
            const { data: listing } = await supabase
              .from('listings')
              .select('title')
              .eq('id', rating.listing_id)
              .single();
            listingData = listing;
          }

          return {
            ...rating,
            rater_profile: profileData,
            listing: listingData
          };
        })
      );

      setRatings(ratingsWithDetails as UserRating[]);

      // Calculer la moyenne et le total
      if (ratingsWithDetails.length > 0) {
        const average = ratingsWithDetails.reduce((sum, r) => sum + r.rating, 0) / ratingsWithDetails.length;
        setAverageRating(Math.round(average * 10) / 10);
        setTotalRatings(ratingsWithDetails.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }

    } catch (err) {
      console.error('Erreur lors de la récupération des avis:', err);
      setError('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    }[size];

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const visibleRatings = showAll ? ratings : ratings.slice(0, maxVisible);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Aucun avis disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>Avis clients</span>
          </div>
          {showAverage && (
            <div className="flex items-center gap-2">
              {renderStars(averageRating, 'md')}
              <span className="font-bold text-lg">{averageRating}</span>
              <span className="text-sm text-muted-foreground">
                ({totalRatings} avis)
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {visibleRatings.map((rating) => (
          <div key={rating.id} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                {rating.rater_profile?.avatar_url && (
                  <AvatarImage 
                    src={rating.rater_profile.avatar_url} 
                    alt={rating.rater_profile.full_name || 'Utilisateur'} 
                  />
                )}
                <AvatarFallback>
                  {rating.rater_profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {rating.rater_profile?.full_name || 'Utilisateur anonyme'}
                    </span>
                    {rating.rater_profile?.user_type && (
                      <Badge variant="outline" className="text-xs">
                        {rating.rater_profile.user_type === 'proprietaire' ? 'Particulier' : 
                         rating.rater_profile.user_type === 'agence' ? 'Agence' : 'Courtier'}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(rating.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(rating.rating)}
                  <span className="text-sm font-medium">{rating.rating}/5</span>
                </div>
                
                {rating.comment && (
                  <p className="text-sm text-muted-foreground mb-2">
                    "{rating.comment}"
                  </p>
                )}
                
                {rating.listing?.title && (
                  <Badge variant="secondary" className="text-xs">
                    Concernant: {rating.listing.title}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {ratings.length > maxVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Voir tous les avis ({ratings.length})
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};