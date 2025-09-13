import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import BottomNavigation from "@/components/BottomNavigation";
import { useCountry } from "@/contexts/CountryContext";
import { getPropertiesByCountry } from "@/data/mockProperties";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Grid3X3, List, Globe } from "lucide-react";

// Import property images
import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-house.jpg";
import landImage from "@/assets/property-land.jpg";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const { selectedCountry, formatPrice } = useCountry();

  // Get properties for selected country
  const properties = getPropertiesByCountry(selectedCountry.code);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-bold">Propriétés en {selectedCountry.name}</h2>
            <Badge className="bg-gradient-primary text-primary-foreground">
              {selectedCountry.flag} {selectedCountry.currency.name}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Découvrez les meilleures offres immobilières en {selectedCountry.name}
          </p>
        </div>

        {/* Filters & Controls */}
        <div className="space-y-4">
          <PropertyFilters />
          
          {/* Sort & View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récent</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="surface">Surface</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="w-3 h-3" />
                {properties.length} propriétés trouvées en {selectedCountry.name}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {properties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 animate-fade-in">
            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Aucune propriété disponible en {selectedCountry.name}
            </h3>
            <p className="text-muted-foreground mb-4">
              Nous travaillons à ajouter des propriétés dans ce pays. 
              Revenez bientôt ou sélectionnez un autre pays.
            </p>
            <Badge variant="outline" className="mb-4">
              Pays disponibles: Côte d'Ivoire, Guinée, Sénégal, Maroc, Nigeria, Ghana, Kenya, Afrique du Sud
            </Badge>
          </div>
        )}

        {/* Load More */}
        {properties.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Voir plus de propriétés en {selectedCountry.name}
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;