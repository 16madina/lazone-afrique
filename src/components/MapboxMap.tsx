import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox-styles.css';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useCountry } from '@/contexts/CountryContext';

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  status: string;
  image: string | null;
  photos: string[] | null;
  city: string;
  country_code: string;
  transaction_type: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

interface ClusterFeature {
  type: 'Feature';
  properties: {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    listing?: Listing;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface MapboxMapProps {
  listings: Listing[];
  selectedCityCoords?: {lat: number, lng: number} | null;
}

// Format price for map display (price already in local currency)
function formatMapPrice(priceInLocalCurrency?: number | null, currencyCode?: string | null, formatPriceFunc?: (price: number, currency?: string) => string) {
  if (priceInLocalCurrency == null || !formatPriceFunc) return '';
  
  // Use the context formatPrice function with the currency code
  const formattedPrice = formatPriceFunc(priceInLocalCurrency, currencyCode || undefined);
  
  // Extract just the number part for compact display
  const numberMatch = formattedPrice.match(/[\d\s,\.]+/);
  if (!numberMatch) return formattedPrice;
  
  const numberPart = numberMatch[0].replace(/\s/g, '');
  const numericValue = parseFloat(numberPart.replace(/,/g, ''));
  
  if (numericValue >= 1_000_000) {
    return (numericValue / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  }
  if (numericValue >= 1_000) {
    return Math.round(numericValue / 1_000) + 'k';
  }
  return numberPart;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ listings, selectedCityCoords }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const clustererRef = useRef<Supercluster | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
  const { selectedCountry, formatPrice } = useCountry();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

  // Expose favorite functions to window for popup access
  useEffect(() => {
    (window as any).toggleMapFavorite = async (listingId: string) => {
      if (!user) {
        alert('Vous devez être connecté pour ajouter aux favoris');
        return;
      }
      
      const success = await toggleFavorite(listingId);
      if (success) {
        // Update the button appearance
        const btn = document.getElementById(`favorite-btn-${listingId}`);
        if (btn) {
          btn.innerHTML = isFavorite(listingId) ? '❤️' : '🤍';
        }
      }
    };

    return () => {
      delete (window as any).toggleMapFavorite;
    };
  }, [user, toggleFavorite, isFavorite]);

  // Récupérer le token Mapbox depuis l'edge function
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          throw error;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('Token Mapbox non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du token Mapbox:', err);
        setError('Impossible de charger la carte');
      } finally {
        setLoading(false);
      }
    };

    getMapboxToken();
  }, []);

  // Initialize clustering
  const initializeClustering = useCallback(() => {
    if (!listings.length) return;

    const points = listings
      .filter(listing => listing.lat && listing.lng)
      .map(listing => ({
        type: 'Feature' as const,
        properties: { listing },
        geometry: {
          type: 'Point' as const,
          coordinates: [listing.lng, listing.lat] as [number, number]
        }
      }));

    clustererRef.current = new Supercluster({
      radius: 40,
      maxZoom: 16,
      minZoom: 0,
      extent: 512,
      nodeSize: 64
    });

    clustererRef.current.load(points);
  }, [listings]);

  // Get property type color
  const getPropertyTypeColor = useCallback((listing: Listing) => {
    const type = listing.property_type?.toLowerCase();
    const transactionType = listing.transaction_type?.toLowerCase();
    
    if (transactionType === 'rent') {
      return { bg: '#059669', shadow: 'rgba(5, 150, 105, 0.4)' }; // Vert pour location
    }
    
    switch (type) {
      case 'apartment':
      case 'appartement':
        return { bg: '#0891b2', shadow: 'rgba(8, 145, 178, 0.4)' }; // Bleu cyan
      case 'house':
      case 'maison':
        return { bg: '#7c3aed', shadow: 'rgba(124, 58, 237, 0.4)' }; // Violet
      case 'land':
      case 'terrain':
        return { bg: '#ca8a04', shadow: 'rgba(202, 138, 4, 0.4)' }; // Jaune/orange
      default:
        return { bg: '#e11d48', shadow: 'rgba(225, 29, 72, 0.4)' }; // Rose par défaut
    }
  }, []);

  // Create cluster marker
  const createClusterMarker = useCallback((cluster: any) => {
    const pointCount = cluster.properties.point_count || 0;
    const clusterSize = pointCount < 10 ? 'small' : pointCount < 100 ? 'medium' : 'large';
    
    const sizes = {
      small: { width: 30, height: 30, fontSize: 12 },
      medium: { width: 40, height: 40, fontSize: 14 },
      large: { width: 50, height: 50, fontSize: 16 }
    };
    
    const size = sizes[clusterSize];
    
    const markerElement = document.createElement('div');
    markerElement.className = 'cluster-marker';
    markerElement.innerHTML = `
      <div style="
        width: ${size.width}px;
        height: ${size.height}px;
        background: linear-gradient(135deg, #0891b2, #0e7490);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size.fontSize}px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
        border: 3px solid white;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        ${pointCount}
      </div>
    `;

    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.1)';
    });

    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
    });

    return markerElement;
  }, []);

  // Create property marker
  const createPropertyMarker = useCallback((listing: Listing) => {
    const colorInfo = getPropertyTypeColor(listing);
    
    const markerElement = document.createElement('div');
    markerElement.className = 'property-marker';
    markerElement.innerHTML = `
      <div style="
        background: ${colorInfo.bg};
        color: white;
        padding: 4px 10px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 3px 10px ${colorInfo.shadow};
        white-space: nowrap;
        cursor: pointer;
        border: 2px solid white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        min-width: 32px;
        text-align: center;
      ">
        ${formatMapPrice(listing.price, (listing as any).currency_code, formatPrice)}
      </div>
    `;

    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.15)';
      markerElement.style.zIndex = '1000';
    });

    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)';
      markerElement.style.zIndex = '1';
    });

    return markerElement;
  }, [formatMapPrice, formatPrice, getPropertyTypeColor]);

  // Update markers based on zoom level
  const updateMarkers = useCallback(() => {
    if (!map.current || !clustererRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const bounds = map.current.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];

    const zoom = Math.floor(map.current.getZoom());
    const clusters = clustererRef.current.getClusters(bbox, zoom);

    clusters.forEach((cluster, index) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const markerId = `marker-${index}`;

      if (cluster.properties.cluster) {
        // Create cluster marker
        const markerElement = createClusterMarker(cluster);
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        // Click handler to zoom into cluster
        markerElement.addEventListener('click', () => {
          const expansionZoom = Math.min(
            clustererRef.current!.getClusterExpansionZoom(cluster.properties.cluster_id!),
            20
          );
          map.current?.easeTo({
            center: [lng, lat],
            zoom: expansionZoom,
            duration: 500
          });
        });

        markersRef.current[markerId] = marker;
      } else {
        // Create property marker
        const listing = cluster.properties.listing!;
        const markerElement = createPropertyMarker(listing);
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .addTo(map.current!);

        // Create enhanced popup
        const popup = createEnhancedPopup(listing);
        
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Close other popups
          document.querySelectorAll('.mapboxgl-popup').forEach(p => {
            if (p.parentNode) p.parentNode.removeChild(p);
          });

          popup.setLngLat([lng, lat]).addTo(map.current!);
          markerElement.style.transform = 'scale(1.2)';
        });

        popup.on('close', () => {
          markerElement.style.transform = 'scale(1)';
        });

        markersRef.current[markerId] = marker;
      }
    });
  }, [createClusterMarker, createPropertyMarker]);

  // Create enhanced popup
  const createEnhancedPopup = useCallback((listing: Listing) => {
    const getListingImage = (listing: Listing) => {
      if (listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0) {
        return listing.photos[0];
      }
      if (listing.image && listing.image !== '/placeholder.svg' && !listing.image.includes('placeholder')) {
        return listing.image;
      }
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=280&h=160&fit=crop&auto=format';
    };

    return new mapboxgl.Popup({ 
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      className: 'enhanced-popup'
    }).setHTML(`
      <div style="padding: 0; max-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="position: relative;">
          <img 
            src="${getListingImage(listing)}" 
            alt="${listing.title}"
            style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px 8px 0 0;"
          />
          <div style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
          ">
            ${listing.transaction_type === 'rent' ? 'Location' : 'Vente'}
          </div>
        </div>
        
        <div style="padding: 12px;">
          <div style="
            color: #0891b2; 
            font-size: 16px; 
            font-weight: 700; 
            margin-bottom: 6px;
          ">
             ${formatPrice(listing.price, (listing as any).currency_code)}
          </div>
          
          <div style="
            font-weight: 600; 
            font-size: 13px; 
            margin-bottom: 8px; 
            line-height: 1.3;
            color: #1f2937;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">
            ${listing.title}
          </div>
          
          <div style="
            display: flex;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 11px;
            color: #6b7280;
          ">
            ${listing.bedrooms ? `<span>🛏️ ${listing.bedrooms}</span>` : ''}
            ${listing.bathrooms ? `<span>🚿 ${listing.bathrooms}</span>` : ''}
          </div>
           
          <div style="
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 10px;
          ">
            📍 ${listing.city}
          </div>
          
          <button 
            onclick="window.location.href='/listing/${listing.id}'"
            style="
              background: linear-gradient(135deg, #0891b2, #0e7490);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
              transition: all 0.3s ease;
            "
            onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(8, 145, 178, 0.3)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
          >
            Voir les détails
          </button>
        </div>
      </div>
    `);
  }, [formatPrice]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [15, 0],
      zoom: 3,
      pitch: 0,
      maxBounds: [[-30, -40], [60, 40]],
      locale: {
        'NavigationControl.ZoomIn': 'Zoom avant',
        'NavigationControl.ZoomOut': 'Zoom arrière',
        'NavigationControl.ResetBearing': 'Réinitialiser l\'orientation',
        'GeolocateControl.FindMyLocation': 'Trouver ma position',
        'GeolocateControl.LocationNotAvailable': 'Position non disponible',
        'FullscreenControl.Enter': 'Plein écran',
        'FullscreenControl.Exit': 'Quitter le plein écran'
      }
    });

    // Add controls
    const nav = new mapboxgl.NavigationControl({ visualizePitch: true });
    map.current.addControl(nav, 'top-right');

    // Add geolocation control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    map.current.on('load', () => {
      // Fit to Africa bounds
      const africaBounds: [number, number, number, number] = [-20, -35, 52, 37];
      map.current?.fitBounds(africaBounds, { padding: 50 });

      // Configure French language for text layers
      const style = map.current?.getStyle();
      if (style && style.layers) {
        style.layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
            map.current?.setLayoutProperty(layer.id, 'text-field', [
              'coalesce',
              ['get', 'name_fr'],
              ['get', 'name:fr'], 
              ['get', 'name_en'],
              ['get', 'name:en'],
              ['get', 'name']
            ]);
          }
        });
      }

      // Initialize clustering
      initializeClustering();
      
      // Update markers initially
      updateMarkers();
    });

    // Update markers on zoom/move
    map.current.on('zoom', () => {
      const zoom = map.current?.getZoom() || 3;
      setCurrentZoom(zoom);
      updateMarkers();
    });

    map.current.on('moveend', updateMarkers);

    // Close popups when clicking on map
    map.current.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest('.property-marker') && !target.closest('.cluster-marker')) {
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
          if (popup.parentNode) popup.parentNode.removeChild(popup);
        });
      }
    });

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken, mapStyle, initializeClustering, updateMarkers]);

  // Re-initialize clustering when listings change
  useEffect(() => {
    if (map.current && clustererRef.current) {
      initializeClustering();
      updateMarkers();
    }
  }, [listings, initializeClustering, updateMarkers]);

  // Toggle map style
  const toggleMapStyle = useCallback(() => {
    const newStyle = mapStyle === 'mapbox://styles/mapbox/light-v11' 
      ? 'mapbox://styles/mapbox/satellite-v11' 
      : 'mapbox://styles/mapbox/light-v11';
    
    setMapStyle(newStyle);
    if (map.current) {
      map.current.setStyle(newStyle);
      // Re-add markers after style load
      map.current.once('styledata', () => {
        updateMarkers();
      });
    }
  }, [mapStyle, updateMarkers]);

  // Navigate to selected country when it changes
  useEffect(() => {
    if (map.current) {
      const { lat, lng, zoom } = selectedCountry.coordinates;
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 2000 // Animation duration in milliseconds
      });
    }
  }, [selectedCountry]);

  // Navigate to selected city when coordinates are provided
  useEffect(() => {
    if (map.current && selectedCityCoords) {
      map.current.flyTo({
        center: [selectedCityCoords.lng, selectedCityCoords.lat],
        zoom: 12, // Zoom plus proche pour une ville
        duration: 2000
      });
    }
  }, [selectedCityCoords]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto text-primary mb-4 animate-spin">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Chargement de la carte...</h3>
          <p className="text-muted-foreground">{listings.length} propriétés trouvées</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto text-destructive mb-4">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/5 rounded-lg" />
    </div>
  );
};

export default MapboxMap;