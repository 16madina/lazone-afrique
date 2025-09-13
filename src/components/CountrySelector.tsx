import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountry } from "@/contexts/CountryContext";
import { Globe, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CountrySelector = () => {
  const { selectedCountry, setSelectedCountry, countries } = useCountry();
  const [open, setOpen] = useState(false);

  const handleCountrySelect = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex items-center space-x-4">
        <Select 
          value={selectedCountry.code} 
          onValueChange={handleCountrySelect}
        >
          <SelectTrigger className="w-[200px]">
            <Globe className="w-4 h-4 mr-2" />
            <span className="mr-2">{selectedCountry.flag}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2 w-full">
                  <span>{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {country.currency.symbol}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Version */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden flex items-center gap-2 h-auto p-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium">{selectedCountry.name}</span>
              <Badge variant="outline" className="text-xs h-4">
                {selectedCountry.currency.code}
              </Badge>
            </div>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Choisir un pays
            </SheetTitle>
            <SheetDescription>
              Sélectionnez votre pays pour voir les propriétés et prix locaux
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid grid-cols-1 gap-3 mt-6 max-h-[40vh] overflow-y-auto">
            {countries.map((country) => (
              <Button
                key={country.code}
                variant={selectedCountry.code === country.code ? "default" : "outline"}
                onClick={() => handleCountrySelect(country.code)}
                className="justify-start h-auto p-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">{country.name}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{country.currency.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {country.currency.symbol}
                      </Badge>
                    </div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <Badge className="bg-accent text-accent-foreground">
                      ✓ Actuel
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CountrySelector;