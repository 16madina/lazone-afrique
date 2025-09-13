import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './price-pin.css';

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

function africaBounds() {
  // approx: lat [-35, 37], lng [-20, 52]
  return L.latLngBounds(L.latLng(-35, -20), L.latLng(37, 52));
}

function formatPrice(p?: number | null) {
  if (p == null) return '';
  // Raccourci lisible (k, M) – adapte si tu veux afficher « FCFA »
  if (p >= 1_000_000) return (p/1_000_000).toFixed(1).replace('.0','') + 'M';
  if (p >= 1_000) return Math.round(p/1_000) + 'k';
  return String(p);
}

function makePriceIcon(price?: number | null) {
  const html = `<div class="price-pin"> ${formatPrice(price)} <span class="unit">FCFA</span></div>`;
  return new DivIcon({
    html,
    className: 'price-pin-wrapper', // évite le style par défaut leaflet
    iconAnchor: [28, 28], // pointe du badge
  });
}

function FitAfricaOnLoad() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(africaBounds(), { padding: [20, 20] });
  }, [map]);
  return null;
}

export function MapAfrica({ listings }: { listings: Listing[] }) {
  const navigate = useNavigate();
  const markers = useMemo(
    () => listings.filter(l => l.lat && l.lng),
    [listings]
  );

  return (
    <div className="h-[70vh] w-full rounded-lg overflow-hidden border">
      <MapContainer style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitAfricaOnLoad />

        {markers.map(l => (
          <Marker
            key={l.id}
            position={[l.lat as number, l.lng as number]}
            icon={makePriceIcon(l.price)}
          >
            <Popup>
              <div className="flex gap-3 items-start max-w-[260px]">
                <img
                  src={l.image || 'https://via.placeholder.com/80x60?text=No+Image'}
                  alt={l.title}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
                <div className="space-y-1">
                  <div className="font-semibold text-sm line-clamp-2">{l.title}</div>
                  <div className="text-xs opacity-70">{formatPrice(l.price)} FCFA</div>
                  <button
                    onClick={() => navigate(`/listing/${l.id}`)}
                    className="inline-block mt-1 text-xs px-2 py-1 rounded bg-teal-700 text-white hover:bg-teal-800 transition-colors"
                  >
                    Voir l'annonce
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}