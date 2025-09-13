import { useState } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Locate, Layers, Navigation } from "lucide-react";

const Map = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState("standard");
  const [showFilters, setShowFilters] = useState(false);

  // Mock properties data with coordinates
  const properties = [
    {
      id: "1",
      title: "Villa moderne Cocody",
      price: "85M FCFA",
      type: "sale",
      coordinates: { lat: 5.3364, lng: -4.0267 },
      image: "/placeholder.svg"
    },
    {
      id: "2", 
      title: "Appartement Marcory",
      price: "250K FCFA/mois",
      type: "rent",
      coordinates: { lat: 5.2669, lng: -4.0131 },
      image: "/placeholder.svg"
    },
    {
      id: "3",
      title: "Terrain Bingerville", 
      price: "45M FCFA",
      type: "sale",
      coordinates: { lat: 5.3553, lng: -3.8947 },
      image: "/placeholder.svg"
    }
  ];

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

        {/* Map Placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-border/20" />
              ))}
            </div>
          </div>

          {/* Mock Map Content */}
          <div className="relative z-10 text-center space-y-4">
            <MapPin className="w-16 h-16 mx-auto text-primary animate-bounce-in" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Carte Interactive</h3>
              <p className="text-muted-foreground max-w-sm">
                Explorez les propriétés disponibles sur la carte d'Abidjan
              </p>
            </div>

            {/* Mock Property Pins */}
            <div className="absolute inset-0 pointer-events-none">
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className={`
                    absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce-in
                    ${index === 0 ? 'top-1/3 left-1/3' : ''}
                    ${index === 1 ? 'top-2/3 left-2/3' : ''}
                    ${index === 2 ? 'top-1/2 right-1/4' : ''}
                  `}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-warm cursor-pointer hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Cards Overlay */}
        <div className="absolute bottom-20 left-0 right-0 z-10 p-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {properties.map((property) => (
              <Card key={property.id} className="min-w-[280px] bg-background/95 backdrop-blur-sm animate-slide-up">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                      <p className="text-primary font-bold text-sm">{property.price}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${
                          property.type === 'sale' 
                            ? 'text-accent border-accent' 
                            : 'text-primary border-primary'
                        }`}
                      >
                        {property.type === 'sale' ? 'Vente' : 'Location'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-24 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-card">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span>Vente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span>Commercial</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Map;