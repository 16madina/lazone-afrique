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
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocationFound, setUserLocationFound] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
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

    // Center map on selected country on load and trigger geolocation
    map.current.on('load', () => {
      console.log('🎯 Map loaded, centering on country:', selectedCountry.name);
      setMapLoaded(true); // Signal that map is ready for markers
      
      // Trigger automatic geolocation
      setTimeout(() => {
        if (geolocateControlRef.current) {
          console.log('📍 Déclenchement de la géolocalisation automatique...');
          geolocateControlRef.current.trigger();
        }
      }, 500);
      
      // Fallback: center on selected country if geolocation fails or is denied
      if (selectedCountry.coordinates && map.current) {
        setTimeout(() => {
          if (!userLocationFound && map.current) {
            console.log('🗺️ Utilisation du pays par défaut:', selectedCountry.name);
            map.current.flyTo({
              center: [selectedCountry.coordinates.lng, selectedCountry.coordinates.lat],
              zoom: selectedCountry.coordinates.zoom || 6,
              duration: 1500
            });
          }
        }, 3000); // Wait 3s for geolocation to complete
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, toast, selectedCountry]);

  // Update clusters and markers when listings change
  useEffect(() => {
    if (!map.current || !mapboxToken || !mapLoaded) return;

    const mapInstance = map.current;

    // Convert listings to GeoJSON format
    const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: listings
        .filter(l => l.lat && l.lng)
        .map((listing) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [listing.lng!, listing.lat!]
          },
          properties: {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            priceFormatted: formatShortPrice(listing.price),
            city: listing.city,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            surface_area: listing.surface_area,
            photos: listing.photos?.[0] || '/placeholder.svg',
            is_sponsored: listing.is_sponsored || false
          }
        }))
    };

    console.log(`📌 Creating clusters for ${geojsonData.features.length}/${listings.length} listings`);

    // Remove existing source and layers if they exist
    if (mapInstance.getLayer('clusters')) mapInstance.removeLayer('clusters');
    if (mapInstance.getLayer('cluster-count')) mapInstance.removeLayer('cluster-count');
    if (mapInstance.getLayer('unclustered-point')) mapInstance.removeLayer('unclustered-point');
    if (mapInstance.getLayer('unclustered-point-label')) mapInstance.removeLayer('unclustered-point-label');
    if (mapInstance.getSource('listings')) mapInstance.removeSource('listings');

    // Add source with clustering
    mapInstance.addSource('listings', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points
      clusterRadius: 50 // Radius of each cluster in pixels
    });

    // Layer 1: Clustered circles - styled by point count
    mapInstance.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'listings',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#EAB308', // Yellow for 2-9 listings
          10,
          '#F97316', // Orange for 10-49 listings
          50,
          '#DC2626'  // Red for 50+ listings
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,  // Small radius for 2-9
          10,
          25,  // Medium radius for 10-49
          50,
          30   // Large radius for 50+
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Layer 2: Cluster count labels
    mapInstance.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'listings',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Layer 3: Unclustered individual points (price labels)
    mapInstance.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'listings',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['get', 'is_sponsored'],
          '#f59e0b',
          '#E11D48'
        ],
        'circle-radius': 12,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Layer 4: Price labels for unclustered points
    mapInstance.addLayer({
      id: 'unclustered-point-label',
      type: 'symbol',
      source: 'listings',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'priceFormatted'],
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-offset': [0, 0],
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Click handler for clusters - zoom in
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });

      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = mapInstance.getSource('listings') as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !features[0].geometry || features[0].geometry.type !== 'Point') return;

        mapInstance.easeTo({
          center: features[0].geometry.coordinates as [number, number],
          zoom: zoom || (mapInstance.getZoom() + 2),
          duration: 500
        });
      });
    };

    // Click handler for unclustered points - show listing card
    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      if (!e.features || !e.features[0].properties) return;

      const properties = e.features[0].properties;
      const listing = listings.find(l => l.id === properties.id);
      
      if (listing) {
        setSelectedListing(listing);
      }
    };

    // Cursor handlers
    const handleCursorPointer = () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    };
    const handleCursorDefault = () => {
      mapInstance.getCanvas().style.cursor = '';
    };

    // Attach event listeners
    mapInstance.on('click', 'clusters', handleClusterClick);
    mapInstance.on('click', 'unclustered-point', handlePointClick);
    mapInstance.on('mouseenter', 'clusters', handleCursorPointer);
    mapInstance.on('mouseleave', 'clusters', handleCursorDefault);
    mapInstance.on('mouseenter', 'unclustered-point', handleCursorPointer);
    mapInstance.on('mouseleave', 'unclustered-point', handleCursorDefault);

    console.log('✅ Clustering configured successfully');

    // Cleanup function
    return () => {
      if (!mapInstance.isStyleLoaded()) return;
      
      if (mapInstance.getLayer('clusters')) {
        mapInstance.off('click', 'clusters', handleClusterClick);
        mapInstance.off('mouseenter', 'clusters', handleCursorPointer);
        mapInstance.off('mouseleave', 'clusters', handleCursorDefault);
      }
      if (mapInstance.getLayer('unclustered-point')) {
        mapInstance.off('click', 'unclustered-point', handlePointClick);
        mapInstance.off('mouseenter', 'unclustered-point', handleCursorPointer);
        mapInstance.off('mouseleave', 'unclustered-point', handleCursorDefault);
      }
    };
  }, [listings, mapboxToken, mapLoaded, formatShortPrice]);

  // Zoom to searched city/neighborhood when cityCoords change
  useEffect(() => {
    if (!map.current || !cityCoords) return;
    
    console.log('🎯 Zooming to searched location:', cityCoords);
    map.current.flyTo({
      center: [cityCoords.lng, cityCoords.lat],
      zoom: 14, // Closer zoom for city/neighborhood search
      duration: 1500,
      essential: true
    });
  }, [cityCoords]);

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
