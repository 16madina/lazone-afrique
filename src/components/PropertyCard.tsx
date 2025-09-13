import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCountry } from "@/contexts/CountryContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Heart, Bed, Bath, Square, Phone, MessageCircle, Star } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  priceUSD: number; // Price in USD for conversion
  location: string;
  type: "sale" | "rent" | "commercial";
  propertyType: "apartment" | "house" | "villa" | "land" | "commercial";
  image: string;
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
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
          }`}
          onClick={(e) => e.stopPropagation()}
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