import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  status: string;
  image: string | null;
  city: string;
  country_code: string;
}

interface MapboxMapProps {
  listings: Listing[];
}

function formatPrice(price?: number | null) {
  if (price == null) return '';
  if (price >= 1_000_000) return (price/1_000_000).toFixed(1).replace('.0','') + 'M';
  if (price >= 1_000) return Math.round(price/1_000) + 'k';
  return String(price);
}

const MapboxMap: React.FC<MapboxMapProps> = ({ listings }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialiser la carte
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0], // Centre de l'Afrique
      zoom: 2.5,
      pitch: 0,
    });

    // Ajouter les contrôles de navigation
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Centrer sur l'Afrique quand la carte est chargée
    map.current.on('load', () => {
      // Bounds approximatifs de l'Afrique
      const africaBounds: [number, number, number, number] = [-20, -35, 52, 37];
      map.current?.fitBounds(africaBounds, { padding: 50 });

      // Ajouter les marqueurs pour chaque listing
      listings.forEach(listing => {
        if (!listing.lat || !listing.lng) return;

        // Créer un élément DOM personnalisé pour le marqueur de prix
        const markerElement = document.createElement('div');
        markerElement.className = 'mapbox-price-marker';
        markerElement.innerHTML = `
          <div style="
            background: #0E7490;
            color: white;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            white-space: nowrap;
            cursor: pointer;
            border: 2px solid white;
          ">
            ${formatPrice(listing.price)} FCFA
          </div>
        `;

        // Créer le marqueur
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([listing.lng, listing.lat])
          .addTo(map.current!);

        // Créer le popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px; max-width: 250px;">
              <div style="display: flex; gap: 10px; align-items: start;">
                <img 
                  src="${listing.image || 'https://via.placeholder.com/80x60?text=No+Image'}" 
                  alt="${listing.title}"
                  style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px;"
                />
                <div>
                  <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; line-height: 1.3;">
                    ${listing.title}
                  </div>
                  <div style="color: #666; font-size: 12px; margin-bottom: 6px;">
                    ${formatPrice(listing.price)} FCFA
                  </div>
                  <button 
                    onclick="window.location.href='/listing/${listing.id}'"
                    style="
                      background: #0E7490;
                      color: white;
                      border: none;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      cursor: pointer;
                    "
                  >
                    Voir l'annonce
                  </button>
                </div>
              </div>
            </div>
          `);

        // Attacher le popup au marqueur
        markerElement.addEventListener('click', () => {
          popup.addTo(map.current!);
          popup.setLngLat([listing.lng, listing.lat]);
        });
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, listings]);

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