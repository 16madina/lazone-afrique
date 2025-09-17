import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountry } from "@/contexts/CountryContext";
import { Search, MapPin, Filter, Star, Info } from "lucide-react";
import heroImage from "@/assets/hero-african-villa.jpg";
import propertyHouse from "@/assets/property-house.jpg";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertyLand from "@/assets/property-land.jpg";
import mainLogo from "@/assets/main-logo.png";
import lazoneTextLogo from "@/assets/lazone-text-logo.png";
import SponsorshipDialog from "@/components/SponsorshipDialog";

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
          {/* Hero Logo */}
          <div className="flex justify-start items-center space-y-4">
            <div className="flex flex-col items-start max-w-4xl">
              <div className="flex items-center gap-0">
                <img 
                  src={mainLogo} 
                  alt="Logo principal"
                  className="w-32 h-32 md:w-48 md:h-48 object-contain"
                />
                <img 
                  src={lazoneTextLogo} 
                  alt="LaZone"
                  className="w-64 h-32 md:w-96 md:h-48 object-contain mt-4 -ml-4"
                />
              </div>
              <p className="text-lg md:text-xl text-primary-foreground/90 mt-4 text-left">
                Découvrez les meilleures opportunités immobilières en {selectedCountry.name}. 
                Prix en {selectedCountry.currency.name} ({selectedCountry.currency.symbol}).
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-2 shadow-warm max-w-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
              {/* Location */}
              <div className="space-y-1">
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
              <div className="space-y-1">
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
              <div className="space-y-1 md:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Recherche</label>
                <Input
                  placeholder="Mots-clés..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Search Button */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground opacity-0">Action</label>
                <Button className="w-full h-10 bg-gradient-primary hover:opacity-90 transition-all duration-300">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Recherche populaire:</span>
              <Button variant="outline" size="sm" className="text-xs">Villa {selectedCountry.cities[0]}</Button>
            </div>
          </div>

          {/* Featured Sponsored Properties */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary-foreground text-center">
              🌟 Annonces Sponsorisées
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto">
              {/* Demo Sponsored Property 1 */}
              <div className="bg-background/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-warm hover:scale-105 transition-transform duration-300">
                <div className="relative h-32 w-full">
                  <img 
                    src={propertyHouse} 
                    alt="Villa moderne Cocody"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ Sponsorisé
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-xs mb-1">Villa Moderne Cocody</h4>
                  <p className="text-xs text-muted-foreground mb-2">Cocody, Abidjan</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-xs">85M FCFA</span>
                    <span className="text-xs text-muted-foreground">4ch • 3sdb</span>
                  </div>
                </div>
              </div>

              {/* Demo Sponsored Property 2 */}
              <div className="bg-background/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-warm hover:scale-105 transition-transform duration-300">
                <div className="relative h-32 w-full">
                  <img 
                    src={propertyApartment} 
                    alt="Appartement Plateau"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ Sponsorisé
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-xs mb-1">Appartement Haut Standing</h4>
                  <p className="text-xs text-muted-foreground mb-2">Plateau, Abidjan</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-xs">45M FCFA</span>
                    <span className="text-xs text-muted-foreground">3ch • 2sdb</span>
                  </div>
                </div>
              </div>

              {/* Demo Sponsored Property 3 */}
              <div className="bg-background/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-warm hover:scale-105 transition-transform duration-300">
                <div className="relative h-32 w-full">
                  <img 
                    src={propertyLand} 
                    alt="Terrain Bingerville"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ Sponsorisé
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-xs mb-1">Terrain Titre Foncier</h4>
                  <p className="text-xs text-muted-foreground mb-2">Bingerville</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-xs">25M FCFA</span>
                    <span className="text-xs text-muted-foreground">500m²</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button variant="outline" className="bg-background/80 hover:bg-background text-foreground border-2">
                  Voir toutes les annonces sponsorisées
                </Button>
                <SponsorshipDialog listingId="demo">
                  <Button variant="default" className="bg-gradient-primary hover:opacity-90">
                    <Star className="w-4 h-4 mr-2" />
                    Voir tarifs & sponsoriser
                  </Button>
                </SponsorshipDialog>
              </div>
              <div className="text-xs text-primary-foreground/70 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                Packages à partir de 15$ - Boost 3 à 30 jours
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;