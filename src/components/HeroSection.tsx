import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountry } from "@/contexts/CountryContext";
import { Search, MapPin, Filter } from "lucide-react";
import heroImage from "@/assets/hero-african-villa.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const { selectedCountry } = useCountry();

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Trouvez votre
              <span className="block bg-gradient-to-r from-african-gold to-primary bg-clip-text text-transparent">
                Maison Idéale
              </span>
              en {selectedCountry.name}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Découvrez les meilleures opportunités immobilières en {selectedCountry.name}. 
              Prix en {selectedCountry.currency.name} ({selectedCountry.currency.symbol}).
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 shadow-warm max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Localisation</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Ville ou quartier" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCountry.cities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Type de bien</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Appartement, Maison..." />
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

              {/* Search Input */}
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Recherche</label>
                <Input
                  placeholder="Mots-clés..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground opacity-0">Action</label>
                <Button className="w-full h-10 bg-gradient-primary hover:opacity-90 transition-all duration-300">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Recherches populaires en {selectedCountry.name}:</span>
              <Button variant="outline" size="sm" className="text-xs">Villa {selectedCountry.cities[0]}</Button>
              <Button variant="outline" size="sm" className="text-xs">Appartement 2 chambres</Button>
              <Button variant="outline" size="sm" className="text-xs">Terrain constructible</Button>
              <Button variant="outline" size="sm" className="text-xs">Location {selectedCountry.cities[1] || selectedCountry.cities[0]}</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">10K+</div>
              <div className="text-sm text-primary-foreground/80">Propriétés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/80">Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">15</div>
              <div className="text-sm text-primary-foreground/80">Pays</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">95%</div>
              <div className="text-sm text-primary-foreground/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;