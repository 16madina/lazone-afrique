import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCountry } from "@/contexts/CountryContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Heart, Bed, Bath, Square, Phone, MessageCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  priceUSD: number; // Price in USD for conversion
  location: string;
  type: "sale" | "rent" | "commercial";
  propertyType: "apartment" | "house" | "villa" | "land" | "commercial";
  image?: string; // Maintenir pour compatibilité
  photos?: string[] | null; // Nouveau champ pour les photos
  bedrooms?: number;
  bathrooms?: number;
  surface: number;
  agent: {
    name: string;
    type: "individual" | "agency" | "broker";
    rating: number;
    verified: boolean;
  };
  features: string[];
  isSponsored?: boolean;
  isFavorite?: boolean;
}

const PropertyCard = ({ 
  id,
  title, 
  priceUSD, 
  location, 
  type, 
  propertyType, 
  image, 
  photos,
  bedrooms, 
  bathrooms, 
  surface, 
  agent, 
  features,
  isSponsored = false,
  isFavorite = false
}: PropertyCardProps) => {
  const { formatLocalPrice, selectedCountry } = useCountry();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fonction pour obtenir toutes les images disponibles
  const getAllImages = () => {
    const images: string[] = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      images.push(...photos);
    }
    if (image && !images.includes(image)) {
      images.push(image);
    }
    return images.length > 0 ? images : ["/placeholder.svg"];
  };

  const allImages = getAllImages();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleCardClick = () => {
    // Vérifier que l'ID est un UUID valide (format Supabase)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      navigate(`/listing/${id}`);
    } else {
      console.warn('ID invalide détecté:', id);
    }
  };
  const typeColors = {
    sale: "bg-accent text-accent-foreground",
    rent: "bg-primary text-primary-foreground", 
    commercial: "bg-secondary text-secondary-foreground"
  };

  const typeLabels = {
    sale: "Vente",
    rent: "Location",
    commercial: "Commercial"
  };

  const propertyTypeLabels = {
    apartment: "Appartement",
    house: "Maison",
    villa: "Villa", 
    land: "Terrain",
    commercial: "Commercial"
  };

  const agentTypeLabels = {
    individual: "Particulier",
    agency: "Agence",
    broker: "Courtier"
  };

  return (
    <Card 
      className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-gradient-card cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="relative w-full h-full">
          <img 
            src={allImages[currentImageIndex]} 
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Navigation arrows - only show if multiple images */}
          {allImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-110' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    onClick={(e) => goToImage(index, e)}
                  />
                ))}
              </div>
              
              {/* Image counter */}
              <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium z-10">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            </>
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
          {isSponsored && (
            <Badge variant="secondary" className="bg-african-gold text-foreground">
              ⭐ Sponsorisé
            </Badge>
          )}
        </div>

        {/* Favorite */}
        <Button 
          size="icon" 
          variant="ghost" 
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 hover:bg-background ${
            isFavorite ? 'text-destructive' : 'text-muted-foreground'
          } z-20`}
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: isSponsored ? '4.5rem' : '0' }}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title & Price */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-primary">{formatLocalPrice(priceUSD)}</p>
              {type === "rent" && (
                <span className="text-sm text-muted-foreground">/mois</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {propertyTypeLabels[propertyType]}
              </span>
              <Badge variant="outline" className="text-xs">
                {selectedCountry.currency.code}
              </Badge>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Property Details */}
        {propertyType !== "land" && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{bedrooms}</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{surface}m²</span>
            </div>
          </div>
        )}

        {propertyType === "land" && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Square className="w-4 h-4" />
            <span>{surface}m² de terrain</span>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{features.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{agent.name.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{agent.name}</span>
                {agent.verified && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {agentTypeLabels[agent.type]}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-african-gold" />
                  <span className="text-xs">{agent.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;