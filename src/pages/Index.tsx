import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Grid3X3, List } from "lucide-react";

// Import property images
import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-house.jpg";
import landImage from "@/assets/property-land.jpg";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");

  // Mock property data
  const properties = [
    {
      id: "1",
      title: "Appartement moderne 3 chambres avec vue mer",
      price: "85.000.000 FCFA",
      location: "Cocody, Abidjan",
      type: "sale" as const,
      propertyType: "apartment" as const,
      image: apartmentImage,
      bedrooms: 3,
      bathrooms: 2,
      surface: 120,
      agent: {
        name: "Kouadio Immobilier",
        type: "agency" as const,
        rating: 4.8,
        verified: true
      },
      features: ["Piscine", "Garage", "Climatisation", "Sécurité 24h"],
      isSponsored: true,
      isFavorite: false
    },
    {
      id: "2", 
      title: "Belle villa familiale avec jardin tropical",
      price: "120.000.000 FCFA",
      location: "Marcory, Abidjan",
      type: "sale" as const,
      propertyType: "villa" as const,
      image: houseImage,
      bedrooms: 4,
      bathrooms: 3,
      surface: 200,
      agent: {
        name: "Marie Adjoua",
        type: "individual" as const,
        rating: 4.5,
        verified: true
      },
      features: ["Jardin", "Garage", "Piscine", "Terrasse"],
      isSponsored: false,
      isFavorite: true
    },
    {
      id: "3",
      title: "Terrain constructible bien situé",
      price: "45.000.000 FCFA", 
      location: "Bingerville, Abidjan",
      type: "sale" as const,
      propertyType: "land" as const,
      image: landImage,
      surface: 500,
      agent: {
        name: "Fofana Properties",
        type: "broker" as const,
        rating: 4.3,
        verified: false
      },
      features: ["Titre foncier", "Eau", "Électricité"],
      isSponsored: false,
      isFavorite: false
    },
    {
      id: "4",
      title: "Studio meublé centre-ville",
      price: "250.000 FCFA/mois",
      location: "Plateau, Abidjan",
      type: "rent" as const,
      propertyType: "apartment" as const,
      image: apartmentImage,
      bedrooms: 1,
      bathrooms: 1,
      surface: 35,
      agent: {
        name: "Urban Living",
        type: "agency" as const,
        rating: 4.6,
        verified: true
      },
      features: ["Meublé", "Climatisation", "Internet"],
      isSponsored: false,
      isFavorite: false
    },
    {
      id: "5",
      title: "Maison traditionnelle rénovée",
      price: "180.000 FCFA/mois",
      location: "Treichville, Abidjan",
      type: "rent" as const,
      propertyType: "house" as const,
      image: houseImage,
      bedrooms: 2,
      bathrooms: 1,
      surface: 80,
      agent: {
        name: "Koffi Adjei",
        type: "individual" as const,
        rating: 4.2,
        verified: true
      },
      features: ["Jardin", "Parking"],
      isSponsored: false,
      isFavorite: false
    },
    {
      id: "6",
      title: "Terrain commercial zone industrielle",
      price: "200.000.000 FCFA",
      location: "Zone 4C, Abidjan",
      type: "commercial" as const,
      propertyType: "land" as const,
      image: landImage,
      surface: 2000,
      agent: {
        name: "Business Land Co.",
        type: "agency" as const,
        rating: 4.9,
        verified: true
      },
      features: ["Zone industrielle", "Accès autoroute", "Eau industrielle"],
      isSponsored: true,
      isFavorite: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Propriétés Disponibles</h2>
          <p className="text-muted-foreground">
            Découvrez les meilleures offres immobilières en Afrique
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
              
              <div className="text-sm text-muted-foreground">
                {properties.length} propriétés trouvées
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
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Voir plus de propriétés
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;