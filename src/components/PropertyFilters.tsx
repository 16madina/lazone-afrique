import { useState } from "react";
import { useEffect } from "react";
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
  location: string;
  searchQuery: string;
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}

const PropertyFilters = ({ onFiltersChange, currentFilters }: PropertyFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const defaultFilters: FilterState = {
    type: "",
    propertyType: "",
    priceRange: [0, 1000000000],
    bedrooms: "",
    bathrooms: "",
    surface: [0, 1000],
    features: [],
    location: "",
    searchQuery: ""
  };
  const [filters, setFilters] = useState<FilterState>(currentFilters || defaultFilters);

  // Sync local state with currentFilters prop
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

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
    const newFilters = {
      ...filters,
      features: filters.features.includes(feature)
        ? filters.features.filter(f => f !== feature)
        : [...filters.features, feature]
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: "",
      propertyType: "",
      priceRange: [0, 1000000000],
      bedrooms: "",
      bathrooms: "",
      surface: [0, 1000],
      features: [],
      location: "",
      searchQuery: ""
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value[0] > 0 || value[1] < 1000000000;
    if (key === 'surface') return value[0] > 0 || value[1] < 1000;
    if (key === 'features') return (value as string[]).length > 0;
    if (key === 'location' || key === 'searchQuery') return value !== "";
    return value !== "";
  }).length;

  return (
    <div className="space-y-4">
      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="destructive" 
            onClick={clearFilters} 
            size="sm"
          >
            <X className="w-4 h-4 mr-1" />
            Effacer tous les filtres
          </Button>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              📍 {filters.location}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, location: "" };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {filters.searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              🔍 "{filters.searchQuery}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, searchQuery: "" };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type === 'sale' ? 'Vente' : filters.type === 'rent' ? 'Location' : 'Commercial'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, type: "" };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {filters.propertyType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.propertyType === 'apartment' ? 'Appartement' : 
               filters.propertyType === 'house' ? 'Maison' : 
               filters.propertyType === 'villa' ? 'Villa' : 
               filters.propertyType === 'land' ? 'Terrain' : 
               filters.propertyType === 'commercial' ? 'Commercial' : filters.propertyType}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, propertyType: "" };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {filters.bedrooms && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.bedrooms}+ chambres
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, bedrooms: "" };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {filters.bathrooms && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.bathrooms}+ salles de bain
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, bathrooms: "" };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Prix: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, priceRange: [0, 1000000000] };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
              />
            </Badge>
          )}
          {(filters.surface[0] > 0 || filters.surface[1] < 1000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Surface: {filters.surface[0]}m² - {filters.surface[1]}m²
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  const newFilters = { ...filters, surface: [0, 1000] };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
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

      {/* Filters Content - Always visible in sidebar */}
      <Card>
        <CardContent className="space-y-6 pt-6">
            {/* Transaction Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de transaction</label>
                <Select value={filters.type} onValueChange={(value) => {
                  const newFilters = { ...filters, type: value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}>
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
                <Select value={filters.propertyType} onValueChange={(value) => {
                  const newFilters = { ...filters, propertyType: value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}>
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
                onValueChange={(value) => {
                  const newFilters = { ...filters, priceRange: value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
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
                <Select value={filters.bedrooms} onValueChange={(value) => {
                  const newFilters = { ...filters, bedrooms: value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}>
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
                <Select value={filters.bathrooms} onValueChange={(value) => {
                  const newFilters = { ...filters, bathrooms: value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}>
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
                onValueChange={(value) => {
                  const newFilters = { ...filters, surface: value };
                  setFilters(newFilters);
                  onFiltersChange(newFilters);
                }}
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
    </div>
  );
};

export default PropertyFilters;
export type { FilterState };