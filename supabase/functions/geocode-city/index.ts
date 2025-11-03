import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, countryCode } = await req.json();
    
    if (!city || !countryCode) {
      throw new Error('City and country code are required');
    }

    console.log(`🗺️ Geocoding: ${city}, ${countryCode}`);

    // Check known neighborhoods database first
    const knownLocation = getKnownLocation(city, countryCode);
    if (knownLocation) {
      console.log(`✅ Found in known locations: ${city} -> ${knownLocation.lat}, ${knownLocation.lng}`);
      return new Response(JSON.stringify({
        lat: knownLocation.lat,
        lng: knownLocation.lng,
        foundExact: true,
        city: city,
        source: 'database'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try multiple geocoding strategies
    const strategies = [
      // Strategy 1: Precise search with all location types
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&country=${countryCode.toLowerCase()}&types=neighborhood,locality,place,district,poi&proximity=-4.0267,5.3364&limit=1`,
      
      // Strategy 2: Add country name for better context
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${city}, ${countryCode}`)}.json?access_token=${mapboxToken}&types=neighborhood,locality,place,district&limit=1`,
      
      // Strategy 3: Broader search without country filter
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&types=place,locality&limit=1`,
    ];

    for (let i = 0; i < strategies.length; i++) {
      console.log(`🔍 Trying geocoding strategy ${i + 1}...`);
      
      const response = await fetch(strategies[i]);
      
      if (!response.ok) {
        console.warn(`⚠️ Strategy ${i + 1} failed with status ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const relevance = feature.relevance || 0;

        console.log(`✅ Strategy ${i + 1} found: ${feature.place_name} (relevance: ${relevance})`);

        // Only use result if relevance is reasonable
        if (relevance >= 0.5) {
          return new Response(JSON.stringify({
            lat: lat,
            lng: lng,
            foundExact: true,
            city: feature.place_name || city,
            source: 'mapbox',
            strategy: i + 1,
            relevance: relevance
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // All strategies failed, use intelligent fallback
    console.log(`⚠️ No precise coordinates found for ${city}, using smart fallback`);
    const fallbackCoords = getSmartFallback(city, countryCode);
    
    return new Response(JSON.stringify({
      lat: fallbackCoords.lat,
      lng: fallbackCoords.lng,
      foundExact: false,
      city: city,
      source: 'fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in geocode-city function:', error);
    
    // Return fallback coordinates on error
    const { city, countryCode } = await req.json().catch(() => ({ city: '', countryCode: 'CI' }));
    const defaultCoords = getDefaultCoordinates(countryCode);
    
    return new Response(JSON.stringify({
      lat: defaultCoords.lat,
      lng: defaultCoords.lng,
      foundExact: false,
      city: city,
      source: 'error',
      error: (error as Error).message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Database of known locations with precise coordinates (especially for Côte d'Ivoire)
function getKnownLocation(city: string, countryCode: string): { lat: number; lng: number } | null {
  const cityLower = city.toLowerCase().trim();
  const country = countryCode.toUpperCase();
  
  // Côte d'Ivoire neighborhoods and cities
  const knownLocations: { [key: string]: { [key: string]: { lat: number; lng: number } } } = {
    'CI': {
      // Abidjan communes and neighborhoods
      'cocody': { lat: 5.3600, lng: -3.9900 },
      'cocody angré': { lat: 5.4041, lng: -3.9888 },
      'angré': { lat: 5.4041, lng: -3.9888 },
      'deux plateaux': { lat: 5.3609, lng: -3.9975 },
      'riviera': { lat: 5.3728, lng: -3.9731 },
      'plateau': { lat: 5.3197, lng: -4.0267 },
      'marcory': { lat: 5.2858, lng: -3.9731 },
      'treichville': { lat: 5.2836, lng: -4.0083 },
      'yopougon': { lat: 5.3364, lng: -4.0833 },
      'abobo': { lat: 5.4236, lng: -4.0208 },
      'adjamé': { lat: 5.3497, lng: -4.0244 },
      'koumassi': { lat: 5.2914, lng: -3.9464 },
      'port-bouët': { lat: 5.2622, lng: -3.9294 },
      'attécoubé': { lat: 5.3342, lng: -4.0528 },
      'zone 4': { lat: 5.2858, lng: -3.9731 },
      
      // Other major cities
      'bingerville': { lat: 5.3550, lng: -3.8950 },
      'grand-bassam': { lat: 5.2128, lng: -3.7432 },
      'bouaké': { lat: 7.6900, lng: -5.0300 },
      'yamoussoukro': { lat: 6.8276, lng: -5.2893 },
      'daloa': { lat: 6.8770, lng: -6.4503 },
      'san-pédro': { lat: 4.7582, lng: -6.6415 },
      'korhogo': { lat: 9.4580, lng: -5.6297 },
      'man': { lat: 7.4125, lng: -7.5544 },
      'gagnoa': { lat: 6.1330, lng: -5.9518 },
      'divo': { lat: 5.8372, lng: -5.3572 },
      'abengourou': { lat: 6.7294, lng: -3.4964 },
      'anyama': { lat: 5.4950, lng: -3.9500 },
      'songon': { lat: 5.3000, lng: -4.2500 },
    },
    'SN': {
      'dakar': { lat: 14.6928, lng: -17.4467 },
      'pikine': { lat: 14.7549, lng: -17.3922 },
      'thiès': { lat: 14.7886, lng: -16.9260 },
    },
    'GH': {
      'accra': { lat: 5.6037, lng: -0.1870 },
      'kumasi': { lat: 6.6885, lng: -1.6244 },
      'tamale': { lat: 9.4034, lng: -0.8393 },
    },
    'NG': {
      'lagos': { lat: 6.5244, lng: 3.3792 },
      'abuja': { lat: 9.0765, lng: 7.3986 },
      'port harcourt': { lat: 4.8156, lng: 7.0498 },
    },
    'KE': {
      'nairobi': { lat: -1.2921, lng: 36.8219 },
      'mombasa': { lat: -4.0435, lng: 39.6682 },
    }
  };

  if (knownLocations[country] && knownLocations[country][cityLower]) {
    return knownLocations[country][cityLower];
  }

  return null;
}

// Smart fallback: try to match partial names or return country capital
function getSmartFallback(city: string, countryCode: string): { lat: number; lng: number } {
  const cityLower = city.toLowerCase();
  
  // Try partial matching for Abidjan neighborhoods
  if (countryCode.toUpperCase() === 'CI') {
    if (cityLower.includes('cocody') || cityLower.includes('angré')) {
      return { lat: 5.3478, lng: -4.0267 };
    }
    if (cityLower.includes('marcory')) {
      return { lat: 5.2858, lng: -3.9731 };
    }
    if (cityLower.includes('plateau')) {
      return { lat: 5.3197, lng: -4.0267 };
    }
    if (cityLower.includes('yopougon')) {
      return { lat: 5.3364, lng: -4.0833 };
    }
    if (cityLower.includes('riviera')) {
      return { lat: 5.3728, lng: -3.9731 };
    }
  }
  
  // Return country capital as ultimate fallback
  return getDefaultCoordinates(countryCode);
}

// Fallback coordinates for African countries
function getDefaultCoordinates(countryCode: string) {
  const defaults: { [key: string]: { lat: number; lng: number } } = {
    'CI': { lat: 5.3364, lng: -4.0267 }, // Abidjan, Côte d'Ivoire
    'SN': { lat: 14.6928, lng: -17.4467 }, // Dakar, Sénégal
    'GN': { lat: 9.6412, lng: -13.5784 }, // Conakry, Guinée
    'GH': { lat: 5.6037, lng: -0.1870 }, // Accra, Ghana
    'NG': { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
    'CM': { lat: 4.0511, lng: 9.7679 }, // Douala, Cameroun
    'MA': { lat: 33.9716, lng: -6.8498 }, // Rabat, Maroc
    'TN': { lat: 36.8065, lng: 10.1815 }, // Tunis, Tunisie
    'EG': { lat: 30.0444, lng: 31.2357 }, // Le Caire, Égypte
    'KE': { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya
    'TZ': { lat: -6.7924, lng: 39.2083 }, // Dar es Salaam, Tanzanie
    'UG': { lat: 0.3476, lng: 32.5825 }, // Kampala, Ouganda
    'RW': { lat: -1.9441, lng: 30.0619 }, // Kigali, Rwanda
    'ET': { lat: 9.1450, lng: 40.4897 }, // Addis-Abeba, Éthiopie
    'ZA': { lat: -33.9249, lng: 18.4241 }, // Le Cap, Afrique du Sud
  };

  return defaults[countryCode.toUpperCase()] || defaults['CI']; // Default to Côte d'Ivoire
}