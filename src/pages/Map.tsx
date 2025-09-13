import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon, LatLngBounds } from 'leaflet';
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter, Locate, Layers, Navigation, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

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

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const { selectedCountry, formatPrice } = useCountry();
  const navigate = useNavigate();

  // Africa bounds: [south, west, north, east]
  const africaBounds = new LatLngBounds([-40, -20], [55, 50]);

  // Fetch listings from Supabase
  useEffect(() => {
    fetchListings();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings'
        },
        () => {
          console.log('Listings updated, refetching...');
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCountry]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .eq('country_code', selectedCountry.code)
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      setListings(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Create custom marker icon with price
  const createCustomIcon = (price: number) => {
    const formattedPrice = formatPrice(price);
    return new DivIcon({
      className: 'custom-div-icon',
      html: `
        <div style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; border: 2px solid hsl(var(--background)); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${formattedPrice}
        </div>
      `,
      iconSize: [80, 30],
      iconAnchor: [40, 30],
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      
      <main className="flex-1 relative animate-fade-in overflow-hidden">
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
        <div className="w-full h-full">
          <MapContainer 
            center={[0, 20]}
            zoom={3}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {listings.map((listing) => (
              <Marker
                key={listing.id}
                position={[listing.lat, listing.lng]}
                icon={createCustomIcon(listing.price)}
              >
                <Popup maxWidth={300} minWidth={250}>
                  <div className="p-2">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        {listing.image && (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                              src={listing.image} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-6 h-6 text-blue-600">🏠</div>';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{listing.title}</h4>
                          <p className="text-blue-600 font-bold text-sm">{formatPrice(listing.price)}</p>
                          <p className="text-gray-600 text-xs">{listing.city}</p>
                        </div>
                      </div>
                      
                      <button 
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Voir l'annonce
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Listings Counter */}
        <div className="absolute bottom-24 right-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{listings.length} annonce{listings.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-card">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Propriétés</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Prix en {selectedCountry.currency.symbol}
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Map;