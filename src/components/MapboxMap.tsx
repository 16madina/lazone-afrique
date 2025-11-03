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
  mapStyle?: string;
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

const MapboxMap: React.FC<MapboxMapProps> = ({ listings, selectedCityCoords, mapStyle = 'streets' }) => {
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
        console.log('🗺️ Récupération du token Mapbox...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('❌ Erreur lors de la récupération du token:', error);
          throw error;
        }
        
        if (data?.token) {
          console.log('✅ Token Mapbox récupéré avec succès');
          setMapboxToken(data.token);
        } else {
          throw new Error('Token Mapbox non trouvé');
        }
      } catch (err) {
        console.error('❌ Erreur lors de la récupération du token Mapbox:', err);
        setError('Impossible de charger la carte');
      } finally {
        setLoading(false);
      }
    };

    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.log('⏸️ Attente du conteneur ou du token...', { 
        hasContainer: !!mapContainer.current, 
        hasToken: !!mapboxToken 
      });
      return;
    }

    console.log('🗺️ Initialisation de la carte Mapbox...');
    console.log('📊 Nombre de listings à afficher:', listings.length);

    // Initialiser la carte
    mapboxgl.accessToken = mapboxToken;
    
    // Déterminer le style Mapbox selon la prop
    const getMapboxStyle = (style: string) => {
      switch (style) {
        case 'satellite':
          return 'mapbox://styles/mapbox/satellite-streets-v12';
        case 'outdoors':
          return 'mapbox://styles/mapbox/outdoors-v12';
        case 'streets':
        default:
          return 'mapbox://styles/mapbox/streets-v12';
      }
    };
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapboxStyle(mapStyle),
      center: [15, 0], // Centre de l'Afrique
      zoom: 3,
      pitch: 30,
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
        // Déterminer la couleur selon le prix avec des couleurs vibrantes
        const getPriceColor = (price: number) => {
          if (price >= 1000000) return { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.6)', border: '#667eea' }; // Gradient violet pour les prix élevés
          if (price >= 500000) return { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shadow: 'rgba(245, 87, 108, 0.6)', border: '#f5576c' }; // Gradient rose pour les prix moyens-élevés
          if (price >= 200000) return { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', shadow: 'rgba(0, 242, 254, 0.6)', border: '#00f2fe' }; // Gradient bleu cyan pour les prix moyens
          return { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', shadow: 'rgba(67, 233, 123, 0.6)', border: '#43e97b' }; // Gradient vert pour les prix plus bas
        };

        const priceColor = getPriceColor(listing.price);
        
        const markerElement = document.createElement('div');
        markerElement.className = 'mapbox-price-marker';
        markerElement.innerHTML = `
          <div style="
            background: ${priceColor.bg};
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 4px 15px ${priceColor.shadow}, 0 0 0 3px rgba(255,255,255,0.8);
            white-space: nowrap;
            cursor: pointer;
            border: 2px solid ${priceColor.border};
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform: scale(1);
            min-width: 32px;
            text-align: center;
            position: relative;
            z-index: 1;
            letter-spacing: 0.3px;
            backdrop-filter: blur(10px);
          ">
            ${formatMapPrice(listing.price, (listing as any).currency_code, formatPrice)}
          </div>
        `;
        
        // Effet hover sur le marqueur avec animation améliorée
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.3) translateY(-5px)';
          markerElement.style.boxShadow = `0 8px 25px ${priceColor.shadow}, 0 0 0 4px rgba(255,255,255,0.9)`;
          markerElement.style.zIndex = '1000';
        });
        
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.boxShadow = `0 4px 15px ${priceColor.shadow}, 0 0 0 3px rgba(255,255,255,0.8)`;
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
            <div style="padding: 0; max-width: 220px; font-family: system-ui, -apple-system, sans-serif; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
              <div style="position: relative; overflow: hidden;">
                <img 
                  src="${getListingImage(listing)}" 
                  alt="${listing.title}"
                  style="width: 100%; height: 120px; object-fit: cover; transition: transform 0.3s ease;"
                  onmouseover="this.style.transform='scale(1.1)'"
                  onmouseout="this.style.transform='scale(1)'"
                />
                <div style="
                  position: absolute; 
                  top: 8px; 
                  right: 8px; 
                  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
                  backdrop-filter: blur(10px);
                  padding: 4px 10px;
                  border-radius: 20px;
                  font-size: 10px;
                  font-weight: 700;
                  color: #0E7490;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                ">
                  ${listing.transaction_type === 'sale' ? '🏷️ Vente' : '🔑 Location'}
                </div>
              </div>
              
              <div style="padding: 12px; background: linear-gradient(to bottom, #ffffff, #f9fafb);">
                <div style="
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  font-size: 16px; 
                  font-weight: 800; 
                  margin-bottom: 6px;
                  letter-spacing: -0.5px;
                ">
                   ${formatPrice(listing.price, (listing as any).currency_code)}
                </div>
                
                <div style="
                  font-weight: 600; 
                  font-size: 13px; 
                  margin-bottom: 8px; 
                  line-height: 1.3;
                  color: #1f2937;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                ">
                  ${listing.title}
                </div>
                 
                 <div style="
                   font-size: 11px;
                   color: #6b7280;
                   margin-bottom: 10px;
                   display: flex;
                   align-items: center;
                   gap: 4px;
                 ">
                   <span style="font-size: 14px;">📍</span>
                   <span style="font-weight: 500;">${listing.city}</span>
                 </div>
                
                <button 
                  onclick="window.location.href='/listing/${listing.id}'"
                  style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    letter-spacing: 0.3px;
                  "
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.3)'"
                >
                  Voir les détails ➜
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
          
          // Réinitialiser tous les marqueurs
          document.querySelectorAll('.mapbox-price-marker').forEach(marker => {
            (marker as HTMLElement).style.transform = 'scale(1)';
          });
          
          // Ouvrir le nouveau popup
          popup.addTo(map.current!);
          popup.setLngLat([listing.adjustedLng, listing.adjustedLat]);
          
          // Animation du marqueur
          markerElement.style.transform = 'scale(1.2)';
          setTimeout(() => {
            markerElement.style.transform = 'scale(1.1)';
          }, 150);
        });

        // Gérer la fermeture du popup
        popup.on('close', () => {
          markerElement.style.transform = 'scale(1)';
        });
      });

      // Un seul écouteur pour fermer les popups quand on clique sur la carte
      map.current?.on('click', (e) => {
        // Vérifier qu'on n'a pas cliqué sur un marqueur
        const target = e.originalEvent.target as HTMLElement;
        if (!target.closest('.mapbox-price-marker')) {
          // Fermer tous les popups
          document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            if (popup.parentNode) {
              popup.parentNode.removeChild(popup);
            }
          });
          
          // Réinitialiser tous les marqueurs
          document.querySelectorAll('.mapbox-price-marker').forEach(marker => {
            (marker as HTMLElement).style.transform = 'scale(1)';
          });
        }
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
      <div className="absolute inset-0 bg-background rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto text-primary mb-4 animate-spin">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Chargement de la carte...</h3>
          <p className="text-muted-foreground">{listings.length} propriétés trouvées</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 bg-background rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto text-destructive mb-4">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Erreur de chargement</h3>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
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