import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Filter, Locate, Layers, Navigation, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

// Composant de carte inspiré de l'image de référence
const RealEstateMap = ({ listings }: { listings: Listing[] }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace('.0', '')}M`;
    } else if (price >= 1000) {
      return `${Math.round(price / 1000)}K`;
    }
    return price.toString();
  };

  // Positions simulées pour les marqueurs (basées sur l'image de référence)
  const mockPositions = [
    { top: '25%', left: '60%', price: 399000, color: 'bg-blue-600' },
    { top: '35%', left: '55%', price: 369000, color: 'bg-blue-700' },
    { top: '45%', left: '65%', price: 399000, color: 'bg-blue-600' },
    { top: '55%', left: '50%', price: 449000, color: 'bg-blue-800' },
    { top: '70%', left: '35%', price: 300000, color: 'bg-purple-500' },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-50 overflow-hidden">
      {/* Fond de carte stylisé */}
      <div className="absolute inset-0 bg-green-50">
        {/* Routes simulées */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 transform -rotate-12"></div>
        <div className="absolute top-3/4 left-1/4 right-0 h-1 bg-gray-400 transform rotate-45"></div>
        
        {/* Zones d'eau */}
        <div className="absolute top-1/4 right-1/4 w-20 h-16 bg-blue-200 rounded-lg opacity-50"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-12 bg-blue-200 rounded-lg opacity-50"></div>
      </div>

      {/* Marqueurs de prix */}
      {mockPositions.map((marker, index) => (
        <div
          key={index}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${marker.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform`}
          style={{ top: marker.top, left: marker.left }}
        >
          {formatPrice(marker.price)}
          {/* Petite pointe du marqueur */}
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent ${marker.color.replace('bg-', 'border-t-')}`}></div>
        </div>
      ))}

      {/* Marqueur de localisation */}
      <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <div className="w-4 h-4 bg-white rounded-full"></div>
      </div>

      {/* Contrôles de la carte (côté droit) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="outline" size="icon" className="bg-white shadow-lg">
          <div className="w-4 h-4 border-2 border-gray-600"></div>
        </Button>
        <Button variant="outline" size="icon" className="bg-white shadow-lg">
          <Layers className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white shadow-lg">
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Carte de propriété en bas */}
      {listings.length > 0 && (
        <Card className="absolute bottom-4 left-4 right-4 shadow-lg">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <img
                src={listings[0].image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=150&h=100&fit=crop"}
                alt={listings[0].title}
                className="w-20 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-bold text-blue-700">
                      {listings[0].price.toLocaleString()} FCFA
                    </div>
                    <div className="text-sm text-gray-600">Maison à vendre</div>
                    <div className="text-xs text-gray-500">{listings[0].city}</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// En-tête simple inspiré de l'image
const MapHeader = ({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) => (
  <header className="bg-white border-b border-gray-200">
    <div className="px-4 py-3">
      {/* Barre de recherche */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
        <Input
          placeholder="Montérégie + 1 autre"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-2 border-0 bg-gray-100 rounded-full"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Filter className="w-4 h-4 text-blue-600" />
          </Button>
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            2
          </div>
        </div>
      </div>
      
      {/* Onglets */}
      <div className="flex gap-6">
        <div className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
          Carte
        </div>
        <div className="text-gray-500">
          Liste
        </div>
        <div className="ml-auto text-sm text-gray-600">
          5 propriétés
        </div>
      </div>
    </div>
  </header>
);

// Navigation du bas
const MapBottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div className="flex justify-around items-center h-16 px-4">
      <div className="text-center">
        <Search className="w-6 h-6 mx-auto text-blue-600" />
        <span className="text-xs mt-1 text-blue-600">Rechercher</span>
      </div>
      <div className="text-center">
        <Heart className="w-6 h-6 mx-auto text-gray-400" />
        <span className="text-xs mt-1 text-gray-400">Favoris</span>
      </div>
      <div className="text-center">
        <Navigation className="w-6 h-6 mx-auto text-gray-400" />
        <span className="text-xs mt-1 text-gray-400">Explorer</span>
      </div>
      <div className="text-center">
        <div className="w-6 h-6 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded"></div>
        <span className="text-xs mt-1 text-gray-400">Compte</span>
      </div>
    </div>
  </nav>
);

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("Montérégie + 1 autre");
  const [listings, setListings] = useState<Listing[]>([]);

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
        .limit(20);

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
    <div className="flex flex-col h-screen bg-gray-50">
      <MapHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="flex-1 relative">
        <RealEstateMap listings={listings} />
        
        {/* Bouton de sauvegarde de recherche */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <Button className="bg-white text-gray-700 shadow-lg border border-gray-200 rounded-full px-6 py-2">
            <Search className="w-4 h-4 mr-2" />
            Sauvegarder recherche
          </Button>
        </div>
      </main>

      <MapBottomNav />
    </div>
  );
};

export default Map;