import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home } from 'lucide-react';

interface MapListing {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  city: string;
  property_type: string | null;
  transaction_type: string | null;
  image: string | null;
  photos: string[] | null;
  price_currency: string;
}

interface UserListingsMapProps {
  userId: string;
  currentListingId?: string;
}

const UserListingsMap: React.FC<UserListingsMapProps> = ({ userId, currentListingId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [listings, setListings] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);
  const navigate = useNavigate();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        
        if (data?.token) {
          mapboxgl.accessToken = data.token;
          fetchUserListings();
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setLoading(false);
      }
    };

    fetchToken();
  }, [userId]);

  // Fetch user listings
  const fetchUserListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, lat, lng, city, property_type, transaction_type, image, photos, price_currency')
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;
      
      setListings(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxgl.accessToken || listings.length === 0) return;

    // Create map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [listings[0].lng, listings[0].lat],
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add listings as GeoJSON source
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: listings.map((listing) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [listing.lng, listing.lat],
          },
          properties: {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            city: listing.city,
            property_type: listing.property_type,
            transaction_type: listing.transaction_type,
            image: listing.image || (listing.photos && listing.photos[0]) || null,
            price_currency: listing.price_currency,
            isCurrent: listing.id === currentListingId,
          },
        })),
      };

      map.current.addSource('listings', {
        type: 'geojson',
        data: geojson,
      });

      // Add current listing layer (larger, different color)
      map.current.addLayer({
        id: 'current-listing',
        type: 'circle',
        source: 'listings',
        filter: ['==', ['get', 'isCurrent'], true],
        paint: {
          'circle-radius': 12,
          'circle-color': '#10b981',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Add other listings layer
      map.current.addLayer({
        id: 'other-listings',
        type: 'circle',
        source: 'listings',
        filter: ['!=', ['get', 'isCurrent'], true],
        paint: {
          'circle-radius': 10,
          'circle-color': '#3b82f6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Add price labels
      map.current.addLayer({
        id: 'listing-labels',
        type: 'symbol',
        source: 'listings',
        layout: {
          'text-field': ['concat', ['get', 'price'], ' FCFA'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1f2937',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      });

      // Click handler
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['current-listing', 'other-listings'],
        });

        if (features && features.length > 0) {
          const feature = features[0];
          const props = feature.properties;
          
          const clickedListing: MapListing = {
            id: props.id,
            title: props.title,
            price: props.price,
            lat: 0,
            lng: 0,
            city: props.city,
            property_type: props.property_type,
            transaction_type: props.transaction_type,
            image: props.image,
            photos: null,
            price_currency: props.price_currency,
          };

          setSelectedListing(clickedListing);
        }
      };

      map.current.on('click', 'current-listing', handleClick);
      map.current.on('click', 'other-listings', handleClick);

      // Cursor pointer on hover
      map.current.on('mouseenter', 'current-listing', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseenter', 'other-listings', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'current-listing', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseleave', 'other-listings', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Fit bounds to show all listings
      if (listings.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        listings.forEach((listing) => {
          bounds.extend([listing.lng, listing.lat]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [listings, currentListingId]);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  const otherListings = listings.filter(l => l.id !== currentListingId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Autres annonces de ce vendeur</h3>
          <p className="text-sm text-muted-foreground">
            {otherListings.length} {otherListings.length > 1 ? 'annonces disponibles' : 'annonce disponible'}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border bg-muted/10">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Selected listing card */}
        {selectedListing && (
          <Card className="absolute bottom-4 left-4 right-4 p-4 shadow-lg">
            <div className="flex gap-4">
              {selectedListing.image && (
                <img 
                  src={selectedListing.image} 
                  alt={selectedListing.title}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{selectedListing.title}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedListing.city}
                </p>
                <p className="font-bold text-primary mt-1">
                  {new Intl.NumberFormat('fr-FR').format(selectedListing.price)} FCFA
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate(`/listing/${selectedListing.id}`)}
              >
                Voir
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherListings.map((listing) => (
          <Card 
            key={listing.id} 
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/listing/${listing.id}`)}
          >
            <div className="flex gap-3">
              {(listing.image || (listing.photos && listing.photos[0])) && (
                <img 
                  src={listing.image || listing.photos![0]} 
                  alt={listing.title}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold line-clamp-1">{listing.title}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {listing.city}
                </p>
                {listing.property_type && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    {listing.property_type === 'apartment' ? 'Appartement' :
                     listing.property_type === 'house' ? 'Maison' :
                     listing.property_type === 'villa' ? 'Villa' :
                     listing.property_type === 'land' ? 'Terrain' : listing.property_type}
                  </p>
                )}
                <p className="font-bold text-primary mt-2">
                  {new Intl.NumberFormat('fr-FR').format(listing.price)} FCFA
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserListingsMap;
