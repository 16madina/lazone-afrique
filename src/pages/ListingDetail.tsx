import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Calendar, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ListingData {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  image: string | null;
  city: string;
  country_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'published')
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError("Annonce non trouvée");
          return;
        }

        setListing(data);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setError("Erreur lors du chargement de l'annonce");
        toast.error("Impossible de charger l'annonce");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'CI': 'Côte d\'Ivoire',
      'SN': 'Sénégal',
      'ML': 'Mali',
      'BF': 'Burkina Faso',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'MA': 'Maroc',
      'TN': 'Tunisie',
      'DZ': 'Algérie',
      'KE': 'Kenya',
      'ZA': 'Afrique du Sud'
    };
    return countries[countryCode] || countryCode;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Annonce non trouvée</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  onClick={() => navigate('/')}
                  className="mt-4"
                >
                  Retour à l'accueil
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          {/* Image principale */}
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={listing.image || 'https://via.placeholder.com/800x400?text=Pas+d%27image'} 
                alt={listing.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-background/80">
                  {listing.status === 'published' ? 'Publié' : listing.status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Informations principales */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{listing.city}, {getCountryName(listing.country_code)}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Publié le {formatDate(listing.created_at)}</span>
                {listing.updated_at !== listing.created_at && (
                  <span className="ml-4">• Modifié le {formatDate(listing.updated_at)}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Localisation</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{listing.city}, {getCountryName(listing.country_code)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Coordonnées: {listing.lat.toFixed(6)}, {listing.lng.toFixed(6)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions de contact */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contacter le vendeur</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Envoyer un message
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Contactez directement le vendeur pour plus d'informations ou pour organiser une visite.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ListingDetail;