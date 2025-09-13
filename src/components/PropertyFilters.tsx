import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, SlidersHorizontal } from "lucide-react";

interface FilterState {
  type: string;
  propertyType: string;
  priceRange: number[];
  bedrooms: string;
  bathrooms: string;
  surface: number[];
  features: string[];
}

const PropertyFilters = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: "",
    propertyType: "",
    priceRange: [0, 1000000000],
    bedrooms: "",
    bathrooms: "",
    surface: [0, 1000],
    features: []
  });

  const availableFeatures = [
    "Piscine", "Garage", "Jardin", "Climatisation", "Sécurité 24h",
    "Balcon", "Terrasse", "Cave", "Ascenseur", "Parking"
  ];

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K FCFA`;
    }
    return `${value} FCFA`;
  };

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      propertyType: "",
      priceRange: [0, 1000000000],
      bedrooms: "",
      bathrooms: "",
      surface: [0, 1000],
      features: []
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value[0] > 0 || value[1] < 1000000000;
    if (key === 'surface') return value[0] > 0 || value[1] < 1000;
    if (key === 'features') return (value as string[]).length > 0;
    return value !== "";
  }).length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Effacer tout
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, type: "" }))}
              />
            </Badge>
          )}
          {filters.propertyType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.propertyType}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, propertyType: "" }))}
              />
            </Badge>
          )}
          {filters.features.map(feature => (
            <Badge key={feature} variant="secondary" className="flex items-center gap-1">
              {feature}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleFeature(feature)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Expanded Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de transaction</label>
                <Select value={filters.type} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Vente</SelectItem>
                    <SelectItem value="rent">Location</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type de bien</label>
                <Select value={filters.propertyType} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, propertyType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="house">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Terrain</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Gamme de prix</label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                max={1000000000}
                min={0}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(filters.priceRange[0])}</span>
                <span>{formatPrice(filters.priceRange[1])}</span>
              </div>
            </div>

            {/* Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chambres</label>
                <Select value={filters.bedrooms} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, bedrooms: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Indifférent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Salles de bain</label>
                <Select value={filters.bathrooms} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, bathrooms: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Indifférent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Surface */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Surface (m²)</label>
              <Slider
                value={filters.surface}
                onValueChange={(value) => setFilters(prev => ({ ...prev, surface: value }))}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.surface[0]}m²</span>
                <span>{filters.surface[1]}m²</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Commodités</label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map(feature => (
                  <Button
                    key={feature}
                    variant={filters.features.includes(feature) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFeature(feature)}
                    className="text-xs"
                  >
                    {feature}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertyFilters;