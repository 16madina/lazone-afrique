import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountry } from "@/contexts/CountryContext";
import { Search, MapPin, Filter, Star, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-african-villa.jpg";
import propertyHouse from "@/assets/property-house.jpg";
import propertyApartment from "@/assets/property-apartment.jpg";
import propertyLand from "@/assets/property-land.jpg";
import mainLogo from "@/assets/main-logo.png";
import lazoneTextLogo from "@/assets/lazone-text-logo.png";
import SponsorshipDialog from "@/components/SponsorshipDialog";

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
  const { selectedCountry, formatPrice } = useCountry();

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
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden animate-fade-in">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/50 to-transparent" />
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
                  className="w-64 h-32 md:w-96 md:h-48 object-contain mt-4 -ml-12"
                />
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-fredoka text-primary-foreground font-semibold leading-tight">
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
              <h3 className="text-xl font-display font-semibold text-primary-foreground text-center">
                🌟 Annonces Sponsorisées
              </h3>
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
                  <Button variant="default" className="bg-gradient-primary hover:opacity-90 transition-all duration-200 active:scale-95 shadow-elevation-3">
                    <Star className="w-4 h-4 mr-2" />
                    Voir tarifs & sponsoriser
                  </Button>
                </SponsorshipDialog>
                <div className="text-xs text-primary-foreground/70 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Packages à partir de 15$ - Boost 3 à 30 jours
                </div>
              </div>
            </div>
          ) : (
            /* Fallback content when no sponsored listings */
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary-foreground text-center">
                🌟 Annonces Sponsorisées
              </h3>
              <div className="text-center space-y-3">
                <p className="text-primary-foreground/80">Aucune annonce sponsorisée pour le moment</p>
                <SponsorshipDialog listingId="demo">
                  <Button variant="default" className="bg-gradient-primary hover:opacity-90">
                    <Star className="w-4 h-4 mr-2" />
                    Voir tarifs & sponsoriser
                  </Button>
                </SponsorshipDialog>
                <div className="text-xs text-primary-foreground/70 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Packages à partir de 15$ - Boost 3 à 30 jours
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