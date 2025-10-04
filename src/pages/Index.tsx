import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyFilters, { FilterState } from "@/components/PropertyFilters";
import PropertyCard from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/PropertyCardSkeleton";
import BottomNavigation from "@/components/BottomNavigation";
import { useCountry } from "@/contexts/CountryContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Grid3X3, List, Globe, ChevronLeft, ChevronRight, Filter, Sparkles } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { usePagination } from "@/hooks/usePagination";
import { toast } from "sonner";
import { useSecureProfiles } from "@/hooks/useSecureProfiles";
import { AIRecommendations } from "@/components/AIRecommendations";

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
  status: string;
  user_id?: string;
  created_at: string;
  is_sponsored?: boolean;
  sponsored_until?: string;
  transaction_type?: string;
  property_type?: string;
  surface_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  profiles?: {
    full_name?: string;
    user_type?: string;
    company_name?: string;
    phone?: string;
  };
}

// Import property images
import apartmentImage from "@/assets/property-apartment.jpg";
import houseImage from "@/assets/property-house.jpg";
import landImage from "@/assets/property-land.jpg";

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("date");
  const [properties, setProperties] = useState<Listing[]>([]);
  const [allProperties, setAllProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    type: "",
    propertyType: "",
    priceRange: [0, 1000000000],
    bedrooms: "",
    bathrooms: "",
    surface: [0, 1000],
    features: [],
    location: "",
    searchQuery: ""
  });
  const { selectedCountry, formatPrice } = useCountry();
  const { isFavorite } = useFavorites();
  const { getPublicProfile } = useSecureProfiles();
  
  // Pagination for properties
  const {
    currentItems: paginatedProperties,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({ items: properties, itemsPerPage: 12 });

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Fetch properties for selected country from Supabase with optimized query
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id,
            title,
            price,
            city,
            country_code,
            lat,
            lng,
            image,
            photos,
            status,
            user_id,
            created_at,
            is_sponsored,
            sponsored_until,
            transaction_type,
            property_type,
            surface_area,
            bedrooms,
            bathrooms,
            features
          `)
          .eq('country_code', selectedCountry.code.toUpperCase())
          .eq('status', 'published');

        if (error) {
          toast.error('Erreur lors du chargement des propriétés');
        } else {
          // Optimized: Fetch all profiles in a single query instead of N+1
          const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean))];
          
          let profilesMap: Record<string, any> = {};
          if (userIds.length > 0) {
            const profiles = await Promise.all(
              userIds.map(userId => getPublicProfile(userId))
            );
            
            profiles.forEach((profile, index) => {
              if (profile) {
                profilesMap[userIds[index]] = profile;
              }
            });
          }

          // Attach profiles to listings
          const listingsWithProfiles = (data || []).map(listing => ({
            ...listing,
            profiles: listing.user_id ? profilesMap[listing.user_id] : null
          }));

          // Sort properties to show sponsored ones first
          const sortedProperties = listingsWithProfiles.sort((a, b) => {
            const aSponsored = a.is_sponsored && a.sponsored_until && new Date(a.sponsored_until) > new Date();
            const bSponsored = b.is_sponsored && b.sponsored_until && new Date(b.sponsored_until) > new Date();
            
            if (aSponsored && !bSponsored) return -1;
            if (!aSponsored && bSponsored) return 1;
            
            // If both sponsored or both not sponsored, sort by creation date
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          setAllProperties(sortedProperties);
          setProperties(sortedProperties);
        }
      } catch (err) {
        toast.error('Erreur lors du chargement des propriétés');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedCountry.code, getPublicProfile]);

  // Filter properties based on current filters
  const filterProperties = (properties: Listing[], filters: FilterState) => {
    return properties.filter(property => {
      // Filter by transaction type
      if (filters.type && property.transaction_type !== filters.type) {
        return false;
      }
      
      // Filter by property type
      if (filters.propertyType) {
        if (property.property_type !== filters.propertyType) {
          return false;
        }
      }
      
      // Filter by price range
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }
      
      // Filter by bedrooms
      if (filters.bedrooms) {
        const minBedrooms = parseInt(filters.bedrooms);
        if (property.bedrooms && property.bedrooms < minBedrooms) {
          return false;
        }
      }
      
      // Filter by bathrooms
      if (filters.bathrooms) {
        const minBathrooms = parseInt(filters.bathrooms);
        if (property.bathrooms && property.bathrooms < minBathrooms) {
          return false;
        }
      }
      
      // Filter by surface area
      if (property.surface_area) {
        if (property.surface_area < filters.surface[0] || property.surface_area > filters.surface[1]) {
          return false;
        }
      }
      
      // Filter by features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature => 
          property.features?.includes(feature)
        );
        if (!hasAllFeatures) {
          return false;
        }
      }
      
      // Filter by location (city) - case insensitive
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const cityLower = property.city.toLowerCase();
        if (!cityLower.includes(locationLower)) {
          return false;
        }
      }
      
      // Filter by search query (title and description) - case insensitive
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const titleMatch = property.title.toLowerCase().includes(searchLower);
        const cityMatch = property.city.toLowerCase().includes(searchLower);
        if (!titleMatch && !cityMatch) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Handle filter changes
  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters);
    const filteredProperties = filterProperties(allProperties, filters);
    setProperties(filteredProperties);
  };

  // Handle search from HeroSection
  const handleHeroSearch = (searchFilters: {
    location: string;
    propertyType: string;
    searchQuery: string;
  }) => {
    const newFilters = {
      ...currentFilters,
      location: searchFilters.location,
      propertyType: searchFilters.propertyType,
      searchQuery: searchFilters.searchQuery
    };
    
    setCurrentFilters(newFilters);
    const filteredProperties = filterProperties(allProperties, newFilters);
    setProperties(filteredProperties);
  };

  // Sort properties
  const sortProperties = (properties: Listing[], sortBy: string) => {
    return [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'surface':
          return (b.surface_area || 0) - (a.surface_area || 0);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  // Update properties when sort changes
  useEffect(() => {
    const sortedProperties = sortProperties(properties, sortBy);
    setProperties(sortedProperties);
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection onSearch={handleHeroSearch} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* Filters & Controls */}
        <div className="space-y-4">
          {/* Property Filters and AI Recommendations Tabs */}
          <Tabs defaultValue="filtres" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="filtres" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommandations IA
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="filtres" className="mt-6">
              <PropertyFilters 
                onFiltersChange={handleFiltersChange}
                currentFilters={currentFilters}
              />
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              <AIRecommendations 
                countryCode={selectedCountry.code}
                currentFilters={currentFilters}
              />
            </TabsContent>
          </Tabs>
          
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
                {totalItems > 0 ? (
                  <span>
                    Affichage {startIndex}-{endIndex} de {totalItems} propriétés en {selectedCountry.name}
                  </span>
                ) : (
                  <span>Aucune propriété trouvée en {selectedCountry.name}</span>
                )}
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
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {paginatedProperties.map((property) => {
              // Mémoiser les props de l'agent pour éviter les re-renders
              const profile = property.profiles;
              const agentProps = useMemo(() => ({
                name: profile?.full_name || "Propriétaire",
                type: (profile?.user_type === 'proprietaire' ? 'individual' : 
                       profile?.user_type === 'agence' ? 'agency' : 'broker') as "individual" | "agency" | "broker",
                rating: 4.5,
                verified: true,
                avatar_url: (profile as any)?.avatar_url,
                user_id: property.user_id,
                phone: profile?.phone
              }), [profile?.full_name, profile?.user_type, (profile as any)?.avatar_url, property.user_id, profile?.phone]);
              
              return (
                <PropertyCard 
                  key={property.id} 
                  id={property.id}
                  title={property.title}
                  price={property.price}
                  currencyCode={(property as any).currency_code || (property.country_code === 'CI' ? 'XOF' : 'XOF')}
                  location={`${property.city}, ${getCountryName(property.country_code)}`}
                  type={property.transaction_type === 'rent' ? 'rent' : 'sale'}
                  propertyType={property.property_type as any || "house"}
                  photos={property.photos}
                  image={property.image || "/placeholder.svg"}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  surface={property.surface_area || 120}
                  agent={agentProps}
                  features={property.features || ["Moderne", "Bien situé"]}
                  isSponsored={property.is_sponsored && property.sponsored_until && new Date(property.sponsored_until) > new Date()}
                  isFavorite={isFavorite(property.id)}
                />
              );
            })}
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

        {/* Pagination */}
        {!loading && totalItems > 12 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages} ({totalItems} propriétés)
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  goToPreviousPage();
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                disabled={!hasPreviousPage}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum <= totalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          goToPage(pageNum);
                          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                        }}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  goToNextPage();
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                disabled={!hasNextPage}
                className="flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Load More for smaller screens */}
        {!loading && properties.length > 0 && totalPages > 1 && (
          <div className="text-center sm:hidden">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                goToNextPage();
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              disabled={!hasNextPage}
            >
              {hasNextPage ? 'Voir plus de propriétés' : 'Toutes les propriétés affichées'}
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

// Helper function to get country name
const getCountryName = (countryCode: string) => {
  const countries: { [key: string]: string } = {
    'CI': 'Côte d\'Ivoire',
    'SN': 'Sénégal',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'GH': 'Ghana',
    'NG': 'Nigeria',
    'MA': 'Maroc',
    'TN': 'Tunisie',
    'DZ': 'Algérie',
    'KE': 'Kenya',
    'ZA': 'Afrique du Sud'
  };
  return countries[countryCode] || countryCode;
};

export default Index;