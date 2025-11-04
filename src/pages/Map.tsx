import React, { useState, useEffect, useRef } from 'react';
import { useCountry } from '@/contexts/CountryContext';
import { supabase } from '@/integrations/supabase/client';
import EnhancedHeader from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import CountrySelector from '@/components/CountrySelector';
import PropertyFilters, { FilterState } from '@/components/PropertyFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface MapListing {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood?: string | null;
  country_code: string;
  lat: number;
  lng: number;
  photos?: string[] | null;
  transaction_type?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  surface_area?: number;
  is_sponsored?: boolean;
}

const Map = () => {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [cityCoords, setCityCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: "",
    propertyType: "",
    priceRange: [0, 1000000000],
    bedrooms: "",
    bathrooms: "",
    surface: [0, 1000],
    features: [],
    location: "",
    searchQuery: ""
  });
  
  const { selectedCountry, setSelectedCountry, countries } = useCountry();
  const { user } = useAuth();

  // Initialize country based on user's profile
  useEffect(() => {
    const loadUserCountry = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.country) {
          // Find matching country in the countries list
          const userCountry = countries.find(c => 
            c.name.toLowerCase() === profile.country.toLowerCase() ||
            c.code.toLowerCase() === profile.country.toLowerCase()
          );
          
          if (userCountry && userCountry.code !== selectedCountry.code) {
            setSelectedCountry(userCountry);
            console.log('🌍 Pays de l\'utilisateur détecté:', userCountry.name);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du pays de l\'utilisateur:', error);
      }
    };

    loadUserCountry();
  }, [user, countries]);

  // Fetch listings from Supabase
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const countryCodeUpper = selectedCountry.code.toUpperCase();
      console.log('🔍 Fetching listings for country:', countryCodeUpper, selectedCountry.name);
      try {
        // Build query
        let query = supabase
          .from('listings')
          .select(`
            id,
            title,
            price,
            city,
            neighborhood,
            country_code,
            lat,
            lng,
            photos,
            transaction_type,
            property_type,
            bedrooms,
            bathrooms,
            surface_area,
            is_sponsored
          `)
          .eq('status', 'published')
          .not('lat', 'is', null)
          .not('lng', 'is', null);
        
        // Only filter by country if not International
        if (countryCodeUpper !== 'INT') {
          query = query.eq('country_code', countryCodeUpper);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        
        console.log(`✅ Found ${data?.length || 0} listings for ${selectedCountry.name}:`, data);
        setListings(data || []);
        setFilteredListings(data || []);
      } catch (error) {
        console.error('❌ Error fetching listings:', error);
        toast.error('Erreur lors du chargement des annonces');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedCountry]);

  // Apply filters to listings
  useEffect(() => {
    let filtered = [...listings];

    // Transaction type filter
    if (filters.type) {
      filtered = filtered.filter(l => l.transaction_type === filters.type);
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(l => l.property_type === filters.propertyType);
    }

    // Price range filter
    filtered = filtered.filter(
      l => l.price >= filters.priceRange[0] && l.price <= filters.priceRange[1]
    );

    // Bedrooms filter
    if (filters.bedrooms) {
      const bedroomsNum = parseInt(filters.bedrooms);
      filtered = filtered.filter(l => l.bedrooms && l.bedrooms >= bedroomsNum);
    }

    // Bathrooms filter
    if (filters.bathrooms) {
      const bathroomsNum = parseInt(filters.bathrooms);
      filtered = filtered.filter(l => l.bathrooms && l.bathrooms >= bathroomsNum);
    }

    // Surface area filter (only apply if user has changed from default)
    if (filters.surface[0] > 0 || filters.surface[1] < 1000) {
      filtered = filtered.filter(
        l => l.surface_area && l.surface_area >= filters.surface[0] && l.surface_area <= filters.surface[1]
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(l => 
        l.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        l.neighborhood?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(l =>
        l.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.city?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.neighborhood?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  }, [filters, listings]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim() && !searchNeighborhood.trim()) {
      toast.error('Veuillez entrer un nom de ville ou quartier');
      return;
    }

    try {
      // Prioritize neighborhood over city for better precision
      const searchLocation = searchNeighborhood.trim() || searchCity.trim();
      console.log('🔍 Recherche de localisation:', searchLocation);
      
      // Use our geocode-city edge function which has local database of neighborhoods
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-city', {
        body: { 
          city: searchLocation,
          countryCode: selectedCountry.code 
        }
      });
      
      if (geocodeError) {
        console.error('❌ Erreur geocoding:', geocodeError);
        toast.error('Erreur lors de la recherche');
        return;
      }
      
      if (geocodeData && geocodeData.lat && geocodeData.lng) {
        console.log('✅ Localisation trouvée:', {
          location: searchLocation,
          coords: { lat: geocodeData.lat, lng: geocodeData.lng },
          source: geocodeData.source,
          foundExact: geocodeData.foundExact
        });
        
        setCityCoords({ lng: geocodeData.lng, lat: geocodeData.lat });
        
        const sourceText = geocodeData.source === 'database' ? '(base locale)' : 
                          geocodeData.source === 'mapbox' ? '(Mapbox)' : '(approximatif)';
        toast.success(`Localisation trouvée: ${searchLocation} ${sourceText}`);
      } else {
        console.warn('❌ Aucune localisation trouvée pour:', searchLocation);
        toast.error(`Aucune localisation trouvée pour "${searchLocation}"`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche de la ville');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <EnhancedHeader />
      
      <main className="flex-1">
        {/* Search and Filters Bar - Compact Version */}
        <div className="sticky top-16 md:top-20 z-40 bg-background border-b border-border shadow-sm">
          <div className="w-full px-3 py-2">
            {/* Location Search Bar */}
            <form onSubmit={handleCitySearch} className="mb-2">
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Ville ou quartier..."
                    value={searchNeighborhood || searchCity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchNeighborhood(value);
                      setSearchCity(value);
                    }}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <Button type="submit" size="sm" className="h-9 px-3 shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3 shrink-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85%] sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtres de recherche</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <PropertyFilters 
                        onFiltersChange={handleFilterChange}
                        currentFilters={filters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </form>

            {/* Results Count */}
            <div className="text-xs text-muted-foreground">
              {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[calc(100vh-12rem)] md:h-[calc(100vh-13rem)]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Chargement de la carte...</p>
              </div>
            </div>
          ) : (
            <MapboxMap listings={filteredListings} cityCoords={cityCoords} />
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Map;
