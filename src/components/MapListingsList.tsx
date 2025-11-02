import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { useCountry } from "@/contexts/CountryContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  country_code: string;
  lat: number;
  lng: number;
  image?: string;
  photos?: string[] | null;
  transaction_type?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  surface_area?: number;
}

interface MapListingsListProps {
  listings: Listing[];
  onListingHover?: (listingId: string | null) => void;
  onListingClick?: (listing: Listing) => void;
}

export const MapListingsList = ({ listings, onListingHover, onListingClick }: MapListingsListProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCountry();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const getListingImage = (listing: Listing) => {
    if (listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0) {
      return listing.photos[0];
    }
    if (listing.image && listing.image !== '/placeholder.svg' && !listing.image.includes('placeholder')) {
      return listing.image;
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format';
  };

  const handleFavoriteClick = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      return;
    }
    await toggleFavorite(listingId);
  };

  const handleListingClick = (listing: Listing) => {
    if (onListingClick) {
      onListingClick(listing);
    } else {
      navigate(`/listing/${listing.id}`);
    }
  };

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <MapPin className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Aucune annonce trouv?e</p>
        <p className="text-sm">Modifiez vos filtres pour voir plus de r?sultats</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-4">
      {listings.map((listing) => (
        <Card
          key={listing.id}
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          onClick={() => handleListingClick(listing)}
          onMouseEnter={() => onListingHover?.(listing.id)}
          onMouseLeave={() => onListingHover?.(null)}
        >
          <CardContent className="p-0">
            <div className="flex gap-3">
              {/* Image */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <img
                  src={getListingImage(listing)}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Badge Type Transaction */}
                <Badge 
                  className="absolute top-2 left-2 text-xs"
                  variant={listing.transaction_type === 'sale' ? 'default' : 'secondary'}
                >
                  {listing.transaction_type === 'sale' ? 'Vente' : 'Location'}
                </Badge>

                {/* Bouton Favori */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => handleFavoriteClick(e, listing.id)}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite(listing.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              </div>

              {/* Informations */}
              <div className="flex-1 py-3 pr-3 min-w-0">
                {/* Prix */}
                <div className="text-lg font-bold text-primary mb-1">
                  {formatPrice(listing.price)}
                </div>

                {/* Titre */}
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                  {listing.title}
                </h3>

                {/* Localisation */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{listing.city}</span>
                </div>

                {/* Caract?ristiques */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {listing.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      <span>{listing.bedrooms}</span>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      <span>{listing.bathrooms}</span>
                    </div>
                  )}
                  {listing.surface_area && (
                    <div className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      <span>{listing.surface_area}m?</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MapListingsList;
