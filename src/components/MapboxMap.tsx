import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/contexts/CountryContext';
import { MapListing } from '@/pages/Map';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Maximize2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapboxMapProps {
  listings: MapListing[];
  cityCoords?: { lng: number; lat: number } | null;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ listings, cityCoords }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocationFound, setUserLocationFound] = useState(false);
  const { formatPrice, selectedCountry } = useCountry();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Format price to short version (450K, 4.5M, etc.)
  const formatShortPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${Math.round(price / 1000)}K`;
    }
    return price.toString();
  };

  // Fetch Mapbox token
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
      } finally {
        setLoading(false);
      }
    };
    getMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Default center (Abidjan, Côte d'Ivoire as fallback)
    const defaultCenter: [number, number] = [-4.0083, 5.3600];
    
    // Start with default center and moderate zoom
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: defaultCenter,
      zoom: 12,
      pitch: 0,
      projection: { name: 'mercator' }
    });

    console.log('🗺️ Map initialized with default center:', defaultCenter);

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true
      }),
      'top-right'
    );

    // Add geolocate control with auto-trigger
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true
    });
    
    geolocateControlRef.current = geolocateControl;
    map.current.addControl(geolocateControl, 'top-right');

    // Listen for geolocation success
    geolocateControl.on('geolocate', (e: any) => {
      if (e && e.coords) {
        console.log('📍 User location found:', e.coords.latitude, e.coords.longitude);
        setUserLocationFound(true);
        
        // Zoom to user location
        map.current?.flyTo({
          center: [e.coords.longitude, e.coords.latitude],
          zoom: 13,
          duration: 1500
        });
      }
    });

    // Listen for geolocation errors
    geolocateControl.on('error', (e: any) => {
      console.warn('⚠️ Geolocation error:', e.message);
    });

    // Center map on selected country on load
    map.current.on('load', () => {
      console.log('🎯 Map loaded, centering on country:', selectedCountry.name);
      if (selectedCountry.coordinates && map.current) {
        map.current.flyTo({
          center: [selectedCountry.coordinates.lng, selectedCountry.coordinates.lat],
          zoom: selectedCountry.coordinates.zoom || 6,
          duration: 1500
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, toast, selectedCountry]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Debug: count valid listings
    const validListings = listings.filter(l => l.lat && l.lng);
    console.log(`📌 Creating markers for ${validListings.length}/${listings.length} listings with coordinates`);

    // Add new markers
    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng) {
        console.warn(`⚠️ Listing "${listing.title}" missing coordinates:`, listing);
        return;
      }

      console.log(`📍 Adding marker for "${listing.title}" at [${listing.lng}, ${listing.lat}]`);

      // Create price marker element - small compact bubble design
      const el = document.createElement('div');
      el.className = 'price-marker';
      el.style.cssText = `
        background: ${listing.is_sponsored ? 'linear-gradient(135deg, #f59e0b, #f97316)' : '#E11D48'};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        border: 2px solid white;
        white-space: nowrap;
        display: inline-block;
        position: relative;
        z-index: 10;
      `;
      el.textContent = formatShortPrice(listing.price);

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.4)';
        el.style.zIndex = '1000';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        el.style.zIndex = '10';
      });

      // Click handler - show listing card immediately without moving map
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedListing(listing);
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.lng, listing.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    console.log(`✅ Total markers created: ${markersRef.current.length}`);

    // Only fit bounds if user location hasn't been found yet
    // This prevents the map from zooming out after user location is set
    if (!userLocationFound && listings.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      listings.forEach(listing => {
        if (listing.lat && listing.lng) {
          bounds.extend([listing.lng, listing.lat]);
        }
      });
      
      // Delay to allow geolocation to happen first
      setTimeout(() => {
        if (!userLocationFound && map.current) {
          console.log('🎯 Fitting bounds to show all listings');
          map.current.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            maxZoom: 14,
            duration: 1000
          });
        }
      }, 2000);
    }
  }, [listings, mapboxToken, formatShortPrice, userLocationFound]);

  // Handle city search coordinates
  useEffect(() => {
    if (!map.current || !cityCoords) return;

    map.current.flyTo({
      center: [cityCoords.lng, cityCoords.lat],
      zoom: 13,
      duration: 1500
    });
  }, [cityCoords]);

  // Handle country change - center map on selected country
  useEffect(() => {
    if (!map.current || !selectedCountry) return;

    console.log('🌍 Country changed to:', selectedCountry.name, 'coords:', selectedCountry.coordinates);
    
    // Always recenter when country changes
    if (selectedCountry.coordinates) {
      map.current.flyTo({
        center: [selectedCountry.coordinates.lng, selectedCountry.coordinates.lat],
        zoom: selectedCountry.coordinates.zoom || 6,
        duration: 1500
      });
    }
  }, [selectedCountry]);

  const handleListingClick = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Initialisation de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Listing Preview Card */}
      {selectedListing && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-md">
          <Card 
            className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm"
            onClick={() => handleListingClick(selectedListing.id)}
          >
            <div className="flex gap-4 p-4">
              {/* Image */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={selectedListing.photos?.[0] || '/placeholder.svg'}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
                {selectedListing.is_sponsored && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500">
                    Sponsorisé
                  </Badge>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                    {selectedListing.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedListing(null);
                    }}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{selectedListing.city}</span>
                </div>

                <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
                  {selectedListing.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span>{selectedListing.bedrooms}</span>
                    </div>
                  )}
                  {selectedListing.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      <span>{selectedListing.bathrooms}</span>
                    </div>
                  )}
                  {selectedListing.surface_area && (
                    <div className="flex items-center gap-1">
                      <Maximize2 className="h-3 w-3" />
                      <span>{selectedListing.surface_area} m²</span>
                    </div>
                  )}
                </div>

                <div className="text-lg font-bold text-primary">
                  {formatPrice(selectedListing.price)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
