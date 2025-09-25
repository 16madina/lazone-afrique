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

    console.log(`Geocoding: ${city}, ${countryCode}`);

    // Create search query with country bias
    const searchQuery = encodeURIComponent(`${city}, ${countryCode}`);
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxToken}&country=${countryCode.toLowerCase()}&types=place,locality&limit=1`;

    const response = await fetch(mapboxUrl);
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log(`No coordinates found for ${city}, ${countryCode}`);
      // Fallback to default coordinates based on country
      const defaultCoords = getDefaultCoordinates(countryCode);
      return new Response(JSON.stringify({
        lat: defaultCoords.lat,
        lng: defaultCoords.lng,
        foundExact: false,
        city: city
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const feature = data.features[0];
    const [lng, lat] = feature.center;

    console.log(`Found coordinates for ${city}: ${lat}, ${lng}`);

    return new Response(JSON.stringify({
      lat: lat,
      lng: lng,
      foundExact: true,
      city: feature.place_name || city
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in geocode-city function:', error);
    
    // Return fallback coordinates on error
    const { city, countryCode } = await req.json().catch(() => ({ city: '', countryCode: 'CI' }));
    const defaultCoords = getDefaultCoordinates(countryCode);
    
    return new Response(JSON.stringify({
      lat: defaultCoords.lat,
      lng: defaultCoords.lng,
      foundExact: false,
      city: city,
      error: (error as Error).message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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