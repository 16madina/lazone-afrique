import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
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
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    // Ajouter les contrôles de navigation avec position ajustée
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
    });
    map.current.addControl(nav, 'top-right');

    // Centrer sur l'Afrique quand la carte est chargée
    map.current.on('load', () => {
      // Bounds approximatifs de l'Afrique
      const africaBounds: [number, number, number, number] = [-20, -35, 52, 37];
      map.current?.fitBounds(africaBounds, { padding: 50 });

      // Configurer la langue française pour tous les layers de texte
      const style = map.current?.getStyle();
      if (style && style.layers) {
        style.layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
            // Changer la langue des labels vers le français
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

      // Fonction pour disperser les marqueurs qui sont trop proches
      const disperseMarkers = (listings: Listing[]) => {
        const processedListings: (Listing & { adjustedLat: number; adjustedLng: number })[] = [];
        const threshold = 0.005; // Distance minimale entre les marqueurs (réduite pour plus de précision)
        
        listings.forEach(listing => {
          if (!listing.lat || !listing.lng) return;
          
          let adjustedLat = listing.lat;
          let adjustedLng = listing.lng;
          let attempts = 0;
          const maxAttempts = 20;
          
          // Continue à ajuster la position jusqu'à ce qu'elle soit suffisamment éloignée
          while (attempts < maxAttempts) {
            const tooClose = processedListings.some(processed => {
              const distance = Math.sqrt(
                Math.pow(processed.adjustedLat - adjustedLat, 2) + 
                Math.pow(processed.adjustedLng - adjustedLng, 2)
              );
              return distance < threshold;
            });
            
            if (!tooClose) break;
            
            // Calculer un offset circulaire pour une meilleure répartition
            const angle = (attempts * 60) % 360; // Rotation de 60° à chaque tentative
            const offsetDistance = threshold * (1.5 + attempts * 0.3); // Distance croissante
            const angleRad = (angle * Math.PI) / 180;
            
            adjustedLat = listing.lat + Math.sin(angleRad) * offsetDistance;
            adjustedLng = listing.lng + Math.cos(angleRad) * offsetDistance;
            
            attempts++;
          }
          
          processedListings.push({
            ...listing,
            adjustedLat,
            adjustedLng
          });
        });
        
        return processedListings;
      };

      // Disperser les marqueurs avant de les ajouter à la carte
      const dispersedListings = disperseMarkers(listings);

      // Ajouter les marqueurs pour chaque listing dispersé
      dispersedListings.forEach(listing => {
        // Déterminer la couleur selon le prix
        const getPriceColor = (price: number) => {
          if (price >= 1000000) return { bg: '#1e40af', shadow: 'rgba(30, 64, 175, 0.4)' }; // Bleu foncé pour les prix élevés
          if (price >= 500000) return { bg: '#7c3aed', shadow: 'rgba(124, 58, 237, 0.4)' }; // Violet pour les prix moyens-élevés
          if (price >= 200000) return { bg: '#0891b2', shadow: 'rgba(8, 145, 178, 0.4)' }; // Bleu cyan pour les prix moyens
          return { bg: '#e11d48', shadow: 'rgba(225, 29, 72, 0.4)' }; // Rose pour les prix plus bas
        };

        const priceColor = getPriceColor(listing.price);
        
        const markerElement = document.createElement('div');
        markerElement.className = 'mapbox-price-marker';
        markerElement.innerHTML = `
          <div style="
            background: ${priceColor.bg};
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            box-shadow: 0 2px 8px ${priceColor.shadow};
            white-space: nowrap;
            cursor: pointer;
            border: 1.5px solid white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(1);
            min-width: 24px;
            text-align: center;
            position: relative;
            z-index: 1;
          ">
            ${formatMapPrice(listing.price, (listing as any).currency_code, formatPrice)}
          </div>
        `;
        
        // Effet hover sur le marqueur
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.2)';
          markerElement.style.boxShadow = `0 4px 16px ${priceColor.shadow}`;
          markerElement.style.zIndex = '1000';
        });
        
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.boxShadow = `0 2px 8px ${priceColor.shadow}`;
          markerElement.style.zIndex = '1';
        });

        // Créer le marqueur avec les coordonnées ajustées
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([listing.adjustedLng, listing.adjustedLat])
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
            <div style="padding: 0; max-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="position: relative;">
                <img 
                  src="${getListingImage(listing)}" 
                  alt="${listing.title}"
                  style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px 6px 0 0;"
                />
                <button 
                  id="favorite-btn-${listing.id}"
                  style="
                    position: absolute; 
                    top: 6px; 
                    right: 6px; 
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                  "
                  onclick="window.toggleMapFavorite('${listing.id}')"
                >
                  🤍
                </button>
              </div>
              
              <div style="padding: 10px;">
                <div style="
                  color: #0E7490; 
                  font-size: 15px; 
                  font-weight: 700; 
                  margin-bottom: 4px;
                ">
                   ${formatPrice(listing.price, (listing as any).currency_code)}
                </div>
                
                <div style="
                  font-weight: 500; 
                  font-size: 12px; 
                  margin-bottom: 6px; 
                  line-height: 1.2;
                  color: #374151;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">
                  ${listing.title}
                </div>
                 
                 <div style="
                   font-size: 11px;
                   color: #6b7280;
                   margin-bottom: 8px;
                 ">
                   📍 ${listing.city}
                 </div>
                
                <button 
                  onclick="window.location.href='/listing/${listing.id}'"
                  style="
                    background: linear-gradient(135deg, #0E7490, #0891b2);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 5px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                  "
                >
                  Voir détails
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
          popup.setLngLat([listing.adjustedLng, listing.adjustedLat]);
          
          // Update favorite button state after popup is added
          setTimeout(() => {
            const btn = document.getElementById(`favorite-btn-${listing.id}`);
            if (btn) {
              btn.innerHTML = isFavorite(listing.id) ? '❤️' : '🤍';
            }
          }, 100);
          
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