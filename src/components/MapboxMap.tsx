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
    });

    // Ajouter les contrôles de navigation avec position ajustée
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
    });
    map.current.addControl(nav, 'top-right');

    // Centrer sur le pays de l'utilisateur quand la carte est chargée
    map.current.on('load', () => {
      // Centrer automatiquement sur le pays de l'utilisateur
      const { lat, lng, zoom } = selectedCountry.coordinates;
      map.current?.flyTo({
        center: [lng, lat],
        zoom: zoom,
        duration: 1500
      });

      // Préparer les données GeoJSON pour le clustering
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: listings
          .filter(listing => listing.lat && listing.lng)
          .map(listing => ({
            type: 'Feature' as const,
            properties: {
              id: listing.id,
              title: listing.title,
              price: listing.price,
              city: listing.city,
              country_code: listing.country_code,
              transaction_type: listing.transaction_type,
              image: listing.image,
              photos: listing.photos,
              status: listing.status,
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [listing.lng, listing.lat] as [number, number]
            }
          }))
      };

      // Ajouter la source de données avec clustering
      map.current?.addSource('listings', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14, // Niveau de zoom max pour les clusters
        clusterRadius: 50 // Radius pour grouper les points
      });

      // Layer pour les clusters (groupes de marqueurs)
      map.current?.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#0E7490', // Couleur pour 1-9 points
            10,
            '#0891b2', // Couleur pour 10-29 points
            30,
            '#06b6d4'  // Couleur pour 30+ points
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15, // Taille pour 1-9 points
            10,
            20, // Taille pour 10-29 points
            30,
            25  // Taille pour 30+ points
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Layer pour les nombres dans les clusters
      map.current?.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Layer pour les marqueurs individuels (non-clustered)
      map.current?.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0E7490',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Layer pour les prix sur les marqueurs individuels
      map.current?.addLayer({
        id: 'unclustered-price',
        type: 'symbol',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': [
            'case',
            ['>=', ['get', 'price'], 1000000],
            ['concat', ['to-string', ['round', ['/', ['get', 'price'], 1000000]]], 'M'],
            ['>=', ['get', 'price'], 1000],
            ['concat', ['to-string', ['round', ['/', ['get', 'price'], 1000]]], 'k'],
            ['to-string', ['get', 'price']]
          ],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 9
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(14, 116, 144, 0.8)',
          'text-halo-width': 2
        }
      });

      // Fonction pour obtenir l'image de listing
      const getListingImage = (listing: any) => {
        console.log('🖼️ Récupération image pour:', listing.title);
        console.log('📸 Photos type:', typeof listing.photos, 'Photos:', listing.photos);
        console.log('🎨 Image disponible:', listing.image);
        
        // Vérifier d'abord les photos uploadées (gérer le cas où c'est une string JSON)
        let photos = listing.photos;
        if (typeof photos === 'string') {
          try {
            photos = JSON.parse(photos);
          } catch (e) {
            console.log('❌ Erreur parsing photos JSON:', e);
            photos = null;
          }
        }
        
        if (photos && Array.isArray(photos) && photos.length > 0) {
          console.log('✅ Utilisation de la première photo uploadée:', photos[0]);
          return photos[0];
        }
        
        // Vérifier l'image mais ignorer les placeholders
        if (listing.image && listing.image !== '/placeholder.svg' && !listing.image.includes('placeholder')) {
          console.log('✅ Utilisation de l\'image principale:', listing.image);
          return listing.image;
        }
        
        // Image par défaut plus fiable basée sur le type de transaction
        let defaultImage;
        if (listing.transaction_type === 'rent') {
          defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=280&h=160&fit=crop&auto=format&q=80';
        } else if (listing.transaction_type === 'commercial') {
          defaultImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=280&h=160&fit=crop&auto=format&q=80';
        } else {
          defaultImage = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=280&h=160&fit=crop&auto=format&q=80';
        }
        
        console.log('⚠️ Utilisation de l\'image par défaut:', defaultImage);
        return defaultImage;
      };

      // Événement de clic sur les clusters
      map.current?.on('click', 'clusters', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features?.[0]?.properties?.cluster_id;
        
        if (clusterId !== undefined) {
          (map.current?.getSource('listings') as mapboxgl.GeoJSONSource)
            ?.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              
              map.current?.easeTo({
                center: (features?.[0]?.geometry as any)?.coordinates,
                zoom: zoom
              });
            });
        }
      });

      // Événement de clic sur les marqueurs individuels
      map.current?.on('click', 'unclustered-point', (e) => {
        const coordinates = (e.features?.[0]?.geometry as any)?.coordinates?.slice();
        const properties = e.features?.[0]?.properties;
        
        if (!coordinates || !properties) return;

        // S'assurer que les coordonnées ne sont pas modifiées par des panoramiques
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup'
        })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 0; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="position: relative;">
              <img 
                src="${getListingImage(properties)}" 
                alt="${properties.title}"
                style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px 8px 0 0;"
              />
              <div style="
                position: absolute; 
                top: 8px; 
                right: 8px; 
                background: ${properties.transaction_type === 'rent' ? '#0E7490' : '#E11D48'}; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 11px; 
                font-weight: 600;
              ">
                ${properties.transaction_type === 'rent' ? 'Location' : 'Vente'}
              </div>
              <button 
                id="favorite-btn-${properties.id}"
                style="
                  position: absolute; 
                  top: 8px; 
                  left: 8px; 
                  background: rgba(255, 255, 255, 0.9);
                  border: none;
                  border-radius: 50%;
                  width: 36px;
                  height: 36px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  font-size: 16px;
                  transition: all 0.3s ease;
                  backdrop-filter: blur(10px);
                "
                onclick="window.toggleMapFavorite('${properties.id}')"
                onmouseover="this.style.background='rgba(255, 255, 255, 1)'; this.style.transform='scale(1.1)'"
                onmouseout="this.style.background='rgba(255, 255, 255, 0.9)'; this.style.transform='scale(1)'"
              >
                🤍
              </button>
            </div>
            
            <div style="padding: 16px;">
              <div style="
                font-weight: 600; 
                font-size: 16px; 
                margin-bottom: 8px; 
                line-height: 1.3;
                color: #1f2937;
              ">
                ${properties.title}
              </div>
              
              <div style="
                color: #0E7490; 
                font-size: 18px; 
                font-weight: 700; 
                margin-bottom: 12px;
              ">
                ${formatPrice(properties.price)} FCFA
              </div>
              
              <div style="
                display: flex; 
                align-items: center; 
                gap: 8px; 
                margin-bottom: 12px;
                font-size: 12px;
                color: #6b7280;
              ">
                <span>📍 ${properties.city}</span>
                <span>•</span>
                <span style="
                  background: ${properties.transaction_type === 'rent' ? '#0E7490' : '#E11D48'}; 
                  color: white; 
                  padding: 2px 6px; 
                  border-radius: 8px; 
                  font-weight: 600;
                ">
                  ${properties.transaction_type === 'rent' ? 'Location' : 'Vente'}
                </span>
              </div>
             
              <button 
                onclick="window.location.href='/listing/${properties.id}'"
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
        `)
        .addTo(map.current!);

        // Update favorite button state after popup is added
        setTimeout(() => {
          const btn = document.getElementById(`favorite-btn-${properties.id}`);
          if (btn) {
            btn.innerHTML = isFavorite(properties.id) ? '❤️' : '🤍';
          }
        }, 100);
      });

      // Curseur pointer sur les éléments cliquables
      map.current?.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current?.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
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