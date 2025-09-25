import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdvancedMapSearchProps {
  onSearchResults: (results: any[]) => void;
  onLocationChange: (lat: number, lng: number, radius: number) => void;
  className?: string;
}

interface SearchFilters {
  propertyTypes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  transactionType: string | null;
  radius: number;
}

export const AdvancedMapSearch = ({ onSearchResults, onLocationChange, className }: AdvancedMapSearchProps) => {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    propertyTypes: [],
    minPrice: null,
    maxPrice: null,
    transactionType: null,
    radius: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'villa', label: 'Villa' },
    { value: 'house', label: 'Maison' },
    { value: 'land', label: 'Terrain' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Bureau' }
  ];

  const handleLocationSearch = async () => {
    if (!location.trim()) return;

    setIsLoading(true);
    try {
      // Geocode the location using Mapbox
      const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
      
      if (!tokenData?.token) {
        throw new Error('Mapbox token not available');
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${tokenData.token}&country=CI,BF,ML,SN,GH,NG,BJ,TG&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCurrentLocation({ lat, lng });
        onLocationChange(lat, lng, filters.radius);
        await performSearch(lat, lng);
      } else {
        toast.error('Lieu non trouvé');
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      toast.error('Erreur lors de la recherche du lieu');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          onLocationChange(latitude, longitude, filters.radius);
          await performSearch(latitude, longitude);
          toast.success('Position actuelle utilisée');
        },
        (error) => {
          console.error('Error getting user location:', error);
          toast.error('Impossible d\'obtenir votre position');
        }
      );
    } else {
      toast.error('Géolocalisation non supportée');
    }
  };

  const performSearch = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_listings_by_location', {
        search_lat: lat,
        search_lng: lng,
        radius_km: filters.radius,
        property_types: filters.propertyTypes.length > 0 ? filters.propertyTypes : null,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        transaction_type_filter: filters.transactionType
      });

      if (error) throw error;

      onSearchResults(data || []);
      toast.success(`${data?.length || 0} propriétés trouvées dans un rayon de ${filters.radius}km`);
    } catch (error) {
      console.error('Error searching listings:', error);
      toast.error('Erreur lors de la recherche');
      onSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (currentLocation) {
      if (key === 'radius') {
        onLocationChange(currentLocation.lat, currentLocation.lng, value);
      }
      performSearch(currentLocation.lat, currentLocation.lng);
    }
  };

  const clearFilters = () => {
    setFilters({
      propertyTypes: [],
      minPrice: null,
      maxPrice: null,
      transactionType: null,
      radius: 10
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherche Géospatiale Avancée
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Entrez une ville, quartier ou adresse..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
            className="flex-1"
          />
          <Button onClick={handleLocationSearch} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={getUserLocation} disabled={isLoading}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* Radius Slider */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rayon de recherche: {filters.radius}km</label>
          <Slider
            value={[filters.radius]}
            onValueChange={(value) => handleFilterChange('radius', value[0])}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Toggle Filters */}
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </Button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            {/* Property Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Types de propriété</label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.propertyTypes.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newTypes = filters.propertyTypes.includes(type.value)
                        ? filters.propertyTypes.filter(t => t !== type.value)
                        : [...filters.propertyTypes, type.value];
                      handleFilterChange('propertyTypes', newTypes);
                    }}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de transaction</label>
              <Select value={filters.transactionType || ''} onValueChange={(value) => handleFilterChange('transactionType', value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="vente">Vente</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Prix min (CFA)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Prix max (CFA)</label>
                <Input
                  type="number"
                  placeholder="Illimité"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>

            <Button variant="outline" onClick={clearFilters} className="w-full">
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Current Location Info */}
        {currentLocation && (
          <div className="text-sm text-muted-foreground">
            Position: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedMapSearch;