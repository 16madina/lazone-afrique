import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon, LatLngBounds } from "leaflet";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter, Locate, Layers, Navigation, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import "leaflet/dist/leaflet.css";

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  city: string;
  country_code: string;
  image: string | null;
}

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { selectedCountry, formatPrice } = useCountry();

  // Africa bounds: [south, west, north, east]
  const africaBounds = new LatLngBounds([-40, -20], [55, 50]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .eq('country_code', selectedCountry.code)
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCountry.code]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: `country_code=eq.${selectedCountry.code}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchListings(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCountry.code]);

  const createCustomPin = (listing: Listing) => {
    const formattedPrice = formatPrice(listing.price);
    return divIcon({
      html: `
        <div class="bg-primary text-primary-foreground px-2 py-1 rounded-lg shadow-warm text-xs font-semibold whitespace-nowrap border-2 border-background">
          ${formattedPrice}
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [80, 30],
      iconAnchor: [40, 30],
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 relative animate-fade-in">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-card space-y-3">
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

        {/* Leaflet Map */}
        <MapContainer
          bounds={africaBounds}
          className="w-full h-full z-0"
          style={{ height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={createCustomPin(listing)}
            >
              <Popup className="custom-popup">
                <div className="w-64 p-2">
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {listing.image ? (
                        <img 
                          src={listing.image} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MapPin className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{listing.title}</h4>
                      <p className="text-primary font-bold text-sm">{formatPrice(listing.price)}</p>
                      <p className="text-muted-foreground text-xs">{listing.city}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir l'annonce
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-primary animate-pulse" />
              <p className="text-muted-foreground">Chargement des annonces...</p>
            </div>
          </div>
        )}

        {/* Stats Legend */}
        <div className="absolute bottom-24 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-card">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{listings.length} annonces</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>{selectedCountry.name}</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Map;