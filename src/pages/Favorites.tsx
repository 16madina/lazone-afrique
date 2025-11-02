import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Trash2, MapPin, Home } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LazyImage } from "@/components/LazyImage";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  transaction_type: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  surface_area?: number;
}

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, removeFromFavorites } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour voir vos favoris",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const fetchFavorites = async () => {
      if (favorites.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .in("id", favorites);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos favoris",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const mappedListings = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        location: item.location || item.address,
        city: item.city,
        transaction_type: item.transaction_type,
        images: item.images || [item.image],
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        surface_area: item.surface_area,
      }));
      
      setListings(mappedListings);
      setLoading(false);
    };

    fetchFavorites();
  }, [user, favorites, navigate]);

  const handleRemoveFavorite = async (listingId: string) => {
    await removeFromFavorites(listingId);
    setListings(listings.filter((l) => l.id !== listingId));
    toast({
      title: "Retiré des favoris",
      description: "Le bien a été retiré de vos favoris",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24 pb-32">
        <div className="glass-card rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Mes Favoris
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Retrouvez tous les biens que vous avez sauvegardés pour y revenir plus tard
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-16 animate-fade-in">
            <CardContent>
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-2xl font-semibold mb-2">Aucun favori</h2>
              <p className="text-muted-foreground mb-6">
                Commencez à sauvegarder vos biens préférés en cliquant sur l'icône cœur
              </p>
              <Button onClick={() => navigate("/")} className="ripple">
                <Home className="w-4 h-4 mr-2" />
                Découvrir les biens
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, index) => (
              <Card
                key={listing.id}
                className="group cursor-pointer overflow-hidden animate-fade-in hover:shadow-elevation-5 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative" onClick={() => navigate(`/listing/${listing.id}`)}>
                  <LazyImage
                    src={listing.images?.[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  />
                  <Badge className="absolute top-3 left-3">
                    {listing.transaction_type === "rent" ? "Location" : "Vente"}
                  </Badge>
                  <Button
                    variant="glass"
                    size="icon"
                    className="absolute top-3 right-3 ripple"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(listing.id);
                    }}
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4" onClick={() => navigate(`/listing/${listing.id}`)}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{listing.location}, {listing.city}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {listing.price.toLocaleString()} FCFA
                    </span>
                  </div>

                  {(listing.bedrooms || listing.surface_area) && (
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      {listing.bedrooms && <span>{listing.bedrooms} ch.</span>}
                      {listing.bathrooms && <span>{listing.bathrooms} sdb.</span>}
                      {listing.surface_area && <span>{listing.surface_area} m²</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
