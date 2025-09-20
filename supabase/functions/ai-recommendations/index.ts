import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyData {
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
}

interface RecommendationRequest {
  countryCode: string;
  searchHistory?: Array<{
    query?: string;
    location?: string;
    propertyType?: string;
    transactionType?: string;
    priceRange?: [number, number];
    bedrooms?: string;
  }>;
  currentFilters?: {
    location?: string;
    propertyType?: string;
    transactionType?: string;
    priceRange?: [number, number];
    bedrooms?: string;
  };
  userPreferences?: {
    budget?: number;
    preferredAreas?: string[];
    propertyTypes?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { countryCode, searchHistory, currentFilters, userPreferences } = await req.json() as RecommendationRequest;

    console.log('Generating AI recommendations for:', { countryCode, currentFilters, searchHistory });

    // Récupérer toutes les propriétés disponibles dans le pays
    const { data: properties, error: propertiesError } = await supabase
      .from('listings')
      .select(`
        id, title, price, city, property_type, transaction_type, 
        features, bedrooms, bathrooms, surface_area
      `)
      .eq('country_code', countryCode.toUpperCase())
      .eq('status', 'published')
      .limit(50); // Limitation pour l'analyse

    if (propertiesError) {
      throw new Error(`Erreur lors de la récupération des propriétés: ${propertiesError.message}`);
    }

    if (!properties || properties.length === 0) {
      return new Response(JSON.stringify({ 
        recommendations: [], 
        message: "Aucune propriété disponible dans ce pays pour le moment." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Construire le contexte pour l'IA
    const userContext = {
      searchHistory: searchHistory || [],
      currentFilters: currentFilters || {},
      userPreferences: userPreferences || {},
      availableProperties: properties.slice(0, 20) // Limiter pour éviter un contexte trop long
    };

    // Préparer le prompt pour l'IA
    const systemPrompt = `Tu es un expert en immobilier qui recommande des biens basés sur les préférences utilisateur.
Analyse les données suivantes et recommande 3-5 propriétés qui correspondent le mieux aux préférences de l'utilisateur.

Critères d'analyse:
1. Historique des recherches précédentes
2. Filtres actuels appliqués
3. Budget approximatif
4. Type de bien préféré
5. Localisation préférée

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "recommendations": [
    {
      "id": "property-id",
      "score": 0.95,
      "reasons": ["Raison 1", "Raison 2", "Raison 3"]
    }
  ],
  "insights": {
    "marketTrends": "Observation sur le marché local",
    "priceAnalysis": "Analyse des prix dans la région",
    "suggestions": "Suggestions pour améliorer la recherche"
  }
}`;

    const userPrompt = `Voici les données utilisateur:
Pays: ${countryCode}
Historique de recherche: ${JSON.stringify(searchHistory)}
Filtres actuels: ${JSON.stringify(currentFilters)}
Préférences: ${JSON.stringify(userPreferences)}

Propriétés disponibles: ${JSON.stringify(properties)}

Recommande les meilleures propriétés pour cet utilisateur.`;

    // Appel à l'API OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur OpenAI:', errorData);
      throw new Error('Erreur lors de l\'appel à l\'API OpenAI');
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;
    
    console.log('Réponse AI brute:', aiContent);

    let aiRecommendations;
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiRecommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Pas de JSON valide dans la réponse');
      }
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError, 'Contenu:', aiContent);
      // Fallback: recommander les propriétés les plus récentes
      aiRecommendations = {
        recommendations: properties.slice(0, 3).map(p => ({
          id: p.id,
          score: 0.8,
          reasons: ["Propriété récemment ajoutée", "Correspond aux critères de base"]
        })),
        insights: {
          marketTrends: "Analyse en cours...",
          priceAnalysis: "Données de prix en collecte",
          suggestions: "Affinez vos critères pour de meilleures recommandations"
        }
      };
    }

    // Enrichir les recommandations avec les détails complets des propriétés
    const enrichedRecommendations = aiRecommendations.recommendations
      .map((rec: any) => {
        const property = properties.find(p => p.id === rec.id);
        if (!property) return null;
        
        return {
          ...property,
          score: rec.score,
          reasons: rec.reasons,
          aiRecommended: true
        };
      })
      .filter(Boolean);

    const result = {
      recommendations: enrichedRecommendations,
      insights: aiRecommendations.insights,
      timestamp: new Date().toISOString()
    };

    console.log('Recommandations finales:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans ai-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: [],
      insights: {
        marketTrends: "Service temporairement indisponible",
        priceAnalysis: "Impossible d'analyser les prix actuellement",
        suggestions: "Veuillez réessayer plus tard ou utiliser les filtres manuels"
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});