import React, { useState, useEffect, useRef } from 'react';
import { useCountry } from '@/contexts/CountryContext';
import { supabase } from '@/integrations/supabase/client';
import EnhancedHeader from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import PropertyFilters, { FilterState } from '@/components/PropertyFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';
import { toast } from 'sonner';

export interface MapListing {
  id: string;
  title: string;
  price: number;
  city: string;
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
  
  const { selectedCountry } = useCountry();

  // Fetch listings from Supabase
  useEffect(() => {
    const fetchListings = async () => {
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
            photos,
            transaction_type,
            property_type,
            bedrooms,
            bathrooms,
            surface_area,
            is_sponsored
          `)
          .eq('status', 'published')
          .eq('country_code', selectedCountry.code)
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setListings(data || []);
        setFilteredListings(data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
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
        l.city?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Search query filter
    if (filters.searchQuery) {
      filtered = filtered.filter(l =>
        l.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        l.city?.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  }, [filters, listings]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    try {
      // Get Mapbox token
      const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
      if (!tokenData?.token) {
        toast.error('Erreur de configuration de la carte');
        return;
      }

      // Geocode the city
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchCity)}.json?access_token=${tokenData.token}&country=${selectedCountry.code}&types=place,locality`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCityCoords({ lng, lat });
        toast.success(`Ville trouvée: ${data.features[0].place_name}`);
      } else {
        toast.error('Ville introuvable');
      }
    } catch (error) {
      console.error('Error geocoding city:', error);
      toast.error('Erreur lors de la recherche de la ville');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <EnhancedHeader />
      
      <main className="flex-1 pt-16 md:pt-20">
        {/* Search and Filters Bar */}
        <div className="sticky top-16 md:top-20 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            {/* City Search Bar */}
            <form onSubmit={handleCitySearch} className="mb-3">
              <div className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher une ville..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" size="sm">
                  Rechercher
                </Button>
              </div>
            </form>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
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
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[calc(100vh-10rem)] md:h-[calc(100vh-11rem)]">
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
