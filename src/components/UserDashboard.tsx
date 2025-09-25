import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Eye, 
  Heart, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Home,
  Calendar,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUserStats } from '@/hooks/useUserStats';
import { useListingLimits } from '@/hooks/useListingLimits';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalContacts: number;
  favoriteCount: number;
  monthlyViews: number;
}

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalContacts: 0,
    favoriteCount: 0,
    monthlyViews: 0
  });
  const [loading, setLoading] = useState(true);
  const { stats: userStats } = useUserStats(user?.id);
  const { usage, config, subscription, canCreateListing } = useListingLimits();

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Récupérer les statistiques des annonces
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, status, created_at')
        .eq('user_id', user.id);

      if (listingsError) throw listingsError;

      // Calculer les statistiques des annonces
      const totalListings = listings?.length || 0;
      const activeListings = listings?.filter(l => l.status === 'published').length || 0;

      // Récupérer les vues de profil
      const { data: profileViews, error: viewsError } = await supabase
        .from('profile_views')
        .select('created_at')
        .eq('viewed_user_id', user.id);

      if (viewsError) throw viewsError;

      const totalViews = profileViews?.length || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyViews = profileViews?.filter(view => {
        const viewDate = new Date(view.created_at);
        return viewDate.getMonth() === currentMonth && viewDate.getFullYear() === currentYear;
      }).length || 0;

      // Récupérer les messages reçus (conversations participantes)
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (conversationsError) throw conversationsError;

      // Récupérer les favoris sur les annonces de l'utilisateur
      let favoriteCount = 0;
      if (listings && listings.length > 0) {
        const listingIds = listings.map(l => l.id);
        const { data: favorites, error: favError } = await supabase
          .from('favorites')
          .select('id')
          .in('listing_id', listingIds);

        if (!favError) {
          favoriteCount = favorites?.length || 0;
        }
      }

      setStats({
        totalListings,
        activeListings,
        totalViews,
        totalContacts: conversations?.length || 0,
        favoriteCount,
        monthlyViews
      });

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Annonces</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues Profil</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyViews} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.averageRating}/5</div>
            <p className="text-xs text-muted-foreground">
              {userStats.totalRatings} avis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoris Reçus</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteCount}</div>
            <p className="text-xs text-muted-foreground">
              Sur mes annonces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les détails */}
      <Tabs defaultValue="limits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="limits">Limites & Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Usage des Annonces
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Annonces gratuites */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Annonces Gratuites</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.free_listings_used}/{config?.free_listings_per_month || 0}
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(
                    usage.free_listings_used, 
                    config?.free_listings_per_month || 0
                  )} 
                  className="w-full" 
                />
                <p className="text-xs text-muted-foreground">
                  {usage.free_listings_remaining} restantes ce mois
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                {canCreateListing ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Vous pouvez créer une nouvelle annonce</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Limite atteinte - Passez au payant</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance du Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Visibilité</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">vues de profil</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalContacts}</p>
                  <p className="text-xs text-muted-foreground">conversations</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taux de Conversion</span>
                  <Badge variant="outline">
                    {stats.totalViews > 0 
                      ? `${Math.round((stats.totalContacts / stats.totalViews) * 100)}%`
                      : '0%'
                    }
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pourcentage de vues qui deviennent des contacts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Abonnement Actuel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Type d'abonnement</span>
                    <Badge variant={subscription.is_active ? 'default' : 'secondary'}>
                      {subscription.subscription_type === 'unlimited_monthly' 
                        ? 'Illimité Mensuel' 
                        : subscription.subscription_type
                      }
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Statut</span>
                    <Badge variant={subscription.is_active ? 'default' : 'destructive'}>
                      {subscription.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  {subscription.expires_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expire le</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Aucun abonnement actif</p>
                  <Button size="sm">
                    Voir les Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};