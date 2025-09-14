import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import BottomNavigation from "@/components/BottomNavigation";
import { useCountry } from "@/contexts/CountryContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Grid3X3, List, Globe } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  country_code: string;
  lat: number;
  lng: number;
  image?: string;
  photos?: string[] | null;
  status: string;
  user_id?: string;
  is_sponsored?: boolean;
  sponsored_until?: string;
  transaction_type?: string;
  profiles?: {
    full_name?: string;
    user_type?: string;
    company_name?: string;
  };
}

// Import property images
import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-house.jpg";
import landImage from "@/assets/property-land.jpg";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCountry, formatPrice } = useCountry();

  // Fetch properties for selected country from Supabase
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id,
            title,
            price,
            city,
            country_code,
            lat,
            lng,
            image,
            photos,
            status,
            user_id,
            created_at,
            is_sponsored,
            sponsored_until,
            transaction_type
          `)
          .eq('country_code', selectedCountry.code.toUpperCase())
          .eq('status', 'published');

        if (error) {
          console.error('Erreur lors du chargement des propriétés:', error);
        } else {
          // Récupérer les profils pour chaque listing
          const listingsWithProfiles = await Promise.all((data || []).map(async (listing) => {
            if (listing.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, user_type, company_name')
                .eq('user_id', listing.user_id)
                .single();
              
              return {
                ...listing,
                profiles: profile
              };
            }
            return listing;
          }));
          
          // Sort properties to show sponsored ones first
          const sortedProperties = listingsWithProfiles.sort((a, b) => {
            const aSponsored = a.is_sponsored && a.sponsored_until && new Date(a.sponsored_until) > new Date();
            const bSponsored = b.is_sponsored && b.sponsored_until && new Date(b.sponsored_until) > new Date();
            
            if (aSponsored && !bSponsored) return -1;
            if (!aSponsored && bSponsored) return 1;
            
            // If both sponsored or both not sponsored, sort by creation date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          setProperties(sortedProperties);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedCountry.code]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-bold">Propriétés en {selectedCountry.name}</h2>
            <Badge className="bg-gradient-primary text-primary-foreground">
              {selectedCountry.flag} {selectedCountry.currency.name}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Découvrez les meilleures offres immobilières en {selectedCountry.name}
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="space-y-4">
          <PropertyFilters />
          
          {/* Sort & View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récent</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="surface">Surface</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="w-3 h-3" />
                {properties.length} propriétés trouvées en {selectedCountry.name}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted h-48 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {properties.map((property) => {
              const profile = property.profiles;
              const agentName = profile?.full_name || "Propriétaire";
              const agentType = profile?.user_type === 'proprietaire' ? 'individual' : 
                              profile?.user_type === 'agence' ? 'agency' : 'broker';
              
              return (
                <PropertyCard 
                  key={property.id} 
                  id={property.id}
                  title={property.title}
                  priceUSD={property.price}
                  location={`${property.city}, ${getCountryName(property.country_code)}`}
                  type={property.transaction_type === 'rent' ? 'rent' : 'sale'}
                  propertyType="house"
                  photos={property.photos}
                  image={property.image || "/placeholder.svg"}
                  surface={120}
                  agent={{
                    name: agentName,
                    type: agentType,
                    rating: 4.5,
                    verified: true
                  }}
                  features={["Moderne", "Bien situé"]}
                  isSponsored={property.is_sponsored && property.sponsored_until && new Date(property.sponsored_until) > new Date()}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 animate-fade-in">
            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Aucune propriété disponible en {selectedCountry.name}
            </h3>
            <p className="text-muted-foreground mb-4">
              Nous travaillons à ajouter des propriétés dans ce pays. 
              Revenez bientôt ou sélectionnez un autre pays.
            </p>
            <Badge variant="outline" className="mb-4">
              Pays disponibles: Côte d'Ivoire, Guinée, Sénégal, Maroc, Nigeria, Ghana, Kenya, Afrique du Sud
            </Badge>
          </div>
        )}

        {/* Load More */}
        {!loading && properties.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Voir plus de propriétés en {selectedCountry.name}
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

// Helper function to get country name
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

export default Index;