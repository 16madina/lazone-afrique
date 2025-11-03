import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Home } from "lucide-react";
import { useCountry } from "@/contexts/CountryContext";

interface SelectedListing {
  id: string;
  title: string;
  price: number;
  city: string;
  lat: number;
  lng: number;
}

interface MapSelectionOverlayProps {
  selectedListings: SelectedListing[];
  onClose: () => void;
  onViewListing: (id: string) => void;
}

const MapSelectionOverlay = ({
  selectedListings,
  onClose,
  onViewListing
}: MapSelectionOverlayProps) => {
  const { formatPrice } = useCountry();

  if (selectedListings.length === 0) return null;

  return (
    <Card className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 glass shadow-elevation-5 animate-slide-up">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Propriétés sélectionnées</h3>
            <Badge variant="secondary">{selectedListings.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {selectedListings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => onViewListing(listing.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {listing.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{listing.city}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prix moyen</span>
            <span className="font-semibold">
              {formatPrice(
                selectedListings.reduce((sum, l) => sum + l.price, 0) / selectedListings.length
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MapSelectionOverlay;
