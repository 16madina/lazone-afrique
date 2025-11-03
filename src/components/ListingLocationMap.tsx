import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface ListingLocationMapProps {
  lat: number;
  lng: number;
  title: string;
  city: string;
  className?: string;
}

const ListingLocationMap: React.FC<ListingLocationMapProps> = ({ 
  lat, 
  lng, 
  title, 
  city, 
  className = "w-full h-64" 
}) => {
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
    if (!mapContainer.current || !mapboxToken || !lat || !lng) return;

    // Initialiser la carte
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 15, // Zoom assez proche pour voir le quartier
      pitch: 0,
    });

    // Ajouter les contrôles de navigation
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    });
    map.current.addControl(nav, 'top-right');

    // Ajouter le contrôle de géolocalisation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    // Attendre que la carte soit chargée
    map.current.on('load', () => {
      if (!map.current) return;

      // Créer un marqueur personnalisé pour le bien
      const markerElement = document.createElement('div');
      markerElement.className = 'listing-location-marker';
      markerElement.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #E11D48, #F43F5E);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
          border: 3px solid white;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: 16px;
            font-weight: bold;
          ">
            🏠
          </div>
        </div>
      `;

      // Effets hover sur le marqueur
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1) rotate(-45deg)';
        markerElement.style.boxShadow = '0 6px 20px rgba(225, 29, 72, 0.6)';
      });
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1) rotate(-45deg)';
        markerElement.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.4)';
      });

      // Créer le marqueur
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Créer un popup simple avec les informations du bien
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'listing-location-popup'
      })
        .setHTML(`
          <div style="
            padding: 12px; 
            max-width: 250px; 
            font-family: system-ui, -apple-system, sans-serif;
            text-align: center;
          ">
            <div style="
              font-weight: 600; 
              font-size: 14px; 
              margin-bottom: 8px; 
              color: #1f2937;
              line-height: 1.4;
            ">
              ${title}
            </div>
            
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center;
              gap: 6px; 
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 8px;
            ">
              <span>📍</span>
              <span>${city}</span>
            </div>

            <div style="
              font-size: 11px;
              color: #9ca3af;
              font-family: monospace;
            ">
              ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </div>
          </div>
        `);

      // Attacher le popup au marqueur
      markerElement.addEventListener('click', () => {
        popup.addTo(map.current!);
        popup.setLngLat([lng, lat]);
      });

      // Animation d'apparition du marqueur
      markerElement.style.opacity = '0';
      markerElement.style.transform = 'scale(0) rotate(-45deg)';
      
      setTimeout(() => {
        markerElement.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        markerElement.style.opacity = '1';
        markerElement.style.transform = 'scale(1) rotate(-45deg)';
      }, 500);

      // Ajouter un cercle autour du marqueur pour montrer la zone approximative
      map.current.addSource('location-area', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'location-circle',
        type: 'circle',
        source: 'location-area',
        paint: {
          'circle-radius': {
            stops: [
              [12, 20],
              [16, 50],
              [20, 100]
            ]
          },
          'circle-color': '#E11D48',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#E11D48',
          'circle-stroke-opacity': 0.3
        }
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, lat, lng, title, city]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 mx-auto text-primary mb-2 animate-spin">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 mx-auto text-destructive mb-2">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden shadow-sm border`}>
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default ListingLocationMap;