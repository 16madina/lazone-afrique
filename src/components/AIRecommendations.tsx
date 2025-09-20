import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, DollarSign, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import PropertyCard from "./PropertyCard";
import { FilterState } from "./PropertyFilters";

interface AIRecommendation {
  id: string;
  title: string;
  price: number;
  city: string;
  property_type: string;
  transaction_type: string;
  features: string[];
  bedrooms: number;
  bathrooms: number;
  surface_area: number;
  score: number;
  reasons: string[];
  aiRecommended: boolean;
}

interface AIInsights {
  marketTrends: string;
  priceAnalysis: string;
  suggestions: string;
}

interface AIRecommendationsProps {
  countryCode: string;
  currentFilters: FilterState;
  onPropertySelect?: (propertyId: string) => void;
}

export const AIRecommendations = ({ countryCode, currentFilters, onPropertySelect }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Tracker l'historique des recherches en local storage
  const saveSearchToHistory = (filters: FilterState) => {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newSearch = {
      timestamp: new Date().toISOString(),
      location: filters.location,
      propertyType: filters.propertyType,
      transactionType: filters.type,
      priceRange: filters.priceRange,
      bedrooms: filters.bedrooms
    };
    
    const updatedHistory = [newSearch, ...searchHistory.slice(0, 9)]; // Garder les 10 dernières recherches
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sauvegarder la recherche actuelle
      saveSearchToHistory(currentFilters);
      
      // Récupérer l'historique
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      
      const { data, error: functionError } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          countryCode: countryCode,
          searchHistory: searchHistory,
          currentFilters: currentFilters,
          userPreferences: {
            budget: currentFilters.priceRange[1],
            propertyTypes: currentFilters.propertyType ? [currentFilters.propertyType] : [],
            preferredAreas: currentFilters.location ? [currentFilters.location] : []
          }
        }
      });

      if (functionError) {
        console.error('Erreur fonction:', functionError);
        throw new Error(functionError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setRecommendations(data?.recommendations || []);
      setInsights(data?.insights || null);
      
      if (data?.recommendations?.length === 0) {
        toast({
          title: "Aucune recommandation",
          description: "Essayez d'ajuster vos critères de recherche.",
        });
      } else {
        toast({
          title: "Recommandations générées",
          description: `${data?.recommendations?.length || 0} propriétés recommandées par l'IA`,
        });
      }
    } catch (err) {
      console.error('Erreur lors de la génération des recommandations:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Générer automatiquement au chargement
  useEffect(() => {
    generateRecommendations();
  }, [countryCode]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M FCFA`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K FCFA`;
    }
    return `${price} FCFA`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de regénération */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Recommandations IA</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Bêta
          </Badge>
        </div>
        <Button 
          onClick={generateRecommendations}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyse...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Actualiser
            </>
          )}
        </Button>
      </div>

      {/* Insights IA */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tendances Marché
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{insights.marketTrends}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Analyse Prix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{insights.priceAnalysis}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{insights.suggestions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">L'IA analyse vos préférences...</p>
          </div>
        </div>
      )}

      {/* Recommandations */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Propriétés recommandées pour vous</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  price={property.price}
                  currencyCode="XOF"
                  location={property.city}
                  type={property.transaction_type === 'rent' ? 'rent' : 'sale'}
                  propertyType={property.property_type as any || "house"}
                  photos={[]}
                  image="/placeholder.svg"
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  surface={property.surface_area || 120}
                  agent={{
                    name: "Agent",
                    type: "individual",
                    rating: 4.5,
                    verified: true,
                    user_id: "",
                    phone: ""
                  }}
                  features={property.features || []}
                  isSponsored={false}
                  isFavorite={false}
                />
                
                {/* Badge de recommandation IA */}
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {Math.round(property.score * 100)}% match
                  </Badge>
                </div>
                
                {/* Raisons de recommandation */}
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium mb-2">Pourquoi cette recommandation :</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {property.reasons?.slice(0, 2).map((reason, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* État vide */}
      {!loading && recommendations.length === 0 && !error && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">Aucune recommandation disponible</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Ajustez vos filtres ou effectuez quelques recherches pour obtenir des recommandations personnalisées.
          </p>
          <Button onClick={generateRecommendations} variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Essayer maintenant
          </Button>
        </div>
      )}
    </div>
  );
};