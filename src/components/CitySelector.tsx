import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountry } from '@/contexts/CountryContext';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  onGeolocation?: () => void;
  isGeolocating?: boolean;
}

const CitySelector: React.FC<CitySelectorProps> = ({ 
  value, 
  onChange, 
  onGeolocation,
  isGeolocating = false 
}) => {
  const { selectedCountry } = useCountry();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);

  // Update search value when prop value changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Filter cities based on search input
  const filteredCities = selectedCountry.cities.filter(city =>
    city.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (city: string) => {
    // Validation : vérifier si la ville appartient vraiment au pays sélectionné
    const isValidCity = selectedCountry.cities.includes(city);
    if (!isValidCity) {
      // Afficher une alerte pour les villes personnalisées
      console.warn(`Ville "${city}" ajoutée pour ${selectedCountry.name} - Vérification requise`);
    }
    
    onChange(city);
    setSearchValue(city);
    setOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    onChange(inputValue);
  };

  return (
    <div className="space-y-2">
      <Label>Localisation</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  placeholder="Tapez votre ville..."
                  value={searchValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => setOpen(true)}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setOpen(!open)}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    open && "transform rotate-180"
                  )} />
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder={`Rechercher dans ${selectedCountry.name}...`}
                  value={searchValue}
                  onValueChange={handleInputChange}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Aucune ville trouvée pour "{searchValue}"
                      </p>
                      <p className="text-xs text-yellow-600 mb-2">
                        ⚠️ Attention : Assurez-vous que cette ville appartient à {selectedCountry.name}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleSelect(searchValue);
                        }}
                        className="text-xs"
                      >
                        Utiliser "{searchValue}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup heading="Villes suggérées">
                    {filteredCities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => handleSelect(city)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === city ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {searchValue && !filteredCities.includes(searchValue) && (
                    <CommandGroup heading="Ajouter une nouvelle ville">
                      <CommandItem
                        value={searchValue}
                        onSelect={() => handleSelect(searchValue)}
                        className="cursor-pointer border-t bg-yellow-50 hover:bg-yellow-100"
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        <div className="flex flex-col">
                          <span>Ajouter "{searchValue}"</span>
                          <span className="text-xs text-yellow-600">⚠️ Vérifiez que cette ville est en {selectedCountry.name}</span>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {onGeolocation && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onGeolocation}
            disabled={isGeolocating}
            title="Utiliser ma position actuelle"
          >
            {isGeolocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CitySelector;