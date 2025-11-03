import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox-styles.css';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useCountry } from '@/contexts/CountryContext';
import { useNavigate } from 'react-router-dom';
import MapToolbar, { MapTool, MapDisplayMode } from './MapToolbar';
import MapSelectionOverlay from './MapSelectionOverlay';
import MapListingsList from './MapListingsList';

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
  const navigate = useNavigate();
  
  // États pour les outils de sélection
  const [activeTool, setActiveTool] = useState<MapTool>('none');
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>('markers');
  const [selectedListings, setSelectedListings] = useState<any[]>([]);
  const [selectionShape, setSelectionShape] = useState<any>(null);
  
  // États pour l'affichage de la liste des listings
  const [showListingCard, setShowListingCard] = useState(false);
  const [nearbyListings, setNearbyListings] = useState<Listing[]>([]);
  const [currentListingIndex, setCurrentListingIndex] = useState(0);

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
    let isMounted = true;
    
    const getMapboxToken = async () => {
      try {
        console.log('🗺️ [MAPBOX] Début de la récupération du token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        console.log('🗺️ [MAPBOX] Réponse reçue:', { hasData: !!data, hasError: !!error, data });
        
        if (!isMounted) {
          console.log('⚠️ [MAPBOX] Composant démonté, abandon');
          return;
        }
        
        if (error) {
          console.error('❌ [MAPBOX] Erreur:', error);
          setError('Erreur de chargement du token');
          setLoading(false);
          return;
        }
        
        if (data?.token) {
          console.log('✅ [MAPBOX] Token OK, longueur:', data.token.length);
          setMapboxToken(data.token);
          setLoading(false);
        } else {
          console.error('❌ [MAPBOX] Pas de token dans la réponse');
          setError('Token Mapbox introuvable');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ [MAPBOX] Exception:', err);
        if (isMounted) {
          setError('Erreur de chargement');
          setLoading(false);
        }
      }
    };

    getMapboxToken();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) {
      console.log('⏸️ [MAPBOX] En attente:', { 
        hasContainer: !!mapContainer.current, 
        hasToken: !!mapboxToken
      });
      return;
    }

    console.log('🗺️ [MAPBOX] Démarrage initialisation carte...');
    console.log('📊 [MAPBOX] Listings à afficher:', listings.length);

    // Initialiser la carte
    mapboxgl.accessToken = mapboxToken;
    
    // Déterminer le style Mapbox selon la prop avec un style moderne
    const getMapboxStyle = (style: string) => {
      switch (style) {
        case 'satellite':
          return 'mapbox://styles/mapbox/satellite-streets-v12';
        case 'outdoors':
          return 'mapbox://styles/mapbox/outdoors-v12';
        case 'streets':
        default:
          return 'mapbox://styles/mapbox/light-v11'; // Style moderne et épuré
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

    // Centrer sur les listings quand la carte est chargée
    map.current.on('load', () => {
      console.log('✅ [MAPBOX] Carte chargée avec succès!');
      
      // Calculer les bounds des listings pour un zoom adapté
      if (listings.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        listings.forEach(listing => {
          if (listing.lng && listing.lat) {
            bounds.extend([listing.lng, listing.lat]);
          }
        });
        
        // Centrer la carte sur les listings avec un padding confortable
        if (!bounds.isEmpty()) {
          map.current?.fitBounds(bounds, { 
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            maxZoom: 15, // Éviter un zoom trop proche
            duration: 1000
          });
        }
      } else {
        // Si aucun listing, afficher l'Afrique par défaut
        const africaBounds: [number, number, number, number] = [-20, -35, 52, 37];
        map.current?.fitBounds(africaBounds, { padding: 50 });
      }

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

      // Fonction pour trouver les listings à proximité
      const findNearbyListings = (centerListing: Listing, allListings: Array<Listing & { adjustedLat: number; adjustedLng: number }>, radiusKm: number = 5) => {
        const R = 6371; // Rayon de la Terre en km
        
        return allListings
          .filter(l => l.id !== centerListing.id)
          .map(l => {
            const dLat = (l.lat - centerListing.lat) * Math.PI / 180;
            const dLng = (l.lng - centerListing.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(centerListing.lat * Math.PI / 180) * Math.cos(l.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            return { listing: l, distance };
          })
          .filter(item => item.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 30)
          .map(item => item.listing);
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
            padding: 8px 14px;
            border-radius: 24px;
            font-size: 12px;
            font-weight: 900;
            box-shadow: 0 6px 20px ${priceColor.shadow}, 0 0 0 2px white, 0 0 0 4px ${priceColor.border};
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: scale(1);
            min-width: 40px;
            text-align: center;
            position: relative;
            z-index: 1;
            letter-spacing: 0.5px;
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
          ">
            💰 ${formatMapPrice(listing.price, (listing as any).currency_code, formatPrice)}
          </div>
        `;
        
        // Effet hover sur le marqueur avec animation fluide et moderne
        markerElement.addEventListener('mouseenter', () => {
          const div = markerElement.querySelector('div') as HTMLElement;
          if (div) {
            div.style.transform = 'scale(1.15) translateY(-4px)';
            div.style.boxShadow = `0 10px 30px ${priceColor.shadow}, 0 0 0 3px white, 0 0 0 5px ${priceColor.border}`;
            div.style.zIndex = '1000';
          }
        });
        
        markerElement.addEventListener('mouseleave', () => {
          const div = markerElement.querySelector('div') as HTMLElement;
          if (div) {
            div.style.transform = 'scale(1)';
            div.style.boxShadow = `0 6px 20px ${priceColor.shadow}, 0 0 0 2px white, 0 0 0 4px ${priceColor.border}`;
            div.style.zIndex = '1';
          }
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

        // Attacher le clic au marqueur pour afficher la carte de listing
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Réinitialiser tous les marqueurs
          document.querySelectorAll('.mapbox-price-marker').forEach(marker => {
            const htmlMarker = marker as HTMLElement;
            htmlMarker.style.transform = 'scale(1)';
            htmlMarker.style.opacity = '0.7';
          });
          
          // Mettre en évidence le marqueur cliqué
          markerElement.style.transform = 'scale(1.15)';
          markerElement.style.opacity = '1';
          
          // Trouver les listings à proximité
          const nearby = findNearbyListings(listing, dispersedListings, 5);
          const allNearbyListings = [listing, ...nearby];
          
          setNearbyListings(allNearbyListings);
          setCurrentListingIndex(0);
          setShowListingCard(true);
        });

        // Effet de survol
        markerElement.addEventListener('mouseenter', () => {
          if (!showListingCard) {
            markerElement.style.transform = 'scale(1.1)';
          }
        });
        
        markerElement.addEventListener('mouseleave', () => {
          if (!showListingCard) {
            markerElement.style.transform = 'scale(1)';
          }
        });
      });

      // Initialiser l'opacité des marqueurs
      document.querySelectorAll('.mapbox-price-marker').forEach(marker => {
        (marker as HTMLElement).style.opacity = '0.85';
      });

      // Un seul écouteur pour fermer la carte de listing quand on clique sur la carte
      map.current?.on('click', (e) => {
        setShowListingCard(false);
        // Réinitialiser tous les marqueurs
        document.querySelectorAll('.mapbox-price-marker').forEach(marker => {
          const htmlMarker = marker as HTMLElement;
          htmlMarker.style.transform = 'scale(1)';
          htmlMarker.style.opacity = '0.85';
        });
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

  // Gérer le changement d'outil
  const handleToolChange = (tool: MapTool) => {
    console.log('[MAP] Outil change:', tool);
    setActiveTool(tool);
    
    if (tool === 'none') {
      // Effacer le shape de sélection s'il existe
      if (selectionShape) {
        selectionShape.remove();
        setSelectionShape(null);
      }
    } else if (map.current) {
      // Changer le curseur
      map.current.getCanvas().style.cursor = 'crosshair';
      
      // Ajouter les événements de dessin
      if (tool === 'circle') {
        setupCircleTool();
      } else if (tool === 'polygon') {
        setupPolygonTool();
      }
    }
  };

  // Configurer l'outil de sélection circulaire
  const setupCircleTool = () => {
    if (!map.current) return;
    
    let center: [number, number] | null = null;
    let circle: mapboxgl.Marker | null = null;

    const onMouseDown = (e: mapboxgl.MapMouseEvent) => {
      center = [e.lngLat.lng, e.lngLat.lat];
    };

    const onMouseUp = (e: mapboxgl.MapMouseEvent) => {
      if (!center || !map.current) return;
      
      const end: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const radius = calculateDistance(center, end);
      
      // Sélectionner les listings dans le cercle
      const selected = listings.filter(listing => {
        const distance = calculateDistance(center!, [listing.lng, listing.lat]);
        return distance <= radius;
      });
      
      setSelectedListings(selected);
      console.log(`[MAP] ${selected.length} proprietes selectionnees`);
      
      // Réinitialiser le curseur et l'outil
      map.current.getCanvas().style.cursor = '';
      setActiveTool('none');
      
      // Nettoyer les événements
      map.current.off('mousedown', onMouseDown);
      map.current.off('mouseup', onMouseUp);
    };

    map.current.on('mousedown', onMouseDown);
    map.current.on('mouseup', onMouseUp);
  };

  // Configurer l'outil de sélection polygonale
  const setupPolygonTool = () => {
    if (!map.current) return;
    
    const points: [number, number][] = [];
    let tempMarkers: mapboxgl.Marker[] = [];

    const onMapClick = (e: mapboxgl.MapMouseEvent) => {
      const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      points.push(point);
      
      // Ajouter un marqueur temporaire
      const marker = new mapboxgl.Marker({ color: '#3b82f6', scale: 0.5 })
        .setLngLat(point)
        .addTo(map.current!);
      tempMarkers.push(marker);
      
      console.log(`[MAP] Point ${points.length} ajoute`);
    };

    const onKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && points.length >= 3) {
        // Finaliser la sélection
        const selected = listings.filter(listing => {
          return isPointInPolygon([listing.lng, listing.lat], points);
        });
        
        setSelectedListings(selected);
        console.log(`[MAP] ${selected.length} proprietes selectionnees dans le polygone`);
        
        // Nettoyer
        tempMarkers.forEach(m => m.remove());
        tempMarkers = [];
        map.current!.getCanvas().style.cursor = '';
        setActiveTool('none');
        map.current!.off('click', onMapClick);
        document.removeEventListener('keypress', onKeyPress);
      } else if (e.key === 'Escape') {
        // Annuler
        tempMarkers.forEach(m => m.remove());
        tempMarkers = [];
        points.length = 0;
        map.current!.getCanvas().style.cursor = '';
        setActiveTool('none');
        map.current!.off('click', onMapClick);
        document.removeEventListener('keypress', onKeyPress);
      }
    };

    map.current.on('click', onMapClick);
    document.addEventListener('keypress', onKeyPress);
    
    console.log('[MAP] Mode polygone active - Cliquez pour ajouter des points, Entree pour terminer, Echap pour annuler');
  };

  // Calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2[1] - point1[1]) * Math.PI / 180;
    const dLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Vérifier si un point est dans un polygone (ray-casting algorithm)
  const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      const intersect = ((yi > point[1]) !== (yj > point[1]))
        && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Gérer le changement de mode d'affichage
  const handleDisplayModeChange = (mode: MapDisplayMode) => {
    console.log('[MAP] Mode d\'affichage:', mode);
    setDisplayMode(mode);
    
    if (mode === 'heatmap' && map.current) {
      // Activer le mode heatmap
      addHeatmapLayer();
    } else if (map.current) {
      // Retirer le heatmap si présent
      if (map.current.getLayer('listings-heatmap')) {
        map.current.removeLayer('listings-heatmap');
      }
      if (map.current.getSource('listings-heat')) {
        map.current.removeSource('listings-heat');
      }
    }
  };

  // Ajouter une couche heatmap
  const addHeatmapLayer = () => {
    if (!map.current) return;
    
    // Retirer les couches existantes si présentes
    if (map.current.getLayer('listings-heatmap')) {
      map.current.removeLayer('listings-heatmap');
    }
    if (map.current.getSource('listings-heat')) {
      map.current.removeSource('listings-heat');
    }
    
    // Préparer les données pour le heatmap
    const heatmapData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: listings.map(listing => ({
        type: 'Feature',
        properties: {
          price: listing.price
        },
        geometry: {
          type: 'Point',
          coordinates: [listing.lng, listing.lat]
        }
      }))
    };
    
    map.current.addSource('listings-heat', {
      type: 'geojson',
      data: heatmapData
    });
    
    map.current.addLayer({
      id: 'listings-heatmap',
      type: 'heatmap',
      source: 'listings-heat',
      paint: {
        // Augmenter l'intensité selon le prix
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'price'],
          0, 0,
          1000000, 1
        ],
        // Augmenter l'intensité avec le zoom
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        // Couleur du heatmap
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        // Ajuster le rayon selon le zoom
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          9, 20
        ],
        // Transition d'opacité selon le zoom
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          9, 0.7
        ]
      }
    });
    
    console.log('[MAP] Couche heatmap ajoutee');
  };

  // Effacer la sélection
  const handleClearSelection = () => {
    setSelectedListings([]);
    if (selectionShape) {
      selectionShape.remove();
      setSelectionShape(null);
    }
  };

  // Voir un listing
  const handleViewListing = (id: string) => {
    navigate(`/listing/${id}`);
  };

  const handleListingIndexChange = (newIndex: number) => {
    setCurrentListingIndex(newIndex);
    
    // Centrer la carte sur le nouveau listing (légèrement)
    const listing = nearbyListings[newIndex];
    if (listing && map.current) {
      map.current.easeTo({
        center: [listing.lng, listing.lat],
        duration: 500
      });
    }
  };

  const handleCloseListingCard = () => {
    setShowListingCard(false);
    // Réinitialiser tous les marqueurs
    document.querySelectorAll('.mapbox-price-marker').forEach(marker => {
      const htmlMarker = marker as HTMLElement;
      htmlMarker.style.transform = 'scale(1)';
      htmlMarker.style.opacity = '0.85';
    });
  };

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
      
      {/* Barre d'outils */}
      <MapToolbar
        activeTool={activeTool}
        displayMode={displayMode}
        onToolChange={handleToolChange}
        onDisplayModeChange={handleDisplayModeChange}
        onClearSelection={handleClearSelection}
        selectedCount={selectedListings.length}
      />
      
      {/* Overlay de sélection */}
      <MapSelectionOverlay
        selectedListings={selectedListings}
        onClose={handleClearSelection}
        onViewListing={handleViewListing}
      />
      
      {/* Instructions pour les outils */}
      {activeTool === 'circle' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-lg shadow-elevation-3 animate-fade-in">
          <p className="text-sm font-medium">Cliquez et glissez pour dessiner un cercle</p>
        </div>
      )}
      
      {activeTool === 'polygon' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-lg shadow-elevation-3 animate-fade-in">
          <p className="text-sm font-medium">
            Cliquez pour ajouter des points • <span className="px-2 py-1 bg-background/50 rounded font-mono text-xs">Entrée</span> pour terminer • <span className="px-2 py-1 bg-background/50 rounded font-mono text-xs">Échap</span> pour annuler
          </p>
        </div>
      )}
      
      {/* Carte de listing flottante */}
      {showListingCard && nearbyListings.length > 0 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] pointer-events-auto">
          <MapListingsList
            listings={nearbyListings}
            currentIndex={currentListingIndex}
            onIndexChange={handleListingIndexChange}
            onViewDetails={handleViewListing}
            onClose={handleCloseListingCard}
          />
        </div>
      )}
    </div>
  );
};

export default MapboxMap;