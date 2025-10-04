import { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useCountry } from "@/contexts/CountryContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Heart, Bed, Bath, Square, Phone, MessageCircle, Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useContactActions } from "@/hooks/useContactActions";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number; // Prix dans la devise locale
  priceUSD?: number; // Prix en USD pour les paiements (optionnel)
  currencyCode?: string; // Code de la devise (XOF, GNF, etc.)
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
    avatar_url?: string;
    user_id?: string;
    phone?: string;
  };
  features: string[];
  isSponsored?: boolean;
  isFavorite?: boolean;
}

const PropertyCard = memo(({ 
  id,
  title, 
  price, 
  currencyCode,
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
  const { formatPrice, selectedCountry } = useCountry();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite: isInFavorites, loading: favLoading } = useFavorites();
  const { handlePhoneContact, handleMessageContact, loading: contactLoading } = useContactActions();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(id);
  };

  // Fonction optimisée pour obtenir toutes les images disponibles
  const getAllImages = () => {
    const images: string[] = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      // Limiter le nombre d'images pour optimiser les performances
      images.push(...photos.slice(0, 5));
    }
    if (image && !images.includes(image) && image !== "/placeholder.svg") {
      images.unshift(image); // Mettre l'image principale en premier
    }
    // Utiliser un SVG data URI comme fallback
    const placeholderSvg = `data:image/svg+xml,%3csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='400' height='300' fill='%23f3f4f6'/%3e%3crect x='50' y='50' width='300' height='200' fill='%23e5e7eb' stroke='%23d1d5db' stroke-width='2' rx='8'/%3e%3ccircle cx='120' cy='110' r='20' fill='%23d1d5db'/%3e%3cpath d='M80 180 L120 140 L160 180 L200 140 L240 160 L280 120 L320 140 L320 200 L80 200 Z' fill='%23d1d5db'/%3e%3c/svg%3e`;
    return images.length > 0 ? images : [placeholderSvg];
  };

  const allImages = getAllImages();

  const handleCardClick = () => {
    // Vérifier que l'ID est un UUID valide (format Supabase)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      navigate(`/listing/${id}`);
    } else {
      console.warn('ID invalide détecté:', id);
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePhoneContact(agent.phone, agent.name);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (agent.user_id) {
      handleMessageContact(agent.user_id, id, title, agent.name);
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
      {/* Image Carousel optimisé */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {allImages.map((imgSrc, index) => (
              <CarouselItem key={index}>
                <div className="relative w-full h-full bg-muted">
                  <img 
                    src={imgSrc} 
                    alt={`${title} - Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      // Éviter la boucle infinie en vérifiant l'URL actuelle
                      const currentSrc = e.currentTarget.src;
                      if (!currentSrc.includes('placeholder.svg') && !currentSrc.includes('data:image/svg')) {
                        e.currentTarget.src = '/placeholder.svg';
                        e.currentTarget.onerror = null; // Désactiver pour éviter boucle
                      }
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
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
          className={`absolute top-3 left-3 w-8 h-8 rounded-full bg-background/80 hover:bg-background ${
            isInFavorites(id) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
          } z-20 transition-colors`}
          onClick={handleFavoriteClick}
          disabled={favLoading}
        >
          <Heart className={`w-4 h-4 ${isInFavorites(id) ? 'fill-current' : ''}`} />
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
              <p className="text-2xl font-bold text-primary">{formatPrice(price, currencyCode)}</p>
              {type === "rent" && (
                <span className="text-sm text-muted-foreground">/mois</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {propertyTypeLabels[propertyType]}
              </span>
              <Badge variant="outline" className="text-xs">
                {currencyCode || selectedCountry.currency.code}
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

        {/* Features optimisées */}
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

        {/* Agent Info avec avatar optimisé */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              {agent.avatar_url && (
                <AvatarImage src={agent.avatar_url} alt={agent.name} />
              )}
              <AvatarFallback className="text-sm font-medium">
                {agent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
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
              onClick={handlePhoneClick}
              disabled={contactLoading || !agent.phone}
              title={agent.phone ? `Appeler ${agent.name}` : 'Numéro non disponible'}
            >
              <Phone className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-2"
              onClick={handleMessageClick}
              disabled={contactLoading || !agent.user_id}
              title={agent.user_id ? `Envoyer un message à ${agent.name}` : 'Contact non disponible'}
            >
              <MessageCircle className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;