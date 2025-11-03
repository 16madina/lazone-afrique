import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Heart, Camera, Eye } from "lucide-react";
import { useCountry } from '@/contexts/CountryContext';

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  status: string;
  image: string | null;
  photos: string[] | null;
  city: string;
  country_code: string;
  transaction_type: string | null;
  bedrooms?: number;
  bathrooms?: number;
}

interface MapListingsListProps {
  listings: Listing[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onViewDetails: (id: string) => void;
  onClose: () => void;
}

const MapListingsList: React.FC<MapListingsListProps> = ({
  listings,
  currentIndex,
  onIndexChange,
  onViewDetails,
  onClose
}) => {
  const { formatPrice } = useCountry();
  const listing = listings[currentIndex];

  if (!listing) return null;

  const firstImage = listing.image || (listing.photos && listing.photos[0]) || null;
  const totalListings = listings.length;
  const hasVirtualTour = listing.photos && listing.photos.length > 5;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalListings - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const handleFirst = () => {
    onIndexChange(0);
  };

  const handleLast = () => {
    onIndexChange(totalListings - 1);
  };

  return (
    <Card className="w-[360px] shadow-elevation-3 border-0 overflow-hidden animate-slide-up">
      <CardContent className="p-0 relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background z-10"
          onClick={onClose}
        >
          ✕
        </Button>

        {/* Image */}
        <div className="relative h-48 bg-muted">
          {firstImage ? (
            <img 
              src={firstImage} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Virtual Tour Badge */}
          {hasVirtualTour && (
            <Badge 
              className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm hover:bg-primary"
            >
              <Eye className="w-3 h-3 mr-1" />
              Visites virtuelles
            </Badge>
          )}

          {/* Photo Count Badge */}
          {listing.photos && listing.photos.length > 0 && (
            <Badge 
              variant="secondary"
              className="absolute top-3 right-12 bg-background/90 backdrop-blur-sm"
            >
              <Camera className="w-3 h-3 mr-1" />
              {listing.photos.length}
            </Badge>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm hover:bg-background rounded-full h-9 w-9"
            onClick={(e) => {
              e.stopPropagation();
              // Toggle favorite logic here
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          {/* Price */}
          <div className="text-2xl font-bold">
            {formatPrice(listing.price, (listing as any).currency_code)}
          </div>

          {/* Title */}
          <div className="font-semibold text-base line-clamp-2">
            {listing.title}
          </div>

          {/* Location */}
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            📍 {listing.city}
          </div>

          {/* Property Info */}
          {(listing.bedrooms || listing.bathrooms) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {listing.bedrooms && (
                <div className="flex items-center gap-1">
                  🛏️ {listing.bedrooms}
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center gap-1">
                  🚿 {listing.bathrooms}
                </div>
              )}
            </div>
          )}

          {/* Transaction Type Badge */}
          {listing.transaction_type && (
            <Badge variant="outline" className="capitalize">
              {listing.transaction_type === 'sale' ? 'Vente' : 'Location'}
            </Badge>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFirst}
              disabled={currentIndex === 0}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm font-medium">
            {currentIndex + 1} / {totalListings}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNext}
              disabled={currentIndex === totalListings - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLast}
              disabled={currentIndex === totalListings - 1}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapListingsList;
