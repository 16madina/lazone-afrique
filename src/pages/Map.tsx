import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter, Locate, Layers, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import MapboxMap from "@/components/MapboxMap";
import { useCountry } from "@/contexts/CountryContext";

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  status: string;
  image: string | null;
  photos: string[] | null;
  city: string;
  country_code: string;
}



const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { selectedCountry } = useCountry();

  console.log("Map component rendering, listings count:", listings.length);

  // Filtrer les villes en fonction de la recherche
  const filteredCities = selectedCountry.cities.filter(city =>
    city.toLowerCase().startsWith(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleCitySelect = (city: string) => {
    setSearchQuery(city);
    setShowSuggestions(false);
  };

  // Fetch listings from Supabase
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .limit(20); // Limit to 20 for performance

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      setListings(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 relative animate-fade-in overflow-hidden">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une zone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
                
                {/* Suggestions de villes */}
                {showSuggestions && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                    {filteredCities.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => handleCitySelect(city)}
                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{city}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{selectedCountry.flag}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Locate className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border animate-slide-up">
                <Button variant="outline" size="sm">Vente</Button>
                <Button variant="outline" size="sm">Location</Button>
                <Button variant="outline" size="sm">Appartements</Button>
                <Button variant="outline" size="sm">Maisons</Button>
              </div>
            )}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur-sm">
            <Layers className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-background/95 backdrop-blur-sm">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Carte Mapbox avec les marqueurs de prix */}
        <div className="w-full h-full">
          <MapboxMap listings={listings} />
        </div>

        {/* Listings Counter */}
        <div className="absolute bottom-24 right-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{listings.length} annonce{listings.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Propriétés</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Prix en FCFA
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Map;