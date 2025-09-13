import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter, Locate, Layers, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapAfrica } from "@/components/MapAfrica";

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  status: string;
  image: string | null;
  city: string;
  country_code: string;
}


// Simple header without context
const SimpleHeader = () => (
  <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">L</span>
        </div>
        <span className="font-bold text-xl text-teal-700">LaZone</span>
      </div>
    </div>
  </header>
);

// Simple bottom nav without context
const SimpleBottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
    <div className="flex justify-around items-center h-16 px-4">
      <div className="text-center">
        <MapPin className="w-5 h-5 mx-auto text-primary" />
        <span className="text-xs mt-1 text-primary">Carte</span>
      </div>
    </div>
  </nav>
);

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);

  console.log("Map component rendering, listings count:", listings.length);

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
      <SimpleHeader />
      
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
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

        {/* Map Africa avec les marqueurs de prix */}
        <div className="w-full h-full">
          <MapAfrica listings={listings} />
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

      <SimpleBottomNav />
    </div>
  );
};

export default Map;