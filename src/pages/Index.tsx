import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PropertyFilters, { FilterState } from "@/components/PropertyFilters";
import PerformanceOptimizedPropertyCard from "@/components/PerformanceOptimizedPropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import BottomNavigation from "@/components/BottomNavigation";
import Footer from "@/components/Footer";
import { useCountry } from "@/contexts/CountryContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Grid3X3, List, Globe, Filter, Sparkles } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAutoInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";
import { useSecureProfiles } from "@/hooks/useSecureProfiles";
import { AIRecommendations } from "@/components/AIRecommendations";
import { LoadMoreButton } from "@/components/PaginationMetadata";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  
  // Infinite scroll for properties
  const {
    displayedItems: displayedProperties,
    hasMore,
    isLoading: isLoadingMore,
    loadMore,
    sentinelRef,
    loadedItems,
    totalItems
  } = useAutoInfiniteScroll({ items: properties, itemsPerPage: 12 });

  // Fetch properties for selected country from Supabase
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
          // Récupérer les profils pour chaque listing
          const listingsWithProfiles = await Promise.all((data || []).map(async (listing) => {
            if (listing.user_id) {
              const profile = await getPublicProfile(listing.user_id);
              
              return {
                ...listing,
                profiles: profile
              };
            }
            return listing;
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
  }, [selectedCountry.code]);

  // Filter properties based on current filters
  const filterProperties = (properties: Listing[], filters: FilterState) => {
    console.log('🔍 Début du filtrage:', { 
      totalProperties: properties.length, 
      filters,
      sampleProperty: properties[0] ? {
        city: properties[0].city,
        property_type: properties[0].property_type,
        transaction_type: properties[0].transaction_type
      } : 'aucune propriété'
    });

    return properties.filter(property => {
      // Filter by transaction type
      if (filters.type && property.transaction_type !== filters.type) {
        console.log('❌ Filtré par transaction type:', property.title, property.transaction_type, 'vs', filters.type);
        return false;
      }
      
      // Filter by property type
      if (filters.propertyType) {
        if (property.property_type !== filters.propertyType) {
          console.log('❌ Filtré par property type:', property.title, property.property_type, 'vs', filters.propertyType);
          return false;
        }
      }
      
      // Filter by price range
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        console.log('❌ Filtré par prix:', property.title, property.price);
        return false;
      }
      
      // Filter by bedrooms
      if (filters.bedrooms) {
        const minBedrooms = parseInt(filters.bedrooms);
        if (property.bedrooms && property.bedrooms < minBedrooms) {
          console.log('❌ Filtré par chambres:', property.title, property.bedrooms, 'vs', minBedrooms);
          return false;
        }
      }
      
      // Filter by bathrooms
      if (filters.bathrooms) {
        const minBathrooms = parseInt(filters.bathrooms);
        if (property.bathrooms && property.bathrooms < minBathrooms) {
          console.log('❌ Filtré par salles de bain:', property.title, property.bathrooms, 'vs', minBathrooms);
          return false;
        }
      }
      
      // Filter by surface area
      if (property.surface_area) {
        if (property.surface_area < filters.surface[0] || property.surface_area > filters.surface[1]) {
          console.log('❌ Filtré par surface:', property.title, property.surface_area);
          return false;
        }
      }
      
      // Filter by features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature => 
          property.features?.includes(feature)
        );
        if (!hasAllFeatures) {
          console.log('❌ Filtré par features:', property.title);
          return false;
        }
      }
      
      // Filter by location (city) - case insensitive
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        const cityLower = property.city.toLowerCase();
        if (!cityLower.includes(locationLower)) {
          console.log('❌ Filtré par localisation:', property.title, property.city, 'vs', filters.location);
          return false;
        }
      }
      
      // Filter by search query (title and description) - case insensitive
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const titleMatch = property.title.toLowerCase().includes(searchLower);
        const cityMatch = property.city.toLowerCase().includes(searchLower);
        if (!titleMatch && !cityMatch) {
          console.log('❌ Filtré par recherche:', property.title, 'recherche:', filters.searchQuery);
          return false;
        }
      }
      
      console.log('✅ Propriété acceptée:', property.title);
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
    console.log('🔍 Recherche depuis HeroSection:', searchFilters);
    
    const newFilters = {
      ...currentFilters,
      location: searchFilters.location,
      propertyType: searchFilters.propertyType,
      searchQuery: searchFilters.searchQuery
    };
    
    console.log('📋 Nouveaux filtres:', newFilters);
    console.log('🏠 Propriétés avant filtrage:', allProperties.length);
    
    setCurrentFilters(newFilters);
    const filteredProperties = filterProperties(allProperties, newFilters);
    
    console.log('🏠 Propriétés après filtrage:', filteredProperties.length);
    console.log('🏠 Propriétés filtrées:', filteredProperties.map(p => ({ 
      title: p.title, 
      city: p.city, 
      propertyType: p.property_type, 
      transactionType: p.transaction_type 
    })));
    
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
      <main className="container mx-auto px-4 pt-20 pb-8 space-y-8">

        {/* Filters & Controls */}
        <div className="space-y-4">
          {/* Filter Button and AI Recommendations */}
          <div className="flex items-center gap-4">
            {/* Filters Sheet Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtres
                  {Object.entries(currentFilters).filter(([key, value]) => {
                    if (key === 'priceRange') return value[0] > 0 || value[1] < 1000000000;
                    if (key === 'surface') return value[0] > 0 || value[1] < 1000;
                    if (key === 'features') return (value as string[]).length > 0;
                    if (key === 'location' || key === 'searchQuery') return value !== "";
                    return value !== "";
                  }).length > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {Object.entries(currentFilters).filter(([key, value]) => {
                        if (key === 'priceRange') return value[0] > 0 || value[1] < 1000000000;
                        if (key === 'surface') return value[0] > 0 || value[1] < 1000;
                        if (key === 'features') return (value as string[]).length > 0;
                        if (key === 'location' || key === 'searchQuery') return value !== "";
                        return value !== "";
                      }).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtres de recherche</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6">
                  <PropertyFilters 
                    onFiltersChange={handleFiltersChange}
                    currentFilters={currentFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* AI Recommendations Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Recommandations IA
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Recommandations IA</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6">
                  <AIRecommendations 
                    countryCode={selectedCountry.code}
                    currentFilters={currentFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
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
                    {totalItems} propriétés disponibles en {selectedCountry.name}
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

        {/* Pagination Metadata - Hidden as requested */}

        {/* Properties Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {displayedProperties.map((property) => {
                const profile = property.profiles;
                const agentName = profile?.full_name || "Propriétaire";
                const agentType = profile?.user_type === 'proprietaire' ? 'individual' : 
                                profile?.user_type === 'agence' ? 'agency' : 'broker';
                
                return (
                  <PerformanceOptimizedPropertyCard 
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
                    agent={{
                      name: agentName,
                      type: agentType,  
                      rating: 4.5,
                      verified: true,
                      avatar_url: (profile as any)?.avatar_url,
                      user_id: property.user_id,
                      phone: profile?.phone
                    }}
                    features={property.features || ["Moderne", "Bien situé"]}
                    isSponsored={property.is_sponsored && property.sponsored_until && new Date(property.sponsored_until) > new Date()}
                    isFavorite={isFavorite(property.id)}
                  />
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-20 flex items-center justify-center">
              {isLoadingMore && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Chargement des annonces...</p>
                </div>
              )}
            </div>

            {/* Manual Load More Button (Mobile Friendly) */}
            {hasMore && !isLoadingMore && (
              <div className="mt-8">
                <LoadMoreButton
                  onClick={loadMore}
                  isLoading={isLoadingMore}
                  hasMore={hasMore}
                />
              </div>
            )}

            {/* End of List Indicator */}
            {!hasMore && displayedProperties.length > 0 && (
              <div className="text-center py-12 animate-fade-in">
                <Badge variant="secondary" className="px-6 py-3 text-base">
                  ✓ Vous avez vu toutes les annonces disponibles
                </Badge>
              </div>
            )}
          </>
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
      </main>

      <Footer />
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