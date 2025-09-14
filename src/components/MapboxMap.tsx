import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox-styles.css';
import { supabase } from '@/integrations/supabase/client';
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
}

interface MapboxMapProps {
  listings: Listing[];
  selectedCityCoords?: {lat: number, lng: number} | null;
}

function formatPrice(price?: number | null) {
  if (price == null) return '';
  if (price >= 1_000_000) return (price/1_000_000).toFixed(1).replace('.0','') + 'M';
  if (price >= 1_000) return Math.round(price/1_000) + 'k';
  return String(price);
}

const MapboxMap: React.FC<MapboxMapProps> = ({ listings, selectedCityCoords }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCountry } = useCountry();

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
      center: [15, 0], // Centre de l'Afrique
      zoom: 3,
      pitch: 0,
      maxBounds: [[-30, -40], [60, 40]], // Limiter aux coordonnées de l'Afrique
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
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(14,116,144,0.3);
            white-space: nowrap;
            cursor: pointer;
            border: 1px solid white;
            transition: all 0.3s ease;
            transform: scale(1);
            min-width: 20px;
            text-align: center;
          ">
            ${formatPrice(listing.price)}
          </div>
        `;

        // Effet hover sur le marqueur
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.1)';
          markerElement.style.boxShadow = '0 6px 20px rgba(14,116,144,0.6)';
        });
        
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.boxShadow = '0 4px 15px rgba(14,116,144,0.4)';
        });

        // Créer le marqueur
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([listing.lng, listing.lat])
          .addTo(map.current!);

        // Créer le popup avec un design amélioré
        const getListingImage = (listing: Listing) => {
          // Vérifier d'abord les photos
          if (listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0) {
            return listing.photos[0];
          }
          // Vérifier l'image mais ignorer les placeholders
          if (listing.image && listing.image !== '/placeholder.svg' && !listing.image.includes('placeholder')) {
            return listing.image;
          }
          // Image par défaut avec un design plus attrayant
          return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=280&h=160&fit=crop&auto=format';
        };

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup'
        })
          .setHTML(`
            <div style="padding: 0; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="position: relative;">
                <img 
                  src="${getListingImage(listing)}" 
                  alt="${listing.title}"
                  style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;"
                />
                <div style="
                  position: absolute; 
                  top: 8px; 
                  right: 8px; 
                  background: ${listing.transaction_type === 'rent' ? '#0E7490' : '#E11D48'}; 
                  color: white; 
                  padding: 4px 8px; 
                  border-radius: 12px; 
                  font-size: 11px; 
                  font-weight: 600;
                ">
                  ${listing.transaction_type === 'rent' ? 'Location' : 'Vente'}
                </div>
              </div>
              
              <div style="padding: 16px;">
                <div style="
                  font-weight: 600; 
                  font-size: 16px; 
                  margin-bottom: 8px; 
                  line-height: 1.3;
                  color: #1f2937;
                ">
                  ${listing.title}
                </div>
                
                 <div style="
                   color: #0E7490; 
                   font-size: 18px; 
                   font-weight: 700; 
                   margin-bottom: 12px;
                 ">
                   ${formatPrice(listing.price)} FCFA
                 </div>
                 
                 <div style="
                   display: flex; 
                   align-items: center; 
                   gap: 8px; 
                   margin-bottom: 12px;
                   font-size: 12px;
                   color: #6b7280;
                 ">
                   <span>📍 ${listing.city}</span>
                   <span>•</span>
                   <span style="
                     background: ${listing.transaction_type === 'rent' ? '#0E7490' : '#E11D48'}; 
                     color: white; 
                     padding: 2px 6px; 
                     border-radius: 8px; 
                     font-weight: 600;
                   ">
                     ${listing.transaction_type === 'rent' ? 'Location' : 'Vente'}
                   </span>
                 </div>
                
                <button 
                  onclick="window.location.href='/listing/${listing.id}'"
                  style="
                    background: linear-gradient(135deg, #0E7490, #0891b2);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                  "
                  onmouseover="this.style.background='linear-gradient(135deg, #0891b2, #06b6d4)'; this.style.transform='translateY(-1px)'"
                  onmouseout="this.style.background='linear-gradient(135deg, #0E7490, #0891b2)'; this.style.transform='translateY(0px)'"
                >
                  📍 Voir les détails
                </button>
              </div>
            </div>
          `);

        // Attacher le popup au marqueur avec animation
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Fermer tous les autres popups
          document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            if (popup.parentNode) {
              popup.parentNode.removeChild(popup);
            }
          });
          
          // Ouvrir le nouveau popup
          popup.addTo(map.current!);
          popup.setLngLat([listing.lng, listing.lat]);
          
          // Animation du marqueur
          markerElement.style.transform = 'scale(1.2)';
          setTimeout(() => {
            markerElement.style.transform = 'scale(1.1)';
          }, 150);
        });

        // Fermer le popup quand on clique sur la carte
        map.current?.on('click', () => {
          popup.remove();
          markerElement.style.transform = 'scale(1)';
        });
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, listings]);

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