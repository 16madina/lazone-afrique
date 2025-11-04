import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountry } from "@/contexts/CountryContext";
import { Search, MapPin, Filter, Star, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroBg1 from "@/assets/hero-bg-1.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.jpg";
import heroBg4 from "@/assets/hero-bg-4.jpg";
import heroBg5 from "@/assets/hero-bg-5.jpg";
import heroBg6 from "@/assets/hero-bg-6.jpg";
import heroBg7 from "@/assets/hero-bg-7.jpg";
import heroBg8 from "@/assets/hero-bg-8.jpg";
import heroBg9 from "@/assets/hero-bg-9.jpg";
import heroBg10 from "@/assets/hero-bg-10.jpg";
import propertyHouse from "@/assets/property-house.jpg";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertyLand from "@/assets/property-land.jpg";
import mainLogo from "@/assets/main-logo.png";
import lazoneTextLogo from "@/assets/lazone-text-logo.png";
import SponsorshipDialog from "@/components/SponsorshipDialog";

// Images de fond qui changent à chaque visite
const heroBackgrounds = [
  heroBg1,
  heroBg2,
  heroBg3,
  heroBg4,
  heroBg5,
  heroBg6,
  heroBg7,
  heroBg8,
  heroBg9,
  heroBg10
];

interface HeroSectionProps {
  onSearch?: (filters: {
    location: string;
    propertyType: string;
    searchQuery: string;
  }) => void;
}

interface SponsoredListing {
  id: string;
  title: string;
  price: number;
  city: string;
  image?: string;
  photos?: string[];
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [transactionType, setTransactionType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [sponsoredListings, setSponsoredListings] = useState<SponsoredListing[]>([]);
  const [currentHeroImage, setCurrentHeroImage] = useState("");
  const { selectedCountry, formatPrice } = useCountry();

  // Sélectionner une image aléatoire au chargement
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroBackgrounds.length);
    setCurrentHeroImage(heroBackgrounds[randomIndex]);
  }, []);

  // Progressive form state
  const showPropertyType = transactionType !== "";
  const showLocation = propertyType !== "";
  const showSearchButton = location !== "";

  // Fetch sponsored listings
  useEffect(() => {
    const fetchSponsoredListings = async () => {
      try {
        console.log('🔍 Fetching sponsored listings for country:', selectedCountry.code);
        
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id,
            title,
            price,
            city,
            image,
            photos,
            bedrooms,
            bathrooms,
            property_type,
            is_sponsored,
            sponsored_until
          `)
          .eq('country_code', selectedCountry.code.toUpperCase())
          .eq('status', 'published')
          .eq('is_sponsored', true)
          .not('sponsored_until', 'is', null)
          .order('sponsored_at', { ascending: false })
          .limit(3);

        console.log('📊 Sponsored listings query result:', { data, error });

        if (error) {
          console.error('Error fetching sponsored listings:', error);
          return;
        }

        // Filter active sponsorships
        const now = new Date();
        const activeSponsored = (data || []).filter(listing => {
          const sponsoredUntil = new Date(listing.sponsored_until);
          const isActive = sponsoredUntil > now;
          console.log(`📅 Listing ${listing.title}: sponsored until ${listing.sponsored_until}, active: ${isActive}`);
          return isActive;
        });

        console.log('✅ Active sponsored listings:', activeSponsored.length);
        setSponsoredListings(activeSponsored);
      } catch (error) {
        console.error('Error fetching sponsored listings:', error);
      }
    };

    fetchSponsoredListings();
  }, [selectedCountry.code]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        location,
        propertyType,
        searchQuery: ""
      });
    }
  };

  const getPropertyImage = (listing: SponsoredListing) => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos[0];
    }
    if (listing.image) {
      return listing.image;
    }
    // Default images based on property type
    switch (listing.property_type) {
      case 'appartement':
        return propertyApartment;
      case 'terrain':
        return propertyLand;
      default:
        return propertyHouse;
    }
  };

  return (
    <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden animate-fade-in pt-4 pb-6">
      {/* Background Image with Overlay - Opacité augmentée pour meilleure lisibilité */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${currentHeroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Hero Logo - Centré avec ombre pour visibilité */}
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center max-w-4xl">
              <div className="flex items-center gap-0 drop-shadow-2xl">
                <img 
                  src={mainLogo} 
                  alt="Logo principal"
                  className="w-16 h-16 md:w-24 md:h-24 object-contain"
                />
                <img 
                  src={lazoneTextLogo} 
                  alt="LaZone"
                  className="w-32 h-16 md:w-48 md:h-24 object-contain mt-2 -ml-4"
                />
              </div>
              <div className="text-center mt-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <p className="text-sm md:text-lg font-fredoka text-white font-semibold leading-tight drop-shadow-lg">
                  Trouve ton chez toi dans ta Zone
                </p>
              </div>
            </div>
          </div>

          {/* Progressive Search Form */}
          <div className="glass-card rounded-2xl p-3 shadow-elevation-4 max-w-xl mx-auto animate-slide-up">
            <div className="space-y-3">
              {/* Step 1: Transaction Type (Always visible) */}
              <div className="space-y-1 animate-fade-in">
                <label className="text-sm font-medium text-muted-foreground">Type de transaction</label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Achat ou Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Achat</SelectItem>
                    <SelectItem value="rent">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Property Type (Shown after transaction type) */}
              {showPropertyType && (
                <div className="space-y-1 animate-slide-up">
                  <label className="text-sm font-medium text-muted-foreground">Type de bien</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Maison, Appartement, Villa..." />
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
              )}

              {/* Step 3: Location (Shown after property type) */}
              {showLocation && (
                <div className="space-y-1 animate-slide-up">
                  <label className="text-sm font-medium text-muted-foreground">Localisation</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-12">
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
              )}

              {/* Step 4: Search Button (Shown after location) */}
              {showSearchButton && (
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all duration-300 active:scale-95 shadow-elevation-2 animate-slide-up"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground font-display">Recherche populaire:</span>
              <Button variant="outline" size="sm" className="text-xs hover:bg-accent/50 transition-all duration-200 active:scale-95">Villa {selectedCountry.cities[0]}</Button>
            </div>
          </div>

          {/* Featured Sponsored Properties */}
          {sponsoredListings.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full inline-block mx-auto">
                <h3 className="text-xl md:text-2xl font-display font-bold text-white text-center drop-shadow-lg">
                  🌟 Annonces Sponsorisées
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto">
                {sponsoredListings.map((listing) => (
                  <div 
                    key={listing.id}
                    className="glass-card rounded-2xl overflow-hidden shadow-elevation-3 hover:scale-105 hover:shadow-elevation-4 transition-all duration-300 cursor-pointer active:scale-100"
                    onClick={() => window.location.href = `/listing/${listing.id}`}
                  >
                    <div className="relative h-32 w-full">
                      <img 
                        src={getPropertyImage(listing)}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ⭐ Sponsorisé
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-display font-semibold text-xs mb-1 truncate">{listing.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{listing.city}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary text-xs">{formatPrice(listing.price)}</span>
                        {listing.bedrooms && listing.bathrooms && (
                          <span className="text-xs text-muted-foreground">
                            {listing.bedrooms}ch • {listing.bathrooms}sdb
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
               <div className="text-center space-y-3">
                <SponsorshipDialog listingId="demo">
                  <Button variant="default" className="bg-gradient-primary hover:opacity-90 transition-all duration-200 active:scale-95 shadow-elevation-3 text-base">
                    <Star className="w-5 h-5 mr-2" />
                    Voir tarifs & sponsoriser
                  </Button>
                </SponsorshipDialog>
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full inline-flex items-center gap-2 text-white">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Packages à partir de 15$ - Boost 3 à 30 jours</span>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback content when no sponsored listings */
            <div className="space-y-4">
              <div className="bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full inline-block mx-auto">
                <h3 className="text-xl md:text-2xl font-display font-bold text-white text-center drop-shadow-lg">
                  🌟 Annonces Sponsorisées
                </h3>
              </div>
              <div className="text-center space-y-3">
                <div className="bg-black/30 backdrop-blur-sm px-6 py-3 rounded-2xl inline-block">
                  <p className="text-white font-medium">Aucune annonce sponsorisée pour le moment</p>
                </div>
                <SponsorshipDialog listingId="demo">
                  <Button variant="default" className="bg-gradient-primary hover:opacity-90 text-base">
                    <Star className="w-5 h-5 mr-2" />
                    Voir tarifs & sponsoriser
                  </Button>
                </SponsorshipDialog>
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full inline-flex items-center gap-2 text-white">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Packages à partir de 15$ - Boost 3 à 30 jours</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;