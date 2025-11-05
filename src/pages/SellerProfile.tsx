import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSecureProfiles } from "@/hooks/useSecureProfiles";
import { useUserStats } from "@/hooks/useUserStats";
import UserListingsMap from "@/components/UserListingsMap";
import { ArrowLeft, Star, MapPin, Home, Building2, Eye } from "lucide-react";
import { toast } from "sonner";
import PropertyCard from "@/components/PropertyCard";

interface SellerListing {
  id: string;
  title: string;
  price: number;
  city: string;
  image: string | null;
  photos: string[] | null;
  property_type: string | null;
  transaction_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_area: number | null;
  price_currency: string;
}

const SellerProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  
  const { getPublicProfile } = useSecureProfiles();
  const { stats, loading: statsLoading } = useUserStats(userId);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!userId) return;

      try {
        // Fetch seller profile
        const profile = await getPublicProfile(userId);
        setSellerProfile(profile);

        // Fetch seller listings
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, price, city, image, photos, property_type, transaction_type, bedrooms, bathrooms, surface_area, price_currency')
          .eq('user_id', userId)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (error) {
        console.error('Error fetching seller data:', error);
        toast.error("Erreur lors du chargement du profil vendeur");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [userId]);

  if (loading || statsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!sellerProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-muted-foreground">Profil vendeur introuvable</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 p-6 pt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          {/* Seller Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and basic info */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={sellerProfile.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {sellerProfile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {sellerProfile.user_type && (
                    <Badge variant="secondary">
                      {sellerProfile.user_type === 'agent' ? 'Agent' :
                       sellerProfile.user_type === 'agency' ? 'Agence' :
                       sellerProfile.user_type === 'owner' ? 'Propriétaire' :
                       sellerProfile.user_type}
                    </Badge>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{sellerProfile.full_name}</h1>
                    {sellerProfile.company_name && (
                      <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4" />
                        {sellerProfile.company_name}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4">
                    {stats.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({stats.totalRatings} avis)
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold">{listings.length}</span>
                      <span className="text-sm text-muted-foreground">annonces</span>
                    </div>

                    {stats.profileViews > 0 && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">{stats.profileViews}</span>
                        <span className="text-sm text-muted-foreground">vues</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {(sellerProfile.city || sellerProfile.country) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[sellerProfile.city, sellerProfile.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Section */}
          {listings.length > 0 && (
            <div>
              <UserListingsMap userId={userId!} />
            </div>
          )}

          {/* Listings Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Toutes les annonces ({listings.length})
            </h2>
            
            {listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Ce vendeur n'a aucune annonce active pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card 
                    key={listing.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <div className="relative">
                      <img
                        src={listing.image || (listing.photos && listing.photos[0]) || 'https://via.placeholder.com/400x300?text=Pas+d%27image'}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                      {listing.transaction_type && (
                        <Badge className="absolute top-2 right-2">
                          {listing.transaction_type === 'sale' ? 'Vente' :
                           listing.transaction_type === 'rent' ? 'Location' :
                           listing.transaction_type}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{listing.title}</h3>
                      
                      <p className="text-2xl font-bold text-primary mb-3">
                        {new Intl.NumberFormat('fr-FR').format(listing.price)} FCFA
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.city}</span>
                      </div>

                      {listing.property_type && (
                        <Badge variant="secondary" className="mb-3">
                          {listing.property_type === 'apartment' ? 'Appartement' :
                           listing.property_type === 'house' ? 'Maison' :
                           listing.property_type === 'villa' ? 'Villa' :
                           listing.property_type === 'land' ? 'Terrain' :
                           listing.property_type}
                        </Badge>
                      )}

                      {(listing.bedrooms || listing.bathrooms || listing.surface_area) && (
                        <div className="flex gap-4 text-sm">
                          {listing.bedrooms && (
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {listing.bedrooms}
                            </span>
                          )}
                          {listing.bathrooms && (
                            <span className="flex items-center gap-1">
                              🚿 {listing.bathrooms}
                            </span>
                          )}
                          {listing.surface_area && (
                            <span className="flex items-center gap-1">
                              📐 {listing.surface_area}m²
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SellerProfile;
