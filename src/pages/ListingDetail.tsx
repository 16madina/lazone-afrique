import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Eye, Phone, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  city: string;
  country_code: string;
  image: string | null;
  created_at: string;
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Eye className="w-8 h-8 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">Chargement de l'annonce...</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Eye className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Annonce non trouvée</h3>
              <p className="text-muted-foreground">
                Cette annonce n'existe pas ou n'est plus disponible.
              </p>
            </div>
            <Button onClick={() => navigate('/map')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la carte
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
      
      <main className="flex-1 p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/map')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{listing.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {listing.city}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {listing.image ? (
                <img 
                  src={listing.image} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Localisation</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {listing.city} • {listing.lat.toFixed(4)}, {listing.lng.toFixed(4)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Publié le</h3>
                <p className="text-muted-foreground">
                  {new Date(listing.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ListingDetail;